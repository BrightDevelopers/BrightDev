#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const {
  calculateRawPercentageChange,
  formatPercentageChange,
  FIRST_RUN_LABEL,
} = require('./compare-snapshots');

const SNAPSHOTS_DIR = 'metrics/snapshots';
const LIMITED_DATA_THRESHOLD = 2;

function readAllWeeklySnapshots(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('weekly-') && f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function extractYearMonth(dateStr) {
  return dateStr.slice(0, 7);
}

function groupSnapshotsByMonth(snapshots) {
  return snapshots.reduce((acc, snap) => {
    const month = extractYearMonth(snap.date);
    if (!acc[month]) acc[month] = [];
    acc[month].push(snap);
    return acc;
  }, {});
}

function calculateConversionRate(uniqueClones, uniqueVisits) {
  if (uniqueVisits === 0) return 0;
  return Math.round((uniqueClones / uniqueVisits) * 100 * 100) / 100;
}

function aggregateMonthlyTotals(snapshots) {
  const uniqueVisits = snapshots.reduce((sum, s) => sum + s.uniqueVisits, 0);
  const uniqueClones = snapshots.reduce((sum, s) => sum + s.uniqueClones, 0);
  return {
    uniqueVisits,
    uniqueClones,
    conversionRate: calculateConversionRate(uniqueClones, uniqueVisits),
    snapshotCount: snapshots.length,
  };
}

function getSortedMonths(grouped) {
  return Object.keys(grouped).sort().reverse();
}

function formatMonthLabel(yearMonth) {
  const [year, month] = yearMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
}

function buildMetricChange(current, previous) {
  const change = calculateRawPercentageChange(current, previous);
  return { value: current, change: formatPercentageChange(change) };
}

function buildMonthlyComparison(currentTotals, previousTotals) {
  return {
    uniqueVisits: buildMetricChange(currentTotals.uniqueVisits, previousTotals.uniqueVisits),
    uniqueClones: buildMetricChange(currentTotals.uniqueClones, previousTotals.uniqueClones),
    conversionRate: buildMetricChange(currentTotals.conversionRate, previousTotals.conversionRate),
  };
}

function buildFirstRunMonthlyComparison(currentTotals) {
  return {
    uniqueVisits: { value: currentTotals.uniqueVisits, change: FIRST_RUN_LABEL },
    uniqueClones: { value: currentTotals.uniqueClones, change: FIRST_RUN_LABEL },
    conversionRate: { value: currentTotals.conversionRate, change: FIRST_RUN_LABEL },
  };
}

function buildFirstRunResult(monthLabel, currentTotals) {
  return {
    monthLabel,
    comparison: buildFirstRunMonthlyComparison(currentTotals),
    currentSnapshotCount: currentTotals.snapshotCount,
    previousSnapshotCount: null,
  };
}

function buildComparisonResult(monthLabel, currentTotals, previousSnapshots) {
  const previousTotals = aggregateMonthlyTotals(previousSnapshots);
  return {
    monthLabel,
    comparison: buildMonthlyComparison(currentTotals, previousTotals),
    currentSnapshotCount: currentTotals.snapshotCount,
    previousSnapshotCount: previousTotals.snapshotCount,
  };
}

function aggregateMonthly(snapshotsDir) {
  const snapshots = readAllWeeklySnapshots(snapshotsDir);
  const grouped = groupSnapshotsByMonth(snapshots);
  const months = getSortedMonths(grouped);
  if (months.length === 0) throw new Error('No snapshots found');
  const currentMonth = months[0];
  const currentTotals = aggregateMonthlyTotals(grouped[currentMonth]);
  const monthLabel = formatMonthLabel(currentMonth);
  if (months.length === 1) return buildFirstRunResult(monthLabel, currentTotals);
  return buildComparisonResult(monthLabel, currentTotals, grouped[months[1]]);
}

function buildLimitedDataWarning(count) {
  return `(limited data - ${count} snapshots this month)`;
}

function collectLimitedDataWarnings(currentSnapshotCount, previousSnapshotCount) {
  const warnings = [];
  if (currentSnapshotCount < LIMITED_DATA_THRESHOLD) {
    warnings.push(buildLimitedDataWarning(currentSnapshotCount));
  }
  if (previousSnapshotCount !== null && previousSnapshotCount < LIMITED_DATA_THRESHOLD) {
    warnings.push(buildLimitedDataWarning(previousSnapshotCount));
  }
  return warnings;
}

function buildHeaderBlock(monthLabel) {
  return {
    type: 'header',
    text: { type: 'plain_text', text: `BrightDev Monthly Traffic Report - ${monthLabel}` },
  };
}

function buildDividerBlock() {
  return { type: 'divider' };
}

function buildMetricSectionBlock(label, metric) {
  return {
    type: 'section',
    text: { type: 'mrkdwn', text: `*${label}*\n${metric.value} ${metric.change}` },
  };
}

function buildContextBlock() {
  return {
    type: 'context',
    elements: [{ type: 'mrkdwn', text: 'Data from GitHub Traffic API - BrightDev' }],
  };
}

function buildWarningBlock(warnings) {
  return {
    type: 'context',
    elements: [{ type: 'mrkdwn', text: warnings.join('\n') }],
  };
}

function buildSlackPayload(monthLabel, comparison, warnings) {
  const blocks = [
    buildHeaderBlock(monthLabel),
    buildDividerBlock(),
    buildMetricSectionBlock('Unique Visits', comparison.uniqueVisits),
    buildMetricSectionBlock('Unique Clones', comparison.uniqueClones),
    buildMetricSectionBlock('Conversion Rate', comparison.conversionRate),
    buildContextBlock(),
  ];
  if (warnings.length > 0) blocks.push(buildWarningBlock(warnings));
  return { blocks };
}

function isTestMode() {
  return process.env.TEST_MODE === 'true';
}

function printPayloadToLog(payload) {
  console.log('TEST MODE - Slack payload:');
  console.log(JSON.stringify(payload, null, 2));
}

async function postPayloadToSlack(webhookUrl, payload) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Slack webhook returned ${res.status}: ${await res.text()}`);
  }
}

async function deliverPayload(payload) {
  if (isTestMode()) {
    printPayloadToLog(payload);
    return;
  }
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('SLACK_WEBHOOK_URL is not set');
  await postPayloadToSlack(webhookUrl, payload);
}

async function run() {
  const result = aggregateMonthly(SNAPSHOTS_DIR);
  const warnings = collectLimitedDataWarnings(result.currentSnapshotCount, result.previousSnapshotCount);
  const payload = buildSlackPayload(result.monthLabel, result.comparison, warnings);
  await deliverPayload(payload);
}

module.exports = {
  aggregateMonthly,
  aggregateMonthlyTotals,
  buildSlackPayload,
  buildHeaderBlock,
  buildDividerBlock,
  buildMetricSectionBlock,
  buildContextBlock,
  buildWarningBlock,
  collectLimitedDataWarnings,
  buildLimitedDataWarning,
  formatMonthLabel,
  buildMonthlyComparison,
  buildFirstRunMonthlyComparison,
  isTestMode,
  deliverPayload,
};

if (require.main === module) {
  run().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

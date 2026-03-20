#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const {
  calculateRawPercentageChange,
  formatPercentageChange,
  formatDelta,
  FIRST_RUN_LABEL,
  NO_DATA_LABEL,
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

function sumField(snapshots, field) {
  return snapshots.reduce((sum, s) => sum + (s[field] || 0), 0);
}

function latestSnapshotByDate(snapshots) {
  return [...snapshots].sort((a, b) => a.date.localeCompare(b.date)).pop();
}

function collectListEntries(snapshots, field) {
  return snapshots.flatMap((s) => s[field] || []);
}

function mergeListByKey(entries, keyProp, valueProp) {
  const merged = {};
  for (const entry of entries) {
    merged[entry[keyProp]] = (merged[entry[keyProp]] || 0) + entry[valueProp];
  }
  return Object.entries(merged)
    .map(([key, value]) => ({ [keyProp]: key, [valueProp]: value }))
    .sort((a, b) => b[valueProp] - a[valueProp]);
}

function mergeReferrers(snapshots) {
  return mergeListByKey(collectListEntries(snapshots, 'topReferrers'), 'referrer', 'uniques');
}

function mergePaths(snapshots) {
  return mergeListByKey(collectListEntries(snapshots, 'topPaths'), 'path', 'uniques');
}

function aggregateMonthlyTotals(snapshots) {
  const latest = latestSnapshotByDate(snapshots);
  return {
    uniqueVisits: sumField(snapshots, 'uniqueVisits'),
    stars: latest.stars ?? null,
    forks: latest.forks ?? null,
    issuesOpened: sumField(snapshots, 'issuesOpenedThisWeek'),
    externalPrs: sumField(snapshots, 'externalPrsThisWeek'),
    topReferrers: mergeReferrers(snapshots),
    topPaths: mergePaths(snapshots),
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

function buildDeltaMetricChange(current, previous) {
  if (current == null) return { value: null, change: NO_DATA_LABEL };
  if (previous == null) return { value: current, change: FIRST_RUN_LABEL };
  return { value: current, change: formatDelta(current - previous) };
}

function buildSafeMetricChange(current, previous) {
  if (current == null) return { value: null, change: NO_DATA_LABEL };
  if (previous == null) return { value: current, change: FIRST_RUN_LABEL };
  return buildMetricChange(current, previous);
}

function buildMonthlyComparison(currentTotals, previousTotals) {
  return {
    uniqueVisits: buildMetricChange(currentTotals.uniqueVisits, previousTotals.uniqueVisits),
    stars: buildDeltaMetricChange(currentTotals.stars, previousTotals.stars),
    forks: buildDeltaMetricChange(currentTotals.forks, previousTotals.forks),
    issuesOpened: buildSafeMetricChange(currentTotals.issuesOpened, previousTotals.issuesOpened),
    externalPrs: buildSafeMetricChange(currentTotals.externalPrs, previousTotals.externalPrs),
    topReferrers: currentTotals.topReferrers,
    topPaths: currentTotals.topPaths,
  };
}

function buildFirstRunMonthlyMetric(value) {
  if (value == null) return { value: null, change: NO_DATA_LABEL };
  return { value, change: FIRST_RUN_LABEL };
}

function buildFirstRunMonthlyComparison(currentTotals) {
  return {
    uniqueVisits: { value: currentTotals.uniqueVisits, change: FIRST_RUN_LABEL },
    stars: buildFirstRunMonthlyMetric(currentTotals.stars),
    forks: buildFirstRunMonthlyMetric(currentTotals.forks),
    issuesOpened: buildFirstRunMonthlyMetric(currentTotals.issuesOpened),
    externalPrs: buildFirstRunMonthlyMetric(currentTotals.externalPrs),
    topReferrers: currentTotals.topReferrers || [],
    topPaths: currentTotals.topPaths || [],
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
    text: { type: 'plain_text', text: `\ud83d\udcca BrightDev Monthly Report - ${monthLabel}` },
  };
}

function buildDividerBlock() {
  return { type: 'divider' };
}

function formatMetricText(label, metric) {
  if (metric.value == null) return `*${label}*\n${metric.change}`;
  return `*${label}*\n${metric.value} ${metric.change}`;
}

function buildMetricSectionBlock(label, metric) {
  return {
    type: 'section',
    text: { type: 'mrkdwn', text: formatMetricText(label, metric) },
  };
}

function buildTwoColumnBlock(leftLabel, leftMetric, rightLabel, rightMetric) {
  return {
    type: 'section',
    fields: [
      { type: 'mrkdwn', text: formatMetricText(leftLabel, leftMetric) },
      { type: 'mrkdwn', text: formatMetricText(rightLabel, rightMetric) },
    ],
  };
}

function formatReferrerLine(entry) {
  return `\u2022 ${entry.referrer} (${entry.uniques} unique)`;
}

function formatPathLine(entry) {
  return `\u2022 \`${entry.path}\` (${entry.uniques} unique)`;
}

function buildListBlock(label, items, formatter) {
  const lines = items.map(formatter).join('\n');
  const body = items.length > 0 ? lines : '_No data_';
  return {
    type: 'section',
    text: { type: 'mrkdwn', text: `*${label}*\n${body}` },
  };
}

function buildContextBlock() {
  return {
    type: 'context',
    elements: [{ type: 'mrkdwn', text: 'Data from GitHub API - BrightDev' }],
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
    buildMetricSectionBlock('\ud83d\udc41\ufe0f Unique Visits', comparison.uniqueVisits),
    buildTwoColumnBlock('\u2b50 Stars', comparison.stars, '\ud83c\udf74 Forks', comparison.forks),
    buildDividerBlock(),
    buildTwoColumnBlock('\ud83d\udcdd Issues Opened', comparison.issuesOpened, '\ud83e\udd1d External PRs', comparison.externalPrs),
    buildDividerBlock(),
    buildListBlock('\ud83d\udd17 Top Referrers', comparison.topReferrers, formatReferrerLine),
    buildListBlock('\ud83d\udcc4 Top Content', comparison.topPaths, formatPathLine),
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
  buildTwoColumnBlock,
  buildListBlock,
  buildContextBlock,
  buildWarningBlock,
  collectLimitedDataWarnings,
  buildLimitedDataWarning,
  formatMonthLabel,
  formatMetricText,
  formatReferrerLine,
  formatPathLine,
  buildMonthlyComparison,
  buildFirstRunMonthlyComparison,
  buildFirstRunMonthlyMetric,
  buildDeltaMetricChange,
  buildSafeMetricChange,
  isTestMode,
  deliverPayload,
};

if (require.main === module) {
  run().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

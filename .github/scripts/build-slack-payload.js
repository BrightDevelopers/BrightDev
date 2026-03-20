#!/usr/bin/env node

'use strict';

const { compareSnapshots } = require('./compare-snapshots');

const SNAPSHOTS_DIR = 'metrics/snapshots';

function buildHeaderBlock(date) {
  return {
    type: 'header',
    text: { type: 'plain_text', text: `BrightDev Traffic Report - w/e ${date}` },
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

function buildCommunityBlocks(c) {
  return [
    buildTwoColumnBlock('Stars', c.stars, 'Forks', c.forks),
  ];
}

function buildTrafficBlocks(c) {
  return [
    buildTwoColumnBlock('Unique Visits', c.uniqueVisits, 'Unique Clones', c.uniqueClones),
    buildMetricSectionBlock('Conversion Rate', c.conversionRate),
  ];
}

function buildEngagementBlocks(c) {
  return [
    buildTwoColumnBlock('Issues Opened', c.issuesOpenedThisWeek, 'External PRs', c.externalPrsThisWeek),
    buildTwoColumnBlock('Open Issues', c.openIssueCount, 'Avg Issue Age (days)', c.openIssueAvgAgeDays),
    buildMetricSectionBlock('Avg First Response (hrs)', c.avgFirstResponseHours),
  ];
}

function buildReferralBlocks(c) {
  return [
    buildListBlock('Top Referrers', c.topReferrers, formatReferrerLine),
    buildListBlock('Top Content', c.topPaths, formatPathLine),
  ];
}

function buildSlackPayload(comparison) {
  return {
    blocks: [
      buildHeaderBlock(comparison.date),
      buildDividerBlock(),
      ...buildCommunityBlocks(comparison),
      buildDividerBlock(),
      ...buildTrafficBlocks(comparison),
      buildDividerBlock(),
      ...buildEngagementBlocks(comparison),
      buildDividerBlock(),
      ...buildReferralBlocks(comparison),
      buildContextBlock(),
    ],
  };
}

async function postPayloadToSlackWebhook(webhookUrl, payload) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Slack webhook returned ${res.status}: ${await res.text()}`);
  }
}

function isTestMode() {
  return process.env.TEST_MODE === 'true';
}

function printPayloadToLog(payload) {
  console.log('TEST MODE - Slack payload:');
  console.log(JSON.stringify(payload, null, 2));
}

async function deliverPayload(payload) {
  if (isTestMode()) {
    printPayloadToLog(payload);
    return;
  }
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('SLACK_WEBHOOK_URL is not set');
  await postPayloadToSlackWebhook(webhookUrl, payload);
}

async function run() {
  const comparison = compareSnapshots(SNAPSHOTS_DIR);
  const payload = buildSlackPayload(comparison);
  await deliverPayload(payload);
}

module.exports = {
  buildSlackPayload,
  buildHeaderBlock,
  buildDividerBlock,
  buildMetricSectionBlock,
  buildTwoColumnBlock,
  buildListBlock,
  buildContextBlock,
  formatMetricText,
  formatReferrerLine,
  formatPathLine,
  isTestMode,
  postPayloadToSlackWebhook,
  deliverPayload,
};

if (require.main === module) {
  run().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

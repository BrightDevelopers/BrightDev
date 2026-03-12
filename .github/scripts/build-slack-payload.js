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

function buildSlackPayload(comparison) {
  return {
    blocks: [
      buildHeaderBlock(comparison.date),
      buildDividerBlock(),
      buildMetricSectionBlock('Unique Visits', comparison.uniqueVisits),
      buildMetricSectionBlock('Unique Clones', comparison.uniqueClones),
      buildMetricSectionBlock('Conversion Rate', comparison.conversionRate),
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
  buildContextBlock,
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

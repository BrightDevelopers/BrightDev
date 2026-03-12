'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  buildSlackPayload,
  buildHeaderBlock,
  buildDividerBlock,
  buildMetricSectionBlock,
  buildContextBlock,
  isTestMode,
  postPayloadToSlackWebhook,
  deliverPayload,
} = require('./build-slack-payload');

const SAMPLE_COMPARISON = {
  date: '2024-01-12',
  uniqueVisits: { value: 200, change: '\u2191 +100%' },
  uniqueClones: { value: 20, change: '\u2191 +100%' },
  conversionRate: { value: 10, change: '\u2192 0%' },
};

test('buildHeaderBlock includes date in correct format', () => {
  const block = buildHeaderBlock('2024-01-12');
  assert.equal(block.type, 'header');
  assert.equal(block.text.text, 'BrightDev Traffic Report - w/e 2024-01-12');
  assert.equal(block.text.type, 'plain_text');
});

test('buildDividerBlock returns divider type', () => {
  const block = buildDividerBlock();
  assert.equal(block.type, 'divider');
});

test('buildMetricSectionBlock includes label and metric value and change', () => {
  const block = buildMetricSectionBlock('Unique Visits', { value: 200, change: '\u2191 +100%' });
  assert.equal(block.type, 'section');
  assert.equal(block.text.type, 'mrkdwn');
  assert.ok(block.text.text.includes('Unique Visits'));
  assert.ok(block.text.text.includes('200'));
  assert.ok(block.text.text.includes('\u2191 +100%'));
});

test('buildContextBlock contains GitHub Traffic API attribution', () => {
  const block = buildContextBlock();
  assert.equal(block.type, 'context');
  assert.equal(block.elements[0].type, 'mrkdwn');
  assert.ok(block.elements[0].text.includes('Data from GitHub Traffic API - BrightDev'));
});

test('buildSlackPayload produces six blocks in correct order', () => {
  const payload = buildSlackPayload(SAMPLE_COMPARISON);
  assert.equal(payload.blocks.length, 6);
  assert.equal(payload.blocks[0].type, 'header');
  assert.equal(payload.blocks[1].type, 'divider');
  assert.equal(payload.blocks[2].type, 'section');
  assert.equal(payload.blocks[3].type, 'section');
  assert.equal(payload.blocks[4].type, 'section');
  assert.equal(payload.blocks[5].type, 'context');
});

test('buildSlackPayload header shows correct date', () => {
  const payload = buildSlackPayload(SAMPLE_COMPARISON);
  assert.ok(payload.blocks[0].text.text.includes('2024-01-12'));
});

test('buildSlackPayload sections contain correct labels', () => {
  const payload = buildSlackPayload(SAMPLE_COMPARISON);
  assert.ok(payload.blocks[2].text.text.includes('Unique Visits'));
  assert.ok(payload.blocks[3].text.text.includes('Unique Clones'));
  assert.ok(payload.blocks[4].text.text.includes('Conversion Rate'));
});

test('buildSlackPayload positive change shows + prefix', () => {
  const payload = buildSlackPayload(SAMPLE_COMPARISON);
  assert.ok(payload.blocks[2].text.text.includes('+'));
});

test('buildSlackPayload negative change does not show + prefix', () => {
  const comparison = {
    ...SAMPLE_COMPARISON,
    uniqueVisits: { value: 50, change: '\u2193 -50%' },
  };
  const payload = buildSlackPayload(comparison);
  assert.ok(!payload.blocks[2].text.text.includes('+'));
  assert.ok(payload.blocks[2].text.text.includes('\u2193'));
});

test('isTestMode returns true when TEST_MODE env is true', () => {
  const original = process.env.TEST_MODE;
  process.env.TEST_MODE = 'true';
  assert.equal(isTestMode(), true);
  process.env.TEST_MODE = original;
});

test('isTestMode returns false when TEST_MODE env is false', () => {
  const original = process.env.TEST_MODE;
  process.env.TEST_MODE = 'false';
  assert.equal(isTestMode(), false);
  process.env.TEST_MODE = original;
});

test('isTestMode returns false when TEST_MODE env is unset', () => {
  const original = process.env.TEST_MODE;
  delete process.env.TEST_MODE;
  assert.equal(isTestMode(), false);
  process.env.TEST_MODE = original;
});

test('postPayloadToSlackWebhook throws on non-2xx response', async () => {
  const fakeFetch = async () => ({ ok: false, status: 500, text: async () => 'Internal Server Error' });
  const original = global.fetch;
  global.fetch = fakeFetch;
  await assert.rejects(
    () => postPayloadToSlackWebhook('https://example.com', {}),
    /Slack webhook returned 500/
  );
  global.fetch = original;
});

test('postPayloadToSlackWebhook resolves on 2xx response', async () => {
  const fakeFetch = async () => ({ ok: true, status: 200 });
  const original = global.fetch;
  global.fetch = fakeFetch;
  await assert.doesNotReject(() => postPayloadToSlackWebhook('https://example.com', {}));
  global.fetch = original;
});

test('deliverPayload prints to log in test mode without calling fetch', async () => {
  const original = process.env.TEST_MODE;
  process.env.TEST_MODE = 'true';
  let fetchCalled = false;
  const originalFetch = global.fetch;
  global.fetch = async () => { fetchCalled = true; return { ok: true }; };
  const payload = buildSlackPayload(SAMPLE_COMPARISON);
  await assert.doesNotReject(() => deliverPayload(payload));
  assert.equal(fetchCalled, false);
  process.env.TEST_MODE = original;
  global.fetch = originalFetch;
});

test('deliverPayload throws when SLACK_WEBHOOK_URL is not set in non-test mode', async () => {
  const originalMode = process.env.TEST_MODE;
  const originalUrl = process.env.SLACK_WEBHOOK_URL;
  process.env.TEST_MODE = 'false';
  delete process.env.SLACK_WEBHOOK_URL;
  await assert.rejects(
    () => deliverPayload(buildSlackPayload(SAMPLE_COMPARISON)),
    /SLACK_WEBHOOK_URL is not set/
  );
  process.env.TEST_MODE = originalMode;
  process.env.SLACK_WEBHOOK_URL = originalUrl;
});

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
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
} = require('./build-slack-payload');

const SAMPLE_COMPARISON = {
  date: '2024-01-12',
  uniqueVisits: { value: 200, change: '\u2191 +100%' },
  uniqueClones: { value: 20, change: '\u2191 +100%' },
  conversionRate: { value: 10, change: '\u2192 0%' },
  stars: { value: 150, change: '\u2191 +5' },
  forks: { value: 30, change: '\u2191 +2' },
  issuesOpenedThisWeek: { value: 3, change: '\u2191 +50%' },
  externalPrsThisWeek: { value: 1, change: 'N/A (first run)' },
  openIssueCount: { value: 12, change: '\u2193 -8%' },
  openIssueAvgAgeDays: { value: 15.3, change: '\u2191 +5%' },
  avgFirstResponseHours: { value: 4.2, change: '\u2193 -20%' },
  topReferrers: [
    { referrer: 'google.com', uniques: 10 },
    { referrer: 'dev.to', uniques: 5 },
  ],
  topPaths: [
    { path: '/README.md', uniques: 25 },
    { path: '/docs/setup.md', uniques: 12 },
  ],
};

// --- Block builders ---

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

test('buildMetricSectionBlock includes label, value, and change', () => {
  const block = buildMetricSectionBlock('Unique Visits', { value: 200, change: '\u2191 +100%' });
  assert.equal(block.type, 'section');
  assert.equal(block.text.type, 'mrkdwn');
  assert.ok(block.text.text.includes('Unique Visits'));
  assert.ok(block.text.text.includes('200'));
  assert.ok(block.text.text.includes('\u2191 +100%'));
});

test('buildTwoColumnBlock produces section with two fields', () => {
  const block = buildTwoColumnBlock(
    'Stars', { value: 150, change: '+5' },
    'Forks', { value: 30, change: '+2' }
  );
  assert.equal(block.type, 'section');
  assert.equal(block.fields.length, 2);
  assert.ok(block.fields[0].text.includes('Stars'));
  assert.ok(block.fields[0].text.includes('150'));
  assert.ok(block.fields[1].text.includes('Forks'));
  assert.ok(block.fields[1].text.includes('30'));
});

test('buildListBlock renders bulleted list', () => {
  const items = [{ name: 'a' }, { name: 'b' }];
  const block = buildListBlock('Test', items, (i) => `\u2022 ${i.name}`);
  assert.equal(block.type, 'section');
  assert.ok(block.text.text.includes('Test'));
  assert.ok(block.text.text.includes('\u2022 a'));
  assert.ok(block.text.text.includes('\u2022 b'));
});

test('buildListBlock shows no data message for empty list', () => {
  const block = buildListBlock('Empty', [], () => '');
  assert.ok(block.text.text.includes('_No data_'));
});

test('buildContextBlock contains GitHub API attribution', () => {
  const block = buildContextBlock();
  assert.equal(block.type, 'context');
  assert.ok(block.elements[0].text.includes('Data from GitHub API - BrightDev'));
});

// --- formatMetricText ---

test('formatMetricText displays value and change for normal metric', () => {
  const text = formatMetricText('Stars', { value: 150, change: '+5' });
  assert.ok(text.includes('*Stars*'));
  assert.ok(text.includes('150'));
  assert.ok(text.includes('+5'));
});

test('formatMetricText displays only change when value is null', () => {
  const text = formatMetricText('Response', { value: null, change: 'N/A' });
  assert.ok(text.includes('*Response*'));
  assert.ok(text.includes('N/A'));
  assert.ok(!text.includes('null'));
});

// --- List formatters ---

test('formatReferrerLine formats referrer with bullet and uniques', () => {
  const line = formatReferrerLine({ referrer: 'google.com', uniques: 10 });
  assert.ok(line.includes('\u2022'));
  assert.ok(line.includes('google.com'));
  assert.ok(line.includes('10 unique'));
});

test('formatPathLine formats path with bullet, backticks, and uniques', () => {
  const line = formatPathLine({ path: '/README.md', uniques: 25 });
  assert.ok(line.includes('\u2022'));
  assert.ok(line.includes('`/README.md`'));
  assert.ok(line.includes('25 unique'));
});

// --- buildSlackPayload ---

test('buildSlackPayload produces correct number of blocks', () => {
  const payload = buildSlackPayload(SAMPLE_COMPARISON);
  assert.equal(payload.blocks.length, 14);
});

test('buildSlackPayload starts with header and ends with context', () => {
  const payload = buildSlackPayload(SAMPLE_COMPARISON);
  assert.equal(payload.blocks[0].type, 'header');
  assert.equal(payload.blocks[payload.blocks.length - 1].type, 'context');
});

test('buildSlackPayload header shows correct date', () => {
  const payload = buildSlackPayload(SAMPLE_COMPARISON);
  assert.ok(payload.blocks[0].text.text.includes('2024-01-12'));
});

test('buildSlackPayload contains stars/forks two-column block', () => {
  const payload = buildSlackPayload(SAMPLE_COMPARISON);
  const starsForks = payload.blocks[2];
  assert.equal(starsForks.type, 'section');
  assert.ok(starsForks.fields);
  assert.ok(starsForks.fields[0].text.includes('Stars'));
  assert.ok(starsForks.fields[1].text.includes('Forks'));
});

test('buildSlackPayload contains referrer list', () => {
  const payload = buildSlackPayload(SAMPLE_COMPARISON);
  const referrerBlock = payload.blocks.find(
    (b) => b.text && b.text.text && b.text.text.includes('Top Referrers')
  );
  assert.ok(referrerBlock);
  assert.ok(referrerBlock.text.text.includes('google.com'));
});

test('buildSlackPayload contains content path list', () => {
  const payload = buildSlackPayload(SAMPLE_COMPARISON);
  const pathBlock = payload.blocks.find(
    (b) => b.text && b.text.text && b.text.text.includes('Top Content')
  );
  assert.ok(pathBlock);
  assert.ok(pathBlock.text.text.includes('/README.md'));
});

// --- isTestMode ---

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

// --- Delivery ---

test('postPayloadToSlackWebhook throws on non-2xx response', async () => {
  const original = global.fetch;
  global.fetch = async () => ({ ok: false, status: 500, text: async () => 'Internal Server Error' });
  await assert.rejects(
    () => postPayloadToSlackWebhook('https://example.com', {}),
    /Slack webhook returned 500/
  );
  global.fetch = original;
});

test('postPayloadToSlackWebhook resolves on 2xx response', async () => {
  const original = global.fetch;
  global.fetch = async () => ({ ok: true, status: 200 });
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

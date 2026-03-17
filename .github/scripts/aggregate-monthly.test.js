'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  aggregateMonthly,
  aggregateMonthlyTotals,
  buildSlackPayload,
  buildHeaderBlock,
  buildMetricSectionBlock,
  buildContextBlock,
  buildWarningBlock,
  collectLimitedDataWarnings,
  buildLimitedDataWarning,
  formatMonthLabel,
  buildFirstRunMonthlyComparison,
  isTestMode,
  deliverPayload,
} = require('./aggregate-monthly');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'monthly-snapshots-'));
}

function writeSnapshot(dir, filename, data) {
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(data));
}

const SNAPSHOT_JAN_WEEK1 = { date: '2024-01-05', uniqueVisits: 100, uniqueClones: 10, conversionRate: 10 };
const SNAPSHOT_JAN_WEEK2 = { date: '2024-01-12', uniqueVisits: 200, uniqueClones: 20, conversionRate: 10 };
const SNAPSHOT_DEC_WEEK1 = { date: '2023-12-29', uniqueVisits: 80, uniqueClones: 8, conversionRate: 10 };

test('aggregateMonthly throws when no snapshots exist', () => {
  const dir = makeTempDir();
  assert.throws(() => aggregateMonthly(dir), /No snapshots found/);
});

test('aggregateMonthly returns first run result for single month', () => {
  const dir = makeTempDir();
  writeSnapshot(dir, 'weekly-2024-01-05.json', SNAPSHOT_JAN_WEEK1);
  const result = aggregateMonthly(dir);
  assert.equal(result.monthLabel, 'January 2024');
  assert.equal(result.comparison.uniqueVisits.change, 'N/A (first run)');
  assert.equal(result.currentSnapshotCount, 1);
  assert.equal(result.previousSnapshotCount, null);
});

test('aggregateMonthly sums current month and compares with previous month', () => {
  const dir = makeTempDir();
  writeSnapshot(dir, 'weekly-2024-01-05.json', SNAPSHOT_JAN_WEEK1);
  writeSnapshot(dir, 'weekly-2024-01-12.json', SNAPSHOT_JAN_WEEK2);
  writeSnapshot(dir, 'weekly-2023-12-29.json', SNAPSHOT_DEC_WEEK1);
  const result = aggregateMonthly(dir);
  assert.equal(result.monthLabel, 'January 2024');
  assert.equal(result.comparison.uniqueVisits.value, 300);
  assert.equal(result.comparison.uniqueClones.value, 30);
  assert.equal(result.currentSnapshotCount, 2);
  assert.equal(result.previousSnapshotCount, 1);
});

test('aggregateMonthlyTotals sums visits and clones and recalculates conversion rate', () => {
  const snapshots = [
    { uniqueVisits: 100, uniqueClones: 10, conversionRate: 10 },
    { uniqueVisits: 200, uniqueClones: 30, conversionRate: 15 },
  ];
  const totals = aggregateMonthlyTotals(snapshots);
  assert.equal(totals.uniqueVisits, 300);
  assert.equal(totals.uniqueClones, 40);
  assert.equal(totals.conversionRate, 13.33);
  assert.equal(totals.snapshotCount, 2);
});

test('aggregateMonthlyTotals returns 0 conversion rate when visits are 0', () => {
  const snapshots = [{ uniqueVisits: 0, uniqueClones: 0, conversionRate: 0 }];
  const totals = aggregateMonthlyTotals(snapshots);
  assert.equal(totals.conversionRate, 0);
});

test('formatMonthLabel returns full month name and year', () => {
  assert.equal(formatMonthLabel('2024-01'), 'January 2024');
  assert.equal(formatMonthLabel('2023-12'), 'December 2023');
});

test('buildHeaderBlock includes month label in correct format', () => {
  const block = buildHeaderBlock('January 2024');
  assert.equal(block.type, 'header');
  assert.equal(block.text.text, 'BrightDev Monthly Traffic Report - January 2024');
  assert.equal(block.text.type, 'plain_text');
});

test('buildMetricSectionBlock renders label, value and change', () => {
  const block = buildMetricSectionBlock('Unique Visits', { value: 300, change: '\u2191 +50%' });
  assert.equal(block.type, 'section');
  assert.ok(block.text.text.includes('Unique Visits'));
  assert.ok(block.text.text.includes('300'));
  assert.ok(block.text.text.includes('\u2191 +50%'));
});

test('buildContextBlock contains correct attribution', () => {
  const block = buildContextBlock();
  assert.equal(block.type, 'context');
  assert.ok(block.elements[0].text.includes('Data from GitHub Traffic API - BrightDev'));
});

test('buildLimitedDataWarning returns correct string', () => {
  assert.equal(buildLimitedDataWarning(1), '(limited data - 1 snapshots this month)');
  assert.equal(buildLimitedDataWarning(0), '(limited data - 0 snapshots this month)');
});

test('collectLimitedDataWarnings returns warning when current month has fewer than 2 snapshots', () => {
  const warnings = collectLimitedDataWarnings(1, 3);
  assert.equal(warnings.length, 1);
  assert.ok(warnings[0].includes('1 snapshots this month'));
});

test('collectLimitedDataWarnings returns warning when previous month has fewer than 2 snapshots', () => {
  const warnings = collectLimitedDataWarnings(3, 1);
  assert.equal(warnings.length, 1);
  assert.ok(warnings[0].includes('1 snapshots this month'));
});

test('collectLimitedDataWarnings returns two warnings when both months have limited data', () => {
  const warnings = collectLimitedDataWarnings(1, 1);
  assert.equal(warnings.length, 2);
});

test('collectLimitedDataWarnings returns no warnings when both months have 2+ snapshots', () => {
  const warnings = collectLimitedDataWarnings(3, 2);
  assert.equal(warnings.length, 0);
});

test('collectLimitedDataWarnings ignores previousSnapshotCount when null', () => {
  const warnings = collectLimitedDataWarnings(3, null);
  assert.equal(warnings.length, 0);
});

test('buildWarningBlock renders warnings as mrkdwn context block', () => {
  const block = buildWarningBlock(['warning one', 'warning two']);
  assert.equal(block.type, 'context');
  assert.ok(block.elements[0].text.includes('warning one'));
  assert.ok(block.elements[0].text.includes('warning two'));
});

test('buildSlackPayload produces six blocks without warnings', () => {
  const comparison = buildFirstRunMonthlyComparison({ uniqueVisits: 100, uniqueClones: 10, conversionRate: 10 });
  const payload = buildSlackPayload('January 2024', comparison, []);
  assert.equal(payload.blocks.length, 6);
  assert.equal(payload.blocks[0].type, 'header');
  assert.equal(payload.blocks[1].type, 'divider');
  assert.equal(payload.blocks[2].type, 'section');
  assert.equal(payload.blocks[3].type, 'section');
  assert.equal(payload.blocks[4].type, 'section');
  assert.equal(payload.blocks[5].type, 'context');
});

test('buildSlackPayload appends warning block when warnings present', () => {
  const comparison = buildFirstRunMonthlyComparison({ uniqueVisits: 100, uniqueClones: 10, conversionRate: 10 });
  const payload = buildSlackPayload('January 2024', comparison, ['(limited data - 1 snapshots this month)']);
  assert.equal(payload.blocks.length, 7);
  assert.equal(payload.blocks[6].type, 'context');
  assert.ok(payload.blocks[6].elements[0].text.includes('limited data'));
});

test('buildSlackPayload sections contain correct labels', () => {
  const comparison = buildFirstRunMonthlyComparison({ uniqueVisits: 100, uniqueClones: 10, conversionRate: 10 });
  const payload = buildSlackPayload('January 2024', comparison, []);
  assert.ok(payload.blocks[2].text.text.includes('Unique Visits'));
  assert.ok(payload.blocks[3].text.text.includes('Unique Clones'));
  assert.ok(payload.blocks[4].text.text.includes('Conversion Rate'));
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

test('deliverPayload prints to log in test mode without calling fetch', async () => {
  const original = process.env.TEST_MODE;
  process.env.TEST_MODE = 'true';
  let fetchCalled = false;
  const originalFetch = global.fetch;
  global.fetch = async () => { fetchCalled = true; return { ok: true }; };
  const comparison = buildFirstRunMonthlyComparison({ uniqueVisits: 100, uniqueClones: 10, conversionRate: 10 });
  const payload = buildSlackPayload('January 2024', comparison, []);
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
  const comparison = buildFirstRunMonthlyComparison({ uniqueVisits: 100, uniqueClones: 10, conversionRate: 10 });
  const payload = buildSlackPayload('January 2024', comparison, []);
  await assert.rejects(() => deliverPayload(payload), /SLACK_WEBHOOK_URL is not set/);
  process.env.TEST_MODE = originalMode;
  process.env.SLACK_WEBHOOK_URL = originalUrl;
});

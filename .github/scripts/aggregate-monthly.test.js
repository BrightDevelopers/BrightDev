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
  buildFirstRunMonthlyComparison,
  buildFirstRunMonthlyMetric,
  buildDeltaMetricChange,
  buildSafeMetricChange,
  isTestMode,
  deliverPayload,
} = require('./aggregate-monthly');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'monthly-snapshots-'));
}

function writeSnapshot(dir, filename, data) {
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(data));
}

const SNAPSHOT_JAN_WEEK1 = {
  date: '2024-01-05',
  uniqueVisits: 100,
  uniqueClones: 10,
  stars: 10,
  forks: 2,
  issuesOpenedThisWeek: 3,
  externalPrsThisWeek: 1,
  topReferrers: [{ referrer: 'google.com', uniques: 50 }],
  topPaths: [{ path: '/repo', uniques: 80 }],
};

const SNAPSHOT_JAN_WEEK2 = {
  date: '2024-01-12',
  uniqueVisits: 200,
  uniqueClones: 20,
  stars: 12,
  forks: 3,
  issuesOpenedThisWeek: 5,
  externalPrsThisWeek: 2,
  topReferrers: [
    { referrer: 'google.com', uniques: 30 },
    { referrer: 'github.com', uniques: 20 },
  ],
  topPaths: [
    { path: '/repo', uniques: 60 },
    { path: '/repo/issues', uniques: 40 },
  ],
};

const SNAPSHOT_DEC_WEEK1 = {
  date: '2023-12-29',
  uniqueVisits: 80,
  uniqueClones: 8,
  stars: 8,
  forks: 2,
  issuesOpenedThisWeek: 2,
  externalPrsThisWeek: 0,
  topReferrers: [{ referrer: 'bing.com', uniques: 10 }],
  topPaths: [{ path: '/repo', uniques: 50 }],
};

// --- aggregateMonthly ---

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
  assert.equal(result.comparison.stars.change, 'N/A (first run)');
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
  assert.equal(result.comparison.stars.value, 12);
  assert.equal(result.comparison.forks.value, 3);
  assert.equal(result.currentSnapshotCount, 2);
  assert.equal(result.previousSnapshotCount, 1);
});

// --- aggregateMonthlyTotals ---

test('aggregateMonthlyTotals sums visits and activity, takes latest stars and forks', () => {
  const totals = aggregateMonthlyTotals([SNAPSHOT_JAN_WEEK1, SNAPSHOT_JAN_WEEK2]);
  assert.equal(totals.uniqueVisits, 300);
  assert.equal(totals.stars, 12);
  assert.equal(totals.forks, 3);
  assert.equal(totals.issuesOpened, 8);
  assert.equal(totals.externalPrs, 3);
  assert.equal(totals.snapshotCount, 2);
});

test('aggregateMonthlyTotals merges referrers across snapshots', () => {
  const totals = aggregateMonthlyTotals([SNAPSHOT_JAN_WEEK1, SNAPSHOT_JAN_WEEK2]);
  assert.equal(totals.topReferrers.length, 2);
  assert.equal(totals.topReferrers[0].referrer, 'google.com');
  assert.equal(totals.topReferrers[0].uniques, 80);
  assert.equal(totals.topReferrers[1].referrer, 'github.com');
  assert.equal(totals.topReferrers[1].uniques, 20);
});

test('aggregateMonthlyTotals merges paths across snapshots', () => {
  const totals = aggregateMonthlyTotals([SNAPSHOT_JAN_WEEK1, SNAPSHOT_JAN_WEEK2]);
  assert.equal(totals.topPaths.length, 2);
  assert.equal(totals.topPaths[0].path, '/repo');
  assert.equal(totals.topPaths[0].uniques, 140);
  assert.equal(totals.topPaths[1].path, '/repo/issues');
  assert.equal(totals.topPaths[1].uniques, 40);
});

test('aggregateMonthlyTotals handles snapshots without new fields', () => {
  const legacy = [
    { date: '2024-01-05', uniqueVisits: 100, uniqueClones: 10 },
    { date: '2024-01-12', uniqueVisits: 200, uniqueClones: 20 },
  ];
  const totals = aggregateMonthlyTotals(legacy);
  assert.equal(totals.uniqueVisits, 300);
  assert.equal(totals.stars, null);
  assert.equal(totals.forks, null);
  assert.equal(totals.issuesOpened, 0);
  assert.equal(totals.externalPrs, 0);
  assert.equal(totals.topReferrers.length, 0);
  assert.equal(totals.topPaths.length, 0);
});

// --- formatMonthLabel ---

test('formatMonthLabel returns full month name and year', () => {
  assert.equal(formatMonthLabel('2024-01'), 'January 2024');
  assert.equal(formatMonthLabel('2023-12'), 'December 2023');
});

// --- Metric change helpers ---

test('buildDeltaMetricChange returns delta format for numeric values', () => {
  const result = buildDeltaMetricChange(12, 8);
  assert.equal(result.value, 12);
  assert.ok(result.change.includes('+4'));
});

test('buildDeltaMetricChange returns N/A for null current', () => {
  const result = buildDeltaMetricChange(null, 8);
  assert.equal(result.value, null);
  assert.equal(result.change, 'N/A');
});

test('buildDeltaMetricChange returns first run for null previous', () => {
  const result = buildDeltaMetricChange(12, null);
  assert.equal(result.value, 12);
  assert.equal(result.change, 'N/A (first run)');
});

test('buildSafeMetricChange returns percentage format for numeric values', () => {
  const result = buildSafeMetricChange(150, 100);
  assert.equal(result.value, 150);
  assert.ok(result.change.includes('50%'));
});

test('buildSafeMetricChange returns N/A for null current', () => {
  const result = buildSafeMetricChange(null, 100);
  assert.equal(result.value, null);
  assert.equal(result.change, 'N/A');
});

test('buildFirstRunMonthlyMetric returns first run for present value', () => {
  const result = buildFirstRunMonthlyMetric(10);
  assert.equal(result.value, 10);
  assert.equal(result.change, 'N/A (first run)');
});

test('buildFirstRunMonthlyMetric returns N/A for null value', () => {
  const result = buildFirstRunMonthlyMetric(null);
  assert.equal(result.value, null);
  assert.equal(result.change, 'N/A');
});

// --- Slack block builders ---

test('buildHeaderBlock includes emoji and month label', () => {
  const block = buildHeaderBlock('January 2024');
  assert.equal(block.type, 'header');
  assert.ok(block.text.text.includes('BrightDev Monthly Report - January 2024'));
  assert.equal(block.text.type, 'plain_text');
});

test('buildMetricSectionBlock renders label, value and change', () => {
  const block = buildMetricSectionBlock('Unique Visits', { value: 300, change: '\u2191 +50%' });
  assert.equal(block.type, 'section');
  assert.ok(block.text.text.includes('Unique Visits'));
  assert.ok(block.text.text.includes('300'));
  assert.ok(block.text.text.includes('\u2191 +50%'));
});

test('buildTwoColumnBlock produces section with two fields', () => {
  const block = buildTwoColumnBlock(
    'Stars', { value: 12, change: '+4' },
    'Forks', { value: 3, change: '+1' }
  );
  assert.equal(block.type, 'section');
  assert.equal(block.fields.length, 2);
  assert.ok(block.fields[0].text.includes('Stars'));
  assert.ok(block.fields[0].text.includes('12'));
  assert.ok(block.fields[1].text.includes('Forks'));
  assert.ok(block.fields[1].text.includes('3'));
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

test('buildContextBlock contains correct attribution', () => {
  const block = buildContextBlock();
  assert.equal(block.type, 'context');
  assert.ok(block.elements[0].text.includes('Data from GitHub API - BrightDev'));
});

// --- formatMetricText ---

test('formatMetricText displays value and change for normal metric', () => {
  const text = formatMetricText('Stars', { value: 12, change: '+4' });
  assert.ok(text.includes('*Stars*'));
  assert.ok(text.includes('12'));
  assert.ok(text.includes('+4'));
});

test('formatMetricText displays only change when value is null', () => {
  const text = formatMetricText('Stars', { value: null, change: 'N/A' });
  assert.ok(text.includes('*Stars*'));
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

// --- buildLimitedDataWarning / collectLimitedDataWarnings ---

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

// --- buildSlackPayload ---

test('buildSlackPayload produces 10 blocks without warnings', () => {
  const comparison = buildFirstRunMonthlyComparison({
    uniqueVisits: 100,
    stars: 10,
    forks: 2,
    issuesOpened: 3,
    externalPrs: 1,
    topReferrers: [],
    topPaths: [],
  });
  const payload = buildSlackPayload('January 2024', comparison, []);
  assert.equal(payload.blocks.length, 10);
  assert.equal(payload.blocks[0].type, 'header');
  assert.equal(payload.blocks[9].type, 'context');
});

test('buildSlackPayload appends warning block when warnings present', () => {
  const comparison = buildFirstRunMonthlyComparison({
    uniqueVisits: 100,
    stars: 10,
    forks: 2,
    issuesOpened: 3,
    externalPrs: 1,
    topReferrers: [],
    topPaths: [],
  });
  const payload = buildSlackPayload('January 2024', comparison, ['(limited data - 1 snapshots this month)']);
  assert.equal(payload.blocks.length, 11);
  assert.equal(payload.blocks[10].type, 'context');
  assert.ok(payload.blocks[10].elements[0].text.includes('limited data'));
});

test('buildSlackPayload contains stars/forks two-column block', () => {
  const comparison = buildFirstRunMonthlyComparison({
    uniqueVisits: 100,
    stars: 10,
    forks: 2,
    issuesOpened: 3,
    externalPrs: 1,
    topReferrers: [],
    topPaths: [],
  });
  const payload = buildSlackPayload('January 2024', comparison, []);
  const starsForks = payload.blocks[3];
  assert.equal(starsForks.type, 'section');
  assert.ok(starsForks.fields);
  assert.ok(starsForks.fields[0].text.includes('Stars'));
  assert.ok(starsForks.fields[1].text.includes('Forks'));
});

test('buildSlackPayload contains issues/PRs two-column block', () => {
  const comparison = buildFirstRunMonthlyComparison({
    uniqueVisits: 100,
    stars: 10,
    forks: 2,
    issuesOpened: 3,
    externalPrs: 1,
    topReferrers: [],
    topPaths: [],
  });
  const payload = buildSlackPayload('January 2024', comparison, []);
  const issuesPrs = payload.blocks[5];
  assert.equal(issuesPrs.type, 'section');
  assert.ok(issuesPrs.fields);
  assert.ok(issuesPrs.fields[0].text.includes('Issues Opened'));
  assert.ok(issuesPrs.fields[1].text.includes('External PRs'));
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

// --- deliverPayload ---

test('deliverPayload prints to log in test mode without calling fetch', async () => {
  const original = process.env.TEST_MODE;
  process.env.TEST_MODE = 'true';
  let fetchCalled = false;
  const originalFetch = global.fetch;
  global.fetch = async () => { fetchCalled = true; return { ok: true }; };
  const comparison = buildFirstRunMonthlyComparison({
    uniqueVisits: 100,
    stars: 10,
    forks: 2,
    issuesOpened: 3,
    externalPrs: 1,
    topReferrers: [],
    topPaths: [],
  });
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
  const comparison = buildFirstRunMonthlyComparison({
    uniqueVisits: 100,
    stars: 10,
    forks: 2,
    issuesOpened: 3,
    externalPrs: 1,
    topReferrers: [],
    topPaths: [],
  });
  const payload = buildSlackPayload('January 2024', comparison, []);
  await assert.rejects(() => deliverPayload(payload), /SLACK_WEBHOOK_URL is not set/);
  process.env.TEST_MODE = originalMode;
  process.env.SLACK_WEBHOOK_URL = originalUrl;
});

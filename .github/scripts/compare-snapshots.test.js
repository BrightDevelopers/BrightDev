'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  compareSnapshots,
  calculateRawPercentageChange,
  formatPercentageChange,
  formatDelta,
  buildFirstRunComparison,
  buildComparisonFromBaseline,
  buildMetricChange,
  buildDeltaChange,
  buildSafeMetricChange,
  FIRST_RUN_LABEL,
  NO_PRIOR_DATA_LABEL,
  NO_DATA_LABEL,
} = require('./compare-snapshots');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapshots-'));
}

function writeSnapshot(dir, filename, data) {
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(data));
}

function makeFullSnapshot(overrides) {
  return {
    date: '2024-01-12',
    uniqueVisits: 200,
    uniqueClones: 20,
    conversionRate: 10,
    stars: 150,
    forks: 30,
    issuesOpenedThisWeek: 3,
    externalPrsThisWeek: 1,
    openIssueCount: 12,
    openIssueAvgAgeDays: 15.3,
    avgFirstResponseHours: 4.2,
    topReferrers: [{ referrer: 'google.com', uniques: 10 }],
    topPaths: [{ path: '/README.md', uniques: 25 }],
    ...overrides,
  };
}

// --- calculateRawPercentageChange ---

test('calculateRawPercentageChange returns correct value for normal inputs', () => {
  assert.equal(calculateRawPercentageChange(110, 100), 10);
  assert.equal(calculateRawPercentageChange(90, 100), -10);
  assert.equal(calculateRawPercentageChange(100, 100), 0);
});

test('calculateRawPercentageChange rounds to 1 decimal place', () => {
  assert.equal(calculateRawPercentageChange(115, 100), 15);
  assert.equal(calculateRawPercentageChange(11, 30), -63.3);
});

test('calculateRawPercentageChange returns NO_PRIOR_DATA_LABEL when previous is 0 and current > 0', () => {
  assert.equal(calculateRawPercentageChange(5, 0), NO_PRIOR_DATA_LABEL);
});

test('calculateRawPercentageChange returns 0 when both are 0', () => {
  assert.equal(calculateRawPercentageChange(0, 0), 0);
});

// --- formatPercentageChange ---

test('formatPercentageChange shows up arrow and + prefix for positive change', () => {
  const result = formatPercentageChange(10);
  assert.ok(result.includes('\u2191'));
  assert.ok(result.includes('+'));
  assert.ok(result.includes('10%'));
});

test('formatPercentageChange shows down arrow for negative change', () => {
  const result = formatPercentageChange(-10);
  assert.ok(result.includes('\u2193'));
  assert.ok(result.includes('10%'));
  assert.ok(!result.includes('+'));
});

test('formatPercentageChange shows right arrow for zero change', () => {
  const result = formatPercentageChange(0);
  assert.ok(result.includes('\u2192'));
  assert.ok(result.includes('0%'));
});

test('formatPercentageChange passes through string labels unchanged', () => {
  assert.equal(formatPercentageChange(FIRST_RUN_LABEL), FIRST_RUN_LABEL);
  assert.equal(formatPercentageChange(NO_PRIOR_DATA_LABEL), NO_PRIOR_DATA_LABEL);
});

// --- formatDelta ---

test('formatDelta shows up arrow and + prefix for positive delta', () => {
  const result = formatDelta(5);
  assert.ok(result.includes('\u2191'));
  assert.ok(result.includes('+5'));
});

test('formatDelta shows down arrow for negative delta', () => {
  const result = formatDelta(-3);
  assert.ok(result.includes('\u2193'));
  assert.ok(result.includes('-3'));
});

test('formatDelta shows no change for zero delta', () => {
  const result = formatDelta(0);
  assert.ok(result.includes('\u2192'));
  assert.ok(result.includes('no change'));
});

// --- buildDeltaChange ---

test('buildDeltaChange returns FIRST_RUN_LABEL when previous is null', () => {
  const result = buildDeltaChange(150, null);
  assert.equal(result.value, 150);
  assert.equal(result.change, FIRST_RUN_LABEL);
});

test('buildDeltaChange returns FIRST_RUN_LABEL when previous is undefined', () => {
  const result = buildDeltaChange(150, undefined);
  assert.equal(result.value, 150);
  assert.equal(result.change, FIRST_RUN_LABEL);
});

test('buildDeltaChange returns formatted delta when both values present', () => {
  const result = buildDeltaChange(155, 150);
  assert.equal(result.value, 155);
  assert.ok(result.change.includes('+5'));
});

// --- buildSafeMetricChange ---

test('buildSafeMetricChange returns NO_DATA_LABEL when current is null', () => {
  const result = buildSafeMetricChange(null, 10);
  assert.equal(result.value, null);
  assert.equal(result.change, NO_DATA_LABEL);
});

test('buildSafeMetricChange returns FIRST_RUN_LABEL when previous is null', () => {
  const result = buildSafeMetricChange(10, null);
  assert.equal(result.value, 10);
  assert.equal(result.change, FIRST_RUN_LABEL);
});

test('buildSafeMetricChange returns percentage change when both present', () => {
  const result = buildSafeMetricChange(200, 100);
  assert.equal(result.value, 200);
  assert.ok(result.change.includes('100%'));
});

// --- compareSnapshots ---

test('compareSnapshots throws when directory has no snapshot files', () => {
  const dir = makeTempDir();
  assert.throws(() => compareSnapshots(dir), /No snapshot files found/);
});

test('compareSnapshots returns first run comparison when only one snapshot exists', () => {
  const dir = makeTempDir();
  writeSnapshot(dir, 'weekly-2024-01-05.json', makeFullSnapshot({ date: '2024-01-05' }));
  const result = compareSnapshots(dir);
  assert.equal(result.date, '2024-01-05');
  assert.equal(result.uniqueVisits.change, FIRST_RUN_LABEL);
  assert.equal(result.stars.change, FIRST_RUN_LABEL);
  assert.equal(result.avgFirstResponseHours.change, FIRST_RUN_LABEL);
});

test('compareSnapshots compares two full snapshots correctly', () => {
  const dir = makeTempDir();
  const baseline = makeFullSnapshot({ date: '2024-01-05', stars: 100, uniqueVisits: 100 });
  const current = makeFullSnapshot({ date: '2024-01-12', stars: 150, uniqueVisits: 200 });
  writeSnapshot(dir, 'weekly-2024-01-05.json', baseline);
  writeSnapshot(dir, 'weekly-2024-01-12.json', current);
  const result = compareSnapshots(dir);
  assert.equal(result.date, '2024-01-12');
  assert.equal(result.stars.value, 150);
  assert.ok(result.stars.change.includes('+50'));
  assert.equal(result.uniqueVisits.value, 200);
  assert.ok(result.uniqueVisits.change.includes('100%'));
});

test('compareSnapshots handles old-format baseline gracefully', () => {
  const dir = makeTempDir();
  const oldBaseline = { date: '2024-01-05', uniqueVisits: 100, uniqueClones: 10, conversionRate: 10 };
  const current = makeFullSnapshot({ date: '2024-01-12' });
  writeSnapshot(dir, 'weekly-2024-01-05.json', oldBaseline);
  writeSnapshot(dir, 'weekly-2024-01-12.json', current);
  const result = compareSnapshots(dir);
  assert.equal(result.stars.value, 150);
  assert.equal(result.stars.change, FIRST_RUN_LABEL);
  assert.equal(result.issuesOpenedThisWeek.change, FIRST_RUN_LABEL);
});

test('compareSnapshots handles null avgFirstResponseHours', () => {
  const dir = makeTempDir();
  const snapshot = makeFullSnapshot({ date: '2024-01-05', avgFirstResponseHours: null });
  writeSnapshot(dir, 'weekly-2024-01-05.json', snapshot);
  const result = compareSnapshots(dir);
  assert.equal(result.avgFirstResponseHours.value, null);
  assert.equal(result.avgFirstResponseHours.change, NO_DATA_LABEL);
});

test('compareSnapshots passes through topReferrers and topPaths', () => {
  const dir = makeTempDir();
  const snapshot = makeFullSnapshot({ date: '2024-01-05' });
  writeSnapshot(dir, 'weekly-2024-01-05.json', snapshot);
  const result = compareSnapshots(dir);
  assert.equal(result.topReferrers.length, 1);
  assert.equal(result.topReferrers[0].referrer, 'google.com');
  assert.equal(result.topPaths.length, 1);
  assert.equal(result.topPaths[0].path, '/README.md');
});

test('compareSnapshots sorts files by date so most recent is used as current', () => {
  const dir = makeTempDir();
  writeSnapshot(dir, 'weekly-2024-01-12.json', makeFullSnapshot({ date: '2024-01-12' }));
  writeSnapshot(dir, 'weekly-2024-01-05.json', makeFullSnapshot({ date: '2024-01-05' }));
  const result = compareSnapshots(dir);
  assert.equal(result.date, '2024-01-12');
});

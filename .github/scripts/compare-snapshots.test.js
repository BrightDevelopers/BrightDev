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
  buildFirstRunComparison,
  buildComparisonFromBaseline,
  FIRST_RUN_LABEL,
  NO_PRIOR_DATA_LABEL,
} = require('./compare-snapshots');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapshots-'));
}

function writeSnapshot(dir, filename, data) {
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(data));
}

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

test('formatPercentageChange shows up arrow and + prefix for positive change', () => {
  const result = formatPercentageChange(10);
  assert.ok(result.includes('\u2191'), 'should include up arrow');
  assert.ok(result.includes('+'), 'should include + prefix');
  assert.ok(result.includes('10%'));
});

test('formatPercentageChange shows down arrow for negative change', () => {
  const result = formatPercentageChange(-10);
  assert.ok(result.includes('\u2193'), 'should include down arrow');
  assert.ok(result.includes('10%'));
  assert.ok(!result.includes('+'), 'should not include + prefix');
});

test('formatPercentageChange shows right arrow for zero change', () => {
  const result = formatPercentageChange(0);
  assert.ok(result.includes('\u2192'), 'should include right arrow');
  assert.ok(result.includes('0%'));
});

test('formatPercentageChange passes through string labels unchanged', () => {
  assert.equal(formatPercentageChange(FIRST_RUN_LABEL), FIRST_RUN_LABEL);
  assert.equal(formatPercentageChange(NO_PRIOR_DATA_LABEL), NO_PRIOR_DATA_LABEL);
});

test('compareSnapshots throws when directory has no snapshot files', () => {
  const dir = makeTempDir();
  assert.throws(() => compareSnapshots(dir), /No snapshot files found/);
});

test('compareSnapshots returns first run comparison when only one snapshot exists', () => {
  const dir = makeTempDir();
  writeSnapshot(dir, 'weekly-2024-01-05.json', {
    date: '2024-01-05',
    uniqueVisits: 100,
    uniqueClones: 10,
    conversionRate: 10,
  });
  const result = compareSnapshots(dir);
  assert.equal(result.date, '2024-01-05');
  assert.equal(result.uniqueVisits.change, FIRST_RUN_LABEL);
  assert.equal(result.uniqueClones.change, FIRST_RUN_LABEL);
  assert.equal(result.conversionRate.change, FIRST_RUN_LABEL);
});

test('compareSnapshots uses most recent as current and second-most-recent as baseline', () => {
  const dir = makeTempDir();
  writeSnapshot(dir, 'weekly-2024-01-05.json', {
    date: '2024-01-05',
    uniqueVisits: 100,
    uniqueClones: 10,
    conversionRate: 10,
  });
  writeSnapshot(dir, 'weekly-2024-01-12.json', {
    date: '2024-01-12',
    uniqueVisits: 200,
    uniqueClones: 20,
    conversionRate: 10,
  });
  const result = compareSnapshots(dir);
  assert.equal(result.date, '2024-01-12');
  assert.equal(result.uniqueVisits.value, 200);
  assert.ok(result.uniqueVisits.change.includes('100%'), 'should show 100% increase');
  assert.ok(result.uniqueVisits.change.includes('\u2191'));
});

test('compareSnapshots handles no prior data when previous metric is 0', () => {
  const dir = makeTempDir();
  writeSnapshot(dir, 'weekly-2024-01-05.json', {
    date: '2024-01-05',
    uniqueVisits: 0,
    uniqueClones: 0,
    conversionRate: 0,
  });
  writeSnapshot(dir, 'weekly-2024-01-12.json', {
    date: '2024-01-12',
    uniqueVisits: 50,
    uniqueClones: 5,
    conversionRate: 10,
  });
  const result = compareSnapshots(dir);
  assert.equal(result.uniqueVisits.change, NO_PRIOR_DATA_LABEL);
  assert.equal(result.uniqueClones.change, NO_PRIOR_DATA_LABEL);
  assert.equal(result.conversionRate.change, NO_PRIOR_DATA_LABEL);
});

test('compareSnapshots sorts files by date so most recent is used as current', () => {
  const dir = makeTempDir();
  writeSnapshot(dir, 'weekly-2024-01-12.json', {
    date: '2024-01-12',
    uniqueVisits: 200,
    uniqueClones: 20,
    conversionRate: 10,
  });
  writeSnapshot(dir, 'weekly-2024-01-05.json', {
    date: '2024-01-05',
    uniqueVisits: 100,
    uniqueClones: 10,
    conversionRate: 10,
  });
  const result = compareSnapshots(dir);
  assert.equal(result.date, '2024-01-12', 'most recent should be current');
});

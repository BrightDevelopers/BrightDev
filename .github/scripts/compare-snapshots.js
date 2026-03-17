#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const SNAPSHOTS_DIR = 'metrics/snapshots';
const FIRST_RUN_LABEL = 'N/A (first run)';
const NO_PRIOR_DATA_LABEL = 'N/A (no prior data)';

function readSortedSnapshotFilenames(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('weekly-') && f.endsWith('.json'))
    .sort()
    .reverse();
}

function loadSnapshotFromFile(dir, filename) {
  return JSON.parse(fs.readFileSync(path.join(dir, filename), 'utf8'));
}

function calculateRawPercentageChange(current, previous) {
  if (previous === 0 && current > 0) return NO_PRIOR_DATA_LABEL;
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

function arrowForNumericChange(change) {
  if (change > 0) return '\u2191';
  if (change < 0) return '\u2193';
  return '\u2192';
}

function formatPercentageChange(change) {
  if (typeof change === 'string') return change;
  const arrow = arrowForNumericChange(change);
  const prefix = change > 0 ? '+' : '';
  return `${arrow} ${prefix}${change}%`;
}

function buildMetricChange(currentValue, previousValue) {
  const change = calculateRawPercentageChange(currentValue, previousValue);
  return { value: currentValue, change: formatPercentageChange(change) };
}

function buildComparisonFromBaseline(current, baseline) {
  return {
    date: current.date,
    uniqueVisits: buildMetricChange(current.uniqueVisits, baseline.uniqueVisits),
    uniqueClones: buildMetricChange(current.uniqueClones, baseline.uniqueClones),
    conversionRate: buildMetricChange(current.conversionRate, baseline.conversionRate),
  };
}

function buildFirstRunComparison(current) {
  return {
    date: current.date,
    uniqueVisits: { value: current.uniqueVisits, change: FIRST_RUN_LABEL },
    uniqueClones: { value: current.uniqueClones, change: FIRST_RUN_LABEL },
    conversionRate: { value: current.conversionRate, change: FIRST_RUN_LABEL },
  };
}

function compareSnapshots(snapshotsDir) {
  const filenames = readSortedSnapshotFilenames(snapshotsDir);
  if (filenames.length === 0) throw new Error('No snapshot files found');
  const current = loadSnapshotFromFile(snapshotsDir, filenames[0]);
  if (filenames.length === 1) return buildFirstRunComparison(current);
  const baseline = loadSnapshotFromFile(snapshotsDir, filenames[1]);
  return buildComparisonFromBaseline(current, baseline);
}

module.exports = {
  compareSnapshots,
  calculateRawPercentageChange,
  formatPercentageChange,
  buildFirstRunComparison,
  buildComparisonFromBaseline,
  FIRST_RUN_LABEL,
  NO_PRIOR_DATA_LABEL,
};

if (require.main === module) {
  const result = compareSnapshots(SNAPSHOTS_DIR);
  console.log(JSON.stringify(result, null, 2));
}

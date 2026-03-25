#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const SNAPSHOTS_DIR = 'metrics/snapshots';
const FIRST_RUN_LABEL = 'N/A (first run)';
const NO_PRIOR_DATA_LABEL = 'N/A (no prior data)';
const NO_DATA_LABEL = 'N/A';

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

function arrowForChange(change) {
  if (change > 0) return '\u2191';
  if (change < 0) return '\u2193';
  return '\u2192';
}

function formatPercentageChange(change) {
  if (typeof change === 'string') return change;
  const arrow = arrowForChange(change);
  const prefix = change > 0 ? '+' : '';
  return `${arrow} ${prefix}${change}%`;
}

function formatDelta(delta) {
  if (delta === 0) return '\u2192 no change';
  const arrow = arrowForChange(delta);
  const prefix = delta > 0 ? '+' : '';
  return `${arrow} ${prefix}${delta}`;
}

function buildMetricChange(currentValue, previousValue) {
  const change = calculateRawPercentageChange(currentValue, previousValue);
  return { value: currentValue, change: formatPercentageChange(change) };
}

function buildDeltaChange(currentValue, previousValue) {
  if (previousValue == null) {
    return { value: currentValue, change: FIRST_RUN_LABEL };
  }
  return { value: currentValue, change: formatDelta(currentValue - previousValue) };
}

function buildSafeMetricChange(currentValue, previousValue) {
  if (currentValue == null) return { value: null, change: NO_DATA_LABEL };
  if (previousValue == null) return { value: currentValue, change: FIRST_RUN_LABEL };
  return buildMetricChange(currentValue, previousValue);
}

function buildComparisonFromBaseline(current, baseline) {
  return {
    date: current.date,
    uniqueVisits: buildMetricChange(current.uniqueVisits, baseline.uniqueVisits),
    stars: buildDeltaChange(current.stars, baseline.stars),
    forks: buildDeltaChange(current.forks, baseline.forks),
    issuesOpenedThisWeek: buildSafeMetricChange(current.issuesOpenedThisWeek, baseline.issuesOpenedThisWeek),
    externalPrsThisWeek: buildSafeMetricChange(current.externalPrsThisWeek, baseline.externalPrsThisWeek),
    topReferrers: current.topReferrers || [],
    topPaths: current.topPaths || [],
  };
}

function buildFirstRunMetric(value) {
  if (value == null) return { value: null, change: NO_DATA_LABEL };
  return { value, change: FIRST_RUN_LABEL };
}

function buildFirstRunComparison(current) {
  return {
    date: current.date,
    uniqueVisits: buildFirstRunMetric(current.uniqueVisits),
    stars: buildFirstRunMetric(current.stars),
    forks: buildFirstRunMetric(current.forks),
    issuesOpenedThisWeek: buildFirstRunMetric(current.issuesOpenedThisWeek),
    externalPrsThisWeek: buildFirstRunMetric(current.externalPrsThisWeek),
    topReferrers: current.topReferrers || [],
    topPaths: current.topPaths || [],
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
  formatDelta,
  buildFirstRunComparison,
  buildComparisonFromBaseline,
  buildMetricChange,
  buildDeltaChange,
  buildSafeMetricChange,
  FIRST_RUN_LABEL,
  NO_PRIOR_DATA_LABEL,
  NO_DATA_LABEL,
};

if (require.main === module) {
  const result = compareSnapshots(SNAPSHOTS_DIR);
  console.log(JSON.stringify(result, null, 2));
}

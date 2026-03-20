#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const api = require('./github-api');

const SNAPSHOTS_DIR = 'metrics/snapshots';

function getRepoContext() {
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
  const token = process.env.GITHUB_TOKEN;
  return { owner, repo, token };
}

function formatDateAsYYYYMMDD(date) {
  return date.toISOString().split('T')[0];
}

function calculateConversionRate(clones, visits) {
  if (visits === 0) return 0;
  return Math.round((clones / visits) * 100 * 100) / 100;
}

async function fetchAllMetrics(owner, repo, token) {
  const since = api.weekAgoDate();
  const [views, clones, stats, referrers, paths, issues, prs, issueStats, responseHours] =
    await Promise.all([
      api.fetchTrafficViews(owner, repo, token),
      api.fetchTrafficClones(owner, repo, token),
      api.fetchRepoStats(owner, repo, token),
      api.fetchTopReferrers(owner, repo, token),
      api.fetchTopPaths(owner, repo, token),
      api.fetchIssuesOpenedSince(owner, repo, token, since),
      api.fetchExternalPrsSince(owner, repo, token, since),
      api.fetchOpenIssueStats(owner, repo, token),
      api.fetchAvgFirstResponseHours(owner, repo, token),
    ]);
  return {
    uniqueVisits: views,
    uniqueClones: clones,
    ...stats,
    topReferrers: referrers,
    topPaths: paths,
    issuesOpenedThisWeek: issues,
    externalPrsThisWeek: prs,
    ...issueStats,
    avgFirstResponseHours: responseHours,
  };
}

function buildSnapshot(date, metrics) {
  return {
    date,
    uniqueVisits: metrics.uniqueVisits,
    uniqueClones: metrics.uniqueClones,
    conversionRate: calculateConversionRate(metrics.uniqueClones, metrics.uniqueVisits),
    stars: metrics.stars,
    forks: metrics.forks,
    issuesOpenedThisWeek: metrics.issuesOpenedThisWeek,
    externalPrsThisWeek: metrics.externalPrsThisWeek,
    openIssueCount: metrics.openIssueCount,
    openIssueAvgAgeDays: metrics.openIssueAvgAgeDays,
    avgFirstResponseHours: metrics.avgFirstResponseHours,
    topReferrers: metrics.topReferrers,
    topPaths: metrics.topPaths,
  };
}

function writeSnapshotToFile(snapshot) {
  const filePath = path.join(SNAPSHOTS_DIR, `weekly-${snapshot.date}.json`);
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
  return filePath;
}

function configureGitUser() {
  execSync('git config user.name "github-actions[bot]"');
  execSync('git config user.email "github-actions[bot]@users.noreply.github.com"');
}

function commitAndPushSnapshot(date, filePath) {
  configureGitUser();
  execSync(`git add ${filePath}`);
  execSync(`git commit -m "chore: add weekly traffic snapshot ${date}"`);
  execSync('git push');
}

async function main() {
  const { owner, repo, token } = getRepoContext();
  const date = formatDateAsYYYYMMDD(new Date());
  const metrics = await fetchAllMetrics(owner, repo, token);
  const snapshot = buildSnapshot(date, metrics);
  const filePath = writeSnapshotToFile(snapshot);
  commitAndPushSnapshot(date, filePath);
  console.log(`Snapshot written and committed: ${filePath}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

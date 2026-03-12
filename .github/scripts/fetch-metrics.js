#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GITHUB_API_BASE = 'https://api.github.com';
const SNAPSHOTS_DIR = 'metrics/snapshots';

function getRepoContext() {
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
  const token = process.env.GITHUB_TOKEN;
  return { owner, repo, token };
}

async function fetchTrafficEndpoint(owner, repo, token, endpoint) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/traffic/${endpoint}?per=week`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API error ${response.status} on ${endpoint}: ${await response.text()}`);
  }
  return response.json();
}

async function fetchUniqueViews(owner, repo, token) {
  const data = await fetchTrafficEndpoint(owner, repo, token, 'views');
  return data.uniques;
}

async function fetchUniqueClones(owner, repo, token) {
  const data = await fetchTrafficEndpoint(owner, repo, token, 'clones');
  return data.uniques;
}

function calculateConversionRate(uniqueClones, uniqueVisits) {
  if (uniqueVisits === 0) return 0;
  return Math.round((uniqueClones / uniqueVisits) * 100 * 100) / 100;
}

function formatDateAsYYYYMMDD(date) {
  return date.toISOString().split('T')[0];
}

function buildSnapshot(date, uniqueVisits, uniqueClones) {
  return {
    date,
    uniqueVisits,
    uniqueClones,
    conversionRate: calculateConversionRate(uniqueClones, uniqueVisits),
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
  const [uniqueVisits, uniqueClones] = await Promise.all([
    fetchUniqueViews(owner, repo, token),
    fetchUniqueClones(owner, repo, token),
  ]);
  const snapshot = buildSnapshot(date, uniqueVisits, uniqueClones);
  const filePath = writeSnapshotToFile(snapshot);
  commitAndPushSnapshot(date, filePath);
  console.log(`Snapshot written and committed: ${filePath}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

#!/usr/bin/env node

'use strict';

const GITHUB_API_BASE = 'https://api.github.com';
const DAYS_IN_WEEK = 7;
const TOP_LIMIT = 5;

function buildAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function githubGet(url, token) {
  const response = await fetch(url, { headers: buildAuthHeaders(token) });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body}`);
  }
  return response.json();
}

function repoUrl(owner, repo, endpoint) {
  return `${GITHUB_API_BASE}/repos/${owner}/${repo}${endpoint}`;
}

function searchUrl(query) {
  return `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(query)}`;
}

function weekAgoDate() {
  const date = new Date();
  date.setDate(date.getDate() - DAYS_IN_WEEK);
  return date.toISOString().split('T')[0];
}

async function fetchTrafficViews(owner, repo, token) {
  const data = await githubGet(repoUrl(owner, repo, '/traffic/views?per=week'), token);
  return data.uniques;
}

async function fetchTrafficClones(owner, repo, token) {
  const data = await githubGet(repoUrl(owner, repo, '/traffic/clones?per=week'), token);
  return data.uniques;
}

async function fetchTopReferrers(owner, repo, token) {
  const data = await githubGet(repoUrl(owner, repo, '/traffic/popular/referrers'), token);
  return data.slice(0, TOP_LIMIT).map(pickReferrerFields);
}

function pickReferrerFields(entry) {
  return { referrer: entry.referrer, uniques: entry.uniques };
}

async function fetchTopPaths(owner, repo, token) {
  const data = await githubGet(repoUrl(owner, repo, '/traffic/popular/paths'), token);
  return data.slice(0, TOP_LIMIT).map(pickPathFields);
}

function pickPathFields(entry) {
  return { path: entry.path, uniques: entry.uniques };
}

async function fetchRepoStats(owner, repo, token) {
  const data = await githubGet(repoUrl(owner, repo, ''), token);
  return { stars: data.stargazers_count, forks: data.forks_count };
}

async function fetchIssuesOpenedSince(owner, repo, token, since) {
  const query = `repo:${owner}/${repo} type:issue created:>=${since}`;
  const data = await githubGet(searchUrl(query), token);
  return data.total_count;
}

async function fetchExternalPrsSince(owner, repo, token, since) {
  const query = `repo:${owner}/${repo} type:pr created:>=${since}`;
  const data = await githubGet(searchUrl(query), token);
  return countExternalItems(data.items || []);
}

function isExternalContribution(item) {
  const internal = ['OWNER', 'MEMBER', 'COLLABORATOR'];
  return !internal.includes(item.author_association);
}

function countExternalItems(items) {
  return items.filter(isExternalContribution).length;
}

function isRealIssue(item) {
  return !item.pull_request;
}

async function fetchOpenIssues(owner, repo, token) {
  const url = repoUrl(owner, repo, '/issues?state=open&per_page=100');
  const data = await githubGet(url, token);
  return data.filter(isRealIssue);
}

function daysBetween(startDate, endDate) {
  return (endDate - startDate) / (1000 * 60 * 60 * 24);
}

function averageAgeDays(issues) {
  if (issues.length === 0) return 0;
  const now = new Date();
  const total = issues.reduce(
    (sum, i) => sum + daysBetween(new Date(i.created_at), now),
    0
  );
  return Math.round((total / issues.length) * 10) / 10;
}

async function fetchOpenIssueStats(owner, repo, token) {
  const issues = await fetchOpenIssues(owner, repo, token);
  return {
    openIssueCount: issues.length,
    openIssueAvgAgeDays: averageAgeDays(issues),
  };
}

async function fetchFirstCommentDate(owner, repo, token, issueNumber) {
  const url = repoUrl(owner, repo, `/issues/${issueNumber}/comments?per_page=1`);
  const comments = await githubGet(url, token);
  if (comments.length === 0) return null;
  return new Date(comments[0].created_at);
}

function hoursBetween(startDate, endDate) {
  return (endDate - startDate) / (1000 * 60 * 60);
}

function averageOfValues(values) {
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

async function fetchResponseHoursForIssue(owner, repo, token, issue) {
  const firstComment = await fetchFirstCommentDate(owner, repo, token, issue.number);
  if (!firstComment) return null;
  return hoursBetween(new Date(issue.created_at), firstComment);
}

async function fetchRespondedIssuesSince(owner, repo, token, since) {
  const query = `repo:${owner}/${repo} type:issue created:>=${since} comments:>0`;
  const data = await githubGet(searchUrl(query), token);
  return data.items || [];
}

async function fetchAvgFirstResponseHours(owner, repo, token) {
  const since = weekAgoDate();
  const issues = await fetchRespondedIssuesSince(owner, repo, token, since);
  if (issues.length === 0) return null;
  const hours = await Promise.all(
    issues.map((i) => fetchResponseHoursForIssue(owner, repo, token, i))
  );
  return averageOfValues(hours.filter((h) => h !== null));
}

module.exports = {
  fetchTrafficViews,
  fetchTrafficClones,
  fetchTopReferrers,
  fetchTopPaths,
  fetchRepoStats,
  fetchIssuesOpenedSince,
  fetchExternalPrsSince,
  fetchOpenIssueStats,
  fetchAvgFirstResponseHours,
  isExternalContribution,
  countExternalItems,
  isRealIssue,
  averageAgeDays,
  averageOfValues,
  daysBetween,
  hoursBetween,
  weekAgoDate,
  githubGet,
  pickReferrerFields,
  pickPathFields,
};

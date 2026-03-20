'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  isExternalContribution,
  countExternalItems,
  isRealIssue,
  averageAgeDays,
  averageOfValues,
  daysBetween,
  hoursBetween,
  pickReferrerFields,
  pickPathFields,
} = require('./github-api');

test('isExternalContribution returns false for OWNER', () => {
  assert.equal(isExternalContribution({ author_association: 'OWNER' }), false);
});

test('isExternalContribution returns false for MEMBER', () => {
  assert.equal(isExternalContribution({ author_association: 'MEMBER' }), false);
});

test('isExternalContribution returns false for COLLABORATOR', () => {
  assert.equal(isExternalContribution({ author_association: 'COLLABORATOR' }), false);
});

test('isExternalContribution returns true for CONTRIBUTOR', () => {
  assert.equal(isExternalContribution({ author_association: 'CONTRIBUTOR' }), true);
});

test('isExternalContribution returns true for NONE', () => {
  assert.equal(isExternalContribution({ author_association: 'NONE' }), true);
});

test('countExternalItems counts only external contributions', () => {
  const items = [
    { author_association: 'OWNER' },
    { author_association: 'NONE' },
    { author_association: 'CONTRIBUTOR' },
    { author_association: 'MEMBER' },
  ];
  assert.equal(countExternalItems(items), 2);
});

test('countExternalItems returns 0 for empty array', () => {
  assert.equal(countExternalItems([]), 0);
});

test('isRealIssue returns true when no pull_request field', () => {
  assert.equal(isRealIssue({ id: 1 }), true);
});

test('isRealIssue returns false when pull_request field is present', () => {
  assert.equal(isRealIssue({ id: 1, pull_request: { url: '...' } }), false);
});

test('daysBetween returns correct number of days', () => {
  const start = new Date('2024-01-01T00:00:00Z');
  const end = new Date('2024-01-08T00:00:00Z');
  assert.equal(daysBetween(start, end), 7);
});

test('hoursBetween returns correct number of hours', () => {
  const start = new Date('2024-01-01T00:00:00Z');
  const end = new Date('2024-01-01T06:00:00Z');
  assert.equal(hoursBetween(start, end), 6);
});

test('averageAgeDays returns 0 for empty array', () => {
  assert.equal(averageAgeDays([]), 0);
});

test('averageOfValues returns null for empty array', () => {
  assert.equal(averageOfValues([]), null);
});

test('averageOfValues returns average rounded to 1 decimal', () => {
  assert.equal(averageOfValues([1, 2, 3]), 2);
  assert.equal(averageOfValues([1.5, 2.5]), 2);
  assert.equal(averageOfValues([1, 2]), 1.5);
});

test('pickReferrerFields extracts referrer and uniques', () => {
  const entry = { referrer: 'google.com', uniques: 10, count: 20, extra: 'ignored' };
  assert.deepEqual(pickReferrerFields(entry), { referrer: 'google.com', uniques: 10 });
});

test('pickPathFields extracts path and uniques', () => {
  const entry = { path: '/README.md', uniques: 25, count: 50, title: 'ignored' };
  assert.deepEqual(pickPathFields(entry), { path: '/README.md', uniques: 25 });
});

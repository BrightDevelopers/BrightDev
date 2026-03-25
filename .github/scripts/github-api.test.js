'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  isExternalContribution,
  countExternalItems,
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

test('pickReferrerFields extracts referrer and uniques', () => {
  const entry = { referrer: 'google.com', uniques: 10, count: 20, extra: 'ignored' };
  assert.deepEqual(pickReferrerFields(entry), { referrer: 'google.com', uniques: 10 });
});

test('pickPathFields extracts path and uniques', () => {
  const entry = { path: '/README.md', uniques: 25, count: 50, title: 'ignored' };
  assert.deepEqual(pickPathFields(entry), { path: '/README.md', uniques: 25 });
});

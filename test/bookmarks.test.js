import test from 'node:test';
import assert from 'node:assert/strict';
import { createBookmarkSlug, formatBookmark, loadBookmarks, normalizeUrl } from '../src/lib/bookmarks.js';

test('normalizes URLs with and without https to the same value', () => {
  assert.equal(normalizeUrl('www.example.com'), 'https://www.example.com');
  assert.equal(normalizeUrl('https://www.example.com'), 'https://www.example.com');
});

test('recovers from empty, corrupted, legacy, and non-array storage values', () => {
  for (const rawValue of [
    null,
    '',
    '{not json',
    JSON.stringify([{ href: 'https://example.com', code: 'mona-7fk2' }]),
    JSON.stringify({ url: 'https://example.com', slug: 'mona-7fk2' }),
    JSON.stringify('legacy bookmarks'),
  ]) {
    assert.doesNotThrow(() => loadBookmarks(rawValue));
    assert.deepEqual(loadBookmarks(rawValue), []);
  }
});

test('drops malformed records while keeping valid saved bookmarks', () => {
  const valid = { url: 'https://example.com', slug: 'mona-7fk2' };
  const loaded = loadBookmarks(JSON.stringify([
    valid,
    { url: 'javascript:alert(1)', slug: 'mona-0000' },
    { url: 'https://example.com', slug: 'old-format' },
    null,
  ]));

  assert.deepEqual(loaded, [valid]);
});

test('formats a saved bookmark with the exact visible separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2',
  );
});

test('generates unique short base62 Mona slugs', () => {
  const first = createBookmarkSlug();
  const second = createBookmarkSlug([{ slug: first }]);

  assert.match(first, /^mona-[0-9A-Za-z]{4}$/);
  assert.match(second, /^mona-[0-9A-Za-z]{4}$/);
  assert.notEqual(second, first);
});

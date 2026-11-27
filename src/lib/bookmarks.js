const slugPattern = /^mona-[0-9A-Za-z]{4}$/;

export function normalizeUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError('A URL is required.');
  }

  const input = value.trim();
  const candidate = input.startsWith('//')
    ? `https:${input}`
    : /^[a-z][a-z\d+.-]*:\/\//i.test(input)
      ? input
      : /^https?:/i.test(input)
        ? input
        : `https://${input}`;
  const url = new URL(candidate);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError('Only HTTP and HTTPS URLs are supported.');
  }

  if (url.pathname === '/' && !url.search && !url.hash) {
    return url.origin;
  }
  return url.href;
}

export function isBookmark(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (typeof value.url !== 'string' || typeof value.slug !== 'string' || !slugPattern.test(value.slug)) {
    return false;
  }

  try {
    return normalizeUrl(value.url) === value.url;
  } catch {
    return false;
  }
}

export function loadBookmarks(rawValue) {
  if (typeof rawValue !== 'string' || rawValue === '') return [];

  try {
    const value = JSON.parse(rawValue);
    return Array.isArray(value) ? value.filter(isBookmark) : [];
  } catch {
    return [];
  }
}

export function formatBookmark(bookmark) {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

export function createBookmarkSlug(bookmarks = []) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const usedSlugs = new Set(bookmarks.map(({ slug }) => slug));
  let slug;

  do {
    const bytes = new Uint8Array(4);
    globalThis.crypto.getRandomValues(bytes);
    slug = `mona-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')}`;
  } while (usedSlugs.has(slug));

  return slug;
}

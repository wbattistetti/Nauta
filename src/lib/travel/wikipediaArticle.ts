/**
 * Italian Wikipedia full article HTML — fetch, normalize, and link parsing.
 */

const WIKI_IT_MOBILE_HTML_BASE = 'https://it.wikipedia.org/api/rest_v1/page/mobile-html/';
const WIKI_IT_ORIGIN = 'https://it.wikipedia.org';

/** REST mobile-html endpoint URL for a Wikipedia article title. */
export function wikipediaMobileHtmlApiUrl(wikiTitle: string): string {
  const slug = wikiTitle.trim().replace(/ /g, '_');
  if (!slug) {
    throw new Error('wikipediaMobileHtmlApiUrl: wikiTitle is required');
  }
  return `${WIKI_IT_MOBILE_HTML_BASE}${encodeURIComponent(slug).replace(/%2F/g, '/')}`;
}

/** Extract article body HTML from a mobile-html document. */
export function extractWikipediaArticleBody(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!match?.[1]?.trim()) {
    throw new Error('extractWikipediaArticleBody: missing body');
  }
  return normalizeWikipediaArticleHtml(match[1]);
}

/** Fix protocol-relative asset URLs for in-app rendering. */
export function normalizeWikipediaArticleHtml(fragment: string): string {
  return fragment.replace(/\s(src|href)=["']\/\//g, ' $1="https://');
}

/**
 * Parse an Italian Wikipedia article title from a mobile-html link href.
 * Returns null for anchors, edit links, and non-wiki URLs.
 */
export function parseItalianWikipediaArticleTitle(href: string): string | null {
  const decoded = href.replace(/&amp;/g, '&').trim();
  if (!decoded || decoded.startsWith('#')) return null;
  if (decoded.includes('action=edit')) return null;

  let path = decoded;
  if (path.startsWith('./')) {
    path = path.slice(2);
  } else if (path.startsWith('/wiki/')) {
    path = path.slice(6);
  } else if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      if (!url.hostname.endsWith('wikipedia.org')) return null;
      path = url.pathname.replace(/^\/wiki\//, '');
    } catch {
      return null;
    }
  } else {
    return null;
  }

  path = path.split('#')[0]?.split('?')[0] ?? '';
  if (!path) return null;

  try {
    return decodeURIComponent(path.replace(/_/g, ' ')).trim() || null;
  } catch {
    return path.replace(/_/g, ' ').trim() || null;
  }
}

/** Fetch Italian Wikipedia mobile HTML body for an article title. */
export async function fetchWikipediaArticleHtml(
  wikiTitle: string,
  signal?: AbortSignal
): Promise<string> {
  const url = wikipediaMobileHtmlApiUrl(wikiTitle);
  const res = await fetch(url, {
    signal,
    headers: { Accept: 'text/html; charset=utf-8' },
  });

  if (!res.ok) {
    throw new Error(`fetchWikipediaArticleHtml: HTTP ${res.status}`);
  }

  return extractWikipediaArticleBody(await res.text());
}

/** Build absolute Wikipedia article URL from a title. */
export function wikipediaItPageUrl(wikiTitle: string): string {
  const slug = wikiTitle.trim().replace(/ /g, '_');
  return `${WIKI_IT_ORIGIN}/wiki/${encodeURIComponent(slug).replace(/%2F/g, '/')}`;
}

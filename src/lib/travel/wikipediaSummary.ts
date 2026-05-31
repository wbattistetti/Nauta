/**
 * Italian Wikipedia REST summary — fetch and parse for in-app place sheets.
 */

const WIKI_IT_SUMMARY_BASE = 'https://it.wikipedia.org/api/rest_v1/page/summary/';

export type WikipediaPlaceTarget = {
  label: string;
  wikiTitle: string;
  wikiSection?: string;
  sectionTitle?: string;
};

export type WikipediaSummary = {
  title: string;
  extract: string;
  pageUrl: string;
  thumbnailUrl?: string;
};

/** REST summary endpoint URL for a Wikipedia article title. */
export function wikipediaSummaryApiUrl(wikiTitle: string): string {
  const slug = wikiTitle.trim().replace(/ /g, '_');
  if (!slug) {
    throw new Error('wikipediaSummaryApiUrl: wikiTitle is required');
  }
  return `${WIKI_IT_SUMMARY_BASE}${encodeURIComponent(slug).replace(/%2F/g, '/')}`;
}

/** Parse Wikimedia REST summary JSON into a stable shape. */
export function parseWikipediaSummaryResponse(json: unknown): WikipediaSummary {
  if (!json || typeof json !== 'object') {
    throw new Error('parseWikipediaSummaryResponse: invalid JSON');
  }

  const data = json as Record<string, unknown>;
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const extract = typeof data.extract === 'string' ? data.extract.trim() : '';
  const contentUrls = data.content_urls as Record<string, Record<string, string>> | undefined;
  const pageUrl = contentUrls?.desktop?.page?.trim() ?? '';

  if (!title || !extract || !pageUrl) {
    throw new Error('parseWikipediaSummaryResponse: missing title, extract, or page URL');
  }

  const thumbnail = data.thumbnail as Record<string, unknown> | undefined;
  const thumbnailUrl =
    typeof thumbnail?.source === 'string' && thumbnail.source.trim()
      ? thumbnail.source.trim()
      : undefined;

  return { title, extract, pageUrl, thumbnailUrl };
}

/** Fetch Italian Wikipedia summary for an article title. */
export async function fetchWikipediaSummary(
  wikiTitle: string,
  signal?: AbortSignal
): Promise<WikipediaSummary> {
  const url = wikipediaSummaryApiUrl(wikiTitle);
  const res = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`fetchWikipediaSummary: HTTP ${res.status}`);
  }

  return parseWikipediaSummaryResponse(await res.json());
}

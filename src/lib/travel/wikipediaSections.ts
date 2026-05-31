/**
 * Italian Wikipedia sections — fetch verified section HTML via Action API.
 */

const WIKI_IT_API = 'https://it.wikipedia.org/w/api.php';
const WIKI_USER_AGENT = 'NautaTravel/1.0 (contact: nauta-app; +https://nauta.app)';

export type WikipediaSectionIndex = {
  line: string;
  anchor: string;
  index: string;
};

/** Fetch section index for an article title. */
export async function fetchWikipediaSectionIndex(
  wikiTitle: string,
  signal?: AbortSignal
): Promise<WikipediaSectionIndex[]> {
  const url = new URL(WIKI_IT_API);
  url.searchParams.set('action', 'parse');
  url.searchParams.set('page', wikiTitle.trim().replace(/ /g, '_'));
  url.searchParams.set('prop', 'sections');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const res = await fetch(url, {
    signal,
    headers: { 'User-Agent': WIKI_USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`fetchWikipediaSectionIndex: HTTP ${res.status}`);
  }

  const data = await res.json();
  const raw = data?.parse?.sections;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((s: Record<string, unknown>) => ({
      line: String(s.line ?? '').trim(),
      anchor: String(s.anchor ?? s.linkAnchor ?? '').trim(),
      index: String(s.index ?? '').trim(),
    }))
    .filter((s) => s.line && s.anchor && s.index);
}

/** Find a section by verified anchor. */
export function findWikipediaSectionByAnchor(
  sections: WikipediaSectionIndex[],
  anchor: string
): WikipediaSectionIndex | null {
  const target = anchor.trim();
  if (!target) return null;
  return sections.find((s) => s.anchor === target) ?? null;
}

/** Fix protocol-relative asset URLs in Wikipedia HTML fragments. */
export function normalizeWikipediaSectionHtml(fragment: string): string {
  return fragment.replace(/\s(src|href)=["']\/\//g, ' $1="https://');
}

/** Fetch HTML for one verified section index. */
export async function fetchWikipediaSectionHtml(
  wikiTitle: string,
  sectionIndex: string,
  signal?: AbortSignal
): Promise<string> {
  const url = new URL(WIKI_IT_API);
  url.searchParams.set('action', 'parse');
  url.searchParams.set('page', wikiTitle.trim().replace(/ /g, '_'));
  url.searchParams.set('section', sectionIndex);
  url.searchParams.set('prop', 'text');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const res = await fetch(url, {
    signal,
    headers: { 'User-Agent': WIKI_USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`fetchWikipediaSectionHtml: HTTP ${res.status}`);
  }

  const data = await res.json();
  const html = data?.parse?.text?.['*'];
  if (typeof html !== 'string' || !html.trim()) {
    throw new Error('fetchWikipediaSectionHtml: empty section HTML');
  }

  return normalizeWikipediaSectionHtml(html);
}

/** Load section HTML by verified anchor — throws if anchor missing. */
export async function fetchWikipediaSectionHtmlByAnchor(
  wikiTitle: string,
  anchor: string,
  signal?: AbortSignal
): Promise<{ html: string; sectionTitle: string }> {
  const sections = await fetchWikipediaSectionIndex(wikiTitle, signal);
  const section = findWikipediaSectionByAnchor(sections, anchor);
  if (!section) {
    throw new Error(`fetchWikipediaSectionHtmlByAnchor: unknown anchor "${anchor}"`);
  }
  const html = await fetchWikipediaSectionHtml(wikiTitle, section.index, signal);
  return { html, sectionTitle: section.line };
}

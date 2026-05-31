/**
 * Segment stop notes text and build Italian Wikipedia URLs for place links.
 */
import type { StopPlaceLink } from '../../types/travelState';

export type StopNotesSegment =
  | { type: 'text'; text: string }
  | {
      type: 'link';
      label: string;
      wikiTitle: string;
      wikiSection?: string;
      sectionTitle?: string;
      href: string;
    };

const WIKI_IT_BASE = 'https://it.wikipedia.org/wiki/';

/** Italian Wikipedia article URL from article title. */
export function wikipediaItUrl(wikiTitle: string): string {
  const slug = wikiTitle.trim().replace(/ /g, '_');
  if (!slug) return WIKI_IT_BASE;
  return `${WIKI_IT_BASE}${encodeURIComponent(slug).replace(/%2F/g, '/')}`;
}

/**
 * Split notes into plain text and link segments (longest label match first).
 */
export function segmentStopNotes(notes: string, placeLinks: StopPlaceLink[] | undefined): StopNotesSegment[] {
  const text = notes;
  if (!text || !placeLinks?.length) {
    return text ? [{ type: 'text', text }] : [];
  }

  const links = [...placeLinks]
    .filter((l) => l.label.trim().length >= 2)
    .sort((a, b) => b.label.length - a.label.length);

  if (!links.length) return [{ type: 'text', text }];

  const segments: StopNotesSegment[] = [];
  let pos = 0;

  while (pos < text.length) {
    let best: { index: number; link: StopPlaceLink } | null = null;

    for (const link of links) {
      const idx = text.indexOf(link.label, pos);
      if (idx === -1) continue;
      if (!best || idx < best.index || (idx === best.index && link.label.length > best.link.label.length)) {
        best = { index: idx, link };
      }
    }

    if (!best) {
      segments.push({ type: 'text', text: text.slice(pos) });
      break;
    }

    if (best.index > pos) {
      segments.push({ type: 'text', text: text.slice(pos, best.index) });
    }

    const wikiTitle = best.link.wikiTitle.trim() || best.link.label.trim();
    const segment: StopNotesSegment = {
      type: 'link',
      label: best.link.label,
      wikiTitle,
      href: wikipediaItUrl(wikiTitle),
    };
    const wikiSection = best.link.wikiSection?.trim();
    const sectionTitle = best.link.sectionTitle?.trim();
    if (wikiSection) segment.wikiSection = wikiSection;
    if (sectionTitle) segment.sectionTitle = sectionTitle;
    segments.push(segment);
    pos = best.index + best.link.label.length;
  }

  return segments.length ? segments : [{ type: 'text', text }];
}

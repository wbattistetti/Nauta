/**
 * Validate stop placeLinks against Italian Wikipedia — no invented titles or sections.
 */

const WIKI_IT_ORIGIN = 'https://it.wikipedia.org';
const WIKI_IT_SUMMARY = `${WIKI_IT_ORIGIN}/api/rest_v1/page/summary/`;
const WIKI_IT_API = `${WIKI_IT_ORIGIN}/w/api.php`;
const WIKI_USER_AGENT = 'NautaTravel/1.0 (contact: nauta-app; +https://nauta.app)';

const STOPWORDS = new Set([
  'che',
  'con',
  'del',
  'della',
  'dei',
  'delle',
  'degli',
  'dei',
  'una',
  'uno',
  'sono',
  'per',
  'tra',
  'fra',
  'gli',
  'les',
  'the',
  'and',
  'dei',
  'suo',
  'sua',
  'sui',
  'sul',
  'sulla',
  'nella',
  'nelle',
  'nel',
  'dei',
  'de',
  'di',
  'da',
  'al',
  'alla',
  'alle',
  'dei',
  'degli',
  'come',
  'anche',
  'più',
  'poco',
  'molto',
  'tutto',
  'tutta',
  'tutti',
  'delle',
  'della',
  'delle',
  'dell',
  'dall',
  'dalla',
  'dalle',
  'dallo',
  'degli',
  'dei',
  'dei',
  'dei',
  'dei',
]);

const GENERIC_TOPIC_TOKENS = new Set([
  'acqua',
  'calda',
  'caldo',
  'fredda',
  'freddo',
  'terme',
  'termale',
  'termali',
  'naturali',
  'naturale',
  'centro',
  'storico',
  'storica',
  'cibo',
  'locale',
  'locali',
  'tipico',
  'tipica',
  'vino',
  'paese',
  'citta',
  'regione',
  'valle',
  'monte',
  'lago',
  'fiume',
  'chiese',
  'chiesa',
  'piazza',
  'strada',
  'via',
]);

const SKIP_SECTION_LINES = new Set([
  'note',
  'voci correlate',
  'altri progetti',
  'collegamenti esterni',
  "galleria d'immagini",
  'bibliografia',
  'Bibliografia',
]);

/** @param {string} title */
export function wikiTitleToSlug(title) {
  const slug = String(title ?? '')
    .trim()
    .replace(/ /g, '_');
  if (!slug) throw new Error('wikiTitleToSlug: empty title');
  return encodeURIComponent(slug).replace(/%2F/g, '/');
}

/** @param {string} text */
export function stripHtml(text) {
  return String(text ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** @param {string} text */
export function normalizeForMatch(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/['’]/g, "'");
}

/** @param {string} text */
export function tokenizeForMatch(text) {
  const norm = normalizeForMatch(text).replace(/[^a-z0-9\s']/g, ' ');
  return norm
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

/**
 * @param {string} label
 * @param {string} haystack
 */
export function countLabelTokenHits(label, haystack) {
  const tokens = tokenizeForMatch(label);
  const normHay = normalizeForMatch(haystack);
  let hits = 0;
  for (const token of tokens) {
    if (normHay.includes(token)) hits += 1;
  }
  return hits;
}

/** Distinctive tokens for contextual matching — excludes overly generic words. */
export function strongLabelTokens(label) {
  return tokenizeForMatch(label).filter(
    (token) => token.length >= 5 && !GENERIC_TOPIC_TOKENS.has(token)
  );
}

/** @param {string} label @param {string} haystack */
export function countStrongLabelTokenHits(label, haystack) {
  const tokens = strongLabelTokens(label);
  if (!tokens.length) return 0;
  const normHay = normalizeForMatch(haystack);
  let hits = 0;
  for (const token of tokens) {
    if (normHay.includes(token)) hits += 1;
  }
  return hits;
}

/**
 * Evidence that a section belongs to this stop/topic — avoids generic false positives.
 * @param {string} label
 * @param {string} line
 * @param {string} body
 * @param {string} stopName
 * @param {string} notes
 * @param {string} wikiTitle
 */
export function labelMatchesSectionEvidence(label, line, body, stopName, notes, wikiTitle) {
  const haystack = `${line} ${body}`;
  if (countStrongLabelTokenHits(label, haystack) >= 1) return true;

  const genericHits = countLabelTokenHits(label, haystack);
  if (genericHits < 2) return false;

  if (placeNameInNotes(notes, wikiTitle)) return true;

  const stopNorm = normalizeForMatch(stopName);
  const bodyNorm = normalizeForMatch(body);
  if (stopNorm.length >= 5 && bodyNorm.includes(stopNorm)) return true;

  const stopTokens = tokenizeForMatch(stopName).filter((token) => token.length >= 5);
  return stopTokens.some((token) => bodyNorm.includes(token));
}

/** @param {string} wikiTitle */
export function isGenericWikiTitle(wikiTitle) {
  const tokens = tokenizeForMatch(wikiTitle);
  if (!tokens.length) return true;
  return tokens.every((token) => GENERIC_TOPIC_TOKENS.has(token));
}

/** @param {string} notes @param {string} wikiTitle */
export function placeNameInNotes(notes, wikiTitle) {
  if (!notes || !wikiTitle) return false;
  if (notes.includes(wikiTitle)) return true;
  if (isGenericWikiTitle(wikiTitle)) return false;

  const titleNorm = normalizeForMatch(wikiTitle);
  const notesNorm = normalizeForMatch(notes);
  if (titleNorm.length < 3) return false;

  const escaped = titleNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?:^|[\\s,.:;()«»"'])${escaped}(?:$|[\\s,.:;()«»"'])`);
  return re.test(notesNorm);
}

/**
 * Contextual links must map to a place/topic evidenced in notes or a verified section.
 * @param {string} label
 * @param {string} wikiTitle
 * @param {string} notes
 * @param {string} stopName
 * @param {Record<string, unknown>} cache
 */
export async function isAcceptedContextualTitle(label, wikiTitle, notes, stopName, cache = {}) {
  if (normalizeForMatch(label) === normalizeForMatch(wikiTitle)) return true;
  if (placeNameInNotes(notes, wikiTitle)) return true;

  const section = await resolveVerifiedSection(label, wikiTitle, undefined, cache, notes, stopName);
  return Boolean(section);
}

/** @param {string} label @param {string} notes */
export function labelAppearsInNotes(label, notes) {
  if (!label || !notes) return false;
  return notes.includes(label);
}

/**
 * @param {string} label
 * @param {string} line
 * @param {string} [bodyText]
 */
export function scoreSectionCandidate(label, line, bodyText = '') {
  const labelTokens = tokenizeForMatch(label);
  if (!labelTokens.length) return 0;

  const lineNorm = normalizeForMatch(line);
  const bodyNorm = normalizeForMatch(bodyText);
  let score = 0;

  for (const token of labelTokens) {
    if (lineNorm.includes(token)) score += 4;
    if (bodyNorm.includes(token)) score += 1;
  }

  return score;
}

/**
 * @param {{ line: string, anchor: string, index: string }[]} sections
 * @param {string} [proposedAnchor]
 */
export function findSectionByAnchor(sections, proposedAnchor) {
  const raw = String(proposedAnchor ?? '').trim();
  if (!raw) return null;

  const norm = normalizeForMatch(raw.replace(/_/g, ' '));
  for (const section of sections) {
    if (normalizeForMatch(section.anchor) === norm) return section;
    if (normalizeForMatch(section.line) === norm) return section;
    if (normalizeForMatch(section.anchor.replace(/_/g, ' ')) === norm) return section;
  }
  return null;
}

/**
 * @param {string} label
 * @param {{ line: string, anchor: string, index: string }[]} sections
 * @param {Map<string, string>} [sectionBodies]
 */
export function pickBestVerifiedSection(label, sections, sectionBodies = new Map(), options = {}) {
  const { stopName = '', notes = '', wikiTitle = '' } = options;
  const candidates = sections.filter((s) => {
    const key = normalizeForMatch(s.line);
    return !SKIP_SECTION_LINES.has(key);
  });

  let best = null;
  let bestScore = 0;

  for (const section of candidates) {
    const body = sectionBodies.get(section.index) ?? '';
    const score = scoreSectionCandidate(label, section.line, body);
    if (score > bestScore) {
      bestScore = score;
      best = section;
    }
  }

  const MIN_SCORE = 2;
  if (!best || bestScore < MIN_SCORE) return null;

  const body = sectionBodies.get(best.index) ?? '';
  if (!labelMatchesSectionEvidence(label, best.line, body, stopName, notes, wikiTitle)) {
    return null;
  }

  return best;
}

/**
 * @param {string} title
 * @param {Record<string, unknown>} [cache]
 */
async function fetchWikiSummary(title, cache = {}) {
  const key = `summary:${normalizeForMatch(title)}`;
  if (cache[key]) return cache[key];

  const url = `${WIKI_IT_SUMMARY}${wikiTitleToSlug(title)}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': WIKI_USER_AGENT },
  });

  if (res.status === 404) {
    cache[key] = null;
    return null;
  }
  if (!res.ok) {
    throw new Error(`fetchWikiSummary: HTTP ${res.status}`);
  }

  const data = await res.json();
  const canonical = typeof data.title === 'string' ? data.title.trim() : '';
  if (!canonical) {
    cache[key] = null;
    return null;
  }

  const result = { title: canonical, extract: typeof data.extract === 'string' ? data.extract : '' };
  cache[key] = result;
  cache[`summary:${normalizeForMatch(canonical)}`] = result;
  return result;
}

/**
 * @param {string} query
 * @param {Record<string, unknown>} [cache]
 */
async function searchWikiTitles(query, cache = {}) {
  const key = `search:${normalizeForMatch(query)}`;
  if (cache[key]) return cache[key];

  const url = new URL(WIKI_IT_API);
  url.searchParams.set('action', 'opensearch');
  url.searchParams.set('search', query);
  url.searchParams.set('limit', '5');
  url.searchParams.set('namespace', '0');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const res = await fetch(url, { headers: { 'User-Agent': WIKI_USER_AGENT } });
  if (!res.ok) throw new Error(`searchWikiTitles: HTTP ${res.status}`);

  const data = await res.json();
  const titles = Array.isArray(data?.[1]) ? data[1].map(String) : [];
  cache[key] = titles;
  return titles;
}

/**
 * Resolve a Wikipedia title verified to exist — never returns an unverified title.
 * @param {string} proposed
 * @param {string} stopName
 * @param {string} label
 * @param {string} notes
 * @param {Record<string, unknown>} cache
 */
export async function resolveVerifiedWikiTitle(proposed, stopName, label, notes, cache = {}) {
  const contextual = normalizeForMatch(label) !== normalizeForMatch(proposed);

  /** @type {(string|null)[]} */
  const attempts = contextual
    ? [
        placeNameInNotes(notes, proposed) ? proposed : null,
        stopName ? `${label} ${stopName}` : null,
        stopName ? `${proposed} ${stopName}` : null,
      ]
    : [
        proposed,
        label !== proposed ? label : null,
        stopName ? `${proposed} ${stopName}` : null,
      ];

  const seenQueries = new Set();
  /** @type {Set<string>} */
  const seenTitles = new Set();

  for (const attempt of attempts) {
    if (!attempt || seenQueries.has(normalizeForMatch(attempt))) continue;
    seenQueries.add(normalizeForMatch(attempt));

    const direct = await fetchWikiSummary(String(attempt), cache);
    if (direct?.title) {
      const norm = normalizeForMatch(direct.title);
      if (seenTitles.has(norm)) continue;
      seenTitles.add(norm);
      if (!contextual || (await isAcceptedContextualTitle(label, direct.title, notes, stopName, cache))) {
        return direct.title;
      }
    }

    const titles = await searchWikiTitles(String(attempt), cache);
    for (const title of titles) {
      const norm = normalizeForMatch(title);
      if (seenTitles.has(norm)) continue;
      seenTitles.add(norm);
      const verified = await fetchWikiSummary(title, cache);
      if (!verified?.title) continue;
      if (
        !contextual ||
        (await isAcceptedContextualTitle(label, verified.title, notes, stopName, cache))
      ) {
        return verified.title;
      }
    }
  }

  return null;
}

/**
 * @param {string} title
 * @param {Record<string, unknown>} [cache]
 * @returns {Promise<{ line: string, anchor: string, index: string }[]>}
 */
async function fetchWikiSections(title, cache = {}) {
  const key = `sections:${normalizeForMatch(title)}`;
  if (cache[key]) return cache[key];

  const url = new URL(WIKI_IT_API);
  url.searchParams.set('action', 'parse');
  url.searchParams.set('page', title);
  url.searchParams.set('prop', 'sections');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const res = await fetch(url, { headers: { 'User-Agent': WIKI_USER_AGENT } });
  if (!res.ok) throw new Error(`fetchWikiSections: HTTP ${res.status}`);

  const data = await res.json();
  const raw = data?.parse?.sections;
  if (!Array.isArray(raw)) {
    cache[key] = [];
    return [];
  }

  const sections = raw
    .map((s) => ({
      line: String(s.line ?? '').trim(),
      anchor: String(s.anchor ?? s.linkAnchor ?? '').trim(),
      index: String(s.index ?? '').trim(),
    }))
    .filter((s) => s.line && s.anchor && s.index);

  cache[key] = sections;
  return sections;
}

/**
 * @param {string} title
 * @param {string} sectionIndex
 * @param {Record<string, unknown>} [cache]
 */
async function fetchWikiSectionPlainText(title, sectionIndex, cache = {}) {
  const key = `sectionText:${normalizeForMatch(title)}:${sectionIndex}`;
  if (cache[key] !== undefined) return cache[key];

  const url = new URL(WIKI_IT_API);
  url.searchParams.set('action', 'parse');
  url.searchParams.set('page', title);
  url.searchParams.set('section', sectionIndex);
  url.searchParams.set('prop', 'text');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const res = await fetch(url, { headers: { 'User-Agent': WIKI_USER_AGENT } });
  if (!res.ok) {
    cache[key] = '';
    return '';
  }

  const data = await res.json();
  const html = data?.parse?.text?.['*'] ?? '';
  const plain = stripHtml(html);
  cache[key] = plain;
  return plain;
}

/**
 * @param {string} label
 * @param {string} wikiTitle
 * @param {string} [proposedSection]
 * @param {Record<string, unknown>} cache
 * @param {string} [notes]
 * @param {string} [stopName]
 */
async function resolveVerifiedSection(
  label,
  wikiTitle,
  proposedSection,
  cache = {},
  notes = '',
  stopName = ''
) {
  const sections = await fetchWikiSections(wikiTitle, cache);
  if (!sections.length) return null;

  if (proposedSection) {
    const explicit = findSectionByAnchor(sections, proposedSection);
    if (explicit) {
      const body = await fetchWikiSectionPlainText(wikiTitle, explicit.index, cache);
      if (labelMatchesSectionEvidence(label, explicit.line, body, stopName, notes, wikiTitle)) {
        return { anchor: explicit.anchor, sectionTitle: explicit.line, index: explicit.index };
      }
    }
  }

  const topByLine = [...sections]
    .filter((s) => !SKIP_SECTION_LINES.has(normalizeForMatch(s.line)))
    .map((s) => ({ section: s, score: scoreSectionCandidate(label, s.line) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  /** @type {Map<string, string>} */
  const bodies = new Map();
  for (const { section } of topByLine) {
    bodies.set(
      section.index,
      await fetchWikiSectionPlainText(wikiTitle, section.index, cache)
    );
  }

  const best = pickBestVerifiedSection(label, sections, bodies, { stopName, notes, wikiTitle });
  if (!best) return null;

  return { anchor: best.anchor, sectionTitle: best.line, index: best.index };
}

/**
 * Validate one place link — returns null if anything cannot be verified.
 * @param {{ label: string, wikiTitle: string, wikiSection?: string }} link
 * @param {string} notes
 * @param {string} stopName
 * @param {Record<string, unknown>} cache
 */
export async function validatePlaceLink(link, notes, stopName, cache = {}) {
  const label = String(link?.label ?? '').trim();
  const proposedTitle = String(link?.wikiTitle ?? label).trim();
  const proposedSection = String(link?.wikiSection ?? link?.section ?? '').trim() || undefined;

  if (label.length < 2 || proposedTitle.length < 2) return null;
  if (!labelAppearsInNotes(label, notes)) return null;

  const wikiTitle = await resolveVerifiedWikiTitle(proposedTitle, stopName, label, notes, cache);
  if (!wikiTitle) return null;

  /** @type {{ label: string, wikiTitle: string, wikiSection?: string, sectionTitle?: string }} */
  const verified = { label, wikiTitle };

  const needsSection =
    normalizeForMatch(label) !== normalizeForMatch(wikiTitle) || Boolean(proposedSection);

  if (needsSection) {
    const section = await resolveVerifiedSection(
      label,
      wikiTitle,
      proposedSection,
      cache,
      notes,
      stopName
    );
    if (section) {
      verified.wikiSection = section.anchor;
      verified.sectionTitle = section.sectionTitle;
    } else if (normalizeForMatch(label) !== normalizeForMatch(wikiTitle)) {
      return null;
    }
  }

  return verified;
}

/**
 * @param {Array<{ label: string, wikiTitle: string, wikiSection?: string }>|undefined} links
 * @param {string|undefined} notes
 * @param {string} stopName
 */
export async function validatePlaceLinksForStop(links, notes, stopName) {
  if (!Array.isArray(links) || !links.length || !notes) return undefined;

  const cache = {};
  /** @type {Array<{ label: string, wikiTitle: string, wikiSection?: string, sectionTitle?: string }>} */
  const verified = [];
  const seenLabels = new Set();

  for (const link of links) {
    if (verified.length >= 10) break;
    const labelKey = normalizeForMatch(link?.label ?? '');
    if (!labelKey || seenLabels.has(labelKey)) continue;

    const item = await validatePlaceLink(link, notes, stopName, cache);
    if (!item) continue;

    seenLabels.add(labelKey);
    verified.push(item);
  }

  return verified.length ? verified : undefined;
}

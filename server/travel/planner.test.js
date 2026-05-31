/**
 * Planner stop notes normalization.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeStopNotes, normalizePlaceLinks } from './planner.js';

describe('normalizeStopNotes', () => {
  it('trims and preserves paragraph breaks', () => {
    const raw = '  Prima frase.\n\nSeconda frase.  ';
    assert.equal(normalizeStopNotes(raw), 'Prima frase.\n\nSeconda frase.');
  });

  it('returns undefined for empty input', () => {
    assert.equal(normalizeStopNotes(''), undefined);
    assert.equal(normalizeStopNotes(null), undefined);
  });

  it('collapses excessive newlines', () => {
    assert.equal(normalizeStopNotes('A\n\n\n\nB'), 'A\n\nB');
  });
});

describe('normalizePlaceLinks', () => {
  it('dedupes and caps links', () => {
    const links = normalizePlaceLinks([
      { label: 'Pienza', wikiTitle: 'Pienza' },
      { label: 'pienza', wikiTitle: 'Pienza' },
      { label: 'Montalcino', wikiTitle: 'Montalcino' },
    ]);
    assert.equal(links?.length, 2);
    assert.equal(links?.[0].label, 'Pienza');
  });

  it('returns undefined for invalid input', () => {
    assert.equal(normalizePlaceLinks(null), undefined);
    assert.equal(normalizePlaceLinks([]), undefined);
  });
});

/**
 * Stop notes Wikipedia link segmentation.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { segmentStopNotes, wikipediaItUrl } from './stopNotesRichText.ts';

describe('stopNotesRichText', () => {
  it('wikipediaItUrl builds Italian Wikipedia slug', () => {
    assert.equal(wikipediaItUrl('Pienza'), 'https://it.wikipedia.org/wiki/Pienza');
    assert.equal(wikipediaItUrl('Via Francigena'), 'https://it.wikipedia.org/wiki/Via_Francigena');
  });

  it('segmentStopNotes links exact labels in text', () => {
    const notes = 'Visita Pienza e Montalcino per vino e pecorino.';
    const segments = segmentStopNotes(notes, [
      { label: 'Pienza', wikiTitle: 'Pienza' },
      { label: 'Montalcino', wikiTitle: 'Montalcino' },
    ]);
    assert.deepEqual(segments, [
      { type: 'text', text: 'Visita ' },
      { type: 'link', label: 'Pienza', wikiTitle: 'Pienza', href: 'https://it.wikipedia.org/wiki/Pienza' },
      { type: 'text', text: ' e ' },
      { type: 'link', label: 'Montalcino', wikiTitle: 'Montalcino', href: 'https://it.wikipedia.org/wiki/Montalcino' },
      { type: 'text', text: ' per vino e pecorino.' },
    ]);
  });

  it('prefers longest matching label', () => {
    const notes = 'Cammina sulla Via Francigena.';
    const segments = segmentStopNotes(notes, [
      { label: 'Via', wikiTitle: 'Via' },
      { label: 'Via Francigena', wikiTitle: 'Via Francigena' },
    ]);
    assert.equal(segments.filter((s) => s.type === 'link').length, 1);
    assert.equal(segments[1].type === 'link' ? segments[1].label : '', 'Via Francigena');
  });
});

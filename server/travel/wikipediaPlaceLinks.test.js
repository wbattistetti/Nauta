/**
 * Wikipedia place link validation — deterministic matching, no network.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  countLabelTokenHits,
  findSectionByAnchor,
  labelAppearsInNotes,
  placeNameInNotes,
  pickBestVerifiedSection,
  scoreSectionCandidate,
  tokenizeForMatch,
} from './wikipediaPlaceLinks.js';

describe('wikipediaPlaceLinks', () => {
  it('placeNameInNotes does not match generic phrase inside longer label', () => {
    const notes = 'Rilassati nelle piscine di acqua calda a Bagno Vignoni.';
    assert.equal(placeNameInNotes(notes, 'Acqua calda'), false);
    assert.equal(placeNameInNotes(notes, 'Bagno Vignoni'), true);
  });

  it('labelAppearsInNotes requires exact substring', () => {
    const notes = 'Visita Pienza e le piscine di acqua calda.';
    assert.equal(labelAppearsInNotes('Pienza', notes), true);
    assert.equal(labelAppearsInNotes('piscine di acqua calda', notes), true);
    assert.equal(labelAppearsInNotes('Piscine di acqua calda', notes), false);
  });

  it('findSectionByAnchor matches anchor or line', () => {
    const sections = [
      { line: "Monumenti e luoghi d'interesse", anchor: "Monumenti_e_luoghi_d'interesse", index: '1' },
      { line: 'Cultura', anchor: 'Cultura', index: '2' },
    ];
    assert.equal(
      findSectionByAnchor(sections, "Monumenti_e_luoghi_d'interesse")?.index,
      '1'
    );
    assert.equal(findSectionByAnchor(sections, 'Cultura')?.index, '2');
  });

  it('pickBestVerifiedSection requires token hits in section body', () => {
    const sections = [
      { line: "Monumenti e luoghi d'interesse", anchor: 'Monumenti', index: '1' },
      { line: 'Cultura', anchor: 'Cultura', index: '2' },
    ];
    const bodies = new Map([
      [
        '1',
        'Al centro del borgo si trova una vasca rettangolare di acqua termale calda e fumante.',
      ],
      ['2', 'Cinema e festival.'],
    ]);
    const best = pickBestVerifiedSection('piscine di acqua calda', sections, bodies, {
      stopName: "Val d'Orcia",
      notes: 'Bagno Vignoni e piscine di acqua calda',
      wikiTitle: 'Bagno Vignoni',
    });
    assert.equal(best?.index, '1');
  });

  it('pickBestVerifiedSection returns null without evidence', () => {
    const sections = [{ line: 'Cultura', anchor: 'Cultura', index: '2' }];
    const bodies = new Map([['2', 'Cinema e festival.']]);
    assert.equal(pickBestVerifiedSection('piscine di acqua calda', sections, bodies), null);
  });

  it('scoreSectionCandidate prefers title token overlap', () => {
    assert.ok(
      scoreSectionCandidate('terme naturali', 'Terme e sorgenti') >
        scoreSectionCandidate('terme naturali', 'Cultura')
    );
  });

  it('tokenizeForMatch strips short/stop words', () => {
    assert.deepEqual(tokenizeForMatch('piscine di acqua calda'), ['piscine', 'acqua', 'calda']);
  });

  it('countLabelTokenHits counts matching tokens', () => {
    assert.equal(
      countLabelTokenHits('piscine di acqua calda', 'vasca di acqua termale calda'),
      2
    );
  });
});

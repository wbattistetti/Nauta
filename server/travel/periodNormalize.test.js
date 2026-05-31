import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPeriodLabel,
  normalizeTravelPeriod,
  parseItalianPeriodText,
} from './periodNormalize.js';

const REF = new Date(2026, 4, 31);

describe('parseItalianPeriodText', () => {
  it('parses last week of May and first two weeks of June combined', () => {
    const r = parseItalianPeriodText(
      'ultima settimana di maggio e prime due settimane di giugno',
      REF
    );
    assert.ok(r);
    assert.equal(r.start.getDate(), 25);
    assert.equal(r.start.getMonth(), 4);
    assert.equal(r.end.getDate(), 14);
    assert.equal(r.end.getMonth(), 5);
  });

  it('parses explicit day range', () => {
    const r = parseItalianPeriodText('dal 25 maggio al 15 giugno', REF);
    assert.ok(r);
    assert.equal(r.start.getDate(), 25);
    assert.equal(r.end.getDate(), 15);
    assert.equal(r.end.getMonth(), 5);
  });
});

describe('normalizeTravelPeriod', () => {
  it('converts vague period to ISO and short label', () => {
    const r = normalizeTravelPeriod({
      period: 'ultima settimana di maggio e prime due settimane di giugno',
      referenceDate: REF,
    });
    assert.equal(r.periodStart, '2026-05-25');
    assert.equal(r.periodEnd, '2026-06-14');
    assert.equal(r.period, '25 mag – 14 giu 2026');
  });

  it('adds circa prefix when flexible', () => {
    const r = normalizeTravelPeriod({
      periodStart: '2026-05-25',
      periodEnd: '2026-06-14',
      periodFlexible: true,
      referenceDate: REF,
    });
    assert.equal(r.period, 'circa 25 mag – 14 giu 2026');
  });
});

describe('formatPeriodLabel', () => {
  it('formats single day', () => {
    const label = formatPeriodLabel(new Date(2026, 5, 1), new Date(2026, 5, 1));
    assert.equal(label, '1 giu 2026');
  });
});

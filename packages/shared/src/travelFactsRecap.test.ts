import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAfterPeriodConfirmReply,
  buildTravelFactsRecapPrefix,
  TRAVELER_TYPE_QUESTION,
} from './travelFactsRecap.js';

describe('travelFactsRecap', () => {
  it('builds recap with destination, days, and period', () => {
    const recap = buildTravelFactsRecapPrefix({
      destination: 'Cina',
      durationDays: 22,
      period: 'circa 12 nov – 15 dic 2026',
      periodStart: '2026-11-12',
      periodEnd: '2026-12-15',
      periodFlexible: true,
      likes: [],
      dislikes: [],
    });
    assert.match(recap, /22 giorni/);
    assert.match(recap, /Cina/);
    assert.match(recap, /12 nov/);
  });

  it('appends traveler question after period confirm', () => {
    const reply = buildAfterPeriodConfirmReply({
      destination: 'Cina',
      durationDays: 22,
      period: 'circa 12 nov – 15 dic 2026',
      periodStart: '2026-11-12',
      periodEnd: '2026-12-15',
      likes: [],
      dislikes: [],
    });
    assert.match(reply!, /Ok, allora/);
    assert.match(reply!, /solo, in coppia/);
    assert.equal(reply!.includes(TRAVELER_TYPE_QUESTION), true);
  });
});

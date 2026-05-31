import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { deriveDraftFromTravelState } from './deriveDraft.js';

describe('deriveDraftFromTravelState', () => {
  it('returns stored draft when travel_state has no version', () => {
    const draft = deriveDraftFromTravelState(null, {
      draft: { destinationNormalized: 'Sicilia' },
    });
    assert.equal(draft.destinationNormalized, 'Sicilia');
  });

  it('derives profile fields from travel_state version 1', () => {
    const draft = deriveDraftFromTravelState(
      {
        version: 1,
        travel_phase: 'phase2',
        profile: {
          destination: 'Puglia',
          durationDays: 7,
          period: 'agosto',
          style: 'equilibrato',
          budget: 'medio',
        },
      },
      { draft: { destinationNormalized: 'Vecchio' } }
    );
    assert.equal(draft.destinationNormalized, 'Puglia');
    assert.equal(draft.durationDays, 7);
    assert.equal(draft.periodNormalized, 'agosto');
    assert.equal(draft.style, 'equilibrato');
    assert.equal(draft.budget, 'medio');
  });

  it('uses itinerary column and sets currentDay on phase4', () => {
    const itinerary = { days: [{ day: 1, title: 'Giorno 1', stops: [], sleep: 'Palermo' }] };
    const draft = deriveDraftFromTravelState(
      { version: 1, travel_phase: 'phase4', profile: { destination: 'Sicilia' } },
      { itinerary, draft: {} }
    );
    assert.deepEqual(draft.itinerary, itinerary);
    assert.equal(draft.currentDay, 1);
  });
});

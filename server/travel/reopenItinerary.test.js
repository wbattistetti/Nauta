import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reopenItinerary } from './reopenItinerary.js';

describe('reopenItinerary', () => {
  it('unlocks and clears day detail', () => {
    const state = {
      version: 1,
      travel_phase: 'phase4',
      locked: true,
      profile: { destination: 'Sicilia', likes: [], dislikes: [] },
      itinerary: {
        stops: [{ id: '1', name: 'Palermo', days: 3, themes: [], primaryTheme: 'culture' }],
        days: [{ day: 1, title: 'Giorno 1', stops: [], sleep: 'Palermo' }],
      },
      pendingReplacement: null,
    };

    reopenItinerary(state);

    assert.equal(state.locked, false);
    assert.equal(state.travel_phase, 'phase3');
    assert.deepEqual(state.itinerary.days, []);
  });

  it('no-op when already unlocked', () => {
    const state = {
      version: 1,
      travel_phase: 'phase2',
      locked: false,
      profile: { likes: [], dislikes: [] },
      itinerary: { stops: [], days: [] },
      pendingReplacement: null,
    };

    reopenItinerary(state);

    assert.equal(state.travel_phase, 'phase2');
    assert.equal(state.locked, false);
  });
});

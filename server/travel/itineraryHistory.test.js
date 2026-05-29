/**
 * Itinerary history & stale flags.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  profilePlannerFingerprint,
  markItineraryStaleAfterProfileChange,
  pushCurrentItineraryToHistory,
  restoreItineraryVersion,
} from './itineraryHistory.js';

describe('itineraryHistory', () => {
  it('marks stale when likes change after baseline', () => {
    const state = {
      locked: false,
      profile: { likes: ['nature'], dislikes: [], style: 'lento', budget: 'medio' },
      itinerary: { stops: [{ id: '1', name: 'A', days: 1, themes: [], primaryTheme: 'nature' }] },
      itineraryHistory: [],
    };
    state.profilePlannerFingerprint = profilePlannerFingerprint(state.profile);
    state.profile.likes = ['nature', 'museums'];
    markItineraryStaleAfterProfileChange(state);
    assert.equal(state.itineraryStale, true);
  });

  it('pushes and restores a version', () => {
    const state = {
      locked: false,
      profile: { likes: ['nature'], dislikes: [], style: 'lento', budget: 'medio' },
      itinerary: {
        stops: [{ id: '1', name: 'Palermo', days: 2, themes: [], primaryTheme: 'nature' }],
      },
      itineraryHistory: [],
      profilePlannerFingerprint: 'abc',
    };
    pushCurrentItineraryToHistory(state);
    assert.equal(state.itineraryHistory.length, 1);
    assert.match(state.itineraryHistory[0].label, /^Itinerario \d+$/);
    assert.ok(state.itineraryHistory[0].payoffSummary?.includes('tappa'));
    assert.ok(state.itineraryHistory[0].profileSnapshot?.likes);
    state.itinerary.stops[0].name = 'Catania';
    const id = state.itineraryHistory[0].id;
    restoreItineraryVersion(state, id);
    assert.equal(state.itinerary.stops[0].name, 'Palermo');
  });
});

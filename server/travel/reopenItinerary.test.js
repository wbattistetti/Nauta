import { describe, it, expect } from 'vitest';
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

    expect(state.locked).toBe(false);
    expect(state.travel_phase).toBe('phase3');
    expect(state.itinerary.days).toEqual([]);
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

    expect(state.travel_phase).toBe('phase2');
    expect(state.locked).toBe(false);
  });
});

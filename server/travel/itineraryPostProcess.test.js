import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { postProcessStops } from './itineraryPostProcess.js';

describe('postProcessStops', () => {
  it('enforces min stops for Italy', () => {
    const profile = { destination: 'Italia', durationDays: 12, likes: [], dislikes: [] };
    const stops = postProcessStops(
      [{ id: '1', name: 'Roma', days: 12, themes: ['museums'], primaryTheme: 'museums' }],
      profile
    );
    assert.ok(stops.length >= 4);
  });

  it('adds cultural capital when culture liked and >10 days', () => {
    const profile = {
      destination: 'Italia',
      durationDays: 14,
      likes: ['museums'],
      dislikes: [],
    };
    const stops = postProcessStops(
      [{ id: '1', name: 'Napoli', days: 14, themes: ['food'], primaryTheme: 'food' }],
      profile
    );
    const names = stops.map((s) => s.name.toLowerCase());
    assert.ok(names.some((n) => n.includes('roma') || n.includes('firenze') || n.includes('venezia')));
  });
});

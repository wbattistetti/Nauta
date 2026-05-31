import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildStopIndexSchedule } from './stopIndexSchedule.js';
import type { TravelStop } from '../../types/travelState.js';

const stop = (name: string, days: number, id = name): TravelStop => ({
  id,
  name,
  days,
  themes: ['nature'],
  primaryTheme: 'nature',
});

describe('buildStopIndexSchedule', () => {
  it('returns only days when trip start is missing', () => {
    const result = buildStopIndexSchedule(stop('Sydney', 3), 0, [stop('Sydney', 3)], {});
    assert.equal(result.daysLabel, '3 giorni');
    assert.equal(result.rangeLabel, null);
  });

  it('computes cumulative date range per stop', () => {
    const stops = [stop('A', 2, 'a'), stop('B', 3, 'b')];
    const profile = { periodStart: '2026-11-12', likes: [], dislikes: [] };
    assert.equal(
      buildStopIndexSchedule(stops[0], 0, stops, profile).rangeLabel,
      'dal 12/11 al 13/11'
    );
    assert.equal(
      buildStopIndexSchedule(stops[1], 1, stops, profile).rangeLabel,
      'dal 14/11 al 16/11'
    );
  });
});

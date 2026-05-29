/**
 * Menu entries for itinerary versions (mirrors src/lib/travel/itineraryVersionMenu.ts).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildItineraryVersionPayoff } from './itineraryVersionPayoff.js';

function buildItineraryMenuEntries(state) {
  const history = state.itineraryHistory ?? [];
  const entries = [];
  history.forEach((v, i) => {
    entries.push({
      id: v.id,
      label: v.label.startsWith('Proposta') ? `Itinerario ${i + 1}` : v.label,
      payoffSummary: v.payoffSummary ?? buildItineraryVersionPayoff(state.profile, v.stops.length),
      isActive: state.activeItineraryVersionId === v.id,
    });
  });
  const stopCount = state.itinerary.stops.length;
  if (stopCount > 0 && !state.activeItineraryVersionId) {
    const index = history.length + 1;
    entries.push({
      id: '__current__',
      label: `Itinerario ${index}`,
      payoffSummary: buildItineraryVersionPayoff(state.profile, stopCount),
      isActive: true,
    });
  }
  return entries;
}

function buildTripItineraryContextLine(state) {
  const dest = state?.profile?.destination?.trim();
  if (!dest) return null;
  const entries = buildItineraryMenuEntries(state);
  if (entries.length === 0) return `Viaggio in ${dest}`;
  const active = entries.find((e) => e.isActive) ?? entries[entries.length - 1];
  return `Viaggio in ${dest} · ${active.label}`;
}

describe('itineraryVersionMenu', () => {
  it('builds payoff with themes, stops, days', () => {
    const line = buildItineraryVersionPayoff(
      { likes: ['museums', 'local_food'], durationDays: 20 },
      7
    );
    assert.ok(line.includes('Musei'));
    assert.ok(line.includes('7 tappe'));
    assert.ok(line.includes('20 giorni'));
  });

  it('lists history plus current', () => {
    const state = {
      profile: { likes: ['museums'], durationDays: 20 },
      itinerary: { stops: [{ id: '1' }, { id: '2' }] },
      itineraryHistory: [
        {
          id: 'v1',
          label: 'Itinerario 1',
          stops: [{ id: '1' }],
          payoffSummary: 'Musei · 1 tappa · 20 giorni',
        },
      ],
      activeItineraryVersionId: undefined,
    };
    const entries = buildItineraryMenuEntries(state);
    assert.equal(entries.length, 2);
    assert.equal(entries[0].label, 'Itinerario 1');
    assert.equal(entries[1].label, 'Itinerario 2');
    assert.equal(entries[1].isActive, true);
  });

  it('builds trip context line with destination and active version', () => {
    const state = {
      profile: { destination: 'Sicilia', likes: ['museums'], durationDays: 20 },
      itinerary: { stops: [{ id: '1' }, { id: '2' }] },
      itineraryHistory: [
        {
          id: 'v1',
          label: 'Itinerario 1',
          stops: [{ id: '1' }],
          payoffSummary: 'x',
        },
      ],
      activeItineraryVersionId: undefined,
    };
    const line = buildTripItineraryContextLine(state);
    assert.equal(line, 'Viaggio in Sicilia · Itinerario 2');
  });
});

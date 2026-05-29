import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { optimizeItinerary } from './optimize.js';
import { scoreItinerary } from './scoring.js';
import { resolveCrowdWeight, inferCrowdSensitivity } from './weights.js';
import { computeZigzagPenalty, sortMonodirectional, enrichStopGeo } from './geography.js';
import { generateItineraryCandidates } from './variants.js';
import {
  ITINERARY_PROPOSAL_CHAT_SHORT,
  ITINERARY_ACCORDION_TITLE,
  PREFERENCES_ACCORDION_TITLE,
  PREFERENCES_ACCORDION_PAYOFF,
} from './itineraryUiText.js';

const profileBase = {
  destination: 'Italia',
  durationDays: 14,
  period: 'metà giugno',
  likes: ['museums', 'exploration'],
  dislikes: [],
  style: 'lento',
};

function stops(names) {
  return names.map((name, i) => ({
    id: String(i + 1),
    name,
    days: Math.max(1, Math.floor(14 / names.length)),
    themes: ['museums'],
    primaryTheme: 'museums',
  }));
}

describe('itineraryEngine', () => {
  it('orders north to south for zigzag itinerary input', () => {
    const raw = stops(['Palermo', 'Milano', 'Roma', 'Venezia']);
    const result = optimizeItinerary(raw, profileBase);
    const geo = result.stops.map((s) => enrichStopGeo(s)?.lat).filter((x) => x != null);
    for (let i = 1; i < geo.length; i++) {
      assert.ok(geo[i] <= geo[i - 1] + 0.2, 'expected mostly decreasing latitude');
    }
  });

  it('prefers lower crowd ordering when user hates crowds', () => {
    const hateCrowd = { ...profileBase, preferenze: 'odio la folla' };
    assert.equal(inferCrowdSensitivity(hateCrowd), 'hate');
    assert.ok(resolveCrowdWeight(hateCrowd) >= 0.65);

    const raw = stops(['Venezia', 'Cinque Terre', 'Genova', 'Bologna']);
    const candidates = generateItineraryCandidates(raw, hateCrowd);
    assert.ok(candidates.length >= 10);

    const ranked = candidates
      .map((c) => ({ c, scored: scoreItinerary(c, hateCrowd) }))
      .sort((a, b) => b.scored.score - a.scored.score);
    const best = ranked[0].c.map((s) => s.name.toLowerCase());
    const veneziaIdx = best.findIndex((n) => n.includes('venezia'));
    const genovaIdx = best.findIndex((n) => n.includes('genova'));
    if (veneziaIdx >= 0 && genovaIdx >= 0) {
      assert.ok(genovaIdx < veneziaIdx || ranked[0].scored.penaltyCrowd < ranked[ranked.length - 1].scored.penaltyCrowd);
    }
  });

  it('penalizes zigzag inversions', () => {
    const ordered = sortMonodirectional(
      stops(['Torino', 'Venezia', 'Roma', 'Napoli']).map(enrichStopGeo).filter(Boolean)
    );
    const good = computeZigzagPenalty(ordered);
    const bad = computeZigzagPenalty(
      ['Napoli', 'Torino', 'Roma', 'Venezia'].map((n) => enrichStopGeo({ name: n, days: 3 })).filter(Boolean)
    );
    assert.ok(bad.inversions >= good.inversions);
    assert.ok(bad.penalty >= good.penalty);
  });

  it('exposes mandatory UI copy', () => {
    assert.match(ITINERARY_PROPOSAL_CHAT_SHORT, /Guarda se ti piace/);
    assert.equal(ITINERARY_ACCORDION_TITLE, 'Scopri l\'itinerario');
    assert.match(PREFERENCES_ACCORDION_TITLE, /azzeccato i tuoi gusti/);
    assert.match(PREFERENCES_ACCORDION_PAYOFF, /rivedere l'itinerario/);
  });
});

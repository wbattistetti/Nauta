/**
 * Itinerary optimizer — score candidates and return best route + metadata.
 */
import { isItalyDestination } from '../geoCatalog.js';
import { generateItineraryCandidates } from './variants.js';
import { scoreItinerary } from './scoring.js';
import { buildItineraryMotivation } from './itineraryUiText.js';
import { resolveOptimizationWeights } from './weights.js';

const SCORE_CLOSE_THRESHOLD = 8;

/**
 * @typedef {Object} OptimizedItinerary
 * @property {import('../types.js').TravelStop[]} stops
 * @property {string} motivation
 * @property {number} score
 * @property {{ stops: import('../types.js').TravelStop[], score: number, motivation: string }[]} [alternatives]
 * @property {object} scoring
 */

/**
 * Pick best-scoring candidate among generated variants.
 * Expects stops already passed through density/cultural post-process rules.
 * @param {import('../types.js').TravelStop[]} preprocessedStops
 * @param {import('../types.js').UserProfile} profile
 * @returns {OptimizedItinerary}
 */
export function optimizeItinerary(preprocessedStops, profile) {
  if (!isItalyDestination(profile.destination)) {
    return {
      stops: preprocessedStops,
      motivation: 'Itinerario organizzato in base alle tue preferenze.',
      score: 0,
      alternatives: [],
      scoring: {},
    };
  }

  const candidates = generateItineraryCandidates(preprocessedStops, profile);
  const weights = resolveOptimizationWeights(profile);

  /** @type {{ stops: import('../types.js').TravelStop[], scored: ReturnType<typeof scoreItinerary> }[]} */
  const ranked = candidates.map((stops) => ({
    stops,
    scored: scoreItinerary(stops, profile),
  }));

  ranked.sort((a, b) => b.scored.score - a.scored.score);
  const best = ranked[0];
  const bestScore = best?.scored.score ?? 0;

  const alternatives = ranked
    .slice(1, 4)
    .filter((r) => bestScore - r.scored.score <= SCORE_CLOSE_THRESHOLD)
    .map((r) => ({
      stops: r.stops,
      score: r.scored.score,
      motivation: buildItineraryMotivation({
        crowdDominates: weights.crowdDominates,
        inversions: r.scored.inversions,
      }),
    }));

  const motivation = buildItineraryMotivation({
    crowdDominates: weights.crowdDominates,
    inversions: best?.scored.inversions ?? 0,
  });

  return {
    stops: best?.stops ?? preprocessedStops,
    motivation,
    score: bestScore,
    alternatives: alternatives.length ? alternatives : undefined,
    scoring: best?.scored ?? {},
  };
}

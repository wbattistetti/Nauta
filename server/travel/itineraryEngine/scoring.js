/**
 * Itinerary scoring — combines geography, crowd, distance, variety, interests.
 */
import { hasCulturalInterest } from '../themeTaxonomy.js';
import {
  computeZigzagPenalty,
  enrichStopGeo,
  totalRouteDistanceKm,
} from './geography.js';
import { computeRouteCrowdPenalty } from './crowd.js';
import { resolveOptimizationWeights } from './weights.js';

const DISTANCE_PENALTY_FACTOR = 0.1;
const VARIETY_BONUS_PER_REGION = 4;
const INTEREST_MATCH_BONUS = 6;

/**
 * Bonus for theme variety and profile interest alignment.
 * @param {{ name: string, themes?: string[], primaryTheme?: string, region?: string }[]} ordered
 * @param {import('../types.js').UserProfile} profile
 */
export function computeBonuses(ordered, profile) {
  const likes = new Set(profile.likes ?? []);
  const regions = new Set(ordered.map((s) => s.region).filter(Boolean));

  let interestMatch = 0;
  for (const stop of ordered) {
    const themes = stop.themes ?? (stop.primaryTheme ? [stop.primaryTheme] : []);
    for (const t of themes) {
      if (likes.has(t)) interestMatch += INTEREST_MATCH_BONUS;
    }
  }

  const varietyBonus = Math.max(0, (regions.size - 1) * VARIETY_BONUS_PER_REGION);
  if (hasCulturalInterest(profile.likes) && ordered.some((s) => /roma|firenze|venezia/i.test(s.name))) {
    interestMatch += INTEREST_MATCH_BONUS;
  }

  return { varietyBonus, interestMatchBonus: interestMatch };
}

/**
 * Full score for an ordered candidate (higher is better).
 * @param {{ name: string, days: number, themes?: string[], primaryTheme?: string, region?: string }[]} ordered
 * @param {import('../types.js').UserProfile} profile
 */
export function scoreItinerary(ordered, profile) {
  const geo = ordered.map((s) => enrichStopGeo(s)).filter(Boolean);
  if (!geo.length) {
    return {
      score: 0,
      penaltyZigzag: 0,
      penaltyCrowd: 0,
      distanceKm: 0,
      varietyBonus: 0,
      interestMatchBonus: 0,
      inversions: 0,
      weights: resolveOptimizationWeights(profile),
    };
  }

  const weights = resolveOptimizationWeights(profile);
  const { penalty: penaltyZigzag, inversions } = computeZigzagPenalty(geo);
  const { penalty: penaltyCrowd } = computeRouteCrowdPenalty(ordered, profile);
  const distanceKm = totalRouteDistanceKm(geo);
  const { varietyBonus, interestMatchBonus } = computeBonuses(ordered, profile);

  const score =
    -(penaltyZigzag * weights.monodirectionalWeight) -
    penaltyCrowd * weights.crowdWeight -
    distanceKm * DISTANCE_PENALTY_FACTOR +
    varietyBonus +
    interestMatchBonus;

  return {
    score,
    penaltyZigzag,
    penaltyCrowd,
    distanceKm,
    varietyBonus,
    interestMatchBonus,
    inversions,
    weights,
  };
}

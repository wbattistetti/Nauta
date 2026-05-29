/**
 * Dynamic weights — resolve monodirectional vs crowd priority from user profile.
 */

export const BASE_MONODIRECTIONAL_WEIGHT = 0.6;

/**
 * Infer crowd sensitivity from profile text and preferences.
 * @param {import('../types.js').UserProfile} profile
 * @returns {'hate'|'neutral'|'indifferent'}
 */
export function inferCrowdSensitivity(profile) {
  const text = [profile.preferenze, profile.style, profile.ritmo, profile.alloggi]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/odio la folla|evitare (la )?folla|zero folla|niente folla|detesto (la )?folla/.test(text)) {
    return 'hate';
  }
  if (/non mi importa|indifferente|folla ok|mi piace l'energia/.test(text)) {
    return 'indifferent';
  }

  const likes = profile.likes ?? [];
  if (likes.includes('exploration') || likes.includes('relax')) return 'hate';
  if (likes.includes('nightlife') || likes.includes('festivals')) return 'indifferent';

  const style = String(profile.style ?? profile.ritmo ?? '').toLowerCase();
  if (style.includes('lento') || style.includes('rilass')) return 'hate';
  if (style.includes('intenso')) return 'indifferent';

  return 'neutral';
}

/**
 * Crowd weight in [0.2, 0.7] based on user tolerance.
 * @param {import('../types.js').UserProfile} profile
 */
export function resolveCrowdWeight(profile) {
  const sensitivity = inferCrowdSensitivity(profile);
  if (sensitivity === 'hate') return 0.7;
  if (sensitivity === 'indifferent') return 0.2;
  return 0.45;
}

/**
 * Effective monodirectional weight (may be reduced when crowd dominates).
 * @param {import('../types.js').UserProfile} profile
 */
export function resolveOptimizationWeights(profile) {
  const crowdWeight = resolveCrowdWeight(profile);
  let monoWeight = BASE_MONODIRECTIONAL_WEIGHT;

  if (crowdWeight > monoWeight) {
    monoWeight = Math.max(0.35, BASE_MONODIRECTIONAL_WEIGHT - (crowdWeight - BASE_MONODIRECTIONAL_WEIGHT) * 0.5);
  }

  return {
    monodirectionalWeight: monoWeight,
    crowdWeight,
    crowdDominates: crowdWeight > monoWeight,
  };
}

/**
 * Whether a geographic swap is acceptable to reduce crowd (small deviation only).
 * @param {number} deviationKm
 * @param {boolean} crowdDominates
 */
export function allowCrowdSwap(deviationKm, crowdDominates) {
  const maxKm = crowdDominates ? 120 : 60;
  return deviationKm <= maxKm;
}

/**
 * Payoff line for saved itinerary versions (mirrors src/lib/travel/itineraryVersionMenu.ts).
 */
import { THEME_IDS } from './themeTaxonomy.js';

/** Italian labels for payoff (subset + fallbacks). */
const THEME_LABELS_IT = {
  nature: 'Natura',
  mountains: 'Montagna',
  beach: 'Mare',
  museums: 'Musei',
  local_food: 'Cucina tipica',
  street_food: 'Street food',
  history_eras: 'Storia',
  historic_sites: 'Siti storici',
  archaeology: 'Archeologia',
  art_ancient: 'Arte antica',
  art_modern: 'Arte moderna',
  architecture: 'Architettura',
  relax: 'Relax',
  wellness: 'Benessere',
  nightlife: 'Vita notturna',
  trekking: 'Trekking',
  exploration: 'Esplorazione',
};

const PACE_LABELS = {
  lento: 'Lento',
  equilibrato: 'Equo',
  intenso: 'Intenso',
};

/**
 * @param {import('./types.js').UserProfile} profile
 * @param {number} stopCount
 */
export function buildItineraryVersionPayoff(profile, stopCount, maxThemes = 2) {
  const likes = profile.likes ?? [];
  const labels = [];
  for (const id of THEME_IDS) {
    if (likes.includes(id)) {
      labels.push(THEME_LABELS_IT[id] ?? id);
      if (labels.length >= maxThemes) break;
    }
  }

  const styleId = (profile.style ?? profile.ritmo)?.toLowerCase();
  const paceLabel = styleId ? PACE_LABELS[styleId] : undefined;

  const parts = [];
  if (labels.length > 0) parts.push(labels.join(' + '));
  else if (paceLabel) parts.push(paceLabel);

  if (stopCount > 0) {
    parts.push(stopCount === 1 ? '1 tappa' : `${stopCount} tappe`);
  }
  if (profile.durationDays && profile.durationDays > 0) {
    parts.push(`${profile.durationDays} giorni`);
  }

  return parts.length > 0 ? parts.join(' · ') : 'Itinerario in preparazione';
}

/**
 * @param {import('./types.js').UserProfile} profile
 */
export function profileSnapshotFromProfile(profile) {
  return {
    likes: [...(profile.likes ?? [])],
    durationDays: profile.durationDays ?? null,
    style: profile.style,
    ritmo: profile.ritmo,
    budget: profile.budget,
  };
}

/**
 * Itinerary generation engine — geography, crowd, scoring, variants, UI copy.
 */
export { optimizeItinerary } from './optimize.js';
export {
  formatUserEchoAbovePanels,
  ITINERARY_PROPOSAL_CHAT_SHORT,
  ITINERARY_ACCORDION_TITLE,
  PREFERENCES_ACCORDION_TITLE,
  PREFERENCES_ACCORDION_PAYOFF,
  STOP_PHOTOS_ACCORDION_LABEL,
  ITINERARY_PROPOSAL_CHAT_MESSAGE,
  PREFERENCE_PANELS_CHAT_MESSAGE,
  PREFERENCE_PANELS_HINT_MESSAGE,
  ITINERARY_BELOW_PANELS_MESSAGE,
  TRAVEL_PLAN_PROPOSAL_MESSAGE,
  buildItineraryMotivation,
} from './itineraryUiText.js';
export { scoreItinerary, computeBonuses } from './scoring.js';
export { resolveOptimizationWeights, resolveCrowdWeight, inferCrowdSensitivity } from './weights.js';
export { computeStopCrowdScore, computeRouteCrowdPenalty } from './crowd.js';
export {
  enrichStopGeo,
  sortMonodirectional,
  computeZigzagPenalty,
  totalRouteDistanceKm,
} from './geography.js';
export { generateItineraryCandidates } from './variants.js';

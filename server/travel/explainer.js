/**
 * Explainer — natural language reply only (no state mutation).
 */
import { callOpenAiJson } from './openaiJson.js';
import {
  isPanelProfileComplete,
  isReadyForItineraryGeneration,
  isTravelFactsComplete,
  isTravelerProfileComplete,
} from './defaultState.js';
import {
  ITINERARY_PROPOSAL_CHAT_SHORT,
  PREFERENCE_PANELS_CHAT_MESSAGE,
} from './itineraryEngine/itineraryUiText.js';

const EXPLAINER_SYSTEM = `Sei l'Explainer di Nauta. Scrivi SOLO JSON: { "reply": "..." }
Regole:
- Italiano, tono naturale e umano (max 2 frasi brevi).
- MAI dire "ho registrato", "ho salvato nel profilo", "ho annotato" o ripetere dati anagrafici.
- Se ci sono tappe: invita a vedere itinerario e preferenze SOTTO la chat (accordi).
- Non chiedere stile/budget/temi a parole in chat.
- Non dire che l'itinerario è "pronto" se locked=false e stops vuoto.`;

/**
 * @param {import('./types.js').TravelState} state
 * @param {string[]} clarifications
 */
export function shouldUseDeterministicReply(state, clarifications) {
  const profile = state.profile;
  if (isTravelFactsComplete(profile) && !isTravelerProfileComplete(profile)) return true;
  if (clarifications.length > 0 && !isTravelFactsComplete(profile)) return true;
  if (state.itinerary.stops.length > 0 && !state.locked) return true;
  if (isReadyForItineraryGeneration(profile) && !state.itinerary.stops.length) return true;
  return false;
}

import { formatPeriodFromIso } from './periodNormalize.js';
import {
  buildTravelFactsRecapPrefix,
  TRAVELER_TYPE_QUESTION,
  AGE_BAND_QUESTION,
} from '@nauta/shared/travelFactsRecap';
import {
  buildDestinationAckMessage,
  followUpAfterDestinationPhotos,
  resolveDestinationAckMessage,
} from './destinationAck.js';

export { DURATION_FOLLOW_UP } from './destinationAck.js';

/**
 * @param {import('./types.js').UserProfile} profile
 */
function travelFactsConfirmPrefix(profile) {
  const period =
    (profile.periodStart && profile.periodEnd
      ? formatPeriodFromIso(profile.periodStart, profile.periodEnd, profile.periodFlexible === true)
      : '') || profile.period || '';
  return buildTravelFactsRecapPrefix({ ...profile, period: period || profile.period });
}

/**
 * @param {string} userMessage
 * @param {import('./types.js').TravelState} state
 * @param {string[]} clarifications
 * @param {string} tripId
 * @param {boolean} [resuming]
 */
export async function runExplainer(
  userMessage,
  state,
  clarifications,
  tripId,
  resuming = false,
  options = {}
) {
  const { destinationJustSet = false, previousState = null } = options;
  const dest = state.profile.destination?.trim();

  if (destinationJustSet && dest && !state.profile.durationDays) {
    return {
      reply: resolveDestinationAckMessage(dest),
      followUpAfterPhotos: followUpAfterDestinationPhotos(state, true),
    };
  }

  if (shouldUseDeterministicReply(state, clarifications)) {
    return {
      reply: buildFallbackReply(state, clarifications, { destinationJustSet, previousState }),
      followUpAfterPhotos: followUpAfterDestinationPhotos(state, destinationJustSet),
    };
  }

  let extra = '';
  if (resuming) {
    extra =
      '\nRESUME: bentornato breve, prossima domanda su ciò che manca. Non ripetere dati già noti.';
  }

  const user = `STATO:\n${JSON.stringify(state, null, 2)}\nCLARIFICAZIONI:\n${JSON.stringify(clarifications)}\nMESSAGGIO:\n${userMessage}${extra}`;

  const { parsed } = await callOpenAiJson({
    system: EXPLAINER_SYSTEM,
    user,
    maxTokens: 400,
    purpose: 'TRAVEL_EXPLAINER',
    tripId,
  });

  const reply =
    typeof parsed?.reply === 'string' && parsed.reply.trim()
      ? parsed.reply.trim()
      : buildFallbackReply(state, clarifications, { destinationJustSet, previousState });

  return {
    reply,
    followUpAfterPhotos: followUpAfterDestinationPhotos(state, destinationJustSet),
  };
}

/** @param {import('./types.js').TravelState} state @param {string[]} clarifications @param {{ destinationJustSet?: boolean, previousState?: import('./types.js').TravelState|null }} [options] */
export function buildFallbackReply(state, clarifications, options = {}) {
  const { destinationJustSet = false } = options;
  const dest = state.profile.destination?.trim();

  if (destinationJustSet && dest && !state.profile.durationDays) {
    return resolveDestinationAckMessage(dest);
  }

  if (clarifications.length) {
    const isDurationQ = /quanti giorni|durata|giorni a disposizione/i.test(clarifications[0]);
    if (dest && !state.profile.durationDays && isDurationQ) {
      return resolveDestinationAckMessage(dest);
    }
    return clarifications[0];
  }

  if (state.itinerary.stops.length > 0 && !state.locked) {
    return ITINERARY_PROPOSAL_CHAT_SHORT;
  }

  if (!isTravelFactsComplete(state.profile)) {
    if (!state.profile.destination) return 'Dove vorresti andare?';
    if (!state.profile.durationDays) return 'Quanti giorni hai a disposizione?';
    return 'In che periodo vorresti partire?';
  }

  const confirm = travelFactsConfirmPrefix(state.profile);
  if (!state.profile.travelerType) {
    return confirm ? `${confirm} ${TRAVELER_TYPE_QUESTION}` : TRAVELER_TYPE_QUESTION;
  }
  if (!state.profile.ageBand) {
    return confirm ? `${confirm} ${AGE_BAND_QUESTION}` : AGE_BAND_QUESTION;
  }

  if (isReadyForItineraryGeneration(state.profile) && !state.itinerary.stops.length) {
    return 'Un attimo: preparo un itinerario in base alle preferenze preselezionate per voi.';
  }

  if (isTravelerProfileComplete(state.profile) && !isPanelProfileComplete(state.profile)) {
    return PREFERENCE_PANELS_CHAT_MESSAGE;
  }

  return PREFERENCE_PANELS_CHAT_MESSAGE;
}

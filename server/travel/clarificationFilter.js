/**
 * Chat clarifications: travel facts + traveler profile in chat; panels handle themes/style/budget.
 */
import {
  isPanelProfileComplete,
  isTravelFactsComplete,
  isTravelerProfileComplete,
} from './defaultState.js';

/** Panel-only topics — exclude companion words (famiglia/solo/amici = travelerType, not panels). */
const PANEL_TOPIC =
  /stile|budget|ritmo|interess|temi|preferenz|cultur|natura|cibo|gastronom|notturn|shopping|relax|benessere|avventura|montagna|mare|spiaggia|foto|storia|evita|pannell|lento|intenso|econom|medio|alto/i;

/**
 * @param {string[]} clarifications
 * @param {import('./types.js').UserProfile} profile
 * @returns {string[]}
 */
export function filterClarificationsForPanels(clarifications, profile) {
  const filtered = clarifications.filter((c) => !PANEL_TOPIC.test(String(c)));

  if (!isTravelFactsComplete(profile)) return filtered;

  // Facts done — still need companion + age in chat.
  if (!isTravelerProfileComplete(profile)) return filtered;

  // Traveler done — preferences only via panels; drop remaining chat clarifications.
  if (!isPanelProfileComplete(profile)) return [];

  return filtered;
}

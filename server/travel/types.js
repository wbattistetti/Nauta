/** @typedef {'phase1'|'phase2'|'phase3'|'phase4'} TravelPhase */
/** @typedef {'draft'|'confirmed'|'logistics_ready'} ItineraryStatus */
/** @typedef {'salvabile'|'borderline'|'incompatibile'} StopCompatibility */

/**
 * @typedef {Object} TravelStop
 * @property {string} id
 * @property {string} name
 * @property {string} [region]
 * @property {number} days
 * @property {string[]} themes
 * @property {string} primaryTheme
 * @property {string} [notes]
 * @property {StopCompatibility} [compatibility]
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} [destination]
 * @property {number|null} [durationDays]
 * @property {string} [period]
 * @property {string} [periodStart]
 * @property {string} [periodEnd]
 * @property {boolean} [periodFlexible]
 * @property {number} [periodStartToleranceDays]
 * @property {number} [periodEndToleranceDays]
 * @property {string} [style]
 * @property {string} [ritmo]
 * @property {string} [budget]
 * @property {string} [alloggi]
 * @property {string} [preferenze]
 * @property {string[]} likes
 * @property {string[]} dislikes
 */

/**
 * @typedef {Object} TravelState
 * @property {1} version
 * @property {TravelPhase} travel_phase
 * @property {UserProfile} profile
 * @property {{ stops: TravelStop[], days: object[], summary?: string }} itinerary
 * @property {boolean} locked
 * @property {object|null} pendingReplacement
 * @property {string} [lastReasonerIntent]
 */

export {};

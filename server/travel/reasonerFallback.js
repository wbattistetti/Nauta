/**
 * Reasoner fallback when AI output fails validation — no message parsing.
 */

/**
 * @param {import('./types.js').TravelState} state
 */
export function buildReasonerFallback(_userMessage, state) {
  const clarifications = [];

  if (!state.profile.destination) {
    clarifications.push('Dove vorresti andare?');
  }
  if (!state.profile.durationDays) {
    clarifications.push('Quanti giorni hai a disposizione?');
  }
  if (!state.profile.period && !(state.profile.periodStart && state.profile.periodEnd)) {
    clarifications.push('In che periodo vorresti partire?');
  }
  if (
    state.profile.destination &&
    state.profile.durationDays &&
    (state.profile.period || (state.profile.periodStart && state.profile.periodEnd))
  ) {
    if (!state.profile.travelerType) {
      clarifications.push('Viaggi da solo, in coppia, in famiglia o con amici?');
    } else if (!state.profile.ageBand) {
      clarifications.push('Quale fascia d’età ti rappresenta? (es. 25–35, 35–50, 50+)');
    }
  }

  if (clarifications.length === 0) {
    clarifications.push(
      'Non sono riuscito a interpretare il messaggio. Puoi riformularlo con una informazione alla volta?'
    );
  }

  return {
    intent: 'reasoner_unavailable',
    actions: [{ type: 'none' }],
    clarificationsNeeded: clarifications.slice(0, 2),
    needsPlanner: false,
    plannerTask: null,
    plannerContext: {},
  };
}

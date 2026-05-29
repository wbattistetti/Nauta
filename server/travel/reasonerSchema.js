/**
 * Validate Reasoner JSON output (retry if invalid).
 */

const ACTION_TYPES = new Set([
  'update_profile',
  'generate_initial_itinerary',
  'recalculate_itinerary',
  'propose_stop_replacement',
  'confirm_stop_replacement',
  'confirm_itinerary',
  'adjust_stop_days',
  'remove_stop',
  'add_stop',
  'none',
]);

/** @param {unknown} raw */
export function parseReasonerJson(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const intent = typeof o.intent === 'string' ? o.intent : 'unknown';
  const clarificationsNeeded = Array.isArray(o.clarificationsNeeded)
    ? o.clarificationsNeeded.filter((x) => typeof x === 'string')
    : [];
  const needsPlanner = Boolean(o.needsPlanner);
  const plannerTask =
    o.plannerTask === 'generate_initial' ||
    o.plannerTask === 'recalculate' ||
    o.plannerTask === 'replacement_candidates'
      ? o.plannerTask
      : undefined;
  const plannerContext =
    o.plannerContext && typeof o.plannerContext === 'object'
      ? /** @type {Record<string, unknown>} */ (o.plannerContext)
      : undefined;

  const actions = [];
  if (Array.isArray(o.actions)) {
    for (const a of o.actions) {
      const parsed = parseAction(a);
      if (parsed) actions.push(parsed);
    }
  }
  if (actions.length === 0) actions.push({ type: 'none' });

  return {
    intent,
    actions,
    clarificationsNeeded,
    needsPlanner,
    plannerTask,
    plannerContext,
  };
}

/** @param {unknown} a */
function parseAction(a) {
  if (!a || typeof a !== 'object') return null;
  const t = /** @type {Record<string, unknown>} */ (a).type;
  if (typeof t !== 'string' || !ACTION_TYPES.has(t)) return null;

  if (t === 'update_profile') {
    const patch = /** @type {Record<string, unknown>} */ (a).patch;
    return { type: 'update_profile', patch: patch && typeof patch === 'object' ? patch : {} };
  }
  if (t === 'generate_initial_itinerary') return { type: 'generate_initial_itinerary' };
  if (t === 'recalculate_itinerary') return { type: 'recalculate_itinerary' };
  if (t === 'confirm_itinerary') return { type: 'confirm_itinerary' };
  if (t === 'none') return { type: 'none' };
  if (t === 'propose_stop_replacement') {
    const stopId = String(a.stopId ?? '');
    return stopId ? { type: 'propose_stop_replacement', stopId } : null;
  }
  if (t === 'confirm_stop_replacement') {
    const stopId = String(a.stopId ?? '');
    const candidateId = String(a.candidateId ?? '');
    return stopId && candidateId
      ? { type: 'confirm_stop_replacement', stopId, candidateId }
      : null;
  }
  if (t === 'adjust_stop_days') {
    const stopId = String(a.stopId ?? '');
    const days = Number(a.days);
    return stopId && days > 0 ? { type: 'adjust_stop_days', stopId, days } : null;
  }
  if (t === 'remove_stop') {
    const stopId = String(a.stopId ?? '');
    return stopId ? { type: 'remove_stop', stopId } : null;
  }
  if (t === 'add_stop') {
    const name = String(a.name ?? '').trim();
    const days = Number(a.days) || 1;
    return name ? { type: 'add_stop', name, days, themes: a.themes } : null;
  }
  return null;
}

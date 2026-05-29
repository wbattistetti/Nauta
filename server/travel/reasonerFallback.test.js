import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildReasonerFallback } from './reasonerFallback.js';
import { createInitialTravelState } from './defaultState.js';

describe('buildReasonerFallback', () => {
  it('does not parse destination or days from user text', () => {
    const state = createInitialTravelState();
    const out = buildReasonerFallback(
      'Voglio fare un viaggio in Italia di 90 giorni di 30 giorni',
      state
    );
    assert.equal(out.actions[0].type, 'none');
    assert.equal(state.profile.destination, undefined);
    assert.equal(state.profile.durationDays, undefined);
  });

  it('asks traveler questions when facts would be complete in profile only', () => {
    const state = createInitialTravelState();
    state.profile.destination = 'Italia';
    state.profile.durationDays = 30;
    state.profile.period = 'giugno';
    const out = buildReasonerFallback('ok', state);
    assert.ok(
      out.clarificationsNeeded.some((c) => /solo|coppia|famiglia|amici/i.test(c)),
      'should ask traveler type'
    );
  });
});

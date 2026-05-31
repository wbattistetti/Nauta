import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildFallbackReply, shouldUseDeterministicReply } from './explainer.js';
import { createInitialTravelState } from './defaultState.js';

describe('explainer traveler step', () => {
  it('uses deterministic reply when facts complete but traveler missing', () => {
    const state = createInitialTravelState();
    state.profile = {
      ...state.profile,
      destination: 'Italia',
      durationDays: 30,
      period: 'metà giugno – metà luglio',
    };
    assert.equal(shouldUseDeterministicReply(state, []), true);
  });

  it('asks companion after facts with short confirmation', () => {
    const state = createInitialTravelState();
    state.profile = {
      ...state.profile,
      destination: 'Italia',
      durationDays: 30,
      period: 'metà giugno – metà luglio',
    };
    const reply = buildFallbackReply(state, []);
    assert.match(reply, /Ok, allora.*30 giorni.*Italia/i);
    assert.match(reply, /solo.*coppia.*famiglia.*amici/i);
  });

  it('returns personalized ack when destination just set', () => {
    const state = createInitialTravelState();
    state.profile = { ...state.profile, destination: 'Cina' };
    const reply = buildFallbackReply(state, ['Quanti giorni vuoi dedicare al viaggio?'], {
      destinationJustSet: true,
    });
    assert.match(reply, /La Cina.*meta|foto|immagine|iconico/i);
    assert.doesNotMatch(reply, /Quanti giorni/i);
  });
});

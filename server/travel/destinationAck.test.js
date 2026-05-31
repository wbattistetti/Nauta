import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDestinationAckMessage,
  buildDestinationAckVariants,
  classifyDestinationAppeal,
  clearDestinationAckCache,
  destinationJustSet,
  followUpAfterDestinationPhotos,
  resolveDestinationAckMessage,
  DURATION_FOLLOW_UP,
} from './destinationAck.js';

describe('destinationAck', () => {
  afterEach(() => clearDestinationAckCache());

  it('classifies major destinations', () => {
    assert.equal(classifyDestinationAppeal('Cina'), 'major');
    assert.equal(classifyDestinationAppeal('Parigi'), 'major');
    assert.equal(classifyDestinationAppeal('Machu Picchu'), 'major');
  });

  it('classifies minor localities', () => {
    assert.equal(classifyDestinationAppeal('Limbiate'), 'minor');
  });

  it('builds appeal-based ack messages', () => {
    assert.match(buildDestinationAckMessage('Cina'), /La Cina.*meta|foto/i);
    assert.match(buildDestinationAckMessage('Giappone'), /Il Giappone.*meta|iconico/i);
    assert.doesNotMatch(buildDestinationAckMessage('Giappone'), /Bella Giappone/i);
    assert.match(buildDestinationAckMessage('Limbiate'), /Limbiate.*idea del posto/i);
  });

  it('rotates cached variants for the same destination', () => {
    const variants = buildDestinationAckVariants('Cina');
    assert.ok(variants.length >= 2);

    const first = resolveDestinationAckMessage('Cina');
    const second = resolveDestinationAckMessage('Cina');
    const third = resolveDestinationAckMessage('Cina');

    assert.equal(first, variants[0]);
    assert.equal(second, variants[1]);
    assert.equal(third, variants[2] ?? variants[0]);
  });

  it('reuses cache for same destination key with different casing', () => {
    clearDestinationAckCache();
    resolveDestinationAckMessage('Cina');
    const next = resolveDestinationAckMessage('cina');
    assert.match(next, /meta|foto|immagine/i);
  });

  it('detects destination just set', () => {
    const prev = { profile: { destination: undefined } };
    const next = { profile: { destination: 'Cina' } };
    assert.equal(destinationJustSet(next, prev), true);
    assert.equal(destinationJustSet(next, next), false);
  });

  it('returns deferred duration follow-up', () => {
    const state = { profile: { destination: 'Cina', durationDays: null } };
    assert.equal(followUpAfterDestinationPhotos(state, true), DURATION_FOLLOW_UP);
    assert.equal(followUpAfterDestinationPhotos(state, false), null);
  });
});

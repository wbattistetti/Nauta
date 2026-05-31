import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  dedupePhotos,
  pickApiTripPool,
  resolveHeroPhotoPool,
} from './resolveHeroPhotoPool.ts';
import type { TravelPhoto } from '../travelPhoto.ts';

const p = (id: string, src = `https://example.com/${id}.jpg`): TravelPhoto => ({
  id,
  alt: id,
  src,
});

describe('dedupePhotos', () => {
  it('removes duplicates by id', () => {
    assert.deepEqual(dedupePhotos([p('a'), p('a'), p('b')]), [p('a'), p('b')]);
  });
});

describe('pickApiTripPool', () => {
  it('prefers tripHero over destinationPool and static', () => {
    const trip = [p('trip')];
    const dest = [p('dest')];
    const stat = [p('static')];
    assert.deepEqual(pickApiTripPool(trip, dest, stat), trip);
    assert.deepEqual(pickApiTripPool([], dest, stat), dest);
    assert.deepEqual(pickApiTripPool([], [], stat), stat);
  });
});

describe('resolveHeroPhotoPool', () => {
  const generic = [p('generic')];

  it('returns api pool when at least two photos', () => {
    const api = [p('a'), p('b')];
    assert.deepEqual(
      resolveHeroPhotoPool({ apiPool: api, staticPool: [], genericPool: generic }),
      api
    );
  });

  it('merges static when api has only one photo', () => {
    const api = [p('a')];
    const stat = [p('b'), p('c')];
    assert.deepEqual(
      resolveHeroPhotoPool({ apiPool: api, staticPool: stat, genericPool: generic }),
      [p('a'), p('b'), p('c')]
    );
  });

  it('falls back to generic when all sources empty', () => {
    assert.deepEqual(
      resolveHeroPhotoPool({ apiPool: [], staticPool: [], genericPool: generic }),
      generic
    );
  });
});

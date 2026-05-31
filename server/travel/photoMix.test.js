import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  destinationSearchQuery,
  normalizePlaceKey,
  stopCacheKey,
  stopSearchQuery,
} from './photoQuery.js';
import { resolvePlaceForSearch } from './placeAliases.js';
import { buildTripHeroPhotos } from './photoMix.js';

describe('photoQuery', () => {
  it('builds worldwide destination queries', () => {
    assert.equal(destinationSearchQuery('Sicilia'), 'Sicilia travel landscape');
    assert.equal(destinationSearchQuery('Alaska'), 'Alaska travel landscape');
    assert.equal(destinationSearchQuery('  '), 'travel landscape');
  });

  it('builds stop queries with region or destination context', () => {
    assert.equal(stopSearchQuery('Cefalù', 'Sicilia', 'Italia'), 'Cefalù Sicilia travel');
    assert.equal(stopSearchQuery('Yangon', undefined, 'Birmania'), 'Yangon Myanmar travel');
    assert.equal(stopSearchQuery('Anchorage', 'Alaska', 'USA'), 'Anchorage Alaska travel');
  });

  it('normalizes cache keys', () => {
    assert.equal(normalizePlaceKey('Cefalù'), 'cefalu');
    assert.equal(stopCacheKey('Palermo', 'Sicilia'), 'palermo_sicilia');
  });

  it('maps Italian names to English for search', () => {
    assert.equal(resolvePlaceForSearch('Birmania'), 'Myanmar');
    assert.equal(destinationSearchQuery('Birmania'), 'Myanmar travel landscape');
  });
});

describe('buildTripHeroPhotos', () => {
  const mk = (id, alt) => ({ id, alt, src: `https://example.com/${id}.jpg` });

  it('uses destination pool when no stops', () => {
    const pool = [mk('d1', 'a'), mk('d2', 'b')];
    const hero = buildTripHeroPhotos({ destinationPool: pool, stopSets: {}, stopOrder: [] });
    assert.deepEqual(hero.map((p) => p.id), ['d1', 'd2']);
  });

  it('mixes stop photos round-robin then fills from destination', () => {
    const destinationPool = [mk('g1', 'generic'), mk('g2', 'generic2')];
    const stopSets = {
      cefalu: [mk('c1', 'cefalu 1'), mk('c2', 'cefalu 2')],
      palermo: [mk('p1', 'palermo 1'), mk('p2', 'palermo 2')],
    };
    const hero = buildTripHeroPhotos({
      destinationPool,
      stopSets,
      stopOrder: ['cefalu', 'palermo'],
    });
    assert.deepEqual(hero.map((p) => p.id), ['c1', 'p1', 'c2', 'p2', 'g1', 'g2']);
  });

  it('deduplicates repeated photo ids', () => {
    const shared = mk('x1', 'shared');
    const hero = buildTripHeroPhotos({
      destinationPool: [shared, mk('g2', 'g')],
      stopSets: { a: [shared, mk('a2', 'a')] },
      stopOrder: ['a'],
    });
    assert.equal(hero.filter((p) => p.id === 'x1').length, 1);
  });
});

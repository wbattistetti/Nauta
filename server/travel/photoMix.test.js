import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  destinationSearchQuery,
  isRejectedTravelPhotoText,
  normalizePlaceKey,
  stopCacheKey,
  stopSearchQuery,
} from './photoQuery.js';
import { resolvePlaceForSearch } from './placeAliases.js';
import { buildTripHeroPhotos } from './photoMix.js';
import { curatedDestinationPhotos } from './iconicDestinationPhotos.js';

describe('photoQuery', () => {
  it('builds worldwide destination queries', () => {
    assert.match(destinationSearchQuery('Sicilia'), /Sicilia.*landmark/i);
    assert.match(destinationSearchQuery('Cina'), /Great Wall|China/i);
    assert.match(destinationSearchQuery('  '), /landmark/i);
  });

  it('builds stop queries with region or destination context', () => {
    assert.equal(stopSearchQuery('Cefalù', 'Sicilia', 'Italia'), 'Cefalù Sicilia landmark iconic tourism');
    assert.equal(stopSearchQuery('Yangon', undefined, 'Birmania'), 'Yangon Myanmar landmark iconic tourism');
    assert.equal(stopSearchQuery('Anchorage', 'Alaska', 'USA'), 'Anchorage Alaska landmark iconic tourism');
  });

  it('normalizes cache keys', () => {
    assert.equal(normalizePlaceKey('Cefalù'), 'cefalu');
    assert.equal(stopCacheKey('Palermo', 'Sicilia'), 'palermo_sicilia');
  });

  it('maps Italian names to English for search', () => {
    assert.equal(resolvePlaceForSearch('Birmania'), 'Myanmar');
    assert.match(destinationSearchQuery('Birmania'), /Myanmar/i);
  });

  it('rejects atlas and map-book photo captions', () => {
    assert.equal(isRejectedTravelPhotoText('Old geography atlas on desk'), true);
    assert.equal(isRejectedTravelPhotoText('Atlante geografico'), true);
    assert.equal(isRejectedTravelPhotoText('Panorama of Yangon at sunset'), false);
    assert.equal(isRejectedTravelPhotoText('Atlanta skyline'), false);
  });

  it('returns curated iconic photos for major destinations', () => {
    const china = curatedDestinationPhotos('Cina');
    assert.ok(china.length >= 3);
    assert.match(china[0].alt, /Muraglia/i);
    assert.ok(china[0].src.startsWith('https://'));
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

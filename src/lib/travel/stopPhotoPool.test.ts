import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { photosForStop } from './stopPhotos.ts';
import { stopPhotoKey } from './travelPhoto.ts';
import { stopOrdinalTitle, stopThumbnailPhoto, resolveStopPhotoPool } from './stopPhotoPool.ts';

describe('stopPhotoPool', () => {
  it('stopOrdinalTitle formats index and name', () => {
    assert.equal(stopOrdinalTitle(0, 'Sydney'), '1° Sydney');
    assert.equal(stopOrdinalTitle(2, '  Cairns  '), '3° Cairns');
  });

  it('resolveStopPhotoPool prefers static curated over API pool', () => {
    const apiPhoto = {
      id: 'api-sydney',
      alt: 'API Sydney',
      src: 'https://example.com/sydney.jpg',
    };
    const stop = { name: 'Sydney', region: 'NSW' };
    const pool = resolveStopPhotoPool(
      stop,
      { [stopPhotoKey('Sydney', 'NSW')]: [apiPhoto] },
      'Australia'
    );
    assert.equal(pool[0].id, 'sydney-opera');
  });

  it('stopThumbnailPhoto uses static curated set when API empty', () => {
    const stop = { name: 'Sydney' };
    const thumb = stopThumbnailPhoto(stop, {}, 'Australia');
    const staticFirst = photosForStop('Sydney')[0];
    assert.equal(thumb.src, staticFirst.src);
  });
});

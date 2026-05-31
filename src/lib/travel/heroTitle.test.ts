/**
 * Hero chip title helpers — stop subtitle and caption sanitization.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStopFocusChipSubtitle,
  sanitizeStopPhotoCaption,
} from './heroTitle.ts';
import { genericTravelPlaceholder } from './genericTravelPhotos.ts';

describe('heroTitle', () => {
  it('buildStopFocusChipSubtitle formats stop name and caption', () => {
    assert.equal(
      buildStopFocusChipSubtitle('Siena', 'Campo e torre del Mangia'),
      'Siena: Campo e torre del Mangia'
    );
  });

  it('sanitizeStopPhotoCaption rejects generic placeholder alts', () => {
    const generic = genericTravelPlaceholder()[0];
    assert.equal(sanitizeStopPhotoCaption(generic, 'Siena'), 'in evidenza');
  });

  it('sanitizeStopPhotoCaption keeps real stop photo alts', () => {
    assert.equal(
      sanitizeStopPhotoCaption(
        { id: 'siena-piazza', alt: 'Piazza del Campo', src: 'https://example.com/a.jpg' },
        'Siena'
      ),
      'Piazza del Campo'
    );
  });
});

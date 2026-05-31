/**
 * Wikipedia summary URL building and response parsing.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseWikipediaSummaryResponse,
  wikipediaSummaryApiUrl,
} from './wikipediaSummary.ts';

describe('wikipediaSummary', () => {
  it('wikipediaSummaryApiUrl builds REST endpoint slug', () => {
    assert.equal(
      wikipediaSummaryApiUrl('Pienza'),
      'https://it.wikipedia.org/api/rest_v1/page/summary/Pienza'
    );
    assert.equal(
      wikipediaSummaryApiUrl('Via Francigena'),
      'https://it.wikipedia.org/api/rest_v1/page/summary/Via_Francigena'
    );
  });

  it('parseWikipediaSummaryResponse extracts fields', () => {
    const summary = parseWikipediaSummaryResponse({
      title: 'Pienza',
      extract: 'Pienza è un comune italiano.',
      content_urls: {
        desktop: { page: 'https://it.wikipedia.org/wiki/Pienza' },
      },
      thumbnail: { source: 'https://upload.wikimedia.org/pienza.jpg' },
    });
    assert.deepEqual(summary, {
      title: 'Pienza',
      extract: 'Pienza è un comune italiano.',
      pageUrl: 'https://it.wikipedia.org/wiki/Pienza',
      thumbnailUrl: 'https://upload.wikimedia.org/pienza.jpg',
    });
  });

  it('parseWikipediaSummaryResponse rejects incomplete payload', () => {
    assert.throws(
      () => parseWikipediaSummaryResponse({ title: 'Pienza' }),
      /missing title, extract, or page URL/
    );
  });
});

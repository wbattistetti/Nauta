/**
 * Wikipedia article HTML helpers.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractWikipediaArticleBody,
  normalizeWikipediaArticleHtml,
  parseItalianWikipediaArticleTitle,
  wikipediaMobileHtmlApiUrl,
} from './wikipediaArticle.ts';

describe('wikipediaArticle', () => {
  it('wikipediaMobileHtmlApiUrl builds REST endpoint slug', () => {
    assert.equal(
      wikipediaMobileHtmlApiUrl('Via Francigena'),
      'https://it.wikipedia.org/api/rest_v1/page/mobile-html/Via_Francigena'
    );
  });

  it('extractWikipediaArticleBody returns normalized body HTML', () => {
    const html = '<html><body><p>Test</p><img src="//upload.wikimedia.org/x.jpg" /></body></html>';
    assert.equal(
      extractWikipediaArticleBody(html),
      '<p>Test</p><img src="https://upload.wikimedia.org/x.jpg" />'
    );
  });

  it('normalizeWikipediaArticleHtml fixes protocol-relative URLs', () => {
    assert.equal(
      normalizeWikipediaArticleHtml('<a href="//it.wikipedia.org/wiki/Pienza">P</a>'),
      '<a href="https://it.wikipedia.org/wiki/Pienza">P</a>'
    );
  });

  it('parseItalianWikipediaArticleTitle reads relative wiki links', () => {
    assert.equal(parseItalianWikipediaArticleTitle('./Montalcino'), 'Montalcino');
    assert.equal(
      parseItalianWikipediaArticleTitle("./Val_d'Orcia#Geografia"),
      "Val d'Orcia"
    );
    assert.equal(
      parseItalianWikipediaArticleTitle('https://it.wikipedia.org/wiki/Pienza'),
      'Pienza'
    );
    assert.equal(parseItalianWikipediaArticleTitle('#note'), null);
    assert.equal(
      parseItalianWikipediaArticleTitle('/w/index.php?title=Pienza&action=edit'),
      null
    );
  });
});

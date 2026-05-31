/**
 * Live validation smoke test — skipped unless RUN_WIKI_LIVE=1.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validatePlaceLink } from './wikipediaPlaceLinks.js';

const live = process.env.RUN_WIKI_LIVE === '1';

describe('wikipediaPlaceLinks live', { skip: !live }, () => {
  it('resolves contextual thermal pools link to Bagno Vignoni section', async () => {
    const notes =
      'A Bagno Vignoni puoi rilassarti nelle piscine di acqua calda della piazza delle sorgenti.';
    const result = await validatePlaceLink(
      { label: 'piscine di acqua calda', wikiTitle: 'Bagno Vignoni' },
      notes,
      "Val d'Orcia"
    );
    assert.ok(result);
    assert.equal(result.wikiTitle, 'Bagno Vignoni');
    assert.ok(result.wikiSection);
  });

  it('rejects invented generic film title for thermal pools', async () => {
    const notes =
      'A Bagno Vignoni puoi rilassarti nelle piscine di acqua calda della piazza delle sorgenti.';
    const result = await validatePlaceLink(
      { label: 'piscine di acqua calda', wikiTitle: 'Acqua calda' },
      notes,
      "Val d'Orcia"
    );
    assert.equal(result, null);
  });
});

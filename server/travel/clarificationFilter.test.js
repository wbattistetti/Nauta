import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterClarificationsForPanels } from './clarificationFilter.js';

const fullFacts = {
  destination: 'Italia',
  durationDays: 30,
  period: 'metà giugno – metà luglio',
  likes: [],
  dislikes: [],
};

describe('filterClarificationsForPanels', () => {
  it('keeps traveler question when facts complete and panels empty', () => {
    const clarifications = ['Viaggi da solo, in coppia, in famiglia o con amici?'];
    const out = filterClarificationsForPanels(clarifications, fullFacts);
    assert.deepEqual(out, clarifications);
  });

  it('does not strip famiglia from traveler clarification', () => {
    const q = 'Viaggi in famiglia o da solo?';
    const out = filterClarificationsForPanels([q], fullFacts);
    assert.equal(out[0], q);
  });

  it('drops panel-topic clarifications before facts complete', () => {
    const out = filterClarificationsForPanels(
      ['Che budget preferisci?', 'Quanti giorni?'],
      { likes: [], dislikes: [] }
    );
    assert.deepEqual(out, ['Quanti giorni?']);
  });

  it('returns empty when traveler complete but panels incomplete', () => {
    const out = filterClarificationsForPanels(
      ['Quale stile preferisci?'],
      {
        ...fullFacts,
        travelerType: 'couples',
        ageBand: '25-35',
      }
    );
    assert.deepEqual(out, []);
  });
});

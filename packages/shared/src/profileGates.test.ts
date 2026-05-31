import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isPanelProfileComplete,
  isProfileComplete,
  isTravelFactsComplete,
  isTravelerProfileComplete,
} from './profileGates.js';

describe('profileGates', () => {
  it('isTravelFactsComplete requires destination, days, period', () => {
    assert.equal(isTravelFactsComplete(undefined), false);
    assert.equal(
      isTravelFactsComplete({ destination: 'Sicilia', durationDays: 7, period: 'agosto' }),
      true
    );
    assert.equal(
      isTravelFactsComplete({
        destination: 'Sicilia',
        durationDays: 7,
        periodStart: '2026-08-01',
        periodEnd: '2026-08-07',
      }),
      true
    );
    assert.equal(
      isTravelFactsComplete({ destination: 'Sicilia', durationDays: 7 }),
      false
    );
  });

  it('isPanelProfileComplete requires likes, style, budget', () => {
    assert.equal(
      isPanelProfileComplete({ likes: ['nature'], style: 'equilibrato', budget: 'medio' }),
      true
    );
    assert.equal(
      isPanelProfileComplete({ likes: [], style: 'equilibrato', budget: 'medio' }),
      false
    );
  });

  it('isProfileComplete combines all gates', () => {
    const complete = {
      destination: 'Puglia',
      durationDays: 5,
      period: 'maggio',
      travelerType: 'coppia',
      ageBand: '35-50',
      likes: ['food'],
      style: 'rilassato',
      budget: 'medio',
    };
    assert.equal(isTravelerProfileComplete(complete), true);
    assert.equal(isProfileComplete(complete), true);
  });
});

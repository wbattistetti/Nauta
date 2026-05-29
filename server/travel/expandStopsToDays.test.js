import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { expandStopsToDays } from './expandStopsToDays.js';

describe('expandStopsToDays', () => {
  it('expands multi-day stops sequentially', () => {
    const days = expandStopsToDays([
      { id: 'a', name: 'Roma', days: 2 },
      { id: 'b', name: 'Firenze', days: 1 },
    ]);
    assert.equal(days.length, 3);
    assert.equal(days[0].day, 1);
    assert.equal(days[0].stopName, 'Roma');
    assert.equal(days[2].stopName, 'Firenze');
  });

  it('defaults invalid days to 1', () => {
    const days = expandStopsToDays([{ id: 'x', name: 'X', days: 0 }]);
    assert.equal(days.length, 1);
  });
});

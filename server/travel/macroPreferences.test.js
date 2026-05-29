/**
 * Macro preference state & patches (mirrors src/lib/travel/macroPreferences.ts).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function getMacroVisualState(macroId, profile) {
  const likes = profile.likes ?? [];
  const dislikes = profile.dislikes ?? [];
  if (macroId === 'mare') {
    const themes = ['beach', 'outdoor_sports'];
    if (themes.every((t) => dislikes.includes(t)) && !themes.some((t) => likes.includes(t))) {
      return 'excluded';
    }
    if (themes.some((t) => likes.includes(t))) return 'included';
    return 'neutral';
  }
  return 'neutral';
}

describe('macroPreferences', () => {
  it('marks mare included when beach liked', () => {
    assert.equal(
      getMacroVisualState('mare', { likes: ['beach'], dislikes: [] }),
      'included'
    );
  });

  it('marks mare excluded when all mare themes disliked', () => {
    assert.equal(
      getMacroVisualState('mare', { likes: [], dislikes: ['beach', 'outdoor_sports'] }),
      'excluded'
    );
  });
});

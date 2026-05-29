/**
 * Preference UI layout helpers (mirrors src/lib/travel/preferenceUi.ts).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const VISIBLE = 6;

function splitVisiblePreferences(options) {
  if (options.length <= VISIBLE) {
    return { visible: options, extra: [], hasMore: false };
  }
  return {
    visible: options.slice(0, VISIBLE),
    extra: options.slice(VISIBLE),
    hasMore: true,
  };
}

function getPreferenceVisualState(id, likes, dislikes) {
  if (dislikes.includes(id)) return 'excluded';
  if (likes.includes(id)) return 'included';
  return 'neutral';
}

function buildExclusiveChoicePatch(field, optionId, currentId) {
  const clearing = currentId === optionId;
  if (field === 'style') {
    return clearing ? { style: '', ritmo: '' } : { style: optionId, ritmo: '' };
  }
  return clearing ? { budget: '' } : { budget: optionId };
}

describe('preferenceUi helpers', () => {
  it('splits options when more than six', () => {
    const opts = Array.from({ length: 8 }, (_, i) => `o${i}`);
    const { visible, extra, hasMore } = splitVisiblePreferences(opts);
    assert.equal(visible.length, 6);
    assert.equal(extra.length, 2);
    assert.equal(hasMore, true);
  });

  it('keeps all when six or fewer', () => {
    const { visible, hasMore } = splitVisiblePreferences(['a', 'b']);
    assert.deepEqual(visible, ['a', 'b']);
    assert.equal(hasMore, false);
  });

  it('resolves tri-state from likes and dislikes', () => {
    assert.equal(getPreferenceVisualState('nature', ['nature'], []), 'included');
    assert.equal(getPreferenceVisualState('nature', [], ['nature']), 'excluded');
    assert.equal(getPreferenceVisualState('nature', [], []), 'neutral');
  });

  it('exclusive choice selects, switches, and clears to zero', () => {
    assert.deepEqual(buildExclusiveChoicePatch('style', 'lento', undefined), {
      style: 'lento',
      ritmo: '',
    });
    assert.deepEqual(buildExclusiveChoicePatch('style', 'intenso', 'lento'), {
      style: 'intenso',
      ritmo: '',
    });
    assert.deepEqual(buildExclusiveChoicePatch('style', 'lento', 'lento'), {
      style: '',
      ritmo: '',
    });
    assert.deepEqual(buildExclusiveChoicePatch('budget', 'medio', 'medio'), { budget: '' });
  });
});

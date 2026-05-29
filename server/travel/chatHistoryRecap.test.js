/**
 * Chat recap helpers (mirrors src/lib/travel/chatHistoryRecap.ts).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function sliceSessionChatMessages(fullChat, archivedCount) {
  if (archivedCount <= 0) return fullChat;
  if (fullChat.length <= archivedCount) return [];
  return fullChat.slice(archivedCount);
}

function buildChatHistoryRecapPreview(profile, priorMessageCount) {
  const dest = profile?.destination?.trim();
  if (dest && profile?.durationDays) {
    return `${profile.durationDays} giorni in ${dest} · ${priorMessageCount} messaggi`;
  }
  if (dest) return `Viaggio in ${dest} · ${priorMessageCount} messaggi`;
  return `${priorMessageCount} messaggi nella sessione precedente`;
}

describe('chatHistoryRecap', () => {
  it('slices session messages after archive count', () => {
    const full = [{ id: '1' }, { id: '2' }, { id: '3' }];
    assert.deepEqual(sliceSessionChatMessages(full, 2), [{ id: '3' }]);
    assert.deepEqual(sliceSessionChatMessages(full, 0), full);
  });

  it('builds preview from profile', () => {
    const line = buildChatHistoryRecapPreview(
      { destination: 'Sicilia', durationDays: 20 },
      8
    );
    assert.ok(line.includes('20 giorni'));
    assert.ok(line.includes('Sicilia'));
    assert.ok(line.includes('8'));
  });
});

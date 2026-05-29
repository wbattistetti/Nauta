/**
 * Traveler profile → preference presets (mirrors src/config/travelerPresets.json).
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { sanitizeUserProfile } from './profileSanitize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '../../src/config/travelerPresets.json');

/** @type {{ version: number, defaultPresetId: string, rules: object[], defaultPreset: object }} */
let config;
try {
  config = JSON.parse(readFileSync(configPath, 'utf8'));
} catch (e) {
  console.warn('[travelerPresets] load failed, using inline default', e.message);
  config = {
    defaultPresetId: 'balanced',
    rules: [],
    defaultPreset: { likes: ['nature', 'museums'], dislikes: [], style: 'equilibrato', budget: 'medio' },
  };
}

/**
 * @param {string} [travelerType]
 * @param {string} [ageBand]
 */
export function resolveTravelerPreset(travelerType, ageBand) {
  if (!travelerType || !ageBand) return null;
  const rule = config.rules.find(
    (r) => r.match.travelerType === travelerType && r.match.ageBand === ageBand
  );
  const preset = rule?.preset ?? config.defaultPreset;
  const id = rule?.id ?? config.defaultPresetId;
  return {
    id,
    patch: {
      likes: [...(preset.likes ?? [])],
      dislikes: [...(preset.dislikes ?? [])],
      style: preset.style,
      budget: preset.budget,
      preferencesPresetId: id,
    },
  };
}

/**
 * Apply preset when traveler profile first becomes complete.
 * @param {import('./types.js').TravelState} state
 * @returns {boolean} whether preset was applied
 */
export function applyTravelerPresetIfNeeded(state) {
  const p = state.profile;
  if (!p.travelerType || !p.ageBand) return false;
  if (p.preferencesPresetId) return false;

  const resolved = resolveTravelerPreset(p.travelerType, p.ageBand);
  if (!resolved) return false;

  state.profile = sanitizeUserProfile({
    ...p,
    ...resolved.patch,
    travelerType: p.travelerType,
    ageBand: p.ageBand,
  });
  return true;
}

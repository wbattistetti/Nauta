/**
 * In-memory TTL cache for photo API responses.
 */

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

/** @type {Map<string, { expiresAt: number, value: unknown }>} */
const store = new Map();

/**
 * @template T
 * @param {string} key
 * @returns {T | null}
 */
export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return /** @type {T} */ (entry.value);
}

/**
 * @param {string} key
 * @param {unknown} value
 * @param {number} [ttlMs]
 */
export function cacheSet(key, value, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** Clear cache (tests). */
export function cacheClear() {
  store.clear();
}

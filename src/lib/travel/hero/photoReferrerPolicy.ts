/**
 * Per-host referrer policy for hero images (Wikimedia vs Unsplash).
 */

/** Wikimedia blocks hotlinking with a Referer header; Unsplash expects default policy. */
export function photoReferrerPolicy(src: string): ReferrerPolicy | undefined {
  if (/wikimedia\.org/i.test(src)) return 'no-referrer';
  return undefined;
}

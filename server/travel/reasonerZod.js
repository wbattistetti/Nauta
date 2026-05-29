/**
 * Zod schema + validation for Reasoner output.
 */
import { z } from 'zod';

const profilePatchSchema = z
  .object({
    destination: z.union([z.string(), z.number()]).optional(),
    durationDays: z.union([z.number(), z.string()]).optional(),
    period: z.union([z.string(), z.record(z.unknown())]).optional(),
    periodStart: z.string().optional(),
    periodEnd: z.string().optional(),
    style: z.string().optional(),
    ritmo: z.string().optional(),
    budget: z.string().optional(),
    alloggi: z.string().optional(),
    preferenze: z.string().optional(),
    likes: z.array(z.string()).optional(),
    dislikes: z.array(z.string()).optional(),
    travelerType: z.enum(['solo', 'couples', 'family', 'friends']).optional(),
    ageBand: z.enum(['18-25', '25-35', '35-50', '50+']).optional(),
    preferencesPresetId: z.string().optional(),
    panelsReviewed: z.boolean().optional(),
  })
  .passthrough();

const actionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('update_profile'), patch: profilePatchSchema.default({}) }),
  z.object({ type: z.literal('generate_initial_itinerary') }),
  z.object({ type: z.literal('recalculate_itinerary') }),
  z.object({
    type: z.literal('propose_stop_replacement'),
    stopId: z.string().min(1),
  }),
  z.object({
    type: z.literal('confirm_stop_replacement'),
    stopId: z.string().min(1),
    candidateId: z.string().min(1),
  }),
  z.object({ type: z.literal('confirm_itinerary') }),
  z.object({
    type: z.literal('adjust_stop_days'),
    stopId: z.string().min(1),
    days: z.number().positive(),
  }),
  z.object({ type: z.literal('remove_stop'), stopId: z.string().min(1) }),
  z.object({
    type: z.literal('add_stop'),
    name: z.string().min(1),
    days: z.number().positive(),
    themes: z.array(z.string()).optional(),
  }),
  z.object({ type: z.literal('none') }),
]);

export const reasonerOutputSchema = z.object({
  intent: z.string().default('unknown'),
  actions: z.array(actionSchema).min(1).max(5),
  clarificationsNeeded: z.array(z.string()).default([]),
  needsPlanner: z.boolean().default(false),
  plannerTask: z
    .enum(['generate_initial', 'recalculate', 'replacement_candidates'])
    .nullable()
    .optional(),
  plannerContext: z.record(z.unknown()).optional(),
});

/** @param {unknown} raw @returns {z.infer<typeof reasonerOutputSchema>|null} */
export function parseReasonerWithZod(raw) {
  const result = reasonerOutputSchema.safeParse(raw);
  if (!result.success) {
    console.warn('[reasoner] Zod validation failed', result.error.flatten());
    return null;
  }
  return result.data;
}

import { z } from "zod";
export const goalInput = z.object({ name: z.string().trim().min(1).max(120), targetKobo: z.number().int().positive().max(2_000_000_000), targetDate: z.coerce.date(), frequency: z.enum(["weekly", "monthly"]), preferredKobo: z.number().int().positive().max(2_000_000_000).optional(), linkedAssessmentId: z.string().max(120).optional() });
export const contributionInput = z.object({ amountKobo: z.number().int().positive().max(2_000_000_000), occurredAt: z.coerce.date(), note: z.string().trim().max(500).optional(), providerLabel: z.string().trim().max(100).optional() });
export const updateGoalInput = goalInput.partial().extend({ reason: z.string().trim().min(1).max(300).optional() });

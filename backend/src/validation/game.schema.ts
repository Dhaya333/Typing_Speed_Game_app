import { z } from "zod";

export const submitGameResultSchema = z.object({
  totalTimeMs: z.number().int().positive("totalTimeMs must be a positive integer"),
  correctChars: z.number().int().min(0),
  wrongAttempts: z.number().int().min(0),
  penaltyMs: z.number().int().min(0),
});

export type SubmitGameResultInput = z.infer<typeof submitGameResultSchema>;
import { z } from 'zod';
import { workingModeSchema } from './enums';
import { uuidSchema, queryBooleanSchema } from './common';

/** Full reporter entity (DB row shape). */
export const reporterSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  location: z.string(),
  workMode: workingModeSchema,
  isAvailable: z.boolean(),
  ratePerMinute: z.number().int(),
  currentJobId: uuidSchema.nullable(),
});
export type Reporter = z.infer<typeof reporterSchema>;

/** POST /reporters body. */
export const createReporterSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  workMode: workingModeSchema,
  ratePerMinute: z.number().int().positive(),
});
export type CreateReporterInput = z.infer<typeof createReporterSchema>;

/** PATCH /reporters/:id body. */
export const updateReporterSchema = createReporterSchema.partial();
export type UpdateReporterInput = z.infer<typeof updateReporterSchema>;

/** GET /reporters?available=&location= query. */
export const reporterQuerySchema = z.object({
  available: queryBooleanSchema.optional(),
  location: z.string().optional(),
});
export type ReporterQuery = z.infer<typeof reporterQuerySchema>;

/** GET /reporters/:id/candidates?job_id= query. */
export const reporterCandidatesQuerySchema = z.object({
  jobId: uuidSchema,
});
export type ReporterCandidatesQuery = z.infer<
  typeof reporterCandidatesQuerySchema
>;

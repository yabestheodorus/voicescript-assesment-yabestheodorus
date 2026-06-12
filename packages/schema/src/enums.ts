import { z } from 'zod';

/**
 * Job/reporter work mode. Wire values are lowercase to match the API
 * contract in db_api_schema.md (`"location": "physical"`). These map to the
 * Prisma `WorkingMode` enum (PHYSICAL / REMOTE) in the service layer.
 */
export const workingModeSchema = z.enum(['physical', 'remote']);
export type WorkingMode = z.infer<typeof workingModeSchema>;

/** Job lifecycle: NEW → ASSIGNED → TRANSCRIBED → REVIEWED → COMPLETED. */
export const jobStatusSchema = z.enum([
  'NEW',
  'ASSIGNED',
  'TRANSCRIBED',
  'REVIEWED',
  'COMPLETED',
]);
export type JobStatus = z.infer<typeof jobStatusSchema>;

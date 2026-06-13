import { z } from 'zod';
import { workingModeSchema, jobStatusSchema } from './enums';
import { uuidSchema } from './common';
import { reporterSchema } from './reporter';
import { paymentSchema } from './payment';

/** Full job entity (DB row shape). Timestamps accept ISO strings or Dates. */
export const jobSchema = z.object({
  id: uuidSchema,
  caseNumber: z.string(),
  caseName: z.string(),
  duration: z.number().int(),
  location: workingModeSchema,
  city: z.string().nullable(),
  status: jobStatusSchema,
  createdAt: z.coerce.date(),
  assignedAt: z.coerce.date().nullable(),
  transcribedAt: z.coerce.date().nullable(),
  reviewAssignedAt: z.coerce.date().nullable(),
  reviewedAt: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  transcribeJobStartedAt: z.coerce.date().nullable(),
  reviewJobStartedAt: z.coerce.date().nullable(),
  reporterId: uuidSchema.nullable(),
  editorId: uuidSchema.nullable(),
});
export type Job = z.infer<typeof jobSchema>;

/**
 * GET /jobs/:id response — the job plus its assigned reporter and payment
 * snapshot (both null until assigned / completed). Used by the detail page.
 */
export const jobDetailSchema = jobSchema.extend({
  reporter: reporterSchema.nullable(),
  payment: paymentSchema.nullable(),
});
export type JobDetail = z.infer<typeof jobDetailSchema>;

/** Shared fields for create/update — refined separately below. */
const jobInputBase = z.object({
  caseNumber: z.string().min(1).max(100),
  caseName: z.string().min(1).max(255),
  location: workingModeSchema,
  /** Required for physical jobs (matched against reporter location). */
  city: z.string().min(1).max(100).optional(),
});

/** POST /jobs body. A physical job must carry a `city`. */
export const createJobSchema = jobInputBase.superRefine((value, ctx) => {
  if (value.location === 'physical' && !value.city) {
    ctx.addIssue({
      code: 'custom',
      path: ['city'],
      message: 'city is required for physical jobs',
    });
  }
});
export type CreateJobInput = z.infer<typeof createJobSchema>;

/** PATCH /jobs/:id body. */
export const updateJobSchema = jobInputBase.partial();
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

/** GET /jobs?status= query. */
export const jobQuerySchema = z.object({
  status: jobStatusSchema.optional(),
});
export type JobQuery = z.infer<typeof jobQuerySchema>;

/** POST /jobs/:id/assign-reporter body. */
export const assignReporterSchema = z.object({
  reporterId: uuidSchema,
});
export type AssignReporterInput = z.infer<typeof assignReporterSchema>;

/** POST /jobs/:id/assign-editor body. */
export const assignEditorSchema = z.object({
  editorId: uuidSchema,
});
export type AssignEditorInput = z.infer<typeof assignEditorSchema>;

/** POST /jobs/:id/finish-transcribe body — operator enters when it finished. */
export const finishTranscribeSchema = z.object({
  transcribedAt: z.coerce.date(),
});
export type FinishTranscribeInput = z.infer<typeof finishTranscribeSchema>;

import { z } from 'zod';
import { uuidSchema } from './common';
import { jobStatusSchema } from './enums';

/** Full payment entity (DB snapshot row). */
export const paymentSchema = z.object({
  id: uuidSchema,
  jobId: uuidSchema,
  reporterId: uuidSchema,
  editorId: uuidSchema,
  transcribePaymentAmount: z.number().int(),
  reviewPaymentAmount: z.number().int(),
  totalPayout: z.number().int(),
  transcribeDuration: z.number().int(),
});
export type Payment = z.infer<typeof paymentSchema>;

/**
 * GET /jobs/:id/payment response — per-job earnings breakdown.
 *   transcribePaymentAmount = reporter.ratePerMinute × job.duration
 *   reviewPaymentAmount     = editor.flatFee
 *   totalPayout             = transcribe + review
 */
export const jobPaymentResponseSchema = z.object({
  jobId: uuidSchema,
  transcribeDuration: z.number().int(),
  transcribePaymentAmount: z.number().int(),
  reviewPaymentAmount: z.number().int(),
  totalPayout: z.number().int(),
});
export type JobPaymentResponse = z.infer<typeof jobPaymentResponseSchema>;

/**
 * GET /payments list item — the payment snapshot joined with the names needed
 * to render the payouts table. A payment only exists once a job is reviewed, so
 * its settlement state is derived from the job:
 *   job REVIEWED  → Pending (awaiting payout)
 *   job COMPLETED → Paid
 *
 * The job shape is inlined (rather than importing `jobSchema`) because `job.ts`
 * already imports this module — importing it back would be circular.
 */
export const paymentListItemSchema = paymentSchema.extend({
  job: z.object({
    id: uuidSchema,
    caseName: z.string(),
    caseNumber: z.string(),
    status: jobStatusSchema,
    reviewedAt: z.coerce.date().nullable(),
    completedAt: z.coerce.date().nullable(),
  }),
  reporter: z.object({ id: uuidSchema, name: z.string() }),
  editor: z.object({ id: uuidSchema, name: z.string() }),
});
export type PaymentListItem = z.infer<typeof paymentListItemSchema>;

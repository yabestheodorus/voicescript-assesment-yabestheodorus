import { z } from 'zod';
import { uuidSchema } from './common';

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

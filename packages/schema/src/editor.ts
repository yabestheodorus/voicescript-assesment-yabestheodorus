import { z } from 'zod';
import { uuidSchema, queryBooleanSchema } from './common';

/** Full editor entity (DB row shape). */
export const editorSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  isAvailable: z.boolean(),
  flatFee: z.number().int(),
  currentJobId: uuidSchema.nullable(),
});
export type Editor = z.infer<typeof editorSchema>;

/** POST /editors body. */
export const createEditorSchema = z.object({
  name: z.string().min(1).max(100),
  flatFee: z.number().int().positive(),
});
export type CreateEditorInput = z.infer<typeof createEditorSchema>;

/** PATCH /editors/:id body. */
export const updateEditorSchema = createEditorSchema.partial();
export type UpdateEditorInput = z.infer<typeof updateEditorSchema>;

/** GET /editors?available= query. */
export const editorQuerySchema = z.object({
  available: queryBooleanSchema.optional(),
});
export type EditorQuery = z.infer<typeof editorQuerySchema>;

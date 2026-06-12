import { z } from 'zod';

/** All entity IDs are UUID strings (see Prisma schema). */
export const uuidSchema = z.string().uuid();

/** `:id` route param shared by detail / action endpoints. */
export const idParamSchema = z.object({ id: uuidSchema });
export type IdParam = z.infer<typeof idParamSchema>;

/**
 * Booleans arrive from query strings as "true" / "false". Use this for
 * `?available=true`-style filters so they parse into real booleans.
 */
export const queryBooleanSchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

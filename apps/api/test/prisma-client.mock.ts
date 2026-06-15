/**
 * Test stand-in for the generated Prisma client. The real client uses
 * `import.meta` (ESM) which ts-jest's CommonJS transform can't load, and unit
 * tests provide a mocked PrismaService anyway. This only needs to satisfy
 * `class PrismaService extends PrismaClient` and the `Prisma.PrismaClient*`
 * error checks in the services.
 */
export class PrismaClient {}

export class PrismaClientKnownRequestError extends Error {
  code: string;
  meta?: Record<string, unknown>;
  clientVersion?: string;

  constructor(
    message: string,
    options: { code: string; clientVersion?: string; meta?: Record<string, unknown> },
  ) {
    super(message);
    this.name = 'PrismaClientKnownRequestError';
    this.code = options.code;
    this.clientVersion = options.clientVersion;
    this.meta = options.meta;
  }
}

export const Prisma = { PrismaClientKnownRequestError };

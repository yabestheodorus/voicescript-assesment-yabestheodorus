import { nestConfig } from '@repo/jest-config';

export default {
  ...nestConfig,
  // The app uses non-relative `src/...` imports (tsconfig baseUrl); map them
  // so ts-jest can resolve them. rootDir is `src`, so `src/x` → `<rootDir>/x`.
  moduleNameMapper: {
    // The generated Prisma client uses `import.meta`; swap it for a CJS-safe
    // stub in tests (PrismaService is mocked, so the real client isn't needed).
    'generated/prisma/client$': '<rootDir>/../test/prisma-client.mock.ts',
    '^src/(.*)$': '<rootDir>/$1',
  },
};

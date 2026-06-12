import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';

/**
 * Indonesian court-reporting use case. Names, cities, and rates (in IDR/min)
 * reflect a local agency. Keep this small — 3 reporters.
 */
const REPORTERS = [
  {
    name: 'Budi Santoso',
    location: 'Jakarta',
    workMode: 'physical' as const,
    isAvailable: false,
    ratePerMinute: 2500,
  },
  {
    name: 'Siti Rahmawati',
    location: 'Bandung',
    workMode: 'remote' as const,
    isAvailable: true,
    ratePerMinute: 2000,
  },
  {
    name: 'Agus Pratama',
    location: 'Surabaya',
    workMode: 'physical' as const,
    isAvailable: true,
    ratePerMinute: 2200,
  },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    // Clear the reporters table before seeding.
    const { count: removed } = await prisma.reporters.deleteMany();
    console.log(`Cleared ${removed} existing reporter(s).`);

    await prisma.reporters.createMany({ data: REPORTERS });
    const total = await prisma.reporters.count();
    console.log(`Seeded ${total} Indonesian reporter(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';

/**
 * Indonesian court-reporting use case. Names, cities, and rates (in IDR/min)
 * reflect a local agency. Cities are drawn from the app's city list so they
 * match jobs created from the UI. All reporters start available.
 */
const REPORTERS = [
  { name: 'Budi Santoso', location: 'Jakarta', workMode: 'physical' as const, isAvailable: true, ratePerMinute: 2500 },
  { name: 'Siti Rahmawati', location: 'Bandung', workMode: 'remote' as const, isAvailable: true, ratePerMinute: 2000 },
  { name: 'Agus Pratama', location: 'Surabaya', workMode: 'physical' as const, isAvailable: true, ratePerMinute: 2200 },
  { name: 'Dewi Lestari', location: 'Jakarta', workMode: 'remote' as const, isAvailable: true, ratePerMinute: 2600 },
  { name: 'Rizki Hidayat', location: 'Medan', workMode: 'physical' as const, isAvailable: true, ratePerMinute: 1900 },
  { name: 'Putri Anggraini', location: 'Semarang', workMode: 'remote' as const, isAvailable: true, ratePerMinute: 2100 },
  { name: 'Eko Nugroho', location: 'Yogyakarta', workMode: 'physical' as const, isAvailable: true, ratePerMinute: 2300 },
  { name: 'Maya Sari', location: 'Makassar', workMode: 'remote' as const, isAvailable: true, ratePerMinute: 1850 },
  { name: 'Fajar Ramadhan', location: 'Palembang', workMode: 'physical' as const, isAvailable: true, ratePerMinute: 2000 },
  { name: 'Nurul Aini', location: 'Denpasar', workMode: 'remote' as const, isAvailable: true, ratePerMinute: 2700 },
  { name: 'Hendra Wijaya', location: 'Surabaya', workMode: 'remote' as const, isAvailable: true, ratePerMinute: 2150 },
  { name: 'Lina Marlina', location: 'Bandung', workMode: 'physical' as const, isAvailable: true, ratePerMinute: 1950 },
  { name: 'Andi Saputra', location: 'Balikpapan', workMode: 'physical' as const, isAvailable: true, ratePerMinute: 2400 },
  { name: 'Ratna Dewi', location: 'Malang', workMode: 'remote' as const, isAvailable: true, ratePerMinute: 1800 },
  { name: 'Yusuf Maulana', location: 'Batam', workMode: 'physical' as const, isAvailable: true, ratePerMinute: 2250 },
  { name: 'Indah Permata', location: 'Pekanbaru', workMode: 'remote' as const, isAvailable: true, ratePerMinute: 2050 },
  { name: 'Bayu Kurniawan', location: 'Jakarta', workMode: 'physical' as const, isAvailable: true, ratePerMinute: 2800 },
  { name: 'Sari Wulandari', location: 'Padang', workMode: 'remote' as const, isAvailable: true, ratePerMinute: 1900 },
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

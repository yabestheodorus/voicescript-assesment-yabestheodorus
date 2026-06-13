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

/**
 * Editors review transcripts remotely (no location) and are paid a flat fee
 * per job (in IDR). All start available.
 */
const EDITORS = [
  { name: 'Clara Wijaya', isAvailable: true, flatFee: 150000 },
  { name: 'Daniel Tanu', isAvailable: true, flatFee: 175000 },
  { name: 'Erika Halim', isAvailable: true, flatFee: 140000 },
  { name: 'Gilang Pradana', isAvailable: true, flatFee: 160000 },
  { name: 'Hana Kusuma', isAvailable: true, flatFee: 185000 },
  { name: 'Irfan Maulana', isAvailable: true, flatFee: 155000 },
  { name: 'Jessica Tanjung', isAvailable: true, flatFee: 170000 },
  { name: 'Kevin Susanto', isAvailable: true, flatFee: 145000 },
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
    const { count: removedReporters } = await prisma.reporters.deleteMany();
    console.log(`Cleared ${removedReporters} existing reporter(s).`);

    await prisma.reporters.createMany({ data: REPORTERS });
    const totalReporters = await prisma.reporters.count();
    console.log(`Seeded ${totalReporters} Indonesian reporter(s).`);

    // Clear the editors table before seeding.
    const { count: removedEditors } = await prisma.editor.deleteMany();
    console.log(`Cleared ${removedEditors} existing editor(s).`);

    await prisma.editor.createMany({ data: EDITORS });
    const totalEditors = await prisma.editor.count();
    console.log(`Seeded ${totalEditors} editor(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

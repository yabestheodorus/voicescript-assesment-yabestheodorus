/**
 * List of major Indonesian cities for job location selection.
 * This list covers provincial capitals and major urban centers.
 */
export const INDONESIAN_CITIES = [
  'Jakarta',
  'Surabaya',
  'Bandung',
  'Medan',
  'Semarang',
  'Makassar',
  'Palembang',
  'Tangerang',
  'Depok',
  'Semarang',
  'Bekasi',
  'Tangerang Selatan',
  'Bogor',
  'Batam',
  'Pekanbaru',
  'Bandar Lampung',
  'Malang',
  'Padang',
  'Denpasar',
  'Samarinda',
  'Banjarmasin',
  'Serang',
  'Tasikmalaya',
  'Pontianak',
  'Cimahi',
  'Balikpapan',
  'Jambi',
  'Surakarta',
  'Mataram',
  'Manado',
  'Yogyakarta',
  'Ambon',
  'Kupang',
  'Jayapura',
] as const;

export type IndonesianCity = (typeof INDONESIAN_CITIES)[number];
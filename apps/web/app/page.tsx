import { redirect } from 'next/navigation';

// The dashboard was removed; Jobs is the app's landing page.
export default function HomePage() {
  redirect('/jobs');
}

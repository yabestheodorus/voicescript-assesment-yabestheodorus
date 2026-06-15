import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { DashboardShell } from '@repo/components/layout/dashboard-shell';
import { getJobCount, getPaymentCount } from '../lib/api';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VoiceScript — Reporter Agency Console',
  description:
    'Admin dashboard for managing court-reporting jobs, reporters, and payments.',
  icons: { icon: '/favicon-192.png' },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [jobCount, paymentCount] = await Promise.all([
    getJobCount(),
    getPaymentCount(),
  ]);

  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <DashboardShell
          jobCount={jobCount.ok ? jobCount.data : 0}
          paymentCount={paymentCount.ok ? paymentCount.data : 0}
        >
          {children}
        </DashboardShell>
      </body>
    </html>
  );
}

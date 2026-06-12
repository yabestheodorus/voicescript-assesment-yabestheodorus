import Link from 'next/link';
import { PageHeader } from '@repo/components/ui/page-header';
import { StatCard } from '@repo/components/ui/stat-card';
import { Card, CardHeader, CardBody } from '@repo/components/ui/card';
import { StatusBadge } from '@repo/components/ui/status-badge';
import { Avatar } from '@repo/components/ui/avatar';
import { ProgressBar } from '@repo/components/ui/progress-bar';
import { buttonClasses } from '@repo/components/ui/button';
import {
  DataTable,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from '@repo/components/ui/data-table';
import {
  FiBriefcase,
  FiClock,
  FiCheckCircle,
  FiDollarSign,
  FiArrowUpRight,
  FiCalendar,
  FiMapPin,
} from '@repo/components/icons';

const STATS = [
  {
    label: 'Active Jobs',
    value: '24',
    icon: FiBriefcase,
    delta: '12%',
    trend: 'up' as const,
    hint: 'vs. last month',
  },
  {
    label: 'Awaiting Transcription',
    value: '8',
    icon: FiClock,
    delta: '3%',
    trend: 'down' as const,
    hint: '2 due today',
  },
  {
    label: 'Delivered This Month',
    value: '146',
    icon: FiCheckCircle,
    delta: '9%',
    trend: 'up' as const,
    hint: '98% on time',
  },
  {
    label: 'Revenue (MTD)',
    value: '$82,400',
    icon: FiDollarSign,
    delta: '14%',
    trend: 'up' as const,
    hint: '$11.2k outstanding',
  },
];

const RECENT_JOBS = [
  {
    id: 'JOB-2041',
    caption: 'Hartwell v. Northgate Ins.',
    type: 'Deposition',
    reporter: 'Maria Solis',
    date: 'Jun 12, 2026',
    status: 'In Progress',
  },
  {
    id: 'JOB-2040',
    caption: 'State v. Calderon',
    type: 'Court Hearing',
    reporter: 'James Okafor',
    date: 'Jun 12, 2026',
    status: 'Transcribing',
  },
  {
    id: 'JOB-2039',
    caption: 'Redmond Estate Arbitration',
    type: 'Arbitration',
    reporter: 'Priya Nair',
    date: 'Jun 11, 2026',
    status: 'Review',
  },
  {
    id: 'JOB-2038',
    caption: 'Bayfront Holdings EUO',
    type: 'EUO',
    reporter: 'Daniel Cho',
    date: 'Jun 11, 2026',
    status: 'Delivered',
  },
  {
    id: 'JOB-2037',
    caption: 'Whitaker v. Meridian Health',
    type: 'Deposition',
    reporter: 'Maria Solis',
    date: 'Jun 10, 2026',
    status: 'Delivered',
  },
];

const SCHEDULE = [
  {
    time: '09:00 AM',
    caption: 'Lindqvist v. Aero Dynamics',
    location: 'Downtown · Suite 1200',
    reporter: 'James Okafor',
  },
  {
    time: '11:30 AM',
    caption: 'Re: Sandoval Trust',
    location: 'Remote · Zoom',
    reporter: 'Priya Nair',
  },
  {
    time: '02:00 PM',
    caption: 'Coastal Freight v. DLT',
    location: 'County Courthouse · Rm 4B',
    reporter: 'Maria Solis',
  },
];

const WORKLOAD = [
  { name: 'Maria Solis', jobs: 6, capacity: 85 },
  { name: 'James Okafor', jobs: 4, capacity: 60 },
  { name: 'Priya Nair', jobs: 5, capacity: 72 },
  { name: 'Daniel Cho', jobs: 3, capacity: 40 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back, Dana"
        description="Here's what's happening across your reporting agency today."
        actions={
          <Link href="/jobs" className={buttonClasses('primary')}>
            <FiBriefcase className="size-4" />
            View all jobs
          </Link>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent jobs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent jobs"
              description="Latest activity across all matters"
              action={
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  View all <FiArrowUpRight className="size-4" />
                </Link>
              }
            />
            <DataTable>
              <THead>
                <TR>
                  <TH>Matter</TH>
                  <TH>Reporter</TH>
                  <TH>Date</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {RECENT_JOBS.map((job) => (
                  <TR key={job.id}>
                    <TD>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-medium text-surface-800 hover:text-brand-600"
                      >
                        {job.caption}
                      </Link>
                      <div className="text-xs text-surface-400">
                        {job.id} · {job.type}
                      </div>
                    </TD>
                    <TD className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar name={job.reporter} size="sm" />
                        <span className="text-sm">{job.reporter}</span>
                      </div>
                    </TD>
                    <TD className="whitespace-nowrap text-sm text-surface-500">
                      {job.date}
                    </TD>
                    <TD>
                      <StatusBadge status={job.status} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </DataTable>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Today's schedule" description="Wed, Jun 12" />
            <CardBody className="space-y-4">
              {SCHEDULE.map((item) => (
                <div key={item.caption} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <FiCalendar className="size-4" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-brand-600">
                      {item.time}
                    </p>
                    <p className="truncate text-sm font-medium text-surface-800">
                      {item.caption}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-surface-400">
                      <FiMapPin className="size-3" />
                      {item.location}
                    </p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Reporter workload" />
            <CardBody className="space-y-4">
              {WORKLOAD.map((r) => (
                <div key={r.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-surface-700">
                      <Avatar name={r.name} size="sm" />
                      {r.name}
                    </span>
                    <span className="text-xs text-surface-400">
                      {r.jobs} jobs
                    </span>
                  </div>
                  <ProgressBar
                    value={r.capacity}
                    tone={
                      r.capacity > 80
                        ? 'danger'
                        : r.capacity > 65
                          ? 'warning'
                          : 'success'
                    }
                  />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

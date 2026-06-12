import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@repo/components/ui/card';
import { StatusBadge } from '@repo/components/ui/status-badge';
import { Avatar } from '@repo/components/ui/avatar';
import { Badge } from '@repo/components/ui/badge';
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
  FiArrowLeft,
  FiStar,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
} from '@repo/components/icons';

const ASSIGNED = [
  {
    id: 'JOB-2041',
    caption: 'Hartwell v. Northgate Ins.',
    date: 'Jun 12, 2026',
    status: 'In Progress',
  },
  {
    id: 'JOB-2037',
    caption: 'Whitaker v. Meridian Health',
    date: 'Jun 10, 2026',
    status: 'Delivered',
  },
  {
    id: 'JOB-2029',
    caption: 'Calloway v. Pinnacle Auto',
    date: 'Jun 6, 2026',
    status: 'Delivered',
  },
  {
    id: 'JOB-2021',
    caption: 'In re: Garrison Holdings',
    date: 'Jun 2, 2026',
    status: 'Delivered',
  },
];

const STATS = [
  { label: 'Jobs completed', value: '312', icon: FiCheckCircle },
  { label: 'On-time rate', value: '99.1%', icon: FiClock },
  { label: 'Active jobs', value: '6', icon: FiBriefcase },
];

export default async function ReporterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Link
        href="/reporters"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-500 transition-colors hover:text-surface-800"
      >
        <FiArrowLeft className="size-4" />
        Back to reporters
      </Link>

      {/* Profile header */}
      <Card>
        <CardBody>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar name="Maria Solis" size="lg" className="size-20 text-xl" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-heading text-2xl font-bold tracking-tight text-surface-900">
                    Maria Solis
                  </h1>
                  <StatusBadge status="Busy" />
                </div>
                <p className="mt-0.5 text-sm text-surface-500">
                  {id} · Registered Professional Reporter (RPR, CRR)
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-surface-500">
                  <span className="flex items-center gap-1.5">
                    <FiStar className="size-4 text-warning-500" />
                    <span className="font-semibold text-surface-700">4.9</span>{' '}
                    rating
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiMapPin className="size-4" />
                    Portland, OR
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className={buttonClasses('secondary')}>
                <FiMail className="size-4" />
                Message
              </button>
              <button className={buttonClasses('primary')}>
                <FiBriefcase className="size-4" />
                Assign job
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-surface-200 bg-surface-0 p-4 shadow-sm"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <s.icon className="size-4" />
                </span>
                <p className="mt-3 font-heading text-xl font-bold text-surface-900">
                  {s.value}
                </p>
                <p className="text-xs text-surface-500">{s.label}</p>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader title="Assigned jobs" description="Recent assignments" />
            <DataTable>
              <THead>
                <TR>
                  <TH>Matter</TH>
                  <TH>Date</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {ASSIGNED.map((job) => (
                  <TR key={job.id}>
                    <TD>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-medium text-surface-800 hover:text-brand-600"
                      >
                        {job.caption}
                      </Link>
                      <div className="text-xs text-surface-400">{job.id}</div>
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

        {/* Side */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Current capacity" />
            <CardBody>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-surface-700">6 active jobs</span>
                <span className="text-surface-500">85%</span>
              </div>
              <ProgressBar value={85} tone="danger" />
              <p className="mt-2 text-xs text-surface-400">
                Near capacity — consider redistributing new assignments.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Contact" />
            <CardBody className="space-y-3 text-sm">
              <p className="flex items-center gap-3 text-surface-600">
                <FiMail className="size-4 text-surface-400" />
                maria.solis@voicescript.agency
              </p>
              <p className="flex items-center gap-3 text-surface-600">
                <FiPhone className="size-4 text-surface-400" />
                +1 (503) 555-0142
              </p>
              <p className="flex items-center gap-3 text-surface-600">
                <FiMapPin className="size-4 text-surface-400" />
                Portland, OR · Pacific Time
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Specialties" />
            <CardBody className="flex flex-wrap gap-1.5">
              {['Deposition', 'Medical', 'Technical', 'Realtime', 'Video sync'].map(
                (s) => (
                  <Badge key={s} tone="brand">
                    {s}
                  </Badge>
                ),
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

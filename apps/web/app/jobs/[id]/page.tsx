import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { JobStatus } from '@repo/schema';
import { getJob } from '../../../lib/api';
import { SetJobBreadcrumb } from '@repo/components/layout/breadcrumb-store';
import { Card, CardHeader, CardBody } from '@repo/components/ui/card';
import { StatusBadge } from '@repo/components/ui/status-badge';
import { Avatar } from '@repo/components/ui/avatar';
import { Badge } from '@repo/components/ui/badge';
import { buttonClasses } from '@repo/components/ui/button';
import {
  FiArrowLeft,
  FiDownload,
  FiEdit2,
  FiCalendar,
  FiMapPin,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiMic,
  FiDollarSign,
} from '@repo/components/icons';

// Always reflect the live database for this detail view.
export const dynamic = 'force-dynamic';

/** Map the DB job status to a human-readable label the StatusBadge styles. */
const STATUS_LABELS: Record<JobStatus, string> = {
  NEW: 'Scheduled',
  ASSIGNED: 'In Progress',
  TRANSCRIBED: 'Transcribing',
  REVIEWED: 'Review',
  COMPLETED: 'Completed',
};

const TIMELINE = [
  { label: 'Job created', time: 'Jun 8, 2026 · 10:14 AM', done: true },
  { label: 'Reporter assigned', time: 'Jun 8, 2026 · 11:02 AM', done: true },
  { label: 'Proceeding recorded', time: 'Jun 12, 2026 · 02:40 PM', done: true },
  { label: 'Transcription in progress', time: 'Started Jun 12, 2026', done: false, current: true },
  { label: 'Quality review', time: 'Pending', done: false },
  { label: 'Delivered to client', time: 'Est. Jun 15, 2026', done: false },
];

const FILES = [
  { name: 'Audio recording — Session 1.wav', size: '412 MB', kind: 'Audio' },
  { name: 'Exhibit A — Contract.pdf', size: '1.2 MB', kind: 'Exhibit' },
  { name: 'Exhibit B — Email thread.pdf', size: '880 KB', kind: 'Exhibit' },
  { name: 'Rough draft transcript.txt', size: '64 KB', kind: 'Draft' },
];

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FiCalendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-surface-100 text-surface-500">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-xs text-surface-400">{label}</p>
        <p className="text-sm font-medium text-surface-800">{value}</p>
      </div>
    </div>
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getJob(id);
  if (!result.ok) {
    notFound();
  }
  const job = result.data;

  return (
    <div className="space-y-6">
      {/* Show the job's case number (not its UUID) in the header breadcrumb. */}
      <SetJobBreadcrumb title={job.caseNumber} />

      {/* Back + header */}
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-500 transition-colors hover:text-surface-800"
        >
          <FiArrowLeft className="size-4" />
          Back to jobs
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-surface-900">
              {job.caseName}
            </h1>
            <StatusBadge status={STATUS_LABELS[job.status]} />
          </div>
          <p className="mt-1 text-sm text-surface-500">
            {job.caseNumber} · <span className="capitalize">{job.location}</span>
            {job.city ? ` · ${job.city}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className={buttonClasses('secondary')}>
            <FiEdit2 className="size-4" />
            Edit
          </button>
          <button className={buttonClasses('primary')}>
            <FiDownload className="size-4" />
            Download transcript
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Proceeding details" />
            <CardBody>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoRow icon={FiCalendar} label="Date & time" value="Jun 12, 2026 · 09:00 AM" />
                <InfoRow icon={FiMapPin} label="Location" value="Downtown Office · Suite 1200" />
                <InfoRow icon={FiMic} label="Format" value="In-person · Stenographic" />
                <InfoRow icon={FiFileText} label="Page count" value="142 pages (rough)" />
                <InfoRow icon={FiClock} label="Turnaround" value="Standard (3 business days)" />
                <InfoRow icon={FiCheckCircle} label="Certification" value="Certified copy requested" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Files & exhibits"
              description="4 attachments"
              action={
                <button className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  Upload
                </button>
              }
            />
            <CardBody className="space-y-2">
              {FILES.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between rounded-lg border border-surface-100 px-3 py-2.5 transition-colors hover:bg-surface-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <FiFileText className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-surface-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-surface-400">{file.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone="neutral">{file.kind}</Badge>
                    <button
                      className="text-surface-400 hover:text-brand-600"
                      aria-label="Download file"
                    >
                      <FiDownload className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Assigned reporter" />
            <CardBody>
              <div className="flex items-center gap-3">
                <Avatar name="Maria Solis" size="lg" />
                <div>
                  <p className="font-semibold text-surface-800">Maria Solis</p>
                  <p className="text-sm text-surface-500">
                    RPR, CRR · 8 yrs experience
                  </p>
                  <div className="mt-1">
                    <StatusBadge status="Busy" />
                  </div>
                </div>
              </div>
              <Link
                href="/reporters/RPT-104"
                className={buttonClasses('secondary', 'sm', 'mt-4 w-full')}
              >
                View profile
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Progress" />
            <CardBody>
              <ol className="relative space-y-5 before:absolute before:left-[11px] before:top-1 before:h-[calc(100%-1rem)] before:w-px before:bg-surface-200">
                {TIMELINE.map((step) => (
                  <li key={step.label} className="relative flex gap-3">
                    <span
                      className={
                        step.done
                          ? 'z-10 flex size-6 items-center justify-center rounded-full bg-success-500 text-white'
                          : step.current
                            ? 'z-10 flex size-6 items-center justify-center rounded-full bg-brand-600 text-white ring-4 ring-brand-100'
                            : 'z-10 flex size-6 items-center justify-center rounded-full bg-surface-200 text-surface-400'
                      }
                    >
                      {step.done ? (
                        <FiCheckCircle className="size-3.5" />
                      ) : (
                        <span className="size-2 rounded-full bg-current" />
                      )}
                    </span>
                    <div className="-mt-0.5">
                      <p
                        className={
                          step.current
                            ? 'text-sm font-semibold text-surface-900'
                            : 'text-sm font-medium text-surface-700'
                        }
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-surface-400">{step.time}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Billing" />
            <CardBody className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-500">Original (142 pg)</span>
                <span className="font-medium text-surface-800">$1,420.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Certified copy</span>
                <span className="font-medium text-surface-800">$284.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Exhibits (2)</span>
                <span className="font-medium text-surface-800">$48.00</span>
              </div>
              <div className="flex justify-between border-t border-surface-100 pt-3">
                <span className="font-semibold text-surface-800">
                  <FiDollarSign className="mr-1 inline size-4 text-surface-400" />
                  Total
                </span>
                <span className="font-heading text-lg font-bold text-surface-900">
                  $1,752.00
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

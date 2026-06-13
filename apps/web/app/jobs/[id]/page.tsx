import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { JobStatus, JobDetail, Reporter } from '@repo/schema';
import { getJob, getReporters } from '../../../lib/api';
import { SetJobBreadcrumb } from '@repo/components/layout/breadcrumb-store';
import { AssignReporterDialog } from './assign-reporter-dialog';
import { FinishTranscribeButton } from './finish-transcribe-button';
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

const STATUS_LABELS: Record<JobStatus, string> = {
  NEW: 'Scheduled',
  ASSIGNED: 'In Progress',
  TRANSCRIBED: 'Transcribing',
  REVIEWED: 'Review',
  COMPLETED: 'Completed',
};

const FILES = [
  { name: 'Audio recording.wav', kind: 'Audio' },
  { name: 'Rough draft transcript.txt', kind: 'Draft' },
];

function formatDateTime(value: Date) {
  return value.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('en-US')}`;
}


function JobActionButton({
  job,
  reporters,
}: {
  job: JobDetail;
  reporters: Reporter[];
}) {
  switch (job.status) {
    case 'NEW':
      return (
        <AssignReporterDialog
          jobId={job.id}
          jobCity={job.city}
          jobLocation={job.location}
          reporters={reporters}
        />
      );
    case 'ASSIGNED':
      return (
        <>
          <button disabled className={buttonClasses('secondary')}>
            <FiClock className="size-4" />
            Is being transcribed
          </button>
          <FinishTranscribeButton jobId={job.id} />
        </>
      );
    case 'TRANSCRIBED':
      // Once an editor is assigned, the transcript is under review.
      return job.editorId ? (
        <button disabled className={buttonClasses('secondary')}>
          <FiClock className="size-4" />
          Is being reviewed
        </button>
      ) : (
        <button className={buttonClasses('primary')}>
          <FiEdit2 className="size-4" />
          Assign to editor
        </button>
      );
    case 'REVIEWED':
      return (
        <button className={buttonClasses('primary')}>
          <FiDollarSign className="size-4" />
          Calculate payments
        </button>
      );
    case 'COMPLETED':
      return (
        <button disabled className={buttonClasses('secondary')}>
          <FiCheckCircle className="size-4" />
          Completed
        </button>
      );
  }
}

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
  const { reporter, payment } = job;

  // Reporter roster for the assign dialog (only used while the job is NEW).
  const reportersResult = await getReporters();
  const reporters = reportersResult.ok ? reportersResult.data : [];


  const milestones = [
    { label: 'Job created', at: job.createdAt },
    { label: 'Reporter assigned', at: job.assignedAt },
    { label: 'Transcription completed', at: job.transcribedAt },
    { label: 'Review completed', at: job.reviewedAt },
    { label: 'Delivered to client', at: job.completedAt },
  ];

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
          <JobActionButton job={job} reporters={reporters} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Proceeding details" />
            <CardBody>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoRow
                  icon={FiCalendar}
                  label="Date & time"
                  value={formatDateTime(job.createdAt)}
                />
                <InfoRow
                  icon={FiMapPin}
                  label="Location"
                  value={job.city ?? 'Remote'}
                />
                <InfoRow
                  icon={FiMic}
                  label="Format"
                  value={job.location === 'physical' ? 'In-person' : 'Remote'}
                />
                <InfoRow
                  icon={FiClock}
                  label="Duration"
                  value={job.duration ? `${job.duration} min` : '—'}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Files & exhibits"
              description={`${FILES.length} attachments`}
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
              {reporter ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar name={reporter.name} size="lg" />
                    <div>
                      <p className="font-semibold text-surface-800">
                        {reporter.name}
                      </p>
                      <p className="text-sm text-surface-500">
                        {reporter.location} ·{' '}
                        {formatRupiah(reporter.ratePerMinute)}/min
                      </p>
                      <div className="mt-1">
                        <StatusBadge
                          status={reporter.isAvailable ? 'Available' : 'Busy'}
                        />
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/reporters/${reporter.id}`}
                    className={buttonClasses('secondary', 'sm', 'mt-4 w-full')}
                  >
                    View profile
                  </Link>
                </>
              ) : (
                <p className="text-sm text-surface-500">
                  No reporter assigned yet.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Progress" />
            <CardBody>
              <ol className="relative space-y-5 before:absolute before:left-2.75 before:top-1 before:h-[calc(100%-1rem)] before:w-px before:bg-surface-200">
                {milestones.map((step) => {
                  const done = Boolean(step.at);
                  return (
                    <li key={step.label} className="relative flex gap-3">
                      <span
                        className={
                          done
                            ? 'z-10 flex size-6 items-center justify-center rounded-full bg-success-500 text-white'
                            : 'z-10 flex size-6 items-center justify-center rounded-full bg-surface-200 text-surface-400'
                        }
                      >
                        {done ? (
                          <FiCheckCircle className="size-3.5" />
                        ) : (
                          <span className="size-2 rounded-full bg-current" />
                        )}
                      </span>
                      <div className="-mt-0.5">
                        <p className="text-sm font-medium text-surface-700">
                          {step.label}
                        </p>
                        <p className="text-xs text-surface-400">
                          {step.at ? formatDateTime(step.at) : 'Pending'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Billing" />
            <CardBody className="space-y-3 text-sm">
              {payment ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-surface-500">
                      Transcription ({payment.transcribeDuration} min)
                    </span>
                    <span className="font-medium text-surface-800">
                      {formatRupiah(payment.transcribePaymentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Review fee (flat)</span>
                    <span className="font-medium text-surface-800">
                      {formatRupiah(payment.reviewPaymentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-surface-100 pt-3">
                    <span className="font-semibold text-surface-800">
                      <FiDollarSign className="mr-1 inline size-4 text-surface-400" />
                      Total
                    </span>
                    <span className="font-heading text-lg font-bold text-surface-900">
                      {formatRupiah(payment.totalPayout)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-surface-500">
                  Payment is generated once the job is completed.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

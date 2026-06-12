import Link from 'next/link';
import { PageHeader } from '@repo/components/ui/page-header';
import { StatusBadge } from '@repo/components/ui/status-badge';
import { Card, CardBody } from '@repo/components/ui/card';
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
  FiPlus,
  FiSearch,
  FiFilter,
  FiArrowUpRight,
  FiAlertCircle,
  FiBriefcase,
} from '@repo/components/icons';
import type { Job, JobStatus } from '@repo/schema';
import { getJobs } from '../../lib/api';

// Always render fresh data from the database on each request.
export const dynamic = 'force-dynamic';

const FILTERS = ['Semua', 'Terjadwal', 'Berlangsung', 'Transkripsi', 'Tinjauan', 'Terkirim'];

/** Map the DB job status to a human-readable label the StatusBadge styles. */
const STATUS_LABELS: Record<JobStatus, string> = {
  NEW: 'Scheduled',
  ASSIGNED: 'In Progress',
  TRANSCRIBED: 'Transcribing',
  REVIEWED: 'Review',
  COMPLETED: 'Completed',
};

function formatDate(value: Date) {
  return value.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function JobRow({ job }: { job: Job }) {
  return (
    <TR>
      <TD>
        <Link
          href={`/jobs/${job.id}`}
          className="font-medium text-surface-800 hover:text-brand-600"
        >
          {job.caseName}
        </Link>
        <div className="text-xs text-surface-400">
          {job.caseNumber} · <span className="capitalize">{job.location}</span>
        </div>
      </TD>
      <TD className="text-sm text-surface-600">{job.city ?? '—'}</TD>
      <TD className="whitespace-nowrap text-sm text-surface-500">
        {formatDate(job.createdAt)}
      </TD>
      <TD className="text-right text-sm tabular-nums text-surface-600">
        {job.duration ? `${job.duration} min` : '—'}
      </TD>
      <TD>
        <StatusBadge status={STATUS_LABELS[job.status]} />
      </TD>
      <TD className="text-right">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View <FiArrowUpRight className="size-3.5" />
        </Link>
      </TD>
    </TR>
  );
}

export default async function JobsPage() {
  const result = await getJobs();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description={
          result.ok
            ? `${result.data.length} job${result.data.length === 1 ? '' : 's'} tracked.`
            : 'Manage and track every reporting assignment.'
        }
        actions={
          <>
            <button className={buttonClasses('secondary')}>
              <FiFilter className="size-4" />
              Export
            </button>
            <Link href={"/jobs/new"} className={buttonClasses('primary')}>
              <FiPlus className="size-4" />
              New job
            </Link>
          </>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f, i) => (
            <button
              key={f}
              className={
                i === 0
                  ? 'rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white'
                  : 'rounded-lg px-3 py-1.5 text-sm font-medium text-surface-500 hover:bg-surface-100 hover:text-surface-800'
              }
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-surface-400" />
          <input
            type="search"
            placeholder="Search by matter or client…"
            className="h-9 w-full rounded-lg border border-surface-200 bg-surface-0 pl-9 pr-3 text-sm text-surface-700 placeholder:text-surface-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {!result.ok ? (
        <Card>
          <CardBody className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
              <FiAlertCircle className="size-5" />
            </span>
            <div>
              <p className="font-medium text-surface-800">Couldn&apos;t load jobs</p>
              <p className="mt-0.5 text-sm text-surface-500">{result.error}</p>
            </div>
          </CardBody>
        </Card>
      ) : result.data.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-surface-100 text-surface-400">
              <FiBriefcase className="size-6" />
            </span>
            <div>
              <p className="font-medium text-surface-800">No jobs yet</p>
              <p className="mt-0.5 text-sm text-surface-500">
                Create your first reporting assignment to get started.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <DataTable>
          <THead>
            <TR>
              <TH>Matter</TH>
              <TH>City</TH>
              <TH>Created</TH>
              <TH className="text-right">Duration</TH>
              <TH>Status</TH>
              <TH className="text-right">Action</TH>
            </TR>
          </THead>
          <TBody>
            {result.data.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </TBody>
        </DataTable>
      )}
    </div>
  );
}

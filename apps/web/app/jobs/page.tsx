import Link from 'next/link';
import { PageHeader } from '@repo/components/ui/page-header';
import { StatusBadge } from '@repo/components/ui/status-badge';
import { Avatar } from '@repo/components/ui/avatar';
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
} from '@repo/components/icons';

const JOBS = [
  {
    id: 'JOB-2041',
    caption: 'Hartwell v. Northgate Ins.',
    client: 'Bennett & Cole LLP',
    type: 'Deposition',
    reporter: 'Maria Solis',
    date: 'Jun 12, 2026',
    pages: 142,
    status: 'In Progress',
  },
  {
    id: 'JOB-2040',
    caption: 'State v. Calderon',
    client: 'Public Defender, Dist. 4',
    type: 'Court Hearing',
    reporter: 'James Okafor',
    date: 'Jun 12, 2026',
    pages: 88,
    status: 'Transcribing',
  },
  {
    id: 'JOB-2039',
    caption: 'Redmond Estate Arbitration',
    client: 'Harlow Estate Group',
    type: 'Arbitration',
    reporter: 'Priya Nair',
    date: 'Jun 11, 2026',
    pages: 210,
    status: 'Review',
  },
  {
    id: 'JOB-2038',
    caption: 'Bayfront Holdings EUO',
    client: 'Meridian Mutual',
    type: 'EUO',
    reporter: 'Daniel Cho',
    date: 'Jun 11, 2026',
    pages: 64,
    status: 'Delivered',
  },
  {
    id: 'JOB-2037',
    caption: 'Whitaker v. Meridian Health',
    client: 'Stein & Associates',
    type: 'Deposition',
    reporter: 'Maria Solis',
    date: 'Jun 10, 2026',
    pages: 176,
    status: 'Delivered',
  },
  {
    id: 'JOB-2036',
    caption: 'Coastal Freight v. DLT Logistics',
    client: 'Vega Maritime Law',
    type: 'Deposition',
    reporter: 'James Okafor',
    date: 'Jun 10, 2026',
    pages: 0,
    status: 'Scheduled',
  },
  {
    id: 'JOB-2035',
    caption: 'In re: Sandoval Trust',
    client: 'Harlow Estate Group',
    type: 'Hearing',
    reporter: 'Priya Nair',
    date: 'Jun 9, 2026',
    pages: 51,
    status: 'On Hold',
  },
  {
    id: 'JOB-2034',
    caption: 'Lindqvist v. Aero Dynamics',
    client: 'Bennett & Cole LLP',
    type: 'Deposition',
    reporter: 'Daniel Cho',
    date: 'Jun 9, 2026',
    pages: 0,
    status: 'Cancelled',
  },
];

const FILTERS = ['All', 'Scheduled', 'In Progress', 'Transcribing', 'Review', 'Delivered'];

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Manage and track every reporting assignment."
        actions={
          <>
            <button className={buttonClasses('secondary')}>
              <FiFilter className="size-4" />
              Export
            </button>
            <button className={buttonClasses('primary')}>
              <FiPlus className="size-4" />
              New job
            </button>
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

      <DataTable>
        <THead>
          <TR>
            <TH>Matter</TH>
            <TH>Client</TH>
            <TH>Reporter</TH>
            <TH>Date</TH>
            <TH className="text-right">Pages</TH>
            <TH>Status</TH>
            <TH className="text-right">Action</TH>
          </TR>
        </THead>
        <TBody>
          {JOBS.map((job) => (
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
              <TD className="text-sm text-surface-600">{job.client}</TD>
              <TD className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Avatar name={job.reporter} size="sm" />
                  <span className="text-sm">{job.reporter}</span>
                </div>
              </TD>
              <TD className="whitespace-nowrap text-sm text-surface-500">
                {job.date}
              </TD>
              <TD className="text-right text-sm tabular-nums text-surface-600">
                {job.pages || '—'}
              </TD>
              <TD>
                <StatusBadge status={job.status} />
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
          ))}
        </TBody>
      </DataTable>
    </div>
  );
}

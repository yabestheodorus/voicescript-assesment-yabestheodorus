import Link from 'next/link';
import { PageHeader } from '@repo/components/ui/page-header';
import { StatusBadge } from '@repo/components/ui/status-badge';
import { Avatar } from '@repo/components/ui/avatar';
import { Badge } from '@repo/components/ui/badge';
import { Card, CardBody } from '@repo/components/ui/card';
import { buttonClasses } from '@repo/components/ui/button';
import {
  FiPlus,
  FiMapPin,
  FiClock,
  FiArrowUpRight,
  FiAlertCircle,
  FiUsers,
} from '@repo/components/icons';
import type { Reporter } from '@repo/schema';
import { getReporters } from '../../lib/api';

// Always render fresh data from the database on each request.
export const dynamic = 'force-dynamic';

function formatRate(ratePerMinute: number) {
  return `Rp ${ratePerMinute.toLocaleString('en-US')} / min`;
}

function ReporterCard({ reporter }: { reporter: Reporter }) {
  const status = reporter.isAvailable ? 'Available' : 'Busy';
  const mode = reporter.workMode === 'physical' ? 'Physical' : 'Remote';

  return (
    <div className="flex flex-col rounded-xl border border-surface-200 bg-surface-0 p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={reporter.name} size="lg" />
          <div>
            <Link
              href={`/reporters/${reporter.id}`}
              className="font-semibold text-surface-800 hover:text-brand-600"
            >
              {reporter.name}
            </Link>
            <p className="flex items-center gap-1 text-xs text-surface-400">
              <FiMapPin className="size-3" />
              {reporter.location}
            </p>
            <div className="mt-1.5">
              <StatusBadge status={status} />
            </div>
          </div>
        </div>
        <Badge tone="brand">{mode}</Badge>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-surface-600">
        <FiClock className="size-4 text-surface-400" />
        <span className="font-medium text-surface-800">
          {formatRate(reporter.ratePerMinute)}
        </span>
      </div>

      <Link
        href={`/reporters/${reporter.id}`}
        className="mt-5 inline-flex items-center justify-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        View profile <FiArrowUpRight className="size-3.5" />
      </Link>
    </div>
  );
}

export default async function ReportersPage() {
  const result = await getReporters();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporters"
        description={
          result.ok
            ? `${result.data.length} reporter${result.data.length === 1 ? '' : 's'} in your agency.`
            : 'Your court reporters, their availability, and rates.'
        }
        actions={
          <button className={buttonClasses('primary')}>
            <FiPlus className="size-4" />
            Add reporter
          </button>
        }
      />

      {!result.ok ? (
        <Card>
          <CardBody className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
              <FiAlertCircle className="size-5" />
            </span>
            <div>
              <p className="font-medium text-surface-800">
                Couldn&apos;t load reporters
              </p>
              <p className="mt-0.5 text-sm text-surface-500">{result.error}</p>
            </div>
          </CardBody>
        </Card>
      ) : result.data.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-surface-100 text-surface-400">
              <FiUsers className="size-6" />
            </span>
            <div>
              <p className="font-medium text-surface-800">No reporters yet</p>
              <p className="mt-0.5 text-sm text-surface-500">
                Add your first court reporter to get started.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {result.data.map((reporter) => (
            <ReporterCard key={reporter.id} reporter={reporter} />
          ))}
        </div>
      )}
    </div>
  );
}

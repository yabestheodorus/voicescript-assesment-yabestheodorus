import Link from 'next/link';
import { PageHeader } from '@repo/components/ui/page-header';
import { StatusBadge } from '@repo/components/ui/status-badge';
import { Avatar } from '@repo/components/ui/avatar';
import { ProgressBar } from '@repo/components/ui/progress-bar';
import { Badge } from '@repo/components/ui/badge';
import { buttonClasses } from '@repo/components/ui/button';
import {
  FiPlus,
  FiStar,
  FiBriefcase,
  FiArrowUpRight,
} from '@repo/components/icons';

const REPORTERS = [
  {
    id: 'RPT-104',
    name: 'Maria Solis',
    creds: 'RPR, CRR',
    status: 'Busy',
    activeJobs: 6,
    capacity: 85,
    rating: 4.9,
    specialties: ['Deposition', 'Medical'],
  },
  {
    id: 'RPT-088',
    name: 'James Okafor',
    creds: 'RPR',
    status: 'Available',
    activeJobs: 4,
    capacity: 60,
    rating: 4.7,
    specialties: ['Court Hearing', 'Criminal'],
  },
  {
    id: 'RPT-072',
    name: 'Priya Nair',
    creds: 'RDR, CRR',
    status: 'Busy',
    activeJobs: 5,
    capacity: 72,
    rating: 4.8,
    specialties: ['Arbitration', 'Technical'],
  },
  {
    id: 'RPT-131',
    name: 'Daniel Cho',
    creds: 'RPR',
    status: 'Available',
    activeJobs: 3,
    capacity: 40,
    rating: 4.6,
    specialties: ['EUO', 'Insurance'],
  },
  {
    id: 'RPT-059',
    name: 'Aisha Rahman',
    creds: 'RMR, CRR',
    status: 'Offline',
    activeJobs: 0,
    capacity: 0,
    rating: 5.0,
    specialties: ['Patent', 'Technical'],
  },
  {
    id: 'RPT-117',
    name: 'Thomas Becker',
    creds: 'RPR',
    status: 'Available',
    activeJobs: 2,
    capacity: 28,
    rating: 4.5,
    specialties: ['Deposition', 'Real Estate'],
  },
];

export default function ReportersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporters"
        description="Your court reporters, their availability, and workload."
        actions={
          <button className={buttonClasses('primary')}>
            <FiPlus className="size-4" />
            Add reporter
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {REPORTERS.map((r) => (
          <div
            key={r.id}
            className="flex flex-col rounded-xl border border-surface-200 bg-surface-0 p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={r.name} size="lg" />
                <div>
                  <Link
                    href={`/reporters/${r.id}`}
                    className="font-semibold text-surface-800 hover:text-brand-600"
                  >
                    {r.name}
                  </Link>
                  <p className="text-xs text-surface-400">
                    {r.id} · {r.creds}
                  </p>
                  <div className="mt-1.5">
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-surface-700">
                <FiStar className="size-4 text-warning-500" />
                {r.rating.toFixed(1)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {r.specialties.map((s) => (
                <Badge key={s} tone="brand">
                  {s}
                </Badge>
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-surface-500">
                <span className="flex items-center gap-1">
                  <FiBriefcase className="size-3.5" />
                  {r.activeJobs} active jobs
                </span>
                <span>{r.capacity}% capacity</span>
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

            <Link
              href={`/reporters/${r.id}`}
              className="mt-5 inline-flex items-center justify-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View profile <FiArrowUpRight className="size-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

import { clsx } from 'clsx';
import type { IconType } from '../icons';
import { FiTrendingUp, FiTrendingDown } from '../icons';

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  trend = 'up',
  hint,
}: {
  label: string;
  value: string;
  icon: IconType;
  delta?: string;
  trend?: 'up' | 'down';
  hint?: string;
}) {
  const TrendIcon = trend === 'up' ? FiTrendingUp : FiTrendingDown;

  return (
    <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-surface-500">{label}</span>
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="size-4.5" />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="font-heading text-2xl font-bold tracking-tight text-surface-900">
          {value}
        </p>
        {delta ? (
          <span
            className={clsx(
              'mb-0.5 inline-flex items-center gap-1 text-xs font-semibold',
              trend === 'up' ? 'text-success-600' : 'text-danger-600',
            )}
          >
            <TrendIcon className="size-3.5" />
            {delta}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-surface-400">{hint}</p> : null}
    </div>
  );
}

import { clsx } from 'clsx';

export function ProgressBar({
  value,
  tone = 'brand',
  className,
}: {
  /** 0–100 */
  value: number;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  className?: string;
}) {
  const toneStyles = {
    brand: 'bg-brand-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  } as const;

  return (
    <div
      className={clsx(
        'h-2 w-full overflow-hidden rounded-full bg-surface-100',
        className,
      )}
    >
      <div
        className={clsx('h-full rounded-full', toneStyles[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

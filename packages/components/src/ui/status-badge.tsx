import { Badge, type BadgeTone } from './badge';

/**
 * Maps domain statuses (jobs, payments, reporters) to a consistent badge tone.
 * Pure presentational mapping — no data logic.
 */
const STATUS_TONES: Record<string, BadgeTone> = {
  // Job statuses
  Scheduled: 'info',
  'In Progress': 'brand',
  Recording: 'brand',
  Transcribing: 'warning',
  Review: 'warning',
  Delivered: 'success',
  Completed: 'success',
  Cancelled: 'danger',
  'On Hold': 'neutral',
  // Payment statuses
  Paid: 'success',
  Pending: 'warning',
  Processing: 'info',
  Overdue: 'danger',
  Draft: 'neutral',
  // Reporter availability
  Available: 'success',
  Busy: 'warning',
  Offline: 'neutral',
  // Indonesian job statuses
  Baru: 'info',
  Terjadwal: 'info',
  Ditugaskan: 'info',
  Berlangsung: 'brand',
  Transkripsi: 'warning',
  Tinjauan: 'warning',
  Terkirim: 'success',
  Selesai: 'success',
  Ditahan: 'neutral',
  Dibatalkan: 'danger',
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status] ?? 'neutral';
  return (
    <Badge tone={tone} dot>
      {status}
    </Badge>
  );
}

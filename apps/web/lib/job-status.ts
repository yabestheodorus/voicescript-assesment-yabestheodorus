import type { Job } from '@repo/schema';
import type { BadgeTone } from '@repo/components/ui/badge';

/**
 * Maps a job's lifecycle to the label + badge tone shown in the UI. The DB
 * enum is coarse, so two sub-states are derived from timestamps/relations:
 *   - ASSIGNED splits on whether transcription has started.
 *   - TRANSCRIBED splits on whether an editor is assigned (i.e. being reviewed).
 *
 *   NEW                         → awaiting a reporter
 *   ASSIGNED, not started       → reporter assigned, transcription not begun
 *   ASSIGNED, started           → reporter transcribing
 *   TRANSCRIBED, no editor      → awaiting an editor
 *   TRANSCRIBED, editor         → being reviewed
 *   REVIEWED                    → review done, awaiting payment
 *   COMPLETED                   → done
 */
export function jobStatusDisplay(
  job: Pick<Job, 'status' | 'editorId' | 'transcribeJobStartedAt'>,
): { label: string; tone: BadgeTone } {
  switch (job.status) {
    case 'NEW':
      return { label: 'New', tone: 'info' };
    case 'ASSIGNED':
      return job.transcribeJobStartedAt
        ? { label: 'Transcribing', tone: 'warning' }
        : { label: 'Assigned', tone: 'info' };
    case 'TRANSCRIBED':
      return job.editorId
        ? { label: 'Reviewing', tone: 'warning' }
        : { label: 'Awaiting review', tone: 'info' };
    case 'REVIEWED':
      return { label: 'Reviewed', tone: 'brand' };
    case 'COMPLETED':
      return { label: 'Completed', tone: 'success' };
  }
}

'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { finishTranscribe } from '../../../lib/api';
import { buttonClasses } from '@repo/components/ui/button';
import { FiCheckCircle } from '@repo/components/icons';

/** Current local time as the "YYYY-MM-DDTHH:mm" value a datetime-local wants. */
function nowLocalInputValue() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function FinishTranscribeButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(nowLocalInputValue());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open() {
    setError(null);
    setValue(nowLocalInputValue());
    dialogRef.current?.showModal();
  }

  async function handleSubmit() {
    if (!value) {
      setError('Please choose a date and time');
      return;
    }
    setSubmitting(true);
    setError(null);
    // Convert the local datetime-local value to a full ISO timestamp.
    const result = await finishTranscribe(jobId, new Date(value).toISOString());
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    dialogRef.current?.close();
    router.refresh();
  }

  return (
    <>
      <button onClick={open} className={buttonClasses('primary')}>
        <FiCheckCircle className="size-4" />
        Finish transcribe
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-sm rounded-xl bg-surface-0 p-0 text-surface-800 shadow-xl">
          {/* Header */}
          <div className="border-b border-surface-100 px-5 py-4">
            <h3 className="font-heading text-lg font-bold text-surface-900">
              Finish transcription
            </h3>
            <p className="text-xs text-surface-400">
              Enter when the transcript was completed.
            </p>
          </div>

          {/* Input */}
          <div className="px-5 py-4">
            <label className="text-sm font-medium text-surface-900">
              Transcribed at
            </label>
            <p className="mt-0.5 text-xs text-surface-400">
              You may input future date and time to simulate real transcribing
              finish time
            </p>
            <input
              type="datetime-local"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-4 h-10 w-full rounded-lg border border-surface-200 bg-white px-3 text-sm text-surface-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-surface-100 bg-surface-50 px-5 py-4">
            <p className="text-xs text-red-500">{error}</p>
            <div className="flex gap-2">
              <form method="dialog">
                <button className={buttonClasses('secondary')}>Cancel</button>
              </form>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={buttonClasses('primary')}
              >
                {submitting ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}

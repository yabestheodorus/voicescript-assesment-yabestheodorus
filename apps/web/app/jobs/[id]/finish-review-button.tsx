'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { finishReview } from '../../../lib/api';
import { buttonClasses } from '@repo/components/ui/button';
import { FiCheckCircle } from '@repo/components/icons';

export function FinishReviewButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSubmitting(true);
    setError(null);
    const result = await finishReview(jobId);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={submitting}
        className={buttonClasses('primary')}
      >
        <FiCheckCircle className="size-4" />
        {submitting ? 'Finishing…' : 'Finish review'}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

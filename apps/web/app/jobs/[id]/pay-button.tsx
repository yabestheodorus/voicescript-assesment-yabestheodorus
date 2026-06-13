'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { payJob } from '../../../lib/api';
import { buttonClasses } from '@repo/components/ui/button';
import { FiDollarSign } from '@repo/components/icons';

export function PayButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSubmitting(true);
    setError(null);
    const result = await payJob(jobId);
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
        <FiDollarSign className="size-4" />
        {submitting ? 'Paying…' : 'Pay'}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Editor } from '@repo/schema';
import { assignEditor } from '../../../lib/api';
import { buttonClasses } from '@repo/components/ui/button';
import { Avatar } from '@repo/components/ui/avatar';
import { Badge } from '@repo/components/ui/badge';
import { FiEdit2, FiSearch, FiCheck } from '@repo/components/icons';

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('en-US')}`;
}

export function AssignEditorDialog({
  jobId,
  editors,
}: {
  jobId: string;
  editors: Editor[];
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editors have no location, so eligibility is simply availability.
  // Available editors sort first; busy ones are greyed out.
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return editors
      .filter((editor) => editor.name.toLowerCase().includes(query))
      .sort((a, b) => {
        if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [editors, search]);

  function open() {
    setError(null);
    setSelectedId(null);
    setSearch('');
    dialogRef.current?.showModal();
  }

  async function handleSubmit() {
    if (!selectedId) return;
    setSubmitting(true);
    setError(null);
    const result = await assignEditor(jobId, selectedId);
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
      <button className={buttonClasses('primary')} onClick={open}>
        <FiEdit2 className="size-4" />
        Assign to editor
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-lg rounded-xl bg-surface-0 p-0 text-surface-800 shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-surface-100 px-5 py-4">
            <div>
              <h3 className="font-heading text-lg font-bold text-surface-900">
                Assign editor
              </h3>
              <p className="text-xs text-surface-400">
                Available editors for review
              </p>
            </div>
            <form method="dialog">
              <button
                className="text-surface-400 transition-colors hover:text-surface-700"
                aria-label="Close"
              >
                ✕
              </button>
            </form>
          </div>

          {/* Search */}
          <div className="px-5 pt-4">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search editor name…"
                className="h-10 w-full rounded-lg border border-surface-200 bg-white pl-9 pr-3 text-sm text-surface-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          {/* Editor list */}
          <div className="max-h-80 space-y-1.5 overflow-auto px-5 py-4">
            {rows.length === 0 ? (
              <p className="py-8 text-center text-sm text-surface-400">
                No editors found.
              </p>
            ) : (
              rows.map((editor) => {
                const selected = selectedId === editor.id;
                return (
                  <button
                    key={editor.id}
                    type="button"
                    disabled={!editor.isAvailable}
                    onClick={() => setSelectedId(editor.id)}
                    className={[
                      'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition',
                      editor.isAvailable
                        ? selected
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-surface-200 hover:bg-surface-50'
                        : 'cursor-not-allowed border-surface-200 opacity-50',
                    ].join(' ')}
                  >
                    <Avatar name={editor.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-surface-800">
                        {editor.name}
                      </p>
                      <p className="text-xs text-surface-400">
                        {formatRupiah(editor.flatFee)} flat fee
                      </p>
                    </div>
                    {!editor.isAvailable && <Badge tone="warning">Busy</Badge>}
                    {selected && (
                      <FiCheck className="size-4 shrink-0 text-brand-600" />
                    )}
                  </button>
                );
              })
            )}
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
                disabled={!selectedId || submitting}
                className={buttonClasses('primary')}
              >
                {submitting ? 'Assigning…' : 'Assign editor'}
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

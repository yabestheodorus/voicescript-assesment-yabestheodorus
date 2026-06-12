'use client';

import { useEffect } from 'react';
import { create } from 'zustand';

/** Title shown for the job-detail breadcrumb (the case number, not the UUID). */
type BreadcrumbStore = {
  jobDetail: string;
  setJobDetail: (title: string) => void;
};

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  jobDetail: '',
  setJobDetail: (title) => set({ jobDetail: title }),
}));

/** Drop into a server page to set the breadcrumb title. Renders nothing. */
export function SetJobBreadcrumb({ title }: { title: string }) {
  const setJobDetail = useBreadcrumbStore((s) => s.setJobDetail);
  useEffect(() => {
    setJobDetail(title);
    return () => setJobDetail('');
  }, [title, setJobDetail]);
  return null;
}

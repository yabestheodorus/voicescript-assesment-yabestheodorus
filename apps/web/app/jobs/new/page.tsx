"use client"
import { PageHeader } from '@repo/components/ui/page-header'
import React from 'react'
import {
  FiPlus,
  FiFilter,
  FiArrowRight,
  FiSearch,
} from '@repo/components/icons';
import { useForm } from '@tanstack/react-form';
import { CreateJobInput, createJobSchema } from '@repo/schema';
import { TextField } from '@repo/components/ui/form-fields';
import { buttonClasses } from '@repo/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { INDONESIAN_CITIES } from '../../../lib/cities';
import { createJob } from '../../../lib/api';
const CreateNewJob = () => {
  const router = useRouter();
  const [citySearch, setCitySearch] = React.useState('');
  const [isCityOpen, setIsCityOpen] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);


  const onSubmit = async (values: CreateJobInput) => {
    setSubmitError(null);
    const result = await createJob(values);
    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    router.push('/jobs');
    router.refresh();
  }

  const defaultValues: CreateJobInput = {
    caseNumber: '',
    caseName: '',
    location: 'remote',
    city: undefined,
  }
  const form = useForm({
    defaultValues,
    validators: { onChange: createJobSchema },
    onSubmit: ({ value }) => onSubmit?.(value),
    onSubmitInvalid: ({ formApi }) => {
      console.log(formApi.state.errorMap)
      console.log(formApi.state.errors)
    }
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Create New Job"
        description="Fill in the details to schedule a new reporting assignment."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className=" rounded-xl border border-surface-200 bg-white shadow-sm"
      >
        <div className="space-y-5 p-6">
          <form.Field name="caseNumber">
            {(field) => (
              <TextField field={field} label="Case Number" placeholder="e.g. JOB-2041" isRequired />
            )}
          </form.Field>

          <form.Field name="caseName">
            {(field) => <TextField field={field} label="Case Name / Caption" placeholder="PT Maju Bersama melawan..." isRequired />}
          </form.Field>

          <div className="space-y-3">
            <label className="text-sm font-medium text-surface-900">Working Mode</label>
            <form.Field name="location">
              {(field) => (
                <div className="flex gap-4">
                  {['remote', 'physical'].map((mode) => (
                    <label key={mode} className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-surface-200 p-3 text-sm font-medium capitalize transition hover:bg-surface-50 has-checked:border-brand-500 has-checked:bg-brand-50 has-checked:text-brand-700">
                      <input
                        type="radio"
                        name={field.name}
                        value={mode}
                        checked={field.state.value === mode}
                        onChange={() => field.handleChange(mode as any)}
                        className="sr-only"
                      />
                      {mode}
                    </label>
                  ))}
                </div>
              )}
            </form.Field>
          </div>

          <form.Subscribe selector={(s) => s.values.location}>
            {(location) => (location as string) === 'physical' && (
              <form.Field name="city">
                {(field) => (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-900">City</label>
                    <div className="relative">
                      <div className="relative">
                        <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-surface-400" />
                        <input
                          type="text"
                          placeholder="Search city..."
                          value={isCityOpen ? citySearch : field.state.value}
                          onFocus={() => setIsCityOpen(true)}
                          onChange={(e) => {
                            setCitySearch(e.target.value);
                            setIsCityOpen(true);
                          }}
                          className="h-10 w-full rounded-lg border border-surface-200 bg-white pl-9 pr-3 text-sm text-surface-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        />
                      </div>

                      {isCityOpen && (
                        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-surface-200 bg-white p-1 shadow-lg">
                          {INDONESIAN_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())).map(city => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => {
                                field.handleChange(city);
                                setCitySearch('');
                                setIsCityOpen(false);
                              }}
                              className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-50"
                            >
                              {city}
                            </button>
                          ))}
                          {INDONESIAN_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (
                            <div className="px-3 py-2 text-sm text-surface-400 text-center">No cities found</div>
                          )}
                        </div>
                      )}
                    </div>
                    {field.state.meta.errors && <p className="text-xs text-red-500">{field.state.meta.errors.join(', ')}</p>}
                  </div>
                )}
              </form.Field>
            )}
          </form.Subscribe>
        </div>

        {submitError && (
          <div className="mx-6 mb-1 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-surface-100 bg-surface-50 px-6 py-4">
          <Link href="/jobs" className={buttonClasses('secondary')}>
            Cancel
          </Link>
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <button
                type="submit"
                disabled={isSubmitting}
                className={buttonClasses('primary')}
              >
                {isSubmitting ? 'Creating…' : 'Create Job'}
                <FiArrowRight className="size-4" />
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  )
}

export default CreateNewJob
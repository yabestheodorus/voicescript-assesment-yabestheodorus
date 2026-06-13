/**
 * Server-side API access for the web app. These run in React Server
 * Components, so they call the NestJS API directly (no CORS, no client bundle).
 */
import {
  reporterSchema,
  jobSchema,
  jobDetailSchema,
  type Reporter,
  type Job,
  type JobDetail,
  type CreateJobInput,
} from '@repo/schema';

export const API_BASE_URL =
  process.env.API_BASE_URL ?? 'http://localhost:3000/api';

/**
 * Base URL for fetches made from the browser. Only `NEXT_PUBLIC_*` vars are
 * inlined into the client bundle, so the server-only `API_BASE_URL` cannot be
 * reused here. CORS is enabled on the NestJS API, so the browser calls it
 * directly.
 */
export const BROWSER_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';


export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function getReporters(): Promise<ApiResult<Reporter[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/reporters`, {
      // Always reflect the live database for this dashboard view.
      cache: 'no-store',
    });
    if (!res.ok) {
      return { ok: false, error: `API responded ${res.status}` };
    }
    const parsed = reporterSchema.array().safeParse(await res.json());
    if (!parsed.success) {
      return { ok: false, error: 'Unexpected response shape from /reporters' };
    }
    return { ok: true, data: parsed.data };
  } catch {
    return {
      ok: false,
      error: `Could not reach the API at ${API_BASE_URL}. Is it running?`,
    };
  }
}

export async function getJobs(): Promise<ApiResult<Job[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      // Always reflect the live database for this dashboard view.
      cache: 'no-store',
    });
    if (!res.ok) {
      return { ok: false, error: `API responded ${res.status}` };
    }
    const parsed = jobSchema.array().safeParse(await res.json());
    if (!parsed.success) {
      return { ok: false, error: 'Unexpected response shape from /jobs' };
    }
    return { ok: true, data: parsed.data };
  } catch {
    return {
      ok: false,
      error: `Could not reach the API at ${API_BASE_URL}. Is it running?`,
    };
  }
}

export async function getJob(id: string): Promise<ApiResult<JobDetail>> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      cache: 'no-store',
    });
    if (res.status === 404) {
      return { ok: false, error: 'not_found' };
    }
    if (!res.ok) {
      return { ok: false, error: `API responded ${res.status}` };
    }
    const parsed = jobDetailSchema.safeParse(await res.json());
    if (!parsed.success) {
      return { ok: false, error: 'Unexpected response shape from /jobs/:id' };
    }
    return { ok: true, data: parsed.data };
  } catch {
    return {
      ok: false,
      error: `Could not reach the API at ${API_BASE_URL}. Is it running?`,
    };
  }
}

export async function getJobCount(): Promise<ApiResult<number>> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/count`, {
      cache: 'no-store',
    })
    return { ok: true, data: await res.json() as number };
  } catch {
    return {
      ok: false,
      error: `Could not reach the API at ${API_BASE_URL}. Is it running?`,
    };
  }
}

/** POST /jobs/:id/assign-reporter — called from the browser (client component). */
export async function assignReporter(
  jobId: string,
  reporterId: string,
): Promise<ApiResult<Job>> {
  try {
    const res = await fetch(`${BROWSER_API_BASE_URL}/jobs/${jobId}/assign-reporter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reporterId }),
    });

    if (!res.ok) {
      // Surface the API's validation / conflict message when present.
      let error = `API responded ${res.status}`;
      try {
        const payload = await res.json();
        if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
          error = payload.errors
            .map((e: { path: string; message: string }) =>
              e.path ? `${e.path}: ${e.message}` : e.message,
            )
            .join(', ');
        } else if (typeof payload?.message === 'string') {
          error = payload.message;
        }
      } catch {
        // Non-JSON error body — keep the status-based message.
      }
      return { ok: false, error };
    }

    const parsed = jobSchema.safeParse(await res.json());
    if (!parsed.success) {
      return { ok: false, error: 'Unexpected response shape from assign-reporter' };
    }
    return { ok: true, data: parsed.data };
  } catch {
    return {
      ok: false,
      error: `Could not reach the API at ${BROWSER_API_BASE_URL}. Is it running?`,
    };
  }
}

/** POST /jobs/:id/finish-transcribe — called from the browser (client component). */
export async function finishTranscribe(
  jobId: string,
  transcribedAt: string,
): Promise<ApiResult<Job>> {
  try {
    const res = await fetch(`${BROWSER_API_BASE_URL}/jobs/${jobId}/finish-transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcribedAt }),
    });

    if (!res.ok) {
      let error = `API responded ${res.status}`;
      try {
        const payload = await res.json();
        if (typeof payload?.message === 'string') {
          error = payload.message;
        }
      } catch {
        // Non-JSON error body — keep the status-based message.
      }
      return { ok: false, error };
    }

    const parsed = jobSchema.safeParse(await res.json());
    if (!parsed.success) {
      return { ok: false, error: 'Unexpected response shape from finish-transcribe' };
    }
    return { ok: true, data: parsed.data };
  } catch {
    return {
      ok: false,
      error: `Could not reach the API at ${BROWSER_API_BASE_URL}. Is it running?`,
    };
  }
}

/** POST /jobs — called from the browser (client component). */
export async function createJob(
  input: CreateJobInput,
): Promise<ApiResult<Job>> {
  try {
    const res = await fetch(`${BROWSER_API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      // Surface the API's Zod validation errors when present.
      let error = `API responded ${res.status}`;
      try {
        const payload = await res.json();
        if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
          error = payload.errors
            .map((e: { path: string; message: string }) =>
              e.path ? `${e.path}: ${e.message}` : e.message,
            )
            .join(', ');
        } else if (typeof payload?.message === 'string') {
          error = payload.message;
        }
      } catch {
        // Non-JSON error body — keep the status-based message.
      }
      return { ok: false, error };
    }

    const parsed = jobSchema.safeParse(await res.json());
    if (!parsed.success) {
      return { ok: false, error: 'Unexpected response shape from POST /jobs' };
    }
    return { ok: true, data: parsed.data };
  } catch {
    return {
      ok: false,
      error: `Could not reach the API at ${BROWSER_API_BASE_URL}. Is it running?`,
    };
  }
}

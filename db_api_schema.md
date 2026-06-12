# Database Schema and API Lists


**Author:** Yabes Theodorus
**Date:** 2026-06-12
**Status:** Draft
**Source:** Voicescript Fullstack Assessment

---

## 1. Overview

Voicescript is a Court Reporting Workflow Manager, whose main purpose is for managing transcription jobs. The core scenario is 

1. Reportes agency creates transcription job
2. Reporters agency assign job to reporters
3. Reporters do the transcription and marked it as TRANSCRIBED
4. Reporter agency assign TRANSCRIBED job to EDITOR
5. EDITOR do the review and marked is as REVIEWED
6. Reporter agency calculate payments marked it as DONE

JOB STATUS :

NEW → ASSIGNED → TRANSCRIBED → REVIEWED → COMPLETED

---

## 2. TABLES

### Reporters

| Field | Type | Description | Relations |
|---|---|---|---|
| `id` | `SERIAL` / `INTEGER` PK | Unique identifier for the reporter. | PK |
| `name` | `VARCHAR` | Reporter's full name. | — |
| `location` | `VARCHAR` | City the reporter is based in. | Compared against `jobs.location` to prioritize same-city assignment. |
| `work_mode` | `ENUM('physical','remote')` | Type of work the reporter can take — physical (tied to a city) or remote. | — |
| `is_available` | `BOOLEAN` | Whether the reporter is currently free (not working on a job). | — |
| `rate_per_minute` | `DECIMAL` / `INTEGER` | Pay rate per minute of transcription (e.g. 2000 IDR/min). Drives `payment.transcribe_payment_amount`. | — |
| `current_job_id` | `INTEGER` FK, nullable | The job the reporter is currently assigned to. | FK → `jobs.id` |

### Jobs

| Field | Type | Description | Relations |
|---|---|---|---|
| `id` | `SERIAL` / `INTEGER` PK | Unique identifier for the job. | PK |
| `case_number` | `VARCHAR` | Court case number. | — |
| `case_name` | `VARCHAR` | Name/title of the case. | — |
| `duration` | `INTEGER` | Length of the recording in minutes. | Drives reporter payment calculation. |
| `location` | `ENUM('physical','remote')` | Whether the job is physical (tied to a city) or remote. | — |
| `status` | `ENUM('NEW','ASSIGNED','TRANSCRIBED','REVIEWED','COMPLETED')` | Current state in the workflow lifecycle. | — |
| `created_at` | `TIMESTAMP` | When the job was created. | — |
| `assigned_at` | `TIMESTAMP`, nullable | When a reporter was assigned (NEW → ASSIGNED). | — |
| `transcribed_at` | `TIMESTAMP`, nullable | When transcription was completed (→ TRANSCRIBED). | — |
| `review_assigned_at` | `TIMESTAMP`, nullable | When an editor was assigned for review. | — |
| `reviewed_at` | `TIMESTAMP`, nullable | When the editor finished review (→ REVIEWED). | — |
| `completed_at` | `TIMESTAMP`, nullable | When the job was completed (→ COMPLETED). | — |
| `reporter_id` | `INTEGER` FK, nullable | The reporter assigned to transcribe. | FK → `reporters.id` |
| `editor_id` | `INTEGER` FK, nullable | The editor assigned to review. | FK → `editor.id` |
| `transcribe_job_started_at` | `TIMESTAMP`, nullable | When the reporter started transcribing. | — |
| `review_job_started_at` | `TIMESTAMP`, nullable | When the editor started reviewing. | — |

> On job assignment, reporters in the same city are prioritized (shown at the beginning of the list), while remote jobs can be assigned to any reporter with remote availability.

### Editor

| Field | Type | Description | Relations |
|---|---|---|---|
| `id` | `SERIAL` / `INTEGER` PK | Unique identifier for the editor. | PK |
| `name` | `VARCHAR` | Editor's full name. | — |
| `is_available` | `BOOLEAN` | Whether the editor is currently free (not working on a job). | — |
| `flat_fee` | `DECIMAL` / `INTEGER` | Flat fee paid to the editor per reviewed job. Drives `payment.review_payment_amount`. | — |
| `current_job_id` | `INTEGER` FK, nullable | The job the editor is currently reviewing. | FK → `jobs.id` |

### Payment

| Field | Type | Description | Relations |
|---|---|---|---|
| `id` | `SERIAL` / `INTEGER` PK | Unique identifier for the payment record. | PK |
| `job_id` | `INTEGER` FK | The job this payment is for. | FK → `jobs.id` |
| `reporter_id` | `INTEGER` FK | The reporter being paid for transcription. | FK → `reporters.id` |
| `editor_id` | `INTEGER` FK | The editor being paid for review. | FK → `editor.id` |
| `transcribe_payment_amount` | `DECIMAL` / `INTEGER` | Amount paid to the reporter for transcription. | — |
| `review_payment_amount` | `DECIMAL` / `INTEGER` | Flat fee paid to the editor for review. | — |
| `total_payout` | `DECIMAL` / `INTEGER` | Sum of transcribe + review payment. | — |
| `transcribe_duration` | `INTEGER` | Duration in minutes used to compute the reporter payment. | — |

---

## 3. Relations Summary

- `jobs.reporter_id` → `reporters.id` (a job has one reporter; a reporter can have many jobs over time).
- `jobs.editor_id` → `editor.id` (a job has one editor; an editor can have many jobs over time).
- `reporters.current_job_id` → `jobs.id` (a reporter is currently on at most one job).
- `editor.current_job_id` → `jobs.id` (an editor is currently on at most one job).
- `payment.job_id` → `jobs.id` (one payment record per job).
- `payment.reporter_id` → `reporters.id`, `payment.editor_id` → `editor.id`.

---

## 4. API ENDPOINTS

Base path: `/api`. All bodies and responses are JSON.

### 4.1 Jobs

| Method | Endpoint | Description | Status effect |
|---|---|---|---|
| `POST` | `/jobs` | Create a new job. | Sets `status = NEW`, `created_at = now()`. |
| `GET` | `/jobs` | List all jobs (with status, reporter, editor). Supports `?status=` filter. | — |
| `GET` | `/jobs/:id` | Get a single job with its assignments and timestamps. | — |
| `POST` | `/jobs/:id/assign-reporter` | Assign a reporter to the job. | `NEW → ASSIGNED`; sets `reporter_id`, `assigned_at`. |
| `POST` | `/jobs/:id/transcribe` | Reporter marks transcription complete. | `ASSIGNED → TRANSCRIBED`; sets `transcribed_at`. |
| `POST` | `/jobs/:id/assign-editor` | Assign an editor to review the transcript. | sets `editor_id`, `review_assigned_at`. |
| `POST` | `/jobs/:id/review` | Editor marks review complete. | `TRANSCRIBED → REVIEWED`; sets `reviewed_at`. |
| `POST` | `/jobs/:id/complete` | Finalize the job and lock payment. | `REVIEWED → COMPLETED`; sets `completed_at`; creates `payment` record. |

**`POST /jobs` — request body**
```json
{
  "case_number": "CR-2026-001",
  "case_name": "State v. Doe",
  "duration": 90,
  "location": "physical"
}
```

**Status transitions are validated server-side** — out-of-order requests (e.g. reviewing a job still `NEW`) return `409 Conflict`.

### 4.2 Reporter Assignment Logic

`POST /jobs/:id/assign-reporter` body:
```json
{ "reporter_id": 12 }
```
- Only reporters with `is_available = true` can be assigned.
- For `physical` jobs, the candidate list prioritizes reporters whose `location` matches the job's city; remote jobs draw from reporters with `work_mode = 'remote'`.
- On assignment: reporter's `is_available → false`, `current_job_id → job.id`.

### 4.3 Reporters

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/reporters` | List reporters. Supports `?available=true` and `?location=` filters. |
| `GET` | `/reporters/:id/candidates?job_id=` | Reporters eligible for a job, same-city prioritized first. |
| `POST` | `/reporters` | Create a reporter (`name`, `location`, `work_mode`, `rate_per_minute`). |

### 4.4 Editors

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/editors` | List editors. Supports `?available=true` filter. |
| `POST` | `/editors` | Create an editor (`name`, `flat_fee`). |

### 4.5 Payment

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/jobs/:id/payment` | Per-job earnings breakdown (transcribe + review + total). |
| `GET` | `/payments` | List all payment records / total payout across jobs. |

**`GET /jobs/:id/payment` — response**
```json
{
  "job_id": 5,
  "transcribe_duration": 90,
  "transcribe_payment_amount": 180000,
  "review_payment_amount": 50000,
  "total_payout": 230000
}
```
- `transcribe_payment_amount = reporters.rate_per_minute × jobs.duration`
- `review_payment_amount = editor.flat_fee`
- `total_payout = transcribe_payment_amount + review_payment_amount`
- Values are computed at `complete` time and persisted in the `payment` table (snapshot).

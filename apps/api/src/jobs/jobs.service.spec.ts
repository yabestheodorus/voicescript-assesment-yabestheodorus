import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '../../generated/prisma/client';

// ---- fixtures ----------------------------------------------------------

const makeJob = (overrides: Record<string, unknown> = {}) => ({
  id: 'job-1',
  caseNumber: 'JOB-1',
  caseName: 'Case One',
  duration: 0,
  location: 'remote',
  city: null,
  status: 'NEW',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  assignedAt: null,
  transcribedAt: null,
  reviewAssignedAt: null,
  reviewedAt: null,
  completedAt: null,
  transcribeJobStartedAt: null,
  reviewJobStartedAt: null,
  reporterId: null,
  editorId: null,
  ...overrides,
});

const makeReporter = (overrides: Record<string, unknown> = {}) => ({
  id: 'rep-1',
  name: 'Budi',
  location: 'Jakarta',
  workMode: 'remote',
  isAvailable: true,
  ratePerMinute: 2000,
  currentJobId: null,
  ...overrides,
});

const makeEditor = (overrides: Record<string, unknown> = {}) => ({
  id: 'ed-1',
  name: 'Clara',
  isAvailable: true,
  flatFee: 150000,
  currentJobId: null,
  ...overrides,
});

describe('JobsService', () => {
  let service: JobsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      job: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
      reporters: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
      editor: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
      payment: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      // Interactive transaction: run the callback with the same mock client.
      $transaction: jest.fn((cb: any) => cb(prisma)),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [JobsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(JobsService);
  });

  // ---- getAllJobs / getJobsCount --------------------------------------

  describe('getAllJobs', () => {
    it('returns all jobs', async () => {
      const jobs = [makeJob()];
      prisma.job.findMany.mockResolvedValue(jobs);
      await expect(service.getAllJobs()).resolves.toBe(jobs);
    });
  });

  describe('getJobsCount', () => {
    it('returns the job count', async () => {
      prisma.job.count.mockResolvedValue(7);
      await expect(service.getJobsCount()).resolves.toBe(7);
    });
  });

  // ---- getJobById ------------------------------------------------------

  describe('getJobById', () => {
    it('returns the job with its relations', async () => {
      const job = makeJob();
      prisma.job.findUnique.mockResolvedValue(job);

      await expect(service.getJobById('job-1')).resolves.toBe(job);
      expect(prisma.job.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        include: { reporter: true, editor: true, payment: true },
      });
    });

    it('throws NotFound when the job does not exist', async () => {
      prisma.job.findUnique.mockResolvedValue(null);
      await expect(service.getJobById('nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // ---- createJob -------------------------------------------------------

  describe('createJob', () => {
    const input = {
      caseNumber: 'JOB-9',
      caseName: 'New Case',
      location: 'remote' as const,
      city: undefined,
    };

    it('creates a job with duration 0', async () => {
      const created = makeJob({ id: 'job-9', caseNumber: 'JOB-9' });
      prisma.job.create.mockResolvedValue(created);

      await expect(service.createJob(input)).resolves.toBe(created);
      expect(prisma.job.create).toHaveBeenCalledWith({
        data: {
          caseNumber: 'JOB-9',
          caseName: 'New Case',
          location: 'remote',
          city: undefined,
          duration: 0,
        },
      });
    });

    it('maps a duplicate caseNumber (P2002) to a Conflict', async () => {
      const err = new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'test',
      });
      prisma.job.create.mockRejectedValue(err);

      await expect(service.createJob(input)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('rethrows unknown errors', async () => {
      const err = new Error('db down');
      prisma.job.create.mockRejectedValue(err);

      await expect(service.createJob(input)).rejects.toBe(err);
    });
  });

  // ---- assignJobToReporter --------------------------------------------

  describe('assignJobToReporter', () => {
    it('throws NotFound when the job is missing', async () => {
      prisma.job.findUnique.mockResolvedValue(null);
      await expect(
        service.assignJobToReporter('job-1', 'rep-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFound when the reporter is missing', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob());
      prisma.reporters.findUnique.mockResolvedValue(null);
      await expect(
        service.assignJobToReporter('job-1', 'rep-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws Conflict when the reporter is already working', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob());
      prisma.reporters.findUnique.mockResolvedValue(
        makeReporter({ isAvailable: false }),
      );
      await expect(
        service.assignJobToReporter('job-1', 'rep-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws BadRequest when a physical job city does not match', async () => {
      prisma.job.findUnique.mockResolvedValue(
        makeJob({ location: 'physical', city: 'Bandung' }),
      );
      prisma.reporters.findUnique.mockResolvedValue(
        makeReporter({ location: 'Jakarta' }),
      );
      await expect(
        service.assignJobToReporter('job-1', 'rep-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('atomically claims the reporter and assigns the job', async () => {
      const assigned = makeJob({ status: 'ASSIGNED', reporterId: 'rep-1' });
      prisma.job.findUnique
        .mockResolvedValueOnce(makeJob()) // pre-check
        .mockResolvedValueOnce(assigned); // returned from tx
      prisma.reporters.findUnique.mockResolvedValue(makeReporter());
      prisma.reporters.updateMany.mockResolvedValue({ count: 1 });
      prisma.job.updateMany.mockResolvedValue({ count: 1 });

      await expect(
        service.assignJobToReporter('job-1', 'rep-1'),
      ).resolves.toBe(assigned);

      // compare-and-set on availability
      expect(prisma.reporters.updateMany).toHaveBeenCalledWith({
        where: { id: 'rep-1', isAvailable: true },
        data: { isAvailable: false, currentJobId: 'job-1' },
      });
      // job only moves out of NEW / unassigned
      expect(prisma.job.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'job-1', reporterId: null, status: 'NEW' },
        }),
      );
    });

    it('throws Conflict when the reporter was just taken (claim race)', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob());
      prisma.reporters.findUnique.mockResolvedValue(makeReporter());
      prisma.reporters.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.assignJobToReporter('job-1', 'rep-1'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.job.updateMany).not.toHaveBeenCalled();
    });

    it('throws Conflict when the job was already assigned', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob());
      prisma.reporters.findUnique.mockResolvedValue(makeReporter());
      prisma.reporters.updateMany.mockResolvedValue({ count: 1 });
      prisma.job.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.assignJobToReporter('job-1', 'rep-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  // ---- startTranscribe -------------------------------------------------

  describe('startTranscribe', () => {
    it('throws NotFound when the job is missing', async () => {
      prisma.job.findUnique.mockResolvedValue(null);
      await expect(service.startTranscribe('job-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws Conflict when the job is not ASSIGNED', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob({ status: 'NEW' }));
      await expect(service.startTranscribe('job-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('throws Conflict when transcription already started', async () => {
      prisma.job.findUnique.mockResolvedValue(
        makeJob({ status: 'ASSIGNED', transcribeJobStartedAt: new Date() }),
      );
      await expect(service.startTranscribe('job-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('stamps transcribeJobStartedAt for an assigned job', async () => {
      const started = makeJob({
        status: 'ASSIGNED',
        transcribeJobStartedAt: new Date(),
      });
      prisma.job.findUnique
        .mockResolvedValueOnce(makeJob({ status: 'ASSIGNED' }))
        .mockResolvedValueOnce(started);
      prisma.job.updateMany.mockResolvedValue({ count: 1 });

      await expect(service.startTranscribe('job-1')).resolves.toBe(started);
      expect(prisma.job.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'job-1', status: 'ASSIGNED', transcribeJobStartedAt: null },
        }),
      );
    });

    it('throws Conflict when the start lost the race', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob({ status: 'ASSIGNED' }));
      prisma.job.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.startTranscribe('job-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  // ---- finishTranscribe ------------------------------------------------

  describe('finishTranscribe', () => {
    const startedAt = new Date('2026-01-01T10:00:00Z');
    const transcribedAt = new Date('2026-01-01T11:30:00Z'); // +90 min

    it('throws NotFound when the job is missing', async () => {
      prisma.job.findUnique.mockResolvedValue(null);
      await expect(
        service.finishTranscribe('job-1', transcribedAt),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws Conflict when the job is not ASSIGNED', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob({ status: 'NEW' }));
      await expect(
        service.finishTranscribe('job-1', transcribedAt),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws Conflict when transcription was never started', async () => {
      prisma.job.findUnique.mockResolvedValue(
        makeJob({ status: 'ASSIGNED', transcribeJobStartedAt: null }),
      );
      await expect(
        service.finishTranscribe('job-1', transcribedAt),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('computes duration as whole minutes of the transcription window', async () => {
      const done = makeJob({ status: 'TRANSCRIBED' });
      prisma.job.findUnique
        .mockResolvedValueOnce(
          makeJob({ status: 'ASSIGNED', transcribeJobStartedAt: startedAt }),
        )
        .mockResolvedValueOnce(done);
      prisma.job.updateMany.mockResolvedValue({ count: 1 });
      prisma.reporters.updateMany.mockResolvedValue({ count: 1 });

      await expect(
        service.finishTranscribe('job-1', transcribedAt),
      ).resolves.toBe(done);

      expect(prisma.job.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            duration: 90,
            transcribedAt,
            status: 'TRANSCRIBED',
          }),
        }),
      );
      // reporter is freed
      expect(prisma.reporters.updateMany).toHaveBeenCalledWith({
        where: { currentJobId: 'job-1' },
        data: { isAvailable: true, currentJobId: null },
      });
    });

    it('clamps a negative window to a 0 duration', async () => {
      prisma.job.findUnique
        .mockResolvedValueOnce(
          makeJob({
            status: 'ASSIGNED',
            transcribeJobStartedAt: new Date('2026-01-01T12:00:00Z'),
          }),
        )
        .mockResolvedValueOnce(makeJob({ status: 'TRANSCRIBED' }));
      prisma.job.updateMany.mockResolvedValue({ count: 1 });
      prisma.reporters.updateMany.mockResolvedValue({ count: 1 });

      // transcribedAt is before the start
      await service.finishTranscribe('job-1', transcribedAt);

      expect(prisma.job.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ duration: 0 }),
        }),
      );
    });

    it('throws Conflict when the finish lost the race', async () => {
      prisma.job.findUnique.mockResolvedValue(
        makeJob({ status: 'ASSIGNED', transcribeJobStartedAt: startedAt }),
      );
      prisma.job.updateMany.mockResolvedValue({ count: 0 });
      await expect(
        service.finishTranscribe('job-1', transcribedAt),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  // ---- assignJobToEditor ----------------------------------------------

  describe('assignJobToEditor', () => {
    it('throws NotFound when the job is missing', async () => {
      prisma.job.findUnique.mockResolvedValue(null);
      await expect(
        service.assignJobToEditor('job-1', 'ed-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws Conflict when the job is not TRANSCRIBED', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob({ status: 'ASSIGNED' }));
      await expect(
        service.assignJobToEditor('job-1', 'ed-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws Conflict when an editor is already assigned', async () => {
      prisma.job.findUnique.mockResolvedValue(
        makeJob({ status: 'TRANSCRIBED', editorId: 'ed-existing' }),
      );
      await expect(
        service.assignJobToEditor('job-1', 'ed-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws NotFound when the editor is missing', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob({ status: 'TRANSCRIBED' }));
      prisma.editor.findUnique.mockResolvedValue(null);
      await expect(
        service.assignJobToEditor('job-1', 'ed-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws Conflict when the editor is busy', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob({ status: 'TRANSCRIBED' }));
      prisma.editor.findUnique.mockResolvedValue(
        makeEditor({ isAvailable: false }),
      );
      await expect(
        service.assignJobToEditor('job-1', 'ed-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('atomically claims the editor and assigns the job', async () => {
      const assigned = makeJob({ status: 'TRANSCRIBED', editorId: 'ed-1' });
      prisma.job.findUnique
        .mockResolvedValueOnce(makeJob({ status: 'TRANSCRIBED' }))
        .mockResolvedValueOnce(assigned);
      prisma.editor.findUnique.mockResolvedValue(makeEditor());
      prisma.editor.updateMany.mockResolvedValue({ count: 1 });
      prisma.job.updateMany.mockResolvedValue({ count: 1 });

      await expect(service.assignJobToEditor('job-1', 'ed-1')).resolves.toBe(
        assigned,
      );
      expect(prisma.editor.updateMany).toHaveBeenCalledWith({
        where: { id: 'ed-1', isAvailable: true },
        data: { isAvailable: false, currentJobId: 'job-1' },
      });
      expect(prisma.job.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'job-1', status: 'TRANSCRIBED', editorId: null },
        }),
      );
    });

    it('throws Conflict when the editor was just taken (claim race)', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob({ status: 'TRANSCRIBED' }));
      prisma.editor.findUnique.mockResolvedValue(makeEditor());
      prisma.editor.updateMany.mockResolvedValue({ count: 0 });
      await expect(
        service.assignJobToEditor('job-1', 'ed-1'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.job.updateMany).not.toHaveBeenCalled();
    });

    it('throws Conflict when the job gained an editor mid-flight (assign race)', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob({ status: 'TRANSCRIBED' }));
      prisma.editor.findUnique.mockResolvedValue(makeEditor());
      prisma.editor.updateMany.mockResolvedValue({ count: 1 });
      prisma.job.updateMany.mockResolvedValue({ count: 0 });
      await expect(
        service.assignJobToEditor('job-1', 'ed-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  // ---- finishReview ----------------------------------------------------

  describe('finishReview', () => {
    const reviewable = makeJob({
      status: 'TRANSCRIBED',
      editorId: 'ed-1',
      reporterId: 'rep-1',
      duration: 30,
    });

    it('throws NotFound when the job is missing', async () => {
      prisma.job.findUnique.mockResolvedValue(null);
      await expect(service.finishReview('job-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws Conflict when no editor is assigned', async () => {
      prisma.job.findUnique.mockResolvedValue(
        makeJob({ status: 'TRANSCRIBED', editorId: null }),
      );
      await expect(service.finishReview('job-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('throws Conflict when the job has no reporter', async () => {
      prisma.job.findUnique.mockResolvedValue(
        makeJob({ status: 'TRANSCRIBED', editorId: 'ed-1', reporterId: null }),
      );
      await expect(service.finishReview('job-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('throws NotFound when reporter or editor cannot be found', async () => {
      prisma.job.findUnique.mockResolvedValue(reviewable);
      prisma.reporters.findUnique.mockResolvedValue(makeReporter());
      prisma.editor.findUnique.mockResolvedValue(null);
      await expect(service.finishReview('job-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('completes review, snapshots the payment, and frees the editor', async () => {
      const reviewed = makeJob({ status: 'REVIEWED' });
      prisma.job.findUnique
        .mockResolvedValueOnce(reviewable)
        .mockResolvedValueOnce(reviewed);
      prisma.reporters.findUnique.mockResolvedValue(
        makeReporter({ ratePerMinute: 2000 }),
      );
      prisma.editor.findUnique.mockResolvedValue(makeEditor({ flatFee: 150000 }));
      prisma.job.updateMany.mockResolvedValue({ count: 1 });
      prisma.payment.create.mockResolvedValue({});
      prisma.editor.updateMany.mockResolvedValue({ count: 1 });

      await expect(service.finishReview('job-1')).resolves.toBe(reviewed);

      // 2000 * 30 = 60000 transcribe; 150000 flat review; total 210000
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: {
          jobId: 'job-1',
          reporterId: 'rep-1',
          editorId: 'ed-1',
          transcribePaymentAmount: 60000,
          reviewPaymentAmount: 150000,
          totalPayout: 210000,
          transcribeDuration: 30,
        },
      });
      expect(prisma.editor.updateMany).toHaveBeenCalledWith({
        where: { currentJobId: 'job-1' },
        data: { isAvailable: true, currentJobId: null },
      });
    });

    it('throws Conflict when the finish lost the race', async () => {
      prisma.job.findUnique.mockResolvedValue(reviewable);
      prisma.reporters.findUnique.mockResolvedValue(makeReporter());
      prisma.editor.findUnique.mockResolvedValue(makeEditor());
      prisma.job.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.finishReview('job-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.payment.create).not.toHaveBeenCalled();
    });
  });

  // ---- payJob ----------------------------------------------------------

  describe('payJob', () => {
    it('throws NotFound when the job is missing', async () => {
      prisma.job.findUnique.mockResolvedValue(null);
      await expect(service.payJob('job-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws Conflict when the job is not REVIEWED', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob({ status: 'TRANSCRIBED' }));
      await expect(service.payJob('job-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('throws Conflict when there is no payment to settle', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob({ status: 'REVIEWED' }));
      prisma.payment.findUnique.mockResolvedValue(null);
      await expect(service.payJob('job-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('marks a reviewed, paid job as completed', async () => {
      const completed = makeJob({ status: 'COMPLETED' });
      prisma.job.findUnique
        .mockResolvedValueOnce(makeJob({ status: 'REVIEWED' }))
        .mockResolvedValueOnce(completed);
      prisma.payment.findUnique.mockResolvedValue({ id: 'pay-1' });
      prisma.job.updateMany.mockResolvedValue({ count: 1 });

      await expect(service.payJob('job-1')).resolves.toBe(completed);
      expect(prisma.job.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'job-1', status: 'REVIEWED' },
          data: expect.objectContaining({ status: 'COMPLETED' }),
        }),
      );
    });

    it('throws Conflict when the settle lost the race', async () => {
      prisma.job.findUnique.mockResolvedValue(makeJob({ status: 'REVIEWED' }));
      prisma.payment.findUnique.mockResolvedValue({ id: 'pay-1' });
      prisma.job.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.payJob('job-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });
});

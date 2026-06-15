import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateJobInput } from "@repo/schema";
import { PrismaService } from "src/common/prisma.service";
import { Prisma } from "../../generated/prisma/client";


@Injectable()
export class JobsService {

  constructor(private readonly prismaService: PrismaService) { }


  getAllJobs() {
    return this.prismaService.job.findMany();
  }

  async getJobById(id: string) {
    const job = await this.prismaService.job.findUnique({
      where: { id },
      include: { reporter: true, editor: true, payment: true },
    });
    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    return job;
  }

  async createJob(data: CreateJobInput) {
    try {
      return await this.prismaService.job.create({
        data: {
          caseNumber: data.caseNumber,
          caseName: data.caseName,
          location: data.location,
          city: data.city,
          duration: 0
        }
      });
    } catch (error) {
      // caseNumber is @unique — a duplicate raises Prisma's P2002.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `A job with case number "${data.caseNumber}" already exists`,
        );
      }
      throw error;
    }
  }

  getJobsCount() {
    return this.prismaService.job.count({
      where: { status: { not: 'COMPLETED' } }
    });
  }


  async assignJobToReporter(jobId: string, reporterId: string) {

    //check if job exist
    const job = await this.prismaService.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    // check if reporter also exist
    const reporter = await this.prismaService.reporters.findUnique({
      where: { id: reporterId },
    });
    if (!reporter) {
      throw new NotFoundException(`Reporter ${reporterId} not found`);
    }

    //check if reporter already working on a job
    if (reporter.currentJobId || !reporter.isAvailable) {
      throw new ConflictException(`Reporter ${reporterId} is already working on a job`);
    }

    //check if job is phyiscal, then reporter location and job city has to be match
    if (job.location === 'physical' && job.city !== reporter.location) {
      throw new BadRequestException(`Reporter ${reporterId} is not available in ${job.city}`);
    }

    /*
     * Update reporter isAvailable false and currentJobId.
     * 
     * This is where the tricky part begins, it need to be locked because a reporter can be assign two jobs at the same exact time.
     * 
     */

    return this.prismaService.$transaction(async (prisma) => {
      /*
       * Apply lock on the row level by update the row with where clause.
       * 
       * UPDATE reporters SET isAvailable=false, currentJobId=:job WHERE id=:reporter AND isAvailable=true
       * 
       */
      const claimed = await prisma.reporters.updateMany({
        where: { id: reporterId, isAvailable: true },
        data: {
          isAvailable: false,
          currentJobId: jobId,
        },
      });
      if (claimed.count === 0) {
        throw new ConflictException(
          `Reporter ${reporterId} was just assigned to another job`,
        );
      }

      /*
       * Successful reporter update will then update job assignedAt and reporterId.
       */

      const assigned = await prisma.job.updateMany({
        where: { id: jobId, reporterId: null, status: 'NEW' },
        data: {
          assignedAt: new Date(),
          reporterId: reporterId,
          status: 'ASSIGNED',
        },
      });
      if (assigned.count === 0) {
        throw new ConflictException(`Job ${jobId} is already assigned`);
      }

      return prisma.job.findUnique({ where: { id: jobId } });
    });

  }


  async startTranscribe(jobId: string) {

    //check if job exist
    const job = await this.prismaService.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    //check if job is assigned to a reporter
    if (job.status !== 'ASSIGNED') {
      throw new ConflictException(`Job ${jobId} is not assigned to a reporter`);
    }

    //check if transcription has not already started
    if (job.transcribeJobStartedAt) {
      throw new ConflictException(`Job ${jobId} transcription has already started`);
    }

    /*
     * Stamp when the reporter started transcribing. This is the start of the
     * billable transcription window.
     *
     * UPDATE jobs SET transcribeJobStartedAt=now() WHERE id=:job AND status='ASSIGNED' AND transcribeJobStartedAt IS NULL
     *
     */
    const { count } = await this.prismaService.job.updateMany({
      where: { id: jobId, status: 'ASSIGNED', transcribeJobStartedAt: null },
      data: { transcribeJobStartedAt: new Date() },
    });
    if (count === 0) {
      throw new ConflictException(`Job ${jobId} transcription has already started`);
    }

    return this.prismaService.job.findUnique({ where: { id: jobId } });
  }


  async finishTranscribe(jobId: string, transcribedAt: Date) {

    //check if job exist
    const job = await this.prismaService.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    //check if job is being transcribed, status has to be ASSIGNED
    if (job.status !== 'ASSIGNED') {
      throw new ConflictException(
        `Job ${jobId} is not being transcribed`,
      );
    }

    //check if transcription has been started
    if (!job.transcribeJobStartedAt) {
      throw new ConflictException(`Job ${jobId} transcription has not started`);
    }

    /*
     * Duration is the transcription window — from transcribeJobStartedAt until
     * the entered transcribedAt — expressed in whole minutes. This is what the
     * reporter is paid for.
     */
    const duration = Math.max(
      0,
      Math.round(
        (transcribedAt.getTime() - job.transcribeJobStartedAt.getTime()) / 60000,
      ),
    );

    /*
     * Update job transcribedAt, duration, and status to TRANSCRIBED.
     *
     * This need to be locked because the update can only be done while the job status is still ASSIGNED.
     *
     */

    return this.prismaService.$transaction(async (prisma) => {
      /*
       * Apply lock on the row level by update the row with where clause.
       *
       * UPDATE jobs SET transcribedAt=:transcribedAt, duration=:duration, status='TRANSCRIBED' WHERE id=:job AND status='ASSIGNED' AND transcribeJobStartedAt IS NOT NULL
       *
       */
      const { count } = await prisma.job.updateMany({
        where: { id: jobId, status: 'ASSIGNED', transcribeJobStartedAt: { not: null } },
        data: {
          transcribedAt: transcribedAt,
          duration: duration,
          status: 'TRANSCRIBED',
        },
      });
      if (count === 0) {
        throw new ConflictException(`Job ${jobId} is not being transcribed`);
      }

      /*
       * Successful job update will then free the reporter who was transcribing.
       *
       * UPDATE reporters SET isAvailable=true, currentJobId=null WHERE currentJobId=:job
       *
       */
      await prisma.reporters.updateMany({
        where: { currentJobId: jobId },
        data: { isAvailable: true, currentJobId: null },
      });

      return prisma.job.findUnique({ where: { id: jobId } });
    });
  }


  async assignJobToEditor(jobId: string, editorId: string) {

    //check if job exist
    const job = await this.prismaService.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    //check if job is transcribed, an editor can only review a transcribed job
    if (job.status !== 'TRANSCRIBED') {
      throw new ConflictException(`Job ${jobId} is not ready for review`);
    }

    //check if an editor is already assigned
    if (job.editorId) {
      throw new ConflictException(`Job ${jobId} already has an editor`);
    }

    //check if editor also exist
    const editor = await this.prismaService.editor.findUnique({
      where: { id: editorId },
    });
    if (!editor) {
      throw new NotFoundException(`Editor ${editorId} not found`);
    }

    //check if editor already working on a job
    if (editor.currentJobId || !editor.isAvailable) {
      throw new ConflictException(`Editor ${editorId} is already working on a job`);
    }

    /*
     * Update editor isAvailable false and currentJobId.
     *
     * This need to be locked because an editor can be assign two jobs at the same exact time.
     *
     */

    return this.prismaService.$transaction(async (prisma) => {
      /*
       * Apply lock on the row level by update the row with where clause.
       *
       * UPDATE editors SET isAvailable=false, currentJobId=:job WHERE id=:editor AND isAvailable=true
       *
       */
      const claimed = await prisma.editor.updateMany({
        where: { id: editorId, isAvailable: true },
        data: {
          isAvailable: false,
          currentJobId: jobId,
        },
      });
      if (claimed.count === 0) {
        throw new ConflictException(
          `Editor ${editorId} was just assigned to another job`,
        );
      }

      /*
       * Successful editor update will then update job reviewAssignedAt and editorId.
       *
       * UPDATE jobs SET reviewAssignedAt=now(), editorId=:editor WHERE id=:job AND status='TRANSCRIBED' AND editorId IS NULL
       *
       */
      const assigned = await prisma.job.updateMany({
        where: { id: jobId, status: 'TRANSCRIBED', editorId: null },
        data: {
          reviewAssignedAt: new Date(),
          editorId: editorId,
        },
      });
      if (assigned.count === 0) {
        throw new ConflictException(`Job ${jobId} already has an editor`);
      }

      return prisma.job.findUnique({ where: { id: jobId } });
    });

  }


  async finishReview(jobId: string) {

    //check if job exist
    const job = await this.prismaService.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    //check if job is being reviewed, status TRANSCRIBED with an editor assigned
    if (job.status !== 'TRANSCRIBED' || !job.editorId) {
      throw new ConflictException(`Job ${jobId} is not being reviewed`);
    }

    //a reviewed job always has a reporter (transcriber) and an editor
    if (!job.reporterId) {
      throw new ConflictException(`Job ${jobId} is missing a reporter`);
    }
    const reporterId = job.reporterId;
    const editorId = job.editorId;

    //get the rates needed to calculate the payment
    const reporter = await this.prismaService.reporters.findUnique({
      where: { id: reporterId },
    });
    const editor = await this.prismaService.editor.findUnique({
      where: { id: editorId },
    });
    if (!reporter || !editor) {
      throw new NotFoundException(`Reporter or editor not found for job ${jobId}`);
    }

    /*
     * transcribePaymentAmount = reporter.ratePerMinute × job.duration (set at
     *                           finish-transcribe, the transcription window)
     * reviewPaymentAmount     = editor.flatFee (flat per job)
     * totalPayout             = transcribe + review
     */
    const transcribePaymentAmount = reporter.ratePerMinute * job.duration;
    const reviewPaymentAmount = editor.flatFee;
    const totalPayout = transcribePaymentAmount + reviewPaymentAmount;

    /*
     * Update job reviewedAt with the current timestamp and status to REVIEWED,
     * then calculate the payment right after the review is completed.
     *
     * This need to be locked because the update can only be done while an editor is still assigned.
     *
     */

    return this.prismaService.$transaction(async (prisma) => {
      /*
       * Apply lock on the row level by update the row with where clause.
       *
       * UPDATE jobs SET reviewedAt=now(), status='REVIEWED' WHERE id=:job AND status='TRANSCRIBED' AND editorId IS NOT NULL
       *
       */
      const { count } = await prisma.job.updateMany({
        where: { id: jobId, status: 'TRANSCRIBED', editorId: { not: null } },
        data: {
          reviewedAt: new Date(),
          status: 'REVIEWED',
        },
      });
      if (count === 0) {
        throw new ConflictException(`Job ${jobId} is not being reviewed`);
      }

      /*
       * Calculate the payment snapshot now that the review is done.
       */
      await prisma.payment.create({
        data: {
          jobId,
          reporterId: reporterId,
          editorId: editorId,
          transcribePaymentAmount,
          reviewPaymentAmount,
          totalPayout,
          transcribeDuration: job.duration,
        },
      });

      /*
       * Successful job update will then free the editor who was reviewing.
       *
       * UPDATE editors SET isAvailable=true, currentJobId=null WHERE currentJobId=:job
       *
       */
      await prisma.editor.updateMany({
        where: { currentJobId: jobId },
        data: { isAvailable: true, currentJobId: null },
      });

      return prisma.job.findUnique({ where: { id: jobId } });
    });
  }


  async payJob(jobId: string) {

    //check if job exist
    const job = await this.prismaService.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    //check if job is reviewed and not yet completed
    if (job.status !== 'REVIEWED') {
      throw new ConflictException(`Job ${jobId} is not ready to be paid`);
    }

    //check if the payment has been calculated
    const payment = await this.prismaService.payment.findUnique({
      where: { jobId },
    });
    if (!payment) {
      throw new ConflictException(`Job ${jobId} has no payment to settle`);
    }

    /*
     * Mark the job as done.
     *
     * UPDATE jobs SET status='COMPLETED', completedAt=now() WHERE id=:job AND status='REVIEWED'
     *
     */
    const { count } = await this.prismaService.job.updateMany({
      where: { id: jobId, status: 'REVIEWED' },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
    if (count === 0) {
      throw new ConflictException(`Job ${jobId} is not ready to be paid`);
    }

    return this.prismaService.job.findUnique({ where: { id: jobId } });
  }




}

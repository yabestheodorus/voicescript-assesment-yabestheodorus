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
      include: { reporter: true, payment: true },
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
    return this.prismaService.job.count();
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

    /*
     * Update job transcribedAt and status to TRANSCRIBED.
     *
     * This need to be locked because the update can only be done while the job status is still ASSIGNED.
     *
     */

    return this.prismaService.$transaction(async (prisma) => {
      /*
       * Apply lock on the row level by update the row with where clause.
       *
       * UPDATE jobs SET transcribedAt=:transcribedAt, status='TRANSCRIBED' WHERE id=:job AND status='ASSIGNED'
       *
       */
      const { count } = await prisma.job.updateMany({
        where: { id: jobId, status: 'ASSIGNED' },
        data: {
          transcribedAt: transcribedAt,
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




}

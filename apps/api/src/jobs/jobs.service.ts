import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateJobInput } from "@repo/schema";
import { PrismaService } from "src/common/prisma.service";


@Injectable()
export class JobsService {

  constructor(private readonly prismaService: PrismaService) { }


  getAllJobs() {
    return this.prismaService.job.findMany();
  }

  async getJobById(id: string) {
    const job = await this.prismaService.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    return job;
  }

  createJob(data: CreateJobInput) {
    return this.prismaService.job.create({
      data: {
        caseNumber: data.caseNumber,
        caseName: data.caseName,
        location: data.location,
        city: data.city,
        duration: 0
      }
    });
  }



}

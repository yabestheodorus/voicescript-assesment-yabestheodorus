import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { type CreateJobInput, createJobSchema } from "@repo/schema";


@Controller('/jobs')
export class JobsController {

  constructor(private readonly jobsService: JobsService) { }


  @Get()
  getAllJobs() {
    return this.jobsService.getAllJobs();
  }

  @Get(':id')
  getJob(@Param('id') id: string) {
    return this.jobsService.getJobById(id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createJobSchema))
    body: CreateJobInput,
  ) {
    return this.jobsService.createJob(body);
  }

}
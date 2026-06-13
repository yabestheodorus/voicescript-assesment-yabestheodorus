import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import {
  type AssignEditorInput,
  assignEditorSchema,
  type AssignReporterInput,
  assignReporterSchema,
  type CreateJobInput,
  createJobSchema,
  type FinishTranscribeInput,
  finishTranscribeSchema,
} from "@repo/schema";


@Controller('/jobs')
export class JobsController {

  constructor(private readonly jobsService: JobsService) { }


  @Get()
  getAllJobs() {
    return this.jobsService.getAllJobs();
  }

  @Get('/count')
  getJobsCount() {
    return this.jobsService.getJobsCount();
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

  @Post(':id/assign-reporter')
  assignReporter(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(assignReporterSchema))
    body: AssignReporterInput,
  ) {
    return this.jobsService.assignJobToReporter(id, body.reporterId);
  }

  @Post(':id/start-transcribe')
  startTranscribe(@Param('id') id: string) {
    return this.jobsService.startTranscribe(id);
  }

  @Post(':id/finish-transcribe')
  finishTranscribe(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(finishTranscribeSchema))
    body: FinishTranscribeInput,
  ) {
    return this.jobsService.finishTranscribe(id, body.transcribedAt);
  }

  @Post(':id/assign-editor')
  assignEditor(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(assignEditorSchema))
    body: AssignEditorInput,
  ) {
    return this.jobsService.assignJobToEditor(id, body.editorId);
  }

  @Post(':id/finish-review')
  finishReview(@Param('id') id: string) {
    return this.jobsService.finishReview(id);
  }

  @Post(':id/pay')
  pay(@Param('id') id: string) {
    return this.jobsService.payJob(id);
  }

}
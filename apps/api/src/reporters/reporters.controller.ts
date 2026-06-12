import { Controller, Get } from "@nestjs/common";
import { ReportersService } from "./reporters.service";

@Controller("/reporters")
export class ReportersController {

  constructor(private readonly reportersService: ReportersService) { }

  @Get()
  get() {
    return this.reportersService.findAll()
  }

}
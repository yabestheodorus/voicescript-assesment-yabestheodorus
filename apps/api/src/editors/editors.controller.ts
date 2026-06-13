import { Controller, Get } from "@nestjs/common";
import { EditorsService } from "./editors.service";

@Controller("/editors")
export class EditorsController {

  constructor(private readonly editorsService: EditorsService) { }

  @Get()
  get() {
    return this.editorsService.findAll()
  }

}

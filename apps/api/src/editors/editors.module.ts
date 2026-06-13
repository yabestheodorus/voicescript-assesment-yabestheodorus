import { Module } from "@nestjs/common";
import { EditorsController } from "./editors.controller";
import { EditorsService } from "./editors.service";


@Module({
  imports: [],
  providers: [EditorsService],
  exports: [EditorsService],
  controllers: [EditorsController]
})
export class EditorsModule { }

import { Module } from "@nestjs/common";
import { ReportersController } from "./reporters.controller";
import { ReportersService } from "./reporters.service";


@Module({
  imports: [],
  providers: [ReportersService],
  exports: [ReportersService],
  controllers: [ReportersController]
})
export class ReportersModule { }
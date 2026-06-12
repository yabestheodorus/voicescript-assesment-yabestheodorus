import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";


@Injectable()
export class ReportersService {

  constructor(private readonly prismaService: PrismaService) { }

  findAll() {
    return this.prismaService.reporters.findMany()
  }
}
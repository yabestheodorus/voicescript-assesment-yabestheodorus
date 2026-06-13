import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";


@Injectable()
export class EditorsService {

  constructor(private readonly prismaService: PrismaService) { }

  findAll() {
    return this.prismaService.editor.findMany()
  }
}

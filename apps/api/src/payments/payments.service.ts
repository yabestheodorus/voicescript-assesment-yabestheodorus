import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";


@Injectable()
export class PaymentsService {

  constructor(private readonly prismaService: PrismaService) { }

  /**
   * Every payment snapshot, joined with the job/reporter/editor names the
   * payouts table renders. A payment row is created when a review finishes, so
   * ordering by the job's reviewedAt surfaces the most recent payouts first.
   */
  findAll() {
    return this.prismaService.payment.findMany({
      include: {
        job: {
          select: {
            id: true,
            caseName: true,
            caseNumber: true,
            status: true,
            reviewedAt: true,
            completedAt: true,
          },
        },
        reporter: { select: { id: true, name: true } },
        editor: { select: { id: true, name: true } },
      },
      orderBy: { job: { reviewedAt: 'desc' } },
    });
  }

  /**
   * Number of outstanding payouts — payments whose job hasn't been completed yet. 
   */
  countPending() {
    return this.prismaService.payment.count({
      where: { job: { status: { not: 'COMPLETED' } } },
    });
  }
}

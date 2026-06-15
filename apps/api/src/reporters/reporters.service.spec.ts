import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ReportersService } from './reporters.service';
import { PrismaService } from '../common/prisma.service';

describe('ReportersService', () => {
  let service: ReportersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { reporters: { findMany: jest.fn() } };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ReportersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(ReportersService);
  });

  it('returns every reporter from the database', async () => {
    const reporters = [{ id: 'r1' }, { id: 'r2' }];
    prisma.reporters.findMany.mockResolvedValue(reporters);

    await expect(service.findAll()).resolves.toBe(reporters);
    expect(prisma.reporters.findMany).toHaveBeenCalledTimes(1);
  });

  it('returns an empty list when there are no reporters', async () => {
    prisma.reporters.findMany.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual([]);
  });
});

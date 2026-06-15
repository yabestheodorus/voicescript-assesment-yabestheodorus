import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { EditorsService } from './editors.service';
import { PrismaService } from '../common/prisma.service';

describe('EditorsService', () => {
  let service: EditorsService;
  let prisma: any;
  ``
  beforeEach(async () => {
    prisma = { editor: { findMany: jest.fn() } };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        EditorsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(EditorsService);
  });

  it('returns every editor from the database', async () => {
    const editors = [{ id: 'e1' }, { id: 'e2' }];
    prisma.editor.findMany.mockResolvedValue(editors);

    await expect(service.findAll()).resolves.toBe(editors);
    expect(prisma.editor.findMany).toHaveBeenCalledTimes(1);
  });

  it('returns an empty list when there are no editors', async () => {
    prisma.editor.findMany.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual([]);
  });
});

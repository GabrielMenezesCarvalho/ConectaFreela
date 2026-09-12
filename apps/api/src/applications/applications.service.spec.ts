import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ApplicationStatus, OpportunityStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationsService } from './applications.service';

describe('ApplicationsService', () => {
  type CreateApplicationArgs = { data: { message: string } };
  const findUser = jest.fn();
  const findOpportunity = jest.fn();
  const findApplication = jest.fn();
  const createApplication = jest.fn((args: CreateApplicationArgs) => {
    void args;
    return Promise.resolve({ id: 'application-id' });
  });
  const updateApplication = jest.fn();
  const prisma = {
    user: { findUnique: findUser },
    opportunity: { findUnique: findOpportunity },
    application: {
      findUnique: findApplication,
      create: createApplication,
      update: updateApplication,
      findMany: jest.fn(),
    },
  } as unknown as PrismaService;
  const service = new ApplicationsService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('creates a trimmed application for a talent and active opportunity', async () => {
    findUser.mockResolvedValue({ role: UserRole.TALENT });
    findOpportunity.mockResolvedValue({
      id: 'opportunity-id',
      status: OpportunityStatus.ACTIVE,
    });

    await service.create({
      opportunityId: 'opportunity-id',
      talentUserId: 'talent-id',
      message: '  Tenho experiência e posso contribuir com o projeto.  ',
    });

    expect(createApplication).toHaveBeenCalledTimes(1);
    const createArgs = createApplication.mock.calls[0][0];
    expect(createArgs.data.message).toBe(
      'Tenho experiência e posso contribuir com o projeto.',
    );
  });

  it('rejects an application from a non-talent user', async () => {
    findUser.mockResolvedValue({ role: UserRole.ORGANIZATION });

    await expect(
      service.create({
        opportunityId: 'opportunity-id',
        talentUserId: 'organizer-id',
        message: 'Mensagem suficientemente longa para candidatura.',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(createApplication).not.toHaveBeenCalled();
  });

  it('only allows withdrawal while the application is under review', async () => {
    findUser.mockResolvedValue({ role: UserRole.TALENT });
    findApplication.mockResolvedValue({
      talentUserId: 'talent-id',
      status: ApplicationStatus.APPROVED,
    });

    await expect(
      service.withdraw('application-id', { talentUserId: 'talent-id' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(updateApplication).not.toHaveBeenCalled();
  });
});

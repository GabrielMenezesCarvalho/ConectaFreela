import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  Modality,
  OpportunityStatus,
  OpportunityType,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OpportunitiesService } from './opportunities.service';

describe('OpportunitiesService', () => {
  type FindOpportunitiesArgs = { where: Record<string, unknown> };
  type CreateOpportunityArgs = {
    data: { skills: string[]; organizationId: string | null };
  };

  let capturedFindArgs: FindOpportunitiesArgs | undefined;
  let capturedCreateArgs: CreateOpportunityArgs | undefined;

  const findOpportunities = jest.fn((args: FindOpportunitiesArgs) => {
    capturedFindArgs = args;
    return Promise.resolve([]);
  });
  const createOpportunity = jest.fn((args: CreateOpportunityArgs) => {
    capturedCreateArgs = args;
    return Promise.resolve({ id: 'opp-id' });
  });
  const findOpportunity = jest.fn();
  const updateOpportunity = jest.fn();
  const updateManyOpportunities = jest.fn();
  const findSubscription = jest.fn();
  const updateManySubscriptions = jest.fn();
  const findUser =
    jest.fn<() => Promise<{ id: string; role: UserRole } | null>>();
  const findOrganization =
    jest.fn<() => Promise<{ ownerUserId: string } | null>>();
  const transactionClient = {
    opportunity: {
      findUnique: findOpportunity,
      updateMany: updateManyOpportunities,
    },
    premiumSubscription: {
      findUnique: findSubscription,
      updateMany: updateManySubscriptions,
    },
  };
  const runTransaction = jest.fn(
    (operation: (transaction: typeof transactionClient) => Promise<unknown>) =>
      operation(transactionClient),
  );

  const prisma = {
    opportunity: {
      findMany: findOpportunities,
      findUnique: findOpportunity,
      create: createOpportunity,
      update: updateOpportunity,
      updateMany: updateManyOpportunities,
    },
    premiumSubscription: {
      findUnique: findSubscription,
      updateMany: updateManySubscriptions,
    },
    user: { findUnique: findUser },
    organization: { findUnique: findOrganization },
    $transaction: runTransaction,
  } as unknown as PrismaService;
  const service = new OpportunitiesService(prisma);

  const validDto = {
    createdByUserId: 'organizer-id',
    title: 'Analista de dados voluntário',
    description: 'Descrição suficientemente longa para passar na validação.',
    type: OpportunityType.VOLUNTEER,
    modality: Modality.REMOTE,
    skills: ['  SQL  ', '', 'Python'],
  };

  beforeEach(() => {
    capturedFindArgs = undefined;
    capturedCreateArgs = undefined;
    jest.clearAllMocks();
  });

  it('restricts the public listing to active opportunities', async () => {
    await service.findAll({});

    expect(capturedFindArgs?.where).toEqual({
      status: OpportunityStatus.ACTIVE,
    });
  });

  it('returns every status when an organizer lists their own', async () => {
    await service.findAll({ createdByUserId: 'organizer-id' });

    expect(capturedFindArgs?.where).toEqual({
      createdByUserId: 'organizer-id',
    });
  });

  it('trims skills and drops empty ones on create', async () => {
    findUser.mockResolvedValue({
      id: 'organizer-id',
      role: UserRole.ORGANIZATION,
    });

    await service.create(validDto);

    expect(capturedCreateArgs?.data.skills).toEqual(['SQL', 'Python']);
    expect(capturedCreateArgs?.data.organizationId).toBeNull();
  });

  it('rejects a talent trying to publish', async () => {
    findUser.mockResolvedValue({ id: 'talent-id', role: UserRole.TALENT });

    await expect(service.create(validDto)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(createOpportunity).not.toHaveBeenCalled();
  });

  it('rejects publishing on behalf of someone else organization', async () => {
    findUser.mockResolvedValue({
      id: 'organizer-id',
      role: UserRole.ORGANIZATION,
    });
    findOrganization.mockResolvedValue({ ownerUserId: 'another-user-id' });

    await expect(
      service.create({ ...validDto, organizationId: 'org-id' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(createOpportunity).not.toHaveBeenCalled();
  });

  it('fails when the author does not exist', async () => {
    findUser.mockResolvedValue(null);

    await expect(service.create(validDto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects featuring when the organizer has no credits left', async () => {
    findOpportunity.mockResolvedValue({
      createdByUserId: 'organizer-id',
      status: OpportunityStatus.ACTIVE,
      isFeatured: false,
    });
    findSubscription.mockResolvedValue({
      status: 'ACTIVE',
      featuredCredits: 0,
    });

    await expect(
      service.feature('opportunity-id', {
        organizerUserId: 'organizer-id',
      }),
    ).rejects.toThrow('Seus créditos de destaque acabaram.');
    expect(updateOpportunity).not.toHaveBeenCalled();
  });

  it('consumes one credit when featuring an opportunity', async () => {
    findOpportunity
      .mockResolvedValueOnce({
        createdByUserId: 'organizer-id',
        status: OpportunityStatus.ACTIVE,
        isFeatured: false,
      })
      .mockResolvedValueOnce({ id: 'opportunity-id', isFeatured: true });
    findSubscription
      .mockResolvedValueOnce({ status: 'ACTIVE', featuredCredits: 2 })
      .mockResolvedValueOnce({ featuredCredits: 1 });
    updateManySubscriptions.mockResolvedValue({ count: 1 });
    updateManyOpportunities.mockResolvedValue({ count: 1 });

    const result = await service.feature('opportunity-id', {
      organizerUserId: 'organizer-id',
    });

    expect(result.remainingFeaturedCredits).toBe(1);
    expect(updateManySubscriptions).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { featuredCredits: { decrement: 1 } },
      }),
    );
  });
});

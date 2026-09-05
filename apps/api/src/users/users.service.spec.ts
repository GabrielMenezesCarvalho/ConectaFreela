import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  type CreateUserArgs = {
    data: {
      name: string;
      email: string;
      passwordHash: string;
      role: UserRole;
      talentProfile?: {
        create: {
          skills: string[];
          availability: string;
          portfolioLinks: string[];
        };
      };
    };
  };

  type FindUsersArgs = {
    select: Record<string, boolean>;
    orderBy: { createdAt: 'desc' };
  };

  let capturedCreateArgs: CreateUserArgs | undefined;
  let capturedFindUsersArgs: FindUsersArgs | undefined;
  const createUser = jest.fn((args: CreateUserArgs) => {
    capturedCreateArgs = args;
    return Promise.resolve({ id: 'user-id' });
  });
  const findUser =
    jest.fn<() => Promise<{ id: string; role: UserRole } | null>>();
  const findUsers = jest.fn((args: FindUsersArgs) => {
    capturedFindUsersArgs = args;
    return Promise.resolve([]);
  });
  const user = {
    create: createUser,
    findUnique: findUser,
    findMany: findUsers,
  };
  const talentProfile = {
    upsert: jest.fn(),
  };
  const prisma = { user, talentProfile } as unknown as PrismaService;
  const service = new UsersService(prisma);

  beforeEach(() => {
    capturedCreateArgs = undefined;
    capturedFindUsersArgs = undefined;
    jest.clearAllMocks();
  });

  it('creates a talent with normalized data and a password hash', async () => {
    await service.create({
      name: '  Ana Silva  ',
      email: '  ANA@EXAMPLE.COM ',
      password: 'senha-segura',
      role: UserRole.TALENT,
      skills: [' React ', 'Design'],
      availability: '  Até 5 horas por semana ',
      portfolioLinks: [' https://portfolio.example.com '],
    });

    expect(capturedCreateArgs).toBeDefined();
    if (!capturedCreateArgs) throw new Error('Create was not called');

    expect(capturedCreateArgs.data.name).toBe('Ana Silva');
    expect(capturedCreateArgs.data.email).toBe('ana@example.com');
    expect(capturedCreateArgs.data.role).toBe(UserRole.TALENT);
    expect(capturedCreateArgs.data.passwordHash).toMatch(
      /^[a-f0-9]+:[a-f0-9]+$/,
    );
    expect(capturedCreateArgs.data.talentProfile?.create).toMatchObject({
      skills: ['React', 'Design'],
      availability: 'Até 5 horas por semana',
      portfolioLinks: ['https://portfolio.example.com'],
    });
  });

  it('rejects a missing user lookup', async () => {
    findUser.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists users without selecting password hashes', async () => {
    await service.findAll();

    expect(capturedFindUsersArgs?.select.passwordHash).toBeUndefined();
    expect(capturedFindUsersArgs?.orderBy).toEqual({ createdAt: 'desc' });
  });

  it('does not create a talent profile for an organization', async () => {
    findUser.mockResolvedValue({
      id: 'organization-id',
      role: UserRole.ORGANIZATION,
    });

    await expect(
      service.updateTalentProfile('organization-id', { skills: ['Design'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(talentProfile.upsert).not.toHaveBeenCalled();
  });
});

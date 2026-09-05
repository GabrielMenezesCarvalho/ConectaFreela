import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateTalentProfileDto } from './dto/update-talent-profile.dto';

const scryptAsync = promisify(scrypt);

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  talentProfile: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await this.hashPassword(dto.password);

    try {
      return await this.prisma.user.create({
        data: {
          name: dto.name.trim(),
          email,
          passwordHash,
          role: dto.role,
          talentProfile:
            dto.role === UserRole.TALENT
              ? {
                  create: {
                    bio: dto.bio?.trim() || null,
                    skills: this.cleanList(dto.skills ?? []),
                    availability: dto.availability!.trim(),
                    portfolioLinks: this.cleanList(dto.portfolioLinks ?? []),
                  },
                }
              : undefined,
        },
        select: publicUserSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Já existe uma conta com este e-mail.');
      }

      throw error;
    }
  }

  findAll() {
    return this.prisma.user.findMany({
      select: publicUserSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async updateTalentProfile(id: string, dto: UpdateTalentProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (user.role !== UserRole.TALENT) {
      throw new BadRequestException(
        'Somente usuários do tipo talento possuem este perfil.',
      );
    }

    await this.prisma.talentProfile.upsert({
      where: { userId: id },
      create: {
        userId: id,
        bio: dto.bio?.trim() || null,
        skills: this.cleanList(dto.skills ?? []),
        availability: dto.availability?.trim() || 'A combinar',
        portfolioLinks: this.cleanList(dto.portfolioLinks ?? []),
      },
      update: {
        ...(dto.bio !== undefined && { bio: dto.bio.trim() || null }),
        ...(dto.skills !== undefined && {
          skills: this.cleanList(dto.skills),
        }),
        ...(dto.availability !== undefined && {
          availability: dto.availability.trim(),
        }),
        ...(dto.portfolioLinks !== undefined && {
          portfolioLinks: this.cleanList(dto.portfolioLinks),
        }),
      },
    });

    return this.findOne(id);
  }

  private cleanList(values: string[]) {
    return values.map((value) => value.trim()).filter(Boolean);
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${salt}:${derivedKey.toString('hex')}`;
  }
}

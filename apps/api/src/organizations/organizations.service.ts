import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertOrganizationDto } from './dto/upsert-organization.dto';

const organizationSelect = {
  id: true,
  name: true,
  description: true,
  website: true,
  ownerUserId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.OrganizationSelect;

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Devolve `null` em vez de 404: publicar em nome próprio é um caso válido,
   * então "não tenho organização" não é erro.
   */
  findByOwner(ownerUserId: string) {
    return this.prisma.organization.findUnique({
      where: { ownerUserId },
      select: organizationSelect,
    });
  }

  async upsert(dto: UpsertOrganizationDto) {
    const owner = await this.prisma.user.findUnique({
      where: { id: dto.ownerUserId },
      select: { id: true, role: true },
    });

    if (!owner) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (owner.role !== UserRole.ORGANIZATION) {
      throw new ForbiddenException(
        'Somente organizadores podem manter uma organização.',
      );
    }

    const data = {
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      website: dto.website?.trim() || null,
    };

    return this.prisma.organization.upsert({
      where: { ownerUserId: dto.ownerUserId },
      create: { ownerUserId: dto.ownerUserId, ...data },
      update: data,
      select: organizationSelect,
    });
  }
}

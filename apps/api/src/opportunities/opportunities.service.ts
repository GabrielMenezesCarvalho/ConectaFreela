import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OpportunityStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { ListOpportunitiesDto } from './dto/list-opportunities.dto';
import { UpdateOpportunityStatusDto } from './dto/update-opportunity-status.dto';

const opportunitySelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  modality: true,
  weeklyHours: true,
  skills: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  organization: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  _count: { select: { applications: true } },
} satisfies Prisma.OpportunitySelect;

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ListOpportunitiesDto) {
    const isOwnListing = Boolean(query.createdByUserId);

    return this.prisma.opportunity.findMany({
      where: {
        ...(query.createdByUserId && {
          createdByUserId: query.createdByUserId,
        }),
        // A vitrine pública só mostra vagas ativas; o organizador vê as dele em
        // qualquer status, para conseguir reabrir ou encerrar.
        ...(query.status
          ? { status: query.status }
          : isOwnListing
            ? {}
            : { status: OpportunityStatus.ACTIVE }),
      },
      select: opportunitySelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      select: opportunitySelect,
    });

    if (!opportunity) {
      throw new NotFoundException('Oportunidade não encontrada.');
    }

    return opportunity;
  }

  async create(dto: CreateOpportunityDto) {
    await this.assertCanPublish(dto.createdByUserId, dto.organizationId);

    return this.prisma.opportunity.create({
      data: {
        createdByUserId: dto.createdByUserId,
        organizationId: dto.organizationId ?? null,
        title: dto.title.trim(),
        description: dto.description.trim(),
        type: dto.type,
        modality: dto.modality,
        weeklyHours: dto.weeklyHours ?? null,
        skills: dto.skills.map((skill) => skill.trim()).filter(Boolean),
      },
      select: opportunitySelect,
    });
  }

  async updateStatus(id: string, dto: UpdateOpportunityStatusDto) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      select: { createdByUserId: true },
    });

    if (!opportunity) {
      throw new NotFoundException('Oportunidade não encontrada.');
    }

    if (opportunity.createdByUserId !== dto.organizerUserId) {
      throw new ForbiddenException(
        'Esta oportunidade pertence a outra pessoa.',
      );
    }

    return this.prisma.opportunity.update({
      where: { id },
      data: { status: dto.status },
      select: opportunitySelect,
    });
  }

  /**
   * O banco garante que a organização existe, mas não que ela pertence a quem
   * está publicando — essa checagem precisa viver aqui.
   */
  private async assertCanPublish(userId: string, organizationId?: string) {
    const author = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!author) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (author.role !== UserRole.ORGANIZATION) {
      throw new ForbiddenException(
        'Somente organizadores podem publicar oportunidades.',
      );
    }

    if (!organizationId) return;

    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { ownerUserId: true },
    });

    if (!organization) {
      throw new NotFoundException('Organização não encontrada.');
    }

    if (organization.ownerUserId !== author.id) {
      throw new ForbiddenException(
        'Esta organização pertence a outro usuário.',
      );
    }
  }
}

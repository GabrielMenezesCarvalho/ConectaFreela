import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  OpportunityStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { WithdrawApplicationDto } from './dto/withdraw-application.dto';

const applicationSelect = {
  id: true,
  message: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  // Presente quando o organizador já abriu o chat desta candidatura.
  conversation: { select: { id: true } },
  opportunity: {
    select: {
      id: true,
      title: true,
      status: true,
      type: true,
      modality: true,
      organization: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  },
  talent: {
    select: {
      id: true,
      name: true,
      email: true,
      talentProfile: {
        select: {
          bio: true,
          skills: true,
          availability: true,
          portfolioLinks: true,
        },
      },
    },
  },
} satisfies Prisma.ApplicationSelect;

/** O talento decide WITHDRAWN; o organizador só move entre estes três. */
const organizerStatuses: ApplicationStatus[] = [
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.APPROVED,
  ApplicationStatus.REJECTED,
];

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateApplicationDto) {
    await this.assertTalent(dto.talentUserId);
    const message = dto.message.trim();
    if (message.length < 20) {
      throw new BadRequestException(
        'A mensagem de candidatura deve ter pelo menos 20 caracteres.',
      );
    }

    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: dto.opportunityId },
      select: { id: true, status: true },
    });
    if (!opportunity) {
      throw new NotFoundException('Oportunidade não encontrada.');
    }
    if (opportunity.status !== OpportunityStatus.ACTIVE) {
      throw new BadRequestException(
        'Esta oportunidade não está mais recebendo candidaturas.',
      );
    }

    try {
      return await this.prisma.application.create({
        data: {
          opportunityId: dto.opportunityId,
          talentUserId: dto.talentUserId,
          message,
        },
        select: applicationSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Você já se candidatou a esta oportunidade.',
        );
      }
      throw error;
    }
  }

  async findByTalent(talentUserId: string) {
    await this.assertTalent(talentUserId);
    return this.prisma.application.findMany({
      where: { talentUserId },
      select: applicationSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForTalentAndOpportunity(
    talentUserId: string,
    opportunityId: string,
  ) {
    await this.assertTalent(talentUserId);
    return this.prisma.application.findUnique({
      where: { opportunityId_talentUserId: { opportunityId, talentUserId } },
      select: applicationSelect,
    });
  }

  async findByOpportunity(opportunityId: string, organizerUserId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { createdByUserId: true },
    });

    if (!opportunity) {
      throw new NotFoundException('Oportunidade não encontrada.');
    }

    if (opportunity.createdByUserId !== organizerUserId) {
      throw new ForbiddenException(
        'Esta oportunidade pertence a outra pessoa.',
      );
    }

    return this.prisma.application.findMany({
      where: { opportunityId },
      select: applicationSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto) {
    if (!organizerStatuses.includes(dto.status)) {
      throw new BadRequestException(
        'O organizador só pode marcar a candidatura como em análise, aprovada ou recusada.',
      );
    }

    const application = await this.prisma.application.findUnique({
      where: { id },
      select: {
        status: true,
        opportunity: { select: { createdByUserId: true } },
      },
    });

    if (!application) {
      throw new NotFoundException('Candidatura não encontrada.');
    }

    if (application.opportunity.createdByUserId !== dto.organizerUserId) {
      throw new ForbiddenException('Esta candidatura pertence a outra pessoa.');
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw new BadRequestException(
        'Esta candidatura foi retirada pelo talento.',
      );
    }

    return this.prisma.application.update({
      where: { id },
      data: { status: dto.status },
      select: applicationSelect,
    });
  }

  async withdraw(id: string, dto: WithdrawApplicationDto) {
    await this.assertTalent(dto.talentUserId);
    const application = await this.prisma.application.findUnique({
      where: { id },
      select: { talentUserId: true, status: true },
    });

    if (!application) {
      throw new NotFoundException('Candidatura não encontrada.');
    }
    if (application.talentUserId !== dto.talentUserId) {
      throw new ForbiddenException(
        'Esta candidatura pertence a outro talento.',
      );
    }
    if (application.status !== ApplicationStatus.UNDER_REVIEW) {
      throw new BadRequestException(
        'Somente candidaturas em análise podem ser retiradas.',
      );
    }

    return this.prisma.application.update({
      where: { id },
      data: { status: ApplicationStatus.WITHDRAWN },
      select: applicationSelect,
    });
  }

  private async assertTalent(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    if (user.role !== UserRole.TALENT) {
      throw new ForbiddenException('Esta ação é exclusiva para talentos.');
    }
  }
}

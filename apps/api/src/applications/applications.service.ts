import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

const applicationSelect = {
  id: true,
  message: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  opportunity: { select: { id: true, title: true } },
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
}

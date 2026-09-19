import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { EnableConversationDto } from './dto/enable-conversation.dto';

const conversationSelect = {
  id: true,
  applicationId: true,
  enabledByUserId: true,
  createdAt: true,
  updatedAt: true,
  application: {
    select: {
      id: true,
      status: true,
      talent: { select: { id: true, name: true } },
      opportunity: {
        select: {
          id: true,
          title: true,
          createdByUserId: true,
          organization: { select: { name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.ConversationSelect;

const messageSelect = {
  id: true,
  conversationId: true,
  senderUserId: true,
  body: true,
  readAt: true,
  createdAt: true,
} satisfies Prisma.MessageSelect;

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Habilitar o chat é prerrogativa do organizador dono da vaga. */
  async enable(dto: EnableConversationDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: dto.applicationId },
      select: {
        id: true,
        status: true,
        conversation: { select: { id: true } },
        opportunity: { select: { createdByUserId: true } },
      },
    });

    if (!application) {
      throw new NotFoundException('Candidatura não encontrada.');
    }

    if (application.opportunity.createdByUserId !== dto.organizerUserId) {
      throw new ForbiddenException(
        'Somente o organizador da vaga pode abrir a conversa.',
      );
    }

    if (application.status === 'WITHDRAWN') {
      throw new ConflictException(
        'Esta candidatura foi retirada pelo talento.',
      );
    }

    if (application.conversation) {
      throw new ConflictException('A conversa já está aberta.');
    }

    return this.prisma.conversation.create({
      data: {
        applicationId: dto.applicationId,
        enabledByUserId: dto.organizerUserId,
      },
      select: conversationSelect,
    });
  }

  /** Lista as conversas em que o usuário participa, dos dois lados. */
  async findForUser(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          { application: { talentUserId: userId } },
          { application: { opportunity: { createdByUserId: userId } } },
        ],
      },
      select: {
        ...conversationSelect,
        messages: {
          select: messageSelect,
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: { readAt: null, senderUserId: { not: userId } },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map(({ messages, _count, ...conversation }) => ({
      ...conversation,
      lastMessage: messages[0] ?? null,
      unreadCount: _count.messages,
    }));
  }

  async findOne(id: string, userId: string) {
    const conversation = await this.assertParticipant(id, userId);

    // Abrir a conversa marca como lidas as mensagens do outro participante.
    await this.prisma.message.updateMany({
      where: {
        conversationId: id,
        senderUserId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    const messages = await this.prisma.message.findMany({
      where: { conversationId: id },
      select: messageSelect,
      orderBy: { createdAt: 'asc' },
    });

    return { ...conversation, messages };
  }

  async sendMessage(id: string, dto: CreateMessageDto) {
    await this.assertParticipant(id, dto.senderUserId);

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId: id,
          senderUserId: dto.senderUserId,
          body: dto.body.trim(),
        },
        select: messageSelect,
      }),
      // Mantém a conversa no topo da listagem, que ordena por updatedAt.
      this.prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() },
        select: { id: true },
      }),
    ]);

    return message;
  }

  /**
   * Resumo de nao lidas numa consulta so: o `total` alimenta o badge da barra
   * superior e o `byConversation` evita uma segunda chamada nas telas que
   * mostram o aviso de uma conversa especifica.
   */
  async unreadSummary(userId: string) {
    const grouped = await this.prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        readAt: null,
        senderUserId: { not: userId },
        conversation: {
          OR: [
            { application: { talentUserId: userId } },
            { application: { opportunity: { createdByUserId: userId } } },
          ],
        },
      },
      _count: { _all: true },
    });

    const byConversation: Record<string, number> = {};
    let total = 0;

    for (const row of grouped) {
      byConversation[row.conversationId] = row._count._all;
      total += row._count._all;
    }

    return { total, byConversation };
  }
  /**
   * Participante é o talento da candidatura ou o organizador dono da vaga.
   * Qualquer outro usuário recebe 403, mesmo conhecendo o id da conversa.
   */
  private async assertParticipant(id: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      select: conversationSelect,
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    const isTalent = conversation.application.talent.id === userId;
    const isOrganizer =
      conversation.application.opportunity.createdByUserId === userId;

    if (!isTalent && !isOrganizer) {
      throw new ForbiddenException('Você não participa desta conversa.');
    }

    return conversation;
  }
}

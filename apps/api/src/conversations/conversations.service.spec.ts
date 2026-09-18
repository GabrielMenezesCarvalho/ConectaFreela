import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from './conversations.service';

describe('ConversationsService', () => {
  const findApplication = jest.fn();
  const createConversation = jest.fn();
  const findConversation = jest.fn();
  type UpdateManyArgs = {
    where: {
      conversationId: string;
      senderUserId: { not: string };
      readAt: null;
    };
  };
  let capturedReadArgs: UpdateManyArgs | undefined;
  const updateManyMessages = jest.fn((args: UpdateManyArgs) => {
    capturedReadArgs = args;
    return Promise.resolve({ count: 0 });
  });
  const findManyMessages = jest.fn();
  const createMessage = jest.fn();
  const updateConversation = jest.fn();
  const runTransaction = jest.fn((operations: unknown[]) =>
    Promise.all(operations),
  );

  const prisma = {
    application: { findUnique: findApplication },
    conversation: {
      create: createConversation,
      findUnique: findConversation,
      update: updateConversation,
    },
    message: {
      updateMany: updateManyMessages,
      findMany: findManyMessages,
      create: createMessage,
    },
    $transaction: runTransaction,
  } as unknown as PrismaService;
  const service = new ConversationsService(prisma);

  const enableDto = {
    applicationId: 'application-id',
    organizerUserId: 'organizer-id',
  };

  beforeEach(() => {
    capturedReadArgs = undefined;
    jest.clearAllMocks();
  });

  it('lets the opportunity owner enable the conversation', async () => {
    findApplication.mockResolvedValue({
      id: 'application-id',
      status: 'APPROVED',
      conversation: null,
      opportunity: { createdByUserId: 'organizer-id' },
    });
    createConversation.mockResolvedValue({ id: 'conversation-id' });

    await service.enable(enableDto);

    expect(createConversation).toHaveBeenCalled();
  });

  it('rejects someone who does not own the opportunity', async () => {
    findApplication.mockResolvedValue({
      id: 'application-id',
      status: 'APPROVED',
      conversation: null,
      opportunity: { createdByUserId: 'another-organizer' },
    });

    await expect(service.enable(enableDto)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(createConversation).not.toHaveBeenCalled();
  });

  it('refuses to open a conversation twice', async () => {
    findApplication.mockResolvedValue({
      id: 'application-id',
      status: 'APPROVED',
      conversation: { id: 'existing' },
      opportunity: { createdByUserId: 'organizer-id' },
    });

    await expect(service.enable(enableDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('refuses to open a conversation on a withdrawn application', async () => {
    findApplication.mockResolvedValue({
      id: 'application-id',
      status: 'WITHDRAWN',
      conversation: null,
      opportunity: { createdByUserId: 'organizer-id' },
    });

    await expect(service.enable(enableDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('fails when the application does not exist', async () => {
    findApplication.mockResolvedValue(null);

    await expect(service.enable(enableDto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('blocks a stranger from reading the conversation', async () => {
    findConversation.mockResolvedValue({
      id: 'conversation-id',
      application: {
        talent: { id: 'talent-id' },
        opportunity: { createdByUserId: 'organizer-id' },
      },
    });

    await expect(
      service.findOne('conversation-id', 'stranger-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(findManyMessages).not.toHaveBeenCalled();
  });

  it('marks the other side messages as read when opening', async () => {
    findConversation.mockResolvedValue({
      id: 'conversation-id',
      application: {
        talent: { id: 'talent-id' },
        opportunity: { createdByUserId: 'organizer-id' },
      },
    });
    findManyMessages.mockResolvedValue([]);

    await service.findOne('conversation-id', 'talent-id');

    expect(capturedReadArgs?.where.conversationId).toBe('conversation-id');
    expect(capturedReadArgs?.where.senderUserId).toEqual({ not: 'talent-id' });
    expect(capturedReadArgs?.where.readAt).toBeNull();
  });

  it('blocks a stranger from sending a message', async () => {
    findConversation.mockResolvedValue({
      id: 'conversation-id',
      application: {
        talent: { id: 'talent-id' },
        opportunity: { createdByUserId: 'organizer-id' },
      },
    });

    await expect(
      service.sendMessage('conversation-id', {
        senderUserId: 'stranger-id',
        body: 'oi',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(createMessage).not.toHaveBeenCalled();
  });
});

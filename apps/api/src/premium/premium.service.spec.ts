import { BillingCycle, PaymentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PremiumService } from './premium.service';

describe('PremiumService', () => {
  type UpsertSubscriptionArgs = {
    create: { featuredCredits: number };
    update: { featuredCredits: { increment: number } };
  };
  const organizerUserId = 'a48ed03a-9566-4e2c-ac50-c35c676a412c';
  const expiresAt = '2026-09-12T12:00:00.000Z';
  const findUser = jest.fn();
  const createPayment = jest.fn();
  const findPayment = jest.fn();
  const updateManyPayments = jest.fn();
  const findSubscription = jest.fn();
  const upsertSubscription = jest.fn((args: UpsertSubscriptionArgs) => {
    void args;
    return Promise.resolve({ featuredCredits: 4 });
  });
  const transactionClient = {
    premiumPayment: {
      updateMany: updateManyPayments,
      findUnique: findPayment,
    },
    premiumSubscription: {
      findUnique: findSubscription,
      upsert: upsertSubscription,
    },
  };
  const runTransaction = jest.fn(
    (operation: (transaction: typeof transactionClient) => Promise<unknown>) =>
      operation(transactionClient),
  );
  const prisma = {
    user: { findUnique: findUser },
    premiumPayment: { create: createPayment, findUnique: findPayment },
    premiumSubscription: { findUnique: findSubscription },
    $transaction: runTransaction,
  } as unknown as PrismaService;
  const service = new PremiumService(prisma);

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    process.env.ABACATEPAY_API_KEY = 'abc_dev_test';
    findUser.mockResolvedValue({
      role: UserRole.ORGANIZATION,
      name: 'Organização Teste',
      email: 'contato@example.com',
    });
    createPayment.mockResolvedValue({
      id: 'payment-id',
      gatewayId: 'pix_char_test',
      billingCycle: BillingCycle.MONTHLY,
      amountCents: 3000,
      status: PaymentStatus.PENDING,
      expiresAt: new Date(expiresAt),
      paidAt: null,
      createdAt: new Date(),
    });
  });

  it('creates PIX without an incomplete customer object', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            id: 'pix_char_test',
            amount: 3000,
            status: 'PENDING',
            devMode: true,
            brCode: 'pix-copy-and-paste',
            brCodeBase64: 'data:image/png;base64,test',
            expiresAt,
          },
          success: true,
          error: null,
        }),
    } as Response);

    await service.createPixPayment({ organizerUserId });

    const request = fetchMock.mock.calls[0][1];
    if (typeof request?.body !== 'string') {
      throw new Error('Expected the gateway request body to be JSON.');
    }
    const payload = JSON.parse(request.body) as {
      method: string;
      data: Record<string, unknown>;
    };

    expect(payload.method).toBe('PIX');
    expect(payload.data.amount).toBe(3000);
    expect(payload.data).not.toHaveProperty('customer');
    expect(payload.data.metadata).toEqual({
      organizerUserId,
      billingCycle: BillingCycle.MONTHLY,
      product: 'conectafreela-premium',
    });
  });

  it('adds three credits exactly when a pending payment becomes paid', async () => {
    const pendingPayment = {
      id: 'payment-id',
      userId: organizerUserId,
      gatewayId: 'pix_char_test',
      billingCycle: BillingCycle.MONTHLY,
      amountCents: 3000,
      status: PaymentStatus.PENDING,
      expiresAt: new Date(expiresAt),
      paidAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    findPayment
      .mockResolvedValueOnce(pendingPayment)
      .mockResolvedValueOnce({ ...pendingPayment, status: PaymentStatus.PAID });
    updateManyPayments.mockResolvedValue({ count: 1 });
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: { status: 'PAID' },
          success: true,
          error: null,
        }),
    } as Response);

    await service.checkPayment('payment-id', organizerUserId);

    const upsertArgs = upsertSubscription.mock.calls[0][0];
    expect(upsertArgs.create.featuredCredits).toBe(3);
    expect(upsertArgs.update.featuredCredits.increment).toBe(3);
  });

  it('does not add credits twice when another request already claimed the payment', async () => {
    const pendingPayment = {
      id: 'payment-id',
      userId: organizerUserId,
      gatewayId: 'pix_char_test',
      billingCycle: BillingCycle.MONTHLY,
      amountCents: 3000,
      status: PaymentStatus.PENDING,
      expiresAt: new Date(expiresAt),
      paidAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    findPayment
      .mockResolvedValueOnce(pendingPayment)
      .mockResolvedValueOnce({ ...pendingPayment, status: PaymentStatus.PAID });
    updateManyPayments.mockResolvedValue({ count: 0 });
    findSubscription.mockResolvedValue({ featuredCredits: 4 });
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: { status: 'PAID' },
          success: true,
          error: null,
        }),
    } as Response);

    await service.checkPayment('payment-id', organizerUserId);

    expect(upsertSubscription).not.toHaveBeenCalled();
  });
});

import {
  BadGatewayException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  BillingCycle,
  PaymentStatus,
  Prisma,
  SubscriptionStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePixPaymentDto } from './dto/create-pix-payment.dto';

const ABACATEPAY_URL = 'https://api.abacatepay.com/v2';
const PREMIUM_MONTHLY_PRICE_CENTS = 3000;

const subscriptionSelect = {
  id: true,
  status: true,
  billingCycle: true,
  priceCents: true,
  paymentMethodLast4: true,
  startedAt: true,
  nextBillingAt: true,
} satisfies Prisma.PremiumSubscriptionSelect;

const paymentSelect = {
  id: true,
  gatewayId: true,
  billingCycle: true,
  amountCents: true,
  status: true,
  expiresAt: true,
  paidAt: true,
  createdAt: true,
} satisfies Prisma.PremiumPaymentSelect;

type GatewayPaymentStatus =
  'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';

type GatewayPayment = {
  id: string;
  amount: number;
  status: GatewayPaymentStatus;
  devMode?: boolean;
  brCode?: string;
  brCodeBase64?: string;
  expiresAt: string;
};

type GatewayEnvelope<T> = {
  data?: T;
  success?: boolean | { message?: string };
  error?: string | null;
};

@Injectable()
export class PremiumService {
  constructor(private readonly prisma: PrismaService) {}

  async findForOrganizer(userId: string) {
    await this.assertOrganizer(userId);
    return this.prisma.premiumSubscription.findUnique({
      where: { userId },
      select: subscriptionSelect,
    });
  }

  async createPixPayment(dto: CreatePixPaymentDto) {
    await this.assertOrganizer(dto.organizerUserId);
    const billingCycle = BillingCycle.MONTHLY;
    const amountCents = PREMIUM_MONTHLY_PRICE_CENTS;
    const externalId = `premium-${dto.organizerUserId}-${Date.now()}`;

    const gatewayPayment = await this.abacateRequest<GatewayPayment>(
      '/transparents/create',
      {
        method: 'POST',
        body: JSON.stringify({
          method: 'PIX',
          data: {
            amount: amountCents,
            expiresIn: 1800,
            description: 'ConectaFreela Premium - Mensal',
            externalId,
            metadata: {
              organizerUserId: dto.organizerUserId,
              billingCycle,
              product: 'conectafreela-premium',
            },
          },
        }),
      },
    );

    const payment = await this.prisma.premiumPayment.create({
      data: {
        userId: dto.organizerUserId,
        gatewayId: gatewayPayment.id,
        billingCycle,
        amountCents,
        status: this.toPaymentStatus(gatewayPayment.status),
        expiresAt: new Date(gatewayPayment.expiresAt),
      },
      select: paymentSelect,
    });

    return {
      ...payment,
      brCode: gatewayPayment.brCode,
      brCodeBase64: gatewayPayment.brCodeBase64,
      devMode: Boolean(gatewayPayment.devMode),
    };
  }

  async checkPayment(paymentId: string, organizerUserId: string) {
    const payment = await this.findOwnedPayment(paymentId, organizerUserId);
    if (payment.status === PaymentStatus.PAID) {
      return this.paymentResult(payment);
    }

    const gatewayPayment = await this.abacateRequest<GatewayPayment>(
      `/transparents/check?id=${encodeURIComponent(payment.gatewayId)}`,
    );
    return this.syncPayment(payment, gatewayPayment.status);
  }

  async simulatePayment(paymentId: string, organizerUserId: string) {
    const payment = await this.findOwnedPayment(paymentId, organizerUserId);
    if (payment.status !== PaymentStatus.PAID) {
      await this.abacateRequest<GatewayPayment>(
        `/transparents/simulate-payment?id=${encodeURIComponent(payment.gatewayId)}`,
        { method: 'POST', body: JSON.stringify({ metadata: {} }) },
      );
    }
    return this.checkPayment(paymentId, organizerUserId);
  }

  private async syncPayment(
    payment: Prisma.PremiumPaymentGetPayload<object>,
    gatewayStatus: GatewayPaymentStatus,
  ) {
    const status = this.toPaymentStatus(gatewayStatus);
    if (status !== PaymentStatus.PAID) {
      const updated = await this.prisma.premiumPayment.update({
        where: { id: payment.id },
        data: { status },
        select: paymentSelect,
      });
      return { payment: updated, subscription: null };
    }

    const nextBillingAt = new Date();
    nextBillingAt.setMonth(
      nextBillingAt.getMonth() +
        (payment.billingCycle === BillingCycle.YEARLY ? 12 : 1),
    );

    const [updatedPayment, subscription] = await this.prisma.$transaction([
      this.prisma.premiumPayment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.PAID, paidAt: new Date() },
        select: paymentSelect,
      }),
      this.prisma.premiumSubscription.upsert({
        where: { userId: payment.userId },
        create: {
          userId: payment.userId,
          billingCycle: payment.billingCycle,
          priceCents: payment.amountCents,
          paymentMethodLast4: 'PIX',
          nextBillingAt,
        },
        update: {
          status: SubscriptionStatus.ACTIVE,
          billingCycle: payment.billingCycle,
          priceCents: payment.amountCents,
          paymentMethodLast4: 'PIX',
          startedAt: new Date(),
          nextBillingAt,
        },
        select: subscriptionSelect,
      }),
    ]);

    return { payment: updatedPayment, subscription };
  }

  private async paymentResult(
    payment: Prisma.PremiumPaymentGetPayload<object>,
  ) {
    const subscription = await this.prisma.premiumSubscription.findUnique({
      where: { userId: payment.userId },
      select: subscriptionSelect,
    });
    return { payment, subscription };
  }

  private async findOwnedPayment(paymentId: string, organizerUserId: string) {
    await this.assertOrganizer(organizerUserId);
    const payment = await this.prisma.premiumPayment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Pagamento não encontrado.');
    if (payment.userId !== organizerUserId) {
      throw new ForbiddenException('Este pagamento pertence a outro usuário.');
    }
    return payment;
  }

  private async assertOrganizer(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, name: true, email: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    if (user.role !== UserRole.ORGANIZATION) {
      throw new ForbiddenException('O Premium é exclusivo para organizadores.');
    }
    return user;
  }

  private toPaymentStatus(status: GatewayPaymentStatus): PaymentStatus {
    if (status === 'PAID') return PaymentStatus.PAID;
    if (status === 'EXPIRED') return PaymentStatus.EXPIRED;
    if (status === 'CANCELLED') return PaymentStatus.CANCELLED;
    if (status === 'REFUNDED') return PaymentStatus.REFUNDED;
    return PaymentStatus.PENDING;
  }

  private async abacateRequest<T>(path: string, init: RequestInit = {}) {
    const apiKey = process.env.ABACATEPAY_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'A integração de pagamento ainda não foi configurada.',
      );
    }

    try {
      const response = await fetch(`${ABACATEPAY_URL}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...init.headers,
        },
        signal: AbortSignal.timeout(12_000),
      });
      const body = (await response.json()) as GatewayEnvelope<T>;
      if (!response.ok || !body.data) {
        throw new BadGatewayException(
          body.error || 'A AbacatePay recusou a operação.',
        );
      }
      return body.data;
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      throw new BadGatewayException(
        'Não foi possível comunicar com a AbacatePay.',
      );
    }
  }
}

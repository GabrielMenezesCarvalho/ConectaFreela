import { ForbiddenException, Injectable } from '@nestjs/common';
import { SubscriptionStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const PROFITABILITY_TARGET_SUBSCRIPTIONS = 12;
const MONTHLY_PRICE_CENTS = 3000;
const PAYMENT_FEE_CENTS = 80;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async metrics(adminUserId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Acesso exclusivo para administradores.');
    }

    const [
      totalUsers,
      talents,
      organizers,
      organizersWithOpportunity,
      activeSubscriptions,
      totalSubscriptions,
      paidTransactions,
      opportunities,
      featuredOpportunities,
      applications,
      approvedApplications,
      subscriptions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.TALENT } }),
      this.prisma.user.count({ where: { role: UserRole.ORGANIZATION } }),
      this.prisma.user.count({
        where: { role: UserRole.ORGANIZATION, opportunities: { some: {} } },
      }),
      this.prisma.premiumSubscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.prisma.premiumSubscription.count(),
      this.prisma.premiumPayment.count({ where: { status: 'PAID' } }),
      this.prisma.opportunity.count(),
      this.prisma.opportunity.count({ where: { isFeatured: true } }),
      this.prisma.application.count(),
      this.prisma.application.count({ where: { status: 'APPROVED' } }),
      this.prisma.premiumSubscription.findMany({
        where: { status: SubscriptionStatus.ACTIVE },
        select: { priceCents: true, billingCycle: true },
      }),
    ]);

    const monthlyRecurringRevenueCents = subscriptions.reduce(
      (sum, item) =>
        sum +
        (item.billingCycle === 'YEARLY'
          ? Math.round(item.priceCents / 12)
          : item.priceCents),
      0,
    );
    const monthlyPaymentFeesCents = activeSubscriptions * PAYMENT_FEE_CENTS;
    const netMonthlyRevenueCents =
      monthlyRecurringRevenueCents - monthlyPaymentFeesCents;
    const percent = (value: number, total: number) =>
      total ? Math.round((value / total) * 1000) / 10 : 0;

    return {
      totals: { totalUsers, talents, organizers, opportunities, applications },
      monetization: {
        activeSubscriptions,
        totalSubscriptions,
        paidTransactions,
        monthlyRecurringRevenueCents,
        conversionRate: percent(activeSubscriptions, organizers),
        retentionRate: percent(activeSubscriptions, totalSubscriptions),
        pricing: {
          monthlyPriceCents: MONTHLY_PRICE_CENTS,
          paymentFeeCents: PAYMENT_FEE_CENTS,
        },
        profitabilityTarget: {
          subscriptions: PROFITABILITY_TARGET_SUBSCRIPTIONS,
          remainingSubscriptions: Math.max(
            PROFITABILITY_TARGET_SUBSCRIPTIONS - activeSubscriptions,
            0,
          ),
          progress: Math.min(
            percent(activeSubscriptions, PROFITABILITY_TARGET_SUBSCRIPTIONS),
            100,
          ),
          grossRevenueCents:
            PROFITABILITY_TARGET_SUBSCRIPTIONS * MONTHLY_PRICE_CENTS,
          paymentFeesCents:
            PROFITABILITY_TARGET_SUBSCRIPTIONS * PAYMENT_FEE_CENTS,
          netRevenueCents:
            PROFITABILITY_TARGET_SUBSCRIPTIONS *
            (MONTHLY_PRICE_CENTS - PAYMENT_FEE_CENTS),
        },
        monthlyPaymentFeesCents,
        netMonthlyRevenueCents,
      },
      value: {
        activationRate: percent(organizersWithOpportunity, organizers),
        approvedApplicationRate: percent(approvedApplications, applications),
        featuredOpportunities,
        featureAdoptionRate: percent(featuredOpportunities, opportunities),
      },
    };
  }
}

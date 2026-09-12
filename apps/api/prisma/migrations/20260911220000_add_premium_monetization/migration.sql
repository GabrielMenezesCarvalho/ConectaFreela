ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ADMIN';

ALTER TABLE "opportunities"
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "featuredAt" TIMESTAMP(3);

CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED', 'REFUNDED', 'FAILED');

CREATE TABLE "premium_subscriptions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "billingCycle" "BillingCycle" NOT NULL,
  "priceCents" INTEGER NOT NULL,
  "paymentMethodLast4" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "nextBillingAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "premium_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "premium_subscriptions_userId_key" ON "premium_subscriptions"("userId");
CREATE INDEX "premium_subscriptions_status_startedAt_idx" ON "premium_subscriptions"("status", "startedAt");

ALTER TABLE "premium_subscriptions" ADD CONSTRAINT "premium_subscriptions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "premium_payments" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "gatewayId" TEXT NOT NULL,
  "billingCycle" "BillingCycle" NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "premium_payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "premium_payments_gatewayId_key" ON "premium_payments"("gatewayId");
CREATE INDEX "premium_payments_userId_status_idx" ON "premium_payments"("userId", "status");
CREATE INDEX "premium_payments_status_createdAt_idx" ON "premium_payments"("status", "createdAt");

ALTER TABLE "premium_payments" ADD CONSTRAINT "premium_payments_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

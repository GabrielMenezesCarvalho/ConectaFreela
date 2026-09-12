ALTER TABLE "premium_subscriptions"
ADD COLUMN "featuredCredits" INTEGER NOT NULL DEFAULT 0;

UPDATE "premium_subscriptions"
SET "featuredCredits" = GREATEST(
  0,
  3 - (
    SELECT COUNT(*)::INTEGER
    FROM "opportunities"
    WHERE "opportunities"."createdByUserId" = "premium_subscriptions"."userId"
      AND "opportunities"."isFeatured" = TRUE
  )
)
WHERE "status" = 'ACTIVE';

ALTER TABLE "premium_subscriptions"
ADD CONSTRAINT "premium_subscriptions_featuredCredits_nonnegative"
CHECK ("featuredCredits" >= 0);

/**
 * Integration tests for subscription system
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import {
  SubscriptionService,
  PlanService,
  SubscriptionTier,
  BillingInterval,
} from '@/src/lib/subscriptions';

const prisma = new PrismaClient();

describe('Subscription System Integration Tests', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: `test-subscription-${Date.now()}@example.com`,
        name: 'Test Subscription User',
        password: 'hashed_password',
      },
    });
    testUserId = testUser.id;

    // Seed plans
    await PlanService.initializePlans();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.subscription.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up subscriptions before each test
    await prisma.subscription.deleteMany({
      where: { userId: testUserId },
    });
  });

  describe('PlanService', () => {
    it('should list all available plans', async () => {
      const plans = await PlanService.listPlans();

      expect(plans).toHaveLength(4);
      expect(plans.map((p) => p.tier)).toEqual([
        SubscriptionTier.FREE,
        SubscriptionTier.BASIC,
        SubscriptionTier.PRO,
        SubscriptionTier.ENTERPRISE,
      ]);
    });

    it('should get plan by tier', async () => {
      const plan = await PlanService.getPlanByTier(SubscriptionTier.PRO);

      expect(plan).not.toBeNull();
      expect(plan?.tier).toBe(SubscriptionTier.PRO);
      expect(plan?.name).toBe('프로');
      expect(plan?.monthlyPrice).toBe(29900);
      expect(plan?.yearlyPrice).toBe(299000);
    });

    it('should calculate proration correctly', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15); // 15 days remaining

      const proration = await PlanService.calculateProration(
        SubscriptionTier.BASIC,
        SubscriptionTier.PRO,
        futureDate,
        BillingInterval.MONTHLY
      );

      expect(proration).toHaveProperty('immediateCharge');
      expect(proration).toHaveProperty('nextBillingAmount');
      expect(proration).toHaveProperty('nextBillingDate');
      expect(proration).toHaveProperty('creditsApplied');
      expect(proration.nextBillingAmount).toBe(29900);
    });
  });

  describe('SubscriptionService', () => {
    it('should create a subscription', async () => {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const subscription = await SubscriptionService.createSubscription({
        userId: testUserId,
        tier: SubscriptionTier.BASIC,
        interval: BillingInterval.MONTHLY,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: 'sub_test_123',
        stripeCustomerId: 'cus_test_123',
        stripePriceId: 'price_test_123',
      });

      expect(subscription).toHaveProperty('id');
      expect(subscription.userId).toBe(testUserId);
      expect(subscription.tier).toBe(SubscriptionTier.BASIC);
      expect(subscription.status).toBe('ACTIVE');

      // Verify user tier was updated
      const user = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(user?.subscriptionTier).toBe(SubscriptionTier.BASIC);
    });

    it('should get user subscription', async () => {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await SubscriptionService.createSubscription({
        userId: testUserId,
        tier: SubscriptionTier.PRO,
        interval: BillingInterval.YEARLY,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: 'sub_test_456',
        stripeCustomerId: 'cus_test_456',
        stripePriceId: 'price_test_456',
      });

      const subscription = await SubscriptionService.getSubscription(testUserId);

      expect(subscription).not.toBeNull();
      expect(subscription?.tier).toBe(SubscriptionTier.PRO);
      expect(subscription?.interval).toBe(BillingInterval.YEARLY);
    });

    it('should update subscription', async () => {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const subscription = await SubscriptionService.createSubscription({
        userId: testUserId,
        tier: SubscriptionTier.BASIC,
        interval: BillingInterval.MONTHLY,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: 'sub_test_789',
        stripeCustomerId: 'cus_test_789',
        stripePriceId: 'price_test_789',
      });

      const updated = await SubscriptionService.updateSubscription(subscription.id, {
        tier: SubscriptionTier.PRO,
      });

      expect(updated.tier).toBe(SubscriptionTier.PRO);

      // Verify user tier was updated
      const user = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(user?.subscriptionTier).toBe(SubscriptionTier.PRO);
    });

    it('should cancel subscription at period end', async () => {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const subscription = await SubscriptionService.createSubscription({
        userId: testUserId,
        tier: SubscriptionTier.BASIC,
        interval: BillingInterval.MONTHLY,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: 'sub_test_cancel_1',
        stripeCustomerId: 'cus_test_cancel_1',
        stripePriceId: 'price_test_cancel_1',
      });

      const cancelled = await SubscriptionService.cancelSubscription(
        subscription.id,
        false
      );

      expect(cancelled.cancelAtPeriodEnd).toBe(true);
      expect(cancelled.status).toBe('ACTIVE'); // Still active until period end

      // User tier should NOT change yet
      const user = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(user?.subscriptionTier).toBe(SubscriptionTier.BASIC);
    });

    it('should cancel subscription immediately', async () => {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const subscription = await SubscriptionService.createSubscription({
        userId: testUserId,
        tier: SubscriptionTier.PRO,
        interval: BillingInterval.MONTHLY,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: 'sub_test_cancel_2',
        stripeCustomerId: 'cus_test_cancel_2',
        stripePriceId: 'price_test_cancel_2',
      });

      const cancelled = await SubscriptionService.cancelSubscription(
        subscription.id,
        true
      );

      expect(cancelled.status).toBe('CANCELLED');

      // User tier should downgrade to FREE
      const user = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(user?.subscriptionTier).toBe(SubscriptionTier.FREE);
    });

    it('should reactivate subscription', async () => {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const subscription = await SubscriptionService.createSubscription({
        userId: testUserId,
        tier: SubscriptionTier.BASIC,
        interval: BillingInterval.MONTHLY,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: 'sub_test_reactivate',
        stripeCustomerId: 'cus_test_reactivate',
        stripePriceId: 'price_test_reactivate',
      });

      // Cancel
      await SubscriptionService.cancelSubscription(subscription.id, false);

      // Reactivate
      const reactivated = await SubscriptionService.reactivateSubscription(
        subscription.id
      );

      expect(reactivated.cancelAtPeriodEnd).toBe(false);
      expect(reactivated.status).toBe('ACTIVE');
    });

    it('should check if user has active subscription', async () => {
      const hasActiveBefore = await SubscriptionService.hasActiveSubscription(
        testUserId
      );
      expect(hasActiveBefore).toBe(false);

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await SubscriptionService.createSubscription({
        userId: testUserId,
        tier: SubscriptionTier.BASIC,
        interval: BillingInterval.MONTHLY,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: 'sub_test_check',
        stripeCustomerId: 'cus_test_check',
        stripePriceId: 'price_test_check',
      });

      const hasActiveAfter = await SubscriptionService.hasActiveSubscription(
        testUserId
      );
      expect(hasActiveAfter).toBe(true);
    });

    it('should get user tier', async () => {
      const tierBefore = await SubscriptionService.getUserTier(testUserId);
      expect(tierBefore).toBe(SubscriptionTier.FREE);

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await SubscriptionService.createSubscription({
        userId: testUserId,
        tier: SubscriptionTier.ENTERPRISE,
        interval: BillingInterval.YEARLY,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: 'sub_test_tier',
        stripeCustomerId: 'cus_test_tier',
        stripePriceId: 'price_test_tier',
      });

      const tierAfter = await SubscriptionService.getUserTier(testUserId);
      expect(tierAfter).toBe(SubscriptionTier.ENTERPRISE);
    });
  });

  describe('Subscription Features', () => {
    it('should respect plan limits', async () => {
      const plans = await PlanService.listPlans();

      const freePlan = plans.find((p) => p.tier === SubscriptionTier.FREE);
      expect(freePlan?.featureDetails.maxProducts).toBe(3);
      expect(freePlan?.featureDetails.apiAccess).toBe(false);

      const proPlan = plans.find((p) => p.tier === SubscriptionTier.PRO);
      expect(proPlan?.featureDetails.maxProducts).toBe('unlimited');
      expect(proPlan?.featureDetails.apiAccess).toBe(true);
      expect(proPlan?.featureDetails.verificationDiscount).toBe(20);
    });
  });
});

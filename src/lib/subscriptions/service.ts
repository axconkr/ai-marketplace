/**
 * Subscription service layer
 */

import { prisma } from '@/lib/db';
import {
  SubscriptionTier,
  SubscriptionStatus,
  BillingInterval,
  PLAN_PRICING,
  type SubscriptionDetails,
  type ProrationPreview,
  type PlanPricing,
} from './types';

export class SubscriptionService {
  /**
   * Get user's active subscription
   */
  static async getSubscription(userId: string): Promise<SubscriptionDetails | null> {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return subscription;
  }

  /**
   * Create a new subscription record (called by webhook)
   */
  static async createSubscription(data: {
    userId: string;
    tier: string;
    interval: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    stripePriceId: string;
  }) {
    const subscription = await prisma.subscription.create({
      data: {
        userId: data.userId,
        tier: data.tier,
        status: SubscriptionStatus.ACTIVE,
        interval: data.interval,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
        stripePriceId: data.stripePriceId,
      },
    });

    // Update user's subscription tier
    await prisma.user.update({
      where: { id: data.userId },
      data: {
        subscriptionTier: data.tier,
        stripeCustomerId: data.stripeCustomerId,
      },
    });

    return subscription;
  }

  /**
   * Update subscription (called by webhook or user action)
   */
  static async updateSubscription(
    subscriptionId: string,
    data: Partial<{
      tier: string;
      status: string;
      interval: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
      stripePriceId: string;
    }>
  ) {
    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data,
    });

    // If tier changed, update user's tier
    if (data.tier) {
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { subscriptionTier: data.tier },
      });
    }

    return subscription;
  }

  /**
   * Update subscription by Stripe subscription ID
   */
  static async updateSubscriptionByStripeId(
    stripeSubscriptionId: string,
    data: Partial<{
      tier: string;
      status: string;
      interval: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
      stripePriceId: string;
    }>
  ) {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return this.updateSubscription(subscription.id, data);
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false
  ) {
    const updateData: any = {
      cancelAtPeriodEnd: !immediately,
    };

    if (immediately) {
      updateData.status = SubscriptionStatus.CANCELLED;
    }

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
    });

    // If cancelled immediately, downgrade user to FREE
    if (immediately) {
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { subscriptionTier: SubscriptionTier.FREE },
      });
    }

    return subscription;
  }

  /**
   * Reactivate a cancelled subscription
   */
  static async reactivateSubscription(subscriptionId: string) {
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: false,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }

  /**
   * Get subscription by Stripe subscription ID
   */
  static async getSubscriptionByStripeId(stripeSubscriptionId: string) {
    return prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
      include: { user: true },
    });
  }

  /**
   * Check if user has active subscription
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    return subscription !== null;
  }

  /**
   * Get user's subscription tier
   */
  static async getUserTier(userId: string): Promise<SubscriptionTier> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    return (user?.subscriptionTier as SubscriptionTier) || SubscriptionTier.FREE;
  }
}

export class PlanService {
  /**
   * List all available subscription plans
   */
  static async listPlans(): Promise<PlanPricing[]> {
    // Get plans from database
    const dbPlans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    // Merge with static pricing data
    if (dbPlans.length === 0) {
      return PLAN_PRICING;
    }

    return dbPlans.map((dbPlan) => {
      const staticPlan = PLAN_PRICING.find((p) => p.tier === dbPlan.tier);
      return {
        tier: dbPlan.tier as SubscriptionTier,
        name: dbPlan.name,
        description: dbPlan.description || '',
        monthlyPrice: dbPlan.monthlyPrice,
        yearlyPrice: dbPlan.yearlyPrice,
        features: Array.isArray(dbPlan.features) ? dbPlan.features as string[] : [],
        featureDetails: staticPlan?.featureDetails || ({} as any),
        stripePriceIdMonthly: dbPlan.stripePriceIdMonthly || undefined,
        stripePriceIdYearly: dbPlan.stripePriceIdYearly || undefined,
        isActive: dbPlan.isActive,
        sortOrder: dbPlan.sortOrder,
      };
    });
  }

  /**
   * Get plan by tier
   */
  static async getPlanByTier(tier: SubscriptionTier): Promise<PlanPricing | null> {
    const plans = await this.listPlans();
    return plans.find((p) => p.tier === tier) || null;
  }

  /**
   * Get Stripe price ID for a plan
   */
  static async getStripePriceId(
    tier: SubscriptionTier,
    interval: BillingInterval
  ): Promise<string | null> {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { tier },
    });

    if (!plan) return null;

    return interval === BillingInterval.MONTHLY
      ? plan.stripePriceIdMonthly
      : plan.stripePriceIdYearly;
  }

  /**
   * Calculate proration for plan change
   */
  static async calculateProration(
    currentTier: SubscriptionTier,
    newTier: SubscriptionTier,
    currentPeriodEnd: Date,
    interval: BillingInterval
  ): Promise<ProrationPreview> {
    const currentPlan = await this.getPlanByTier(currentTier);
    const newPlan = await this.getPlanByTier(newTier);

    if (!currentPlan || !newPlan) {
      throw new Error('Plan not found');
    }

    const currentPrice =
      interval === BillingInterval.MONTHLY
        ? currentPlan.monthlyPrice
        : currentPlan.yearlyPrice;
    const newPrice =
      interval === BillingInterval.MONTHLY
        ? newPlan.monthlyPrice
        : newPlan.yearlyPrice;

    // Calculate remaining days in current period
    const now = new Date();
    const totalDays =
      interval === BillingInterval.MONTHLY ? 30 : 365;
    const remainingDays = Math.ceil(
      (currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate credits from current plan
    const creditsApplied = Math.floor(
      (currentPrice * remainingDays) / totalDays
    );

    // Calculate immediate charge (can be negative for downgrades)
    const proratedNewPrice = Math.floor(
      (newPrice * remainingDays) / totalDays
    );
    const immediateCharge = Math.max(0, proratedNewPrice - creditsApplied);

    return {
      immediateCharge,
      nextBillingAmount: newPrice,
      nextBillingDate: currentPeriodEnd,
      creditsApplied,
    };
  }

  /**
   * Initialize plans in database from static data
   */
  static async initializePlans() {
    for (const plan of PLAN_PRICING) {
      await prisma.subscriptionPlan.upsert({
        where: { tier: plan.tier },
        update: {
          name: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          features: plan.features,
          isActive: plan.isActive,
          sortOrder: plan.sortOrder,
        },
        create: {
          tier: plan.tier,
          name: plan.name,
          description: plan.description,
          features: plan.features,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          isActive: plan.isActive,
          sortOrder: plan.sortOrder,
        },
      });
    }
  }
}

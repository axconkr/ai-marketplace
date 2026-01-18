/**
 * Stripe integration for subscriptions
 */

import Stripe from 'stripe';
import { SubscriptionService, PlanService } from './service';
import {
  SubscriptionTier,
  BillingInterval,
  SubscriptionStatus,
  type CreateSubscriptionInput,
} from './types';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export class StripeSubscriptionService {
  /**
   * Create Stripe Checkout Session for subscription
   */
  static async createCheckoutSession(
    userId: string,
    userEmail: string,
    input: CreateSubscriptionInput
  ) {
    const { tier, interval, successUrl, cancelUrl } = input;

    // Get Stripe price ID
    const priceId = await PlanService.getStripePriceId(tier, interval);
    if (!priceId) {
      throw new Error(`No Stripe price ID found for ${tier} ${interval}`);
    }

    // Create or get Stripe customer
    const customer = await this.getOrCreateCustomer(userId, userEmail);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId,
        tier,
        interval,
      },
      subscription_data: {
        metadata: {
          userId,
          tier,
          interval,
        },
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Create Stripe Customer Portal session
   */
  static async createPortalSession(userId: string, returnUrl?: string) {
    // Get user's Stripe customer ID
    const subscription = await SubscriptionService.getSubscription(userId);
    if (!subscription?.stripeCustomerId) {
      throw new Error('No active subscription found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
    });

    return {
      url: session.url,
    };
  }

  /**
   * Update subscription (upgrade/downgrade)
   */
  static async updateSubscription(
    subscriptionId: string,
    newTier: SubscriptionTier,
    newInterval: BillingInterval
  ) {
    // Get current subscription from database
    const dbSubscription = await SubscriptionService.getSubscription(subscriptionId);
    if (!dbSubscription?.stripeSubscriptionId) {
      throw new Error('Subscription not found');
    }

    // Get Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      dbSubscription.stripeSubscriptionId
    );

    // Get new price ID
    const newPriceId = await PlanService.getStripePriceId(newTier, newInterval);
    if (!newPriceId) {
      throw new Error(`No Stripe price ID found for ${newTier} ${newInterval}`);
    }

    // Update subscription
    const updatedSubscription = await stripe.subscriptions.update(
      dbSubscription.stripeSubscriptionId,
      {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
        metadata: {
          tier: newTier,
          interval: newInterval,
        },
      }
    );

    // Update database
    await SubscriptionService.updateSubscriptionByStripeId(
      dbSubscription.stripeSubscriptionId,
      {
        tier: newTier,
        interval: newInterval,
        stripePriceId: newPriceId,
      }
    );

    return updatedSubscription;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string, immediately: boolean = false) {
    const dbSubscription = await SubscriptionService.getSubscription(subscriptionId);
    if (!dbSubscription?.stripeSubscriptionId) {
      throw new Error('Subscription not found');
    }

    if (immediately) {
      // Cancel immediately
      const canceledSubscription = await stripe.subscriptions.cancel(
        dbSubscription.stripeSubscriptionId
      );

      await SubscriptionService.cancelSubscription(subscriptionId, true);

      return canceledSubscription;
    } else {
      // Cancel at period end
      const updatedSubscription = await stripe.subscriptions.update(
        dbSubscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      await SubscriptionService.cancelSubscription(subscriptionId, false);

      return updatedSubscription;
    }
  }

  /**
   * Reactivate subscription (undo cancellation)
   */
  static async reactivateSubscription(subscriptionId: string) {
    const dbSubscription = await SubscriptionService.getSubscription(subscriptionId);
    if (!dbSubscription?.stripeSubscriptionId) {
      throw new Error('Subscription not found');
    }

    const updatedSubscription = await stripe.subscriptions.update(
      dbSubscription.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
      }
    );

    await SubscriptionService.reactivateSubscription(subscriptionId);

    return updatedSubscription;
  }

  /**
   * Get or create Stripe customer
   */
  private static async getOrCreateCustomer(userId: string, email: string) {
    // Check if user already has a Stripe customer
    const { prisma } = await import('@/lib/db');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (user?.stripeCustomerId) {
      return stripe.customers.retrieve(user.stripeCustomerId) as Promise<Stripe.Customer>;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });

    // Save customer ID to user
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer;
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'customer.subscription.created':
        return this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);

      case 'customer.subscription.updated':
        return this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);

      case 'customer.subscription.deleted':
        return this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);

      case 'invoice.payment_succeeded':
        return this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);

      case 'invoice.payment_failed':
        return this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle subscription created event
   */
  private static async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const { userId, tier, interval } = subscription.metadata;

    if (!userId || !tier || !interval) {
      console.error('Missing metadata in subscription:', subscription.id);
      return;
    }

    await SubscriptionService.createSubscription({
      userId,
      tier,
      interval,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
    });

    console.log(`Subscription created for user ${userId}`);
  }

  /**
   * Handle subscription updated event
   */
  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const status = this.mapStripeStatus(subscription.status);

    await SubscriptionService.updateSubscriptionByStripeId(subscription.id, {
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    console.log(`Subscription updated: ${subscription.id}`);
  }

  /**
   * Handle subscription deleted event
   */
  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await SubscriptionService.updateSubscriptionByStripeId(subscription.id, {
      status: SubscriptionStatus.CANCELLED,
    });

    console.log(`Subscription deleted: ${subscription.id}`);
  }

  /**
   * Handle invoice payment succeeded
   */
  private static async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;

    // Payment succeeded, subscription is active
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

    await SubscriptionService.updateSubscriptionByStripeId(subscription.id, {
      status: SubscriptionStatus.ACTIVE,
    });

    console.log(`Invoice paid for subscription: ${subscription.id}`);
  }

  /**
   * Handle invoice payment failed
   */
  private static async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;

    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

    await SubscriptionService.updateSubscriptionByStripeId(subscription.id, {
      status: SubscriptionStatus.PAST_DUE,
    });

    // Send notification to user
    const dbSubscription = await SubscriptionService.getSubscriptionByStripeId(subscription.id);
    if (dbSubscription) {
      const { NotificationService } = await import('../notifications');
      await NotificationService.sendPaymentFailedNotification(
        dbSubscription.userId,
        invoice.amount_due / 100
      );
    }

    console.log(`Payment failed for subscription: ${subscription.id}`);
  }

  /**
   * Map Stripe subscription status to our status
   */
  private static mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
    const statusMap: Record<Stripe.Subscription.Status, string> = {
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.PAST_DUE,
      canceled: SubscriptionStatus.CANCELLED,
      incomplete: SubscriptionStatus.PAUSED,
      incomplete_expired: SubscriptionStatus.CANCELLED,
      trialing: SubscriptionStatus.TRIALING,
      unpaid: SubscriptionStatus.PAST_DUE,
      paused: SubscriptionStatus.PAUSED,
    };

    return statusMap[stripeStatus] || SubscriptionStatus.PAUSED;
  }

  /**
   * Sync subscription status from Stripe
   */
  static async syncSubscriptionStatus(stripeSubscriptionId: string) {
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const status = this.mapStripeStatus(subscription.status);

    await SubscriptionService.updateSubscriptionByStripeId(stripeSubscriptionId, {
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    return subscription;
  }
}

export { stripe };

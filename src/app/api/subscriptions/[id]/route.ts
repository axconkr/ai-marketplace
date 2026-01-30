/**
 * Subscription detail API endpoints
 * GET /api/subscriptions/[id] - Get subscription details
 * PUT /api/subscriptions/[id] - Update subscription
 * DELETE /api/subscriptions/[id] - Cancel subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { optionalAuth } from '@/src/lib/auth';
import {
  SubscriptionService,
  StripeSubscriptionService,
  UpdateSubscriptionSchema,
  CancelSubscriptionSchema,
} from '@/src/lib/subscriptions';

/**
 * GET /api/subscriptions/[id] - Get subscription details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await optionalAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await SubscriptionService.getSubscription(user.userId);

    if (!subscription || subscription.id !== params.id) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscription',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/subscriptions/[id] - Update subscription (upgrade/downgrade)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await optionalAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await SubscriptionService.getSubscription(user.userId);

    if (!subscription || subscription.id !== params.id) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = UpdateSubscriptionSchema.parse(body);

    // If tier or interval is being changed, update via Stripe
    if (validatedData.tier || validatedData.interval) {
      const newTier = validatedData.tier || subscription.tier;
      const newInterval = validatedData.interval || subscription.interval;

      await StripeSubscriptionService.updateSubscription(
        params.id,
        newTier as any,
        newInterval as any
      );
    }

    // If only cancelAtPeriodEnd is being changed
    if (validatedData.cancelAtPeriodEnd !== undefined) {
      if (validatedData.cancelAtPeriodEnd) {
        await StripeSubscriptionService.cancelSubscription(params.id, false);
      } else {
        await StripeSubscriptionService.reactivateSubscription(params.id);
      }
    }

    // Fetch updated subscription
    const updatedSubscription = await SubscriptionService.getSubscription(
      user.userId
    );

    return NextResponse.json({
      success: true,
      data: updatedSubscription,
    });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update subscription',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscriptions/[id] - Cancel subscription
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await optionalAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await SubscriptionService.getSubscription(user.userId);

    if (!subscription || subscription.id !== params.id) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const immediately = searchParams.get('immediately') === 'true';

    await StripeSubscriptionService.cancelSubscription(params.id, immediately);

    return NextResponse.json({
      success: true,
      message: immediately
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at period end',
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to cancel subscription',
      },
      { status: 500 }
    );
  }
}

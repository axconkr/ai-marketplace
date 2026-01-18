/**
 * Subscription management API endpoints
 * GET /api/subscriptions - Get user's current subscription
 * POST /api/subscriptions - Create new subscription (initiate checkout)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import {
  SubscriptionService,
  StripeSubscriptionService,
  CreateSubscriptionSchema,
} from '@/src/lib/subscriptions';

/**
 * GET /api/subscriptions - Get user's subscription
 */
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await SubscriptionService.getSubscription(user.userId);

    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: null,
      });
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
 * POST /api/subscriptions - Create subscription checkout
 */
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = CreateSubscriptionSchema.parse(body);

    // Check if user already has active subscription
    const existingSubscription = await SubscriptionService.getSubscription(
      user.userId
    );
    if (existingSubscription) {
      return NextResponse.json(
        {
          success: false,
          error: 'You already have an active subscription',
        },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await StripeSubscriptionService.createCheckoutSession(
      user.userId,
      user.email,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: checkoutSession,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create subscription',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscriptions/checkout - Create Stripe Checkout Session
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import {
  StripeSubscriptionService,
  CreateSubscriptionSchema,
} from '@/src/lib/subscriptions';

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
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}

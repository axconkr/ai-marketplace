/**
 * POST /api/subscriptions/portal - Create Stripe Customer Portal Session
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { StripeSubscriptionService } from '@/src/lib/subscriptions';

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
    const { returnUrl } = body;

    const portalSession = await StripeSubscriptionService.createPortalSession(
      user.userId,
      returnUrl
    );

    return NextResponse.json({
      success: true,
      data: portalSession,
    });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create portal session',
      },
      { status: 500 }
    );
  }
}

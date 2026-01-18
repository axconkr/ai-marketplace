import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/user/stripe-connect - Create Stripe Connect account link
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        stripe_account_id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // In production, use actual Stripe SDK
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // If user doesn't have Stripe account, create one
    // if (!user.stripe_account_id) {
    //   const account = await stripe.accounts.create({
    //     type: 'express',
    //     email: user.email,
    //     capabilities: {
    //       transfers: { requested: true },
    //     },
    //   });
    //
    //   await prisma.user.update({
    //     where: { id: userId },
    //     data: { stripe_account_id: account.id },
    //   });
    //
    //   user.stripe_account_id = account.id;
    // }

    // Create account link for onboarding
    // const accountLink = await stripe.accountLinks.create({
    //   account: user.stripe_account_id,
    //   refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/bank-account`,
    //   return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/bank-account?stripe_connected=true`,
    //   type: 'account_onboarding',
    // });

    // Mock response for development
    const mockAccountLink = {
      url: `https://connect.stripe.com/express/oauth/authorize?client_id=ca_xxx&stripe_user[email]=${user.email}`,
    };

    return NextResponse.json(mockAccountLink);
  } catch (error) {
    console.error('Error creating Stripe Connect link:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe Connect link' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/stripe-connect - Get Stripe Connect account status
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripe_account_id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.stripe_account_id) {
      return NextResponse.json({ connected: false });
    }

    // In production, fetch account details from Stripe
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const account = await stripe.accounts.retrieve(user.stripe_account_id);

    return NextResponse.json({
      connected: true,
      account_id: user.stripe_account_id,
      // charges_enabled: account.charges_enabled,
      // payouts_enabled: account.payouts_enabled,
    });
  } catch (error) {
    console.error('Error fetching Stripe account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Stripe account' },
      { status: 500 }
    );
  }
}

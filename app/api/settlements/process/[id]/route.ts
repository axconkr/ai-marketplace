import { NextRequest, NextResponse } from 'next/server';
import {
  processSettlementPayout,
  markSettlementAsPaid,
  markSettlementAsFailed,
  processStripeConnectPayout,
} from '@/lib/services/settlement';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userRole: string;
    try {
      const payload = await verifyToken(token);
      userRole = payload.role;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { paymentMethod, transactionId, action } = body;

    // Handle different actions
    if (action === 'mark_paid') {
      const settlement = await markSettlementAsPaid(params.id);
      return NextResponse.json({ settlement, message: 'Settlement marked as paid' });
    }

    if (action === 'mark_failed') {
      const settlement = await markSettlementAsFailed(params.id, body.reason);
      return NextResponse.json({ settlement, message: 'Settlement marked as failed' });
    }

    // Process payout
    if (paymentMethod === 'stripe_connect') {
      const result = await processStripeConnectPayout(params.id);
      return NextResponse.json({
        message: 'Stripe Connect payout initiated',
        transferId: result.transferId,
      });
    }

    if (paymentMethod === 'bank_transfer') {
      const settlement = await processSettlementPayout(
        params.id,
        'bank_transfer',
        transactionId
      );
      return NextResponse.json({
        settlement,
        message: 'Settlement marked for bank transfer',
      });
    }

    return NextResponse.json(
      { error: 'Invalid payment method' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing settlement:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process settlement',
      },
      { status: 500 }
    );
  }
}

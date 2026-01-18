/**
 * POST /api/requests/[id]/payment - Create payment intent for escrow
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/src/lib/requests/auth-helper';
import { EscrowService } from '@/src/lib/requests';
import { createEscrowPaymentIntent } from '@/src/lib/requests/stripe';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = getUserFromToken(request);

    // Get request with escrow
    const devRequest = await prisma.developmentRequest.findUnique({
      where: { id: params.id },
      include: {
        selectedProposal: {
          include: {
            escrows: true,
          },
        },
        buyer: true,
      },
    });

    if (!devRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Request not found',
        },
        { status: 404 }
      );
    }

    if (devRequest.buyerId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Only the buyer can initiate payment',
        },
        { status: 403 }
      );
    }

    if (!devRequest.selectedProposalId || !devRequest.selectedProposal) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'No proposal has been selected yet',
        },
        { status: 400 }
      );
    }

    // Get escrow
    const escrow = devRequest.selectedProposal.escrows[0];
    if (!escrow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Escrow not found',
        },
        { status: 400 }
      );
    }

    if (escrow.status !== 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: `Payment already ${escrow.status.toLowerCase()}`,
        },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentResult = await createEscrowPaymentIntent({
      escrowId: escrow.id,
      amount: escrow.amount,
      buyerEmail: devRequest.buyer.email,
      requestTitle: devRequest.title,
      metadata: {
        requestId: devRequest.id,
        proposalId: devRequest.selectedProposalId,
        sellerId: escrow.sellerId,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentResult.clientSecret,
      amount: escrow.amount,
      escrowId: escrow.id,
      message: 'Payment intent created successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: error.message,
        },
        { status: 401 }
      );
    }

    console.error('Create payment intent error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

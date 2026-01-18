/**
 * POST /api/requests/[id]/select-proposal - Select winning proposal and initiate escrow
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ProposalService, selectProposalSchema } from '@/src/lib/requests';
import { getUserFromToken } from '@/src/lib/requests/auth-helper';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = getUserFromToken(request);
    const body = await request.json();

    // Validate input
    const validatedData = selectProposalSchema.parse(body);

    // Select proposal
    const result = await ProposalService.selectProposal(
      params.id,
      validatedData.proposalId,
      user.userId
    );

    return NextResponse.json({
      success: true,
      request: result.request,
      escrow: result.escrow,
      message:
        'Proposal selected successfully. Please proceed with payment to initiate escrow.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

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

    if (
      error instanceof Error &&
      (error.message === 'Request not found' ||
        error.message === 'Proposal not found' ||
        error.message === 'Unauthorized')
    ) {
      const statusCode =
        error.message === 'Unauthorized'
          ? 403
          : 404;

      return NextResponse.json(
        {
          success: false,
          error:
            error.message === 'Unauthorized'
              ? 'Forbidden'
              : 'Not found',
          message: error.message,
        },
        { status: statusCode }
      );
    }

    if (
      error instanceof Error &&
      error.message.includes('not open')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: error.message,
        },
        { status: 400 }
      );
    }

    console.error('Select proposal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

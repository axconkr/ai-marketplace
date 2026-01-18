/**
 * GET /api/requests/[id]/proposals - Get proposals for a request
 * POST /api/requests/[id]/proposals - Submit a proposal
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ProposalService, createProposalSchema } from '@/src/lib/requests';
import {
  getUserFromToken,
  getOptionalUserFromToken,
} from '@/src/lib/requests/auth-helper';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Optional auth - proposals may be visible based on permissions
    const user = getOptionalUserFromToken(request);

    // This is handled by getRequestById which includes proposals
    // For now, we'll redirect to the request details
    return NextResponse.redirect(
      new URL(`/api/requests/${params.id}`, request.url)
    );
  } catch (error) {
    console.error('Get proposals error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = getUserFromToken(request);
    const body = await request.json();

    // Validate input
    const validatedData = createProposalSchema.parse({
      ...body,
      requestId: params.id,
    });

    // Create proposal
    const proposal = await ProposalService.createProposal(
      user.userId,
      validatedData
    );

    return NextResponse.json(
      {
        success: true,
        proposal,
        message: 'Proposal submitted successfully',
      },
      { status: 201 }
    );
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
      (error.message.includes('not found') ||
        error.message.includes('not open') ||
        error.message.includes('Cannot submit') ||
        error.message.includes('already submitted') ||
        error.message.includes('within the budget'))
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

    console.error('Create proposal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

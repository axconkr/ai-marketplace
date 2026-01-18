/**
 * GET /api/proposals/[id] - Get proposal details
 * PUT /api/proposals/[id] - Update proposal
 * DELETE /api/proposals/[id] - Withdraw proposal
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ProposalService, updateProposalSchema } from '@/src/lib/requests';
import { getUserFromToken } from '@/src/lib/requests/auth-helper';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = getUserFromToken(request);
    const proposal = await ProposalService.getProposalById(params.id, user.userId);

    return NextResponse.json({
      success: true,
      proposal,
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

    if (
      error instanceof Error &&
      (error.message === 'Proposal not found' || error.message === 'Unauthorized')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: error.message === 'Proposal not found' ? 'Not found' : 'Forbidden',
          message: error.message,
        },
        { status: error.message === 'Proposal not found' ? 404 : 403 }
      );
    }

    console.error('Get proposal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = getUserFromToken(request);
    const body = await request.json();

    // Validate input
    const validatedData = updateProposalSchema.parse(body);

    // Update proposal
    const updatedProposal = await ProposalService.updateProposal(
      params.id,
      user.userId,
      validatedData
    );

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
      message: 'Proposal updated successfully',
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
      (error.message === 'Proposal not found' || error.message === 'Unauthorized')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: error.message === 'Proposal not found' ? 'Not found' : 'Forbidden',
          message: error.message,
        },
        { status: error.message === 'Proposal not found' ? 404 : 403 }
      );
    }

    if (
      error instanceof Error &&
      (error.message.includes('not pending') ||
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

    console.error('Update proposal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = getUserFromToken(request);

    // Delete proposal
    await ProposalService.deleteProposal(params.id, user.userId);

    return NextResponse.json({
      success: true,
      message: 'Proposal withdrawn successfully',
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

    if (
      error instanceof Error &&
      (error.message === 'Proposal not found' || error.message === 'Unauthorized')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: error.message === 'Proposal not found' ? 'Not found' : 'Forbidden',
          message: error.message,
        },
        { status: error.message === 'Proposal not found' ? 404 : 403 }
      );
    }

    if (
      error instanceof Error &&
      error.message.includes('not pending')
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

    console.error('Delete proposal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

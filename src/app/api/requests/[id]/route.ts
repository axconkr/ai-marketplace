/**
 * GET /api/requests/[id] - Get request details
 * PUT /api/requests/[id] - Update request
 * DELETE /api/requests/[id] - Delete/cancel request
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RequestService, updateRequestSchema } from '@/src/lib/requests';
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
    const user = getOptionalUserFromToken(request);
    const requestData = await RequestService.getRequestById(
      params.id,
      user?.userId
    );

    return NextResponse.json({
      success: true,
      request: requestData,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Request not found'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: error.message,
        },
        { status: 404 }
      );
    }

    console.error('Get request error:', error);
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
    const validatedData = updateRequestSchema.parse(body);

    // Update request
    const updatedRequest = await RequestService.updateRequest(
      params.id,
      user.userId,
      validatedData
    );

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: 'Request updated successfully',
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
      (error.message === 'Request not found' || error.message === 'Unauthorized')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: error.message === 'Request not found' ? 'Not found' : 'Forbidden',
          message: error.message,
        },
        { status: error.message === 'Request not found' ? 404 : 403 }
      );
    }

    console.error('Update request error:', error);
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

    // Delete request
    await RequestService.deleteRequest(params.id, user.userId);

    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully',
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
      (error.message === 'Request not found' || error.message === 'Unauthorized')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: error.message === 'Request not found' ? 'Not found' : 'Forbidden',
          message: error.message,
        },
        { status: error.message === 'Request not found' ? 404 : 403 }
      );
    }

    console.error('Delete request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

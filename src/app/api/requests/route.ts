/**
 * GET /api/requests - List development requests
 * POST /api/requests - Create new development request
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  RequestService,
  createRequestSchema,
  listRequestsQuerySchema,
} from '@/src/lib/requests';
import { getUserFromToken, getOptionalUserFromToken } from '@/src/lib/requests/auth-helper';

export async function GET(request: NextRequest) {
  try {
    // Optional auth - list is public but may show different data for authenticated users
    const user = getOptionalUserFromToken(request);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = {
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      budgetMin: searchParams.get('budgetMin')
        ? parseInt(searchParams.get('budgetMin')!)
        : undefined,
      budgetMax: searchParams.get('budgetMax')
        ? parseInt(searchParams.get('budgetMax')!)
        : undefined,
      page: searchParams.get('page')
        ? parseInt(searchParams.get('page')!)
        : 1,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 20,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    // Validate query
    const validatedQuery = listRequestsQuerySchema.parse(query);

    // Get requests
    const result = await RequestService.listRequests(validatedQuery);

    return NextResponse.json({
      success: true,
      ...result,
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

    console.error('List requests error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = getUserFromToken(request);

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = createRequestSchema.parse(body);

    // Create request
    const newRequest = await RequestService.createRequest(
      user.userId,
      validatedData
    );

    return NextResponse.json(
      {
        success: true,
        request: newRequest,
        message: 'Development request created successfully',
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

    console.error('Create request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

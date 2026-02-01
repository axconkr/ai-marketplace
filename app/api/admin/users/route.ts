/**
 * Admin Users API Endpoint
 * GET /api/admin/users - List users with filters and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import {
  listUsersForAdmin,
} from '@/lib/services/admin/user';
import {
  successResponse,
  paginatedResponse,
  handleError,
  badRequestResponse,
} from '@/lib/api/response';
import { AuthError } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    if (page < 1 || limit < 1 || limit > 100) {
      return badRequestResponse(
        'Invalid pagination parameters. Page and limit must be >= 1, and limit <= 100'
      );
    }

    const result = await listUsersForAdmin({
      page,
      limit,
      role,
      status,
      search,
      sortBy,
      sortOrder,
    });

    return paginatedResponse(result.items, result.pagination);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }

    return handleError(error);
  }
}

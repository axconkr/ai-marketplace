/**
 * Admin User Details API Endpoint
 * GET /api/admin/users/[id] - Get user details
 * PATCH /api/admin/users/[id] - Update user role or status
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import {
  getUserDetailsForAdmin,
  updateUserRole,
  updateUserStatus,
} from '@/lib/services/admin/user';
import {
  successResponse,
  handleError,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api/response';
import { AuthError } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);

    const userId = params.id;
    const user = await getUserDetailsForAdmin(userId);

    if (!user) {
      return notFoundResponse('User');
    }

    return successResponse(user);
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await requireRole(request, [UserRole.ADMIN]);

    const userId = params.id;
    const body = await request.json();
    const { role, status } = body;

    if (!role && !status) {
      return badRequestResponse(
        'At least one of "role" or "status" must be provided'
      );
    }

    let result;

    if (role) {
      result = await updateUserRole(userId, role, adminUser.userId);
      if (!result.success) {
        return badRequestResponse(result.message);
      }
    }

    if (status) {
      result = await updateUserStatus(userId, status, adminUser.userId);
      if (!result.success) {
        return badRequestResponse(result.message);
      }
    }

    return successResponse({
      message: result?.message || 'User updated successfully',
      data: result?.data,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }

    if (error instanceof SyntaxError) {
      return badRequestResponse('Invalid JSON in request body');
    }

    return handleError(error);
  }
}

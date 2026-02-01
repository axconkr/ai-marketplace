/**
 * Admin User Statistics API Endpoint
 * GET /api/admin/users/statistics - Get user statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { getUserStatistics } from '@/lib/services/admin/user';
import { successResponse, handleError } from '@/lib/api/response';
import { AuthError } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);

    const statistics = await getUserStatistics();

    return successResponse(statistics);
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

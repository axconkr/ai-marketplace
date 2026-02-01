import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, successResponse } from '@/lib/api/response';
import { getVerificationStatistics } from '@/lib/services/admin/verification';

/**
 * GET /api/admin/verifications/statistics - Get verification statistics
 * Auth: Requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const statistics = await getVerificationStatistics();
    return successResponse(statistics);
  } catch (error) {
    return handleError(error);
  }
}

import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, successResponse } from '@/lib/api/response';
import { getProductStatistics } from '@/lib/services/admin/product';

/**
 * GET /api/admin/products/statistics - Get product statistics
 * Auth: Requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const statistics = await getProductStatistics();
    return successResponse(statistics);
  } catch (error) {
    return handleError(error);
  }
}

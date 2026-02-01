import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, successResponse } from '@/lib/api/response';
import { getSupportStatistics } from '@/lib/services/admin/support';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);

    const statistics = await getSupportStatistics();

    return successResponse(statistics);
  } catch (error) {
    return handleError(error);
  }
}

import { NextRequest } from 'next/server';
import { requireRole, AuthTokenPayload } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, successResponse, badRequestResponse } from '@/lib/api/response';
import { getPlatformFeeRate, updatePlatformFeeRate } from '@/lib/services/admin/settings';

/**
 * GET /api/admin/settings/fee - Get current platform fee rate
 *
 * Auth: Requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const rate = await getPlatformFeeRate();

    return successResponse({ rate });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/admin/settings/fee - Update platform fee rate
 * Body: { rate: number } - Rate as decimal (0.01 = 1%, 0.50 = 50%)
 *
 * Auth: Requires admin role
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireRole(request, [UserRole.ADMIN]);
    const body = await request.json();
    const { rate } = body;

    if (rate === undefined || typeof rate !== 'number') {
      return badRequestResponse('Missing or invalid required field: rate (must be a number)');
    }

    const result = await updatePlatformFeeRate(rate, session.userId);

    if (!result.success) {
      return badRequestResponse(result.message);
    }

    return successResponse({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return handleError(error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, successResponse, badRequestResponse } from '@/lib/api/response';
import { getSystemSettings, updateSystemSetting } from '@/lib/services/admin/settings';

/**
 * GET /api/admin/settings - Get all system settings
 *
 * Auth: Requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const settings = await getSystemSettings();

    return successResponse(settings);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/admin/settings - Update a system setting
 * Body: { key: string; value: any }
 *
 * Auth: Requires admin role
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireRole(request, [UserRole.ADMIN]);
    const body = await request.json();
    const { key, value } = body;

    // Validate required fields
    if (!key || value === undefined) {
      return badRequestResponse('Missing required fields: key, value');
    }

    const result = await updateSystemSetting(key, value, session.userId);

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

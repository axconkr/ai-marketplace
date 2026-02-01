import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, successResponse } from '@/lib/api/response';
import { listAvailableVerifiers } from '@/lib/services/admin/verification';

/**
 * GET /api/admin/verifications/verifiers - List available verifiers
 * Auth: Requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const verifiers = await listAvailableVerifiers();
    return successResponse(verifiers);
  } catch (error) {
    return handleError(error);
  }
}

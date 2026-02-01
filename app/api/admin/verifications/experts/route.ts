import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, successResponse } from '@/lib/api/response';
import { listAvailableExperts } from '@/lib/services/admin/verification';
import { ExpertType } from '@prisma/client';

/**
 * GET /api/admin/verifications/experts - List available experts
 * Query params:
 *   - type: ExpertType (DESIGN, PLANNING, DEVELOPMENT, DOMAIN)
 * Auth: Requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as ExpertType;

    if (!type) {
      return NextResponse.json(
        { error: 'type query parameter is required' },
        { status: 400 }
      );
    }

    const experts = await listAvailableExperts(type);
    return successResponse(experts);
  } catch (error) {
    return handleError(error);
  }
}

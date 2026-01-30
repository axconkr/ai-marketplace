/**
 * GET /api/verifications/assigned-to-me
 * Get verifications assigned to the current verifier
 */

import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { successResponse, handleError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET /api/verifications/assigned-to-me
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user (must be verifier or admin)
    const user = await requireRole(request, [UserRole.VERIFIER, UserRole.ADMIN]);

    // 2. Fetch assigned verifications
    const verifications = await prisma.verification.findMany({
      where: {
        verifier_id: user.userId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            seller_id: true,
          },
        },
        verifier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        assigned_at: 'desc',
      },
    });

    // 3. Return verifications
    return successResponse(verifications);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/verifications/my-verifications
 * Get seller's own verifications
 */

import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { successResponse, handleError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET /api/verifications/my-verifications
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user (must be seller or admin)
    const user = await requireRole(request, ['seller', 'admin']);

    // 2. Fetch seller's verifications
    const verifications = await prisma.verification.findMany({
      where: {
        product: {
          seller_id: user.userId,
        },
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
        requested_at: 'desc',
      },
    });

    // 3. Return verifications
    return successResponse(verifications);
  } catch (error) {
    return handleError(error);
  }
}

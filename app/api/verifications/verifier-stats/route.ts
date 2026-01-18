/**
 * GET /api/verifications/verifier-stats
 * Get verifier statistics (own stats or by verifierId for admin)
 */

import { NextRequest } from 'next/server';
import { requireAuth, requireRole, isAdmin } from '@/lib/auth';
import { successResponse, handleError, parseSearchParams, badRequestResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const verifierStatsSchema = z.object({
  verifierId: z.string().optional(),
});

type VerifierStatsQuery = z.infer<typeof verifierStatsSchema>;

// ============================================================================
// GET /api/verifications/verifier-stats
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await requireAuth(request);

    // 2. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = parseSearchParams<VerifierStatsQuery>(
      searchParams,
      verifierStatsSchema
    );

    // 3. Determine target verifier ID
    let targetVerifierId = query.verifierId || user.userId;

    // 4. Authorization check
    // Verifiers can only see their own stats
    // Admins can see any verifier's stats
    if (targetVerifierId !== user.userId && !isAdmin(user)) {
      return badRequestResponse('You can only view your own statistics');
    }

    // 5. Verify target user is a verifier
    const targetUser = await prisma.user.findUnique({
      where: { id: targetVerifierId },
      select: { role: true },
    });

    if (!targetUser) {
      return badRequestResponse('Verifier not found');
    }

    if (targetUser.role !== 'verifier' && targetUser.role !== 'admin') {
      return badRequestResponse('User is not a verifier');
    }

    // 6. Fetch verifier statistics
    const verifications = await prisma.verification.findMany({
      where: {
        verifier_id: targetVerifierId,
      },
      select: {
        status: true,
        score: true,
        verifier_share: true,
        verifierPayout: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
    });

    // 7. Calculate statistics
    const stats = {
      totalVerifications: verifications.length,
      totalEarnings: 0,
      approvalRate: 0,
      averageScore: 0,
      pendingPayouts: 0,
    };

    // Total earnings (sum of all verifier shares from completed verifications)
    const completedVerifications = verifications.filter(
      (v) => v.status === 'APPROVED' || v.status === 'REJECTED'
    );
    stats.totalEarnings = completedVerifications.reduce(
      (sum, v) => sum + v.verifier_share,
      0
    );

    // Approval rate
    const reviewedCount = completedVerifications.length;
    const approvedCount = verifications.filter((v) => v.status === 'APPROVED').length;
    stats.approvalRate = reviewedCount > 0
      ? (approvedCount / reviewedCount) * 100
      : 0;

    // Average score
    const scores = verifications
      .filter((v) => v.score !== null)
      .map((v) => v.score!);
    stats.averageScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;

    // Pending payouts (payouts not yet paid)
    stats.pendingPayouts = verifications.reduce((sum, v) => {
      if (v.verifierPayout && v.verifierPayout.status === 'PENDING') {
        return sum + v.verifierPayout.amount;
      }
      return sum;
    }, 0);

    // 8. Return statistics
    return successResponse(stats);
  } catch (error) {
    return handleError(error);
  }
}

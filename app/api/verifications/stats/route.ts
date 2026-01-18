/**
 * GET /api/verifications/stats
 * Get platform verification statistics (admin only)
 */

import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { successResponse, handleError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET /api/verifications/stats
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user (admin only)
    await requireRole(request, ['admin']);

    // 2. Fetch statistics
    const [
      totalVerifications,
      byLevel,
      byStatus,
      approved,
      rejected,
    ] = await Promise.all([
      // Total verifications
      prisma.verification.count(),

      // Verifications by level
      prisma.verification.groupBy({
        by: ['level'],
        _count: true,
      }),

      // Verifications by status
      prisma.verification.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Approved verifications with fees
      prisma.verification.findMany({
        where: {
          status: 'APPROVED',
        },
        select: {
          fee: true,
          score: true,
        },
      }),

      // Rejected count
      prisma.verification.count({
        where: {
          status: 'REJECTED',
        },
      }),
    ]);

    // 3. Calculate aggregated stats
    const stats = {
      totalVerifications,
      byLevel: {
        level0: 0,
        level1: 0,
        level2: 0,
        level3: 0,
      },
      byStatus: {
        pending: 0,
        assigned: 0,
        inProgress: 0,
        completed: 0,
        approved: 0,
        rejected: 0,
      },
      totalRevenue: 0,
      averageScore: 0,
    };

    // Map level counts
    byLevel.forEach((item) => {
      const key = `level${item.level}` as keyof typeof stats.byLevel;
      stats.byLevel[key] = item._count;
    });

    // Map status counts (convert to camelCase)
    byStatus.forEach((item) => {
      const statusMap: Record<string, keyof typeof stats.byStatus> = {
        PENDING: 'pending',
        ASSIGNED: 'assigned',
        IN_PROGRESS: 'inProgress',
        COMPLETED: 'completed',
        APPROVED: 'approved',
        REJECTED: 'rejected',
      };
      const key = statusMap[item.status];
      if (key) {
        stats.byStatus[key] = item._count;
      }
    });

    // Calculate total revenue (sum of all fees)
    stats.totalRevenue = approved.reduce((sum, v) => sum + v.fee, 0);

    // Calculate average score
    const scores = approved.filter((v) => v.score !== null).map((v) => v.score!);
    stats.averageScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;

    // 4. Return statistics
    return successResponse(stats);
  } catch (error) {
    return handleError(error);
  }
}

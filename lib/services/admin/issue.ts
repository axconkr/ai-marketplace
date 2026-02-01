import { prisma } from '@/lib/prisma';
import { AdminListParams, AdminListResult, AdminActionResult } from './types';
import { buildPaginationQuery, buildPaginationInfo } from './utils';

// Refund with order, product, buyer info
export interface AdminRefund {
  id: string;
  order_id: string;
  amount: number;
  reason: string | null;
  status: string;
  createdAt: Date;
  order: {
    product: { id: string; name: string };
    buyer: { id: string; name: string | null; email: string };
  };
}

// Flagged review with product, user info
export interface AdminFlaggedReview {
  id: string;
  product_id: string;
  rating: number;
  comment: string;
  flag_reason: string | null;
  created_at: Date;
  product: { id: string; name: string };
  user: { id: string; name: string | null; email: string };
}

/**
 * List refunds with filters (status, date range)
 * Includes nested order/product/buyer info
 */
export async function listRefundsForAdmin(
  params: AdminListParams & { from?: Date; to?: Date }
): Promise<AdminListResult<AdminRefund>> {
  const pagination = buildPaginationQuery(params);

  // Build where clause with status filter and date range
  const where: any = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.from || params.to) {
    where.createdAt = {};
    if (params.from) {
      where.createdAt.gte = params.from;
    }
    if (params.to) {
      where.createdAt.lte = params.to;
    }
  }

  // Get total count for pagination
  const total = await prisma.refund.count({ where });

  // Fetch refunds with nested relations
  const refunds = await prisma.refund.findMany({
    where,
    include: {
      order: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    skip: pagination.skip,
    take: pagination.take,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    items: refunds as AdminRefund[],
    pagination: buildPaginationInfo(total, params),
  };
}

/**
 * Approve a refund
 */
export async function approveRefund(
  refundId: string,
  adminId: string
): Promise<AdminActionResult> {
  try {
    const refund = await prisma.refund.update({
      where: { id: refundId },
      data: {
        status: 'PROCESSING',
        approved_by: adminId,
      },
    });

    return {
      success: true,
      message: 'Refund approved successfully',
      data: { refund },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to approve refund: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Reject a refund with reason
 */
export async function rejectRefund(
  refundId: string,
  adminId: string,
  reason: string
): Promise<AdminActionResult> {
  try {
    const refund = await prisma.refund.update({
      where: { id: refundId },
      data: {
        status: 'FAILED',
        failure_reason: reason,
        approved_by: adminId,
      },
    });

    return {
      success: true,
      message: 'Refund rejected successfully',
      data: { refund },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to reject refund: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * List reviews where flagged=true
 * Includes product and user info
 */
export async function listFlaggedReviews(
  params: AdminListParams
): Promise<AdminListResult<AdminFlaggedReview>> {
  const pagination = buildPaginationQuery(params);

  // Get total count of flagged reviews
  const total = await prisma.review.count({
    where: { flagged: true },
  });

  // Fetch flagged reviews with nested relations
  const reviews = await prisma.review.findMany({
    where: { flagged: true },
    include: {
      product: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    skip: pagination.skip,
    take: pagination.take,
    orderBy: {
      created_at: 'desc',
    },
  });

  return {
    items: reviews as AdminFlaggedReview[],
    pagination: buildPaginationInfo(total, params),
  };
}

/**
 * Resolve review flag
 * - 'approve': unflag the review (set flagged=false, flag_reason=null)
 * - 'delete': set status to DELETED
 * - 'warn_user': unflag for now (notification out of scope)
 */
export async function resolveReviewFlag(
  reviewId: string,
  action: 'approve' | 'delete' | 'warn_user',
  adminId: string
): Promise<AdminActionResult> {
  try {
    let data: any = {};

    if (action === 'approve') {
      data = {
        flagged: false,
        flag_reason: null,
      };
    } else if (action === 'delete') {
      data = {
        status: 'DELETED',
      };
    } else if (action === 'warn_user') {
      // For now, just unflag - notification system out of scope
      data = {
        flagged: false,
        flag_reason: null,
      };
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data,
    });

    return {
      success: true,
      message: `Review flag resolved with action: ${action}`,
      data: { review },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to resolve review flag: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get issue statistics
 * - pendingRefunds: count of refunds with status PENDING
 * - flaggedReviews: count of reviews where flagged=true
 * - resolvedThisWeek: count of refunds resolved (SUCCEEDED or FAILED) in the last 7 days
 */
export async function getIssueStatistics(): Promise<{
  pendingRefunds: number;
  flaggedReviews: number;
  resolvedThisWeek: number;
}> {
  // Get one week ago date
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [pendingRefunds, flaggedReviews, resolvedThisWeek] = await Promise.all([
    // Count pending refunds
    prisma.refund.count({
      where: {
        status: 'PENDING',
      },
    }),

    // Count flagged reviews
    prisma.review.count({
      where: {
        flagged: true,
      },
    }),

    // Count resolved refunds in the last 7 days
    prisma.refund.count({
      where: {
        status: {
          in: ['SUCCEEDED', 'FAILED'],
        },
        updatedAt: {
          gte: oneWeekAgo,
        },
      },
    }),
  ]);

  return {
    pendingRefunds,
    flaggedReviews,
    resolvedThisWeek,
  };
}

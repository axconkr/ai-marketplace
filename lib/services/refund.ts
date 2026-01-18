/**
 * Refund Service
 * Business logic for refund processing
 */

import { prisma } from '@/lib/db';
import { getProviderByName } from '@/lib/payment';
import { PaymentError } from '@/lib/payment/types';
import { OrderStatus, RefundStatus } from '@prisma/client';
import { differenceInDays } from 'date-fns';
import { revokeProductAccess } from './order';

// ============================================================================
// CONFIGURATION
// ============================================================================

const REFUND_WINDOW_DAYS = parseInt(process.env.PAYMENT_REFUND_WINDOW_DAYS || '7', 10);

// ============================================================================
// TYPES
// ============================================================================

export interface ProcessRefundParams {
  orderId: string;
  requestedBy: string;
  reason?: string;
}

export interface RefundValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================================================
// REFUND PROCESSING
// ============================================================================

/**
 * Process a refund request
 */
export async function processRefund(params: ProcessRefundParams) {
  const { orderId, requestedBy, reason } = params;

  // 1. Get order with all relations
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: {
        include: {
          seller: true,
        },
      },
      buyer: true,
      payment: true,
      refund: true,
    },
  });

  if (!order) {
    throw new PaymentError('Order not found', 'ORDER_NOT_FOUND', 404);
  }

  // 2. Validate refund eligibility
  const validation = validateRefundEligibility(order, requestedBy);
  if (!validation.valid) {
    throw new PaymentError(validation.error!, 'REFUND_NOT_ELIGIBLE', 400);
  }

  // 3. Create refund record
  const refundRecord = await prisma.refund.create({
    data: {
      order_id: orderId,
      provider: order.payment_provider!,
      provider_refund_id: `pending_${orderId}_${Date.now()}`, // Will be updated after provider refund
      amount: order.amount,
      currency: order.currency,
      reason,
      status: RefundStatus.PROCESSING,
      initiated_by: requestedBy,
    },
  });

  try {
    // 4. Process refund with payment provider
    const provider = getProviderByName(order.payment_provider as any);
    const refundResult = await provider.refundPayment({
      paymentId: order.payment!.provider_payment_id,
      amount: order.amount,
      reason,
    });

    // 5. Update refund record with provider refund ID
    await prisma.refund.update({
      where: { id: refundRecord.id },
      data: {
        provider_refund_id: refundResult.id,
        status:
          refundResult.status === 'succeeded' ? RefundStatus.SUCCEEDED : RefundStatus.PROCESSING,
      },
    });

    // 6. Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.REFUNDED,
        refunded_at: new Date(),
        refund_requested: true,
        refund_reason: reason,
      },
    });

    // 7. Update payment status
    await prisma.payment.update({
      where: { order_id: orderId },
      data: {
        status: 'REFUNDED',
      },
    });

    // 8. Revoke product access
    await revokeProductAccess(orderId);

    // 9. Send notifications (implement separately)
    // await sendRefundNotifications(orderId);

    return {
      refund: refundResult,
      order: await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          product: true,
          buyer: true,
          payment: true,
          refund: true,
        },
      }),
    };
  } catch (error) {
    // Update refund status to failed
    await prisma.refund.update({
      where: { id: refundRecord.id },
      data: {
        status: RefundStatus.FAILED,
        failure_reason: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate if order is eligible for refund
 */
export function validateRefundEligibility(
  order: any,
  requestedBy: string
): RefundValidationResult {
  // 1. Check if requester is the buyer
  if (order.buyer_id !== requestedBy) {
    return {
      valid: false,
      error: 'Only the buyer can request a refund',
    };
  }

  // 2. Check order status
  if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.COMPLETED) {
    return {
      valid: false,
      error: 'Order is not eligible for refund',
    };
  }

  // 3. Check if already refunded
  if (order.refund) {
    return {
      valid: false,
      error: 'Order has already been refunded',
    };
  }

  // 4. Check refund window (7 days)
  if (!order.paid_at) {
    return {
      valid: false,
      error: 'Order payment date not found',
    };
  }

  const daysSincePurchase = differenceInDays(new Date(), order.paid_at);
  if (daysSincePurchase > REFUND_WINDOW_DAYS) {
    return {
      valid: false,
      error: `Refund window expired (${REFUND_WINDOW_DAYS} days from purchase)`,
    };
  }

  // 5. Check if payment exists
  if (!order.payment) {
    return {
      valid: false,
      error: 'Payment record not found',
    };
  }

  return { valid: true };
}

/**
 * Check if order is within refund window
 */
export function isWithinRefundWindow(paidAt: Date): boolean {
  const daysSincePurchase = differenceInDays(new Date(), paidAt);
  return daysSincePurchase <= REFUND_WINDOW_DAYS;
}

/**
 * Get days remaining for refund
 */
export function getDaysRemainingForRefund(paidAt: Date): number {
  const daysSincePurchase = differenceInDays(new Date(), paidAt);
  const daysRemaining = REFUND_WINDOW_DAYS - daysSincePurchase;
  return Math.max(0, daysRemaining);
}

// ============================================================================
// REFUND QUERIES
// ============================================================================

/**
 * Get refund by ID
 */
export async function getRefund(refundId: string) {
  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    include: {
      order: {
        include: {
          product: true,
          buyer: true,
        },
      },
    },
  });

  if (!refund) {
    throw new PaymentError('Refund not found', 'REFUND_NOT_FOUND', 404);
  }

  return refund;
}

/**
 * Get refund by order ID
 */
export async function getRefundByOrderId(orderId: string) {
  const refund = await prisma.refund.findUnique({
    where: { order_id: orderId },
    include: {
      order: {
        include: {
          product: true,
          buyer: true,
        },
      },
    },
  });

  return refund;
}

/**
 * Get user's refunds
 */
export async function getUserRefunds(
  userId: string,
  options?: {
    page?: number;
    limit?: number;
    status?: RefundStatus;
  }
) {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    order: {
      buyer_id: userId,
    },
  };

  if (options?.status) {
    where.status = options.status;
  }

  const [refunds, total] = await Promise.all([
    prisma.refund.findMany({
      where,
      include: {
        order: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.refund.count({ where }),
  ]);

  return {
    refunds,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

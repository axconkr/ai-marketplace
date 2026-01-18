/**
 * GET /api/payments/[orderId]
 * Get payment details for an order
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleError } from '@/lib/api/response';
import { getOrder } from '@/lib/services/order';
import { getDaysRemainingForRefund, isWithinRefundWindow } from '@/lib/services/refund';

// ============================================================================
// GET /api/payments/[orderId]
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // 1. Authenticate user
    const user = await requireAuth(request);

    // 2. Get order with payment details
    const order = await getOrder(params.orderId, user.userId);

    // 3. Calculate refund eligibility
    const refundEligible =
      order.paid_at && isWithinRefundWindow(order.paid_at) && !order.refund;
    const daysRemainingForRefund = order.paid_at
      ? getDaysRemainingForRefund(order.paid_at)
      : 0;

    // 4. Return payment details
    return successResponse({
      order: {
        id: order.id,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        platformFee: order.platform_fee,
        sellerAmount: order.seller_amount,
        paidAt: order.paid_at,
        refundedAt: order.refunded_at,
        createdAt: order.createdAt,
      },
      product: {
        id: order.product.id,
        name: order.product.name,
        price: order.product.price,
        currency: order.product.currency,
        seller: {
          id: order.product.seller.id,
          name: order.product.seller.name,
          email: order.product.seller.email,
        },
      },
      buyer: {
        id: order.buyer.id,
        name: order.buyer.name,
        email: order.buyer.email,
      },
      payment: order.payment
        ? {
            id: order.payment.id,
            provider: order.payment.provider,
            status: order.payment.status,
            paymentMethod: order.payment.payment_method,
            cardLast4: order.payment.card_last4,
            cardBrand: order.payment.card_brand,
            createdAt: order.payment.createdAt,
          }
        : null,
      refund: order.refund
        ? {
            id: order.refund.id,
            status: order.refund.status,
            amount: order.refund.amount,
            reason: order.refund.reason,
            createdAt: order.refund.createdAt,
          }
        : null,
      access: {
        granted: order.access_granted,
        downloadUrl: order.download_url,
        downloadExpires: order.download_expires,
      },
      refundInfo: {
        eligible: refundEligible,
        daysRemaining: daysRemainingForRefund,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

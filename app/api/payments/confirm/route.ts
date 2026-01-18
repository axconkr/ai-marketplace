/**
 * POST /api/payments/confirm
 * Confirm a payment after user completes payment
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleError, parseBody } from '@/lib/api/response';
import { getProviderByName } from '@/lib/payment';
import { completeOrder } from '@/lib/services/order';
import { prisma } from '@/lib/db';
import { PaymentError } from '@/lib/payment/types';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const confirmPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentId: z.string().min(1, 'Payment ID is required'),
  paymentMethodId: z.string().optional(), // For Stripe
  amount: z.number().optional(), // For TossPayments verification
});

type ConfirmPaymentRequest = z.infer<typeof confirmPaymentSchema>;

// ============================================================================
// POST /api/payments/confirm
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await requireAuth(request);

    // 2. Parse and validate request body
    const body = await parseBody<ConfirmPaymentRequest>(request, confirmPaymentSchema);

    // 3. Get order
    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      throw new PaymentError('Order not found', 'ORDER_NOT_FOUND', 404);
    }

    // 4. Verify order belongs to user
    if (order.buyer_id !== user.userId) {
      throw new PaymentError('Access denied', 'FORBIDDEN', 403);
    }

    // 5. Check if order already paid
    if (order.status === 'PAID' || order.status === 'COMPLETED') {
      throw new PaymentError('Order already paid', 'ALREADY_PAID', 400);
    }

    // 6. Confirm payment with provider
    const provider = getProviderByName(order.payment_provider as any);
    const paymentResult = await provider.confirmPayment({
      paymentId: body.paymentId,
      paymentMethodId: body.paymentMethodId,
      orderId: body.orderId,
      amount: body.amount,
    });

    // 7. Verify payment succeeded
    if (paymentResult.status !== 'succeeded') {
      throw new PaymentError(
        paymentResult.failureMessage || 'Payment failed',
        'PAYMENT_FAILED',
        400,
        {
          code: paymentResult.failureCode,
        }
      );
    }

    // 8. Complete order
    const completedOrder = await completeOrder({
      orderId: body.orderId,
      paymentId: body.paymentId,
      paymentMethod: paymentResult.paymentMethod,
    });

    // 9. Return success
    return successResponse({
      order: {
        id: completedOrder.id,
        status: completedOrder.status,
        amount: completedOrder.amount,
        currency: completedOrder.currency,
        paidAt: completedOrder.paid_at,
      },
      payment: {
        id: paymentResult.id,
        status: paymentResult.status,
        paymentMethod: paymentResult.paymentMethod,
      },
      downloadUrl: completedOrder.download_url,
      downloadExpires: completedOrder.download_expires,
    });
  } catch (error) {
    return handleError(error);
  }
}

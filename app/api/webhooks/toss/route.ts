/**
 * POST /api/webhooks/toss
 * Handle TossPayments webhook events
 */

import { NextRequest } from 'next/server';
import { tossPaymentsProvider } from '@/lib/payment';
import { completeOrder } from '@/lib/services/order';
import { completeCheckoutSession } from '@/lib/services/cart-checkout';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook and parse event
    const event = await tossPaymentsProvider.handleWebhook(request);

    console.log(`[TossPayments Webhook] Received event: ${event.type}`, {
      paymentId: event.paymentId,
      orderId: event.orderId,
    });

    // 2. Handle different event types
    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event);
        break;

      case 'refund.succeeded':
        await handleRefundSucceeded(event);
        break;

      default:
        console.log(`[TossPayments Webhook] Unhandled event type: ${event.type}`);
    }

    // 3. Return success response
    return successResponse({ received: true });
  } catch (error) {
    console.error('[TossPayments Webhook] Error:', error);
    return errorResponse(
      'WEBHOOK_ERROR',
      error instanceof Error ? error.message : 'Webhook processing failed',
      400
    );
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

async function handlePaymentSucceeded(event: any) {
  const { orderId, paymentId, data, metadata } = event;

  const checkoutSessionId = metadata?.checkout_session_id;

  if (checkoutSessionId) {
    try {
      const existingOrders = await prisma.order.findMany({
        where: { checkout_session_id: checkoutSessionId },
        select: { status: true },
      });

      if (existingOrders.length === 0) {
        console.error(`[TossPayments Webhook] No orders found for checkout session: ${checkoutSessionId}`);
        return;
      }

      const allPaid = existingOrders.every(
        (o) => o.status === 'PAID' || o.status === 'COMPLETED'
      );
      if (allPaid) {
        console.log(`[TossPayments Webhook] Checkout session already completed: ${checkoutSessionId}`);
        return;
      }

      const paymentMethod = {
        type: data.paymentMethod || 'card',
        last4: undefined,
        brand: undefined,
      };

      await completeCheckoutSession(checkoutSessionId, paymentMethod);
      console.log(`[TossPayments Webhook] Checkout session completed: ${checkoutSessionId}`);
      return;
    } catch (error) {
      console.error(`[TossPayments Webhook] Error completing checkout session ${checkoutSessionId}:`, error);
      throw error;
    }
  }

  if (!orderId) {
    console.error('[TossPayments Webhook] Missing orderId in payment.succeeded event');
    return;
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error(`[TossPayments Webhook] Order not found: ${orderId}`);
      return;
    }

    if (order.status === 'PAID' || order.status === 'COMPLETED') {
      console.log(`[TossPayments Webhook] Order already paid: ${orderId}`);
      return;
    }

    const paymentMethod = {
      type: data.paymentMethod || 'card',
      last4: undefined,
      brand: undefined,
    };

    await completeOrder({
      orderId,
      paymentId,
      paymentMethod,
    });

    console.log(`[TossPayments Webhook] Order completed: ${orderId}`);
  } catch (error) {
    console.error(`[TossPayments Webhook] Error completing order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(event: any) {
  const { orderId, data } = event;

  if (!orderId) {
    console.error('[TossPayments Webhook] Missing orderId in payment.failed event');
    return;
  }

  try {
    // Update order status to failed
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'FAILED',
      },
    });

    // Update payment status
    await prisma.payment.update({
      where: { order_id: orderId },
      data: {
        status: 'FAILED',
        failure_code: data.failureCode,
        failure_message: data.failureMessage,
      },
    });

    console.log(`[TossPayments Webhook] Order failed: ${orderId}`);
  } catch (error) {
    console.error(`[TossPayments Webhook] Error handling failed payment ${orderId}:`, error);
    throw error;
  }
}

/**
 * Handle refund succeeded event
 */
async function handleRefundSucceeded(event: any) {
  const { paymentId, data } = event;

  try {
    // Find payment by provider payment ID
    const payment = await prisma.payment.findUnique({
      where: { provider_payment_id: paymentId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      console.error(`[TossPayments Webhook] Payment not found: ${paymentId}`);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REFUNDED',
      },
    });

    // Update refund status if exists
    if (payment.order.refund_requested) {
      await prisma.refund.updateMany({
        where: { order_id: payment.order_id },
        data: {
          status: 'SUCCEEDED',
        },
      });
    }

    console.log(`[TossPayments Webhook] Refund processed: ${paymentId}`);
  } catch (error) {
    console.error(`[TossPayments Webhook] Error handling refund ${paymentId}:`, error);
    throw error;
  }
}

// ============================================================================
// CONFIG
// ============================================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

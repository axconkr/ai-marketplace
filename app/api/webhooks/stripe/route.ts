/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */

import { NextRequest } from 'next/server';
import { stripeProvider } from '@/lib/payment';
import { completeOrder } from '@/lib/services/order';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook signature and parse event
    const event = await stripeProvider.handleWebhook(request);

    console.log(`[Stripe Webhook] Received event: ${event.type}`, {
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
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    // 3. Return success response
    return successResponse({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
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

/**
 * Handle payment succeeded event
 */
async function handlePaymentSucceeded(event: any) {
  const { orderId, paymentId, data } = event;

  if (!orderId) {
    console.error('[Stripe Webhook] Missing orderId in payment.succeeded event');
    return;
  }

  try {
    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error(`[Stripe Webhook] Order not found: ${orderId}`);
      return;
    }

    // Skip if already paid
    if (order.status === 'PAID' || order.status === 'COMPLETED') {
      console.log(`[Stripe Webhook] Order already paid: ${orderId}`);
      return;
    }

    // Extract payment method info
    const paymentMethod = data.paymentMethod
      ? await getPaymentMethodInfo(data.paymentMethod)
      : undefined;

    // Complete order
    await completeOrder({
      orderId,
      paymentId,
      paymentMethod,
    });

    console.log(`[Stripe Webhook] Order completed: ${orderId}`);
  } catch (error) {
    console.error(`[Stripe Webhook] Error completing order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(event: any) {
  const { orderId, data } = event;

  if (!orderId) {
    console.error('[Stripe Webhook] Missing orderId in payment.failed event');
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

    console.log(`[Stripe Webhook] Order failed: ${orderId}`);
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling failed payment ${orderId}:`, error);
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
      console.error(`[Stripe Webhook] Payment not found: ${paymentId}`);
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

    console.log(`[Stripe Webhook] Refund processed: ${paymentId}`);
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling refund ${paymentId}:`, error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get payment method info from Stripe
 */
async function getPaymentMethodInfo(paymentMethodId: string) {
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    return {
      type: paymentMethod.type,
      last4: paymentMethod.card?.last4,
      brand: paymentMethod.card?.brand,
    };
  } catch (error) {
    console.error('[Stripe Webhook] Error fetching payment method:', error);
    return undefined;
  }
}

// ============================================================================
// CONFIG
// ============================================================================

// Disable body parsing for webhook signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

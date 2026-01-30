import Stripe from 'stripe';
import { EscrowService } from './service';

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }
  return stripeInstance;
}

export interface CreateEscrowPaymentParams {
  escrowId: string;
  amount: number;
  buyerEmail: string;
  requestTitle: string;
  metadata?: Record<string, string>;
}

/**
 * Create a payment intent for escrow
 */
export async function createEscrowPaymentIntent(
  params: CreateEscrowPaymentParams
) {
  const { escrowId, amount, buyerEmail, requestTitle, metadata } = params;

  try {
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: amount, // Amount in smallest currency unit (e.g., cents for USD, won for KRW)
      currency: 'krw',
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Escrow payment for: ${requestTitle}`,
      metadata: {
        escrowId,
        type: 'development_request_escrow',
        ...metadata,
      },
      receipt_email: buyerEmail,
      // Hold the funds (authorized but not captured immediately)
      capture_method: 'manual',
    });

    // Update escrow with payment intent
    await EscrowService.updateEscrowWithPayment(escrowId, paymentIntent.id);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Capture (release) the held payment
 */
export async function captureEscrowPayment(paymentIntentId: string) {
  try {
    const paymentIntent = await getStripe().paymentIntents.capture(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment capture error:', error);
    throw new Error('Failed to capture payment');
  }
}

/**
 * Cancel (refund) the held payment
 */
export async function cancelEscrowPayment(paymentIntentId: string) {
  try {
    const paymentIntent = await getStripe().paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment cancel error:', error);
    throw new Error('Failed to cancel payment');
  }
}

/**
 * Get payment intent status
 */
export async function getPaymentIntentStatus(paymentIntentId: string) {
  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      captureMethod: paymentIntent.capture_method,
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    console.error('Stripe payment intent retrieval error:', error);
    throw new Error('Failed to retrieve payment intent');
  }
}

export { getStripe };

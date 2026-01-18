/**
 * Stripe Payment Provider
 * Implements payment processing using Stripe
 */

import Stripe from 'stripe';
import {
  IPaymentProvider,
  CreatePaymentParams,
  PaymentIntent,
  ConfirmPaymentParams,
  PaymentResult,
  RefundParams,
  RefundResult,
  PaymentDetails,
  WebhookEvent,
  PaymentError,
  PaymentProcessingError,
  RefundError,
  WebhookError,
} from './types';

// ============================================================================
// STRIPE CLIENT
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// ============================================================================
// STRIPE PROVIDER
// ============================================================================

export class StripeProvider implements IPaymentProvider {
  /**
   * Create a Stripe PaymentIntent
   */
  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    try {
      // Create or retrieve customer
      const customer = await this.getOrCreateCustomer(params.customerEmail, params.customerName);

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency.toLowerCase(),
        customer: customer.id,
        metadata: {
          orderId: params.orderId,
          productId: params.productId,
          productName: params.productName,
          customerId: params.customerId,
          ...params.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
        description: `Purchase: ${params.productName}`,
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      console.error('Stripe createPaymentIntent error:', error);
      throw new PaymentProcessingError(
        'Failed to create payment intent',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Confirm a Stripe payment
   */
  async confirmPayment(params: ConfirmPaymentParams): Promise<PaymentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(params.paymentId);

      // If payment method provided, confirm the payment
      if (params.paymentMethodId && paymentIntent.status === 'requires_payment_method') {
        const confirmed = await stripe.paymentIntents.confirm(params.paymentId, {
          payment_method: params.paymentMethodId,
        });
        return this.mapPaymentIntentToResult(confirmed);
      }

      return this.mapPaymentIntentToResult(paymentIntent);
    } catch (error) {
      console.error('Stripe confirmPayment error:', error);
      throw new PaymentProcessingError(
        'Failed to confirm payment',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Refund a Stripe payment
   */
  async refundPayment(params: RefundParams): Promise<RefundResult> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: params.paymentId,
        amount: params.amount, // Optional: undefined = full refund
        reason: params.reason as Stripe.RefundCreateParams.Reason | undefined,
      });

      return {
        id: refund.id,
        status: refund.status === 'succeeded' ? 'succeeded' : 'pending',
        amount: refund.amount,
        currency: refund.currency.toUpperCase(),
        reason: refund.reason || undefined,
      };
    } catch (error) {
      console.error('Stripe refundPayment error:', error);
      throw new RefundError(
        'Failed to process refund',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Get Stripe payment details
   */
  async getPayment(paymentId: string): Promise<PaymentDetails> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId, {
        expand: ['payment_method', 'customer'],
      });

      const paymentMethod = paymentIntent.payment_method as Stripe.PaymentMethod | null;
      const customer = paymentIntent.customer as Stripe.Customer | null;

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status,
        paymentMethod: paymentMethod
          ? {
              type: paymentMethod.type,
              last4: paymentMethod.card?.last4,
              brand: paymentMethod.card?.brand,
            }
          : undefined,
        customer: customer
          ? {
              id: customer.id,
              email: customer.email || undefined,
              name: customer.name || undefined,
            }
          : undefined,
        metadata: paymentIntent.metadata,
        createdAt: new Date(paymentIntent.created * 1000),
      };
    } catch (error) {
      console.error('Stripe getPayment error:', error);
      throw new PaymentError(
        'Failed to retrieve payment',
        'PAYMENT_NOT_FOUND',
        404,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(request: Request): Promise<WebhookEvent> {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      throw new WebhookError('Missing Stripe signature');
    }

    const body = await request.text();

    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      return this.processWebhookEvent(event);
    } catch (error) {
      console.error('Stripe webhook verification failed:', error);
      throw new WebhookError(
        'Webhook signature verification failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  async verifyWebhookSignature(request: Request): Promise<boolean> {
    try {
      const signature = request.headers.get('stripe-signature');
      if (!signature) return false;

      const body = await request.text();
      stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

      return true;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get or create Stripe customer
   */
  private async getOrCreateCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    // Search for existing customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return stripe.customers.create({
      email,
      name,
    });
  }

  /**
   * Map Stripe PaymentIntent to PaymentResult
   */
  private mapPaymentIntentToResult(paymentIntent: Stripe.PaymentIntent): PaymentResult {
    const paymentMethod = paymentIntent.payment_method as Stripe.PaymentMethod | undefined;

    return {
      id: paymentIntent.id,
      status:
        paymentIntent.status === 'succeeded'
          ? 'succeeded'
          : paymentIntent.status === 'processing'
            ? 'processing'
            : 'failed',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      paymentMethod: paymentMethod
        ? {
            type: paymentMethod.type,
            last4: paymentMethod.card?.last4,
            brand: paymentMethod.card?.brand,
          }
        : undefined,
      failureCode: paymentIntent.last_payment_error?.code || undefined,
      failureMessage: paymentIntent.last_payment_error?.message || undefined,
      metadata: paymentIntent.metadata,
    };
  }

  /**
   * Process Stripe webhook event
   */
  private processWebhookEvent(event: Stripe.Event): WebhookEvent {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        return {
          type: 'payment.succeeded',
          provider: 'stripe',
          paymentId: paymentIntent.id,
          orderId: paymentIntent.metadata.orderId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency.toUpperCase(),
          status: paymentIntent.status,
          data: {
            paymentMethod: paymentIntent.payment_method,
            customer: paymentIntent.customer,
          },
        };
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        return {
          type: 'payment.failed',
          provider: 'stripe',
          paymentId: paymentIntent.id,
          orderId: paymentIntent.metadata.orderId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency.toUpperCase(),
          status: paymentIntent.status,
          data: {
            failureCode: paymentIntent.last_payment_error?.code,
            failureMessage: paymentIntent.last_payment_error?.message,
          },
        };
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        return {
          type: 'refund.succeeded',
          provider: 'stripe',
          paymentId: charge.payment_intent as string,
          amount: charge.amount_refunded,
          currency: charge.currency.toUpperCase(),
          status: 'refunded',
          data: {
            refundId: charge.refunds?.data[0]?.id,
            reason: charge.refunds?.data[0]?.reason,
          },
        };
      }

      default:
        throw new WebhookError(`Unhandled event type: ${event.type}`);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const stripeProvider = new StripeProvider();

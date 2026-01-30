/**
 * TossPayments Provider
 * Implements payment processing using TossPayments (Korea)
 */

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
// TOSS CONFIGURATION
// ============================================================================

const TOSS_API_URL = 'https://api.tosspayments.com/v1';
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!;

// Create Basic Auth header
const getAuthHeader = () => {
  const encoded = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');
  return `Basic ${encoded}`;
};

// ============================================================================
// TOSS PROVIDER
// ============================================================================

export class TossPaymentsProvider implements IPaymentProvider {
  /**
   * Create a TossPayments payment
   */
  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    try {
      // TossPayments uses client-side payment widget
      // Server just needs to generate unique orderId and return payment info
      // Actual payment creation happens on client-side

      // Generate client secret (orderId for TossPayments)
      const clientSecret = `${params.orderId}_${Date.now()}`;

      return {
        id: params.orderId, // Will be replaced by actual paymentKey after confirmation
        clientSecret,
        amount: params.amount,
        currency: params.currency,
        status: 'pending',
        metadata: {
          orderId: params.orderId,
          productId: params.productId,
          productName: params.productName,
          customerId: params.customerId,
          customerEmail: params.customerEmail,
          ...params.metadata,
        },
      };
    } catch (error) {
      console.error('TossPayments createPaymentIntent error:', error);
      throw new PaymentProcessingError(
        'Failed to create payment intent',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Confirm a TossPayments payment
   * Called after user completes payment on client-side
   */
  async confirmPayment(params: ConfirmPaymentParams): Promise<PaymentResult> {
    try {
      if (!params.orderId || !params.amount) {
        throw new PaymentProcessingError('OrderId and amount required for TossPayments confirmation');
      }

      // Confirm payment with TossPayments
      const response = await fetch(`${TOSS_API_URL}/payments/confirm`, {
        method: 'POST',
        headers: {
          Authorization: getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey: params.paymentId,
          orderId: params.orderId,
          amount: params.amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new PaymentProcessingError(
          error.message || 'Payment confirmation failed',
          error.code
        );
      }

      const payment = await response.json();
      return this.mapTossPaymentToResult(payment);
    } catch (error) {
      console.error('TossPayments confirmPayment error:', error);
      if (error instanceof PaymentProcessingError) {
        throw error;
      }
      throw new PaymentProcessingError(
        'Failed to confirm payment',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Refund a TossPayments payment
   */
  async refundPayment(params: RefundParams): Promise<RefundResult> {
    try {
      const response = await fetch(`${TOSS_API_URL}/payments/${params.paymentId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason: params.reason || 'Customer requested refund',
          ...(params.amount && { cancelAmount: params.amount }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new RefundError(error.message || 'Refund failed', error.code);
      }

      const refund = await response.json();

      return {
        id: refund.cancels?.[0]?.transactionKey || refund.paymentKey,
        status: refund.status === 'CANCELED' ? 'succeeded' : 'pending',
        amount: refund.cancels?.[0]?.cancelAmount || refund.balanceAmount,
        currency: refund.currency,
        reason: params.reason,
      };
    } catch (error) {
      console.error('TossPayments refundPayment error:', error);
      if (error instanceof RefundError) {
        throw error;
      }
      throw new RefundError(
        'Failed to process refund',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Get TossPayments payment details
   */
  async getPayment(paymentId: string): Promise<PaymentDetails> {
    try {
      const response = await fetch(`${TOSS_API_URL}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          Authorization: getAuthHeader(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new PaymentError(
          error.message || 'Payment not found',
          'PAYMENT_NOT_FOUND',
          404,
          error.code
        );
      }

      const payment = await response.json();

      return {
        id: payment.paymentKey,
        amount: payment.totalAmount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: {
          type: payment.method,
          last4: payment.card?.number,
          brand: payment.card?.company,
        },
        customer: {
          id: payment.orderId,
          email: payment.customerEmail,
          name: payment.customerName,
        },
        metadata: {
          orderId: payment.orderId,
          orderName: payment.orderName,
        },
        createdAt: new Date(payment.approvedAt || payment.requestedAt),
      };
    } catch (error) {
      console.error('TossPayments getPayment error:', error);
      if (error instanceof PaymentError) {
        throw error;
      }
      throw new PaymentError(
        'Failed to retrieve payment',
        'PAYMENT_NOT_FOUND',
        404,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

   /**
    * Handle TossPayments webhook
    */
   async handleWebhook(request: Request): Promise<WebhookEvent> {
     try {
       // Clone request for signature verification (body can only be read once)
       const clonedRequest = request.clone();

       const isValid = await this.verifyWebhookSignature(clonedRequest);
       if (!isValid) {
         throw new WebhookError('Invalid webhook signature');
       }

       const body = await request.json();

       // Verify webhook payload structure
       if (!body.eventType || !body.data) {
         throw new WebhookError('Invalid webhook payload');
       }

       return this.processWebhookEvent(body);
     } catch (error) {
       console.error('TossPayments webhook error:', error);
       if (error instanceof WebhookError) {
         throw error;
       }
       throw new WebhookError(
         'Failed to process webhook',
         error instanceof Error ? error.message : 'Unknown error'
       );
     }
   }

   /**
    * Verify TossPayments webhook signature
    */
   async verifyWebhookSignature(request: Request): Promise<boolean> {
     try {
       const signature = request.headers.get('Toss-Signature');
       if (!signature) return false;

       const webhookSecret = process.env.TOSS_WEBHOOK_SECRET;
       if (!webhookSecret) {
         console.error('TOSS_WEBHOOK_SECRET not configured');
         return false;
       }

       const body = await request.text();
       const encoder = new TextEncoder();
       const key = await crypto.subtle.importKey(
         'raw',
         encoder.encode(webhookSecret),
         { name: 'HMAC', hash: 'SHA-256' },
         false,
         ['sign']
       );

       const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
       const computedSignature = Buffer.from(signatureBytes).toString('base64');

       return computedSignature === signature;
     } catch (error) {
       console.error('Webhook signature verification failed:', error);
       return false;
     }
   }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Map TossPayments payment to PaymentResult
   */
  private mapTossPaymentToResult(payment: any): PaymentResult {
    const status =
      payment.status === 'DONE'
        ? 'succeeded'
        : payment.status === 'IN_PROGRESS'
          ? 'processing'
          : 'failed';

    return {
      id: payment.paymentKey,
      status,
      amount: payment.totalAmount,
      currency: payment.currency,
      paymentMethod: payment.card
        ? {
            type: 'card',
            last4: payment.card.number,
            brand: payment.card.company,
          }
        : payment.virtualAccount
          ? {
              type: 'virtual_account',
              last4: payment.virtualAccount.accountNumber,
              brand: payment.virtualAccount.bank,
            }
          : undefined,
      failureCode: payment.failure?.code,
      failureMessage: payment.failure?.message,
      metadata: {
        orderId: payment.orderId,
        orderName: payment.orderName,
      },
    };
  }

  /**
   * Process TossPayments webhook event
   */
  private processWebhookEvent(body: any): WebhookEvent {
    const { eventType, data } = body;

    switch (eventType) {
      case 'PAYMENT_DONE': {
        return {
          type: 'payment.succeeded',
          provider: 'toss',
          paymentId: data.paymentKey,
          orderId: data.orderId,
          amount: data.totalAmount,
          currency: data.currency,
          status: data.status,
          data: {
            paymentMethod: data.method,
            approvedAt: data.approvedAt,
          },
        };
      }

      case 'PAYMENT_FAILED': {
        return {
          type: 'payment.failed',
          provider: 'toss',
          paymentId: data.paymentKey,
          orderId: data.orderId,
          amount: data.totalAmount,
          currency: data.currency,
          status: data.status,
          data: {
            failureCode: data.failure?.code,
            failureMessage: data.failure?.message,
          },
        };
      }

      case 'PAYMENT_CANCELED': {
        return {
          type: 'refund.succeeded',
          provider: 'toss',
          paymentId: data.paymentKey,
          orderId: data.orderId,
          amount: data.cancels?.[0]?.cancelAmount || 0,
          currency: data.currency,
          status: data.status,
          data: {
            cancelReason: data.cancels?.[0]?.cancelReason,
            canceledAt: data.cancels?.[0]?.canceledAt,
          },
        };
      }

      default:
        throw new WebhookError(`Unhandled event type: ${eventType}`);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const tossPaymentsProvider = new TossPaymentsProvider();

/**
 * Payment Provider Types
 * Shared types and interfaces for payment system
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type PaymentProvider = 'stripe' | 'toss';
export type PaymentCurrency = 'USD' | 'EUR' | 'KRW';
export type PaymentMethod = 'card' | 'bank_transfer' | 'virtual_account';

// ============================================================================
// PAYMENT INTERFACES
// ============================================================================

export interface CreatePaymentParams {
  amount: number; // Amount in smallest currency unit (cents/won)
  currency: PaymentCurrency;
  orderId: string;
  customerId: string;
  customerEmail: string;
  customerName?: string;
  productId: string;
  productName: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntent {
  id: string; // Provider payment ID
  clientSecret: string; // For frontend payment confirmation
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, any>;
}

export interface ConfirmPaymentParams {
  paymentId: string;
  paymentMethodId?: string; // For Stripe
  orderId?: string; // For TossPayments
  amount?: number; // For TossPayments verification
}

export interface PaymentResult {
  id: string;
  status: 'succeeded' | 'processing' | 'failed';
  amount: number;
  currency: string;
  paymentMethod?: {
    type: string;
    last4?: string;
    brand?: string;
  };
  failureCode?: string;
  failureMessage?: string;
  metadata?: Record<string, any>;
}

export interface RefundParams {
  paymentId: string;
  amount?: number; // Optional for partial refund
  reason?: string;
}

export interface RefundResult {
  id: string;
  status: 'succeeded' | 'pending' | 'failed';
  amount: number;
  currency: string;
  reason?: string;
  failureReason?: string;
}

export interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: {
    type: string;
    last4?: string;
    brand?: string;
  };
  customer?: {
    id: string;
    email?: string;
    name?: string;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export type WebhookEventType =
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.cancelled'
  | 'refund.succeeded'
  | 'refund.failed';

export interface WebhookEvent {
  type: WebhookEventType;
  provider: PaymentProvider;
  paymentId: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: string;
  data: Record<string, any>;
}

// ============================================================================
// PROVIDER INTERFACE
// ============================================================================

export interface IPaymentProvider {
  /**
   * Create a payment intent
   */
  createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent>;

  /**
   * Confirm a payment
   */
  confirmPayment(params: ConfirmPaymentParams): Promise<PaymentResult>;

  /**
   * Refund a payment (full or partial)
   */
  refundPayment(params: RefundParams): Promise<RefundResult>;

  /**
   * Get payment details
   */
  getPayment(paymentId: string): Promise<PaymentDetails>;

  /**
   * Handle webhook events
   */
  handleWebhook(request: Request): Promise<WebhookEvent>;

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(request: Request): Promise<boolean>;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class PaymentValidationError extends PaymentError {
  constructor(message: string, details?: any) {
    super(message, 'PAYMENT_VALIDATION_ERROR', 400, details);
    this.name = 'PaymentValidationError';
  }
}

export class PaymentProcessingError extends PaymentError {
  constructor(message: string, details?: any) {
    super(message, 'PAYMENT_PROCESSING_ERROR', 500, details);
    this.name = 'PaymentProcessingError';
  }
}

export class RefundError extends PaymentError {
  constructor(message: string, details?: any) {
    super(message, 'REFUND_ERROR', 500, details);
    this.name = 'RefundError';
  }
}

export class WebhookError extends PaymentError {
  constructor(message: string, details?: any) {
    super(message, 'WEBHOOK_ERROR', 400, details);
    this.name = 'WebhookError';
  }
}

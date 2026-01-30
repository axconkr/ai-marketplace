/**
 * Stripe Payment Provider Tests
 * Tests for Stripe payment integration
 */

import { StripeProvider } from '@/lib/payment/stripe';
import {
  CreatePaymentParams,
  ConfirmPaymentParams,
  RefundParams,
  PaymentProcessingError,
  RefundError,
  PaymentError,
  WebhookError,
} from '@/lib/payment/types';

const stripeMock = jest.requireMock('stripe') as { default: jest.Mock };
const mockStripeInstance = stripeMock.default();

describe('StripeProvider', () => {
  let provider: StripeProvider;
  let mockStripe: typeof mockStripeInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    stripeMock.default.mockReturnValue(mockStripeInstance);
    mockStripe = mockStripeInstance;
    provider = new StripeProvider();
  });

  describe('createPaymentIntent', () => {
    const createParams: CreatePaymentParams = {
      orderId: 'order-123',
      productId: 'product-123',
      productName: 'Test Product',
      customerId: 'customer-123',
      customerEmail: 'test@example.com',
      customerName: 'Test User',
      amount: 9900,
      currency: 'USD',
      metadata: {},
    };

    it('should create payment intent successfully', async () => {
      const mockCustomer = { id: 'cus_123', email: 'test@example.com' };
      const mockPaymentIntent = {
        id: 'pi_123',
        client_secret: 'pi_123_secret',
        amount: 9900,
        currency: 'usd',
        status: 'requires_payment_method',
        metadata: { orderId: 'order-123' },
      };

      mockStripe.customers.list.mockResolvedValue({
        data: [mockCustomer],
      } as any);
      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as any);

      const result = await provider.createPaymentIntent(createParams);

      expect(result.id).toBe('pi_123');
      expect(result.clientSecret).toBe('pi_123_secret');
      expect(result.amount).toBe(9900);
      expect(result.currency).toBe('USD');
      expect(mockStripe.customers.list).toHaveBeenCalledWith({
        email: 'test@example.com',
        limit: 1,
      });
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 9900,
          currency: 'usd',
          customer: 'cus_123',
        })
      );
    });

    it('should create new customer if not exists', async () => {
      const mockNewCustomer = { id: 'cus_new', email: 'test@example.com' };
      const mockPaymentIntent = {
        id: 'pi_123',
        client_secret: 'pi_123_secret',
        amount: 9900,
        currency: 'usd',
        status: 'requires_payment_method',
        metadata: {},
      };

      mockStripe.customers.list.mockResolvedValue({ data: [] } as any);
      mockStripe.customers.create.mockResolvedValue(mockNewCustomer as any);
      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as any);

      await provider.createPaymentIntent(createParams);

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_new',
        })
      );
    });

    it('should throw PaymentProcessingError on failure', async () => {
      mockStripe.customers.list.mockRejectedValue(new Error('Stripe API error'));

      await expect(provider.createPaymentIntent(createParams)).rejects.toThrow(
        PaymentProcessingError
      );
    });

    it('should handle different currencies', async () => {
      const mockCustomer = { id: 'cus_123' };
      const mockPaymentIntent = {
        id: 'pi_123',
        client_secret: 'pi_123_secret',
        amount: 990000,
        currency: 'krw',
        status: 'requires_payment_method',
        metadata: {},
      };

      mockStripe.customers.list.mockResolvedValue({ data: [mockCustomer] } as any);
      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as any);

      const result = await provider.createPaymentIntent({
        ...createParams,
        amount: 990000,
        currency: 'KRW',
      });

      expect(result.currency).toBe('KRW');
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'krw',
        })
      );
    });
  });

  describe('confirmPayment', () => {
    const confirmParams: ConfirmPaymentParams = {
      paymentId: 'pi_123',
    };

    it('should confirm payment successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        status: 'succeeded',
        amount: 9900,
        currency: 'usd',
        payment_method: {
          type: 'card',
          card: { last4: '4242', brand: 'visa' },
        },
        metadata: {},
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent as any);

      const result = await provider.confirmPayment(confirmParams);

      expect(result.status).toBe('succeeded');
      expect(result.amount).toBe(9900);
    });

    it('should confirm with payment method if provided', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        status: 'requires_payment_method',
        amount: 9900,
        currency: 'usd',
        metadata: {},
      };

      const mockConfirmedIntent = {
        ...mockPaymentIntent,
        status: 'succeeded',
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent as any);
      mockStripe.paymentIntents.confirm.mockResolvedValue(mockConfirmedIntent as any);

      const result = await provider.confirmPayment({
        paymentId: 'pi_123',
        paymentMethodId: 'pm_123',
      });

      expect(mockStripe.paymentIntents.confirm).toHaveBeenCalledWith('pi_123', {
        payment_method: 'pm_123',
      });
      expect(result.status).toBe('succeeded');
    });

    it('should handle failed payment', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        status: 'requires_payment_method',
        amount: 9900,
        currency: 'usd',
        last_payment_error: {
          code: 'card_declined',
          message: 'Your card was declined',
        },
        metadata: {},
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent as any);

      const result = await provider.confirmPayment(confirmParams);

      expect(result.status).toBe('failed');
      expect(result.failureCode).toBe('card_declined');
      expect(result.failureMessage).toBe('Your card was declined');
    });

    it('should throw PaymentProcessingError on API failure', async () => {
      mockStripe.paymentIntents.retrieve.mockRejectedValue(new Error('API error'));

      await expect(provider.confirmPayment(confirmParams)).rejects.toThrow(
        PaymentProcessingError
      );
    });
  });

  describe('refundPayment', () => {
    const refundParams: RefundParams = {
      paymentId: 'pi_123',
    };

    it('should create full refund successfully', async () => {
      const mockRefund = {
        id: 'ref_123',
        status: 'succeeded',
        amount: 9900,
        currency: 'usd',
        reason: null,
      };

      mockStripe.refunds.create.mockResolvedValue(mockRefund as any);

      const result = await provider.refundPayment(refundParams);

      expect(result.id).toBe('ref_123');
      expect(result.status).toBe('succeeded');
      expect(result.amount).toBe(9900);
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: undefined,
        reason: undefined,
      });
    });

    it('should create partial refund with amount', async () => {
      const mockRefund = {
        id: 'ref_123',
        status: 'succeeded',
        amount: 5000,
        currency: 'usd',
        reason: 'requested_by_customer',
      };

      mockStripe.refunds.create.mockResolvedValue(mockRefund as any);

      const result = await provider.refundPayment({
        paymentId: 'pi_123',
        amount: 5000,
        reason: 'requested_by_customer',
      });

      expect(result.amount).toBe(5000);
      expect(result.reason).toBe('requested_by_customer');
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: 5000,
        reason: 'requested_by_customer',
      });
    });

    it('should handle pending refund status', async () => {
      const mockRefund = {
        id: 'ref_123',
        status: 'pending',
        amount: 9900,
        currency: 'usd',
      };

      mockStripe.refunds.create.mockResolvedValue(mockRefund as any);

      const result = await provider.refundPayment(refundParams);

      expect(result.status).toBe('pending');
    });

    it('should throw RefundError on failure', async () => {
      mockStripe.refunds.create.mockRejectedValue(new Error('Refund failed'));

      await expect(provider.refundPayment(refundParams)).rejects.toThrow(RefundError);
    });
  });

  describe('getPayment', () => {
    it('should retrieve payment details successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        amount: 9900,
        currency: 'usd',
        status: 'succeeded',
        payment_method: {
          type: 'card',
          card: { last4: '4242', brand: 'visa' },
        },
        customer: {
          id: 'cus_123',
          email: 'test@example.com',
          name: 'Test User',
        },
        metadata: { orderId: 'order-123' },
        created: 1640000000,
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent as any);

      const result = await provider.getPayment('pi_123');

      expect(result.id).toBe('pi_123');
      expect(result.amount).toBe(9900);
      expect(result.currency).toBe('USD');
      expect(result.status).toBe('succeeded');
      expect(result.paymentMethod?.type).toBe('card');
      expect(result.paymentMethod?.last4).toBe('4242');
      expect(result.customer?.email).toBe('test@example.com');
    });

    it('should throw PaymentError when payment not found', async () => {
      mockStripe.paymentIntents.retrieve.mockRejectedValue({
        type: 'StripeInvalidRequestError',
        message: 'Payment not found',
      });

      await expect(provider.getPayment('pi_invalid')).rejects.toThrow(PaymentError);
    });
  });

  describe('handleWebhook', () => {
    it('should handle payment_intent.succeeded event', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            amount: 9900,
            currency: 'usd',
            status: 'succeeded',
            metadata: { orderId: 'order-123' },
            payment_method: 'pm_123',
            customer: 'cus_123',
          },
        },
      };

      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue('signature') },
        text: jest.fn().mockResolvedValue(JSON.stringify(mockEvent)),
      } as any;

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any);

      const result = await provider.handleWebhook(mockRequest);

      expect(result.type).toBe('payment.succeeded');
      expect(result.provider).toBe('stripe');
      expect(result.paymentId).toBe('pi_123');
      expect(result.orderId).toBe('order-123');
      expect(result.amount).toBe(9900);
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const mockEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_123',
            amount: 9900,
            currency: 'usd',
            status: 'failed',
            metadata: { orderId: 'order-123' },
            last_payment_error: {
              code: 'card_declined',
              message: 'Card was declined',
            },
          },
        },
      };

      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue('signature') },
        text: jest.fn().mockResolvedValue(JSON.stringify(mockEvent)),
      } as any;

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any);

      const result = await provider.handleWebhook(mockRequest);

      expect(result.type).toBe('payment.failed');
      expect(result.data.failureCode).toBe('card_declined');
    });

    it('should handle charge.refunded event', async () => {
      const mockEvent = {
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_123',
            payment_intent: 'pi_123',
            amount_refunded: 9900,
            currency: 'usd',
            refunds: {
              data: [{ id: 'ref_123', reason: 'requested_by_customer' }],
            },
          },
        },
      };

      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue('signature') },
        text: jest.fn().mockResolvedValue(JSON.stringify(mockEvent)),
      } as any;

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any);

      const result = await provider.handleWebhook(mockRequest);

      expect(result.type).toBe('refund.succeeded');
      expect(result.amount).toBe(9900);
    });

    it('should throw WebhookError for missing signature', async () => {
      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue(null) },
        text: jest.fn().mockResolvedValue('{}'),
      } as any;

      await expect(provider.handleWebhook(mockRequest)).rejects.toThrow(WebhookError);
    });

    it('should throw WebhookError for invalid signature', async () => {
      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue('invalid-signature') },
        text: jest.fn().mockResolvedValue('{}'),
      } as any;

      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(provider.handleWebhook(mockRequest)).rejects.toThrow(WebhookError);
    });

    it('should throw WebhookError for unhandled event type', async () => {
      const mockEvent = {
        type: 'invoice.created',
        data: { object: {} },
      };

      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue('signature') },
        text: jest.fn().mockResolvedValue(JSON.stringify(mockEvent)),
      } as any;

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any);

      await expect(provider.handleWebhook(mockRequest)).rejects.toThrow(WebhookError);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should return true for valid signature', async () => {
      const mockEvent = { type: 'test', data: {} };
      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue('valid-signature') },
        text: jest.fn().mockResolvedValue(JSON.stringify(mockEvent)),
      } as any;

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any);

      const result = await provider.verifyWebhookSignature(mockRequest);

      expect(result).toBe(true);
    });

    it('should return false for invalid signature', async () => {
      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue('invalid-signature') },
        text: jest.fn().mockResolvedValue('{}'),
      } as any;

      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const result = await provider.verifyWebhookSignature(mockRequest);

      expect(result).toBe(false);
    });

    it('should return false for missing signature', async () => {
      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue(null) },
        text: jest.fn().mockResolvedValue('{}'),
      } as any;

      const result = await provider.verifyWebhookSignature(mockRequest);

      expect(result).toBe(false);
    });
  });
});

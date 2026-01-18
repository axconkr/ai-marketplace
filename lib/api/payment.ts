/**
 * Payment API Client
 * Client-side functions for payment operations with enhanced error handling
 */

import { apiFetch } from './error-handler';

export interface CreatePaymentParams {
  productId: string;
  buyerName: string;
  buyerEmail: string;
  currency?: string;
}

export interface CreatePaymentResponse {
  orderId: string;
  clientSecret?: string; // For Stripe
  paymentKey?: string; // For TossPayments
  amount: number;
  currency: string;
  provider: 'stripe' | 'toss';
}

export interface ConfirmPaymentParams {
  orderId: string;
  paymentIntentId?: string; // Stripe
  paymentKey?: string; // Toss
}

export interface RefundParams {
  orderId: string;
  reason: string;
}

/**
 * Create a payment intent/order
 */
export async function createPayment(
  params: CreatePaymentParams
): Promise<CreatePaymentResponse> {
  return apiFetch<CreatePaymentResponse>('/payments/create', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Confirm payment completion
 */
export async function confirmPayment(
  params: ConfirmPaymentParams
): Promise<void> {
  await apiFetch<void>('/payments/confirm', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Request a refund
 */
export async function requestRefund(params: RefundParams): Promise<void> {
  await apiFetch<void>(`/payments/refund/${params.orderId}`, {
    method: 'POST',
    body: JSON.stringify({ reason: params.reason }),
  });
}

/**
 * Get payment status
 */
export async function getPaymentStatus(orderId: string): Promise<any> {
  return apiFetch<any>(`/payments/${orderId}`);
}

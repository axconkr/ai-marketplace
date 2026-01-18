/**
 * Payment Provider Factory
 * Centralized access to payment providers
 */

import { IPaymentProvider, PaymentProvider, PaymentCurrency } from './types';
import { stripeProvider } from './stripe';
import { tossPaymentsProvider } from './toss';

// ============================================================================
// PROVIDER FACTORY
// ============================================================================

/**
 * Get payment provider based on currency
 */
export function getPaymentProvider(currency: PaymentCurrency): IPaymentProvider {
  // Use TossPayments for Korean Won, Stripe for everything else
  if (currency === 'KRW') {
    return tossPaymentsProvider;
  }
  return stripeProvider;
}

/**
 * Get payment provider by name
 */
export function getProviderByName(provider: PaymentProvider): IPaymentProvider {
  switch (provider) {
    case 'stripe':
      return stripeProvider;
    case 'toss':
      return tossPaymentsProvider;
    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
}

/**
 * Determine provider name from currency
 */
export function getProviderName(currency: PaymentCurrency): PaymentProvider {
  return currency === 'KRW' ? 'toss' : 'stripe';
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from './types';
export { stripeProvider } from './stripe';
export { tossPaymentsProvider } from './toss';

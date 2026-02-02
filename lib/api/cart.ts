/**
 * Cart API Client
 * Client-side functions for cart checkout operations
 */

import { apiFetch } from './error-handler';

// ============================================================================
// TYPES
// ============================================================================

export interface CartItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  verification_level: number;
  seller: {
    name: string;
    seller_tier?: string;
  };
  quantity: number;
}

export interface CartCheckoutResponse {
  checkoutSessionId: string;
  orders: Array<{
    id: string;
    productId: string;
    amount: number;
  }>;
  paymentIntent: {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
  };
  totalAmount: number;
  currency: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Create a checkout session for multiple cart items
 */
export async function checkoutCart(
  items: CartItem[],
  customerName?: string
): Promise<CartCheckoutResponse> {
  return apiFetch<CartCheckoutResponse>('/cart/checkout', {
    method: 'POST',
    body: JSON.stringify({
      items: items.map((item) => ({
        id: item.id,
        price: item.price,
        currency: item.currency,
      })),
      customerName,
    }),
  });
}

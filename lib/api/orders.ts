/**
 * Orders API Client
 * Client-side functions for order operations with enhanced error handling
 */

import { apiFetch } from './error-handler';

export interface Order {
  id: string;
  buyer_id: string;
  product_id: string;
  amount: number;
  currency: string;
  platform_fee: number;
  seller_amount: number;
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED' | 'FAILED';
  payment_provider?: string;
  refund_requested: boolean;
  refund_reason?: string;
  access_granted: boolean;
  download_url?: string;
  download_expires?: string;
  paid_at?: string;
  refunded_at?: string;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    files?: Array<{
      id: string;
      filename: string;
      original_name: string;
      url: string;
    }>;
  };
  payment?: {
    id: string;
    provider: string;
    payment_method?: string;
    card_last4?: string;
    card_brand?: string;
  };
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Get all orders for current user
 */
export async function getOrders(
  page = 1,
  pageSize = 10,
  status?: string
): Promise<OrdersResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (status) {
    params.append('status', status);
  }

  return apiFetch<OrdersResponse>(`/orders?${params}`);
}

/**
 * Get single order details
 */
export async function getOrder(orderId: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}`);
}

/**
 * Download product files for an order
 */
export async function downloadOrderFiles(orderId: string): Promise<string> {
  const data = await apiFetch<{ downloadUrl: string }>(`/orders/${orderId}/download`);
  return data.downloadUrl;
}

/**
 * Get receipt for an order
 */
export async function getReceipt(orderId: string): Promise<Blob> {
  // For blob responses, we need to handle differently
  const response = await apiFetch<Response>(`/orders/${orderId}/receipt`);
  return response.blob();
}

/**
 * Check if refund is eligible
 */
export async function checkRefundEligibility(orderId: string): Promise<{
  eligible: boolean;
  reason?: string;
  daysRemaining?: number;
}> {
  return apiFetch<{
    eligible: boolean;
    reason?: string;
    daysRemaining?: number;
  }>(`/orders/${orderId}/refund-eligibility`);
}

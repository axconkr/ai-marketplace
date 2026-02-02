/**
 * Orders Hooks
 * React Query hooks for order operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOrders,
  getOrder,
  downloadOrderFiles,
  getReceipt,
  checkRefundEligibility,
  Order,
} from '@/lib/api/orders';
import { apiFetch } from '@/lib/api/error-handler';

/**
 * Get all orders query
 */
export function useOrders(page = 1, pageSize = 10, status?: string) {
  return useQuery({
    queryKey: ['orders', page, pageSize, status],
    queryFn: () => getOrders(page, pageSize, status),
  });
}

/**
 * Get single order query
 */
export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
  });
}

/**
 * Download order files mutation
 */
export function useDownloadOrderFiles() {
  return useMutation({
    mutationFn: (orderId: string) => downloadOrderFiles(orderId),
    onSuccess: (downloadUrl) => {
      // Open download URL in new window
      window.open(downloadUrl, '_blank');
    },
  });
}

/**
 * Download receipt mutation
 */
export function useDownloadReceipt() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const blob = await getReceipt(orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

/**
 * Check refund eligibility query
 */
export function useRefundEligibility(orderId: string | null) {
  return useQuery({
    queryKey: ['refund-eligibility', orderId],
    queryFn: () => checkRefundEligibility(orderId!),
    enabled: !!orderId,
  });
}

/**
 * Get orders by checkout session ID
 */
export function useOrdersByCheckoutSession(sessionId: string | null) {
  return useQuery({
    queryKey: ['orders', 'checkout-session', sessionId],
    queryFn: () =>
      apiFetch<{ orders: Order[]; total: number }>(`/orders?checkoutSessionId=${sessionId}`),
    enabled: !!sessionId,
    select: (data) => data.orders,
  });
}

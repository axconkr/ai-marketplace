/**
 * Payment Hooks
 * React Query hooks for payment operations with error handling
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPayment,
  confirmPayment,
  requestRefund,
  getPaymentStatus,
  CreatePaymentParams,
  ConfirmPaymentParams,
  RefundParams,
} from '@/lib/api/payment';
import { useToast } from './use-toast';

/**
 * Create payment mutation
 */
export function useCreatePayment() {
  const { error } = useToast();

  return useMutation({
    mutationFn: (params: CreatePaymentParams) => createPayment(params),
    onError: (err: Error) => {
      error('결제 생성 실패', err.message);
    },
  });
}

/**
 * Confirm payment mutation
 */
export function useConfirmPayment() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (params: ConfirmPaymentParams) => confirmPayment(params),
    onSuccess: (_, variables) => {
      // Invalidate orders query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({
        queryKey: ['order', variables.orderId],
      });
      success('결제가 완료되었습니다', '주문이 성공적으로 처리되었습니다.');
    },
    onError: (err: Error) => {
      error('결제 확인 실패', err.message);
    },
  });
}

/**
 * Request refund mutation
 */
export function useRequestRefund() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (params: RefundParams) => requestRefund(params),
    onSuccess: (_, variables) => {
      // Invalidate orders query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({
        queryKey: ['order', variables.orderId],
      });
      success('환불이 요청되었습니다', '환불 처리가 시작되었습니다.');
    },
    onError: (err: Error) => {
      error('환불 요청 실패', err.message);
    },
  });
}

/**
 * Get payment status query
 */
export function usePaymentStatus(orderId: string | null) {
  return useQuery({
    queryKey: ['payment', orderId],
    queryFn: () => getPaymentStatus(orderId!),
    enabled: !!orderId,
  });
}

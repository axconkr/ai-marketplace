'use client';

import { useMutation } from '@tanstack/react-query';
import { checkoutCart, CartItem, CartCheckoutResponse } from '@/lib/api/cart';

interface UseCartCheckoutOptions {
  onSuccess?: (data: CartCheckoutResponse) => void;
  onError?: (error: Error) => void;
}

export function useCartCheckout(options?: UseCartCheckoutOptions) {
  return useMutation({
    mutationFn: ({
      items,
      customerName,
    }: {
      items: CartItem[];
      customerName?: string;
    }) => checkoutCart(items, customerName),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

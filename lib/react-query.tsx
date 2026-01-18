'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * React Query Configuration
 * Provides a configured QueryClient for the entire application
 */

// Create a client with optimal default settings
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: Data is considered fresh for 1 minute
        staleTime: 60 * 1000,

        // Cache time: Unused data is garbage collected after 5 minutes
        gcTime: 5 * 60 * 1000,

        // Retry failed requests up to 3 times
        retry: 3,

        // Don't refetch on window focus by default (can be overridden per query)
        refetchOnWindowFocus: false,

        // Don't refetch on mount if data is still fresh
        refetchOnMount: false,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * React Query Provider Component
 * Wrap your app with this provider to enable React Query
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  // have a suspense boundary between this and the code that may
  // suspend because React will throw away the client on the initial
  // render if it suspends and there is no boundary
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Query keys for consistent cache management
 * Use these constants throughout your app for type-safety and consistency
 */
export const queryKeys = {
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.products.lists(), { filters }] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    myProducts: () => [...queryKeys.products.all, 'my-products'] as const,
  },

  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.orders.lists(), { filters }] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  // User/Auth
  user: {
    current: ['user', 'current'] as const,
    profile: (id: string) => ['user', 'profile', id] as const,
  },

  // Cart
  cart: {
    current: ['cart'] as const,
  },

  // Reviews
  reviews: {
    all: ['reviews'] as const,
    byProduct: (productId: string) => [...queryKeys.reviews.all, 'product', productId] as const,
  },

  // Verifications
  verifications: {
    all: ['verifications'] as const,
    lists: () => [...queryKeys.verifications.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.verifications.lists(), { filters }] as const,
    details: () => [...queryKeys.verifications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.verifications.details(), id] as const,
  },
} as const;

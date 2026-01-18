'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { exportToCSV } from '@/lib/utils/export';

type Period = '7d' | '30d' | '90d' | '1y';

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function useSellerOverview(period: Period = '30d') {
  return useQuery({
    queryKey: ['analytics', 'overview', period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/seller/overview?period=${period}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch overview');
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useRevenueData(period: Period = '30d') {
  return useQuery({
    queryKey: ['analytics', 'revenue', period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/seller/revenue?period=${period}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch revenue');
      return res.json();
    },
    refetchInterval: 60000,
  });
}

export function useTopProducts(period: Period = '30d', limit: number = 10) {
  return useQuery({
    queryKey: ['analytics', 'top-products', period, limit],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/seller/top-products?period=${period}&limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch top products');
      return res.json();
    },
    refetchInterval: 60000,
  });
}

export function useOrdersTimeline(period: Period = '30d') {
  return useQuery({
    queryKey: ['analytics', 'orders-timeline', period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/seller/orders-timeline?period=${period}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch orders timeline');
      return res.json();
    },
    refetchInterval: 60000,
  });
}

export function useCustomerAnalytics(period: Period = '30d') {
  return useQuery({
    queryKey: ['analytics', 'customers', period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/seller/customers?period=${period}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch customer analytics');
      return res.json();
    },
    refetchInterval: 60000,
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: async ({ type, period }: { type: 'orders' | 'products' | 'settlements'; period?: Period }) => {
      const res = await fetch('/api/analytics/seller/export', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, period }),
      });

      if (!res.ok) throw new Error('Failed to export data');

      const { data } = await res.json();
      return { type, data };
    },
    onSuccess: ({ type, data }) => {
      const filename = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
      exportToCSV(data, filename);
    },
  });
}

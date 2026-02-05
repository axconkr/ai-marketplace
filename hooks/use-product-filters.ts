import { useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { ProductSearchParams } from '@/lib/api/products';

/**
 * Hook for managing product filters with URL state persistence
 *
 * Features:
 * - URL state persistence (shareable links)
 * - Browser back/forward support
 * - Type-safe filter parameters
 * - Automatic URL encoding/decoding
 *
 * Usage:
 * ```tsx
 * const { filters, updateFilters } = useProductFilters();
 * ```
 */
export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper to safely parse numbers from URL params (returns undefined for NaN)
  const safeParseNumber = (value: string | null): number | undefined => {
    if (!value) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };

  // Parse filters from URL
  const filters: ProductSearchParams = {
    page: safeParseNumber(searchParams.get('page')) || 1,
    limit: safeParseNumber(searchParams.get('limit')) || 20,
    search: searchParams.get('search') || undefined,
    category: (searchParams.get('category') as any) || undefined,
    min_price: safeParseNumber(searchParams.get('min_price')),
    max_price: safeParseNumber(searchParams.get('max_price')),
    verification_level: safeParseNumber(searchParams.get('verification_level')),
    sort_by: (searchParams.get('sort_by') as any) || 'newest',
  };

  // Update filters and URL
  const updateFilters = useCallback(
    (newFilters: ProductSearchParams) => {
      const params = new URLSearchParams();

      // Add all non-empty filter values to URL
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });

      // Use router.push to update URL with new params
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    updateFilters({
      page: 1,
      limit: 20,
      sort_by: 'newest',
    });
  }, [updateFilters]);

  return {
    filters,
    updateFilters,
    resetFilters,
  };
}

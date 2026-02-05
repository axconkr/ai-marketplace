'use client';

/**
 * Legacy ProductFilters component
 *
 * DEPRECATED: This component is deprecated in favor of ProductFiltersEnhanced.
 *
 * For new implementations, use:
 * import { ProductFiltersEnhanced } from '@/components/products/product-filters-enhanced';
 *
 * Migration guide available in components/products/README.md
 *
 * This wrapper is maintained for backward compatibility.
 */

import { ProductFiltersEnhanced } from './product-filters-enhanced';
import type { ProductSearchParams } from '@/lib/api/products';

interface ProductFiltersProps {
  filters: ProductSearchParams;
  onFiltersChange: (filters: ProductSearchParams) => void;
  totalResults?: number;
  isLoading?: boolean;
  priceRange?: { min: number; max: number };
  categoryCounts?: Record<string, number>;
}

export function ProductFilters({
  filters,
  onFiltersChange,
  totalResults = 0,
  isLoading = false,
  priceRange,
  categoryCounts,
}: ProductFiltersProps) {
  return (
    <ProductFiltersEnhanced
      filters={filters}
      onFiltersChange={onFiltersChange}
      totalResults={totalResults}
      isLoading={isLoading}
      priceRange={priceRange}
      categoryCounts={categoryCounts}
    />
  );
}

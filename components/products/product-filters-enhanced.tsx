'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ProductSearchBar } from './product-search-bar';
import { ProductFiltersPanel } from './product-filters-panel';
import { ProductSortSelect } from './product-sort-select';
import { ProductFilterSummary } from './product-filter-summary';
import { CATEGORY_LABELS } from '@/lib/validations/product';
import type { ProductSearchParams } from '@/lib/validations/product';
import { cn } from '@/lib/utils';

/**
 * Enhanced Product Filters Component
 * Integrates all filter components with mobile-friendly drawer
 *
 * Features:
 * - Enhanced search bar with autocomplete
 * - Collapsible filter sections
 * - Mobile filter drawer
 * - Filter results summary
 * - Sort dropdown
 * - Active filter chips
 * - URL state management ready
 */

interface ProductFiltersEnhancedProps {
  filters: ProductSearchParams;
  onFiltersChange: (filters: ProductSearchParams) => void;
  totalResults: number;
  isLoading?: boolean;
  priceRange?: { min: number; max: number };
  categoryCounts?: Record<string, number>;
  className?: string;
}

export function ProductFiltersEnhanced({
  filters,
  onFiltersChange,
  totalResults,
  isLoading = false,
  priceRange,
  categoryCounts,
  className,
}: ProductFiltersEnhancedProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search, page: 1 });
  };

  const handleSortChange = (sort_by: string) => {
    onFiltersChange({
      ...filters,
      sort_by: sort_by as ProductSearchParams['sort_by'],
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit || 20,
      sort_by: 'newest',
    });
  };

  // Build active filter chips
  const activeFilterChips: Array<{
    label: string;
    onRemove: () => void;
  }> = [];

  if (filters.search) {
    activeFilterChips.push({
      label: `검색: ${filters.search}`,
      onRemove: () =>
        onFiltersChange({ ...filters, search: undefined, page: 1 }),
    });
  }

  if (filters.category) {
    activeFilterChips.push({
      label: CATEGORY_LABELS[filters.category],
      onRemove: () =>
        onFiltersChange({ ...filters, category: undefined, page: 1 }),
    });
  }

  if (filters.min_price !== undefined || filters.max_price !== undefined) {
    const min = filters.min_price ?? priceRange?.min ?? 0;
    const max = filters.max_price ?? priceRange?.max ?? 1000;
    activeFilterChips.push({
      label: `가격: $${min} - $${max}`,
      onRemove: () =>
        onFiltersChange({
          ...filters,
          min_price: undefined,
          max_price: undefined,
          page: 1,
        }),
    });
  }

  if (filters.verification_level !== undefined) {
    activeFilterChips.push({
      label: `인증 레벨 ${filters.verification_level}+`,
      onRemove: () =>
        onFiltersChange({ ...filters, verification_level: undefined, page: 1 }),
    });
  }

  const activeFiltersCount = activeFilterChips.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filter Toggle */}
      <div className="flex gap-2">
        <ProductSearchBar
          value={filters.search || ''}
          onChange={handleSearchChange}
          isLoading={isLoading}
          className="flex-1"
        />

        {/* Mobile Filter Toggle */}
        <Button
          data-testid="category-filter"
          variant="outline"
          size="default"
          onClick={() => setShowMobileFilters(true)}
          className="relative lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          필터
          {activeFiltersCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Summary and Sort */}
      <div className="flex items-center justify-between gap-4">
        <ProductFilterSummary
          totalResults={totalResults}
          activeFilters={activeFilterChips}
          onClearAll={activeFiltersCount > 0 ? clearAllFilters : undefined}
          isLoading={isLoading}
          className="flex-1"
        />

        <ProductSortSelect
          value={filters.sort_by || 'newest'}
          onChange={handleSortChange}
        />
      </div>

      {/* Desktop Filters Sidebar (Hidden on Mobile) */}
      <div className="hidden lg:block">
        <ProductFiltersPanel
          filters={filters}
          onFiltersChange={onFiltersChange}
          priceRange={priceRange}
          categoryCounts={categoryCounts}
        />
      </div>

      {/* Mobile Filter Drawer */}
      <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
        <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>필터</SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <ProductFiltersPanel
              filters={filters}
              onFiltersChange={(newFilters) => {
                onFiltersChange(newFilters);
                setShowMobileFilters(false);
              }}
              priceRange={priceRange}
              categoryCounts={categoryCounts}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

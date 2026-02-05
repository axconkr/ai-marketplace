'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  X,
  TrendingUp,
  TrendingDown,
  Star,
  Download,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CategoryIcon } from './category-icons';
import { VerificationBadge } from './verification-badge';
import {
  CATEGORY_LABELS,
  ProductCategory,
} from '@/lib/validations/product';
import type { ProductSearchParams } from '@/lib/api/products';
import { cn } from '@/lib/utils';

/**
 * Enhanced Product Filters Panel Component
 * Features:
 * - Collapsible filter sections
 * - Category icons
 * - Price range slider
 * - Verification badges
 * - Active filter chips
 * - Filter counts
 * - Clear all button
 */

interface ProductFiltersPanelProps {
  filters: ProductSearchParams;
  onFiltersChange: (filters: ProductSearchParams) => void;
  priceRange?: { min: number; max: number };
  categoryCounts?: Record<string, number>;
  className?: string;
}

type FilterSection = 'category' | 'price' | 'verification';

export function ProductFiltersPanel({
  filters,
  onFiltersChange,
  priceRange = { min: 0, max: 1000 },
  categoryCounts = {},
  className,
}: ProductFiltersPanelProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<FilterSection, boolean>
  >({
    category: true,
    price: true,
    verification: true,
  });

  const toggleSection = (section: FilterSection) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryToggle = (category: ProductCategory) => {
    onFiltersChange({
      ...filters,
      category: filters.category === category ? undefined : category,
      page: 1,
    });
  };

  const handlePriceChange = (values: number[]) => {
    const [min, max] = values;
    onFiltersChange({
      ...filters,
      min_price: min > priceRange.min ? min : undefined,
      max_price: max < priceRange.max ? max : undefined,
      page: 1,
    });
  };

  const handleVerificationToggle = (level: number) => {
    onFiltersChange({
      ...filters,
      verification_level:
        filters.verification_level === level ? undefined : level,
      page: 1,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit || 20,
      sort_by: 'newest',
    });
  };

  const activeFiltersCount = [
    filters.search,
    filters.category,
    filters.min_price !== undefined || filters.max_price !== undefined,
    filters.verification_level !== undefined,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  // Filter chips for active filters
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
    const min = filters.min_price ?? priceRange.min;
    const max = filters.max_price ?? priceRange.max;
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

  return (
    <div className={cn('space-y-4', className)}>
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              활성 필터 ({activeFiltersCount})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              전체 삭제
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeFilterChips.map((chip, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="pl-2 pr-1 gap-1 cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <span className="text-xs">{chip.label}</span>
                <button
                  onClick={chip.onRemove}
                  className="rounded-sm hover:bg-gray-300"
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <Separator />
        </div>
      )}

      {/* Category Filter */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
        >
          <span>카테고리</span>
          {expandedSections.category ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSections.category && (
          <div className="space-y-2">
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => {
              const category = value as ProductCategory;
              const count = categoryCounts[value] || 0;
              const isSelected = filters.category === category;

              return (
                <label
                  key={value}
                  className={cn(
                    'flex items-center justify-between px-2 py-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors',
                    isSelected && 'bg-gray-100'
                  )}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <CategoryIcon
                      category={category}
                      className="h-4 w-4 text-muted-foreground"
                    />
                    <span className="text-sm">{label}</span>
                  </div>
                  {count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>

      <Separator />

      {/* Price Range Filter */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
        >
          <span>가격 범위</span>
          {expandedSections.price ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSections.price && (
          <div className="space-y-4 px-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {filters.min_price ?? priceRange.min}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {filters.max_price ?? priceRange.max}
              </span>
            </div>

            <Slider
              min={priceRange.min}
              max={priceRange.max}
              step={10}
              value={[
                filters.min_price ?? priceRange.min,
                filters.max_price ?? priceRange.max,
              ]}
              onChange={handlePriceChange}
              className="mt-2"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Verification Level Filter */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('verification')}
          className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
        >
          <span>인증 레벨</span>
          {expandedSections.verification ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSections.verification && (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((level) => {
              const isSelected = filters.verification_level === level;

              return (
                <label
                  key={level}
                  className={cn(
                    'flex items-center justify-between px-2 py-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors',
                    isSelected && 'bg-gray-100'
                  )}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleVerificationToggle(level)}
                    />
                    <VerificationBadge level={level} />
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

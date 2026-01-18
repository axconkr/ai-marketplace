'use client';

import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceRangeSlider } from './price-range-slider';
import { RatingFilter } from './rating-filter';
import { CATEGORY_LABELS } from '@/lib/validations/product';

/**
 * AdvancedSearchFilters Component
 * Comprehensive filter panel for product search
 */

interface AdvancedSearchFiltersProps {
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    verificationLevel?: number;
  };
  filterMetadata?: {
    priceRange?: { min: number; max: number };
    ratingRange?: { min: number; max: number };
    categories?: Array<{ category: string; count: number }>;
    verificationLevels?: Array<{ level: number; count: number }>;
  };
  onChange: (filters: any) => void;
  isLoading?: boolean;
}

const VERIFICATION_OPTIONS = [
  { value: '0', label: '미검증' },
  { value: '1', label: '기본 검증' },
  { value: '2', label: '고급 검증' },
  { value: '3', label: '프리미엄 검증' },
];

export function AdvancedSearchFilters({
  filters,
  filterMetadata,
  onChange,
  isLoading = false,
}: AdvancedSearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const handlePriceChange = (min?: number, max?: number) => {
    const newFilters = {
      ...localFilters,
      minPrice: min,
      maxPrice: max,
    };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const clearAllFilters = () => {
    const cleared = {};
    setLocalFilters(cleared);
    onChange(cleared);
  };

  const hasActiveFilters =
    Object.keys(localFilters).filter((key) => localFilters[key as keyof typeof localFilters] !== undefined)
      .length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            필터
            {hasActiveFilters && (
              <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                {
                  Object.keys(localFilters).filter(
                    (key) => localFilters[key as keyof typeof localFilters] !== undefined
                  ).length
                }
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-red-600"
              >
                <X className="w-3 h-3 mr-1" />
                초기화
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>카테고리</Label>
            <Select
              value={localFilters.category || 'all'}
              onValueChange={(value) =>
                updateFilter('category', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="전체 카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => {
                  const count = filterMetadata?.categories?.find(
                    (c) => c.category === value
                  )?.count;
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                      {count !== undefined && (
                        <span className="ml-2 text-gray-400">({count})</span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <PriceRangeSlider
            minPrice={localFilters.minPrice}
            maxPrice={localFilters.maxPrice}
            availableMin={filterMetadata?.priceRange?.min || 0}
            availableMax={filterMetadata?.priceRange?.max || 1000000}
            currency="KRW"
            onChange={handlePriceChange}
          />

          {/* Rating Filter */}
          <RatingFilter
            minRating={localFilters.minRating}
            availableMin={filterMetadata?.ratingRange?.min || 0}
            availableMax={filterMetadata?.ratingRange?.max || 5}
            onChange={(rating) => updateFilter('minRating', rating)}
          />

          {/* Verification Level Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>검증 레벨</Label>
              {localFilters.verificationLevel !== undefined && (
                <button
                  onClick={() => updateFilter('verificationLevel', undefined)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  초기화
                </button>
              )}
            </div>
            <Select
              value={localFilters.verificationLevel?.toString() || 'all'}
              onValueChange={(value) =>
                updateFilter(
                  'verificationLevel',
                  value === 'all' ? undefined : parseInt(value, 10)
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {VERIFICATION_OPTIONS.map((option) => {
                  const count = filterMetadata?.verificationLevels?.find(
                    (v) => v.level === parseInt(option.value, 10)
                  )?.count;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                      {count !== undefined && (
                        <span className="ml-2 text-gray-400">({count})</span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Filter Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                {Object.keys(localFilters).filter(
                  (key) => localFilters[key as keyof typeof localFilters] !== undefined
                ).length}
                개 필터 적용됨
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

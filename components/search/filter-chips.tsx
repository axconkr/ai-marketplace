'use client';

import { X, DollarSign, Star, Tag, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * FilterChips Component
 * Displays active filters as removable chips
 */

interface FilterChipsProps {
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    verificationLevel?: number;
    search?: string;
  };
  onRemoveFilter: (filterKey: string) => void;
  onClearAll: () => void;
  categoryLabels?: Record<string, string>;
  currency?: 'KRW' | 'USD';
}

const VERIFICATION_LABELS = {
  0: '미검증',
  1: '기본 검증',
  2: '고급 검증',
  3: '프리미엄 검증',
};

export function FilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
  categoryLabels = {},
  currency = 'KRW',
}: FilterChipsProps) {
  const formatCurrency = (value: number) => {
    if (currency === 'KRW') {
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        minimumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const activeFilters: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
  }> = [];

  // Search filter
  if (filters.search) {
    activeFilters.push({
      key: 'search',
      label: `검색: "${filters.search}"`,
      icon: <Tag className="w-3 h-3" />,
    });
  }

  // Category filter
  if (filters.category) {
    activeFilters.push({
      key: 'category',
      label: categoryLabels[filters.category] || filters.category,
      icon: <Tag className="w-3 h-3" />,
    });
  }

  // Price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    let priceLabel = '';
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      priceLabel = `${formatCurrency(filters.minPrice)} - ${formatCurrency(filters.maxPrice)}`;
    } else if (filters.minPrice !== undefined) {
      priceLabel = `${formatCurrency(filters.minPrice)} 이상`;
    } else if (filters.maxPrice !== undefined) {
      priceLabel = `${formatCurrency(filters.maxPrice)} 이하`;
    }

    activeFilters.push({
      key: 'price',
      label: priceLabel,
      icon: <DollarSign className="w-3 h-3" />,
    });
  }

  // Rating filter
  if (filters.minRating !== undefined) {
    activeFilters.push({
      key: 'minRating',
      label: `평점 ${filters.minRating}점 이상`,
      icon: <Star className="w-3 h-3" />,
    });
  }

  // Verification level filter
  if (filters.verificationLevel !== undefined) {
    activeFilters.push({
      key: 'verificationLevel',
      label:
        VERIFICATION_LABELS[
          filters.verificationLevel as keyof typeof VERIFICATION_LABELS
        ] || `검증 레벨 ${filters.verificationLevel}`,
      icon: <Shield className="w-3 h-3" />,
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600 font-medium">활성 필터:</span>

      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="flex items-center gap-1 pr-1 cursor-pointer hover:bg-gray-200 transition-colors"
        >
          {filter.icon}
          <span>{filter.label}</span>
          <button
            onClick={() => onRemoveFilter(filter.key)}
            className="ml-1 p-0.5 rounded-full hover:bg-gray-300 transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 text-xs text-red-600 hover:text-red-700"
        >
          전체 초기화
        </Button>
      )}
    </div>
  );
}

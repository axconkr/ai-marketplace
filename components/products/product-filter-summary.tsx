'use client';

import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Product Filter Results Summary Component
 * Displays results count and active filters with quick clear options
 */

interface ProductFilterSummaryProps {
  totalResults: number;
  activeFilters: Array<{
    label: string;
    onRemove: () => void;
  }>;
  onClearAll?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ProductFilterSummary({
  totalResults,
  activeFilters,
  onClearAll,
  isLoading = false,
  className,
}: ProductFilterSummaryProps) {
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {isLoading ? (
              <span className="text-muted-foreground">검색 중...</span>
            ) : (
              <>
                <span className="text-primary font-semibold">
                  {totalResults.toLocaleString()}
                </span>
                <span className="text-muted-foreground">개의 상품</span>
              </>
            )}
          </span>
        </div>

        {hasActiveFilters && onClearAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            필터 초기화
          </Button>
        )}
      </div>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="pl-2.5 pr-1 gap-1.5 cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <span className="text-xs">{filter.label}</span>
              <button
                onClick={filter.onRemove}
                className="rounded-sm hover:bg-gray-300 p-0.5 transition-colors"
                aria-label={`Remove ${filter.label} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

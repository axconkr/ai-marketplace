'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/use-products';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductSearchParams } from '@/lib/api/products';

/**
 * Product Listing Page
 * Browse and search all products
 */

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductSearchParams>({
    page: 1,
    limit: 20,
    sort_by: 'newest',
  });

  const { data, isLoading, error } = useProducts(filters);

  const handleFiltersChange = (newFilters: ProductSearchParams) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 tracking-tight">
              AI 솔루션 둘러보기
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              검증된 자동화 워크플로우, AI 에이전트, 바이브코딩 앱을 탐색하세요
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 sm:mb-8 bg-muted/50 rounded-lg p-4 sm:p-6 border">
        <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-8">
          <p className="font-semibold">제품 로딩 오류</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && data && (
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {data.pagination.total.toLocaleString()}개
            </span>
            의 제품 중{' '}
            <span className="font-semibold text-foreground">
              {(filters.page! - 1) * filters.limit! + 1} -{' '}
              {Math.min(filters.page! * filters.limit!, data.pagination.total)}
            </span>{' '}
            표시
          </div>
          <div className="text-sm text-muted-foreground">
            페이지 {filters.page} / {data.pagination.total_pages}
          </div>
        </div>
      )}

      {/* Product Grid */}
      <ProductGrid
        products={data?.products || []}
        isLoading={isLoading}
        emptyMessage="제품을 찾을 수 없습니다. 필터를 조정해보세요."
      />

      {/* Pagination */}
      {!isLoading && data && data.pagination.total_pages > 1 && (
        <div className="mt-8 sm:mt-12 border-t pt-6 sm:pt-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="default"
                onClick={() => handlePageChange(filters.page! - 1)}
                disabled={filters.page === 1}
                aria-label="이전 페이지"
                className="h-10 min-w-[44px]"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">이전</span>
              </Button>

              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-[200px] sm:max-w-none">
                {Array.from({ length: data.pagination.total_pages }, (_, i) => i + 1)
                  .filter((page) => {
                    const current = filters.page!;
                    return (
                      page === 1 ||
                      page === data.pagination.total_pages ||
                      (page >= current - 1 && page <= current + 1)
                    );
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && page - prev > 1;

                    return (
                      <div key={page} className="flex items-center gap-1 sm:gap-2">
                        {showEllipsis && (
                          <span className="px-1 sm:px-2 text-muted-foreground text-sm">...</span>
                        )}
                        <Button
                          variant={page === filters.page ? 'default' : 'outline'}
                          size="default"
                          onClick={() => handlePageChange(page)}
                          className="min-w-[44px] h-10"
                          aria-label={`페이지 ${page}`}
                          aria-current={page === filters.page ? 'page' : undefined}
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                size="default"
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={filters.page === data.pagination.total_pages}
                aria-label="다음 페이지"
                className="h-10 min-w-[44px]"
              >
                <span className="hidden sm:inline">다음</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              {data.pagination.total_pages}페이지 중 {filters.page}페이지
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

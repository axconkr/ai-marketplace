/**
 * Complete Integration Example
 * Demonstrates how to use the enhanced product filter components
 * with URL state management and React Query
 */

'use client';

import { ProductFiltersEnhanced } from './product-filters-enhanced';
import { useProductFilters } from '@/hooks/use-product-filters';
import { useProducts } from '@/hooks/use-products';

export function ProductsPageExample() {
  // URL-persisted filter state
  const { filters, updateFilters } = useProductFilters();

  // Fetch products with current filters
  const { data, isLoading } = useProducts(filters);

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Sidebar / Mobile Drawer */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <ProductFiltersEnhanced
              filters={filters}
              onFiltersChange={updateFilters}
              totalResults={data?.pagination.total || 0}
              isLoading={isLoading}
              priceRange={{ min: 0, max: 1000 }}
              categoryCounts={data?.categoryCounts}
            />
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <ProductGridSkeleton />
          ) : (
            <ProductGrid products={data?.products || []} />
          )}

          {/* Pagination */}
          {data?.pagination && (
            <ProductPagination
              pagination={data.pagination}
              onPageChange={(page) =>
                updateFilters({ ...filters, page })
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}

// Skeleton loader component
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-4 animate-pulse">
          <div className="bg-gray-200 h-48 rounded" />
          <div className="space-y-2">
            <div className="bg-gray-200 h-4 rounded w-3/4" />
            <div className="bg-gray-200 h-4 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Product grid component
function ProductGrid({ products }: { products: any[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg p-4">
          {/* Product card content */}
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-bold">${product.price}</span>
            <span className="text-xs text-muted-foreground">
              {product.download_count} downloads
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Pagination component
function ProductPagination({
  pagination,
  onPageChange,
}: {
  pagination: any;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={!pagination.has_prev}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm text-muted-foreground">
        Page {pagination.page} of {pagination.total_pages}
      </span>
      <button
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={!pagination.has_next}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

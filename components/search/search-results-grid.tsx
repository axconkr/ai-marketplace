'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Loader2, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdvancedSearchFilters } from './advanced-search-filters';
import { FilterChips } from './filter-chips';
import { ProductCard } from '@/components/products/product-card';
import { ProductSkeleton } from '@/components/products/product-skeleton';
import { CATEGORY_LABELS } from '@/lib/validations/product';
import type { Product } from '@/lib/api/products';

/**
 * SearchResultsGrid Component
 * Complete search experience with filters, sorting, and pagination
 */

interface SearchResultsGridProps {
  initialProducts?: Product[];
  initialMetadata?: any;
}

const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'rating', label: '평점순' },
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
];

export function SearchResultsGrid({
  initialProducts = [],
  initialMetadata,
}: SearchResultsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || undefined,
    minPrice: searchParams.get('min_price')
      ? parseFloat(searchParams.get('min_price')!)
      : undefined,
    maxPrice: searchParams.get('max_price')
      ? parseFloat(searchParams.get('max_price')!)
      : undefined,
    minRating: searchParams.get('min_rating')
      ? parseFloat(searchParams.get('min_rating')!)
      : undefined,
    verificationLevel: searchParams.get('verification_level')
      ? parseInt(searchParams.get('verification_level')!, 10)
      : undefined,
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch products
  const fetchProducts = async (resetPage = false) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice !== undefined)
        params.append('min_price', filters.minPrice.toString());
      if (filters.maxPrice !== undefined)
        params.append('max_price', filters.maxPrice.toString());
      if (filters.minRating !== undefined)
        params.append('min_rating', filters.minRating.toString());
      if (filters.verificationLevel !== undefined)
        params.append('verification_level', filters.verificationLevel.toString());
      params.append('sort_by', sortBy);
      params.append('page', resetPage ? '1' : page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/products/search?${params.toString()}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch products');
      }

      const newProducts = result.data.products || [];

      if (resetPage) {
        setProducts(newProducts);
        setPage(1);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }

      setMetadata(result.data.metadata);
      setHasMore(newProducts.length === 20);

      // Update URL
      const url = new URL(window.location.href);
      url.search = params.toString();
      router.push(url.pathname + url.search, { scroll: false });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(true);
  };

  // Filter change handler
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Apply filters
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts(true);
    }, 300);

    return () => clearTimeout(debounce);
  }, [filters, sortBy]);

  // Remove single filter
  const handleRemoveFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    if (filterKey === 'price') {
      newFilters.minPrice = undefined;
      newFilters.maxPrice = undefined;
    } else if (filterKey === 'search') {
      setSearchQuery('');
    } else {
      delete newFilters[filterKey as keyof typeof newFilters];
    }
    setFilters(newFilters);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setFilters({
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      verificationLevel: undefined,
    });
    setSearchQuery('');
  };

  // Load more
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    fetchProducts(false);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="상품 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          검색
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          필터
        </Button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <AdvancedSearchFilters
              filters={filters}
              filterMetadata={metadata}
              onChange={handleFilterChange}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Results */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <div className="space-y-4">
            {/* Active Filters & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <FilterChips
                  filters={{ ...filters, search: searchQuery }}
                  onRemoveFilter={handleRemoveFilter}
                  onClearAll={handleClearAllFilters}
                  categoryLabels={CATEGORY_LABELS}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">정렬:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count */}
            {metadata?.total !== undefined && (
              <p className="text-sm text-gray-600">
                총 <span className="font-semibold">{metadata.total}</span>개 상품
              </p>
            )}

            {/* Loading State */}
            {isLoading && products.length === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && products.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-600 mb-6">
                  다른 검색어나 필터를 사용해보세요
                </p>
                <Button variant="outline" onClick={handleClearAllFilters}>
                  필터 초기화
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && products.length > 0 && (
              <div className="flex justify-center pt-6">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      로딩 중...
                    </>
                  ) : (
                    '더 보기'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

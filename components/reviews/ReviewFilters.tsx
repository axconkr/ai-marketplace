'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewFiltersProps {
  products: { id: string; name: string }[];
  onFilterChange: (filters: {
    rating?: number;
    productId?: string;
    responseStatus?: 'all' | 'answered' | 'unanswered';
    sortBy?: 'date' | 'rating' | 'helpful';
    search?: string;
  }) => void;
}

export function ReviewFilters({ products, onFilterChange }: ReviewFiltersProps) {
  const [selectedRating, setSelectedRating] = useState<number | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [responseStatus, setResponseStatus] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'helpful'>('date');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRatingFilter = (rating: number | undefined) => {
    setSelectedRating(rating);
    updateFilters({ rating });
  };

  const handleProductFilter = (productId: string) => {
    setSelectedProduct(productId);
    updateFilters({ productId: productId === 'all' ? undefined : productId });
  };

  const handleResponseStatusFilter = (status: 'all' | 'answered' | 'unanswered') => {
    setResponseStatus(status);
    updateFilters({ responseStatus: status });
  };

  const handleSortChange = (sort: 'date' | 'rating' | 'helpful') => {
    setSortBy(sort);
    updateFilters({ sortBy: sort });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateFilters({ search: query });
  };

  const updateFilters = (newFilters: Partial<Parameters<typeof onFilterChange>[0]>) => {
    onFilterChange({
      rating: selectedRating,
      productId: selectedProduct === 'all' ? undefined : selectedProduct,
      responseStatus,
      sortBy,
      search: searchQuery,
      ...newFilters,
    });
  };

  const clearFilters = () => {
    setSelectedRating(undefined);
    setSelectedProduct('all');
    setResponseStatus('all');
    setSortBy('date');
    setSearchQuery('');
    onFilterChange({
      responseStatus: 'all',
      sortBy: 'date',
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="고객명 또는 리뷰 내용으로 검색..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Rating Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                평점 필터
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedRating === undefined ? 'default' : 'outline'}
                  onClick={() => handleRatingFilter(undefined)}
                >
                  전체
                </Button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <Button
                    key={rating}
                    size="sm"
                    variant={selectedRating === rating ? 'default' : 'outline'}
                    onClick={() => handleRatingFilter(rating)}
                    className="gap-1"
                  >
                    {rating}
                    <Star className="h-3 w-3 fill-current" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Product Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                상품 필터
              </label>
              <Select value={selectedProduct} onValueChange={handleProductFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상품 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상품</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Response Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                응답 상태
              </label>
              <Select value={responseStatus} onValueChange={handleResponseStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="answered">응답 완료</SelectItem>
                  <SelectItem value="unanswered">미응답</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                정렬 기준
              </label>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">최신순</SelectItem>
                  <SelectItem value="rating">평점순</SelectItem>
                  <SelectItem value="helpful">도움순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600"
            >
              <Filter className="h-4 w-4 mr-2" />
              필터 초기화
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

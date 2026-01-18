import { Metadata } from 'next';
import { SearchResultsGrid } from '@/components/search';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: '상품 검색 | AI Marketplace',
  description: '고급 필터를 사용하여 원하는 AI 상품을 빠르게 찾아보세요',
};

function SearchFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">상품 검색</h1>
        <p className="text-lg text-gray-600">
          카테고리, 가격, 평점 등 다양한 필터로 원하는 상품을 찾아보세요
        </p>
      </div>

      <Suspense fallback={<SearchFallback />}>
        <SearchResultsGrid />
      </Suspense>
    </div>
  );
}

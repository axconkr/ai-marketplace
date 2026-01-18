import { ProductCard } from './product-card';
import { ProductSkeleton } from './product-skeleton';
import type { Product } from '@/lib/api/products';
import { Package } from 'lucide-react';

/**
 * ProductGrid component
 * Displays products in a responsive grid layout
 */

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  isLoading = false,
  emptyMessage = 'No products found',
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-6 mb-6">
          <Package className="w-16 h-16 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-3">제품을 찾을 수 없습니다</h3>
        <p className="text-muted-foreground max-w-md mb-6">{emptyMessage}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            모든 제품 보기
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

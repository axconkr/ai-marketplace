'use client';

import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface TopProduct {
  id: string;
  title: string;
  revenue: number;
  orders: number;
  conversionRate: number;
}

interface TopProductsListProps {
  products: TopProduct[];
}

export function TopProductsList({ products }: TopProductsListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No product data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.slice(0, 5).map((product, index) => (
        <div
          key={product.id}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {product.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">
                  {product.orders} orders
                </span>
                {product.conversionRate > 0 && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-600">
                      {product.conversionRate.toFixed(1)}% conv.
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {formatCurrency(product.revenue)}
            </p>
            {index === 0 && (
              <Badge variant="secondary" className="mt-1">
                Top Seller
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

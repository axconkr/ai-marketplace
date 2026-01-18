'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyProducts, useDeleteProduct } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useRequireRole } from '@/lib/auth/middleware-helper';
import { UserRole } from '@/src/lib/auth/types';
import {
  Plus,
  Eye,
  Download,
  Star,
  Edit,
  Trash2,
  MoreVertical,
  DollarSign,
  Package,
  TrendingUp,
} from 'lucide-react';
import { STATUS_LABELS } from '@/lib/validations/product';

/**
 * Seller Dashboard - Products
 * Manage seller's products
 * PROTECTED: Only SERVICE_PROVIDER and ADMIN can access
 */

export default function DashboardProductsPage() {
  // Require service provider or admin role
  useRequireRole([UserRole.SERVICE_PROVIDER, UserRole.ADMIN]);
  const { data: products, isLoading, error } = useMyProducts();
  const deleteMutation = useDeleteProduct();
  const { addToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}"을(를) 삭제하시겠습니까?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      addToast({
        title: '상품 삭제됨',
        description: '상품이 성공적으로 삭제되었습니다.',
      });
    } catch (error) {
      addToast({
        title: '오류',
        description: error instanceof Error ? error.message : '상품 삭제에 실패했습니다',
        variant: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate stats
  const stats = products
    ? {
        total: products.length,
        active: products.filter((p) => p.status === 'active').length,
        pending: products.filter((p) => p.status === 'pending').length,
        revenue: products
          .filter((p) => p.status === 'active')
          .reduce((sum, p) => sum + Number(p.price) * p.download_count, 0),
      }
    : { total: 0, active: 0, pending: 0, revenue: 0 };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">상품 로딩 오류</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">내 상품</h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            상품 목록을 관리하세요
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/products/new">
            <Plus className="w-4 h-4 mr-2" />
            상품 추가
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">전체 상품</CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">전체 기간</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">활성 상품</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.active}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">현재 판매 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">검토 대기</CardTitle>
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.pending}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">승인 대기 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">총 수익</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              ${stats.revenue.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">예상</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      {!products || products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">아직 상품이 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            첫 상품을 등록하고 판매를 시작하세요
          </p>
          <Button asChild>
            <Link href="/products/new">
              <Plus className="w-4 h-4 mr-2" />
              상품 등록
            </Link>
          </Button>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>상품 ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                      <Badge
                        variant={
                          STATUS_LABELS[
                            product.status as keyof typeof STATUS_LABELS
                          ].variant
                        }
                      >
                        {
                          STATUS_LABELS[
                            product.status as keyof typeof STATUS_LABELS
                          ].label
                        }
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {product.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {product.download_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {product.download_count}
                      </div>
                      {product.rating_average && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {Number(product.rating_average).toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price and Actions Container */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-2">
                    {/* Price */}
                    <div className="text-left sm:text-right">
                      <div className="font-bold text-base sm:text-lg">
                        {formatPrice(product.price, product.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product.pricing_model}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/products/${product.id}`}>
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">보기</span>
                        </Link>
                      </Button>

                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/products/${product.id}/edit`}>
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">수정</span>
                        </Link>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id, product.title)}
                        disabled={deletingId === product.id}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                        <span className="sr-only">삭제</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-12 w-64 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function
function formatPrice(price: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(price);
}

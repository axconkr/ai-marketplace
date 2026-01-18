'use client';

import { useState } from 'react';
import { Plus, Package, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VerificationList } from '@/components/verification/VerificationList';
import { RequestVerificationModal } from '@/components/verification/RequestVerificationModal';
import { useMyVerifications } from '@/hooks/use-verifications';
import { useQuery } from '@tanstack/react-query';

export default function SellerVerificationsPage() {
  const { data: verifications, isLoading, error } = useMyVerifications();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Fetch user's products (you'll need to implement this hook)
  const { data: products } = useQuery({
    queryKey: ['my-products'],
    queryFn: async () => {
      const res = await fetch('/api/seller/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">상품 검증 관리</h1>
          <p className="text-gray-600 mt-2">
            상품의 검증 상태를 확인하고 관리하세요
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">상품 검증 관리</h1>
          <p className="text-gray-600 mt-2">
            상품의 검증 상태를 확인하고 관리하세요
          </p>
        </div>
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-red-600">
              검증 목록을 불러오는데 실패했습니다: {(error as Error).message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: verifications?.length || 0,
    pending: verifications?.filter((v) => v.status === 'PENDING').length || 0,
    inProgress:
      verifications?.filter(
        (v) => v.status === 'ASSIGNED' || v.status === 'IN_PROGRESS'
      ).length || 0,
    completed:
      verifications?.filter((v) => v.status === 'COMPLETED').length || 0,
    approved: verifications?.filter((v) => v.status === 'APPROVED').length || 0,
    rejected: verifications?.filter((v) => v.status === 'REJECTED').length || 0,
    totalSpent: verifications?.reduce((sum, v) => sum + v.fee, 0) || 0,
    averageScore:
      verifications && verifications.length > 0
        ? verifications
            .filter((v) => v.score !== null && v.score !== undefined)
            .reduce((sum, v) => sum + (v.score || 0), 0) /
          verifications.filter((v) => v.score !== null && v.score !== undefined)
            .length
        : 0,
    level3Count:
      verifications?.filter((v) => v.level === 3).length || 0,
  };

  const handleRequestVerification = () => {
    // For now, we'll just open the modal
    // You can implement product selection if needed
    setShowRequestModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">상품 검증 관리</h1>
          <p className="text-gray-600 mt-2">
            상품의 검증 상태를 확인하고 관리하세요
          </p>
        </div>
        <Button onClick={handleRequestVerification}>
          <Plus className="h-4 w-4 mr-2" />
          검증 요청
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Package className="h-4 w-4" />
              전체 검증
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">
              Level 3: {stats.level3Count}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              진행중
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              대기중: {stats.pending}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              승인됨
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              완료: {stats.completed}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              평균 점수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageScore > 0 ? Math.round(stats.averageScore) : '-'}
              {stats.averageScore > 0 && (
                <span className="text-sm text-gray-500 ml-1">/ 100</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              총 지출: ${(stats.totalSpent / 100).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Level 3 Premium Info Banner */}
      {stats.level3Count > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🏆</div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">
                  프리미엄 검증 진행중
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {stats.level3Count}개의 상품이 4개 분야 전문가의 종합 검수를
                  받고 있습니다
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verifications List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">전체 검증 요청</h2>
        {!verifications || verifications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  아직 검증 요청이 없습니다
                </h3>
                <p className="text-gray-600 mb-4">
                  상품 검증을 요청하여 구매자의 신뢰를 높이세요
                </p>
                <Button onClick={handleRequestVerification}>
                  <Plus className="h-4 w-4 mr-2" />
                  첫 검증 요청하기
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <VerificationList verifications={verifications as any} />
        )}
      </div>

      {/* Request Verification Modal */}
      <RequestVerificationModal
        product={selectedProduct}
        open={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setSelectedProduct(null);
        }}
        onSuccess={() => {
          // Refetch verifications
          window.location.reload();
        }}
      />
    </div>
  );
}

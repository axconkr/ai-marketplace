'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { StatsCard } from '@/components/analytics/StatsCard';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { TopProductsList } from '@/components/analytics/TopProductsList';
import { OrdersTable } from '@/components/analytics/OrdersTable';
import { PendingActionsList } from '@/components/analytics/PendingActionsList';
import { OrderStatusChart } from '@/components/analytics/OrderStatusChart';
import { ProductPerformanceChart } from '@/components/analytics/ProductPerformanceChart';
import { RecentActivityTimeline } from '@/components/analytics/RecentActivityTimeline';
import { useSellerOverview, useRevenueData, useTopProducts } from '@/hooks/use-analytics';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import { getUserRoleFromToken, useRequireRole } from '@/lib/auth/middleware-helper';
import { UserRole } from '@/src/lib/auth/types';
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Plus,
  FileText,
  Download,
  Heart,
  Clock,
  Users,
  HelpCircle,
  Eye,
  DownloadCloud,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

type Period = '7d' | '30d' | '90d' | '1y';

const periodOptions = [
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '최근 30일' },
  { value: '90d', label: '최근 90일' },
  { value: '1y', label: '최근 1년' },
];

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>('30d');
  const [userRole, setUserRole] = useState<'client' | 'service_provider' | 'admin' | null>(null);

  // Require authentication (no specific role required - dashboard adapts to role)
  useRequireRole();

  // Determine user role from token or API
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const role = getUserRoleFromToken();
        console.log('🔍 Dashboard - Detected role from token:', role);
        if (!role) return;

        // Map UserRole enum to component state
        if (role === UserRole.ADMIN) {
          console.log('✅ Setting userRole to: admin');
          setUserRole('admin');
        } else if (role === UserRole.SERVICE_PROVIDER) {
          console.log('✅ Setting userRole to: service_provider');
          setUserRole('service_provider');
        } else {
          console.log('✅ Setting userRole to: client');
          setUserRole('client');
        }
      } catch (error) {
        console.error('Failed to determine user role:', error);
        setUserRole('client'); // Default to buyer
      }
    };

    checkUserRole();
  }, []);

  // Buyer queries
  const { data: buyerOverview } = useQuery({
    queryKey: ['buyer-overview', period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/buyer/overview?period=${period}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: userRole === 'client',
  });

  const { data: spendingData } = useQuery({
    queryKey: ['buyer-spending', period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/buyer/spending?period=${period}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: userRole === 'client',
  });

  const { data: recentPurchases } = useQuery({
    queryKey: ['buyer-purchases'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/buyer/purchases?limit=5', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: userRole === 'client',
  });

  // Seller queries
  const { data: overview, isLoading: overviewLoading } = useSellerOverview(period);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData(period);
  const { data: topProductsData, isLoading: productsLoading } = useTopProducts(period, 5);

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders?limit=5');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    enabled: userRole === 'service_provider' || userRole === 'admin',
  });

  const { data: pendingActions } = useQuery({
    queryKey: ['pending-actions'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/seller/pending-actions');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: userRole === 'service_provider' || userRole === 'admin',
  });

  // Additional seller analytics queries
  const { data: orderStatusData } = useQuery({
    queryKey: ['order-status', period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/seller/order-status?period=${period}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: userRole === 'service_provider' || userRole === 'admin',
  });

  const { data: productPerformance } = useQuery({
    queryKey: ['product-performance', period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/seller/product-performance?period=${period}&limit=5`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: userRole === 'service_provider' || userRole === 'admin',
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/seller/recent-activity?limit=10', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: userRole === 'service_provider' || userRole === 'admin',
  });

  const getTrend = (value: number): 'up' | 'down' | 'neutral' => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  // Render buyer dashboard
  if (userRole === 'client') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
            <p className="text-gray-600 mt-1">환영합니다! AI 서비스 구매 내역 요약입니다</p>
            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
              <span>✓</span>
              <span>디자인·기획·개발·도메인 전문가 검증 완료 상품만 판매</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Link href="/products">
              <Button>
                <ShoppingCart className="w-4 h-4 mr-2" />
                제품 둘러보기
              </Button>
            </Link>
          </div>
        </div>

        {/* Buyer Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="총 구매 금액"
            value={formatCurrency(buyerOverview?.totalSpent || 0)}
            change={buyerOverview?.spentChange}
            trend={getTrend(buyerOverview?.spentChange || 0)}
            icon={DollarSign}
          />
          <StatsCard
            title="구매 횟수"
            value={buyerOverview?.totalOrders || 0}
            change={buyerOverview?.ordersChange}
            trend={getTrend(buyerOverview?.ordersChange || 0)}
            icon={ShoppingCart}
          />
          <StatsCard
            title="구매한 제품 수"
            value={buyerOverview?.activeProducts || 0}
            icon={Package}
          />
          <StatsCard
            title="완료된 주문"
            value={buyerOverview?.completedOrders || 0}
            icon={Clock}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                평균 구매 금액
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(buyerOverview?.averageOrderValue || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                선호 카테고리
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {buyerOverview?.favoriteCategories?.join(', ') || '없음'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                위시리스트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                0
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spending Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>구매 지출 현황</CardTitle>
          </CardHeader>
          <CardContent>
            {spendingData?.data && spendingData.data.length > 0 ? (
              <RevenueChart data={spendingData.data} />
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-500">구매 데이터가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>최근 구매 내역</CardTitle>
            <Link href="/orders">
              <Button variant="outline" size="sm">
                전체 보기
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentPurchases?.purchases && recentPurchases.purchases.length > 0 ? (
              <OrdersTable orders={recentPurchases.purchases} limit={5} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                아직 구매 내역이 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link href="/products">
            <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">제품 둘러보기</h3>
                  <p className="text-sm text-gray-600">새로운 제품을 찾아보세요</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/orders">
            <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">주문 내역</h3>
                  <p className="text-sm text-gray-600">구매한 제품을 확인하세요</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/cart">
            <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">장바구니</h3>
                  <p className="text-sm text-gray-600">장바구니 확인 및 결제</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // Render admin dashboard
  if (userRole === 'admin') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-gray-600 mt-1">AI 서비스 거래 플랫폼 전체 관리 및 모니터링</p>
            <p className="text-sm text-blue-600 mt-1">자동화 템플릿·바이브코딩·AI 에이전트 안전 거래 지원</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Platform Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">전체 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                  <p className="text-xs text-gray-500 mt-1">Admin/Seller/Buyer/Verifier</p>
                </div>
                <Users className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">전체 상품</p>
                  <p className="text-2xl font-bold text-gray-900">{overview?.activeProducts || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">활성/대기/거절</p>
                </div>
                <Package className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">플랫폼 총 거래액</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview?.netRevenue || 0)}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {overview?.revenueChange ? `+${overview.revenueChange}%` : '-'}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">미해결 이슈</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                  <p className="text-xs text-red-600 mt-1">환불/분쟁/신고</p>
                </div>
                <FileText className="w-10 h-10 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-blue-600 mb-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">사용자 관리</h3>
                  <p className="text-sm text-gray-600">판매자/구매자/검증자 관리 및 권한 설정</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
              <CardContent className="p-6">
                <Package className="w-8 h-8 text-green-600 mb-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">상품 관리</h3>
                  <p className="text-sm text-gray-600">등록된 상품 모니터링 및 정책 위반 관리</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/issues">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-orange-500">
              <CardContent className="p-6">
                <FileText className="w-8 h-8 text-orange-600 mb-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">이슈 관리</h3>
                  <p className="text-sm text-gray-600">환불 요청/분쟁 조정/신고 처리</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settlements">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-500">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 text-purple-600 mb-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">정산 관리</h3>
                  <p className="text-sm text-gray-600">판매자 정산 승인 및 처리</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/verifications">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-indigo-500">
              <CardContent className="p-6">
                <TrendingUp className="w-8 h-8 text-indigo-600 mb-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">검증 시스템 관리</h3>
                  <p className="text-sm text-gray-600">전문가 그룹 관리 및 검증 진행 모니터링</p>
                  <p className="text-xs text-indigo-600 mt-1">디자인·기획·개발·도메인 전문가</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/support">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-teal-500">
              <CardContent className="p-6">
                <HelpCircle className="w-8 h-8 text-teal-600 mb-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">기술 지원 관리</h3>
                  <p className="text-sm text-gray-600">검증 완료 상품 지속 기술 지원</p>
                  <p className="text-xs text-teal-600 mt-1">전문가 그룹의 사후 지원</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-gray-500">
              <CardContent className="p-6">
                <FileText className="w-8 h-8 text-gray-600 mb-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">시스템 설정</h3>
                  <p className="text-sm text-gray-600">수수료율/정책/공지사항 관리</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Platform Activity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>최근 가입 사용자</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                사용자 관리 API 구현 필요
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>대기 중인 작업</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium">검증 요청 대기</span>
                    <p className="text-xs text-gray-500">디자인·기획·개발·도메인 전문가 배정 필요</p>
                  </div>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium">기술 지원 요청</span>
                    <p className="text-xs text-gray-500">전문가 그룹 대응 필요</p>
                  </div>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm">환불/분쟁 요청</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm">정산 승인 대기</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm">신고된 상품/사용자</span>
                  <span className="font-semibold">-</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render seller dashboard
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">판매자 대시보드</h1>
          <p className="text-gray-600 mt-1">AI 자동화·에이전트·바이브코딩 서비스 판매 현황</p>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span>전문가 검증 후 안전하게 판매하세요</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Link href="/dashboard/products/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              상품 추가
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards - P0 Critical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="총 수익 (Net)"
          value={formatCurrency(overview?.netRevenue || 0)}
          change={overview?.revenueChange}
          trend={getTrend(overview?.revenueChange || 0)}
          icon={DollarSign}
          className="border-l-4 border-l-blue-500"
        />
        <StatsCard
          title="총 주문"
          value={overview?.totalOrders || 0}
          change={overview?.ordersChange}
          trend={getTrend(overview?.ordersChange || 0)}
          icon={ShoppingCart}
          className="border-l-4 border-l-green-500"
        />
        <StatsCard
          title="활성 상품"
          value={overview?.activeProducts || 0}
          icon={Package}
          className="border-l-4 border-l-purple-500"
        />
        <StatsCard
          title="정산 대기"
          value={formatCurrency(overview?.pendingPayout || 0)}
          icon={TrendingUp}
          className="border-l-4 border-l-orange-500"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              총 조회수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.totalViews?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">모든 상품 합계</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DownloadCloud className="w-4 h-4" />
              총 다운로드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.totalDownloads?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">모든 상품 합계</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              평균 주문 금액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview?.averageOrderValue || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">주문당 평균</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              전환율
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.conversionRate?.toFixed(2) || 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">조회 대비 구매</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart - Full Width */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                수익 추이
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                선택한 기간 동안의 일별 수익 현황
              </p>
            </div>
            <div className="flex items-center gap-2">
              {overview?.revenueChange !== undefined && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  overview.revenueChange > 0
                    ? 'bg-green-100 text-green-700'
                    : overview.revenueChange < 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {overview.revenueChange > 0 ? '+' : ''}
                  {overview.revenueChange.toFixed(1)}% 이전 기간 대비
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-8 h-8 text-gray-400 animate-pulse mx-auto mb-2" />
                <p className="text-gray-500">차트 로딩 중...</p>
              </div>
            </div>
          ) : revenueData?.data && revenueData.data.length > 0 ? (
            <RevenueChart data={revenueData.data} height={350} />
          ) : (
            <div className="h-[350px] flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">수익 데이터가 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">첫 판매를 시작해보세요!</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row: Order Status & Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Order Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>주문 현황</CardTitle>
            <p className="text-sm text-gray-500 mt-1">상태별 주문 분포</p>
          </CardHeader>
          <CardContent>
            {orderStatusData && orderStatusData.length > 0 ? (
              <OrderStatusChart data={orderStatusData} />
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">주문 데이터가 없습니다</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Performance */}
        <Card>
          <CardHeader>
            <CardTitle>상품 성과 분석</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Top 5 상품 조회수 & 다운로드</p>
          </CardHeader>
          <CardContent>
            {productPerformance && productPerformance.length > 0 ? (
              <ProductPerformanceChart data={productPerformance} />
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">상품 데이터가 없습니다</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>최근 주문</CardTitle>
              <p className="text-sm text-gray-500 mt-1">최신 5건의 주문 내역</p>
            </div>
            <Link href="/dashboard/orders">
              <Button variant="outline" size="sm">
                전체 보기
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <OrdersTable orders={recentOrders} limit={5} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p>아직 주문이 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">상품을 등록하고 판매를 시작하세요</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>인기 상품</CardTitle>
              <p className="text-sm text-gray-500 mt-1">수익 기준 Top 5</p>
            </div>
            <Link href="/dashboard/products">
              <Button variant="outline" size="sm">
                전체 보기
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-8 h-8 text-gray-300 animate-pulse mx-auto mb-2" />
                <p>상품 로딩 중...</p>
              </div>
            ) : topProductsData?.products && topProductsData.products.length > 0 ? (
              <TopProductsList products={topProductsData.products} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p>아직 상품이 없습니다</p>
                <Link href="/dashboard/products/new">
                  <Button size="sm" className="mt-3">
                    <Plus className="w-4 h-4 mr-2" />
                    첫 상품 등록하기
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            최근 활동
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            주문, 상품, 정산 등 최근 활동 내역
          </p>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <RecentActivityTimeline activities={recentActivity} limit={10} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p>최근 활동이 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Actions - Only show if there are any */}
      {pendingActions && pendingActions.length > 0 && (
        <Card className="mb-6 border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              대기 중인 작업
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              처리가 필요한 {pendingActions.length}건의 작업이 있습니다
            </p>
          </CardHeader>
          <CardContent>
            <PendingActionsList actions={pendingActions} />
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/products/new">
          <Card className="hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer h-full">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">새 상품 추가</h3>
                <p className="text-sm text-gray-600 mt-1">새 상품을 등록하고 판매하세요</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/orders">
          <Card className="hover:border-green-500 hover:shadow-lg transition-all cursor-pointer h-full">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">주문 관리</h3>
                <p className="text-sm text-gray-600 mt-1">고객 주문을 확인하고 관리하세요</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/settlements">
          <Card className="hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer h-full">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">정산 신청</h3>
                <p className="text-sm text-gray-600 mt-1">정산 내역 확인 및 신청</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/verifications">
          <Card className="hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer h-full">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">검증 상태</h3>
                <p className="text-sm text-gray-600 mt-1">상품 검증 진행 상황 확인</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

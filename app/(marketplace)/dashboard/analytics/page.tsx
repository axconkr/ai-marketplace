'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { StatsCard } from '@/components/analytics/StatsCard';
import { useRequireRole } from '@/lib/auth/middleware-helper';
import { UserRole } from '@/src/lib/auth/types';
import {
  useSellerOverview,
  useRevenueData,
  useTopProducts,
  useOrdersTimeline,
  useCustomerAnalytics
} from '@/hooks/use-analytics';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  Award
} from 'lucide-react';

type Period = '7d' | '30d' | '90d' | '1y';

/**
 * Seller Dashboard - Analytics
 * PROTECTED: Only SERVICE_PROVIDER and ADMIN can access
 */

const periodOptions = [
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '최근 30일' },
  { value: '90d', label: '최근 90일' },
  { value: '1y', label: '최근 1년' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  // Require service provider or admin role
  useRequireRole([UserRole.SERVICE_PROVIDER, UserRole.ADMIN]);

  const [period, setPeriod] = useState<Period>('30d');

  const { data: overview } = useSellerOverview(period);
  const { data: revenueData } = useRevenueData(period);
  const { data: topProducts } = useTopProducts(period, 10);
  const { data: ordersTimeline } = useOrdersTimeline(period);
  const { data: customerStats } = useCustomerAnalytics(period);

  const getTrend = (value: number): 'up' | 'down' | 'neutral' => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  // Prepare product category data for pie chart
  const categoryData = topProducts?.products.reduce((acc: any, product: any) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    acc[category].value += product.revenue;
    return acc;
  }, {});

  const pieData = categoryData ? Object.values(categoryData) : [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">분석</h1>
          <p className="text-gray-600 mt-1">비즈니스 성과에 대한 상세한 인사이트</p>
        </div>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="총 매출"
          value={formatCurrency(overview?.netRevenue || 0)}
          change={overview?.revenueChange}
          trend={getTrend(overview?.revenueChange || 0)}
          icon={DollarSign}
        />
        <StatsCard
          title="총 주문"
          value={overview?.totalOrders || 0}
          change={overview?.ordersChange}
          trend={getTrend(overview?.ordersChange || 0)}
          icon={ShoppingCart}
        />
        <StatsCard
          title="순 고객"
          value={overview?.uniqueCustomers || 0}
          icon={Users}
        />
        <StatsCard
          title="평균 주문 금액"
          value={formatCurrency(overview?.averageOrderValue || 0)}
          icon={TrendingUp}
        />
        <StatsCard
          title="활성 상품"
          value={overview?.activeProducts || 0}
          icon={Package}
        />
        <StatsCard
          title="전환율"
          value={`${overview?.conversionRate?.toFixed(2) || 0}%`}
          icon={Award}
        />
      </div>

      {/* Revenue Trend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>매출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueData?.data && revenueData.data.length > 0 ? (
            <RevenueChart data={revenueData.data} height={350} />
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              매출 데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>주문 타임라인</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersTimeline?.data && ordersTimeline.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersTimeline.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="완료" />
                <Bar dataKey="pending" fill="#f59e0b" name="대기" />
                <Bar dataKey="failed" fill="#ef4444" name="실패" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              주문 데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Products by Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>매출 상위 상품</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts?.products && topProducts.products.length > 0 ? (
              <div className="space-y-4">
                {topProducts.products.slice(0, 5).map((product: any, index: number) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.title}</p>
                        <p className="text-sm text-gray-500">
                          {product.orders}건 주문 • {product.conversionRate.toFixed(1)}% 전환율
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">상품 데이터가 없습니다</div>
            )}
          </CardContent>
        </Card>

        {/* Customer Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>고객 인사이트</CardTitle>
          </CardHeader>
          <CardContent>
            {customerStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">전체 고객</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {customerStats.totalCustomers}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">신규 고객</p>
                    <p className="text-2xl font-bold text-green-600">
                      {customerStats.newCustomers}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">재방문</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {customerStats.returningCustomers}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">평균 가치</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(customerStats.averageCustomerValue)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">주요 고객</h4>
                  <div className="space-y-2">
                    {customerStats.topCustomers?.slice(0, 5).map((customer: any) => (
                      <div key={customer.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{customer.name || customer.email}</p>
                          <p className="text-xs text-gray-500">{customer.orders}건 주문</p>
                        </div>
                        <p className="font-semibold text-sm text-gray-900">
                          {formatCurrency(customer.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">고객 데이터가 없습니다</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Category Distribution */}
      {pieData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

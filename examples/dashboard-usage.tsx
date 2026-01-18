/**
 * Seller Dashboard Usage Examples
 *
 * This file demonstrates how to use the dashboard components,
 * hooks, and utilities in your own pages and components.
 */

// ============================================================================
// EXAMPLE 1: Basic Dashboard Component
// ============================================================================

import { useSellerOverview, useRevenueData } from '@/hooks/use-analytics';
import { StatsCard } from '@/components/analytics/StatsCard';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, ShoppingCart } from 'lucide-react';

export function BasicDashboard() {
  const { data: overview, isLoading } = useSellerOverview('30d');
  const { data: revenue } = useRevenueData('30d');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="Revenue"
          value={formatCurrency(overview?.netRevenue || 0)}
          change={overview?.revenueChange}
          trend="up"
          icon={DollarSign}
        />
        <StatsCard
          title="Orders"
          value={overview?.totalOrders || 0}
          change={overview?.ordersChange}
          trend="up"
          icon={ShoppingCart}
        />
      </div>

      {/* Revenue Chart */}
      {revenue?.data && (
        <RevenueChart data={revenue.data} />
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Custom Period Selector
// ============================================================================

import { useState } from 'react';

type Period = '7d' | '30d' | '90d' | '1y';

export function DashboardWithPeriodSelector() {
  const [period, setPeriod] = useState<Period>('30d');
  const { data: overview } = useSellerOverview(period);

  return (
    <div>
      {/* Period Selector */}
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value as Period)}
        className="px-4 py-2 border rounded"
      >
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
        <option value="1y">Last year</option>
      </select>

      {/* Display Data */}
      <div className="mt-4">
        <p>Revenue: {formatCurrency(overview?.netRevenue || 0)}</p>
        <p>Orders: {overview?.totalOrders || 0}</p>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Top Products Display
// ============================================================================

import { useTopProducts } from '@/hooks/use-analytics';
import { TopProductsList } from '@/components/analytics/TopProductsList';

export function TopProductsSection() {
  const { data, isLoading } = useTopProducts('30d', 5);

  if (isLoading) return <div>Loading products...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Top Products</h2>
      {data?.products && (
        <TopProductsList products={data.products} />
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Orders Management
// ============================================================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrdersTable } from '@/components/analytics/OrdersTable';
import { Input } from '@/components/ui/input';

export function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      return res.json();
    }
  });

  const filteredOrders = orders?.filter((order: any) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Orders Table */}
      {filteredOrders && (
        <OrdersTable orders={filteredOrders} />
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Export Functionality
// ============================================================================

import { useExportData } from '@/hooks/use-analytics';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function ExportButton() {
  const exportMutation = useExportData();

  const handleExport = (type: 'orders' | 'products' | 'settlements') => {
    exportMutation.mutate({ type, period: '30d' });
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleExport('orders')}
        disabled={exportMutation.isPending}
      >
        <Download className="w-4 h-4 mr-2" />
        Export Orders
      </Button>
      <Button
        onClick={() => handleExport('products')}
        disabled={exportMutation.isPending}
      >
        <Download className="w-4 h-4 mr-2" />
        Export Products
      </Button>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Customer Analytics
// ============================================================================

import { useCustomerAnalytics } from '@/hooks/use-analytics';

export function CustomerInsights() {
  const { data: customers } = useCustomerAnalytics('30d');

  if (!customers) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-blue-50 rounded">
        <p className="text-sm text-gray-600">Total Customers</p>
        <p className="text-2xl font-bold">{customers.totalCustomers}</p>
      </div>
      <div className="p-4 bg-green-50 rounded">
        <p className="text-sm text-gray-600">New Customers</p>
        <p className="text-2xl font-bold">{customers.newCustomers}</p>
      </div>
      <div className="p-4 bg-purple-50 rounded">
        <p className="text-sm text-gray-600">Returning</p>
        <p className="text-2xl font-bold">{customers.returningCustomers}</p>
      </div>
      <div className="p-4 bg-orange-50 rounded">
        <p className="text-sm text-gray-600">Avg Value</p>
        <p className="text-2xl font-bold">
          {formatCurrency(customers.averageCustomerValue)}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Pending Actions
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { PendingActionsList } from '@/components/analytics/PendingActionsList';

export function PendingActionsWidget() {
  const { data: actions } = useQuery({
    queryKey: ['pending-actions'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/seller/pending-actions');
      return res.json();
    }
  });

  if (!actions || actions.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Pending Actions</h2>
      <PendingActionsList actions={actions} />
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Multi-Chart Dashboard
// ============================================================================

import { useOrdersTimeline } from '@/hooks/use-analytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function MultiChartDashboard() {
  const { data: revenue } = useRevenueData('30d');
  const { data: orders } = useOrdersTimeline('30d');

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      {revenue?.data && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <RevenueChart data={revenue.data} height={300} />
        </div>
      )}

      {/* Orders Timeline */}
      {orders?.data && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Orders Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orders.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 9: Real-time Updates
// ============================================================================

export function RealTimeDashboard() {
  const { data: overview } = useSellerOverview('30d'); // Auto-refreshes every 60s

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm text-gray-600">Live data (updates every 60s)</span>
      </div>

      <StatsCard
        title="Revenue"
        value={formatCurrency(overview?.netRevenue || 0)}
        change={overview?.revenueChange}
        trend="up"
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 10: Custom Analytics Hook
// ============================================================================

import { useQuery } from '@tanstack/react-query';

export function useCustomAnalytics(sellerId: string) {
  return useQuery({
    queryKey: ['custom-analytics', sellerId],
    queryFn: async () => {
      // Custom analytics logic
      const [overview, revenue, products] = await Promise.all([
        fetch('/api/analytics/seller/overview?period=30d').then(r => r.json()),
        fetch('/api/analytics/seller/revenue?period=30d').then(r => r.json()),
        fetch('/api/analytics/seller/top-products?limit=10').then(r => r.json())
      ]);

      return {
        overview,
        revenue,
        products,
        // Custom calculations
        profitMargin: (overview.netRevenue / overview.totalRevenue) * 100,
        dailyAverage: revenue.average,
        topProduct: products.products[0]
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

// Usage
export function CustomAnalyticsDashboard() {
  const { data, isLoading } = useCustomAnalytics('seller_123');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Profit Margin: {data?.profitMargin.toFixed(2)}%</p>
      <p>Daily Average: {formatCurrency(data?.dailyAverage || 0)}</p>
      <p>Top Product: {data?.topProduct?.title}</p>
    </div>
  );
}

// ============================================================================
// EXAMPLE 11: Error Handling
// ============================================================================

export function DashboardWithErrorHandling() {
  const { data, isLoading, error } = useSellerOverview('30d');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-semibold">Error loading dashboard</p>
        <p className="text-red-600 text-sm mt-1">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard content */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 12: Responsive Dashboard
// ============================================================================

export function ResponsiveDashboard() {
  const { data: overview } = useSellerOverview('30d');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Revenue"
          value={formatCurrency(overview?.netRevenue || 0)}
          icon={DollarSign}
        />
        {/* More cards... */}
      </div>
    </div>
  );
}

// ============================================================================
// Notes:
// - All hooks use React Query for caching and auto-refresh
// - Charts are responsive by default
// - All monetary values are in cents, use formatCurrency() for display
// - Period options: '7d', '30d', '90d', '1y'
// - Export supports: 'orders', 'products', 'settlements'
// ============================================================================

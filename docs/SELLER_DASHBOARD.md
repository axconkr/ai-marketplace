# Seller Dashboard Documentation

Comprehensive analytics and management dashboard for AI Marketplace sellers.

## Overview

The Seller Dashboard provides a unified interface for sellers to:
- Monitor revenue and sales performance
- Manage products and orders
- Track settlements and payouts
- View detailed analytics and insights
- Export data for reporting

## Features

### 1. Dashboard Overview (`/dashboard`)

Main dashboard with key metrics and quick actions.

**Components:**
- Summary cards (revenue, orders, products, pending payouts)
- Revenue trend chart (last 30 days)
- Recent orders table
- Top products by sales
- Pending actions list
- Quick action buttons

**Metrics:**
- Total Revenue (net after platform fees)
- Total Orders
- Active Products
- Pending Payout
- Average Order Value
- Unique Customers
- Conversion Rate

**Time Periods:**
- Last 7 days
- Last 30 days
- Last 90 days
- Last year

### 2. Analytics Page (`/dashboard/analytics`)

Detailed analytics with multiple charts and insights.

**Charts:**
- Revenue Trend (line chart)
- Orders Timeline (bar chart)
- Revenue by Category (pie chart)
- Top Products by Revenue
- Customer Insights

**Metrics:**
- Customer lifetime value
- New vs. returning customers
- Product performance
- Conversion rates
- Category distribution

### 3. Orders Management (`/dashboard/orders`)

Complete order management interface.

**Features:**
- Order list with filtering
- Search by order ID, product, or customer
- Status filtering (pending, paid, completed, refunded)
- Order details view
- Export to CSV

**Order Information:**
- Order ID
- Product details
- Customer information
- Total amount
- Seller earnings
- Platform fees
- Status
- Date/time

### 4. Products Management (`/dashboard/products`)

Enhanced product management (existing feature).

**Features:**
- Product list with performance metrics
- Bulk actions
- Advanced filters
- Inline editing
- Product analytics

### 5. Settlements (`/dashboard/settlements`)

Settlement and payout tracking (existing feature).

**Features:**
- Settlement history
- Pending payouts
- Settlement breakdown
- Payout status

### 6. Verifications (`/dashboard/verifications`)

Product verification management (existing feature).

**Features:**
- Verification status
- Verification requests
- Quality scores
- Badges

## API Endpoints

### Analytics Endpoints

#### GET `/api/analytics/seller/overview`
Get dashboard summary statistics.

**Query Parameters:**
- `period`: `7d` | `30d` | `90d` | `1y` (default: `30d`)

**Response:**
```json
{
  "totalRevenue": 150000,
  "netRevenue": 127500,
  "platformFees": 22500,
  "totalOrders": 45,
  "uniqueCustomers": 32,
  "averageOrderValue": 3333,
  "revenueChange": 12.5,
  "ordersChange": 5.2,
  "activeProducts": 8,
  "pendingPayout": 25000,
  "conversionRate": 3.2
}
```

#### GET `/api/analytics/seller/revenue`
Get revenue timeline data.

**Query Parameters:**
- `period`: `7d` | `30d` | `90d` | `1y` (default: `30d`)

**Response:**
```json
{
  "data": [
    {
      "date": "2024-01-01",
      "revenue": 5000,
      "orders": 3
    }
  ],
  "total": 150000,
  "average": 5000,
  "growth": 12.5
}
```

#### GET `/api/analytics/seller/top-products`
Get best-selling products.

**Query Parameters:**
- `period`: `7d` | `30d` | `90d` | `1y` (default: `30d`)
- `limit`: number (default: `10`)

**Response:**
```json
{
  "products": [
    {
      "id": "prod_123",
      "title": "AI Model XYZ",
      "revenue": 50000,
      "orders": 15,
      "conversionRate": 4.5,
      "averageRating": 4.8,
      "reviewCount": 12
    }
  ]
}
```

#### GET `/api/analytics/seller/orders-timeline`
Get orders over time with status breakdown.

**Query Parameters:**
- `period`: `7d` | `30d` | `90d` | `1y` (default: `30d`)

**Response:**
```json
{
  "data": [
    {
      "date": "2024-01-01",
      "orders": 5,
      "completed": 4,
      "pending": 1,
      "failed": 0
    }
  ]
}
```

#### GET `/api/analytics/seller/customers`
Get customer analytics.

**Query Parameters:**
- `period`: `7d` | `30d` | `90d` | `1y` (default: `30d`)

**Response:**
```json
{
  "totalCustomers": 32,
  "newCustomers": 15,
  "returningCustomers": 17,
  "averageCustomerValue": 4687,
  "topCustomers": [
    {
      "id": "user_123",
      "email": "customer@example.com",
      "name": "John Doe",
      "orders": 5,
      "revenue": 15000
    }
  ]
}
```

#### GET `/api/analytics/seller/pending-actions`
Get pending actions for the seller.

**Response:**
```json
[
  {
    "type": "draft_products",
    "title": "3 draft products",
    "description": "Complete and publish your draft products",
    "action": "/dashboard/products?status=draft",
    "priority": "medium"
  }
]
```

#### POST `/api/analytics/seller/export`
Export data to CSV.

**Request Body:**
```json
{
  "type": "orders" | "products" | "settlements",
  "period": "30d"
}
```

**Response:**
```json
{
  "data": [
    {
      "Order ID": "ord_123",
      "Date": "2024-01-01",
      "Product": "AI Model XYZ",
      "Buyer": "customer@example.com",
      "Amount": 5000,
      "Platform Fee": 750,
      "Your Earnings": 4250
    }
  ]
}
```

### Orders Endpoints

#### GET `/api/orders`
Get seller's orders.

**Query Parameters:**
- `limit`: number (optional)

**Response:**
```json
[
  {
    "id": "ord_123",
    "buyer_id": "user_123",
    "product_id": "prod_123",
    "amount": 5000,
    "seller_amount": 4250,
    "platform_fee": 750,
    "status": "COMPLETED",
    "createdAt": "2024-01-01T00:00:00Z",
    "product": {
      "id": "prod_123",
      "name": "AI Model XYZ"
    },
    "buyer": {
      "email": "customer@example.com",
      "name": "John Doe"
    }
  }
]
```

## React Query Hooks

### `useSellerOverview(period)`
Hook for fetching dashboard overview.

```tsx
const { data, isLoading } = useSellerOverview('30d');
```

### `useRevenueData(period)`
Hook for fetching revenue timeline.

```tsx
const { data, isLoading } = useRevenueData('30d');
```

### `useTopProducts(period, limit)`
Hook for fetching top products.

```tsx
const { data, isLoading } = useTopProducts('30d', 10);
```

### `useOrdersTimeline(period)`
Hook for fetching orders timeline.

```tsx
const { data, isLoading } = useOrdersTimeline('30d');
```

### `useCustomerAnalytics(period)`
Hook for fetching customer analytics.

```tsx
const { data, isLoading } = useCustomerAnalytics('30d');
```

### `useExportData()`
Hook for exporting data to CSV.

```tsx
const exportMutation = useExportData();

exportMutation.mutate({
  type: 'orders',
  period: '30d'
});
```

## Components

### StatsCard
Display metric with optional change percentage.

```tsx
<StatsCard
  title="Total Revenue"
  value={formatCurrency(revenue)}
  change={12.5}
  trend="up"
  icon={DollarSign}
/>
```

### RevenueChart
Line chart for revenue visualization.

```tsx
<RevenueChart
  data={revenueData}
  height={300}
/>
```

### TopProductsList
List of top-performing products.

```tsx
<TopProductsList products={topProducts} />
```

### OrdersTable
Table for displaying orders.

```tsx
<OrdersTable
  orders={orders}
  limit={10}
/>
```

### PendingActionsList
List of pending actions requiring attention.

```tsx
<PendingActionsList actions={pendingActions} />
```

## Services

### Analytics Service

Located in `lib/services/analytics.ts`.

**Functions:**

#### `getSellerAnalytics(sellerId, period)`
Get comprehensive analytics for a seller.

#### `getRecentOrders(sellerId, limit)`
Get recent orders for a seller.

#### `getPendingActions(sellerId)`
Get pending actions for a seller.

#### `getOrdersTimeline(sellerId, period)`
Get orders timeline data.

#### `getCustomerAnalytics(sellerId, period)`
Get customer analytics data.

## Export Functionality

### CSV Export

The dashboard supports exporting data to CSV format:

**Supported Types:**
- Orders
- Products
- Settlements

**Usage:**
```tsx
const exportMutation = useExportData();

const handleExport = () => {
  exportMutation.mutate({
    type: 'orders',
    period: '30d'
  });
};
```

**Export Functions:**
- `formatOrdersForExport(orders)`
- `formatProductsForExport(products)`
- `formatSettlementsForExport(settlements)`
- `exportToCSV(data, filename)`

## Responsive Design

The dashboard is fully responsive:

**Mobile (< 768px):**
- Single column layout
- Collapsible charts
- Simplified tables
- Touch-friendly buttons

**Tablet (768px - 1024px):**
- 2-column grid
- Compact charts
- Scrollable tables

**Desktop (> 1024px):**
- 3-4 column grid
- Full-size charts
- Complete tables
- Sidebar navigation

## Performance Optimization

### Real-time Updates

Data is automatically refreshed every 60 seconds using React Query:

```tsx
useQuery({
  queryKey: ['analytics', 'overview', period],
  queryFn: fetchData,
  refetchInterval: 60000, // 1 minute
});
```

### Caching

React Query automatically caches API responses to minimize network requests.

### Lazy Loading

Charts and heavy components are only loaded when visible.

## Security

- All endpoints require authentication via `verifyAuth()`
- Sellers can only access their own data
- SQL injection prevention via Prisma ORM
- XSS protection via React's built-in escaping

## Error Handling

All API endpoints include comprehensive error handling:

```typescript
try {
  const data = await fetchData();
  return NextResponse.json(data);
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'Failed to fetch data' },
    { status: 500 }
  );
}
```

## Database Queries

All analytics queries are optimized:
- Indexed fields for fast lookups
- Aggregation at database level
- Minimal data transfer
- Efficient joins

## Future Enhancements

Planned features:
- Real-time notifications
- Advanced filtering
- Custom date ranges
- Comparative analytics
- Predictive insights
- Multi-currency support
- Revenue forecasting
- A/B testing analytics
- Cohort analysis
- Funnel visualization

## Troubleshooting

### Common Issues

**Issue: Charts not displaying**
- Check if data array is not empty
- Verify date format is correct
- Ensure recharts is installed

**Issue: Export not working**
- Check browser allows downloads
- Verify data is not empty
- Check CSV formatting

**Issue: Slow performance**
- Enable caching
- Reduce refresh interval
- Optimize database queries
- Use pagination

## Support

For issues or questions:
- Check error logs in browser console
- Verify API endpoint responses
- Review authentication status
- Check database connection

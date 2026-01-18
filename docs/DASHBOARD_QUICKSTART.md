# Seller Dashboard Quick Start Guide

## Getting Started

### 1. Access the Dashboard

Navigate to `/dashboard` after logging in as a seller.

### 2. Dashboard Overview

**Main Features:**
- Revenue and order statistics
- Real-time performance charts
- Recent orders at a glance
- Top-selling products
- Pending action items

### 3. Key Metrics Explained

#### Total Revenue
Your total earnings after platform fees for the selected period.

#### Total Orders
Number of completed orders in the selected period.

#### Active Products
Number of products currently available for sale.

#### Pending Payout
Amount waiting to be paid out in your next settlement.

#### Average Order Value
Average revenue per order.

#### Conversion Rate
Percentage of product views that result in purchases.

## Navigation

### Dashboard Pages

```
/dashboard              → Overview with key metrics
/dashboard/analytics    → Detailed analytics and charts
/dashboard/orders       → Order management
/dashboard/products     → Product management
/dashboard/settlements  → Settlement tracking
/dashboard/verifications → Product verifications
```

## Common Tasks

### View Detailed Analytics

1. Click "Analytics" in the sidebar
2. Select time period (7d, 30d, 90d, 1y)
3. Explore charts and metrics

### Manage Orders

1. Go to `/dashboard/orders`
2. Use search to find specific orders
3. Filter by status
4. Click "View" for order details
5. Export to CSV for reporting

### Export Data

**Orders Export:**
```tsx
1. Go to Orders page
2. Click "Export to CSV"
3. File downloads automatically
```

**Products Export:**
```tsx
1. Go to Products page
2. Click "Export"
3. Select date range
```

### Track Revenue

**Revenue Chart:**
- Daily breakdown for 7d and 30d periods
- Monthly breakdown for 90d and 1y periods
- Hover for detailed information
- Compare with previous period

### Monitor Top Products

**View Best Sellers:**
1. Check "Top Products" card on dashboard
2. See revenue, orders, and conversion rate
3. Click "View All" for complete list
4. Identify your best performers

### Customer Insights

**Customer Analytics:**
1. Go to Analytics page
2. View customer metrics:
   - Total customers
   - New vs. returning
   - Average customer value
   - Top customers by revenue

## Tips & Best Practices

### 1. Regular Monitoring

- Check dashboard daily for new orders
- Review weekly performance trends
- Export monthly reports for accounting

### 2. Action Items

- Address pending actions promptly
- Complete draft products
- Verify pending payouts
- Fix verification issues

### 3. Performance Optimization

- Analyze top products for success patterns
- Review low-performing products
- Monitor conversion rates
- Track customer retention

### 4. Data Export

- Export orders monthly for tax records
- Keep product performance reports
- Track settlement history
- Maintain customer records

## Keyboard Shortcuts

```
/ → Focus search
Esc → Close modals
← → → Navigate periods
```

## Mobile Access

Dashboard is fully responsive:

**Mobile Features:**
- Swipe charts horizontally
- Tap stats for details
- Collapsible sections
- Touch-friendly buttons

## Troubleshooting

### Charts Not Loading

1. Refresh the page
2. Check internet connection
3. Clear browser cache
4. Try different browser

### Export Not Working

1. Allow downloads in browser
2. Check popup blocker
3. Verify data exists
4. Try different format

### Missing Data

1. Verify time period selected
2. Check if you have orders
3. Ensure products are active
4. Contact support if persists

## API Integration

### For Custom Dashboards

```typescript
// Fetch overview data
const response = await fetch('/api/analytics/seller/overview?period=30d');
const data = await response.json();

// Fetch revenue timeline
const revenueRes = await fetch('/api/analytics/seller/revenue?period=30d');
const revenue = await revenueRes.json();

// Fetch top products
const productsRes = await fetch('/api/analytics/seller/top-products?limit=10');
const products = await productsRes.json();
```

## React Hooks Usage

```tsx
import { useSellerOverview, useRevenueData } from '@/hooks/use-analytics';

function MyDashboard() {
  const { data: overview } = useSellerOverview('30d');
  const { data: revenue } = useRevenueData('30d');

  return (
    <div>
      <h1>Revenue: {overview.totalRevenue}</h1>
      <RevenueChart data={revenue.data} />
    </div>
  );
}
```

## Permissions Required

- **Seller Role**: Access to own dashboard
- **Admin Role**: Access to all dashboards
- **Verifier Role**: Access to verifier dashboard only

## Data Refresh

- **Auto-refresh**: Every 60 seconds
- **Manual refresh**: Reload page
- **Real-time**: Future feature

## Security

- All data is seller-scoped
- Authentication required
- HTTPS only
- Session-based access

## Support

### Need Help?

1. Check documentation: `/docs/SELLER_DASHBOARD.md`
2. Review FAQ section
3. Contact support
4. Report bugs via GitHub issues

## Quick Reference

### Time Periods
- `7d` = Last 7 days
- `30d` = Last 30 days
- `90d` = Last 90 days
- `1y` = Last year

### Order Statuses
- `PENDING` = Awaiting payment
- `PAID` = Payment successful
- `COMPLETED` = Order fulfilled
- `REFUNDED` = Payment refunded
- `CANCELLED` = Order cancelled
- `FAILED` = Payment failed

### Verification Levels
- `0` = Basic (Free)
- `1` = Standard ($50)
- `2` = Professional ($150)
- `3` = Enterprise ($500)

## Performance Tips

### Speed Up Dashboard

1. Use recommended browsers (Chrome, Firefox, Safari)
2. Close unused tabs
3. Clear cache periodically
4. Disable browser extensions
5. Use stable internet connection

### Optimize Data Loading

1. Select shorter time periods for faster loading
2. Use pagination for large datasets
3. Export data for offline analysis
4. Bookmark frequently used pages

## Next Steps

1. **Complete Your Profile**
   - Add bank account for settlements
   - Verify contact information
   - Set notification preferences

2. **List Your Products**
   - Create product listings
   - Add detailed descriptions
   - Upload quality images
   - Request verifications

3. **Monitor Performance**
   - Check daily metrics
   - Review weekly trends
   - Optimize based on data
   - Respond to customer feedback

4. **Grow Your Business**
   - Analyze top products
   - Identify market trends
   - Improve conversion rates
   - Expand product catalog

## Resources

- **Full Documentation**: `/docs/SELLER_DASHBOARD.md`
- **Implementation Guide**: `/docs/DASHBOARD_IMPLEMENTATION.md`
- **API Reference**: Check documentation
- **Component Library**: Explore `components/analytics/`

---

**Welcome to your AI Marketplace Seller Dashboard!** 🚀

Start tracking your success today.

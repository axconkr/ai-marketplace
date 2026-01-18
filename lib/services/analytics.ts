import { prisma } from '@/lib/prisma';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export type Period = '7d' | '30d' | '90d' | '1y';

interface PeriodDates {
  startDate: Date;
  endDate: Date;
}

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface ProductPerformance {
  id: string;
  title: string;
  revenue: number;
  orders: number;
  views: number;
  conversionRate: number;
  averageRating: number;
  reviewCount: number;
}

interface AnalyticsSummary {
  totalRevenue: number;
  netRevenue: number;
  platformFees: number;
  totalOrders: number;
  uniqueCustomers: number;
  averageOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  activeProducts: number;
  pendingPayout: number;
  conversionRate: number;
}

interface SellerAnalytics {
  summary: AnalyticsSummary;
  timeline: RevenueDataPoint[];
  products: ProductPerformance[];
}

function getPeriodDates(period: Period): PeriodDates {
  const endDate = endOfDay(new Date());
  let startDate: Date;

  switch (period) {
    case '7d':
      startDate = startOfDay(subDays(endDate, 7));
      break;
    case '30d':
      startDate = startOfDay(subDays(endDate, 30));
      break;
    case '90d':
      startDate = startOfDay(subDays(endDate, 90));
      break;
    case '1y':
      startDate = startOfDay(subDays(endDate, 365));
      break;
    default:
      startDate = startOfDay(subDays(endDate, 30));
  }

  return { startDate, endDate };
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

async function getPreviousPeriodStats(sellerId: string, period: Period) {
  const { startDate, endDate } = getPeriodDates(period);
  const duration = endDate.getTime() - startDate.getTime();

  const prevStartDate = new Date(startDate.getTime() - duration);
  const prevEndDate = new Date(endDate.getTime() - duration);

  const orders = await prisma.order.findMany({
    where: {
      product: { seller_id: sellerId },
      paid_at: { gte: prevStartDate, lte: prevEndDate },
      status: { in: ['PAID', 'COMPLETED'] }
    }
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.seller_amount, 0);
  const totalOrders = orders.length;

  return { totalRevenue, totalOrders };
}

function getRevenueTimeline(orders: any[], period: Period): RevenueDataPoint[] {
  const groupBy = period === '7d' || period === '30d' ? 'day' : 'month';

  const grouped = orders.reduce((acc, order) => {
    const key = groupBy === 'day'
      ? format(order.paid_at, 'yyyy-MM-dd')
      : format(order.paid_at, 'yyyy-MM');

    if (!acc[key]) {
      acc[key] = { date: key, revenue: 0, orders: 0 };
    }

    acc[key].revenue += order.seller_amount;
    acc[key].orders += 1;

    return acc;
  }, {} as Record<string, RevenueDataPoint>);

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

async function getProductPerformance(
  sellerId: string,
  startDate: Date,
  endDate: Date
): Promise<ProductPerformance[]> {
  const products = await prisma.product.findMany({
    where: { seller_id: sellerId },
    include: {
      orders: {
        where: {
          paid_at: { gte: startDate, lte: endDate },
          status: { in: ['PAID', 'COMPLETED'] }
        }
      }
    }
  });

  return products.map(product => {
    const revenue = product.orders.reduce((sum, o) => sum + o.seller_amount, 0);
    const orders = product.orders.length;
    const views = product.download_count || 0;
    const conversionRate = views > 0 ? (orders / views) * 100 : 0;

    return {
      id: product.id,
      title: product.name, // Using 'name' field from Product model
      revenue,
      orders,
      views,
      conversionRate,
      averageRating: product.rating_average || 0, // Product has rating_average field
      reviewCount: product.rating_count || 0 // Product has rating_count field
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

export async function getSellerAnalytics(
  sellerId: string,
  period: Period = '30d'
): Promise<SellerAnalytics> {
  const { startDate, endDate } = getPeriodDates(period);

  // Get orders in period
  const orders = await prisma.order.findMany({
    where: {
      product: { seller_id: sellerId },
      paid_at: { gte: startDate, lte: endDate },
      status: { in: ['PAID', 'COMPLETED'] }
    },
    include: {
      product: true
    }
  });

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const platformFees = orders.reduce((sum, o) => sum + o.platform_fee, 0);
  const netRevenue = orders.reduce((sum, o) => sum + o.seller_amount, 0);

  const totalOrders = orders.length;
  const uniqueCustomers = new Set(orders.map(o => o.buyer_id)).size;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Get products count
  const activeProducts = await prisma.product.count({
    where: {
      seller_id: sellerId,
      status: 'active'
    }
  });

  // Get pending settlement amount
  const pendingSettlement = await prisma.settlement.findFirst({
    where: {
      seller_id: sellerId,
      status: 'PENDING'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const pendingPayout = pendingSettlement?.payout_amount || 0;

  // Get products performance
  const productStats = await getProductPerformance(sellerId, startDate, endDate);

  // Get timeline data
  const timeline = getRevenueTimeline(orders, period);

  // Get previous period for comparison
  const previousPeriod = await getPreviousPeriodStats(sellerId, period);
  const revenueChange = calculateChange(netRevenue, previousPeriod.totalRevenue);
  const ordersChange = calculateChange(totalOrders, previousPeriod.totalOrders);

  // Calculate conversion rate (orders / total product views)
  const totalViews = productStats.reduce((sum, p) => sum + p.views, 0);
  const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

  return {
    summary: {
      totalRevenue,
      netRevenue,
      platformFees,
      totalOrders,
      uniqueCustomers,
      averageOrderValue,
      revenueChange,
      ordersChange,
      activeProducts,
      pendingPayout,
      conversionRate
    },
    timeline,
    products: productStats
  };
}

export async function getRecentOrders(sellerId: string, limit: number = 5) {
  return prisma.order.findMany({
    where: {
      product: { seller_id: sellerId }
    },
    include: {
      product: true,
      buyer: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });
}

export async function getPendingActions(sellerId: string) {
  const [
    draftProducts,
    pendingSettlements,
    lowStockProducts
  ] = await Promise.all([
    // Draft products
    prisma.product.count({
      where: {
        seller_id: sellerId,
        status: 'draft'
      }
    }),
    // Pending settlements
    prisma.settlement.count({
      where: {
        seller_id: sellerId,
        status: 'PENDING'
      }
    }),
    // Products with verification issues
    prisma.product.count({
      where: {
        seller_id: sellerId,
        verification_level: -1
      }
    })
  ]);

  const actions = [];

  if (draftProducts > 0) {
    actions.push({
      type: 'draft_products',
      title: `${draftProducts} draft product${draftProducts > 1 ? 's' : ''}`,
      description: 'Complete and publish your draft products',
      action: '/dashboard/products?status=draft',
      priority: 'medium'
    });
  }

  if (pendingSettlements > 0) {
    actions.push({
      type: 'pending_settlement',
      title: `${pendingSettlements} pending settlement${pendingSettlements > 1 ? 's' : ''}`,
      description: 'Review your pending settlements',
      action: '/dashboard/settlements',
      priority: 'high'
    });
  }

  if (lowStockProducts > 0) {
    actions.push({
      type: 'verification_failed',
      title: `${lowStockProducts} product${lowStockProducts > 1 ? 's' : ''} failed verification`,
      description: 'Review and fix verification issues',
      action: '/dashboard/products?verification=failed',
      priority: 'high'
    });
  }

  return actions;
}

export async function getOrdersTimeline(sellerId: string, period: Period = '30d') {
  const { startDate, endDate } = getPeriodDates(period);

  const orders = await prisma.order.findMany({
    where: {
      product: { seller_id: sellerId },
      createdAt: { gte: startDate, lte: endDate }
    }
  });

  const groupBy = period === '7d' || period === '30d' ? 'day' : 'month';

  const grouped = orders.reduce((acc, order) => {
    const key = groupBy === 'day'
      ? format(order.createdAt, 'yyyy-MM-dd')
      : format(order.createdAt, 'yyyy-MM');

    if (!acc[key]) {
      acc[key] = { date: key, orders: 0, completed: 0, pending: 0, failed: 0 };
    }

    acc[key].orders += 1;
    if (order.status === 'COMPLETED') acc[key].completed += 1;
    if (order.status === 'PENDING') acc[key].pending += 1;
    if (order.status === 'FAILED') acc[key].failed += 1;

    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
}

export async function getCustomerAnalytics(sellerId: string, period: Period = '30d') {
  const { startDate, endDate } = getPeriodDates(period);

  const orders = await prisma.order.findMany({
    where: {
      product: { seller_id: sellerId },
      paid_at: { gte: startDate, lte: endDate },
      status: { in: ['PAID', 'COMPLETED'] }
    },
    include: {
      buyer: true
    }
  });

  const customerStats = orders.reduce((acc, order) => {
    const buyerId = order.buyer_id;
    if (!acc[buyerId]) {
      acc[buyerId] = {
        id: buyerId,
        email: order.buyer.email,
        name: order.buyer.name,
        orders: 0,
        revenue: 0,
        firstPurchase: order.paid_at,
        lastPurchase: order.paid_at
      };
    }

    acc[buyerId].orders += 1;
    acc[buyerId].revenue += order.seller_amount;

    if (order.paid_at && order.paid_at < acc[buyerId].firstPurchase) {
      acc[buyerId].firstPurchase = order.paid_at;
    }
    if (order.paid_at && order.paid_at > acc[buyerId].lastPurchase) {
      acc[buyerId].lastPurchase = order.paid_at;
    }

    return acc;
  }, {} as Record<string, any>);

  const customers = Object.values(customerStats).sort((a: any, b: any) => b.revenue - a.revenue);

  const totalCustomers = customers.length;
  const newCustomers = customers.filter((c: any) => c.orders === 1).length;
  const returningCustomers = totalCustomers - newCustomers;
  const totalRevenue = customers.reduce((sum: number, c: any) => sum + c.revenue, 0);
  const averageCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    averageCustomerValue,
    topCustomers: customers.slice(0, 10)
  };
}

/**
 * Buyer Analytics Overview API
 * GET /api/analytics/buyer/overview
 * PROTECTED: Only client and admin can access
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isClient } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Require user, client or admin role
    const authUser = await requireRole(request, ['user', 'client', 'admin']);

    // Verify user is a client
    if (!isClient(authUser)) {
      return NextResponse.json(
        { error: 'Only buyers can access buyer analytics' },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get buyer's orders
    const orders = await prisma.order.findMany({
      where: {
        buyer_id: authUser.userId,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        product: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
    const activeProducts = new Set(orders.map((o) => o.product_id)).size;

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Get orders from previous period for comparison
    const prevStartDate = new Date(startDate);
    const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    prevStartDate.setDate(startDate.getDate() - diffDays);

    const prevOrders = await prisma.order.findMany({
      where: {
        buyer_id: authUser.userId,
        createdAt: {
          gte: prevStartDate,
          lt: startDate,
        },
      },
    });

    const prevTotalSpent = prevOrders.reduce((sum, order) => sum + order.amount, 0);
    const prevTotalOrders = prevOrders.length;

    // Calculate changes
    const spentChange = prevTotalSpent > 0
      ? ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100
      : totalSpent > 0 ? 100 : 0;

    const ordersChange = prevTotalOrders > 0
      ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100
      : totalOrders > 0 ? 100 : 0;

    // Get favorite categories
    const categoryCounts = orders.reduce((acc, order) => {
      const category = order.product.category || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return NextResponse.json({
      totalOrders,
      totalSpent,
      completedOrders,
      activeProducts,
      averageOrderValue,
      spentChange,
      ordersChange,
      favoriteCategories,
    });
  } catch (error) {
    console.error('Buyer overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buyer overview' },
      { status: 500 }
    );
  }
}

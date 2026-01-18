import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatOrdersForExport, formatProductsForExport, formatSettlementsForExport } from '@/lib/utils/export';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, period } = body;

    let data: any[] = [];

    if (type === 'orders') {
      const orders = await prisma.order.findMany({
        where: {
          product: { seller_id: user.id }
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
        }
      });
      data = formatOrdersForExport(orders);
    } else if (type === 'products') {
      const products = await prisma.product.findMany({
        where: { seller_id: user.id },
        include: {
          orders: {
            where: {
              status: { in: ['PAID', 'COMPLETED'] }
            }
          }
        }
      });

      data = formatProductsForExport(
        products.map(p => ({
          ...p,
          orders: p.orders.length,
          revenue: p.orders.reduce((sum, o) => sum + o.seller_amount, 0),
          conversionRate: p.download_count > 0 ? (p.orders.length / p.download_count) * 100 : 0
        }))
      );
    } else if (type === 'settlements') {
      const settlements = await prisma.settlement.findMany({
        where: { seller_id: user.id },
        orderBy: {
          createdAt: 'desc'
        }
      });
      data = formatSettlementsForExport(settlements);
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

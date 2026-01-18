import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, SettlementStatus } from '@prisma/client';
import { listAllSettlements, listSettlementsForSeller } from '@/lib/services/settlement';

const prisma = new PrismaClient();

/**
 * GET /api/settlements - List settlements
 * For sellers: returns their settlements
 * For admins: returns all settlements with filters
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from session/JWT
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Seller view - only their settlements
    if (userRole !== 'admin') {
      const settlements = await listSettlementsForSeller(userId, limit);

      return NextResponse.json({
        settlements,
        pagination: {
          page,
          limit,
          total: settlements.length,
        },
      });
    }

    // Admin view - all settlements with filters
    const filters: any = {};

    const status = searchParams.get('status') as SettlementStatus | null;
    if (status) {
      filters.status = status;
    }

    const sellerId = searchParams.get('sellerId');
    if (sellerId) {
      filters.sellerId = sellerId;
    }

    const startDate = searchParams.get('startDate');
    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    const endDate = searchParams.get('endDate');
    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const result = await listAllSettlements(filters, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching settlements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settlements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settlements - Create settlement manually (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { sellerId, periodStart, periodEnd } = body;

    if (!sellerId || !periodStart || !periodEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the settlement service
    const { calculateSettlement } = await import('@/lib/services/settlement');

    const { settlement, calculation } = await calculateSettlement({
      sellerId,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
    });

    return NextResponse.json({
      settlement,
      calculation,
    });
  } catch (error) {
    console.error('Error creating settlement:', error);
    return NextResponse.json(
      { error: 'Failed to create settlement' },
      { status: 500 }
    );
  }
}

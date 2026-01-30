import { UserRole } from '@/src/lib/auth/types';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isServiceProvider } from '@/lib/auth';
import { getSellerAnalytics } from '@/lib/services/analytics';

/**
 * GET /api/analytics/seller/overview
 * PROTECTED: Only service_provider and admin can access
 */
export async function GET(req: NextRequest) {
  try {
    // Require seller, service_provider or admin role
    const user = await requireRole(req, [UserRole.SELLER, UserRole.ADMIN]);

    // Verify user is a service provider
    if (!isServiceProvider(user)) {
      return NextResponse.json(
        { error: 'Only sellers can access seller analytics' },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const period = (searchParams.get('period') || '30d') as '7d' | '30d' | '90d' | '1y';

    const analytics = await getSellerAnalytics(user.userId, period);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Seller analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller analytics' },
      { status: 500 }
    );
  }
}

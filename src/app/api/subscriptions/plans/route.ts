/**
 * GET /api/subscriptions/plans - List all subscription plans
 */

import { NextResponse } from 'next/server';
import { PlanService } from '@/src/lib/subscriptions';

export async function GET() {
  try {
    const plans = await PlanService.listPlans();

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscription plans',
      },
      { status: 500 }
    );
  }
}

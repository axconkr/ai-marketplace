/**
 * GET /api/verifications/available - List available verifications for verifiers
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { listAvailableVerifications } from '@/lib/services/verification/review';

export async function GET(request: NextRequest) {
  try {
    // Only verifiers and admins can view available verifications
    const user = await requireRole(request, ['verifier', 'admin']);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const level = searchParams.get('level');

    const options: any = { page, limit };

    if (level !== null) {
      options.level = parseInt(level);
    }

    const result = await listAvailableVerifications(options);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error listing available verifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list available verifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments/refund/[orderId]
 * Request a refund for an order
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleError, parseBody } from '@/lib/api/response';
import { processRefund } from '@/lib/services/refund';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const refundSchema = z.object({
  reason: z.string().optional(),
});

type RefundRequest = z.infer<typeof refundSchema>;

// ============================================================================
// POST /api/payments/refund/[orderId]
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // 1. Authenticate user
    const user = await requireAuth(request);

    // 2. Parse request body
    const body = await parseBody<RefundRequest>(request, refundSchema);

    // 3. Process refund
    const { refund, order } = await processRefund({
      orderId: params.orderId,
      requestedBy: user.userId,
      reason: body.reason,
    });

    // 4. Return success
    return successResponse({
      refund: {
        id: refund.id,
        status: refund.status,
        amount: refund.amount,
        currency: refund.currency,
        reason: refund.reason,
      },
      order: {
        id: order!.id,
        status: order!.status,
        refundedAt: order!.refunded_at,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

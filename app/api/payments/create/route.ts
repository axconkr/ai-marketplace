/**
 * POST /api/payments/create
 * Create a payment intent for a product purchase
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleError, parseBody } from '@/lib/api/response';
import { createOrder } from '@/lib/services/order';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const createPaymentSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  customerName: z.string().optional(),
});

type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;

// ============================================================================
// POST /api/payments/create
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await requireAuth(request);

    // 2. Parse and validate request body
    const body = await parseBody<CreatePaymentRequest>(request, createPaymentSchema);

    // 3. Create order and payment intent
    const { order, paymentIntent } = await createOrder({
      buyerId: user.userId,
      productId: body.productId,
      customerEmail: user.email,
      customerName: body.customerName || user.name,
    });

    // 4. Return payment intent details
    return successResponse(
      {
        orderId: order.id,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.clientSecret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
        product: {
          id: order.product.id,
          name: order.product.name,
          price: order.product.price,
          currency: order.product.currency,
        },
      },
      201
    );
  } catch (error) {
    return handleError(error);
  }
}

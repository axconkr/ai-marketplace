import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleError, parseBody } from '@/lib/api/response';
import { createCartCheckout } from '@/lib/services/cart-checkout';

const cartItemSchema = z.object({
  id: z.string().min(1),
  price: z.number(),
  currency: z.string(),
});

const checkoutCartSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Cart cannot be empty'),
  customerName: z.string().optional(),
});

type CheckoutCartRequest = z.infer<typeof checkoutCartSchema>;

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await parseBody<CheckoutCartRequest>(request, checkoutCartSchema);

    const result = await createCartCheckout({
      buyerId: user.userId,
      items: body.items,
      customerEmail: user.email,
      customerName: body.customerName || user.name,
    });

    return successResponse(
      {
        checkoutSessionId: result.checkoutSessionId,
        orders: result.orders,
        paymentIntent: {
          id: result.paymentIntent.id,
          clientSecret: result.paymentIntent.clientSecret,
          amount: result.paymentIntent.amount,
          currency: result.paymentIntent.currency,
        },
        totalAmount: result.totalAmount,
        currency: result.currency,
      },
      201
    );
  } catch (error) {
    return handleError(error);
  }
}

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleError, notFoundResponse, forbiddenResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const user = await requireAuth(request);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: {
            seller: {
              select: { id: true, name: true, email: true, bank_name: true }
            }
          }
        },
        buyer: {
          select: { id: true, name: true, email: true }
        },
        payment: true
      }
    });

    if (!order) {
      return notFoundResponse('Order');
    }

    const isSeller = order.product.seller_id === user.userId;
    const isBuyer = order.buyer_id === user.userId;
    const isAdmin = user.role === 'admin';

    if (!isSeller && !isBuyer && !isAdmin) {
      return forbiddenResponse('You do not have access to this invoice');
    }

    const invoiceNumber = `INV-${format(order.createdAt, 'yyyyMMdd')}-${order.id.slice(-6).toUpperCase()}`;

    const invoice = {
      invoiceNumber,
      issueDate: format(order.createdAt, 'yyyy-MM-dd'),
      dueDate: order.paid_at ? format(order.paid_at, 'yyyy-MM-dd') : null,
      status: order.status,

      seller: {
        name: order.product.seller.name || 'Seller',
        email: order.product.seller.email,
        bankName: order.product.seller.bank_name
      },

      buyer: {
        name: order.buyer.name || 'Buyer',
        email: order.buyer.email
      },

      items: [
        {
          description: order.product.name,
          quantity: 1,
          unitPrice: order.amount,
          total: order.amount
        }
      ],

      subtotal: order.amount,
      platformFee: order.platform_fee,
      sellerAmount: order.seller_amount,
      total: order.amount,
      currency: order.currency,

      payment: order.payment ? {
        method: order.payment.payment_method,
        provider: order.payment.provider,
        cardLast4: order.payment.card_last4,
        cardBrand: order.payment.card_brand,
        paidAt: order.paid_at ? format(order.paid_at, 'yyyy-MM-dd HH:mm:ss') : null
      } : null,

      notes: order.status === 'REFUNDED' 
        ? `환불 완료 (${order.refunded_at ? format(order.refunded_at, 'yyyy-MM-dd') : ''})`
        : undefined
    };

    return successResponse(invoice);
  } catch (error) {
    return handleError(error);
  }
}

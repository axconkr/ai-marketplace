import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleError, notFoundResponse, forbiddenResponse, badRequestResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

export async function POST(
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
          select: { seller_id: true, name: true }
        }
      }
    });

    if (!order) {
      return notFoundResponse('Order');
    }

    const isSeller = order.product.seller_id === user.userId;
    const isAdmin = user.role === 'admin';

    if (!isSeller && !isAdmin) {
      return forbiddenResponse('Only the seller or admin can complete this order');
    }

    if (order.status !== 'PAID') {
      return badRequestResponse(`Cannot complete order with status: ${order.status}. Order must be PAID.`);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        access_granted: true
      },
      include: {
        product: {
          select: { id: true, name: true }
        },
        buyer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    await prisma.notification.create({
      data: {
        user_id: updatedOrder.buyer_id,
        type: 'ORDER_COMPLETED',
        title: '주문 완료',
        message: `${updatedOrder.product.name} 주문이 완료되었습니다. 다운로드가 가능합니다.`,
        link: `/orders/${orderId}`
      }
    });

    return successResponse({
      id: updatedOrder.id,
      status: updatedOrder.status,
      accessGranted: updatedOrder.access_granted,
      product: updatedOrder.product,
      buyer: updatedOrder.buyer,
      completedAt: new Date().toISOString()
    });
  } catch (error) {
    return handleError(error);
  }
}

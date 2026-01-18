/**
 * Order Service
 * Business logic for order processing and management
 */

import { prisma } from '@/lib/db';
import { getPaymentProvider, getProviderName, PaymentCurrency } from '@/lib/payment';
import { PaymentError } from '@/lib/payment/types';
import { OrderStatus } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateOrderParams {
  buyerId: string;
  productId: string;
  customerEmail: string;
  customerName?: string;
}

export interface CompleteOrderParams {
  orderId: string;
  paymentId: string;
  paymentMethod?: {
    type: string;
    last4?: string;
    brand?: string;
  };
}

// ============================================================================
// PLATFORM FEE CALCULATION
// ============================================================================

/**
 * Calculate platform fee based on seller tier
 */
export function calculatePlatformFee(amount: number, sellerTier?: string): number {
  const feeRates: Record<string, number> = {
    new: 0.20, // 20%
    verified: 0.15, // 15%
    pro: 0.12, // 12%
    master: 0.10, // 10%
  };

  const rate = sellerTier && feeRates[sellerTier] ? feeRates[sellerTier] : 0.15;
  return Math.round(amount * rate);
}

// ============================================================================
// ORDER CREATION
// ============================================================================

/**
 * Create a new order and payment intent
 */
export async function createOrder(params: CreateOrderParams) {
  // 1. Validate product exists and is active
  const product = await prisma.product.findFirst({
    where: {
      id: params.productId,
      status: 'active',
    },
    include: {
      seller: true,
    },
  });

  if (!product) {
    throw new PaymentError('Product not available', 'PRODUCT_NOT_FOUND', 404);
  }

  // Prevent self-purchase
  if (product.seller_id === params.buyerId) {
    throw new PaymentError('Cannot purchase your own product', 'SELF_PURCHASE', 400);
  }

  // 2. Check if already purchased
  const existingOrder = await prisma.order.findFirst({
    where: {
      buyer_id: params.buyerId,
      product_id: params.productId,
      status: {
        in: [OrderStatus.PAID, OrderStatus.COMPLETED],
      },
    },
  });

  if (existingOrder) {
    throw new PaymentError('Product already purchased', 'ALREADY_PURCHASED', 409);
  }

  // 3. Calculate amounts
  const currency = (product.currency || 'USD') as PaymentCurrency;
  const amount = Math.round(product.price * 100); // Convert to cents/won
  const platformFee = calculatePlatformFee(amount, product.seller.platform_fee_rate.toString());
  const sellerAmount = amount - platformFee;

  // 4. Create order
  const order = await prisma.order.create({
    data: {
      buyer_id: params.buyerId,
      product_id: params.productId,
      amount,
      currency,
      platform_fee: platformFee,
      seller_amount: sellerAmount,
      status: OrderStatus.PENDING,
      payment_provider: getProviderName(currency),
    },
    include: {
      product: true,
      buyer: true,
    },
  });

  // 5. Create payment intent with provider
  const provider = getPaymentProvider(currency);
  const paymentIntent = await provider.createPaymentIntent({
    amount,
    currency,
    orderId: order.id,
    customerId: params.buyerId,
    customerEmail: params.customerEmail,
    customerName: params.customerName,
    productId: product.id,
    productName: product.name,
  });

  // 6. Create payment record
  await prisma.payment.create({
    data: {
      order_id: order.id,
      provider: order.payment_provider!,
      provider_payment_id: paymentIntent.id,
      amount,
      currency,
      status: 'PENDING',
    },
  });

  return {
    order,
    paymentIntent,
  };
}

// ============================================================================
// ORDER COMPLETION
// ============================================================================

/**
 * Complete order after successful payment
 */
export async function completeOrder(params: CompleteOrderParams) {
  const { orderId, paymentId, paymentMethod } = params;

  // 1. Get order with relations
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: {
        include: {
          seller: true,
        },
      },
      payment: true,
    },
  });

  if (!order) {
    throw new PaymentError('Order not found', 'ORDER_NOT_FOUND', 404);
  }

  // 2. Update order and payment status
  await prisma.$transaction([
    // Update order
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
        paid_at: new Date(),
      },
    }),

    // Update payment
    prisma.payment.update({
      where: { order_id: orderId },
      data: {
        status: 'SUCCEEDED',
        payment_method: paymentMethod?.type,
        card_last4: paymentMethod?.last4,
        card_brand: paymentMethod?.brand,
      },
    }),

    // Update product download count
    prisma.product.update({
      where: { id: order.product_id },
      data: {
        download_count: {
          increment: 1,
        },
      },
    }),
  ]);

  // 3. Grant product access
  await grantProductAccess(orderId);

  // 4. Send notifications (implement separately)
  // await sendPurchaseNotifications(orderId);

  return order;
}

// ============================================================================
// PRODUCT ACCESS
// ============================================================================

/**
 * Grant product access to buyer
 */
export async function grantProductAccess(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: {
        include: {
          files: true,
        },
      },
    },
  });

  if (!order) {
    throw new PaymentError('Order not found', 'ORDER_NOT_FOUND', 404);
  }

  // Generate download URL (valid for 7 days)
  const downloadExpires = new Date();
  downloadExpires.setDate(downloadExpires.getDate() + 7);

  // Create signed download URL (implement based on storage provider)
  const downloadUrl = await generateDownloadUrl(order.product_id, order.buyer_id);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      access_granted: true,
      download_url: downloadUrl,
      download_expires: downloadExpires,
      status: OrderStatus.COMPLETED,
    },
  });

  return {
    downloadUrl,
    expiresAt: downloadExpires,
  };
}

/**
 * Revoke product access
 */
export async function revokeProductAccess(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      access_granted: false,
      download_url: null,
      download_expires: null,
    },
  });
}

/**
 * Generate secure download URL
 * TODO: Implement based on storage provider (Supabase, S3, etc.)
 */
async function generateDownloadUrl(productId: string, userId: string): Promise<string> {
  // This is a placeholder - implement based on your storage provider
  // For now, return a temporary URL pattern
  const token = Buffer.from(`${productId}:${userId}:${Date.now()}`).toString('base64');
  return `/api/products/${productId}/download?token=${token}`;
}

// ============================================================================
// ORDER QUERIES
// ============================================================================

/**
 * Get order by ID
 */
export async function getOrder(orderId: string, userId?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: {
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payment: true,
      refund: true,
    },
  });

  if (!order) {
    throw new PaymentError('Order not found', 'ORDER_NOT_FOUND', 404);
  }

  // Verify access (buyer, seller, or admin)
  if (userId && order.buyer_id !== userId && order.product.seller_id !== userId) {
    throw new PaymentError('Access denied', 'FORBIDDEN', 403);
  }

  return order;
}

/**
 * Get user's orders
 */
export async function getUserOrders(userId: string, options?: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    buyer_id: userId,
  };

  if (options?.status) {
    where.status = options.status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get seller's sales
 */
export async function getSellerSales(sellerId: string, options?: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    product: {
      seller_id: sellerId,
    },
  };

  if (options?.status) {
    where.status = options.status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        product: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

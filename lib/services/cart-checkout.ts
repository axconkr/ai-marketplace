/**
 * Cart Checkout Service
 * Business logic for multi-product checkout
 */

import cuid from 'cuid';
import { prisma } from '@/lib/db';
import { getPaymentProvider, getProviderName, PaymentCurrency } from '@/lib/payment';
import { PaymentError } from '@/lib/payment/types';
import { OrderStatus } from '@prisma/client';
import { calculatePlatformFee, grantProductAccess } from './order';

// ============================================================================
// TYPES
// ============================================================================

export interface CartCheckoutParams {
  buyerId: string;
  items: Array<{
    id: string;
    price: number;
    currency: string;
  }>;
  customerEmail: string;
  customerName?: string;
}

export interface CartCheckoutResult {
  checkoutSessionId: string;
  orders: Array<{
    id: string;
    productId: string;
    amount: number;
  }>;
  paymentIntent: {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
  };
  totalAmount: number;
  currency: string;
}

interface PreparedOrder {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  platformFee: number;
  sellerAmount: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function normalizeCurrency(value?: string): PaymentCurrency {
  return (value || 'USD').toUpperCase() as PaymentCurrency;
}

// ============================================================================
// CART CHECKOUT
// ============================================================================

/**
 * Create multi-product checkout session with a single payment
 */
export async function createCartCheckout(
  params: CartCheckoutParams
): Promise<CartCheckoutResult> {
  const { buyerId, items, customerEmail, customerName } = params;

  if (items.length === 0) {
    throw new PaymentError('Cart is empty', 'EMPTY_CART', 400);
  }

  const productIds = items.map((item) => item.id);

  // 1. Validate products exist and are active
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      status: 'active',
    },
    include: {
      seller: true,
    },
  });

  const productById = new Map(products.map((product) => [product.id, product]));

  for (const item of items) {
    if (!productById.has(item.id)) {
      throw new PaymentError('Product not available', 'PRODUCT_NOT_FOUND', 404);
    }
  }

  // 2. Prevent self-purchase
  const hasSelfPurchase = products.some((product) => product.seller_id === buyerId);
  if (hasSelfPurchase) {
    throw new PaymentError('Cannot purchase your own product', 'SELF_PURCHASE', 400);
  }

  // 3. Check if already purchased
  const existingOrders = await prisma.order.findMany({
    where: {
      buyer_id: buyerId,
      product_id: { in: productIds },
      status: {
        in: [OrderStatus.PAID, OrderStatus.COMPLETED],
      },
    },
    select: { product_id: true },
  });

  if (existingOrders.length > 0) {
    throw new PaymentError('Product already purchased', 'ALREADY_PURCHASED', 409);
  }

  // 4. Validate currency consistency
  const firstProduct = productById.get(items[0].id);
  const currency = normalizeCurrency(firstProduct?.currency);

  for (const product of products) {
    if (normalizeCurrency(product.currency) !== currency) {
      throw new PaymentError('모든 상품의 통화가 동일해야 합니다', 'MIXED_CURRENCY', 400);
    }
  }

  const checkoutSessionId = cuid();
  const paymentProvider = getProviderName(currency);

  const preparedOrders: PreparedOrder[] = items.map((item) => {
    const product = productById.get(item.id)!;
    const amount = Math.round(product.price * 100);
    const platformFee = calculatePlatformFee(amount, product.seller.platform_fee_rate.toString());
    return {
      id: cuid(),
      productId: product.id,
      productName: product.name,
      amount,
      platformFee,
      sellerAmount: amount - platformFee,
    };
  });

  const totalAmount = preparedOrders.reduce((total, order) => total + order.amount, 0);
  const primaryOrder = preparedOrders[0];
  const primaryProductName =
    preparedOrders.length > 1
      ? `Cart items (${preparedOrders.length})`
      : primaryOrder.productName;

  // 5. Create payment intent
  const provider = getPaymentProvider(currency);
  const paymentIntent = await provider.createPaymentIntent({
    amount: totalAmount,
    currency,
    orderId: primaryOrder.id,
    customerId: buyerId,
    customerEmail,
    customerName,
    productId: primaryOrder.productId,
    productName: primaryProductName,
    metadata: {
      checkout_session_id: checkoutSessionId,
    },
  });

  // 6. Create orders and payment record in a transaction
  const orders = await prisma.$transaction(async (tx) => {
    const createdOrders = await Promise.all(
      preparedOrders.map((order) =>
        tx.order.create({
          data: {
            id: order.id,
            buyer_id: buyerId,
            product_id: order.productId,
            amount: order.amount,
            currency,
            platform_fee: order.platformFee,
            seller_amount: order.sellerAmount,
            status: OrderStatus.PENDING,
            payment_provider: paymentProvider,
            checkout_session_id: checkoutSessionId,
          },
        })
      )
    );

    await tx.payment.create({
      data: {
        order_id: primaryOrder.id,
        provider: paymentProvider,
        provider_payment_id: paymentIntent.id,
        amount: totalAmount,
        currency,
        status: 'PENDING',
        checkout_session_id: checkoutSessionId,
      },
    });

    return createdOrders;
  });

  return {
    checkoutSessionId,
    orders: orders.map((order) => ({
      id: order.id,
      productId: order.product_id,
      amount: order.amount,
    })),
    paymentIntent: {
      id: paymentIntent.id,
      clientSecret: paymentIntent.clientSecret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    },
    totalAmount,
    currency,
  };
}

// ============================================================================
// CHECKOUT COMPLETION
// ============================================================================

/**
 * Complete all orders in a checkout session after payment succeeds
 */
export async function completeCheckoutSession(
  checkoutSessionId: string,
  paymentMethod?: {
    type: string;
    last4?: string;
    brand?: string;
  }
): Promise<void> {
  const orders = await prisma.order.findMany({
    where: { checkout_session_id: checkoutSessionId },
    select: { id: true, product_id: true },
  });

  if (orders.length === 0) {
    throw new PaymentError('Order not found', 'ORDER_NOT_FOUND', 404);
  }

  const paidAt = new Date();

  await prisma.$transaction([
    prisma.order.updateMany({
      where: { checkout_session_id: checkoutSessionId },
      data: {
        status: OrderStatus.PAID,
        paid_at: paidAt,
      },
    }),
    prisma.payment.updateMany({
      where: { checkout_session_id: checkoutSessionId },
      data: {
        status: 'SUCCEEDED',
        payment_method: paymentMethod?.type,
        card_last4: paymentMethod?.last4,
        card_brand: paymentMethod?.brand,
      },
    }),
    ...orders.map((order) =>
      prisma.product.update({
        where: { id: order.product_id },
        data: {
          download_count: {
            increment: 1,
          },
        },
      })
    ),
  ]);

  await Promise.all(orders.map((order) => grantProductAccess(order.id)));
}

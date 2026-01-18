import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create notification helper (import from notification service)
 */
async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      user_id: params.userId,
      type: params.type as any,
      title: params.title,
      message: params.message,
      link: params.link,
    },
  });
}

/**
 * Create a new review for a completed order
 */
export async function createReview(params: {
  orderId: string;
  userId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}) {
  // 1. Validate order
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { product: true },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.buyer_id !== params.userId) {
    throw new Error('Not your order');
  }

  if (order.status !== 'COMPLETED') {
    throw new Error('Order must be completed to leave a review');
  }

  // Check if already reviewed
  const existing = await prisma.review.findUnique({
    where: { order_id: params.orderId },
  });

  if (existing) {
    throw new Error('You have already reviewed this product');
  }

  // Validate rating
  if (params.rating < 1 || params.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Validate comment length
  if (params.comment.length < 10) {
    throw new Error('Review must be at least 10 characters');
  }

  // 2. Create review
  const review = await prisma.review.create({
    data: {
      order_id: params.orderId,
      product_id: order.product_id,
      user_id: params.userId,
      rating: params.rating,
      title: params.title,
      comment: params.comment,
      images: params.images || [],
      verified_purchase: true,
    },
    include: {
      user: true,
      product: true,
    },
  });

  // 3. Update product rating
  await updateProductRating(order.product_id);

  // 4. Notify seller
  await createNotification({
    userId: order.product.seller_id,
    type: 'REVIEW_RECEIVED',
    title: 'New Review Received',
    message: `${params.rating} ⭐ review for ${order.product.name}`,
    link: `/dashboard/reviews/${review.id}`,
  });

  return review;
}

/**
 * Update product rating statistics
 */
export async function updateProductRating(productId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      product_id: productId,
      status: 'PUBLISHED',
    },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating_average: null,
        rating_count: 0,
        rating_distribution: null,
      },
    });
    return;
  }

  // Calculate average
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const average = totalRating / reviews.length;

  // Calculate distribution
  const distribution: Record<number, number> = {};
  for (let i = 1; i <= 5; i++) {
    distribution[i] = 0;
  }

  reviews.forEach((r) => {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating_average: average,
      rating_count: reviews.length,
      rating_distribution: distribution,
    },
  });
}

/**
 * Get reviews for a product
 */
export async function getProductReviews(params: {
  productId: string;
  sortBy?: 'recent' | 'helpful' | 'rating';
  filterRating?: number;
  page?: number;
  limit?: number;
}) {
  const { productId, sortBy = 'recent', filterRating, page = 1, limit = 10 } = params;

  const where: any = {
    product_id: productId,
    status: 'PUBLISHED',
  };

  if (filterRating) {
    where.rating = filterRating;
  }

  // Determine sorting
  let orderBy: any = { created_at: 'desc' }; // Default: recent
  if (sortBy === 'helpful') {
    orderBy = { helpful_count: 'desc' };
  } else if (sortBy === 'rating') {
    orderBy = { rating: 'desc' };
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single review by ID
 */
export async function getReview(reviewId: string) {
  return prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          seller_id: true,
        },
      },
    },
  });
}

/**
 * Update review (by owner only)
 */
export async function updateReview(params: {
  reviewId: string;
  userId: string;
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}) {
  const review = await prisma.review.findUnique({
    where: { id: params.reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.user_id !== params.userId) {
    throw new Error('Not your review');
  }

  // Validate rating if provided
  if (params.rating !== undefined && (params.rating < 1 || params.rating > 5)) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Validate comment if provided
  if (params.comment !== undefined && params.comment.length < 10) {
    throw new Error('Review must be at least 10 characters');
  }

  const updated = await prisma.review.update({
    where: { id: params.reviewId },
    data: {
      ...(params.rating !== undefined && { rating: params.rating }),
      ...(params.title !== undefined && { title: params.title }),
      ...(params.comment !== undefined && { comment: params.comment }),
      ...(params.images !== undefined && { images: params.images }),
    },
  });

  // Update product rating if rating changed
  if (params.rating !== undefined && params.rating !== review.rating) {
    await updateProductRating(review.product_id);
  }

  return updated;
}

/**
 * Delete review (by owner or admin)
 */
export async function deleteReview(reviewId: string, userId: string, isAdmin = false) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (!isAdmin && review.user_id !== userId) {
    throw new Error('Not authorized to delete this review');
  }

  // Soft delete by updating status
  const deleted = await prisma.review.update({
    where: { id: reviewId },
    data: {
      status: 'DELETED',
    },
  });

  // Update product rating
  await updateProductRating(review.product_id);

  return deleted;
}

/**
 * Add seller reply to review
 */
export async function addSellerReply(params: {
  reviewId: string;
  sellerId: string;
  reply: string;
}) {
  const review = await prisma.review.findUnique({
    where: { id: params.reviewId },
    include: { product: true },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.product.seller_id !== params.sellerId) {
    throw new Error('Not your product');
  }

  if (params.reply.length < 5) {
    throw new Error('Reply must be at least 5 characters');
  }

  const updated = await prisma.review.update({
    where: { id: params.reviewId },
    data: {
      seller_reply: params.reply,
      seller_replied_at: new Date(),
    },
  });

  // Notify reviewer
  await createNotification({
    userId: review.user_id,
    type: 'MESSAGE_RECEIVED',
    title: 'Seller Replied to Your Review',
    message: `The seller responded to your review of ${review.product.name}`,
    link: `/products/${review.product_id}#review-${review.id}`,
  });

  return updated;
}

/**
 * Vote on review helpfulness
 */
export async function voteReview(params: {
  reviewId: string;
  userId: string;
  helpful: boolean;
}) {
  const review = await prisma.review.findUnique({
    where: { id: params.reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  // Check if user is the review author
  if (review.user_id === params.userId) {
    throw new Error('Cannot vote on your own review');
  }

  // Upsert vote
  const vote = await prisma.reviewVote.upsert({
    where: {
      review_id_user_id: {
        review_id: params.reviewId,
        user_id: params.userId,
      },
    },
    create: {
      review_id: params.reviewId,
      user_id: params.userId,
      helpful: params.helpful,
    },
    update: {
      helpful: params.helpful,
    },
  });

  // Recalculate vote counts
  const counts = await prisma.reviewVote.groupBy({
    by: ['helpful'],
    where: { review_id: params.reviewId },
    _count: true,
  });

  const helpfulCount = counts.find((c) => c.helpful)?._count || 0;
  const notHelpfulCount = counts.find((c) => !c.helpful)?._count || 0;

  await prisma.review.update({
    where: { id: params.reviewId },
    data: {
      helpful_count: helpfulCount,
      not_helpful_count: notHelpfulCount,
    },
  });

  return vote;
}

/**
 * Flag review as inappropriate
 */
export async function flagReview(params: {
  reviewId: string;
  userId: string;
  reason: string;
}) {
  const review = await prisma.review.findUnique({
    where: { id: params.reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  const updated = await prisma.review.update({
    where: { id: params.reviewId },
    data: {
      flagged: true,
      flag_reason: params.reason,
      status: 'PENDING', // Move to moderation
    },
  });

  // Notify admins (in production, send to admin notification system)
  console.log('Review flagged for moderation:', {
    reviewId: params.reviewId,
    flaggedBy: params.userId,
    reason: params.reason,
  });

  return updated;
}

/**
 * Get user's review for a specific product
 */
export async function getUserReviewForProduct(userId: string, productId: string) {
  return prisma.review.findFirst({
    where: {
      user_id: userId,
      product_id: productId,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Check if user can review a product (has completed order)
 */
export async function canUserReview(userId: string, productId: string) {
  // Check for completed order
  const completedOrder = await prisma.order.findFirst({
    where: {
      buyer_id: userId,
      product_id: productId,
      status: 'COMPLETED',
    },
  });

  if (!completedOrder) {
    return { canReview: false, reason: 'No completed purchase found' };
  }

  // Check if already reviewed
  const existingReview = await prisma.review.findUnique({
    where: { order_id: completedOrder.id },
  });

  if (existingReview) {
    return { canReview: false, reason: 'Already reviewed', reviewId: existingReview.id };
  }

  return { canReview: true, orderId: completedOrder.id };
}

/**
 * Get product rating summary
 */
export async function getProductRatingSummary(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      rating_average: true,
      rating_count: true,
      rating_distribution: true,
    },
  });

  return product;
}

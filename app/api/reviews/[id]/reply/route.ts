import { NextRequest, NextResponse } from 'next/server';
import { addSellerReply } from '@/lib/services/review';
import { requireAuth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/reviews/[id]/reply - Add seller reply to review
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await requireAuth(req);

    const body = await req.json();
    const { reply } = body;

    if (!reply || reply.trim().length < 5) {
      return NextResponse.json(
        { error: 'Reply must be at least 5 characters' },
        { status: 400 }
      );
    }

    // Verify that the review belongs to seller's product
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        product: {
          select: { seller_id: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.product.seller_id !== user.userId) {
      return NextResponse.json(
        { error: 'Not authorized to reply to this review' },
        { status: 403 }
      );
    }

    const updated = await addSellerReply({
      reviewId: params.id,
      sellerId: user.userId,
      reply: reply.trim(),
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error adding seller reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add seller reply' },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/reviews/[id]/reply - Update seller reply
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { reply } = body;

    if (!reply || reply.trim().length < 5) {
      return NextResponse.json(
        { error: 'Reply must be at least 5 characters' },
        { status: 400 }
      );
    }

    // Verify ownership
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        product: {
          select: { seller_id: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.product.seller_id !== user.userId) {
      return NextResponse.json(
        { error: 'Not authorized to edit this reply' },
        { status: 403 }
      );
    }

    const updated = await prisma.review.update({
      where: { id: params.id },
      data: {
        seller_reply: reply.trim(),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating seller reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update reply' },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]/reply - Delete seller reply
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(req);

    // Verify ownership
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        product: {
          select: { seller_id: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.product.seller_id !== user.userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this reply' },
        { status: 403 }
      );
    }

    const updated = await prisma.review.update({
      where: { id: params.id },
      data: {
        seller_reply: null,
        seller_replied_at: null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error deleting seller reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete reply' },
      { status: 400 }
    );
  }
}

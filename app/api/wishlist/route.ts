import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleDatabaseError, formatDatabaseErrorResponse } from '@/lib/database-error-handler'

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const wishlists = await prisma.wishlist.findMany({
      where: { user_id: user.userId },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            files: {
              where: { status: 'ACTIVE' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      items: wishlists.map((w) => ({
        id: w.id,
        product: w.product,
        addedAt: w.createdAt,
      })),
      count: wishlists.length,
    })
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'MISSING_TOKEN' || (error as any).code === 'INVALID_TOKEN' || (error as any).code === 'INVALID_PAYLOAD') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbError = handleDatabaseError(error)
    console.error('Get wishlist error:', {
      message: dbError.message,
      code: dbError.code,
      suggestion: dbError.suggestion,
      originalError: error,
    })
    return NextResponse.json(
      formatDatabaseErrorResponse(dbError),
      { status: dbError.code === 'DB_CONNECTION_ERROR' ? 503 : 500 }
    )
  }
}

// POST /api/wishlist - Add product to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        user_id_product_id: {
          user_id: user.userId,
          product_id: productId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Product already in wishlist' },
        { status: 409 }
      )
    }

    // Add to wishlist
    const wishlist = await prisma.wishlist.create({
      data: {
        user_id: user.userId,
        product_id: productId,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json({
      message: 'Added to wishlist',
      wishlist,
    })
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'MISSING_TOKEN' || (error as any).code === 'INVALID_TOKEN' || (error as any).code === 'INVALID_PAYLOAD') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbError = handleDatabaseError(error)
    console.error('Add to wishlist error:', {
      message: dbError.message,
      code: dbError.code,
      suggestion: dbError.suggestion,
      originalError: error,
    })
    return NextResponse.json(
      formatDatabaseErrorResponse(dbError),
      { status: dbError.code === 'DB_CONNECTION_ERROR' ? 503 : 500 }
    )
  }
}

// DELETE /api/wishlist?productId=xxx - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Delete from wishlist
    await prisma.wishlist.deleteMany({
      where: {
        user_id: user.userId,
        product_id: productId,
      },
    })

    return NextResponse.json({
      message: 'Removed from wishlist',
    })
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'MISSING_TOKEN' || (error as any).code === 'INVALID_TOKEN' || (error as any).code === 'INVALID_PAYLOAD') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbError = handleDatabaseError(error)
    console.error('Remove from wishlist error:', {
      message: dbError.message,
      code: dbError.code,
      suggestion: dbError.suggestion,
      originalError: error,
    })
    return NextResponse.json(
      formatDatabaseErrorResponse(dbError),
      { status: dbError.code === 'DB_CONNECTION_ERROR' ? 503 : 500 }
    )
  }
}

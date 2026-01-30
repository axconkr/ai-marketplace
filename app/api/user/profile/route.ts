import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const userPayload = await requireAuth(request)

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        phone: true,
        kakao_id: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'MISSING_TOKEN' || (error as any).code === 'INVALID_TOKEN' || (error as any).code === 'INVALID_PAYLOAD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const userPayload = await requireAuth(request)

    const body = await request.json()
    const { name, phone, kakao_id, avatar } = body

    // Validate phone format if provided
    if (phone && !/^[0-9]{3}-[0-9]{4}-[0-9]{4}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone format. Use: 010-1234-5678' },
        { status: 400 }
      )
    }

    // Update user profile
    const user = await prisma.user.update({
      where: { id: userPayload.userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(kakao_id && { kakao_id }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        phone: true,
        kakao_id: true,
        emailVerified: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user,
    })
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'MISSING_TOKEN' || (error as any).code === 'INVALID_TOKEN' || (error as any).code === 'INVALID_PAYLOAD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

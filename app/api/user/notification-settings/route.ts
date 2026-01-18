import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/user/notification-settings
 * Get user notification settings
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { notification_settings: true },
    });

    return NextResponse.json({
      settings: user?.notification_settings || null,
    });
  } catch (error) {
    console.error('Failed to get notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/notification-settings
 * Update user notification settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await request.json();

    const user = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        notification_settings: settings,
      },
      select: { notification_settings: true },
    });

    return NextResponse.json({
      settings: user.notification_settings,
    });
  } catch (error) {
    console.error('Failed to update notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

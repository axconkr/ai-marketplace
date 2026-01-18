import { NextRequest, NextResponse } from 'next/server';
import { markNotificationAsRead } from '@/lib/services/notification-service';
import { verifyAuth } from '@/lib/auth';
import { handleDatabaseError, formatDatabaseErrorResponse } from '@/lib/database-error-handler';

/**
 * PATCH /api/notifications/[id]/read
 * Mark notification as read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    const notification = await markNotificationAsRead(params.id, userId);

    return NextResponse.json(notification);
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('Failed to mark notification as read:', {
      message: dbError.message,
      code: dbError.code,
      suggestion: dbError.suggestion,
      originalError: error,
    });

    return NextResponse.json(
      formatDatabaseErrorResponse(dbError),
      { status: dbError.code === 'DB_CONNECTION_ERROR' ? 503 : 500 }
    );
  }
}

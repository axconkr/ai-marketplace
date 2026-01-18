import { NextRequest, NextResponse } from 'next/server';
import { markAllNotificationsAsRead } from '@/lib/services/notification-service';
import { verifyAuth } from '@/lib/auth';
import { handleDatabaseError, formatDatabaseErrorResponse } from '@/lib/database-error-handler';

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    await markAllNotificationsAsRead(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('Failed to mark all notifications as read:', {
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

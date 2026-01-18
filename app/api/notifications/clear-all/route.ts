import { NextRequest, NextResponse } from 'next/server';
import { clearAllReadNotifications } from '@/lib/services/notification-service';
import { verifyAuth } from '@/lib/auth';
import { handleDatabaseError, formatDatabaseErrorResponse } from '@/lib/database-error-handler';

/**
 * DELETE /api/notifications/clear-all
 * Clear all read notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    await clearAllReadNotifications(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('Failed to clear notifications:', {
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

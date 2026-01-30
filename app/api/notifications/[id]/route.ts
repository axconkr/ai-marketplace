import { NextRequest, NextResponse } from 'next/server';
import { deleteNotification } from '@/lib/services/notification-service';
import { verifyAuth } from '@/lib/auth';
import { handleDatabaseError, formatDatabaseErrorResponse } from '@/lib/database-error-handler';

/**
 * DELETE /api/notifications/[id]
 * Delete a notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.userId;

    await deleteNotification(params.id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('Failed to delete notification:', {
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

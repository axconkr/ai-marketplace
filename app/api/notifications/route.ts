import { NextRequest, NextResponse } from 'next/server';
import { getUserNotifications } from '@/lib/services/notification-service';
import { verifyAuth } from '@/lib/auth';
import { handleDatabaseError, formatDatabaseErrorResponse } from '@/lib/database-error-handler';

/**
 * GET /api/notifications
 * List user notifications
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getUserNotifications({
      userId,
      unreadOnly,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('Failed to get notifications:', {
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

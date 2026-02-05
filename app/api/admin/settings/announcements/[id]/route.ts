import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, successResponse, badRequestResponse, notFoundResponse } from '@/lib/api/response';
import { updateAnnouncement, deleteAnnouncement } from '@/lib/services/admin/settings';

/**
 * GET /api/admin/settings/announcements/[id] - Get single announcement
 *
 * Auth: Requires admin role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const { id } = params;

    return successResponse({ id });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/admin/settings/announcements/[id] - Update announcement
 * Body: Partial<{ title, content, type, is_active, start_date, end_date }>
 *
 * Auth: Requires admin role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const { id } = params;
    const body = await request.json();

    const result = await updateAnnouncement(id, {
      title: body.title,
      content: body.content,
      type: body.type,
      is_active: body.is_active,
      start_date: body.start_date ? new Date(body.start_date) : undefined,
      end_date: body.end_date ? new Date(body.end_date) : undefined,
    });

    if (!result.success) {
      if (result.message.includes('not found')) {
        return notFoundResponse('Announcement');
      }
      return badRequestResponse(result.message);
    }

    return successResponse({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/settings/announcements/[id] - Soft delete announcement
 *
 * Auth: Requires admin role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const { id } = params;

    const result = await deleteAnnouncement(id);

    if (!result.success) {
      if (result.message.includes('not found')) {
        return notFoundResponse('Announcement');
      }
      return badRequestResponse(result.message);
    }

    return successResponse({
      message: result.message,
    });
  } catch (error) {
    return handleError(error);
  }
}

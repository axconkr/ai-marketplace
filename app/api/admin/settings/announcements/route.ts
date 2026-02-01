import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { handleError, successResponse, badRequestResponse, createdResponse, paginatedResponse } from '@/lib/api/response';
import { listAnnouncements, createAnnouncement } from '@/lib/services/admin/settings';
import { parseAdminListParams } from '../../_lib/middleware';

/**
 * GET /api/admin/settings/announcements - List announcements
 *
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 *   - search: string
 *   - type: AnnouncementType
 *   - is_active: boolean
 *   - sortBy: string
 *   - sortOrder: 'asc' | 'desc'
 *
 * Auth: Requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['admin']);
    const searchParams = request.nextUrl.searchParams;
    const params = parseAdminListParams(searchParams);

    const type = searchParams.get('type');
    const isActiveStr = searchParams.get('is_active');

    const result = await listAnnouncements({
      ...params,
      type: type ? (type as any) : undefined,
      is_active: isActiveStr ? isActiveStr === 'true' : undefined,
    });

    return paginatedResponse(result.items, result.pagination);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/admin/settings/announcements - Create announcement
 * Body: { title: string; content: string; type?: AnnouncementType; start_date?: Date; end_date?: Date }
 *
 * Auth: Requires admin role
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ['admin']);
    const body = await request.json();
    const { title, content, type, start_date, end_date } = body;

    if (!title || !content) {
      return badRequestResponse('Missing required fields: title, content');
    }

    const result = await createAnnouncement({
      title,
      content,
      type,
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
    });

    if (!result.success) {
      return badRequestResponse(result.message);
    }

    return createdResponse(result.data);
  } catch (error) {
    return handleError(error);
  }
}

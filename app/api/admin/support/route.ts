import { NextRequest } from 'next/server';
import { SupportTicketStatus, SupportTicketPriority } from '@/lib/types/support';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import {
  handleError,
  paginatedResponse,
  badRequestResponse,
} from '@/lib/api/response';
import { listSupportTickets } from '@/lib/services/admin/support';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);

    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assigned_to = searchParams.get('assigned_to');
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
    if (status && !validStatuses.includes(status)) {
      return badRequestResponse(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (priority && !validPriorities.includes(priority)) {
      return badRequestResponse(
        `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
      );
    }

    if (page < 1 || limit < 1) {
      return badRequestResponse('Page and limit must be positive numbers');
    }

    const result = await listSupportTickets({
      status: (status as SupportTicketStatus) || undefined,
      priority: (priority as SupportTicketPriority) || undefined,
      assigned_to: assigned_to || undefined,
      search,
      page,
      limit,
    });

    return paginatedResponse(result.items, result.pagination);
  } catch (error) {
    return handleError(error);
  }
}

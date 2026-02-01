import { NextRequest } from 'next/server';
import { SupportTicketStatus } from '@/lib/types/support';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import {
  handleError,
  successResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api/response';
import {
  getSupportTicketDetails,
  assignTicket,
  updateTicketStatus,
  resolveTicket,
} from '@/lib/services/admin/support';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);

    const ticket = await getSupportTicketDetails(params.id);

    if (!ticket) {
      return notFoundResponse('Support ticket');
    }

    return successResponse(ticket);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, [UserRole.ADMIN]);

    const body = await request.json();
    const { assigned_to, status } = body;

    if (!assigned_to && !status) {
      return badRequestResponse(
        'Must provide either assigned_to or status to update'
      );
    }

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (status && !validStatuses.includes(status)) {
      return badRequestResponse(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    let result;

    if (assigned_to) {
      result = await assignTicket(params.id, assigned_to);
      if (!result.success) {
        return badRequestResponse(result.message);
      }
    }

    if (status) {
      result = await updateTicketStatus(params.id, status as SupportTicketStatus, user.userId);
      if (!result.success) {
        return badRequestResponse(result.message);
      }
    }

    return successResponse(result?.data);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, [UserRole.ADMIN]);

    const body = await request.json();
    const { resolution } = body;

    if (!resolution || typeof resolution !== 'string' || resolution.trim() === '') {
      return badRequestResponse('Resolution text is required and must be non-empty');
    }

    const result = await resolveTicket(params.id, resolution, user.userId);

    if (!result.success) {
      return badRequestResponse(result.message);
    }

    return successResponse(result.data);
  } catch (error) {
    return handleError(error);
  }
}

import { prisma } from '@/lib/prisma';
import { SupportTicketStatus, SupportTicketPriority } from '@prisma/client';
import { AdminListParams, AdminListResult, AdminActionResult } from './types';
import { buildPaginationQuery, buildPaginationInfo, buildSearchWhere } from './utils';

export interface AdminSupportTicket {
  id: string;
  subject: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  created_at: Date;
  user: { id: string; name: string | null; email: string };
  assignee: { id: string; name: string | null } | null;
}

/**
 * List support tickets with filters (status, priority, assigned_to)
 * Includes user (reporter) and assignee info
 */
export async function listSupportTickets(
  params: AdminListParams & {
    priority?: SupportTicketPriority;
    assigned_to?: string;
  }
): Promise<AdminListResult<AdminSupportTicket>> {
  const pagination = buildPaginationQuery(params);

  // Build where clause with filters
  const where: any = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.priority) {
    where.priority = params.priority;
  }

  if (params.assigned_to) {
    where.assigned_to = params.assigned_to;
  }

  // Add search in subject field
  if (params.search) {
    where.subject = {
      contains: params.search,
      mode: 'insensitive' as const,
    };
  }

  // Get total count for pagination
  const total = await prisma.supportTicket.count({ where });

  // Fetch tickets with user and assignee info
  const tickets = await prisma.supportTicket.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    skip: pagination.skip,
    take: pagination.take,
    orderBy: {
      created_at: 'desc',
    },
  });

  return {
    items: tickets as AdminSupportTicket[],
    pagination: buildPaginationInfo(total, params),
  };
}

/**
 * Get full ticket details
 */
export async function getSupportTicketDetails(
  ticketId: string
): Promise<{
  id: string;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  resolution: string | null;
  created_at: Date;
  updated_at: Date;
  resolved_at: Date | null;
  user: { id: string; name: string | null; email: string };
  assignee: { id: string; name: string | null; email: string } | null;
} | null> {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return ticket;
}

/**
 * Assign ticket to admin
 */
export async function assignTicket(
  ticketId: string,
  adminId: string
): Promise<AdminActionResult> {
  try {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assigned_to: adminId,
      },
    });

    return {
      success: true,
      message: 'Ticket assigned successfully',
      data: { ticket },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to assign ticket: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Change ticket status
 */
export async function updateTicketStatus(
  ticketId: string,
  status: SupportTicketStatus,
  adminId: string
): Promise<AdminActionResult> {
  try {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
      },
    });

    return {
      success: true,
      message: `Ticket status updated to ${status}`,
      data: { ticket },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update ticket status: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Resolve ticket with resolution notes
 * Sets status to RESOLVED, resolved_at to now(), and stores resolution text
 */
export async function resolveTicket(
  ticketId: string,
  resolution: string,
  adminId: string
): Promise<AdminActionResult> {
  try {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'RESOLVED',
        resolution,
        resolved_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Ticket resolved successfully',
      data: { ticket },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to resolve ticket: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get support statistics
 * - total: total number of tickets
 * - open: count of tickets with status OPEN or IN_PROGRESS
 * - inProgress: count of tickets with status IN_PROGRESS
 * - avgResolutionHours: average time from created_at to resolved_at for RESOLVED tickets
 * - byPriority: count of tickets by priority
 */
export async function getSupportStatistics(): Promise<{
  total: number;
  open: number;
  inProgress: number;
  avgResolutionHours: number;
  byPriority: Record<string, number>;
}> {
  // Get total count
  const total = await prisma.supportTicket.count();

  // Get open count (OPEN or IN_PROGRESS)
  const open = await prisma.supportTicket.count({
    where: {
      status: {
        in: ['OPEN', 'IN_PROGRESS'],
      },
    },
  });

  // Get in progress count
  const inProgress = await prisma.supportTicket.count({
    where: {
      status: 'IN_PROGRESS',
    },
  });

  // Get all resolved tickets to calculate average resolution time
  const resolvedTickets = await prisma.supportTicket.findMany({
    where: {
      status: 'RESOLVED',
      resolved_at: {
        not: null,
      },
    },
    select: {
      created_at: true,
      resolved_at: true,
    },
  });

  // Calculate average resolution hours
  let avgResolutionHours = 0;
  if (resolvedTickets.length > 0) {
    const totalHours = resolvedTickets.reduce((sum, ticket) => {
      if (ticket.resolved_at) {
        const diffMs = ticket.resolved_at.getTime() - ticket.created_at.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return sum + diffHours;
      }
      return sum;
    }, 0);
    avgResolutionHours = totalHours / resolvedTickets.length;
  }

  // Get count by priority
  const byPriorityData = await prisma.supportTicket.groupBy({
    by: ['priority'],
    _count: true,
  });

  const byPriority: Record<string, number> = {};
  byPriorityData.forEach((item) => {
    byPriority[item.priority] = item._count;
  });

  return {
    total,
    open,
    inProgress,
    avgResolutionHours,
    byPriority,
  };
}

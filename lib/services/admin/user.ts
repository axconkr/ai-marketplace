import { prisma } from '@/lib/prisma';
import { AdminListParams, AdminListResult, AdminActionResult } from './types';
import { buildPaginationQuery, buildPaginationInfo } from './utils';

type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  _count: { orders: number; products: number };
}

export async function listUsersForAdmin(
  params: AdminListParams & { role?: string }
): Promise<AdminListResult<AdminUser>> {
  const { role, sortBy = 'createdAt', sortOrder = 'desc' } = params;

  const where: any = {};

  if (role) {
    where.role = role;
  }

  if (params.status) {
    where.status = params.status;
  }

  if (params.search) {
    where.OR = [
      { email: { contains: params.search, mode: 'insensitive' } },
      { name: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const total = await prisma.user.count({ where });

  const { skip, take } = buildPaginationQuery(params);

  const users = (await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
          products: true,
        },
      },
    },
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder,
    },
  })) as unknown as AdminUser[];

  return {
    items: users,
    pagination: buildPaginationInfo(total, params),
  };
}

export async function getUserDetailsForAdmin(userId: string): Promise<{
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  phone: string | null;
  subscriptionTier: string | null;
  orderCount: number;
  productCount: number;
  totalRevenue: number;
  verificationCount: number;
} | null> {
  const user = (await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      emailVerified: true,
      phone: true,
      subscriptionTier: true,
    },
  })) as any;

  if (!user) return null;

  const orderCount = await prisma.order.count({
    where: { buyer_id: userId },
  });

  const productCount = await prisma.product.count({
    where: { seller_id: userId },
  });

  const settlements = await prisma.settlement.findMany({
    where: {
      seller_id: userId,
      status: 'PAID',
    },
    select: {
      payout_amount: true,
    },
  });

  const totalRevenue = settlements.reduce((sum, s) => sum + s.payout_amount, 0);

  const verificationCount = await prisma.verification.count({
    where: { verifier_id: userId },
  });

  return {
    ...user,
    orderCount,
    productCount,
    totalRevenue,
    verificationCount,
  };
}

export async function updateUserRole(
  userId: string,
  newRole: string,
  currentAdminId: string
): Promise<AdminActionResult> {
  if (userId === currentAdminId) {
    return {
      success: false,
      message: 'Cannot change your own role',
    };
  }

  const validRoles = ['admin', 'seller', 'buyer', 'verifier'];
  if (!validRoles.includes(newRole)) {
    return {
      success: false,
      message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    return {
      success: false,
      message: 'User not found',
    };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: { id: true, email: true, role: true },
  });

  return {
    success: true,
    message: `User role updated from ${user.role} to ${newRole}`,
    data: updatedUser,
  };
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus,
  currentAdminId: string
): Promise<AdminActionResult> {
  if (userId === currentAdminId) {
    return {
      success: false,
      message: 'Cannot change your own status',
    };
  }

  const validStatuses: UserStatus[] = ['ACTIVE', 'SUSPENDED', 'BANNED'];
  if (!validStatuses.includes(status)) {
    return {
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    return {
      success: false,
      message: 'User not found',
    };
  }

  const updatedUser = (await prisma.user.update({
    where: { id: userId },
    data: { status: status as any },
    select: { id: true, email: true, role: true },
  })) as any;

  return {
    success: true,
    message: `User status updated to ${status}`,
    data: updatedUser,
  };
}

export async function getUserStatistics(): Promise<{
  total: number;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  newThisMonth: number;
}> {
  const total = await prisma.user.count();

  const roleGroups = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  });

  const byRole: Record<string, number> = {};
  roleGroups.forEach((group) => {
    byRole[group.role] = group._count;
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const newThisMonth = await prisma.user.count({
    where: {
      createdAt: {
        gte: monthStart,
        lt: new Date(),
      },
    },
  });

  return {
    total,
    byRole,
    byStatus: {},
    newThisMonth,
  };
}

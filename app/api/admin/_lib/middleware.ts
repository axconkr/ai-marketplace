import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';

export async function requireAdmin(request: NextRequest) {
  return requireRole(request, [UserRole.ADMIN]);
}

export function parseAdminListParams(searchParams: URLSearchParams) {
  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    status: searchParams.get('status') || undefined,
    search: searchParams.get('search') || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };
}

import { AdminListParams, PaginationInfo } from './types';

export function buildPaginationQuery(params: AdminListParams) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function buildPaginationInfo(total: number, params: AdminListParams): PaginationInfo {
  const page = params.page || 1;
  const limit = params.limit || 20;
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function buildSearchWhere(search: string | undefined, fields: string[]) {
  if (!search) return {};
  return {
    OR: fields.map(field => ({
      [field]: { contains: search, mode: 'insensitive' as const }
    }))
  };
}

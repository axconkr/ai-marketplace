export interface AdminListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminListResult<T> {
  items: T[];
  pagination: PaginationInfo;
}

export interface AdminActionResult {
  success: boolean;
  message: string;
  data?: any;
}

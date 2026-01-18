import type {
  ProductCreateInput,
  ProductUpdateInput,
  ProductSearchParams as BackendSearchParams,
} from '@/lib/validations/product';
import { apiFetch } from './error-handler';

// Frontend search params (more user-friendly)
export interface ProductSearchParams {
  query?: string; // Maps to 'search' in backend
  category?: string;
  min_price?: number;
  max_price?: number;
  verification_level?: number;
  sort_by?: 'created_at' | 'price' | 'rating' | 'downloads';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Product API client functions
 * Handles all product-related API requests with enhanced error handling
 */

// Helper function for API requests (now uses enhanced error handler)
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(endpoint, options, {
    retry: {
      maxRetries: 3,
      initialDelay: 1000,
    },
  });
}

// Product types
export interface Product {
  id: string;
  seller_id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  currency: string;
  verification_level: number;
  verification_badges: string[];
  verification_score: number | null;
  status: string;
  download_count: number;
  rating_average: number | null;
  rating_count: number;
  rating_distribution: any;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    name: string | null;
    avatar: string | null;
    role: string;
  };
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Fetch products with filters
export async function fetchProducts(
  params: Partial<ProductSearchParams>
): Promise<ProductListResponse> {
  const queryParams = new URLSearchParams();

  // Map frontend params to backend params
  const mappedParams: Record<string, any> = { ...params };

  // Map query to search for backend compatibility
  if ('query' in params && params.query) {
    mappedParams.search = params.query;
    delete mappedParams.query;
  }

  // Map sort values for backend compatibility
  if (mappedParams.sort_by) {
    const sortMap: Record<string, string> = {
      'created_at': 'newest',
      'price': 'price_asc',
      'rating': 'rating',
      'downloads': 'popular',
    };
    mappedParams.sort_by = sortMap[mappedParams.sort_by] || mappedParams.sort_by;
  }

  Object.entries(mappedParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetchAPI<any>(`/products?${queryParams.toString()}`);

  // Transform API response to expected format
  return {
    products: response.data || response.products || [],
    pagination: response.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 0,
    },
  };
}

// Fetch single product by ID
export async function fetchProduct(id: string): Promise<Product> {
  return fetchAPI<Product>(`/products/${id}`);
}

// Create new product
export async function createProduct(
  data: ProductCreateInput
): Promise<Product> {
  return fetchAPI<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update existing product
export async function updateProduct(
  id: string,
  data: ProductUpdateInput
): Promise<Product> {
  return fetchAPI<Product>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Delete product
export async function deleteProduct(id: string): Promise<void> {
  return fetchAPI<void>(`/products/${id}`, {
    method: 'DELETE',
  });
}

// Fetch seller's products (for dashboard)
export async function fetchMyProducts(): Promise<Product[]> {
  return fetchAPI<Product[]>('/products/me');
}

// Upload product file
export async function uploadProductFile(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  // Use apiFetch but with FormData (no Content-Type header)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // For file uploads, we use native fetch with our error handling pattern
  return apiFetch<{ url: string }>('/products/upload', {
    method: 'POST',
    body: formData,
    headers, // Don't set Content-Type for FormData
  }, {
    retry: {
      maxRetries: 2, // Fewer retries for file uploads
      initialDelay: 2000,
    },
  });
}

// Increment view count
export async function incrementViewCount(id: string): Promise<void> {
  return fetchAPI<void>(`/products/${id}/view`, {
    method: 'POST',
  });
}

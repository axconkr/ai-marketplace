import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchMyProducts,
  uploadProductFile,
  incrementViewCount,
  type Product,
  type ProductSearchParams,
} from '@/lib/api/products';
import type {
  ProductCreateInput,
  ProductUpdateInput,
} from '@/lib/validations/product';
import { useToast } from './use-toast';

/**
 * React Query hooks for product data fetching and mutations with error handling
 */

// Query keys factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductSearchParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  myProducts: () => [...productKeys.all, 'my'] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  trending: () => [...productKeys.all, 'trending'] as const,
  related: (id: string) => [...productKeys.all, 'related', id] as const,
};

// Fetch products list with filters
export function useProducts(params: ProductSearchParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Fetch single product by ID
export function useProduct(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      // Increment view count in background
      incrementViewCount(id).catch(() => {
        // Silently fail - view count is not critical
      });
      return fetchProduct(id);
    },
    staleTime: 60 * 1000, // 1 minute
    // Optimistic update from list cache
    placeholderData: () => {
      // Try to find product in any cached list
      const cachedLists = queryClient.getQueriesData<{
        products: Product[];
      }>({
        queryKey: productKeys.lists(),
      });

      for (const [, data] of cachedLists) {
        const product = data?.products.find((p) => p.id === id);
        if (product) return product;
      }
      return undefined;
    },
  });
}

// Fetch seller's products (for dashboard)
export function useMyProducts() {
  return useQuery({
    queryKey: productKeys.myProducts(),
    queryFn: fetchMyProducts,
    staleTime: 30 * 1000,
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: ProductCreateInput) => createProduct(data),
    onSuccess: () => {
      // Invalidate product lists to refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.myProducts() });
      success('상품이 생성되었습니다', '상품이 성공적으로 등록되었습니다.');
    },
    onError: (err: Error) => {
      error('상품 생성 실패', err.message);
    },
  });
}

// Update product mutation
export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: ProductUpdateInput) => updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      // Update cache optimistically
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.myProducts() });
      success('상품이 수정되었습니다', '상품 정보가 성공적으로 업데이트되었습니다.');
    },
    onError: (err: Error) => {
      error('상품 수정 실패', err.message);
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.myProducts() });
      success('상품이 삭제되었습니다', '상품이 성공적으로 삭제되었습니다.');
    },
    onError: (err: Error) => {
      error('상품 삭제 실패', err.message);
    },
  });
}

// Upload file mutation
export function useUploadFile() {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (file: File) => uploadProductFile(file),
    onSuccess: () => {
      success('파일 업로드 완료', '파일이 성공적으로 업로드되었습니다.');
    },
    onError: (err: Error) => {
      error('파일 업로드 실패', err.message);
    },
  });
}

// Fetch featured products
export function useFeaturedProducts(limit: number = 6) {
  return useQuery({
    queryKey: [...productKeys.featured(), limit],
    queryFn: async () => {
      const response = await fetch(`/api/products/featured?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch featured products');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch trending products
export function useTrendingProducts(limit: number = 10) {
  return useQuery({
    queryKey: [...productKeys.trending(), limit],
    queryFn: async () => {
      const response = await fetch(`/api/products/trending?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch trending products');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch related products
export function useRelatedProducts(productId: string, limit: number = 4) {
  return useQuery({
    queryKey: [...productKeys.related(productId), limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/products/${productId}/related?limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch related products');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!productId,
  });
}

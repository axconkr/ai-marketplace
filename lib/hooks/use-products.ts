import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';
import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchMyProducts,
  type ProductSearchParams,
  type Product,
} from '@/lib/api/products';
import type { ProductCreateInput, ProductUpdateInput } from '@/lib/validations/product';

/**
 * React Query hooks for products
 */

/**
 * Fetch products with filters
 */
export function useProducts(params: Partial<ProductSearchParams> = {}) {
  const queryKey = queryKeys.products.list(JSON.stringify(params));

  return useQuery({
    queryKey,
    queryFn: () => fetchProducts(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch single product by ID
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });
}

/**
 * Fetch current user's products
 */
export function useMyProducts() {
  return useQuery({
    queryKey: queryKeys.products.myProducts(),
    queryFn: fetchMyProducts,
  });
}

/**
 * Create new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCreateInput) => createProduct(data),
    onSuccess: () => {
      // Invalidate products lists to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.myProducts() });
    },
  });
}

/**
 * Update existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdateInput }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific product and lists
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.myProducts() });
    },
  });
}

/**
 * Delete product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.myProducts() });
    },
  });
}

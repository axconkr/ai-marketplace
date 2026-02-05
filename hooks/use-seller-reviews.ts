import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface Filters {
  rating?: number;
  productId?: string;
  responseStatus?: 'all' | 'answered' | 'unanswered';
  sortBy?: 'date' | 'rating' | 'helpful';
  search?: string;
}

export function useSellerReviews(filters: Filters, page: number) {
  return useQuery({
    queryKey: ['seller-reviews', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.rating && { rating: filters.rating.toString() }),
        ...(filters.productId && { productId: filters.productId }),
        ...(filters.responseStatus && { responseStatus: filters.responseStatus }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.search && { search: filters.search }),
      });

      const res = await fetch(`/api/reviews/seller?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
  });
}

export function useSellerReviewStats() {
  return useQuery({
    queryKey: ['seller-review-stats'],
    queryFn: async () => {
      const res = await fetch('/api/reviews/seller/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });
}

export function useReplyMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string }) => {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add reply');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: '답변 등록 완료',
        description: '고객에게 답변이 전송되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['seller-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['seller-review-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: '답변 등록 실패',
        description: error.message,
        variant: 'error',
      });
    },
  });
}

export function useEditReplyMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string }) => {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update reply');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: '답변 수정 완료',
        description: '답변이 수정되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['seller-reviews'] });
    },
    onError: (error: Error) => {
      toast({
        title: '답변 수정 실패',
        description: error.message,
        variant: 'error',
      });
    },
  });
}

export function useDeleteReplyMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete reply');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: '답변 삭제 완료',
        description: '답변이 삭제되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['seller-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['seller-review-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: '답변 삭제 실패',
        description: error.message,
        variant: 'error',
      });
    },
  });
}

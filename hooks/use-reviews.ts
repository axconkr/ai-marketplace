import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

interface CreateReviewParams {
  orderId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

interface VoteReviewParams {
  reviewId: string;
  helpful: boolean;
}

interface AddReplyParams {
  reviewId: string;
  reply: string;
}

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

/**
 * Fetch reviews for a product
 */
export function useReviews(
  productId: string,
  sortBy: 'recent' | 'helpful' | 'rating' = 'recent',
  filterRating?: number,
  page = 1
) {
  return useQuery({
    queryKey: ['reviews', productId, sortBy, filterRating, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        productId,
        sortBy,
        page: page.toString(),
      });

      if (filterRating) {
        params.append('filterRating', filterRating.toString());
      }

      const response = await fetch(`/api/reviews?${params}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
  });
}

/**
 * Fetch a single review
 */
export function useReview(reviewId: string) {
  return useQuery({
    queryKey: ['review', reviewId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/${reviewId}`);
      if (!response.ok) throw new Error('Failed to fetch review');
      return response.json();
    },
    enabled: !!reviewId,
  });
}

/**
 * Create a new review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreateReviewParams) => {
      const token = getAuthToken();
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create review');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate product reviews
      queryClient.invalidateQueries({
        queryKey: ['reviews', data.product_id],
      });

      toast({
        title: 'Success',
        description: 'Review submitted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a review
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      reviewId,
      ...params
    }: Partial<CreateReviewParams> & { reviewId: string }) => {
      const token = getAuthToken();
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update review');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['review', data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['reviews', data.product_id],
      });

      toast({
        title: 'Success',
        description: 'Review updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a review
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const token = getAuthToken();
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete review');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['reviews', data.product_id],
      });

      toast({
        title: 'Success',
        description: 'Review deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Vote on a review
 */
export function useVoteReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reviewId, helpful }: VoteReviewParams) => {
      const token = getAuthToken();
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ helpful }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to vote');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['review', variables.reviewId],
      });

      toast({
        title: 'Success',
        description: 'Vote recorded',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Add seller reply
 */
export function useAddSellerReply() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reviewId, reply }: AddReplyParams) => {
      const token = getAuthToken();
      const response = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add reply');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['review', variables.reviewId],
      });

      toast({
        title: 'Success',
        description: 'Reply added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Flag review
 */
export function useFlagReview() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      reviewId,
      reason,
    }: {
      reviewId: string;
      reason: string;
    }) => {
      const token = getAuthToken();
      const response = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to report review');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Review reported for moderation',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

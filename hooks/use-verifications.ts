import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchVerifications,
  fetchVerification,
  requestVerification,
  claimVerification,
  submitReview,
  assignVerification,
  cancelVerification,
  fetchVerificationStats,
  fetchVerifierStats,
  fetchMyVerifications,
  fetchMyAssignedVerifications,
} from '@/lib/api/verifications';
import type {
  VerificationFilters,
  RequestVerificationInput,
  SubmitReviewInput,
} from '@/lib/types/verification';

/**
 * React Query hooks for verification operations
 */

// Query keys factory
export const verificationKeys = {
  all: ['verifications'] as const,
  lists: () => [...verificationKeys.all, 'list'] as const,
  list: (filters: VerificationFilters) =>
    [...verificationKeys.lists(), filters] as const,
  details: () => [...verificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...verificationKeys.details(), id] as const,
  myVerifications: () => [...verificationKeys.all, 'my'] as const,
  assignedToMe: () => [...verificationKeys.all, 'assigned-to-me'] as const,
  stats: () => [...verificationKeys.all, 'stats'] as const,
  verifierStats: (id?: string) =>
    [...verificationKeys.all, 'verifier-stats', id] as const,
};

/**
 * Fetch verifications list with filters
 */
export function useVerifications(filters?: VerificationFilters) {
  return useQuery({
    queryKey: verificationKeys.list(filters || {}),
    queryFn: () => fetchVerifications(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch single verification by ID
 */
export function useVerification(id: string) {
  return useQuery({
    queryKey: verificationKeys.detail(id),
    queryFn: () => fetchVerification(id),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Fetch seller's verifications
 */
export function useMyVerifications() {
  return useQuery({
    queryKey: verificationKeys.myVerifications(),
    queryFn: fetchMyVerifications,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch verifications assigned to verifier
 */
export function useAssignedVerifications() {
  return useQuery({
    queryKey: verificationKeys.assignedToMe(),
    queryFn: fetchMyAssignedVerifications,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch verification statistics (admin)
 */
export function useVerificationStats() {
  return useQuery({
    queryKey: verificationKeys.stats(),
    queryFn: fetchVerificationStats,
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch verifier statistics
 */
export function useVerifierStats(verifierId?: string) {
  return useQuery({
    queryKey: verificationKeys.verifierStats(verifierId),
    queryFn: () => fetchVerifierStats(verifierId),
    staleTime: 60 * 1000,
  });
}

/**
 * Request verification mutation
 */
export function useRequestVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RequestVerificationInput) => requestVerification(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: verificationKeys.myVerifications() });
    },
  });
}

/**
 * Claim verification mutation (verifier)
 */
export function useClaimVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => claimVerification(id),
    onSuccess: (verification) => {
      queryClient.setQueryData(
        verificationKeys.detail(verification.id),
        verification
      );
      queryClient.invalidateQueries({ queryKey: verificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: verificationKeys.assignedToMe() });
    },
  });
}

/**
 * Submit review mutation (verifier)
 */
export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, review }: { id: string; review: SubmitReviewInput }) =>
      submitReview(id, review),
    onSuccess: (verification) => {
      queryClient.setQueryData(
        verificationKeys.detail(verification.id),
        verification
      );
      queryClient.invalidateQueries({ queryKey: verificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: verificationKeys.assignedToMe() });
      queryClient.invalidateQueries({ queryKey: verificationKeys.stats() });
      queryClient.invalidateQueries({
        queryKey: verificationKeys.verifierStats(),
      });
    },
  });
}

/**
 * Assign verification mutation (admin)
 */
export function useAssignVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, verifierId }: { id: string; verifierId: string }) =>
      assignVerification(id, verifierId),
    onSuccess: (verification) => {
      queryClient.setQueryData(
        verificationKeys.detail(verification.id),
        verification
      );
      queryClient.invalidateQueries({ queryKey: verificationKeys.lists() });
    },
  });
}

/**
 * Cancel verification mutation
 */
export function useCancelVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelVerification(id),
    onSuccess: (verification) => {
      queryClient.setQueryData(
        verificationKeys.detail(verification.id),
        verification
      );
      queryClient.invalidateQueries({ queryKey: verificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: verificationKeys.myVerifications() });
    },
  });
}

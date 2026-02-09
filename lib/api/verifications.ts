/**
 * API Client for Verification Operations with enhanced error handling
 */

import type {
  Verification,
  VerificationWithDetails,
  VerificationFilters,
  VerificationListResponse,
  VerificationStats,
  VerifierStats,
  RequestVerificationInput,
  SubmitReviewInput,
} from '@/lib/types/verification';
import { apiFetch } from './error-handler';

/**
 * Fetch verifications list with filters
 */
export async function fetchVerifications(
  filters?: VerificationFilters
): Promise<VerificationListResponse> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.status) params.append('status', filters.status);
    if (filters.level !== undefined) params.append('level', String(filters.level));
    if (filters.verifier_id) params.append('verifier_id', filters.verifier_id);
    if (filters.product_id) params.append('product_id', filters.product_id);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
  }

  const endpoint = params.toString() ? `/verifications?${params}` : '/verifications';
  return apiFetch<VerificationListResponse>(endpoint);
}

/**
 * Fetch single verification by ID
 */
export async function fetchVerification(
  id: string
): Promise<VerificationWithDetails> {
  return apiFetch<VerificationWithDetails>(`/verifications/${id}`);
}

/**
 * Request verification for a product
 */
export async function requestVerification(
  input: RequestVerificationInput
): Promise<Verification> {
  return apiFetch<Verification>('/verifications', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/**
 * Claim verification as verifier
 */
export async function claimVerification(id: string): Promise<Verification> {
  return apiFetch<Verification>(`/verifications/${id}/claim`, {
    method: 'POST',
  });
}

/**
 * Submit review for verification
 */
export async function submitReview(
  id: string,
  review: SubmitReviewInput
): Promise<Verification> {
  return apiFetch<Verification>(`/verifications/${id}/review`, {
    method: 'POST',
    body: JSON.stringify(review),
  });
}

/**
 * Assign verification to verifier (admin only)
 */
export async function assignVerification(
  id: string,
  verifierId: string
): Promise<Verification> {
  return apiFetch<Verification>(`/verifications/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ verifierId }),
  });
}

/**
 * Cancel verification
 */
export async function cancelVerification(id: string): Promise<Verification> {
  return apiFetch<Verification>(`/verifications/${id}/cancel`, {
    method: 'POST',
  });
}

/**
 * Get verification statistics (admin)
 */
export async function fetchVerificationStats(): Promise<VerificationStats> {
  return apiFetch<VerificationStats>('/verifications/stats');
}

/**
 * Get verifier statistics
 */
export async function fetchVerifierStats(
  verifierId?: string
): Promise<VerifierStats> {
  const endpoint = verifierId
    ? `/verifications/verifier-stats?verifierId=${verifierId}`
    : '/verifications/verifier-stats';
  const res = await apiFetch<{ success?: boolean; data?: VerifierStats } | VerifierStats>(endpoint);
  if (res && 'success' in res && 'data' in res) {
    return res.data as VerifierStats;
  }
  return res as VerifierStats;
}

/**
 * Fetch my verifications (seller)
 */
export async function fetchMyVerifications(): Promise<VerificationWithDetails[]> {
  return apiFetch<VerificationWithDetails[]>('/verifications/my-verifications');
}

/**
 * Fetch verifications assigned to me (verifier)
 */
export async function fetchMyAssignedVerifications(): Promise<
  VerificationWithDetails[]
> {
  const res = await apiFetch<{ success?: boolean; data?: VerificationWithDetails[] } | VerificationWithDetails[]>('/verifications/assigned-to-me');
  if (res && !Array.isArray(res) && 'data' in res) {
    return res.data || [];
  }
  return Array.isArray(res) ? res : [];
}

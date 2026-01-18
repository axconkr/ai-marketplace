import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '@prisma/client';

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseNotificationsOptions {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
  refetchInterval?: number;
}

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Fetch notifications
 */
async function fetchNotifications(options: UseNotificationsOptions = {}): Promise<NotificationsResponse> {
  const { unreadOnly = false, page = 1, limit = 20 } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(unreadOnly && { unread: 'true' }),
  });

  const response = await fetch(`/api/notifications?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  return response.json();
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId: string): Promise<Notification> {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }

  return response.json();
}

/**
 * Mark all notifications as read
 */
async function markAllAsRead(): Promise<void> {
  const response = await fetch('/api/notifications/mark-all-read', {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
}

/**
 * Delete notification
 */
async function deleteNotification(notificationId: string): Promise<void> {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }
}

/**
 * Clear all read notifications
 */
async function clearAllRead(): Promise<void> {
  const response = await fetch('/api/notifications/clear-all', {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to clear notifications');
  }
}

/**
 * Hook to fetch notifications
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const { refetchInterval = 30000, ...queryOptions } = options; // Poll every 30 seconds by default

  // Only fetch if user is authenticated
  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('accessToken') !== null;

  return useQuery({
    queryKey: ['notifications', queryOptions],
    queryFn: () => fetchNotifications(queryOptions),
    refetchInterval,
    enabled: isAuthenticated, // Only run query if authenticated
    retry: false, // Don't retry on 401
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      // Invalidate all notification queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook to delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook to clear all read notifications
 */
export function useClearAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useClearAllNotifications,
} from '@/hooks/use-notifications';
import { NotificationItem } from './NotificationItem';
import { Notification } from '@prisma/client';

interface NotificationListProps {
  onClose: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const router = useRouter();
  const { data, isLoading } = useNotifications({ limit: 10 });
  const markAsRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const clearAll = useClearAllNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      await markAsRead.mutateAsync(notification.id);
    }

    // Navigate to link if provided
    if (notification.link) {
      router.push(notification.link);
    }

    onClose();
  };

  const handleMarkAllRead = async () => {
    await markAllRead.mutateAsync();
  };

  const handleClearAll = async () => {
    await clearAll.mutateAsync();
  };

  return (
    <div className="flex max-h-96 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Notifications</h3>
        {data && data.notifications.length > 0 && (
          <div className="flex gap-2">
            {data.unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
              >
                Mark all read
              </Button>
            )}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <NotificationSkeleton />
        ) : !data || data.notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-2 text-4xl">🔔</div>
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <>
            {data.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      {data && data.notifications.length > 0 && (
        <div className="border-t px-4 py-2">
          <div className="flex justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                router.push('/notifications');
                onClose();
              }}
              className="flex-1"
            >
              View all
            </Button>
            {data.notifications.some((n) => n.read) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={clearAll.isPending}
                className="flex-1"
              >
                Clear read
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useClearAllNotifications,
} from '@/hooks/use-notifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Notification } from '@prisma/client';

export default function NotificationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const allNotifications = useNotifications({ unreadOnly: false });
  const unreadNotifications = useNotifications({ unreadOnly: true });

  const markAsRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const clearAll = useClearAllNotifications();

  const currentData = tab === 'all' ? allNotifications.data : unreadNotifications.data;
  const isLoading = tab === 'all' ? allNotifications.isLoading : unreadNotifications.isLoading;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead.mutateAsync(notification.id);
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead.mutateAsync();
  };

  const handleClearAll = async () => {
    if (confirm('읽은 알림을 모두 삭제하시겠습니까?')) {
      await clearAll.mutateAsync();
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">알림</h1>
          <p className="mt-1 text-muted-foreground">
            최신 활동 업데이트를 확인하세요
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/settings/notifications')}
        >
          설정
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | 'unread')}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">
              전체 {allNotifications.data && `(${allNotifications.data.totalCount})`}
            </TabsTrigger>
            <TabsTrigger value="unread">
              읽지 않음 {unreadNotifications.data && `(${unreadNotifications.data.unreadCount})`}
            </TabsTrigger>
          </TabsList>

          {currentData && currentData.notifications.length > 0 && (
            <div className="flex gap-2">
              {currentData.unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={markAllRead.isPending}
                >
                  모두 읽음 표시
                </Button>
              )}
              {tab === 'all' && currentData.notifications.some((n) => n.read) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={clearAll.isPending}
                >
                  읽은 알림 삭제
                </Button>
              )}
            </div>
          )}
        </div>

        <TabsContent value="all" className="mt-4">
          <NotificationContent
            data={currentData}
            isLoading={isLoading}
            onNotificationClick={handleNotificationClick}
          />
        </TabsContent>

        <TabsContent value="unread" className="mt-4">
          <NotificationContent
            data={currentData}
            isLoading={isLoading}
            onNotificationClick={handleNotificationClick}
            emptyMessage="읽지 않은 알림이 없습니다"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NotificationContentProps {
  data: any;
  isLoading: boolean;
  onNotificationClick: (notification: Notification) => void;
  emptyMessage?: string;
}

function NotificationContent({
  data,
  isLoading,
  onNotificationClick,
  emptyMessage = '알림이 없습니다',
}: NotificationContentProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data || data.notifications.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mb-2 text-4xl">🔔</div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="divide-y">
        {data.notifications.map((notification: Notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => onNotificationClick(notification)}
          />
        ))}
      </div>

      {/* Pagination could be added here */}
      {data.totalPages > 1 && (
        <div className="border-t p-4 text-center text-sm text-muted-foreground">
          {data.page} / {data.totalPages} 페이지
        </div>
      )}
    </Card>
  );
}

# Notification System API Reference

Quick reference for developers working with the notification system.

---

## Table of Contents
- [REST API Endpoints](#rest-api-endpoints)
- [React Hooks](#react-hooks)
- [Service Functions](#service-functions)
- [Notification Types](#notification-types)
- [Data Models](#data-models)
- [Usage Examples](#usage-examples)

---

## REST API Endpoints

### GET /api/notifications
Fetch user notifications with pagination and filtering.

**Authentication:** Required (JWT)

**Query Parameters:**
```typescript
{
  unread?: boolean    // Filter to unread only (default: false)
  page?: number       // Page number (default: 1)
  limit?: number      // Items per page (default: 20)
}
```

**Response:**
```typescript
{
  notifications: Notification[]
  unreadCount: number
  totalCount: number
  page: number
  limit: number
  totalPages: number
}
```

**Example:**
```bash
GET /api/notifications?unread=true&page=1&limit=10
```

---

### PATCH /api/notifications/[id]/read
Mark a single notification as read.

**Authentication:** Required (JWT)

**Parameters:**
- `id` (path): Notification ID

**Response:**
```typescript
Notification // Updated notification object
```

**Example:**
```bash
PATCH /api/notifications/cm123abc456/read
```

---

### PATCH /api/notifications/mark-all-read
Mark all user notifications as read.

**Authentication:** Required (JWT)

**Response:**
```typescript
{
  success: boolean
}
```

**Example:**
```bash
PATCH /api/notifications/mark-all-read
```

---

### DELETE /api/notifications/[id]
Delete a single notification.

**Authentication:** Required (JWT)

**Parameters:**
- `id` (path): Notification ID

**Response:**
```typescript
{
  success: boolean
}
```

**Example:**
```bash
DELETE /api/notifications/cm123abc456
```

---

### DELETE /api/notifications/clear-all
Clear all read notifications for the user.

**Authentication:** Required (JWT)

**Response:**
```typescript
{
  success: boolean
}
```

**Example:**
```bash
DELETE /api/notifications/clear-all
```

---

## React Hooks

### useNotifications
Fetch and subscribe to notifications.

**Import:**
```typescript
import { useNotifications } from '@/hooks/use-notifications';
```

**Usage:**
```typescript
const { data, isLoading, error, refetch } = useNotifications({
  unreadOnly: false,
  page: 1,
  limit: 20,
  refetchInterval: 30000, // Poll every 30 seconds
});
```

**Options:**
```typescript
interface UseNotificationsOptions {
  unreadOnly?: boolean       // Filter to unread only
  page?: number             // Page number
  limit?: number            // Items per page
  refetchInterval?: number  // Auto-refresh interval (ms)
}
```

**Returns:**
```typescript
{
  data: {
    notifications: Notification[]
    unreadCount: number
    totalCount: number
    page: number
    limit: number
    totalPages: number
  }
  isLoading: boolean
  error: Error | null
  refetch: () => void
}
```

---

### useMarkNotificationRead
Mark a notification as read.

**Import:**
```typescript
import { useMarkNotificationRead } from '@/hooks/use-notifications';
```

**Usage:**
```typescript
const markAsRead = useMarkNotificationRead();

await markAsRead.mutateAsync(notificationId);
```

**Returns:**
```typescript
{
  mutate: (id: string) => void
  mutateAsync: (id: string) => Promise<Notification>
  isPending: boolean
  isError: boolean
  error: Error | null
}
```

---

### useMarkAllNotificationsRead
Mark all notifications as read.

**Import:**
```typescript
import { useMarkAllNotificationsRead } from '@/hooks/use-notifications';
```

**Usage:**
```typescript
const markAllRead = useMarkAllNotificationsRead();

await markAllRead.mutateAsync();
```

---

### useDeleteNotification
Delete a notification.

**Import:**
```typescript
import { useDeleteNotification } from '@/hooks/use-notifications';
```

**Usage:**
```typescript
const deleteNotification = useDeleteNotification();

await deleteNotification.mutateAsync(notificationId);
```

---

### useClearAllNotifications
Clear all read notifications.

**Import:**
```typescript
import { useClearAllNotifications } from '@/hooks/use-notifications';
```

**Usage:**
```typescript
const clearAll = useClearAllNotifications();

await clearAll.mutateAsync();
```

---

## Service Functions

### createNotification
Create a single notification.

**Import:**
```typescript
import { createNotification } from '@/lib/services/notification-service';
```

**Usage:**
```typescript
await createNotification({
  userId: 'user-id',
  type: 'ORDER_PLACED',
  title: 'New Order',
  message: 'You have received a new order',
  link: '/dashboard/orders/order-id',
  data: { orderId: 'order-id' }, // Optional JSON data
});
```

**Parameters:**
```typescript
interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  data?: any
}
```

---

### Specialized Notification Functions

#### Order Notifications
```typescript
import {
  notifyNewOrder,
  notifyOrderCompleted,
  notifyPaymentReceived,
  notifyPaymentFailed,
} from '@/lib/services/notification-service';

// Usage
await notifyNewOrder(orderId);
await notifyOrderCompleted(orderId);
await notifyPaymentReceived(orderId);
await notifyPaymentFailed(orderId, 'Insufficient funds');
```

#### Product Notifications
```typescript
import {
  notifyProductApproved,
  notifyProductRejected,
} from '@/lib/services/notification-service';

await notifyProductApproved(productId);
await notifyProductRejected(productId, 'Does not meet quality standards');
```

#### Verification Notifications
```typescript
import {
  notifyVerificationRequested,
  notifyVerificationCompleted,
  notifyVerificationAssigned,
} from '@/lib/services/notification-service';

await notifyVerificationRequested(verificationId);
await notifyVerificationCompleted(verificationId);
await notifyVerificationAssigned(verificationId);
```

#### Settlement Notifications
```typescript
import {
  notifySettlementReady,
  notifySettlementPaid,
} from '@/lib/services/notification-service';

await notifySettlementReady(settlementId);
await notifySettlementPaid(settlementId);
```

#### System Notifications
```typescript
import { notifySystemAnnouncement } from '@/lib/services/notification-service';

await notifySystemAnnouncement({
  userIds: ['user1', 'user2'], // or 'all' for all users
  title: 'System Maintenance',
  message: 'The system will be down on...',
  link: '/announcements/123',
});
```

---

## Notification Types

```typescript
enum NotificationType {
  // Orders
  ORDER_PLACED          // New order received
  ORDER_COMPLETED       // Order completed

  // Payments
  PAYMENT_RECEIVED      // Payment successful
  PAYMENT_FAILED        // Payment failed

  // Refunds
  REFUND_APPROVED       // Refund approved
  REFUND_REJECTED       // Refund rejected

  // Products
  PRODUCT_APPROVED      // Product approved by admin
  PRODUCT_REJECTED      // Product rejected by admin

  // Verifications
  VERIFICATION_REQUESTED   // Verification requested
  VERIFICATION_COMPLETED   // Verification completed
  VERIFICATION_ASSIGNED    // Verification assigned to verifier

  // Settlements
  SETTLEMENT_READY      // Settlement ready for payout
  SETTLEMENT_PAID       // Settlement paid

  // Reviews
  REVIEW_RECEIVED       // New review on product

  // Messages
  MESSAGE_RECEIVED      // New message received

  // System
  SYSTEM_ANNOUNCEMENT   // System-wide announcement
}
```

---

## Data Models

### Notification Model
```typescript
interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link: string | null       // Optional navigation link
  data: any | null          // Optional JSON data
  read: boolean             // Read status
  read_at: Date | null      // When marked as read
  created_at: Date          // Creation timestamp
  expires_at: Date | null   // Optional expiration
  user: User                // Relation to User
}
```

### User Notification Settings
```typescript
interface NotificationSettings {
  email: {
    orders: boolean
    payments: boolean
    refunds: boolean
    products: boolean
    verifications: boolean
    settlements: boolean
    reviews: boolean
    messages: boolean
    system: boolean
  }
  push: {
    // Same structure as email
  }
}
```

---

## Usage Examples

### Example 1: Creating Notification After Order
```typescript
// In order creation logic
import { notifyNewOrder } from '@/lib/services/notification-service';

async function createOrder(orderData) {
  // ... create order
  const order = await prisma.order.create({ data: orderData });

  // Send notification to seller
  await notifyNewOrder(order.id);

  return order;
}
```

---

### Example 2: Displaying Notifications in Component
```typescript
'use client';

import { useNotifications, useMarkNotificationRead } from '@/hooks/use-notifications';

export function NotificationList() {
  const { data, isLoading } = useNotifications({ unreadOnly: true });
  const markAsRead = useMarkNotificationRead();

  const handleClick = async (notification) => {
    if (!notification.read) {
      await markAsRead.mutateAsync(notification.id);
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.notifications.map(notification => (
        <div key={notification.id} onClick={() => handleClick(notification)}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### Example 3: Custom Notification with Additional Data
```typescript
import { createNotification } from '@/lib/services/notification-service';

await createNotification({
  userId: seller.id,
  type: 'REVIEW_RECEIVED',
  title: 'New Review Received',
  message: `${reviewer.name} left a ${rating}-star review on ${product.name}`,
  link: `/products/${product.id}#reviews`,
  data: {
    reviewId: review.id,
    productId: product.id,
    rating: rating,
    reviewerName: reviewer.name,
  },
});
```

---

### Example 4: Bulk Notifications
```typescript
import { createBulkNotifications } from '@/lib/services/notification-service';

const notifications = adminUsers.map(admin => ({
  userId: admin.id,
  type: 'SYSTEM_ANNOUNCEMENT',
  title: 'New Feature Released',
  message: 'Check out our new AI assistant feature!',
  link: '/features/ai-assistant',
}));

await createBulkNotifications(notifications);
```

---

### Example 5: Real-time Notification Bell
```typescript
'use client';

import { useNotifications } from '@/hooks/use-notifications';
import { Bell } from 'lucide-react';

export function NotificationBell() {
  const { data } = useNotifications({
    unreadOnly: true,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = data?.unreadCount || 0;

  return (
    <button className="relative">
      <Bell />
      {unreadCount > 0 && (
        <span className="badge">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
```

---

### Example 6: Error Handling
```typescript
import { useNotifications } from '@/hooks/use-notifications';
import { useToast } from '@/hooks/use-toast';

export function NotificationComponent() {
  const { data, error, isLoading } = useNotifications();
  const { toast } = useToast();

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load notifications',
      variant: 'destructive',
    });
  }

  // ... rest of component
}
```

---

### Example 7: Optimistic Updates
```typescript
import { useMarkNotificationRead } from '@/hooks/use-notifications';
import { useQueryClient } from '@tanstack/react-query';

export function useOptimisticMarkAsRead() {
  const queryClient = useQueryClient();
  const markAsRead = useMarkNotificationRead();

  return async (notificationId: string) => {
    // Optimistically update UI
    queryClient.setQueryData(['notifications'], (old: any) => ({
      ...old,
      notifications: old.notifications.map((n: any) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: old.unreadCount - 1,
    }));

    // Execute mutation
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      // Rollback on error
      queryClient.invalidateQueries(['notifications']);
    }
  };
}
```

---

### Example 8: Conditional Notifications Based on User Preferences
```typescript
import { createNotification } from '@/lib/services/notification-service';

// The service automatically checks user preferences
// and sends email only if enabled
await createNotification({
  userId: user.id,
  type: 'ORDER_PLACED',
  title: 'New Order',
  message: 'You have a new order',
  link: '/orders/123',
});

// Email will only be sent if:
// user.notification_settings.email.orders === true
```

---

## Best Practices

### 1. Always Include a Link
```typescript
// Good ✅
await createNotification({
  userId: user.id,
  type: 'ORDER_PLACED',
  title: 'New Order',
  message: 'Order #12345',
  link: '/dashboard/orders/12345', // User can navigate to details
});

// Bad ❌
await createNotification({
  userId: user.id,
  type: 'ORDER_PLACED',
  title: 'New Order',
  message: 'Order #12345',
  // No link - user can't take action
});
```

---

### 2. Use Descriptive Messages
```typescript
// Good ✅
message: `You have received a new order for "${product.name}" from ${buyer.name}. Total: $${total}`

// Bad ❌
message: "New order"
```

---

### 3. Store Additional Data for Future Reference
```typescript
await createNotification({
  userId: seller.id,
  type: 'ORDER_PLACED',
  title: 'New Order',
  message: '...',
  link: '/orders/123',
  data: {
    orderId: '123',
    productId: 'abc',
    buyerId: 'xyz',
    amount: 99.99,
    // Store whatever you might need later
  },
});
```

---

### 4. Handle Errors Gracefully
```typescript
try {
  await notifyNewOrder(orderId);
} catch (error) {
  console.error('Failed to send notification:', error);
  // Don't fail the whole operation
  // Notifications are important but not critical
}
```

---

### 5. Set Expiration for Time-Sensitive Notifications
```typescript
await prisma.notification.create({
  data: {
    userId: user.id,
    type: 'SYSTEM_ANNOUNCEMENT',
    title: 'Flash Sale - 2 Hours Left!',
    message: '50% off all products',
    link: '/sale',
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
  },
});
```

---

## Performance Tips

1. **Use Pagination**: Don't load all notifications at once
2. **Enable Polling**: Use `refetchInterval` for real-time updates
3. **Optimize Queries**: Use indexes on `user_id`, `read`, `created_at`
4. **Cache Aggressively**: React Query caches for 5 minutes by default
5. **Batch Creates**: Use `createBulkNotifications` for multiple notifications

---

## Troubleshooting

### Notifications Not Appearing
1. Check database: `SELECT * FROM "Notification" WHERE user_id = 'USER_ID';`
2. Verify user is authenticated
3. Check polling is enabled (30s interval)
4. Verify API returns correct data

### Unread Count Not Updating
1. Force refresh: `queryClient.invalidateQueries(['notifications'])`
2. Check polling interval
3. Verify mark-as-read API works

### Email Notifications Not Sending
1. Check user notification settings
2. Verify email service configured
3. Check `notification-service.ts` logs
4. Ensure email category enabled in settings

---

## Migration Guide

### Upgrading from Old System
If migrating from a previous notification system:

```sql
-- Add missing columns
ALTER TABLE "Notification"
  ADD COLUMN IF NOT EXISTS "read_at" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "data" JSONB;

-- Create indexes
CREATE INDEX IF NOT EXISTS "Notification_user_id_read_idx"
  ON "Notification"("user_id", "read");

CREATE INDEX IF NOT EXISTS "Notification_user_id_created_at_idx"
  ON "Notification"("user_id", "created_at");

CREATE INDEX IF NOT EXISTS "Notification_created_at_idx"
  ON "Notification"("created_at");
```

---

## Support

For issues or questions:
- Check the [Testing Guide](./NOTIFICATION_TESTING_GUIDE.md)
- Review [Implementation Summary](./NOTIFICATION_IMPLEMENTATION_SUMMARY.md)
- Check API logs in server console
- Review React Query DevTools in browser

---

Last Updated: 2026-01-10

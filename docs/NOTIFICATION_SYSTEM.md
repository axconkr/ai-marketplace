# Notification System Documentation

## Overview

Comprehensive notification system for AI Marketplace with in-app notifications, email notifications, and real-time updates.

## Features

- ✅ In-app notifications with real-time updates
- ✅ Email notifications with templated HTML emails
- ✅ User notification preferences
- ✅ 16 notification types covering all user actions
- ✅ Notification bell with unread count badge
- ✅ Mark as read/unread functionality
- ✅ Bulk operations (mark all read, clear all)
- ✅ Full-page notifications view
- ✅ Notification settings page
- ✅ React Query integration with polling

## Architecture

### Database Schema

```prisma
model Notification {
  id          String   @id @default(cuid())
  user_id     String
  type        NotificationType
  title       String
  message     String
  link        String?
  data        Json?
  read        Boolean  @default(false)
  read_at     DateTime?
  created_at  DateTime @default(now())
  expires_at  DateTime?
  user        User     @relation(...)
}

enum NotificationType {
  ORDER_PLACED
  ORDER_COMPLETED
  PAYMENT_RECEIVED
  PAYMENT_FAILED
  REFUND_APPROVED
  REFUND_REJECTED
  PRODUCT_APPROVED
  PRODUCT_REJECTED
  VERIFICATION_REQUESTED
  VERIFICATION_COMPLETED
  VERIFICATION_ASSIGNED
  SETTLEMENT_READY
  SETTLEMENT_PAID
  REVIEW_RECEIVED
  MESSAGE_RECEIVED
  SYSTEM_ANNOUNCEMENT
}
```

### Service Layer

**File**: `lib/services/notification-service.ts`

Core notification functions:
- `createNotification()` - Create single notification
- `createBulkNotifications()` - Create multiple notifications
- `getUserNotifications()` - Fetch user notifications
- `markNotificationAsRead()` - Mark as read
- `markAllNotificationsAsRead()` - Bulk mark as read
- `deleteNotification()` - Delete notification
- `clearAllReadNotifications()` - Clear read notifications

Domain-specific notification functions:
- `notifyNewOrder()`, `notifyOrderCompleted()`
- `notifyPaymentReceived()`, `notifyPaymentFailed()`
- `notifyRefundApproved()`, `notifyRefundRejected()`
- `notifyVerificationRequested()`, `notifyVerificationCompleted()`, `notifyVerificationAssigned()`
- `notifyProductApproved()`, `notifyProductRejected()`
- `notifySettlementReady()`, `notifySettlementPaid()`
- `notifySystemAnnouncement()`

### Email Templates

**File**: `lib/email/notification-templates.tsx`

- Responsive HTML email templates
- Icon and color coding per notification type
- Plain text fallback
- Unsubscribe links
- Notification settings links

### API Routes

```
GET    /api/notifications
       List user notifications with pagination

GET    /api/notifications/[id]
       Get single notification

PATCH  /api/notifications/[id]/read
       Mark notification as read

DELETE /api/notifications/[id]
       Delete notification

PATCH  /api/notifications/mark-all-read
       Mark all notifications as read

DELETE /api/notifications/clear-all
       Clear all read notifications

GET    /api/user/notification-settings
       Get user notification preferences

PATCH  /api/user/notification-settings
       Update user notification preferences
```

### React Hooks

**File**: `hooks/use-notifications.ts`

```typescript
// Fetch notifications with polling
useNotifications({ unreadOnly?, page?, limit?, refetchInterval? })

// Mark notification as read
useMarkNotificationRead()

// Mark all as read
useMarkAllNotificationsRead()

// Delete notification
useDeleteNotification()

// Clear all read
useClearAllNotifications()
```

### UI Components

1. **NotificationBell** - Dropdown bell icon with unread badge
2. **NotificationList** - Scrollable list with actions
3. **NotificationItem** - Individual notification with icon/color
4. **NotificationsPage** - Full-page view with tabs
5. **NotificationSettingsPage** - User preferences

## Usage

### 1. Creating Notifications

```typescript
import { notifyNewOrder } from '@/lib/services/notification-service';

// In your order creation logic
await notifyNewOrder(orderId);
```

### 2. Adding Notification Bell to Layout

```tsx
import { NotificationBell } from '@/components/notifications/NotificationBell';

export default function Layout() {
  return (
    <header>
      {/* ... other header items ... */}
      <NotificationBell />
    </header>
  );
}
```

### 3. Notification Preferences

Users can configure notification preferences at `/settings/notifications`:

- Email notifications per category
- In-app notifications per category
- Critical notifications cannot be disabled

### 4. Polling Configuration

Notifications are polled every 30 seconds by default:

```typescript
useNotifications({ refetchInterval: 30000 })
```

For real-time updates, integrate Supabase Realtime or WebSockets.

## Integration Points

### Order Notifications

```typescript
// When order is created
await notifyNewOrder(orderId);

// When order is completed
await notifyOrderCompleted(orderId);
```

### Payment Notifications

```typescript
// Payment received
await notifyPaymentReceived(orderId);

// Payment failed
await notifyPaymentFailed(orderId, failureReason);
```

### Verification Notifications

```typescript
// Verification requested
await notifyVerificationRequested(verificationId);

// Verification completed
await notifyVerificationCompleted(verificationId);

// Assigned to verifier
await notifyVerificationAssigned(verificationId);
```

### Settlement Notifications

```typescript
// Settlement ready
await notifySettlementReady(settlementId);

// Settlement paid
await notifySettlementPaid(settlementId);
```

### System Announcements

```typescript
// Notify all users
await notifySystemAnnouncement({
  title: 'Maintenance Scheduled',
  message: 'System will be down for maintenance on...',
  link: '/announcements/maintenance',
});

// Notify specific users
await notifySystemAnnouncement({
  userIds: ['user1', 'user2'],
  title: 'Special Offer',
  message: 'You have been selected for...',
});
```

## Email Service Integration

The system is ready for email service integration. Update `lib/services/email-notifications.ts`:

### SendGrid Example

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmailNotification(data: NotificationEmailData) {
  const html = generateNotificationEmail(data);
  const text = generateNotificationText(data);

  await sgMail.send({
    to: data.to,
    from: process.env.FROM_EMAIL!,
    subject: data.title,
    html,
    text,
  });
}
```

### AWS SES Example

```typescript
import { SES } from '@aws-sdk/client-ses';

const ses = new SES({ region: 'us-east-1' });

export async function sendEmailNotification(data: NotificationEmailData) {
  const html = generateNotificationEmail(data);
  const text = generateNotificationText(data);

  await ses.sendEmail({
    Source: process.env.FROM_EMAIL!,
    Destination: { ToAddresses: [data.to] },
    Message: {
      Subject: { Data: data.title },
      Body: {
        Html: { Data: html },
        Text: { Data: text },
      },
    },
  });
}
```

## Real-time Updates

### Option 1: Polling (Implemented)

Notifications automatically refresh every 30 seconds using React Query.

### Option 2: Supabase Realtime (Recommended)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

useEffect(() => {
  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'Notification',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      // Invalidate queries
      queryClient.invalidateQueries(['notifications']);

      // Show toast
      toast({
        title: payload.new.title,
        description: payload.new.message,
      });
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [userId]);
```

### Option 3: WebSockets

Implement custom WebSocket server for real-time push notifications.

## Notification Categories

| Category | Description | Email Default | In-App Default |
|----------|-------------|---------------|----------------|
| Orders | New orders, completions | ✅ | ✅ |
| Payments | Payment confirmations/failures | ✅ | ✅ |
| Refunds | Refund approvals/rejections | ✅ | ✅ |
| Products | Product approvals/rejections | ✅ | ✅ |
| Verifications | Verification requests/completions | ✅ | ✅ |
| Settlements | Monthly settlement notifications | ✅ | ✅ |
| Reviews | New product reviews | ✅ | ✅ |
| Messages | Direct messages | ✅ | ✅ |
| System | System announcements | ✅ | ✅ |

## Performance Considerations

1. **Database Indexes**: Optimized for user queries
   - `[user_id, read]` - Unread notifications
   - `[user_id, created_at]` - Recent notifications
   - `[created_at]` - Cleanup old notifications

2. **Pagination**: Default 20 notifications per page

3. **Polling**: 30-second intervals to avoid excessive API calls

4. **Bulk Operations**: Use `createBulkNotifications()` for system announcements

5. **Email Throttling**: Consider rate limiting for bulk emails

## Security

1. **Authorization**: All API routes verify user authentication
2. **Ownership**: Users can only access their own notifications
3. **XSS Protection**: Notification content is sanitized
4. **CSRF Protection**: Next.js built-in CSRF protection

## Testing

### Create Test Notification

```typescript
// In your test file or admin panel
await createNotification({
  userId: 'test-user-id',
  type: 'SYSTEM_ANNOUNCEMENT',
  title: 'Test Notification',
  message: 'This is a test notification',
  link: '/test',
});
```

### Test Email Templates

```typescript
import { generateNotificationEmail } from '@/lib/email/notification-templates';

const html = generateNotificationEmail({
  type: 'ORDER_PLACED',
  title: 'New Order',
  message: 'You have a new order',
  link: '/orders/123',
});

console.log(html); // Preview in browser
```

## Migration

Run database migration to add notification tables:

```bash
npx prisma migrate dev --name add_notifications
npx prisma generate
```

## Future Enhancements

- [ ] Push notifications (Web Push API)
- [ ] SMS notifications (Twilio)
- [ ] Slack/Discord webhooks
- [ ] Notification digest emails (daily/weekly)
- [ ] Custom notification sounds
- [ ] Notification priority levels
- [ ] Rich media notifications (images, videos)
- [ ] Notification templates for admins
- [ ] A/B testing for notification content
- [ ] Analytics and engagement tracking

## Troubleshooting

### Notifications not appearing

1. Check user authentication
2. Verify database migration completed
3. Check browser console for errors
4. Verify API routes are accessible

### Email notifications not sending

1. Verify email service credentials
2. Check spam folder
3. Verify FROM_EMAIL is configured
4. Check email service logs

### Unread count not updating

1. Check polling interval
2. Verify React Query cache invalidation
3. Check network tab for API calls
4. Verify WebSocket connection (if using real-time)

## Support

For issues or questions, contact the development team or open an issue in the project repository.

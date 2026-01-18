# AI Marketplace Notification System

A complete, production-ready notification system with in-app notifications, email integration, and real-time updates.

## Quick Start

### 1. Database Migration

```bash
npx prisma migrate dev --name add_notification_system
npx prisma generate
```

### 2. Add to Your Layout

```tsx
import { NotificationBell } from '@/components/notifications/NotificationBell';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <header>
          <nav>
            {/* Your navigation */}
            <NotificationBell />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
```

### 3. Send Notifications

```typescript
import { notifyNewOrder } from '@/lib/services/notification-service';

// In your order creation handler
await notifyNewOrder(orderId);
```

That's it! Your notification system is ready to use.

## Features

### In-App Notifications
- Real-time notification bell with unread badge
- Dropdown list with mark as read/delete actions
- Full-page notifications view with tabs
- Polling-based auto-refresh (30s intervals)

### Email Notifications
- Beautiful HTML email templates
- Type-specific icons and colors
- Plain text fallbacks
- User preference management
- Ready for SendGrid, AWS SES, or any email service

### Notification Types (16)
- Order notifications (placed, completed)
- Payment notifications (received, failed)
- Refund notifications (approved, rejected)
- Verification notifications (requested, completed, assigned)
- Product notifications (approved, rejected)
- Settlement notifications (ready, paid)
- Review notifications
- Message notifications
- System announcements

### User Preferences
- Email notification settings per category
- In-app notification settings per category
- Easy-to-use settings page at `/settings/notifications`

## File Structure

```
prisma/schema.prisma              # Database schema with Notification model

lib/services/
  notification-service.ts         # Core notification functions
  email-notifications.ts          # Email integration

lib/email/
  notification-templates.tsx      # HTML email templates

hooks/
  use-notifications.ts            # React Query hooks

components/notifications/
  NotificationBell.tsx            # Bell dropdown component
  NotificationList.tsx            # Notification list
  NotificationItem.tsx            # Individual notification

app/api/notifications/            # API routes
app/(marketplace)/notifications/  # Notifications page
app/(marketplace)/settings/notifications/  # Settings page

docs/
  NOTIFICATION_SYSTEM.md          # Complete documentation
  NOTIFICATION_SETUP.md           # Setup guide
  NOTIFICATION_EXAMPLES.md        # Usage examples
  NOTIFICATION_SUMMARY.md         # Implementation summary
```

## API Routes

```
GET    /api/notifications                     # List notifications
PATCH  /api/notifications/[id]/read           # Mark as read
DELETE /api/notifications/[id]                # Delete notification
PATCH  /api/notifications/mark-all-read       # Mark all as read
DELETE /api/notifications/clear-all           # Clear read notifications
GET    /api/user/notification-settings        # Get preferences
PATCH  /api/user/notification-settings        # Update preferences
```

## React Hooks

```typescript
// Fetch notifications with auto-refresh
const { data } = useNotifications({ unreadOnly: true });

// Mark as read
const markAsRead = useMarkNotificationRead();
await markAsRead.mutateAsync(notificationId);

// Mark all as read
const markAllRead = useMarkAllNotificationsRead();
await markAllRead.mutateAsync();

// Delete notification
const deleteNotif = useDeleteNotification();
await deleteNotif.mutateAsync(notificationId);

// Clear all read
const clearAll = useClearAllNotifications();
await clearAll.mutateAsync();
```

## Service Functions

### Order Notifications
```typescript
await notifyNewOrder(orderId);
await notifyOrderCompleted(orderId);
```

### Payment Notifications
```typescript
await notifyPaymentReceived(orderId);
await notifyPaymentFailed(orderId, reason);
```

### Verification Notifications
```typescript
await notifyVerificationRequested(verificationId);
await notifyVerificationCompleted(verificationId);
await notifyVerificationAssigned(verificationId);
```

### Settlement Notifications
```typescript
await notifySettlementReady(settlementId);
await notifySettlementPaid(settlementId);
```

### Product Notifications
```typescript
await notifyProductApproved(productId);
await notifyProductRejected(productId, reason);
```

### Refund Notifications
```typescript
await notifyRefundApproved(orderId);
await notifyRefundRejected(orderId, reason);
```

### System Announcements
```typescript
// All users
await notifySystemAnnouncement({
  title: 'Maintenance Scheduled',
  message: 'Platform will be down...',
  link: '/announcements',
});

// Specific users
await notifySystemAnnouncement({
  userIds: ['user1', 'user2'],
  title: 'Special Offer',
  message: 'You have been selected...',
});
```

## Email Service Setup

### SendGrid

```typescript
// lib/services/email-notifications.ts
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

### AWS SES

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

### Option 1: Polling (Default)

Automatically enabled. Notifications refresh every 30 seconds.

```typescript
useNotifications({ refetchInterval: 30000 });
```

### Option 2: Supabase Realtime

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
      queryClient.invalidateQueries(['notifications']);
      toast({ title: payload.new.title });
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [userId]);
```

## Configuration

### Environment Variables

```env
# Email Service
SENDGRID_API_KEY=your_key
# or
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

FROM_EMAIL=noreply@yourdomain.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Polling Interval

Adjust in `hooks/use-notifications.ts`:

```typescript
useNotifications({
  refetchInterval: 60000, // 1 minute
});
```

## Documentation

- **[Complete Documentation](docs/NOTIFICATION_SYSTEM.md)** - Full system reference
- **[Setup Guide](docs/NOTIFICATION_SETUP.md)** - Installation and configuration
- **[Examples](docs/NOTIFICATION_EXAMPLES.md)** - Usage examples
- **[Summary](docs/NOTIFICATION_SUMMARY.md)** - Implementation overview
- **[Migration Guide](prisma/migrations/migration_guide.md)** - Database setup

## Testing

Create a test notification:

```typescript
await createNotification({
  userId: 'test-user-id',
  type: 'SYSTEM_ANNOUNCEMENT',
  title: 'Test Notification',
  message: 'This is a test notification',
  link: '/test',
});
```

## Support

For issues or questions:
1. Check the documentation in `docs/`
2. Review examples in `docs/NOTIFICATION_EXAMPLES.md`
3. Open an issue in the project repository

## License

Part of the AI Marketplace project.

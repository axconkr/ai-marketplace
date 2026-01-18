# Notification System Setup Guide

## Prerequisites

- Next.js 14+ project
- Prisma ORM configured
- PostgreSQL database
- React Query (@tanstack/react-query)
- shadcn/ui components

## Installation Steps

### 1. Database Setup

Update your Prisma schema and run migrations:

```bash
# The schema has already been updated in prisma/schema.prisma
npx prisma migrate dev --name add_notification_system
npx prisma generate
```

This will create:
- `Notification` table
- `NotificationType` enum
- `notification_settings` field in User table

### 2. Install Dependencies

```bash
# If not already installed
npm install @tanstack/react-query
npm install @radix-ui/react-popover
npm install lucide-react
npm install date-fns
npm install clsx tailwind-merge
```

### 3. Add Environment Variables

Add to `.env`:

```env
# Email Service (Optional - choose one)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com

# OR AWS SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
FROM_EMAIL=noreply@yourdomain.com

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. React Query Provider Setup

If not already set up, add React Query provider to your root layout:

```tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 5. Add Notification Bell to Layout

Add the notification bell to your main navigation:

```tsx
// components/layout/Header.tsx or similar
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Header() {
  return (
    <header>
      <nav>
        {/* Your existing navigation */}
        <NotificationBell />
      </nav>
    </header>
  );
}
```

### 6. Configure Email Service

Choose one email service and configure:

#### Option A: SendGrid

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

#### Option B: AWS SES

```typescript
// lib/services/email-notifications.ts
import { SES } from '@aws-sdk/client-ses';

const ses = new SES({ region: process.env.AWS_REGION });

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

### 7. Integrate Notifications into Your Features

#### Order Notifications

```typescript
// In your order creation handler
import { notifyNewOrder } from '@/lib/services/notification-service';

export async function createOrder(data: CreateOrderData) {
  const order = await prisma.order.create({ data });

  // Send notification to seller
  await notifyNewOrder(order.id);

  return order;
}
```

#### Payment Notifications

```typescript
// In your payment webhook handler
import { notifyPaymentReceived } from '@/lib/services/notification-service';

export async function handlePaymentSuccess(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'PAID' }
  });

  // Notify seller
  await notifyPaymentReceived(orderId);
}
```

#### Verification Notifications

```typescript
// When verification is completed
import { notifyVerificationCompleted } from '@/lib/services/notification-service';

export async function completeVerification(verificationId: string, result: any) {
  await prisma.verification.update({
    where: { id: verificationId },
    data: { status: 'COMPLETED', ...result }
  });

  // Notify seller
  await notifyVerificationCompleted(verificationId);
}
```

### 8. Add Routes to Navigation

Update your navigation to include notification routes:

```tsx
// Navigation configuration
const routes = [
  // ... other routes
  { href: '/notifications', label: 'Notifications' },
  { href: '/settings/notifications', label: 'Notification Settings' },
];
```

### 9. Optional: Real-time Updates with Supabase

For real-time notifications without polling:

```bash
npm install @supabase/supabase-js
```

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// hooks/use-notifications.ts - add real-time subscription
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

      // Show toast notification
      toast({
        title: payload.new.title,
        description: payload.new.message,
      });
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [userId]);
```

### 10. Testing

Create a test notification to verify everything works:

```typescript
// Test in browser console or admin panel
fetch('/api/admin/test-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'your-user-id',
    type: 'SYSTEM_ANNOUNCEMENT',
    title: 'Test Notification',
    message: 'This is a test notification',
  })
});
```

## Verification Checklist

- [ ] Database migration completed
- [ ] Notification bell appears in header
- [ ] Clicking bell shows notification dropdown
- [ ] Can mark notifications as read
- [ ] Unread count badge updates correctly
- [ ] Full notifications page accessible at `/notifications`
- [ ] Settings page accessible at `/settings/notifications`
- [ ] Email notifications send successfully
- [ ] Notification preferences save correctly
- [ ] Real-time updates work (if configured)

## Common Issues

### Issue: Notifications not showing

**Solution**:
1. Check user authentication
2. Verify API routes are accessible
3. Check browser console for errors
4. Verify database migration completed

### Issue: Email not sending

**Solution**:
1. Verify email service credentials in `.env`
2. Check email service dashboard for errors
3. Check spam folder
4. Verify FROM_EMAIL is configured

### Issue: Unread count not updating

**Solution**:
1. Check React Query cache invalidation
2. Verify polling interval is set
3. Check network tab for API calls
4. Clear browser cache

### Issue: TypeScript errors

**Solution**:
```bash
npx prisma generate
npm run build
```

## Next Steps

1. Customize notification templates in `lib/email/notification-templates.tsx`
2. Add more notification types as needed
3. Implement push notifications (Web Push API)
4. Add notification analytics
5. Create admin panel for system announcements

## Support

For help and questions:
- Check documentation: `docs/NOTIFICATION_SYSTEM.md`
- Review example implementations in the codebase
- Open an issue in the project repository

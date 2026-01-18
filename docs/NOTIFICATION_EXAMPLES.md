# Notification System Examples

## Basic Usage Examples

### 1. Order Notifications

#### When a new order is created

```typescript
// app/api/orders/route.ts
import { notifyNewOrder } from '@/lib/services/notification-service';

export async function POST(request: Request) {
  const data = await request.json();

  // Create order
  const order = await prisma.order.create({
    data: {
      buyer_id: session.user.id,
      product_id: data.productId,
      amount: data.amount,
      // ... other fields
    },
  });

  // Notify seller
  await notifyNewOrder(order.id);

  return NextResponse.json(order);
}
```

#### When order is completed

```typescript
// app/api/orders/[id]/complete/route.ts
import { notifyOrderCompleted } from '@/lib/services/notification-service';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Complete the order
  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status: 'COMPLETED',
      access_granted: true,
      download_url: generateDownloadUrl(),
    },
  });

  // Notify buyer
  await notifyOrderCompleted(order.id);

  return NextResponse.json(order);
}
```

### 2. Payment Notifications

#### Payment webhook handler

```typescript
// app/api/webhooks/stripe/route.ts
import { notifyPaymentReceived, notifyPaymentFailed } from '@/lib/services/notification-service';

export async function POST(request: Request) {
  const event = await stripe.webhooks.constructEvent(
    await request.text(),
    request.headers.get('stripe-signature')!,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    });

    // Notify seller
    await notifyPaymentReceived(orderId);
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;
    const reason = paymentIntent.last_payment_error?.message;

    // Notify buyer
    await notifyPaymentFailed(orderId, reason);
  }

  return NextResponse.json({ received: true });
}
```

### 3. Verification Notifications

#### When verification is requested

```typescript
// app/api/verifications/request/route.ts
import { notifyVerificationRequested } from '@/lib/services/notification-service';

export async function POST(request: Request) {
  const { productId, level } = await request.json();

  // Create verification request
  const verification = await prisma.verification.create({
    data: {
      product_id: productId,
      level,
      status: 'PENDING',
      fee: getVerificationFee(level),
      // ... other fields
    },
  });

  // Notify seller
  await notifyVerificationRequested(verification.id);

  return NextResponse.json(verification);
}
```

#### When verification is completed

```typescript
// app/api/verifications/[id]/complete/route.ts
import { notifyVerificationCompleted } from '@/lib/services/notification-service';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { status, score, badges, report } = await request.json();

  // Update verification
  const verification = await prisma.verification.update({
    where: { id: params.id },
    data: {
      status,
      score,
      badges,
      report,
      completed_at: new Date(),
    },
  });

  // Notify seller
  await notifyVerificationCompleted(verification.id);

  // If approved, notify product approval
  if (status === 'APPROVED') {
    await notifyProductApproved(verification.product_id);
  }

  return NextResponse.json(verification);
}
```

### 4. Settlement Notifications

#### Monthly settlement cron job

```typescript
// app/api/cron/monthly-settlements/route.ts
import { notifySettlementReady } from '@/lib/services/notification-service';

export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const sellers = await prisma.user.findMany({
    where: { role: 'service_provider' },
  });

  for (const seller of sellers) {
    // Create settlement
    const settlement = await createMonthlySettlement(seller.id, lastMonth);

    // Notify seller
    if (settlement) {
      await notifySettlementReady(settlement.id);
    }
  }

  return NextResponse.json({ success: true });
}
```

#### Settlement payment processing

```typescript
// lib/services/settlement.ts
import { notifySettlementPaid } from '@/lib/services/notification-service';

export async function processSettlementPayment(settlementId: string) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
  });

  // Process payout via Stripe Connect
  const payout = await stripe.payouts.create({
    amount: settlement.payout_amount,
    currency: settlement.currency,
  }, {
    stripeAccount: settlement.seller.stripe_account_id,
  });

  // Update settlement
  await prisma.settlement.update({
    where: { id: settlementId },
    data: {
      status: 'PAID',
      payout_date: new Date(),
      payout_reference: payout.id,
    },
  });

  // Notify seller
  await notifySettlementPaid(settlementId);
}
```

### 5. Refund Notifications

#### Refund request approval

```typescript
// app/api/refunds/[id]/approve/route.ts
import { notifyRefundApproved } from '@/lib/services/notification-service';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const refund = await prisma.refund.findUnique({
    where: { id: params.id },
    include: { order: true },
  });

  // Process refund via payment provider
  const stripeRefund = await stripe.refunds.create({
    payment_intent: refund.provider_payment_id,
  });

  // Update refund
  await prisma.refund.update({
    where: { id: params.id },
    data: { status: 'SUCCEEDED' },
  });

  // Update order
  await prisma.order.update({
    where: { id: refund.order_id },
    data: { status: 'REFUNDED' },
  });

  // Notify buyer
  await notifyRefundApproved(refund.order_id);

  return NextResponse.json(refund);
}
```

### 6. System Announcements

#### Scheduled maintenance announcement

```typescript
// app/api/admin/announcements/route.ts
import { notifySystemAnnouncement } from '@/lib/services/notification-service';

export async function POST(request: Request) {
  const { title, message, link, userIds } = await request.json();

  // Create announcement
  await notifySystemAnnouncement({
    userIds, // Optional: specific users, or undefined for all
    title,
    message,
    link,
  });

  return NextResponse.json({ success: true });
}

// Example usage
await notifySystemAnnouncement({
  title: 'Scheduled Maintenance',
  message: 'The platform will be under maintenance on Dec 30, 2024 from 2:00 AM to 4:00 AM UTC.',
  link: '/announcements/maintenance',
});
```

#### Targeted promotion

```typescript
// Notify only sellers
const sellers = await prisma.user.findMany({
  where: { role: 'service_provider' },
  select: { id: true },
});

await notifySystemAnnouncement({
  userIds: sellers.map(s => s.id),
  title: 'New Feature: Enhanced Analytics',
  message: 'We have launched new analytics features for sellers. Check it out!',
  link: '/dashboard/analytics',
});
```

### 7. Custom Notifications

#### Create custom notification

```typescript
import { createNotification } from '@/lib/services/notification-service';

// Welcome notification for new users
await createNotification({
  userId: newUser.id,
  type: 'SYSTEM_ANNOUNCEMENT',
  title: 'Welcome to AI Marketplace!',
  message: 'Get started by browsing our products or listing your own.',
  link: '/getting-started',
  data: {
    isWelcome: true,
    registrationDate: new Date(),
  },
});

// Custom product notification
await createNotification({
  userId: seller.id,
  type: 'PRODUCT_APPROVED',
  title: 'Product Featured',
  message: `Your product "${product.name}" has been selected for our homepage!`,
  link: `/products/${product.id}`,
  data: {
    productId: product.id,
    featured: true,
  },
});
```

## Advanced Examples

### Batch Notifications

```typescript
import { createBulkNotifications } from '@/lib/services/notification-service';

// Notify all buyers of a product when it's updated
const orders = await prisma.order.findMany({
  where: {
    product_id: productId,
    status: 'COMPLETED',
  },
  select: { buyer_id: true },
});

await createBulkNotifications(
  orders.map(order => ({
    userId: order.buyer_id,
    type: 'SYSTEM_ANNOUNCEMENT',
    title: 'Product Updated',
    message: `A product you purchased has been updated with new features!`,
    link: `/products/${productId}`,
  }))
);
```

### Notification with Expiration

```typescript
await createNotification({
  userId: user.id,
  type: 'SYSTEM_ANNOUNCEMENT',
  title: 'Limited Time Offer',
  message: 'Get 20% off all products this weekend!',
  link: '/promotions',
  data: { discount: 20 },
  // Notification expires in 3 days
  expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
});
```

### Conditional Email Notifications

```typescript
// Only send email for critical notifications
await createNotification({
  userId: user.id,
  type: 'PAYMENT_FAILED',
  title: 'Payment Failed',
  message: 'Your payment was declined. Please update your payment method.',
  link: '/settings/payment-methods',
  // Email will be sent based on user preferences
  // But you can override for critical notifications
});
```

### Error Handling

```typescript
try {
  await notifyNewOrder(orderId);
} catch (error) {
  console.error('Failed to send notification:', error);
  // Log to error tracking service
  // Don't fail the main operation if notification fails
}
```

### Testing Notifications

```typescript
// Test notification in development
if (process.env.NODE_ENV === 'development') {
  await createNotification({
    userId: 'test-user-id',
    type: 'SYSTEM_ANNOUNCEMENT',
    title: 'Test Notification',
    message: 'This is a test notification',
    link: '/test',
  });
}
```

## Frontend Integration Examples

### Using the NotificationBell

```tsx
// components/layout/Header.tsx
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <Logo />
      <nav className="flex items-center gap-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/products">Products</Link>
        <NotificationBell />
        <UserMenu />
      </nav>
    </header>
  );
}
```

### Custom Notification Display

```tsx
'use client';

import { useNotifications } from '@/hooks/use-notifications';

export function CustomNotificationList() {
  const { data, isLoading } = useNotifications();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.notifications.map((notification) => (
        <div key={notification.id} className="notification-item">
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          <span>{new Date(notification.created_at).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
}
```

### Real-time Toast Notifications

```tsx
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

export function NotificationToast({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Poll for new notifications
    const interval = setInterval(async () => {
      const data = await queryClient.fetchQuery(['notifications', { unreadOnly: true }]);

      if (data.unreadCount > 0) {
        const latest = data.notifications[0];
        toast({
          title: latest.title,
          description: latest.message,
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [userId, queryClient]);

  return null;
}
```

## Summary

The notification system is designed to be:
- **Easy to integrate**: Simple function calls
- **Type-safe**: Full TypeScript support
- **Flexible**: Customizable for any use case
- **Reliable**: Error handling and fallbacks
- **Scalable**: Bulk operations and efficient queries

For more examples and detailed documentation, see:
- `docs/NOTIFICATION_SYSTEM.md` - Complete system documentation
- `docs/NOTIFICATION_SETUP.md` - Setup and configuration guide

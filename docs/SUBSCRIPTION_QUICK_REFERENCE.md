# Subscription System - Quick Reference

Fast reference guide for developers working with the subscription system.

## Quick Start

```bash
# 1. Update database
npm run db:generate
npm run db:push

# 2. Seed plans
npm run subscription:seed

# 3. Configure Stripe (see deployment guide)

# 4. Run tests
npm run test:integration
```

## Common Tasks

### Check User's Subscription Tier

```typescript
import { SubscriptionService } from '@/lib/subscriptions';

const tier = await SubscriptionService.getUserTier(userId);
// Returns: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
```

### Check if User Has Active Subscription

```typescript
const hasActive = await SubscriptionService.hasActiveSubscription(userId);
// Returns: boolean
```

### Get User's Subscription Details

```typescript
const subscription = await SubscriptionService.getSubscription(userId);
// Returns: SubscriptionDetails | null
```

### Create Checkout Session

```typescript
import { StripeSubscriptionService } from '@/lib/subscriptions';

const session = await StripeSubscriptionService.createCheckoutSession(
  userId,
  userEmail,
  {
    tier: 'BASIC',
    interval: 'MONTHLY',
    successUrl: 'https://app.com/success',
    cancelUrl: 'https://app.com/pricing',
  }
);

// Redirect user to: session.url
```

### Access Customer Portal

```typescript
const portal = await StripeSubscriptionService.createPortalSession(
  userId,
  'https://app.com/dashboard'
);

// Redirect user to: portal.url
```

### Cancel Subscription

```typescript
// Cancel at period end
await StripeSubscriptionService.cancelSubscription(subscriptionId, false);

// Cancel immediately
await StripeSubscriptionService.cancelSubscription(subscriptionId, true);
```

### Upgrade/Downgrade

```typescript
await StripeSubscriptionService.updateSubscription(
  subscriptionId,
  'PRO', // new tier
  'YEARLY' // new interval
);
```

## Feature Access Control

### Check Feature Access

```typescript
import { PLAN_FEATURES, SubscriptionTier } from '@/lib/subscriptions';

async function canAccessAPI(userId: string) {
  const tier = await SubscriptionService.getUserTier(userId);
  return PLAN_FEATURES[tier].apiAccess;
}

async function getMaxProducts(userId: string) {
  const tier = await SubscriptionService.getUserTier(userId);
  return PLAN_FEATURES[tier].maxProducts; // number | 'unlimited'
}

async function getVerificationDiscount(userId: string) {
  const tier = await SubscriptionService.getUserTier(userId);
  return PLAN_FEATURES[tier].verificationDiscount; // 0-30%
}
```

### Example: Restrict Feature by Tier

```typescript
// In your API route
import { verifyAuth } from '@/lib/auth/middleware';
import { SubscriptionService, SubscriptionTier } from '@/lib/subscriptions';

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tier = await SubscriptionService.getUserTier(auth.user.id);

  // Require PRO or ENTERPRISE for this feature
  if (![SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE].includes(tier)) {
    return NextResponse.json(
      { error: 'This feature requires PRO or higher subscription' },
      { status: 403 }
    );
  }

  // Feature logic here...
}
```

## Plans & Pricing

| Tier | Monthly | Yearly | Key Features |
|------|---------|--------|--------------|
| FREE | ₩0 | ₩0 | 3 products, basic analytics |
| BASIC | ₩9,900 | ₩99,000 | Unlimited products, 10% discount |
| PRO | ₩29,900 | ₩299,000 | API access, priority listing, 20% discount |
| ENTERPRISE | ₩99,900 | ₩999,000 | White label, SLA, custom integrations |

## API Endpoints

### Get Plans
```typescript
GET /api/subscriptions/plans
// Public, no auth required
```

### Get Current Subscription
```typescript
GET /api/subscriptions
Headers: { Authorization: 'Bearer <token>' }
```

### Create Checkout
```typescript
POST /api/subscriptions/checkout
Headers: { Authorization: 'Bearer <token>' }
Body: {
  tier: 'BASIC',
  interval: 'MONTHLY',
  successUrl?: string,
  cancelUrl?: string
}
```

### Update Subscription
```typescript
PUT /api/subscriptions/[id]
Headers: { Authorization: 'Bearer <token>' }
Body: {
  tier?: 'PRO',
  interval?: 'YEARLY',
  cancelAtPeriodEnd?: false
}
```

### Cancel Subscription
```typescript
DELETE /api/subscriptions/[id]?immediately=false
Headers: { Authorization: 'Bearer <token>' }
```

### Customer Portal
```typescript
POST /api/subscriptions/portal
Headers: { Authorization: 'Bearer <token>' }
Body: { returnUrl?: string }
```

## Webhook Events

### Supported Events

```typescript
'customer.subscription.created'    // New subscription
'customer.subscription.updated'    // Tier/status change
'customer.subscription.deleted'    // Cancellation
'invoice.payment_succeeded'        // Successful payment
'invoice.payment_failed'          // Failed payment
```

### Event Handler

Already implemented in `/api/webhooks/stripe-subscription/route.ts`

## Testing

### Test Cards (Stripe)

```typescript
// Success
'4242 4242 4242 4242'

// Requires authentication
'4000 0025 0000 3155'

// Declined
'4000 0000 0000 9995'
```

### Trigger Test Webhooks

```bash
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### Run Tests

```bash
# All subscription tests
npm test subscriptions

# Integration tests
npm run test:integration

# With coverage
npm run test:coverage
```

## Common Patterns

### Middleware for Tier Check

```typescript
// middleware/requirePro.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { SubscriptionService, SubscriptionTier } from '@/lib/subscriptions';

export async function requirePro(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tier = await SubscriptionService.getUserTier(auth.user.id);
  if (![SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE].includes(tier)) {
    return NextResponse.json(
      { error: 'PRO subscription required' },
      { status: 403 }
    );
  }

  return null; // Access granted
}

// Usage in API route
export async function POST(req: NextRequest) {
  const error = await requirePro(req);
  if (error) return error;

  // Your logic here...
}
```

### Client-Side Hook

```typescript
// hooks/useSubscription.ts
import { useQuery } from '@tanstack/react-query';

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });
}

// Usage
function Dashboard() {
  const { data, isLoading } = useSubscription();

  if (isLoading) return <div>Loading...</div>;
  if (!data?.data) return <div>No subscription</div>;

  return <div>Tier: {data.data.tier}</div>;
}
```

## Troubleshooting

### Webhook Not Working

1. Check webhook URL is accessible
2. Verify signing secret: `STRIPE_WEBHOOK_SECRET`
3. Check Stripe Dashboard → Webhooks → Logs
4. Test with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe-subscription
   ```

### User Tier Not Updating

1. Check subscription was created successfully
2. Verify webhook was received and processed
3. Check database: `SELECT * FROM "Subscription" WHERE "userId" = '...'`
4. Check user record: `SELECT "subscriptionTier" FROM "User" WHERE id = '...'`

### Payment Failed

1. User receives notification automatically
2. Stripe retries automatically (Smart Retries)
3. After retries exhausted, subscription → PAST_DUE
4. User can update payment method in Customer Portal

## Environment Variables

```env
# Required
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (production webhook secret)
```

## Database Queries

### Active Subscriptions

```sql
SELECT * FROM "Subscription"
WHERE status = 'ACTIVE';
```

### User's Subscription

```sql
SELECT s.*, sp.*
FROM "Subscription" s
JOIN "SubscriptionPlan" sp ON s.tier = sp.tier
WHERE s."userId" = '...' AND s.status = 'ACTIVE';
```

### MRR Calculation

```sql
SELECT
  SUM(CASE
    WHEN s.interval = 'MONTHLY' THEN sp."monthlyPrice"
    WHEN s.interval = 'YEARLY' THEN sp."yearlyPrice" / 12
  END) as mrr
FROM "Subscription" s
JOIN "SubscriptionPlan" sp ON s.tier = sp.tier
WHERE s.status = 'ACTIVE';
```

## Links

- **Full Documentation**: [SUBSCRIPTION_SYSTEM.md](./SUBSCRIPTION_SYSTEM.md)
- **Deployment Guide**: [SUBSCRIPTION_DEPLOYMENT.md](./SUBSCRIPTION_DEPLOYMENT.md)
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe Docs**: https://stripe.com/docs/billing/subscriptions

## Quick Commands

```bash
# Database
npm run db:studio                 # Open Prisma Studio
npm run subscription:seed         # Seed plans

# Development
npm run dev                       # Start dev server
stripe listen --forward-to ...    # Forward webhooks

# Testing
npm test subscriptions            # Run subscription tests
npm run test:coverage             # Coverage report

# Production
npm run build                     # Build for production
npm start                         # Start production server
```

## Support

- Check application logs
- Check Stripe Dashboard → Events
- Review webhook logs
- Run integration tests
- Consult full documentation

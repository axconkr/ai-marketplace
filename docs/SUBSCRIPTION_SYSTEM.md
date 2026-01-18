# Subscription Payment System

Complete subscription-based revenue model for the AI Marketplace.

## Overview

The subscription system allows users to subscribe to monthly or yearly plans with automatic recurring billing via Stripe. Features include:

- 4 tier plans (FREE, BASIC, PRO, ENTERPRISE)
- Monthly and yearly billing intervals
- Automatic subscription renewal
- Upgrade/downgrade capabilities
- Webhook synchronization with Stripe
- Billing history
- Customer portal for self-service

## Architecture

```
┌─────────────────┐
│   User/Client   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│        API Endpoints                │
│  - /api/subscriptions/plans         │
│  - /api/subscriptions               │
│  - /api/subscriptions/checkout      │
│  - /api/subscriptions/portal        │
│  - /api/webhooks/stripe-subscription│
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      Service Layer                  │
│  - SubscriptionService              │
│  - PlanService                      │
│  - StripeSubscriptionService        │
│  - NotificationService              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│     Database (PostgreSQL)           │
│  - Subscription                     │
│  - SubscriptionPlan                 │
│  - User (with subscriptionTier)     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      Stripe                         │
│  - Customer                         │
│  - Subscription                     │
│  - Invoice                          │
│  - Webhook Events                   │
└─────────────────────────────────────┘
```

## Subscription Plans

### FREE (무료)
- **Price**: ₩0
- **Features**:
  - 최대 3개 상품 등록
  - 기본 분석
  - 커뮤니티 지원

### BASIC (베이직)
- **Monthly**: ₩9,900/month
- **Yearly**: ₩99,000/year (2 months free)
- **Features**:
  - 무제한 상품 등록
  - 고급 분석
  - 이메일 지원
  - 검증 할인 10%

### PRO (프로)
- **Monthly**: ₩29,900/month
- **Yearly**: ₩299,000/year
- **Features**:
  - 베이직 모든 기능
  - 우선 리스팅
  - 전용 지원
  - 검증 할인 20%
  - API 액세스

### ENTERPRISE (엔터프라이즈)
- **Monthly**: ₩99,900/month
- **Yearly**: ₩999,000/year
- **Features**:
  - 프로 모든 기능
  - 화이트라벨
  - 전담 매니저
  - 커스텀 통합
  - SLA 보장

## Setup Instructions

### 1. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed subscription plans
tsx scripts/seed-subscription-plans.ts
```

### 2. Stripe Configuration

#### Create Products in Stripe Dashboard

1. Go to Stripe Dashboard → Products
2. Create 4 products:
   - Basic Plan
   - Pro Plan
   - Enterprise Plan

#### Create Prices for Each Product

For each product, create two prices:

**Monthly Price:**
- Billing period: Monthly
- Price: (See plan pricing above)
- Currency: KRW

**Yearly Price:**
- Billing period: Yearly
- Price: (See plan pricing above)
- Currency: KRW

#### Update Database with Price IDs

```sql
-- Update plans with Stripe price IDs
UPDATE "SubscriptionPlan"
SET "stripePriceIdMonthly" = 'price_xxx',
    "stripePriceIdYearly" = 'price_yyy'
WHERE tier = 'BASIC';

-- Repeat for PRO and ENTERPRISE
```

### 3. Webhook Configuration

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe-subscription`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret
5. Add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 4. Environment Variables

Add to `.env.local`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Documentation

### GET /api/subscriptions/plans

List all available subscription plans.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tier": "BASIC",
      "name": "베이직",
      "description": "개인 개발자를 위한 플랜",
      "monthlyPrice": 9900,
      "yearlyPrice": 99000,
      "features": ["무제한 상품 등록", "고급 분석", ...],
      "isActive": true
    }
  ]
}
```

### GET /api/subscriptions

Get user's current subscription.

**Headers:**
- `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sub_xxx",
    "userId": "user_xxx",
    "tier": "BASIC",
    "status": "ACTIVE",
    "interval": "MONTHLY",
    "currentPeriodStart": "2024-01-01T00:00:00Z",
    "currentPeriodEnd": "2024-02-01T00:00:00Z",
    "cancelAtPeriodEnd": false
  }
}
```

### POST /api/subscriptions/checkout

Create Stripe Checkout Session for new subscription.

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Body:**
```json
{
  "tier": "BASIC",
  "interval": "MONTHLY",
  "successUrl": "https://your-app.com/success",
  "cancelUrl": "https://your-app.com/pricing"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_xxx",
    "url": "https://checkout.stripe.com/c/pay/cs_test_xxx"
  }
}
```

### POST /api/subscriptions/portal

Create Stripe Customer Portal session.

**Headers:**
- `Authorization: Bearer {token}`

**Body:**
```json
{
  "returnUrl": "https://your-app.com/dashboard"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://billing.stripe.com/session/xxx"
  }
}
```

### PUT /api/subscriptions/[id]

Update subscription (upgrade/downgrade).

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Body:**
```json
{
  "tier": "PRO",
  "interval": "YEARLY"
}
```

### DELETE /api/subscriptions/[id]

Cancel subscription.

**Headers:**
- `Authorization: Bearer {token}`

**Query Parameters:**
- `immediately`: boolean (default: false)

**Response:**
```json
{
  "success": true,
  "message": "Subscription will be cancelled at period end"
}
```

## Usage Examples

### Client-Side: Subscribe to Plan

```typescript
import { useState } from 'react';

function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (tier: string, interval: string) => {
    setLoading(true);

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier,
          interval,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      const { data } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={() => handleSubscribe('BASIC', 'MONTHLY')}>
      Subscribe to Basic
    </button>
  );
}
```

### Client-Side: Manage Subscription

```typescript
function SubscriptionSettings() {
  const handleManageBilling = async () => {
    const response = await fetch('/api/subscriptions/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        returnUrl: `${window.location.origin}/dashboard/subscription`,
      }),
    });

    const { data } = await response.json();
    window.location.href = data.url;
  };

  return (
    <button onClick={handleManageBilling}>
      Manage Billing
    </button>
  );
}
```

### Server-Side: Check User Tier

```typescript
import { SubscriptionService, SubscriptionTier } from '@/lib/subscriptions';

async function checkFeatureAccess(userId: string, feature: string) {
  const tier = await SubscriptionService.getUserTier(userId);

  const featureAccess = {
    api: [SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE],
    whiteLabel: [SubscriptionTier.ENTERPRISE],
    priorityListing: [SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE],
  };

  return featureAccess[feature]?.includes(tier) || false;
}
```

## Webhook Events

### customer.subscription.created
- Creates subscription record in database
- Updates user's subscription tier
- Sends notification to user

### customer.subscription.updated
- Updates subscription status
- Updates billing period
- Sends notification if tier changed

### customer.subscription.deleted
- Sets status to CANCELLED
- Downgrades user to FREE tier
- Sends cancellation notification

### invoice.payment_succeeded
- Updates subscription to ACTIVE
- Sends payment confirmation
- Records billing history

### invoice.payment_failed
- Sets status to PAST_DUE
- Sends payment failure notification
- Triggers retry logic (handled by Stripe)

## Testing

### Run Unit Tests

```bash
npm run test:unit
```

### Run Integration Tests

```bash
npm run test:integration
```

### Test Webhooks Locally

Use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/webhooks/stripe-subscription

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

## Monitoring

### Key Metrics to Track

1. **Subscription Metrics**
   - Active subscriptions by tier
   - Monthly Recurring Revenue (MRR)
   - Annual Recurring Revenue (ARR)
   - Churn rate
   - Upgrade/downgrade rate

2. **Payment Metrics**
   - Payment success rate
   - Failed payment recovery rate
   - Refund rate

3. **User Engagement**
   - Feature usage by tier
   - Conversion rate from FREE to paid

### Database Queries

```sql
-- Active subscriptions by tier
SELECT tier, COUNT(*)
FROM "Subscription"
WHERE status = 'ACTIVE'
GROUP BY tier;

-- MRR calculation
SELECT
  SUM(CASE WHEN interval = 'MONTHLY' THEN sp."monthlyPrice"
           WHEN interval = 'YEARLY' THEN sp."yearlyPrice" / 12
      END) as mrr
FROM "Subscription" s
JOIN "SubscriptionPlan" sp ON s.tier = sp.tier
WHERE s.status = 'ACTIVE';

-- Churn rate (last 30 days)
SELECT
  COUNT(*) FILTER (WHERE status = 'CANCELLED') * 100.0 /
  COUNT(*) as churn_rate
FROM "Subscription"
WHERE "updatedAt" >= NOW() - INTERVAL '30 days';
```

## Troubleshooting

### Issue: Webhook not received

1. Check webhook endpoint is accessible
2. Verify webhook signing secret is correct
3. Check Stripe webhook logs in dashboard
4. Ensure endpoint returns 200 status

### Issue: Payment fails but subscription created

- Stripe retries failed payments automatically
- User receives notification to update payment method
- After retries exhausted, subscription moves to PAST_DUE

### Issue: User tier not updating

1. Check webhook event was processed
2. Verify database transaction completed
3. Check for errors in webhook handler logs

## Security Considerations

1. **Webhook Verification**: Always verify webhook signatures
2. **Authentication**: Require authentication for all subscription endpoints
3. **Authorization**: Users can only access their own subscriptions
4. **Rate Limiting**: Implement rate limits on API endpoints
5. **Data Validation**: Validate all input with Zod schemas

## Future Enhancements

- [ ] Promo codes and discounts
- [ ] Trial periods
- [ ] Usage-based billing
- [ ] Team/organization plans
- [ ] Invoice customization
- [ ] Tax calculation (Stripe Tax)
- [ ] Analytics dashboard
- [ ] A/B testing for pricing

## Support

For issues or questions:
- Check webhook logs in Stripe Dashboard
- Review application logs
- Contact Stripe support for payment issues

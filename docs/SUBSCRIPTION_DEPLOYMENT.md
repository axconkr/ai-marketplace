# Subscription System Deployment Guide

Complete step-by-step guide to deploy the subscription payment system.

## Pre-Deployment Checklist

- [ ] Stripe account created
- [ ] Database backup completed
- [ ] Environment variables configured
- [ ] Tests passing
- [ ] Documentation reviewed

## Step 1: Database Migration

### 1.1 Generate Prisma Client

```bash
npm run db:generate
```

### 1.2 Apply Schema Changes

**Option A: Development (db push)**
```bash
npm run db:push
```

**Option B: Production (migration)**
```bash
npm run db:migrate
```

This creates:
- `Subscription` table
- `SubscriptionPlan` table
- Updates `User` table with:
  - `subscriptionTier` field (default: "FREE")
  - `stripeCustomerId` field
- New notification types in `NotificationType` enum

### 1.3 Seed Subscription Plans

```bash
npm run subscription:seed
```

Verify plans were created:
```bash
npm run db:studio
```

Check `SubscriptionPlan` table has 4 records.

## Step 2: Stripe Configuration

### 2.1 Create Products in Stripe Dashboard

1. Navigate to: https://dashboard.stripe.com/products
2. Click "Add product" for each plan:

**BASIC Plan:**
- Name: "Basic Plan"
- Description: "개인 개발자를 위한 플랜"

**PRO Plan:**
- Name: "Pro Plan"
- Description: "전문가를 위한 플랜"

**ENTERPRISE Plan:**
- Name: "Enterprise Plan"
- Description: "기업을 위한 플랜"

### 2.2 Create Prices for Each Product

For **BASIC**:

**Monthly Price:**
- Billing period: Monthly
- Price: ₩9,900
- Currency: KRW
- Copy the Price ID (starts with `price_`)

**Yearly Price:**
- Billing period: Yearly
- Price: ₩99,000
- Currency: KRW
- Copy the Price ID

Repeat for **PRO** and **ENTERPRISE**.

### 2.3 Update Database with Stripe Price IDs

Connect to database:
```bash
npm run db:studio
```

Or use SQL:
```sql
-- Update BASIC plan
UPDATE "SubscriptionPlan"
SET
  "stripePriceIdMonthly" = 'price_XXXXX_monthly',
  "stripePriceIdYearly" = 'price_XXXXX_yearly'
WHERE tier = 'BASIC';

-- Update PRO plan
UPDATE "SubscriptionPlan"
SET
  "stripePriceIdMonthly" = 'price_YYYYY_monthly',
  "stripePriceIdYearly" = 'price_YYYYY_yearly'
WHERE tier = 'PRO';

-- Update ENTERPRISE plan
UPDATE "SubscriptionPlan"
SET
  "stripePriceIdMonthly" = 'price_ZZZZZ_monthly',
  "stripePriceIdYearly" = 'price_ZZZZZ_yearly'
WHERE tier = 'ENTERPRISE';
```

### 2.4 Configure Stripe Webhooks

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe-subscription`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)

### 2.5 Update Environment Variables

Add to `.env.local` (development) and production environment:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_... # Use sk_live_ for production
STRIPE_PUBLISHABLE_KEY=pk_test_... # Use pk_live_ for production
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Step 3: Test in Development

### 3.1 Test Webhook Endpoint

Use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe-subscription

# In another terminal, trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

Check your application logs for webhook processing.

### 3.2 Test Checkout Flow

1. Start development server:
```bash
npm run dev
```

2. Navigate to pricing page
3. Click "Subscribe" button
4. Complete checkout with test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

5. Verify:
   - Subscription created in database
   - User tier updated
   - Webhook received
   - Notification sent

### 3.3 Run Integration Tests

```bash
# Run all tests
npm run test:integration

# Or specific subscription tests
npm test -- subscriptions.test.ts
```

All tests should pass.

## Step 4: Deploy to Production

### 4.1 Switch to Production Stripe Keys

In production environment variables:

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... # Production webhook secret
```

### 4.2 Update Webhook Endpoint in Stripe

1. Go to Stripe Dashboard (LIVE mode)
2. Webhooks → Add endpoint
3. URL: `https://your-production-domain.com/api/webhooks/stripe-subscription`
4. Select same events as development
5. Copy new signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in production

### 4.3 Recreate Products/Prices in LIVE Mode

Repeat Step 2 (Stripe Configuration) in **LIVE** mode:
- Create products
- Create prices
- Update database with LIVE price IDs

### 4.4 Deploy Application

```bash
# Build application
npm run build

# Deploy to your hosting platform
# (Vercel, Railway, etc.)
```

### 4.5 Verify Production Deployment

1. Visit production pricing page
2. Complete a test transaction
3. Monitor webhook logs in Stripe Dashboard
4. Check database for subscription record
5. Verify user can access Customer Portal

## Step 5: Post-Deployment Verification

### 5.1 Smoke Tests

Run through these scenarios:

**New Subscription:**
- [ ] User can view pricing plans
- [ ] User can subscribe to BASIC monthly
- [ ] Checkout redirects to Stripe
- [ ] Payment succeeds
- [ ] User redirected back to app
- [ ] Subscription appears in dashboard
- [ ] User tier updated
- [ ] Notification sent

**Subscription Management:**
- [ ] User can view current subscription
- [ ] User can access Customer Portal
- [ ] User can upgrade to PRO
- [ ] Proration calculated correctly
- [ ] User can switch monthly ↔ yearly
- [ ] User can cancel subscription
- [ ] User can reactivate before period end

**Payment Failures:**
- [ ] Failed payment sets status to PAST_DUE
- [ ] User receives failure notification
- [ ] Stripe retries payment automatically
- [ ] After retries, subscription cancelled

### 5.2 Monitor Key Metrics

Check Stripe Dashboard:
- Successful payments
- Failed payments
- Active subscriptions
- MRR (Monthly Recurring Revenue)

Check Application Logs:
- Webhook processing
- API response times
- Error rates

### 5.3 Database Health Check

```sql
-- Count subscriptions by status
SELECT status, COUNT(*)
FROM "Subscription"
GROUP BY status;

-- Check for orphaned records
SELECT COUNT(*)
FROM "Subscription" s
LEFT JOIN "User" u ON s."userId" = u.id
WHERE u.id IS NULL;

-- Verify user tiers match subscriptions
SELECT
  u."subscriptionTier" as user_tier,
  s.tier as subscription_tier,
  COUNT(*)
FROM "User" u
LEFT JOIN "Subscription" s ON u.id = s."userId" AND s.status = 'ACTIVE'
GROUP BY u."subscriptionTier", s.tier;
```

## Step 6: Monitoring and Alerts

### 6.1 Set Up Monitoring

Monitor these endpoints:
- `/api/subscriptions/plans` (should return 200)
- `/api/webhooks/stripe-subscription` (webhook health)

Monitor these metrics:
- Subscription creation rate
- Payment success rate
- Webhook processing time
- API error rate

### 6.2 Configure Alerts

Set up alerts for:
- Webhook failures (> 5% failure rate)
- Payment failures (> 10% failure rate)
- API errors (> 5% error rate)
- Slow webhook processing (> 5 seconds)

### 6.3 Stripe Dashboard Alerts

Enable email notifications in Stripe for:
- Failed payments
- Successful subscriptions
- Cancelled subscriptions
- Webhook failures

## Rollback Plan

If issues arise, rollback steps:

### 6.1 Disable New Subscriptions

```typescript
// In /api/subscriptions/checkout/route.ts
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Subscriptions temporarily unavailable' },
    { status: 503 }
  );
}
```

### 6.2 Pause Webhooks

In Stripe Dashboard:
1. Go to Webhooks
2. Disable the endpoint
3. Investigate issues
4. Re-enable when resolved

### 6.3 Database Rollback

```bash
# Revert migration
npx prisma migrate reset

# Restore from backup
psql -U username -d database_name < backup.sql
```

## Troubleshooting

### Issue: Webhooks Not Received

**Check:**
1. Webhook URL is correct and accessible
2. Signing secret matches
3. Firewall allows Stripe IPs
4. SSL certificate is valid

**Debug:**
```bash
# Test webhook endpoint
curl -X POST https://your-domain.com/api/webhooks/stripe-subscription \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'
```

### Issue: Payments Succeeding but Subscription Not Created

**Check:**
1. Webhook event `customer.subscription.created` is enabled
2. Metadata includes `userId`, `tier`, `interval`
3. Database connection is working
4. No errors in application logs

**Debug:**
Check Stripe webhook logs for event delivery status.

### Issue: User Tier Not Updating

**Check:**
1. Subscription record was created
2. User record was updated in same transaction
3. No database errors

**Debug:**
```sql
-- Check subscription without user update
SELECT s.*, u."subscriptionTier"
FROM "Subscription" s
JOIN "User" u ON s."userId" = u.id
WHERE s.tier != u."subscriptionTier";
```

## Security Checklist

- [ ] Webhook signature verification enabled
- [ ] API endpoints require authentication
- [ ] User can only access own subscription
- [ ] Rate limiting configured
- [ ] Environment variables not exposed
- [ ] Stripe keys use proper mode (test/live)
- [ ] HTTPS enabled for all endpoints

## Performance Optimization

### 6.1 Database Indexes

Already configured in Prisma schema:
```prisma
@@index([userId])
@@index([status])
@@index([stripeSubscriptionId])
```

### 6.2 Caching

Consider caching:
- Subscription plans (rarely change)
- User subscription status (TTL: 5 minutes)

```typescript
import { LRUCache } from 'lru-cache';

const planCache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 60, // 1 hour
});
```

### 6.3 Webhook Processing

Webhooks should:
- Return 200 immediately
- Process asynchronously if heavy
- Use database transactions
- Have idempotency keys

## Maintenance

### Regular Tasks

**Weekly:**
- Review failed payments
- Check webhook health
- Monitor subscription churn
- Review customer feedback

**Monthly:**
- Analyze subscription trends
- Review pricing effectiveness
- Update documentation
- Plan improvements

**Quarterly:**
- Security audit
- Performance review
- Cost optimization
- Feature planning

## Support Contacts

- **Stripe Support**: https://support.stripe.com
- **Technical Issues**: Your dev team
- **Billing Questions**: finance@your-company.com

## Next Steps

After successful deployment:

1. Set up analytics dashboard
2. Configure email templates
3. Create admin panel for subscription management
4. Implement trial periods (if needed)
5. Add promo codes (if needed)
6. Create customer success workflows

## Conclusion

Your subscription system is now deployed and ready to accept payments!

Monitor the system closely for the first few days and be prepared to respond to any issues quickly.

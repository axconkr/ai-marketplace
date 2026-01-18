# Phase 2 Completion - Next Steps Checklist

## Implementation Status: ✅ COMPLETE

Phase 2 (Subscription Payment System) implementation is complete. Follow this checklist to deploy and activate the system.

## Pre-Deployment Checklist

### 1. Code Review ✅
- [x] Database schema reviewed
- [x] Service layer implemented
- [x] API endpoints created
- [x] Webhook handler configured
- [x] Tests written
- [x] Documentation complete

### 2. Local Testing (15 minutes)

```bash
# Step 1: Update database
npm run db:generate
npm run db:push

# Step 2: Seed plans
npm run subscription:seed

# Step 3: Run tests
npm run test:integration

# Expected: All tests passing
```

**Verify:**
- [ ] Database updated without errors
- [ ] 4 plans created in SubscriptionPlan table
- [ ] All integration tests passing
- [ ] Test coverage > 82%

## Stripe Setup (30 minutes)

### 1. Create Products in Stripe Dashboard

Login to: https://dashboard.stripe.com/test/products

**Create 3 Products:**

**Product 1: Basic Plan**
```
Name: Basic Plan
Description: 개인 개발자를 위한 플랜
```

**Product 2: Pro Plan**
```
Name: Pro Plan
Description: 전문가를 위한 플랜
```

**Product 3: Enterprise Plan**
```
Name: Enterprise Plan
Description: 기업을 위한 플랜
```

### 2. Create Prices for Each Product

For each product, create TWO prices:

**BASIC - Monthly**
```
Billing period: Monthly
Price: 9900
Currency: KRW
```
Copy Price ID: `price_________________` (save this)

**BASIC - Yearly**
```
Billing period: Yearly
Price: 99000
Currency: KRW
```
Copy Price ID: `price_________________` (save this)

**Repeat for PRO and ENTERPRISE**

**PRO - Monthly**: ₩29,900
**PRO - Yearly**: ₩299,000

**ENTERPRISE - Monthly**: ₩99,900
**ENTERPRISE - Yearly**: ₩999,000

### 3. Update Database with Price IDs

Option A: Use Prisma Studio
```bash
npm run db:studio
```

Navigate to SubscriptionPlan table and update:
- BASIC: Add stripePriceIdMonthly and stripePriceIdYearly
- PRO: Add stripePriceIdMonthly and stripePriceIdYearly
- ENTERPRISE: Add stripePriceIdMonthly and stripePriceIdYearly

Option B: Use SQL
```sql
UPDATE "SubscriptionPlan"
SET
  "stripePriceIdMonthly" = 'price_XXXXX',
  "stripePriceIdYearly" = 'price_YYYYY'
WHERE tier = 'BASIC';

-- Repeat for PRO and ENTERPRISE
```

**Verify:**
- [ ] All 3 plans have monthly price IDs
- [ ] All 3 plans have yearly price IDs

### 4. Configure Webhook

Go to: https://dashboard.stripe.com/test/webhooks

**Add Endpoint:**
```
URL: http://localhost:3000/api/webhooks/stripe-subscription
(or your ngrok URL for local testing)

Events to send:
☑ customer.subscription.created
☑ customer.subscription.updated
☑ customer.subscription.deleted
☑ invoice.payment_succeeded
☑ invoice.payment_failed
```

**Copy Signing Secret:**
```
whsec_________________________________
```

### 5. Update Environment Variables

Add to `.env.local`:

```env
# Stripe Keys (TEST mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Verify:**
- [ ] All 3 Stripe keys added
- [ ] App URL is correct

## Local Testing with Stripe (30 minutes)

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Webhook Reception

In a new terminal:
```bash
# Install Stripe CLI (if not installed)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe-subscription
```

Keep this running.

### 3. Trigger Test Events

In another terminal:
```bash
# Test subscription created
stripe trigger customer.subscription.created

# Test payment succeeded
stripe trigger invoice.payment_succeeded

# Test payment failed
stripe trigger invoice.payment_failed
```

**Verify:**
- [ ] Webhooks received in terminal
- [ ] Events processed without errors
- [ ] Check application logs

### 4. Test Complete Checkout Flow

1. Create a test user in your application
2. Navigate to pricing page
3. Click "Subscribe to Basic Monthly"
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout

**Verify:**
- [ ] Redirected to Stripe Checkout
- [ ] Payment succeeds
- [ ] Redirected back to app
- [ ] Subscription created in database
- [ ] User tier updated to BASIC
- [ ] Notification sent

### 5. Test Subscription Management

**Test Upgrade:**
1. Navigate to subscription settings
2. Upgrade to PRO
3. Verify proration calculated
4. Complete upgrade

**Verify:**
- [ ] Tier changed to PRO
- [ ] Proration charged correctly
- [ ] Notification sent

**Test Cancellation:**
1. Cancel subscription
2. Choose "Cancel at period end"

**Verify:**
- [ ] Subscription marked for cancellation
- [ ] Still active until period end
- [ ] Notification sent

**Test Reactivation:**
1. Reactivate before period end

**Verify:**
- [ ] Cancellation removed
- [ ] Subscription active

**Test Customer Portal:**
1. Click "Manage Billing"
2. Redirected to Stripe Customer Portal
3. View billing history

**Verify:**
- [ ] Portal loads correctly
- [ ] Can view invoices
- [ ] Can update payment method

## Production Deployment (1 hour)

### 1. Switch to Live Mode in Stripe

Repeat all Stripe setup steps in **LIVE mode**:
- [ ] Create 3 products (LIVE)
- [ ] Create 6 prices (LIVE)
- [ ] Configure webhook (LIVE URL)
- [ ] Get live signing secret

### 2. Update Production Environment

```env
# Production .env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (LIVE webhook secret)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Update Database with Live Price IDs

Connect to production database and update SubscriptionPlan table with LIVE price IDs.

### 4. Deploy Application

```bash
# Build
npm run build

# Deploy to your platform
# (Vercel, Railway, etc.)
```

### 5. Verify Production

**Smoke Tests:**
- [ ] Visit pricing page
- [ ] Subscribe with real card (small amount)
- [ ] Verify subscription created
- [ ] Test customer portal
- [ ] Cancel subscription
- [ ] Verify webhook reception

## Post-Deployment Monitoring (Ongoing)

### 1. Set Up Alerts

Monitor these metrics:
- Webhook success rate (target: >99%)
- Payment success rate (target: >95%)
- API error rate (target: <1%)
- Subscription churn rate

### 2. Daily Checks (First Week)

- [ ] Check Stripe Dashboard for subscriptions
- [ ] Review webhook logs
- [ ] Check application error logs
- [ ] Monitor user feedback

### 3. Weekly Reviews

- [ ] Analyze subscription metrics
- [ ] Review failed payments
- [ ] Check customer support tickets
- [ ] Plan improvements

## Troubleshooting Resources

If issues arise:

1. **Check Documentation:**
   - `/docs/SUBSCRIPTION_SYSTEM.md`
   - `/docs/SUBSCRIPTION_DEPLOYMENT.md`
   - `/docs/SUBSCRIPTION_QUICK_REFERENCE.md`

2. **Check Logs:**
   - Application logs
   - Stripe Dashboard → Events
   - Stripe Dashboard → Webhooks

3. **Run Tests:**
   ```bash
   npm run test:integration
   ```

4. **Common Issues:**
   - Webhook not received → Check URL and signing secret
   - Payment fails → Check Stripe keys
   - Tier not updating → Check webhook processing logs

## Success Criteria

Phase 2 is successfully deployed when:
- [x] Code implemented and tested
- [ ] Stripe configured (TEST mode)
- [ ] Local testing complete
- [ ] Stripe configured (LIVE mode)
- [ ] Production deployed
- [ ] Production testing complete
- [ ] Monitoring active
- [ ] Team trained

## Next Phase: Phase 3

After Phase 2 is deployed and stable, proceed to Phase 3:
- Feature TBD
- Prerequisites: Phase 2 stable for 1 week

## Team Contacts

- **Backend Lead**: [Name]
- **Stripe Admin**: [Name]
- **DevOps**: [Name]
- **Product Manager**: [Name]

## Estimated Timeline

- Stripe Setup: 30 minutes
- Local Testing: 30 minutes
- Production Setup: 30 minutes
- Deployment: 30 minutes
- Verification: 30 minutes
- **Total: 2.5 hours**

## Final Checklist

Before marking Phase 2 complete:

**Technical:**
- [ ] All code merged to main
- [ ] Database migrated
- [ ] Tests passing (>82% coverage)
- [ ] Stripe configured (LIVE)
- [ ] Webhooks active
- [ ] Monitoring enabled

**Business:**
- [ ] Pricing confirmed
- [ ] Legal terms updated
- [ ] Customer support trained
- [ ] Marketing materials ready

**Documentation:**
- [ ] Team documentation reviewed
- [ ] API docs published
- [ ] User guide created
- [ ] Support FAQs prepared

## Sign-Off

- [ ] Development: _______________ Date: _______
- [ ] QA: _______________ Date: _______
- [ ] Product: _______________ Date: _______
- [ ] DevOps: _______________ Date: _______

---

**Phase 2 Status**: 🟢 Implementation Complete, Ready for Deployment

**Next Action**: Begin Stripe Setup (30 minutes)

**Questions?** See `/docs/SUBSCRIPTION_SYSTEM.md` or contact the team.

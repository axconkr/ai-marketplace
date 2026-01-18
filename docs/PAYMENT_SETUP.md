# Payment System Setup Guide

Step-by-step guide to set up the payment system from scratch.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Stripe account (test mode)
- TossPayments account (test mode)
- AI Marketplace project cloned

## Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- `stripe@^14.10.0`
- `date-fns@^3.0.0`
- `@stripe/react-stripe-js@^5.4.1`
- `@stripe/stripe-js@^8.6.0`
- `@tosspayments/payment-sdk@^1.9.2`

## Step 2: Configure Environment Variables

### 2.1 Create .env file

```bash
cp .env.example .env
```

### 2.2 Get Stripe Credentials

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Secret key** (starts with `sk_test_`)
3. Copy **Publishable key** (starts with `pk_test_`)
4. Add to `.env`:

```env
STRIPE_SECRET_KEY="sk_test_51..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."
```

### 2.3 Get TossPayments Credentials

1. Go to https://developers.tosspayments.com/
2. Register and get test credentials
3. Copy **Client Key** (starts with `test_ck_`)
4. Copy **Secret Key** (starts with `test_sk_`)
5. Add to `.env`:

```env
TOSS_SECRET_KEY="test_sk_..."
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."
```

### 2.4 Configure Webhook Secrets (temporary)

For local development, use placeholder values:

```env
STRIPE_WEBHOOK_SECRET="whsec_placeholder"
TOSS_WEBHOOK_SECRET="toss_webhook_placeholder"
```

We'll update these after setting up webhooks.

### 2.5 Verify Other Settings

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_marketplace"

# JWT
JWT_SECRET="your-secret-key-here"

# Payment Configuration
PAYMENT_REFUND_WINDOW_DAYS="7"
PAYMENT_PLATFORM_FEE_NEW="0.20"
PAYMENT_PLATFORM_FEE_VERIFIED="0.15"
PAYMENT_PLATFORM_FEE_PRO="0.12"
PAYMENT_PLATFORM_FEE_MASTER="0.10"
```

## Step 3: Database Setup

### 3.1 Generate Prisma Client

```bash
npm run db:generate
```

### 3.2 Run Migrations

```bash
npm run db:migrate
```

This creates:
- Order table
- Payment table
- Refund table
- Settlement and SettlementItem tables
- Updates Product table (currency, download_count)
- Updates User table (settlement fields)

### 3.3 Verify Database

```bash
npm run db:studio
```

Open Prisma Studio and verify tables exist:
- Order
- Payment
- Refund
- Settlement
- SettlementItem

## Step 4: Local Webhook Setup

### 4.1 Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

### 4.2 Login to Stripe CLI

```bash
stripe login
```

This opens a browser to authenticate.

### 4.3 Forward Webhooks

In a new terminal:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret (starts with `whsec_`) and update `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Keep this terminal running during development.

## Step 5: Start Development Server

```bash
npm run dev
```

Server should start on http://localhost:3000

## Step 6: Test Payment Flow

### 6.1 Create Test User

Use the auth system to create a test buyer account:

```bash
POST http://localhost:3000/api/auth/register
{
  "email": "buyer@test.com",
  "password": "password123",
  "name": "Test Buyer"
}
```

Save the JWT token from response.

### 6.2 Create Test Product

Create a seller account and product:

```bash
POST http://localhost:3000/api/auth/register
{
  "email": "seller@test.com",
  "password": "password123",
  "name": "Test Seller"
}

POST http://localhost:3000/api/products
Authorization: Bearer {seller_token}
{
  "name": "Test AI Model",
  "description": "A test product",
  "price": 99.00,
  "currency": "USD",
  "status": "active"
}
```

Save the product ID.

### 6.3 Test Payment Creation

```bash
POST http://localhost:3000/api/payments/create
Authorization: Bearer {buyer_token}
{
  "productId": "{product_id}"
}
```

Response should include:
- orderId
- paymentIntent with clientSecret

### 6.4 Test Payment Confirmation (Manual)

For testing without frontend:

```bash
POST http://localhost:3000/api/payments/confirm
Authorization: Bearer {buyer_token}
{
  "orderId": "{order_id}",
  "paymentId": "{payment_intent_id}"
}
```

Or trigger webhook event:

```bash
stripe trigger payment_intent.succeeded
```

### 6.5 Verify Order

```bash
GET http://localhost:3000/api/payments/{order_id}
Authorization: Bearer {buyer_token}
```

Should show:
- status: PAID or COMPLETED
- access granted: true
- downloadUrl: present

## Step 7: Test Refund Flow

### 7.1 Request Refund

```bash
POST http://localhost:3000/api/payments/refund/{order_id}
Authorization: Bearer {buyer_token}
{
  "reason": "Testing refund flow"
}
```

### 7.2 Verify Refund

```bash
GET http://localhost:3000/api/payments/{order_id}
Authorization: Bearer {buyer_token}
```

Should show:
- status: REFUNDED
- refund details with SUCCEEDED status

## Step 8: Production Webhook Setup

### 8.1 Deploy Application

Deploy to production (Vercel, AWS, etc.)

### 8.2 Configure Stripe Production Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copy **Signing secret** to production `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 8.3 Configure TossPayments Webhooks

1. Go to TossPayments Dashboard
2. Navigate to Settings → Webhooks
3. Add endpoint: `https://yourdomain.com/api/webhooks/toss`
4. Save webhook secret to production `.env`

## Step 9: Switch to Production

### 9.1 Update Stripe Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy **live** keys (start with `sk_live_` and `pk_live_`)
3. Update production `.env`:

```env
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

### 9.2 Update TossPayments Keys

1. Get production keys from TossPayments
2. Update production `.env`:

```env
TOSS_SECRET_KEY="live_sk_..."
NEXT_PUBLIC_TOSS_CLIENT_KEY="live_ck_..."
```

## Step 10: Verify Production

### 10.1 Test Small Payment

1. Create a test product with low price ($1)
2. Complete a real payment
3. Verify order status updated
4. Test refund
5. Verify refund processed

### 10.2 Monitor Webhooks

- Check Stripe Dashboard → Developers → Webhooks
- Monitor webhook delivery status
- Check application logs for webhook processing

## Common Issues

### Database Connection Error

**Error**: `Can't reach database server`

**Solution**:
1. Verify PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Test connection: `psql $DATABASE_URL`

### Stripe CLI Not Forwarding

**Error**: Webhooks not received locally

**Solution**:
1. Check Stripe CLI is running
2. Verify port is correct (3000)
3. Check webhook secret in `.env`
4. Restart Stripe CLI

### Payment Intent Creation Fails

**Error**: `Invalid API key`

**Solution**:
1. Verify STRIPE_SECRET_KEY is correct
2. Check key starts with `sk_test_` or `sk_live_`
3. Ensure no quotes around key in `.env`

### Migration Fails

**Error**: `Migration failed to apply`

**Solution**:
1. Check database is accessible
2. Reset database: `npm run db:push --force-reset`
3. Run migrations again

### Webhook Signature Verification Fails

**Error**: `Webhook signature verification failed`

**Solution**:
1. Check STRIPE_WEBHOOK_SECRET matches dashboard
2. For local dev, use Stripe CLI secret
3. For production, use dashboard webhook secret
4. Verify endpoint URL is correct

## Verification Checklist

- [ ] Dependencies installed
- [ ] .env configured with API keys
- [ ] Database migrated successfully
- [ ] Stripe CLI webhook forwarding works
- [ ] Test payment creation succeeds
- [ ] Test payment confirmation succeeds
- [ ] Webhook processing works
- [ ] Order status updates correctly
- [ ] Download access granted
- [ ] Refund request succeeds
- [ ] Refund processed correctly
- [ ] Production webhooks configured
- [ ] Production keys configured
- [ ] Small test payment successful

## Next Steps

1. **Build Frontend Components**
   - Payment form with Stripe Elements
   - TossPayments widget integration
   - Order status display
   - Refund request UI

2. **Implement Notifications**
   - Email on successful payment
   - Email on refund
   - Admin notifications

3. **Add Admin Dashboard**
   - View all orders
   - Process manual refunds
   - View payment analytics

4. **Implement Settlement**
   - Seller payout calculation
   - Stripe Connect integration
   - Bank transfer for TossPayments

## Support Resources

- **Documentation**: See `docs/PAYMENT_SYSTEM.md`
- **Testing Guide**: See `docs/PAYMENT_TESTING.md`
- **Stripe Docs**: https://stripe.com/docs
- **TossPayments Docs**: https://docs.tosspayments.com
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Prisma**: https://www.prisma.io/docs

## Troubleshooting Support

If you encounter issues:

1. Check application logs: `npm run dev`
2. Check database: `npm run db:studio`
3. Check Stripe Dashboard → Events
4. Check webhook logs in dashboard
5. Review error messages carefully
6. Consult documentation in `docs/`

## Security Reminders

- [ ] Never commit `.env` to version control
- [ ] Use test keys in development
- [ ] Use production keys only in production
- [ ] Keep webhook secrets secure
- [ ] Enable HTTPS in production
- [ ] Verify webhook signatures
- [ ] Monitor for suspicious activity
- [ ] Regular security audits

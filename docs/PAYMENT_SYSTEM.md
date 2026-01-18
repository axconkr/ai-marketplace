# Payment System Documentation

Complete payment system implementation for AI Marketplace with Stripe (global) and TossPayments (Korea).

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Payment Flow](#payment-flow)
- [Refund Process](#refund-process)
- [Testing](#testing)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## Overview

### Features

- **Dual Payment Providers**: Stripe for global (USD, EUR), TossPayments for Korea (KRW)
- **One-Time Payments**: Product purchases with instant access
- **7-Day Refund Policy**: Automatic refund eligibility validation
- **Platform Fees**: Tiered seller fees (10-20% based on tier)
- **Secure Webhooks**: Real-time payment status updates
- **Access Management**: Automatic product access grant/revoke

### Tech Stack

- **Backend**: Next.js 14 App Router, Prisma ORM
- **Payments**: Stripe API v14, TossPayments v1
- **Database**: PostgreSQL
- **Authentication**: JWT

## Architecture

### Payment Provider Abstraction

```typescript
interface IPaymentProvider {
  createPaymentIntent(params): Promise<PaymentIntent>;
  confirmPayment(params): Promise<PaymentResult>;
  refundPayment(params): Promise<RefundResult>;
  getPayment(paymentId): Promise<PaymentDetails>;
  handleWebhook(request): Promise<WebhookEvent>;
}
```

### Data Models

#### Order
- Buyer, Product, Amount, Currency
- Platform Fee, Seller Amount
- Status: PENDING → PAID → COMPLETED
- Download Access (URL + Expiration)

#### Payment
- Provider (stripe/toss)
- Provider Payment ID
- Payment Method, Card Info
- Status: PENDING → SUCCEEDED

#### Refund
- Provider Refund ID
- Amount, Reason
- Status: PENDING → SUCCEEDED

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Stripe (for USD, EUR payments)
STRIPE_SECRET_KEY="sk_test_51..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# TossPayments (for KRW payments)
TOSS_SECRET_KEY="test_sk_..."
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."
TOSS_WEBHOOK_SECRET="your-webhook-secret"

# Payment Configuration
PAYMENT_REFUND_WINDOW_DAYS="7"
PAYMENT_PLATFORM_FEE_NEW="0.20"
PAYMENT_PLATFORM_FEE_VERIFIED="0.15"
PAYMENT_PLATFORM_FEE_PRO="0.12"
PAYMENT_PLATFORM_FEE_MASTER="0.10"
```

### 2. Database Migration

```bash
npm run db:migrate
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Webhook Setup

#### Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

#### TossPayments Webhooks

1. Go to TossPayments Dashboard → Settings → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/toss`
3. Copy webhook secret to `TOSS_WEBHOOK_SECRET`

## API Endpoints

### POST /api/payments/create

Create a payment intent for product purchase.

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "productId": "clx123...",
  "customerName": "John Doe" // optional
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "orderId": "clx456...",
    "paymentIntent": {
      "id": "pi_abc123",
      "clientSecret": "pi_abc123_secret_xyz",
      "amount": 9900,
      "currency": "USD"
    },
    "product": {
      "id": "clx123...",
      "name": "AI Model",
      "price": 99.00,
      "currency": "USD"
    }
  }
}
```

### POST /api/payments/confirm

Confirm payment after user completes payment on frontend.

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "orderId": "clx456...",
  "paymentId": "pi_abc123",
  "paymentMethodId": "pm_card_xyz", // Stripe only
  "amount": 9900 // TossPayments only
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "clx456...",
      "status": "PAID",
      "amount": 9900,
      "currency": "USD",
      "paidAt": "2025-12-28T12:00:00Z"
    },
    "payment": {
      "id": "pi_abc123",
      "status": "succeeded",
      "paymentMethod": {
        "type": "card",
        "last4": "4242",
        "brand": "visa"
      }
    },
    "downloadUrl": "/api/products/clx123/download?token=...",
    "downloadExpires": "2026-01-04T12:00:00Z"
  }
}
```

### GET /api/payments/[orderId]

Get payment details for an order.

**Authentication**: Required (JWT, must be buyer/seller/admin)

**Response**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "clx456...",
      "status": "COMPLETED",
      "amount": 9900,
      "currency": "USD",
      "platformFee": 1485,
      "sellerAmount": 8415,
      "paidAt": "2025-12-28T12:00:00Z"
    },
    "product": {
      "id": "clx123...",
      "name": "AI Model",
      "seller": {
        "id": "usr123...",
        "name": "Seller Name",
        "email": "seller@example.com"
      }
    },
    "payment": {
      "id": "pay_abc...",
      "provider": "stripe",
      "status": "SUCCEEDED",
      "paymentMethod": "card",
      "cardLast4": "4242"
    },
    "access": {
      "granted": true,
      "downloadUrl": "/api/products/clx123/download?token=...",
      "downloadExpires": "2026-01-04T12:00:00Z"
    },
    "refundInfo": {
      "eligible": true,
      "daysRemaining": 6
    }
  }
}
```

### POST /api/payments/refund/[orderId]

Request a refund for an order.

**Authentication**: Required (JWT, must be buyer)

**Request Body**:
```json
{
  "reason": "Product not as described" // optional
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "refund": {
      "id": "re_abc123",
      "status": "succeeded",
      "amount": 9900,
      "currency": "USD",
      "reason": "Product not as described"
    },
    "order": {
      "id": "clx456...",
      "status": "REFUNDED",
      "refundedAt": "2025-12-29T10:00:00Z"
    }
  }
}
```

## Payment Flow

### 1. Create Payment Intent (Backend)

```typescript
// Frontend calls API
const response = await fetch('/api/payments/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    productId: 'clx123...',
  }),
});

const { data } = await response.json();
// data.paymentIntent.clientSecret for frontend
```

### 2. Complete Payment (Frontend)

#### Stripe

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const { error } = await stripe.confirmPayment({
  elements,
  clientSecret: data.paymentIntent.clientSecret,
  confirmParams: {
    return_url: 'https://yourdomain.com/payment/success',
  },
});
```

#### TossPayments

```typescript
import { loadTossPayments } from '@tosspayments/payment-sdk';

const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);

await tossPayments.requestPayment('카드', {
  amount: data.paymentIntent.amount,
  orderId: data.orderId,
  orderName: data.product.name,
  successUrl: 'https://yourdomain.com/payment/success',
  failUrl: 'https://yourdomain.com/payment/fail',
});
```

### 3. Confirm Payment (Backend)

After successful frontend payment, confirm on backend:

```typescript
// For Stripe (automatic via webhook)
// For TossPayments (manual confirmation required)
const response = await fetch('/api/payments/confirm', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderId: orderId,
    paymentId: paymentKey, // from TossPayments
    amount: amount,
  }),
});
```

### 4. Webhook Processing (Automatic)

Stripe/TossPayments sends webhook → Backend processes → Order completed

## Refund Process

### Eligibility

- Buyer can request refund within **7 days** of purchase
- Order status must be PAID or COMPLETED
- Refund not already processed

### Request Refund

```typescript
const response = await fetch(`/api/payments/refund/${orderId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    reason: 'Product not as described',
  }),
});
```

### Refund Flow

1. **Validate**: Check eligibility (7-day window, buyer verification)
2. **Process**: Call payment provider refund API
3. **Update**: Order status → REFUNDED, Payment status → REFUNDED
4. **Revoke**: Remove product download access
5. **Notify**: Send email to buyer and seller

## Testing

### Stripe Test Cards

Use these test cards in Stripe test mode:

| Card Number | Type | Result |
|-------------|------|--------|
| 4242 4242 4242 4242 | Success | Payment succeeds |
| 4000 0000 0000 0002 | Decline | Card declined |
| 4000 0025 0000 3155 | 3D Secure | Requires authentication |
| 4000 0000 0000 9995 | Insufficient | Insufficient funds |

**CVV**: Any 3 digits
**Expiry**: Any future date
**ZIP**: Any valid ZIP code

### TossPayments Test Mode

1. Use `test_sk_...` and `test_ck_...` keys
2. Test payments in sandbox environment
3. No real money charged
4. Automatic test card selection in widget

### Test Webhook Locally

Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger charge.refunded
```

### Testing Checklist

- [ ] Create payment intent (Stripe and TossPayments)
- [ ] Complete payment successfully
- [ ] Verify order status updated to PAID
- [ ] Verify download access granted
- [ ] Test payment failure
- [ ] Test refund within 7 days
- [ ] Test refund rejection after 7 days
- [ ] Test webhook processing
- [ ] Test double payment prevention
- [ ] Test self-purchase prevention

## Security

### Best Practices

1. **API Keys**: Never commit real API keys to version control
2. **Webhook Verification**: Always verify webhook signatures
3. **HTTPS Only**: All payment endpoints must use HTTPS in production
4. **CSRF Protection**: Enabled by default in Next.js
5. **Rate Limiting**: Implement rate limiting on payment endpoints
6. **Idempotency**: Use idempotency keys for payment creation
7. **PCI Compliance**: Never store raw card data (handled by Stripe/Toss)

### Error Handling

All payment errors are logged and return appropriate HTTP status codes:

- `400`: Bad request (validation failed)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (not allowed to perform action)
- `404`: Not found (order/payment not found)
- `409`: Conflict (already purchased, already refunded)
- `500`: Server error (payment provider error)

## Troubleshooting

### Payment Creation Fails

**Issue**: Payment intent creation returns error

**Solutions**:
- Check API keys are correct
- Verify product exists and is active
- Check user is not purchasing their own product
- Verify no duplicate purchase exists

### Payment Not Confirming

**Issue**: Payment completed on frontend but backend not updated

**Solutions**:
- Check webhook endpoint is accessible (HTTPS)
- Verify webhook secret is correct
- Check webhook logs in Stripe/Toss dashboard
- Manually call `/api/payments/confirm` if webhook failed

### Refund Request Fails

**Issue**: Refund request returns error

**Solutions**:
- Check if within 7-day window
- Verify user is the buyer
- Check order status is PAID or COMPLETED
- Verify no previous refund exists

### Webhook Not Received

**Issue**: Payments succeed but webhooks not processed

**Solutions**:
- Verify webhook URL is correct and accessible
- Check webhook signature verification
- Enable webhook logging in payment provider dashboard
- Test with webhook testing tools (Stripe CLI)

### Database Connection Errors

**Issue**: Payment operations fail with database errors

**Solutions**:
- Check `DATABASE_URL` is correct
- Run migrations: `npm run db:migrate`
- Verify PostgreSQL is running
- Check database connection limits

## Platform Fee Calculation

Seller tier-based fees applied to each sale:

| Seller Tier | Platform Fee | Seller Receives |
|-------------|--------------|-----------------|
| New | 20% | 80% |
| Verified | 15% | 85% |
| Pro | 12% | 88% |
| Master | 10% | 90% |

Example for $99 product (9900 cents):
- New seller: Fee $19.80, Receives $79.20
- Master seller: Fee $9.90, Receives $89.10

## Support

For issues or questions:

1. Check documentation and troubleshooting guide
2. Review Stripe/TossPayments documentation
3. Check application logs for error details
4. Test with test cards in development mode
5. Contact support with order ID and error details

## References

- [Stripe API Documentation](https://stripe.com/docs/api)
- [TossPayments Documentation](https://docs.tosspayments.com/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Documentation](https://www.prisma.io/docs)

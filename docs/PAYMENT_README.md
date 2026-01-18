# Payment System Implementation

Complete payment integration for AI Marketplace with Stripe and TossPayments.

## What's Implemented

### Core Features
- ✅ Dual payment providers (Stripe for USD/EUR, TossPayments for KRW)
- ✅ Payment intent creation and confirmation
- ✅ Webhook processing for real-time updates
- ✅ 7-day refund policy with automatic validation
- ✅ Platform fee calculation (10-20% based on seller tier)
- ✅ Product access management (grant/revoke)
- ✅ Comprehensive error handling
- ✅ Security best practices (webhook verification, HTTPS, etc.)

### Database Models
- ✅ Order (buyer, product, amounts, status, access)
- ✅ Payment (provider details, payment method, status)
- ✅ Refund (amount, reason, status)
- ✅ Settlement (seller payouts, platform fees)

### API Endpoints
- ✅ `POST /api/payments/create` - Create payment intent
- ✅ `POST /api/payments/confirm` - Confirm payment
- ✅ `GET /api/payments/[orderId]` - Get payment details
- ✅ `POST /api/payments/refund/[orderId]` - Request refund
- ✅ `POST /api/webhooks/stripe` - Stripe webhook handler
- ✅ `POST /api/webhooks/toss` - TossPayments webhook handler

### Services
- ✅ Order Service (create, complete, access management)
- ✅ Refund Service (process, validate, eligibility)
- ✅ Payment Provider Abstraction Layer

## File Structure

```
AI_marketplace/
├── prisma/
│   └── schema.prisma                    # Updated with payment models
├── lib/
│   ├── db.ts                           # Prisma client singleton
│   ├── payment/
│   │   ├── types.ts                    # Payment type definitions
│   │   ├── index.ts                    # Provider factory
│   │   ├── stripe.ts                   # Stripe implementation
│   │   └── toss.ts                     # TossPayments implementation
│   └── services/
│       ├── order.ts                    # Order business logic
│       └── refund.ts                   # Refund business logic
├── app/
│   └── api/
│       ├── payments/
│       │   ├── create/route.ts         # Create payment
│       │   ├── confirm/route.ts        # Confirm payment
│       │   ├── [orderId]/route.ts      # Get payment details
│       │   └── refund/[orderId]/route.ts  # Request refund
│       └── webhooks/
│           ├── stripe/route.ts         # Stripe webhooks
│           └── toss/route.ts           # TossPayments webhooks
├── docs/
│   ├── PAYMENT_SYSTEM.md               # Complete documentation
│   ├── PAYMENT_TESTING.md              # Testing guide
│   └── PAYMENT_README.md               # This file
└── .env.example                        # Updated with payment variables
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

New dependencies added:
- `stripe@^14.10.0` - Stripe SDK
- `date-fns@^3.0.0` - Date utilities for refund window
- `@stripe/react-stripe-js@^5.4.1` - Stripe React components (frontend)
- `@stripe/stripe-js@^8.6.0` - Stripe.js loader (frontend)
- `@tosspayments/payment-sdk@^1.9.2` - TossPayments SDK (frontend)

### 2. Configure Environment

```bash
cp .env.example .env
```

Add your credentials:

```env
# Stripe (test mode)
STRIPE_SECRET_KEY="sk_test_51..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# TossPayments (test mode)
TOSS_SECRET_KEY="test_sk_..."
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."
TOSS_WEBHOOK_SECRET="your-webhook-secret"

# Configuration
PAYMENT_REFUND_WINDOW_DAYS="7"
PAYMENT_PLATFORM_FEE_NEW="0.20"
PAYMENT_PLATFORM_FEE_VERIFIED="0.15"
PAYMENT_PLATFORM_FEE_PRO="0.12"
PAYMENT_PLATFORM_FEE_MASTER="0.10"
```

### 3. Run Database Migrations

```bash
npm run db:migrate
```

This creates:
- Order table
- Payment table
- Refund table
- Settlement tables
- Updates Product and User tables

### 4. Setup Webhooks

#### Stripe
1. Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy secret to `STRIPE_WEBHOOK_SECRET`

#### TossPayments
1. Dashboard → Settings → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/toss`
3. Copy secret to `TOSS_WEBHOOK_SECRET`

### 5. Test Locally

```bash
# Start dev server
npm run dev

# In another terminal, forward Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Testing

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### Basic Test Flow

1. **Create a test product**
   ```bash
   POST /api/products
   {
     "name": "Test AI Model",
     "price": 99.00,
     "currency": "USD",
     "status": "active"
   }
   ```

2. **Create payment intent**
   ```bash
   POST /api/payments/create
   {
     "productId": "product_id_here"
   }
   ```

3. **Use clientSecret on frontend** with Stripe Elements

4. **Webhook processes payment** automatically

5. **Check order status**
   ```bash
   GET /api/payments/order_id_here
   ```

See `docs/PAYMENT_TESTING.md` for comprehensive testing guide.

## Architecture

### Payment Provider Abstraction

```typescript
interface IPaymentProvider {
  createPaymentIntent(): Promise<PaymentIntent>;
  confirmPayment(): Promise<PaymentResult>;
  refundPayment(): Promise<RefundResult>;
  getPayment(): Promise<PaymentDetails>;
  handleWebhook(): Promise<WebhookEvent>;
}
```

Benefits:
- Easy to swap providers
- Consistent interface across providers
- Provider-specific logic isolated
- Simple to add new providers

### Payment Flow

```
1. User clicks "Purchase"
2. Backend creates Order (PENDING)
3. Backend creates PaymentIntent with provider
4. Backend returns clientSecret to frontend
5. Frontend completes payment with provider widget
6. Provider sends webhook to backend
7. Backend verifies webhook signature
8. Backend updates Order to PAID
9. Backend grants product access
10. User can download product
```

### Refund Flow

```
1. User requests refund
2. Backend validates eligibility (7-day window, buyer verification)
3. Backend calls provider refund API
4. Backend updates Order to REFUNDED
5. Backend revokes product access
6. Provider sends webhook confirmation
7. Backend updates Refund status to SUCCEEDED
```

## Security Features

- ✅ Webhook signature verification
- ✅ JWT authentication on all endpoints
- ✅ Owner verification (buyer/seller check)
- ✅ HTTPS enforcement (production)
- ✅ Idempotency support
- ✅ Rate limiting ready
- ✅ No card data storage (PCI compliant)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (Next.js built-in)

## Platform Fees

Automatically calculated based on seller tier:

| Tier | Fee | Seller Gets |
|------|-----|-------------|
| New | 20% | 80% |
| Verified | 15% | 85% |
| Pro | 12% | 88% |
| Master | 10% | 90% |

Example: $99 product, New seller
- Platform fee: $19.80 (9900 cents × 0.20)
- Seller receives: $79.20 (9900 - 1980 cents)

## Next Steps

### For Development

1. ✅ Implement payment system (DONE)
2. 🔲 Build frontend payment components
3. 🔲 Implement email notifications
4. 🔲 Add admin dashboard for payment management
5. 🔲 Implement seller payout system (Settlement)

### For Production

1. 🔲 Switch to production API keys
2. 🔲 Configure production webhooks
3. 🔲 Enable rate limiting
4. 🔲 Add monitoring and alerting
5. 🔲 Test with small real payment
6. 🔲 Review security checklist
7. 🔲 Set up error tracking (Sentry)

### Future Enhancements

1. 🔲 Subscription payments (Phase 2)
2. 🔲 Multiple payment methods (Apple Pay, Google Pay)
3. 🔲 Partial refunds
4. 🔲 Dispute management
5. 🔲 Analytics and reporting
6. 🔲 Multi-currency support expansion

## Documentation

- **Complete Guide**: `docs/PAYMENT_SYSTEM.md`
- **Testing Guide**: `docs/PAYMENT_TESTING.md`
- **API Reference**: See complete guide
- **Stripe Docs**: https://stripe.com/docs
- **TossPayments Docs**: https://docs.tosspayments.com

## Troubleshooting

### Common Issues

**Payment creation fails**
- Check API keys
- Verify product is active
- Check user can't buy own product

**Webhook not received**
- Verify URL is accessible (HTTPS)
- Check webhook secret
- Test with Stripe CLI locally

**Refund fails**
- Check 7-day window
- Verify user is buyer
- Check order status is PAID

See `docs/PAYMENT_SYSTEM.md` for detailed troubleshooting.

## Support

For implementation questions or issues:

1. Check documentation in `docs/`
2. Review test cases in testing guide
3. Check Stripe/TossPayments official docs
4. Review application logs for errors

## Production Checklist

Before deploying to production:

- [ ] Switch to production API keys
- [ ] Update webhook endpoints to production URL
- [ ] Test webhook verification in production
- [ ] Enable HTTPS on all endpoints
- [ ] Review security settings
- [ ] Test with small real payment
- [ ] Set up monitoring and alerts
- [ ] Configure error tracking
- [ ] Review rate limiting
- [ ] Test all payment flows
- [ ] Test refund process
- [ ] Backup database
- [ ] Document deployment process

## License

Proprietary - AI Marketplace Payment System

## Credits

Built with:
- Stripe API v14
- TossPayments v1
- Next.js 14
- Prisma ORM
- PostgreSQL

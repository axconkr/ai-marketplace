# Payment System Testing Guide

Quick reference for testing the payment system.

## Quick Start

### 1. Setup Environment

```bash
# Copy and configure environment variables
cp .env.example .env

# Add your test credentials
# Stripe: https://dashboard.stripe.com/test/apikeys
# TossPayments: https://developers.tosspayments.com/
```

### 2. Run Database Migrations

```bash
npm run db:migrate
```

### 3. Start Development Server

```bash
npm run dev
```

## Stripe Testing

### Test Cards

#### Successful Payments

```
Card Number: 4242 4242 4242 4242
CVV: Any 3 digits (e.g., 123)
Expiry: Any future date (e.g., 12/25)
ZIP: Any valid ZIP (e.g., 12345)
```

#### Declined Payments

```
Card Number: 4000 0000 0000 0002
Result: Card declined
```

#### Insufficient Funds

```
Card Number: 4000 0000 0000 9995
Result: Insufficient funds
```

#### 3D Secure Authentication

```
Card Number: 4000 0025 0000 3155
Result: Requires 3D Secure authentication
```

### Test Workflow

1. **Create Product** (as seller)
   ```bash
   POST /api/products
   {
     "name": "Test AI Model",
     "price": 99.00,
     "currency": "USD",
     "status": "active"
   }
   ```

2. **Create Payment Intent** (as buyer)
   ```bash
   POST /api/payments/create
   {
     "productId": "clx123..."
   }
   ```

3. **Complete Payment** (frontend)
   - Use Stripe Elements with test card
   - Or use clientSecret with Stripe API

4. **Verify Payment** (webhook automatic or manual confirm)
   ```bash
   POST /api/payments/confirm
   {
     "orderId": "order_123",
     "paymentId": "pi_abc123"
   }
   ```

5. **Check Order Status**
   ```bash
   GET /api/payments/order_123
   ```

## TossPayments Testing

### Test Mode

TossPayments automatically provides test cards in sandbox mode when using test credentials (`test_sk_...` and `test_ck_...`).

### Test Workflow

1. **Create Product** (with KRW currency)
   ```bash
   POST /api/products
   {
     "name": "Test AI Model",
     "price": 99000,
     "currency": "KRW",
     "status": "active"
   }
   ```

2. **Create Payment Intent**
   ```bash
   POST /api/payments/create
   {
     "productId": "clx123..."
   }
   ```

3. **Complete Payment** (frontend with TossPayments widget)
   - Use test card provided by TossPayments
   - Automatic test mode in sandbox

4. **Confirm Payment** (required for TossPayments)
   ```bash
   POST /api/payments/confirm
   {
     "orderId": "order_123",
     "paymentId": "toss_payment_key",
     "amount": 99000
   }
   ```

## Refund Testing

### Test Successful Refund

1. **Complete a payment** (follow payment workflow)

2. **Request refund within 7 days**
   ```bash
   POST /api/payments/refund/order_123
   {
     "reason": "Testing refund"
   }
   ```

3. **Verify refund**
   ```bash
   GET /api/payments/order_123
   # Should show status: REFUNDED
   ```

### Test Refund Rejection

1. **Modify order paid_at date** (in database to 8+ days ago)
   ```sql
   UPDATE "Order"
   SET paid_at = NOW() - INTERVAL '8 days'
   WHERE id = 'order_123';
   ```

2. **Request refund**
   ```bash
   POST /api/payments/refund/order_123
   # Should return error: Refund window expired
   ```

## Webhook Testing

### Local Webhook Testing with Stripe CLI

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Trigger test events**
   ```bash
   # Successful payment
   stripe trigger payment_intent.succeeded

   # Failed payment
   stripe trigger payment_intent.payment_failed

   # Refund
   stripe trigger charge.refunded
   ```

### Manual Webhook Testing

Use tools like Postman or curl to send webhook requests:

```bash
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=..." \
  -d '{"type": "payment_intent.succeeded", ...}'
```

## Testing Scenarios

### Scenario 1: Successful Purchase

```
1. User logs in
2. User views product
3. User clicks "Purchase"
4. Payment intent created
5. User enters test card: 4242 4242 4242 4242
6. Payment succeeds
7. Webhook received and processed
8. Order status updated to PAID
9. Download access granted
10. User can download product
```

### Scenario 2: Failed Payment

```
1. User logs in
2. User views product
3. User clicks "Purchase"
4. Payment intent created
5. User enters declined card: 4000 0000 0000 0002
6. Payment fails
7. Error shown to user
8. Order status remains PENDING
9. User can retry payment
```

### Scenario 3: Successful Refund

```
1. User purchases product (Scenario 1)
2. User requests refund within 7 days
3. Refund processed with payment provider
4. Order status updated to REFUNDED
5. Download access revoked
6. User notified of refund
```

### Scenario 4: Prevent Double Purchase

```
1. User purchases product (Scenario 1)
2. User tries to purchase same product again
3. API returns error: "Product already purchased"
4. No duplicate order created
```

### Scenario 5: Prevent Self-Purchase

```
1. Seller lists product
2. Same seller tries to purchase their own product
3. API returns error: "Cannot purchase your own product"
4. No order created
```

## API Testing with Postman/Insomnia

### Environment Variables

```
BASE_URL=http://localhost:3000
AUTH_TOKEN=your_jwt_token_here
```

### Collection

#### 1. Login
```
POST {{BASE_URL}}/api/auth/login
{
  "email": "buyer@example.com",
  "password": "password123"
}
```

#### 2. Create Payment
```
POST {{BASE_URL}}/api/payments/create
Authorization: Bearer {{AUTH_TOKEN}}
{
  "productId": "clx123..."
}
```

#### 3. Get Payment Details
```
GET {{BASE_URL}}/api/payments/order_123
Authorization: Bearer {{AUTH_TOKEN}}
```

#### 4. Request Refund
```
POST {{BASE_URL}}/api/payments/refund/order_123
Authorization: Bearer {{AUTH_TOKEN}}
{
  "reason": "Testing refund"
}
```

## Common Test Data

### Users

```sql
-- Buyer
INSERT INTO "User" (id, email, password, name, role)
VALUES ('buyer_1', 'buyer@example.com', 'hashed_password', 'Test Buyer', 'user');

-- Seller
INSERT INTO "User" (id, email, password, name, role, platform_fee_rate)
VALUES ('seller_1', 'seller@example.com', 'hashed_password', 'Test Seller', 'user', 0.15);
```

### Products

```sql
-- USD Product
INSERT INTO "Product" (id, name, description, price, currency, seller_id, status)
VALUES ('prod_usd', 'AI Model USD', 'Test product in USD', 99.00, 'USD', 'seller_1', 'active');

-- KRW Product
INSERT INTO "Product" (id, name, description, price, currency, seller_id, status)
VALUES ('prod_krw', 'AI Model KRW', 'Test product in KRW', 99000, 'KRW', 'seller_1', 'active');
```

## Debugging Tips

### Check Logs

```bash
# Application logs
npm run dev

# Database logs (if enabled)
# Check DATABASE_URL connection

# Stripe webhook logs
stripe listen --print-secret
```

### Common Issues

#### Payment Intent Creation Fails
- Check API keys are correct
- Verify product exists and is active
- Check user authentication token

#### Webhook Not Received
- Verify webhook URL is accessible
- Check HTTPS in production
- Test with Stripe CLI locally
- Verify webhook secret is correct

#### Refund Fails
- Check if within 7-day window
- Verify user is the buyer
- Check order status is PAID
- Verify payment provider credentials

### Database Queries

```sql
-- Check order status
SELECT * FROM "Order" WHERE id = 'order_123';

-- Check payment status
SELECT * FROM "Payment" WHERE order_id = 'order_123';

-- Check refund status
SELECT * FROM "Refund" WHERE order_id = 'order_123';

-- Reset order for testing
UPDATE "Order" SET status = 'PENDING', paid_at = NULL WHERE id = 'order_123';
DELETE FROM "Payment" WHERE order_id = 'order_123';
DELETE FROM "Refund" WHERE order_id = 'order_123';
```

## Production Testing Checklist

Before going live:

- [ ] Test all payment flows with test cards
- [ ] Test webhook processing
- [ ] Test refund within 7-day window
- [ ] Test refund rejection after 7 days
- [ ] Test error handling (declined cards, insufficient funds)
- [ ] Test double purchase prevention
- [ ] Test self-purchase prevention
- [ ] Verify HTTPS on all payment endpoints
- [ ] Verify webhook signature verification
- [ ] Test rate limiting
- [ ] Review security best practices
- [ ] Switch to production API keys
- [ ] Configure production webhooks
- [ ] Test small real payment (refundable)

## Support Resources

- **Stripe Testing**: https://stripe.com/docs/testing
- **TossPayments Sandbox**: https://docs.tosspayments.com/guides/sandbox
- **API Documentation**: See `/docs/PAYMENT_SYSTEM.md`
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Webhook Testing**: https://stripe.com/docs/webhooks/test

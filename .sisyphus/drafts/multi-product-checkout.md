# Draft: Multi-Product Checkout Implementation

## Requirements (confirmed)
- User clicks "결제하기" on cart page with multiple items
- System creates orders for all cart items
- Single payment covers total amount
- On success, all orders marked PAID
- Cart is cleared after successful payment

## Technical Approach (proposed)
- Add `checkout_session_id` to Order model (simpler than OrderItem model)
- Create `/api/cart/checkout` endpoint for multi-product checkout
- Create Order per product, link with same `checkout_session_id`
- Single Payment with total amount
- Update cart page and success page

## Tech Stack
- Next.js 14 App Router, TypeScript, Prisma, PostgreSQL
- Stripe (USD) + TossPayments (KRW)
- localStorage cart (client-side only)

## Open Questions
- Payment linking strategy (first order vs. separate join table)
- Order status update mechanism on webhook
- Error handling for partial failures
- Currency handling for mixed-currency carts

## Research Findings

### Current Schema Analysis:
- **Order**: 1:1 with Product (via `product_id`), 1:1 with Payment (via `Payment.order_id`)
- **Payment**: `order_id` is UNIQUE, so one Payment → one Order currently
- **No checkout session concept** exists currently

### Current Order Flow:
1. `/api/payments/create` takes single `productId`
2. `createOrder()` creates 1 Order + 1 Payment record
3. Payment provider (Stripe/Toss) creates PaymentIntent
4. Webhook calls `completeOrder()` which:
   - Updates Order status to PAID
   - Updates Payment status to SUCCEEDED
   - Grants product access
   - Increments download_count

### Key Constraint:
- **Payment.order_id is UNIQUE** - this means one Payment can only link to one Order
- For multi-product, we need to either:
  - A) Create multiple Payments (one per order) - complex, multiple charges
  - B) Change Payment schema to allow linking to multiple orders
  - C) Add `checkout_session_id` to both Order and Payment, use it in webhook to update all related orders

### Cart Context:
- `useCart()` provides `items[]`, `clearCart()`, `total`, `count`
- Cart items have: id, title, price, currency, verification_level, seller info
- localStorage key: `ai_marketplace_cart`

### Success Page:
- Currently shows single order details
- Uses `useOrder(orderId)` hook to fetch order
- Downloads files, receipt for single order
- Needs update to handle multiple orders (checkout session)

## Scope Boundaries
- INCLUDE: Multi-product checkout flow, schema update, API endpoint, UI updates, webhook updates, success page
- EXCLUDE: Cart sync to database, inventory management, partial refunds, mixed-currency cart support (same currency only)

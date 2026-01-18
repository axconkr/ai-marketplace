# Payment UI Installation & Setup Guide

Complete guide to set up the payment UI components for AI Marketplace.

## 📦 Dependencies Installed

All required dependencies have been installed:

```json
{
  "@stripe/stripe-js": "^8.6.0",
  "@stripe/react-stripe-js": "^5.4.1",
  "@tosspayments/payment-sdk": "^1.9.2",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-checkbox": "^1.3.3",
  "date-fns": "^3.6.0"
}
```

## 🔑 Environment Variables

Add the following to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# TossPayments Configuration (for Korean payments)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_marketplace

# JWT
JWT_SECRET=your-secret-key-here

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 📁 File Structure

```
app/(marketplace)/
  checkout/
    [productId]/page.tsx          # Main checkout page
    success/[orderId]/page.tsx    # Payment success page
    fail/[orderId]/page.tsx       # Payment failure page
  orders/
    page.tsx                      # Orders list page

components/
  payment/
    StripeCheckoutForm.tsx        # Stripe payment form
    TossCheckoutForm.tsx          # TossPayments form
    PaymentMethodSelector.tsx     # Payment method selector
    PriceBreakdown.tsx           # Price summary component
  orders/
    OrderCard.tsx                # Order list item
    OrderDetailsModal.tsx        # Order details dialog
    RefundRequestModal.tsx       # Refund request dialog
  ui/
    dialog.tsx                   # Dialog component (Radix UI)
    checkbox.tsx                 # Checkbox component (Radix UI)

hooks/
  use-payment.ts                 # Payment hooks
  use-orders.ts                  # Orders hooks

lib/api/
  payment.ts                     # Payment API client
  orders.ts                      # Orders API client
```

## 🚀 Quick Start

### 1. Verify Installation

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

### 3. Run Database Migrations

The payment models are already in `prisma/schema.prisma`. Run migrations:

```bash
npm run db:push
# or
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

## 🔧 Component Usage

### Checkout Page

Navigate to `/checkout/[productId]` to see the checkout flow:

```typescript
// Example: Link to checkout
<Link href={`/checkout/${product.id}`}>
  <Button>Buy Now</Button>
</Link>
```

### Stripe Payment Form

```typescript
import { StripeCheckoutForm } from '@/components/payment/StripeCheckoutForm';

<StripeCheckoutForm
  clientSecret={paymentData.clientSecret}
  orderId={paymentData.orderId}
  amount={paymentData.amount}
  currency={paymentData.currency}
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

### TossPayments Form

```typescript
import { TossCheckoutForm } from '@/components/payment/TossCheckoutForm';

<TossCheckoutForm
  amount={paymentData.amount}
  orderId={paymentData.orderId}
  orderName={product.name}
  currency={paymentData.currency}
  onError={handleError}
/>
```

### Payment Method Selector

```typescript
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';

<PaymentMethodSelector
  currency="USD"
  selectedProvider="stripe"
  onSelect={(provider) => console.log(provider)}
/>
```

### Price Breakdown

```typescript
import { PriceBreakdown } from '@/components/payment/PriceBreakdown';

<PriceBreakdown
  productPrice={9900}
  platformFee={0}
  currency="USD"
  showFeeDetails={false}
/>
```

## 🔗 API Endpoints Required

The frontend expects these backend API endpoints (to be implemented):

### Payment Endpoints

```
POST   /api/payments/create           # Create payment intent
POST   /api/payments/confirm          # Confirm payment
POST   /api/payments/refund/:orderId  # Request refund
GET    /api/payments/:orderId         # Get payment status
```

### Order Endpoints

```
GET    /api/orders                    # List orders (paginated)
GET    /api/orders/:orderId           # Get order details
GET    /api/orders/:orderId/download  # Get download URL
GET    /api/orders/:orderId/receipt   # Download receipt PDF
GET    /api/orders/:orderId/refund-eligibility  # Check refund eligibility
```

### Product Endpoints

```
GET    /api/products/:productId       # Get product details
```

## 📊 Data Flow

### Checkout Flow

1. User navigates to `/checkout/[productId]`
2. Product details loaded
3. User enters buyer information
4. Click "Continue to Payment"
5. `POST /api/payments/create` → Returns order ID + payment credentials
6. Show payment form (Stripe or Toss based on currency)
7. User submits payment
8. On success → Redirect to `/checkout/success/[orderId]`
9. On failure → Redirect to `/checkout/fail/[orderId]`

### Order Management Flow

1. User navigates to `/orders`
2. `GET /api/orders` → Returns paginated orders
3. User can:
   - View details (modal)
   - Download files
   - Request refund (if eligible)

### Refund Flow

1. Click "Request Refund" button
2. Refund modal opens
3. User selects reason and adds comments
4. `POST /api/payments/refund/:orderId`
5. Order status updates to "refund_requested"

## 🎨 Customization

### Styling

All components use Tailwind CSS classes. Customize in `tailwind.config.ts`:

```typescript
// Example: Change primary color
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#000000',
        foreground: '#ffffff',
      },
    },
  },
}
```

### Currency Formatting

Currency formatting is handled automatically:

- **KRW**: `₩10,000`
- **USD/EUR/others**: `$99.00`

Modify format in each component's `formatCurrency()` function if needed.

### Payment Provider Selection

Auto-selection logic in `PaymentMethodSelector`:

```typescript
// KRW → TossPayments
// Others → Stripe

const provider = currency === 'KRW' ? 'toss' : 'stripe';
```

## 🔐 Security Features

- ✅ PCI DSS compliant (Stripe/Toss handle card data)
- ✅ SSL encrypted connections
- ✅ No card data stored on your servers
- ✅ JWT authentication for API calls
- ✅ 3D Secure support (Stripe)
- ✅ Client-side validation
- ✅ Server-side verification (backend required)

## 📱 Mobile Responsiveness

All components are mobile-responsive:

- Single-column layout on mobile
- Touch-friendly buttons (min 44px)
- Optimized form inputs
- Sticky payment button
- Mobile keyboard support

## ♿ Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- Semantic HTML

## 🧪 Testing Checklist

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

### TossPayments Test

Use TossPayments test mode credentials.

### Test Scenarios

- [ ] Complete purchase with Stripe
- [ ] Complete purchase with TossPayments
- [ ] Payment failure handling
- [ ] 3D Secure authentication
- [ ] Download files after purchase
- [ ] Request refund
- [ ] View order history
- [ ] Download receipt
- [ ] Mobile checkout flow
- [ ] Error states
- [ ] Loading states

## 🐛 Troubleshooting

### "Stripe is not defined"

Ensure environment variable is set:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### "TossPayments not configured"

Add TossPayments client key:
```bash
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
```

### Payment not completing

1. Check browser console for errors
2. Verify webhook configuration
3. Check backend API endpoints
4. Verify JWT authentication

### Download not working

Ensure:
- Order status is PAID or COMPLETED
- `access_granted` is true
- Download URL not expired

## 📚 Resources

### Stripe Documentation
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Webhooks](https://stripe.com/docs/webhooks)

### TossPayments Documentation
- [TossPayments Guide](https://docs.tosspayments.com/)
- [SDK Reference](https://docs.tosspayments.com/reference/js-sdk)

### Next.js
- [App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

## 🎯 Next Steps

1. **Implement Backend APIs** (see backend implementation guide)
2. **Set up Stripe/Toss webhooks**
3. **Configure email notifications**
4. **Add analytics tracking**
5. **Implement download security**
6. **Set up monitoring/alerts**
7. **Add receipt generation**
8. **Configure refund policies**

## 🤝 Support

For issues or questions:
- Check this documentation
- Review component comments
- Check browser console
- Verify API responses
- Test with different scenarios

## 📝 Notes

- All monetary amounts in smallest currency unit (cents for USD, won for KRW)
- Payment provider auto-selected based on currency
- 7-day refund policy enforced in UI
- Download links expire after 7 days (configurable)
- Receipt generation requires backend implementation
- Email notifications require backend setup

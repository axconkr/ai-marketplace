# Payment UI Files Reference

## 📁 Complete File Structure

```
AI_marketplace/
│
├── app/(marketplace)/
│   ├── checkout/
│   │   ├── [productId]/
│   │   │   └── page.tsx                    # Main checkout page
│   │   ├── success/
│   │   │   └── [orderId]/
│   │   │       └── page.tsx                # Payment success page
│   │   └── fail/
│   │       └── [orderId]/
│   │           └── page.tsx                # Payment failure page
│   └── orders/
│       └── page.tsx                        # Orders list page
│
├── components/
│   ├── payment/
│   │   ├── StripeCheckoutForm.tsx          # Stripe payment form
│   │   ├── TossCheckoutForm.tsx            # TossPayments form
│   │   ├── PaymentMethodSelector.tsx       # Payment provider selector
│   │   └── PriceBreakdown.tsx             # Price summary component
│   │
│   ├── orders/
│   │   ├── OrderCard.tsx                   # Order list item
│   │   ├── OrderDetailsModal.tsx           # Order details dialog
│   │   └── RefundRequestModal.tsx          # Refund request dialog
│   │
│   └── ui/
│       ├── dialog.tsx                      # Dialog/Modal component (NEW)
│       ├── checkbox.tsx                    # Checkbox component (NEW)
│       └── select.tsx                      # Select dropdown (UPDATED)
│
├── hooks/
│   ├── use-payment.ts                      # Payment-related hooks
│   └── use-orders.ts                       # Order-related hooks
│
├── lib/api/
│   ├── payment.ts                          # Payment API client
│   └── orders.ts                           # Orders API client
│
├── PAYMENT_UI_INSTALLATION.md              # Installation guide
├── PAYMENT_UI_SUMMARY.md                   # Implementation summary
└── PAYMENT_UI_FILES.md                     # This file
```

## 📊 File Count Summary

- **Pages**: 4 files
- **Payment Components**: 4 files
- **Order Components**: 3 files
- **UI Components**: 3 files (new/updated)
- **Hooks**: 2 files
- **API Clients**: 2 files
- **Documentation**: 3 files

**Total**: 21 files created/updated

## 🎯 File Purposes

### Pages (4 files)

| File | Purpose | Route |
|------|---------|-------|
| `checkout/[productId]/page.tsx` | Main checkout flow | `/checkout/{productId}` |
| `success/[orderId]/page.tsx` | Payment success | `/checkout/success/{orderId}` |
| `fail/[orderId]/page.tsx` | Payment failure | `/checkout/fail/{orderId}` |
| `orders/page.tsx` | Orders list | `/orders` |

### Payment Components (4 files)

| File | Purpose | Key Features |
|------|---------|--------------|
| `StripeCheckoutForm.tsx` | Stripe Elements integration | 3D Secure, real-time validation |
| `TossCheckoutForm.tsx` | TossPayments SDK integration | Korean payment methods |
| `PaymentMethodSelector.tsx` | Provider selection UI | Auto-select by currency |
| `PriceBreakdown.tsx` | Price summary display | Multi-currency, fee breakdown |

### Order Components (3 files)

| File | Purpose | Key Features |
|------|---------|--------------|
| `OrderCard.tsx` | Order list item | Status badges, actions |
| `OrderDetailsModal.tsx` | Order details dialog | Full order info, files |
| `RefundRequestModal.tsx` | Refund request form | Reason selection, validation |

### UI Components (3 files)

| File | Status | Purpose |
|------|--------|---------|
| `dialog.tsx` | NEW | Radix UI dialog/modal |
| `checkbox.tsx` | NEW | Radix UI checkbox |
| `select.tsx` | UPDATED | Radix UI select dropdown |

### Hooks (2 files)

| File | Exports | Description |
|------|---------|-------------|
| `use-payment.ts` | 4 hooks | Payment mutations & queries |
| `use-orders.ts` | 5 hooks | Order queries & actions |

### API Clients (2 files)

| File | Functions | Description |
|------|-----------|-------------|
| `payment.ts` | 4 functions | Payment API calls |
| `orders.ts` | 5 functions | Orders API calls |

## 🔗 File Dependencies

### Import Graph

```
Pages
├── checkout/[productId]/page.tsx
│   ├── components/payment/StripeCheckoutForm
│   ├── components/payment/TossCheckoutForm
│   ├── components/payment/PaymentMethodSelector
│   ├── components/payment/PriceBreakdown
│   ├── components/ui/checkbox
│   ├── hooks/use-payment
│   └── lib/api/payment
│
├── checkout/success/[orderId]/page.tsx
│   ├── hooks/use-orders
│   └── components/ui/card
│
├── checkout/fail/[orderId]/page.tsx
│   ├── hooks/use-orders
│   └── components/ui/card
│
└── orders/page.tsx
    ├── components/orders/OrderCard
    ├── components/orders/OrderDetailsModal
    ├── components/orders/RefundRequestModal
    ├── components/ui/select
    ├── hooks/use-orders
    └── hooks/use-payment

Components
├── payment/*
│   └── All use components/ui/* and hooks
│
└── orders/*
    ├── Use components/ui/dialog
    ├── Use components/ui/select
    └── Use hooks/use-orders

Hooks
├── use-payment.ts
│   └── Uses lib/api/payment
│
└── use-orders.ts
    └── Uses lib/api/orders
```

## 📦 Dependencies by File

### External Dependencies

| File | Dependencies |
|------|--------------|
| `StripeCheckoutForm.tsx` | `@stripe/stripe-js`, `@stripe/react-stripe-js` |
| `TossCheckoutForm.tsx` | `@tosspayments/payment-sdk` |
| `dialog.tsx` | `@radix-ui/react-dialog` |
| `checkbox.tsx` | `@radix-ui/react-checkbox` |
| `select.tsx` | `@radix-ui/react-select` |
| `OrderCard.tsx` | `date-fns` |
| `OrderDetailsModal.tsx` | `date-fns` |
| All hooks | `@tanstack/react-query` |
| All pages | `react-hook-form`, `zod` |

## 🎨 Component Hierarchy

### Checkout Page
```
CheckoutPage
├── Card (Product Summary)
├── Form (Buyer Information)
│   ├── Input (Name)
│   ├── Input (Email)
│   └── Checkbox (Terms)
└── Card (Payment)
    ├── PaymentMethodSelector
    └── StripeCheckoutForm | TossCheckoutForm
        └── Button (Submit Payment)
```

### Orders Page
```
OrdersPage
├── Select (Status Filter)
├── OrderCard[] (List)
│   ├── Badge (Status)
│   └── Button[] (Actions)
├── Pagination Controls
├── OrderDetailsModal
│   └── Dialog
└── RefundRequestModal
    └── Dialog
```

## 💾 Data Models

### TypeScript Interfaces

**Payment (`lib/api/payment.ts`)**
```typescript
CreatePaymentParams
CreatePaymentResponse
ConfirmPaymentParams
RefundParams
```

**Orders (`lib/api/orders.ts`)**
```typescript
Order
OrdersResponse
```

## 🔄 State Management

### React Query Keys

```typescript
// Queries
['orders', page, pageSize, status]
['order', orderId]
['payment', orderId]
['refund-eligibility', orderId]

// Mutations
createPayment()
confirmPayment()
requestRefund()
downloadOrderFiles()
downloadReceipt()
```

## 🎯 Usage Patterns

### Creating a Link to Checkout
```tsx
import Link from 'next/link';
<Link href={`/checkout/${productId}`}>Buy Now</Link>
```

### Viewing Orders
```tsx
import Link from 'next/link';
<Link href="/orders">My Orders</Link>
```

### Using Payment Hooks
```tsx
import { useCreatePayment } from '@/hooks/use-payment';
const mutation = useCreatePayment();
await mutation.mutateAsync(params);
```

### Using Order Hooks
```tsx
import { useOrders } from '@/hooks/use-orders';
const { data, isLoading } = useOrders(1, 10);
```

## 🔧 Customization Points

### Styling
- All components use Tailwind CSS
- Customize colors in `tailwind.config.ts`
- Modify component styles directly

### Currency
- Add new currencies in `formatCurrency()` functions
- Update payment provider selection logic

### Payment Providers
- Add new providers by creating new components
- Update `PaymentMethodSelector` logic

### Validation
- Modify Zod schemas in page components
- Add custom validation rules

## 📝 Code Comments

All files include:
- JSDoc comments for functions
- Inline comments for complex logic
- Type annotations for TypeScript
- Usage examples where helpful

## 🚀 Quick Navigation

### To modify checkout flow:
→ `app/(marketplace)/checkout/[productId]/page.tsx`

### To modify payment forms:
→ `components/payment/StripeCheckoutForm.tsx`
→ `components/payment/TossCheckoutForm.tsx`

### To modify order display:
→ `components/orders/OrderCard.tsx`
→ `components/orders/OrderDetailsModal.tsx`

### To modify API calls:
→ `lib/api/payment.ts`
→ `lib/api/orders.ts`

### To add new hooks:
→ `hooks/use-payment.ts`
→ `hooks/use-orders.ts`

## ✅ Checklist

Before deploying:

- [ ] Set environment variables
- [ ] Run database migrations
- [ ] Implement backend APIs
- [ ] Configure webhooks
- [ ] Test payment flows
- [ ] Test refund flows
- [ ] Verify mobile responsiveness
- [ ] Check accessibility
- [ ] Review error handling
- [ ] Set up monitoring

## 📚 Related Documentation

- Installation: `PAYMENT_UI_INSTALLATION.md`
- Summary: `PAYMENT_UI_SUMMARY.md`
- API Specs: See installation guide
- Backend Guide: (To be created)

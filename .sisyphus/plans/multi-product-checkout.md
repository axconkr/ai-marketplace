# Multi-Product Checkout Implementation

## TL;DR

> **Quick Summary**: Implement multi-product checkout flow allowing users to purchase multiple cart items in a single payment transaction, with orders grouped by a shared checkout_session_id.
> 
> **Deliverables**:
> - Schema update with `checkout_session_id` field on Order and Payment
> - New `/api/cart/checkout` endpoint for multi-product payment creation
> - Updated webhook handlers to complete all orders in a checkout session
> - New cart checkout service with validation and order creation logic
> - Multi-order success page showing all purchased items
> - Updated cart page to use new checkout flow
> 
> **Estimated Effort**: Medium (8-12 hours)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (Schema) → Task 2 (Service) → Task 3 (API) → Task 5 (Webhooks) → Task 6 (Success Page) → Task 7 (Cart Page)

---

## Context

### Original Request
Implement multi-product checkout for the cart system. Currently, clicking "결제하기" with multiple items shows an alert. Need to enable purchasing all cart items in a single payment.

### Interview Summary
**Key Discussions**:
- Payment-Order Linking: Add `checkout_session_id` to both Order AND Payment models
- Mixed Currency: Block checkout if currencies differ (show error message)
- Success Page: Show all orders in a list format with combined total
- Test Strategy: Manual QA verification (no automated tests)

**Research Findings**:
- Current `Payment.order_id` is UNIQUE (1:1 relationship)
- Webhook handlers use `orderId` from metadata to find orders
- `completeOrder()` updates single order at a time
- Success page uses `useOrder(orderId)` for single order display
- Cart context provides `items[]`, `clearCart()`, `total`, `count`

### Metis Review (Self-Analysis)
**Identified Gaps** (addressed):
- Need to handle race conditions in webhook (use transaction)
- Need API client function for cart checkout
- Need hook for fetching orders by checkout session
- Cart clearing should happen client-side after redirect to success

---

## Work Objectives

### Core Objective
Enable users to checkout multiple cart items with a single payment, creating linked orders via a shared checkout_session_id.

### Concrete Deliverables
- `prisma/schema.prisma` - Add checkout_session_id to Order and Payment
- `lib/services/cart-checkout.ts` - New service for multi-product checkout
- `app/api/cart/checkout/route.ts` - New API endpoint
- `app/api/webhooks/stripe/route.ts` - Updated webhook handler
- `app/api/webhooks/toss/route.ts` - Updated webhook handler
- `lib/api/cart.ts` - New API client for cart operations
- `hooks/use-cart-checkout.ts` - New hook for cart checkout
- `hooks/use-orders.ts` - Add useOrdersByCheckoutSession hook
- `app/(marketplace)/checkout/success/session/[sessionId]/page.tsx` - Multi-order success page
- `app/(marketplace)/cart/page.tsx` - Updated checkout handler

### Definition of Done
- [ ] User can checkout multiple items from cart with single payment
- [ ] All orders are created with same checkout_session_id
- [ ] Payment webhook marks all related orders as PAID
- [ ] Success page displays all purchased products
- [ ] Cart is cleared after successful checkout redirect
- [ ] Mixed currency checkout is blocked with error message

### Must Have
- Checkout session ID linking orders and payment
- Currency validation before checkout
- Atomic transaction for order creation
- All orders completed on webhook success
- Product access granted for each order

### Must NOT Have (Guardrails)
- NO mixed-currency checkout support (V1 limitation)
- NO cart persistence to database (keep localStorage only)
- NO partial payment/refund handling
- NO inventory/stock management
- NO quantity changes (1 item per product)
- NO separate payment per product (single payment only)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (manual QA chosen)
- **User wants tests**: NO
- **Framework**: none
- **QA approach**: Manual verification procedures

### Automated Verification (Agent-Executable)

Each TODO includes verification procedures that agents can run directly using Playwright browser automation or curl commands.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Schema update (checkout_session_id)
└── Task 4: API client + hooks (can scaffold structure)

Wave 2 (After Wave 1):
├── Task 2: Cart checkout service (needs schema)
├── Task 3: API endpoint (needs service)
└── Task 5: Webhook updates (needs schema)

Wave 3 (After Wave 2):
├── Task 6: Success page for checkout session
└── Task 7: Cart page update (needs API + hooks)

Wave 4 (After Wave 3):
└── Task 8: Integration QA
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3, 5 | 4 |
| 2 | 1 | 3 | 5 |
| 3 | 1, 2 | 7 | 5, 6 |
| 4 | None | 7 | 1 |
| 5 | 1 | 8 | 2, 3, 6 |
| 6 | 3 | 8 | 5 |
| 7 | 3, 4, 6 | 8 | None |
| 8 | All | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Dispatch |
|------|-------|-------------------|
| 1 | 1, 4 | Parallel: schema update + API client scaffolding |
| 2 | 2, 3, 5 | Parallel: service + endpoint + webhooks |
| 3 | 6, 7 | Parallel: success page + cart page |
| 4 | 8 | Sequential: full integration QA |

---

## TODOs

- [ ] 1. Add checkout_session_id to Schema

  **What to do**:
  - Add `checkout_session_id String?` field to Order model
  - Add `checkout_session_id String?` field to Payment model  
  - Add index on `checkout_session_id` for both models
  - Run `npx prisma migrate dev --name add_checkout_session_id`
  - Run `npx prisma generate`

  **Must NOT do**:
  - Do NOT modify Payment.order_id constraint (keep UNIQUE)
  - Do NOT add foreign key relationship for checkout_session_id

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple schema addition, single file, straightforward migration
  - **Skills**: []
    - No special skills needed for schema changes
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed, single file change

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 4)
  - **Blocks**: Tasks 2, 3, 5
  - **Blocked By**: None

  **References**:
  - `prisma/schema.prisma:147-176` - Order model definition
  - `prisma/schema.prisma:178-199` - Payment model definition

  **Acceptance Criteria**:

  ```bash
  # Agent runs migration:
  npx prisma migrate dev --name add_checkout_session_id
  # Assert: Migration succeeds without errors
  
  # Agent verifies schema:
  npx prisma format && npx prisma validate
  # Assert: Exit code 0
  
  # Agent checks generated client:
  grep -r "checkout_session_id" node_modules/.prisma/client/index.d.ts
  # Assert: Returns matches for Order and Payment types
  ```

  **Evidence to Capture:**
  - [ ] Migration file created in `prisma/migrations/`
  - [ ] `npx prisma validate` exits with code 0

  **Commit**: YES
  - Message: `feat(schema): add checkout_session_id to Order and Payment`
  - Files: `prisma/schema.prisma`, `prisma/migrations/*`
  - Pre-commit: `npx prisma validate`

---

- [ ] 2. Create Cart Checkout Service

  **What to do**:
  - Create `lib/services/cart-checkout.ts`
  - Implement `createCartCheckout()` function that:
    - Validates all products exist and are active
    - Validates no self-purchase (buyer != seller)
    - Validates all products have same currency
    - Validates products not already purchased
    - Generates unique checkout_session_id (use cuid)
    - Creates Order for each product with shared checkout_session_id
    - Calculates total amount across all products
    - Creates single PaymentIntent with total
    - Creates Payment record with checkout_session_id
    - Returns checkout session details
  - Implement `completeCheckoutSession()` function that:
    - Finds all orders by checkout_session_id
    - Updates all orders to PAID status in transaction
    - Grants product access for each order
    - Updates download counts

  **Must NOT do**:
  - Do NOT handle mixed currencies (throw error)
  - Do NOT create multiple payments
  - Do NOT modify existing createOrder() function

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Complex business logic with transactions, validation, error handling
  - **Skills**: []
    - Core TypeScript/Prisma work, no special skills
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not applicable, backend service

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Wave 1)
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - `lib/services/order.ts:58-147` - createOrder() pattern for single product
  - `lib/services/order.ts:156-216` - completeOrder() pattern for payment completion
  - `lib/services/order.ts:39-49` - calculatePlatformFee() function to reuse
  - `lib/payment/index.ts` - getPaymentProvider(), getProviderName() functions
  - `contexts/cart-context.tsx:8-26` - CartItem interface for input validation

  **Acceptance Criteria**:

  ```bash
  # Agent verifies file exists and compiles:
  npx tsc --noEmit lib/services/cart-checkout.ts
  # Assert: Exit code 0, no TypeScript errors
  
  # Agent verifies exports:
  grep -E "export (async )?function (createCartCheckout|completeCheckoutSession)" lib/services/cart-checkout.ts
  # Assert: Both functions are exported
  ```

  **Evidence to Capture:**
  - [ ] File `lib/services/cart-checkout.ts` exists
  - [ ] TypeScript compiles without errors
  - [ ] Functions `createCartCheckout` and `completeCheckoutSession` exported

  **Commit**: YES
  - Message: `feat(checkout): add cart checkout service for multi-product orders`
  - Files: `lib/services/cart-checkout.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 3. Create Cart Checkout API Endpoint

  **What to do**:
  - Create `app/api/cart/checkout/route.ts`
  - Implement POST handler that:
    - Requires authentication via `requireAuth()`
    - Accepts body: `{ items: CartItem[], customerName?: string }`
    - Validates items array is not empty
    - Calls `createCartCheckout()` service
    - Returns checkout session details with payment client secret
  - Use existing API patterns (successResponse, handleError, parseBody)

  **Must NOT do**:
  - Do NOT handle payment directly (use service)
  - Do NOT add unnecessary validation (service handles it)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple API route following existing patterns
  - **Skills**: []
    - Standard Next.js API route
  - **Skills Evaluated but Omitted**:
    - `git-master`: Single file addition

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 2)
  - **Parallel Group**: Wave 2 (with Tasks 2, 5)
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `app/api/payments/create/route.ts` - Existing payment creation pattern
  - `lib/auth.ts` - requireAuth() function
  - `lib/api/response.ts` - successResponse, handleError, parseBody functions
  - `contexts/cart-context.tsx:8-26` - CartItem interface

  **Acceptance Criteria**:

  ```bash
  # Agent verifies route exists:
  test -f app/api/cart/checkout/route.ts && echo "File exists"
  # Assert: "File exists"
  
  # Agent verifies TypeScript:
  npx tsc --noEmit app/api/cart/checkout/route.ts
  # Assert: Exit code 0
  
  # Agent verifies POST handler exported:
  grep "export async function POST" app/api/cart/checkout/route.ts
  # Assert: Returns match
  ```

  **Evidence to Capture:**
  - [ ] File `app/api/cart/checkout/route.ts` exists
  - [ ] POST handler exported
  - [ ] Uses requireAuth, parseBody, successResponse

  **Commit**: YES
  - Message: `feat(api): add cart checkout endpoint for multi-product purchase`
  - Files: `app/api/cart/checkout/route.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 4. Create API Client and Hooks for Cart Checkout

  **What to do**:
  - Create `lib/api/cart.ts` with:
    - `checkoutCart(items: CartItem[], customerName?: string)` function
    - Proper TypeScript types for request/response
  - Update `hooks/use-orders.ts` with:
    - `useOrdersByCheckoutSession(sessionId: string)` hook
  - Create `hooks/use-cart-checkout.ts` with:
    - `useCartCheckout()` mutation hook using React Query
    - Handles loading state, error handling
    - Returns mutation function and status

  **Must NOT do**:
  - Do NOT modify existing hooks behavior
  - Do NOT add cart persistence to database

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Following established patterns, straightforward implementation
  - **Skills**: []
    - Standard React Query hooks
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not UI work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 7
  - **Blocked By**: None (can scaffold interface-first)

  **References**:
  - `lib/api/orders.ts` - Existing API client pattern
  - `lib/api/error-handler.ts` - apiFetch function
  - `hooks/use-orders.ts` - Existing React Query hook patterns
  - `contexts/cart-context.tsx:8-26` - CartItem interface

  **Acceptance Criteria**:

  ```bash
  # Agent verifies files exist:
  test -f lib/api/cart.ts && test -f hooks/use-cart-checkout.ts && echo "Files exist"
  # Assert: "Files exist"
  
  # Agent verifies TypeScript:
  npx tsc --noEmit lib/api/cart.ts hooks/use-cart-checkout.ts hooks/use-orders.ts
  # Assert: Exit code 0
  
  # Agent verifies exports:
  grep "export function checkoutCart" lib/api/cart.ts
  grep "export function useCartCheckout" hooks/use-cart-checkout.ts
  grep "export function useOrdersByCheckoutSession" hooks/use-orders.ts
  # Assert: All three return matches
  ```

  **Evidence to Capture:**
  - [ ] Files created: `lib/api/cart.ts`, `hooks/use-cart-checkout.ts`
  - [ ] `hooks/use-orders.ts` updated with new hook
  - [ ] TypeScript compiles without errors

  **Commit**: YES
  - Message: `feat(hooks): add cart checkout API client and React Query hooks`
  - Files: `lib/api/cart.ts`, `hooks/use-cart-checkout.ts`, `hooks/use-orders.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 5. Update Webhook Handlers for Checkout Sessions

  **What to do**:
  - Update `app/api/webhooks/stripe/route.ts`:
    - In `handlePaymentSucceeded()`, check for checkout_session_id in metadata
    - If checkout_session_id exists, call `completeCheckoutSession()` instead of `completeOrder()`
    - If no checkout_session_id, use existing single-order flow (backward compatible)
  - Update `app/api/webhooks/toss/route.ts`:
    - Same logic as Stripe webhook
    - Check for checkout_session_id, route to appropriate handler

  **Must NOT do**:
  - Do NOT break existing single-product checkout flow
  - Do NOT remove orderId handling (keep for backward compatibility)

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Critical payment flow, needs careful backward compatibility
  - **Skills**: []
    - Core webhook handling
  - **Skills Evaluated but Omitted**:
    - `git-master`: Multiple files but related changes

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 1)
  - **Parallel Group**: Wave 2 (with Tasks 2, 3)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1 (needs schema), Task 2 (needs service)

  **References**:
  - `app/api/webhooks/stripe/route.ts:63-105` - handlePaymentSucceeded() function
  - `app/api/webhooks/toss/route.ts:63-107` - handlePaymentSucceeded() function
  - `lib/services/cart-checkout.ts` - completeCheckoutSession() (from Task 2)

  **Acceptance Criteria**:

  ```bash
  # Agent verifies backward compatibility preserved:
  grep "orderId" app/api/webhooks/stripe/route.ts | head -5
  # Assert: orderId handling still exists
  
  # Agent verifies checkout_session_id handling added:
  grep "checkout_session_id" app/api/webhooks/stripe/route.ts
  grep "checkout_session_id" app/api/webhooks/toss/route.ts
  # Assert: Both files contain checkout_session_id handling
  
  # Agent verifies completeCheckoutSession imported:
  grep "completeCheckoutSession" app/api/webhooks/stripe/route.ts
  grep "completeCheckoutSession" app/api/webhooks/toss/route.ts
  # Assert: Both files import the function
  ```

  **Evidence to Capture:**
  - [ ] Both webhook files updated
  - [ ] Backward compatibility maintained (orderId still works)
  - [ ] New checkout_session_id flow added

  **Commit**: YES
  - Message: `feat(webhooks): support checkout session completion for multi-product orders`
  - Files: `app/api/webhooks/stripe/route.ts`, `app/api/webhooks/toss/route.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 6. Create Multi-Order Success Page

  **What to do**:
  - Create `app/(marketplace)/checkout/success/session/[sessionId]/page.tsx`
  - Display checkout session success with:
    - Success animation (reuse existing pattern)
    - List of all purchased products with details
    - Combined total amount
    - Download button for each product
    - Receipt download (combined or per-order)
    - Share options
    - Review prompts for each product
  - Use `useOrdersByCheckoutSession(sessionId)` hook
  - Clear cart on mount using `clearCart()` from context

  **Must NOT do**:
  - Do NOT break existing single-order success page
  - Do NOT redirect to this page for single-product checkout

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI work with existing design patterns
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: For consistent UI patterns and styling
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed, manual QA chosen

  **Parallelization**:
  - **Can Run In Parallel**: YES (after API available)
  - **Parallel Group**: Wave 3 (with Task 7)
  - **Blocks**: Task 8
  - **Blocked By**: Task 3, Task 4

  **References**:
  - `app/(marketplace)/checkout/success/[orderId]/page.tsx` - Existing success page pattern
  - `components/ui/card.tsx` - Card component
  - `components/ui/button.tsx` - Button component
  - `contexts/cart-context.tsx` - useCart() for clearCart()
  - `hooks/use-orders.ts` - useOrdersByCheckoutSession() hook

  **Acceptance Criteria**:

  **Using playwright skill for browser automation:**
  ```
  # After dev server running at localhost:3000:
  # Agent navigates to mock success page (requires test data setup)
  
  # Agent verifies file structure:
  test -d "app/(marketplace)/checkout/success/session" && echo "Directory exists"
  test -f "app/(marketplace)/checkout/success/session/[sessionId]/page.tsx" && echo "Page exists"
  # Assert: Both exist
  
  # Agent verifies TypeScript compiles:
  npx tsc --noEmit "app/(marketplace)/checkout/success/session/[sessionId]/page.tsx"
  # Assert: Exit code 0
  
  # Agent verifies cart clear on mount:
  grep "clearCart" "app/(marketplace)/checkout/success/session/[sessionId]/page.tsx"
  # Assert: clearCart is called
  ```

  **Evidence to Capture:**
  - [ ] Success page file created at correct path
  - [ ] Uses useOrdersByCheckoutSession hook
  - [ ] Calls clearCart() on mount
  - [ ] Displays multiple orders in list format

  **Commit**: YES
  - Message: `feat(checkout): add multi-order success page for checkout sessions`
  - Files: `app/(marketplace)/checkout/success/session/[sessionId]/page.tsx`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 7. Update Cart Page Checkout Flow

  **What to do**:
  - Update `app/(marketplace)/cart/page.tsx`:
    - Import `useCartCheckout` hook
    - Import `useCart` for `clearCart` (already imported)
    - Replace `handleCheckout()` logic:
      - If single item: keep existing redirect to `/checkout/${items[0].id}`
      - If multiple items: 
        - Validate all items have same currency
        - If mixed currency, show error toast: "모든 상품의 통화가 동일해야 합니다"
        - Call cart checkout mutation
        - On success, redirect to `/checkout/success/session/${sessionId}`
    - Add loading state during checkout
    - Handle checkout errors with toast/alert

  **Must NOT do**:
  - Do NOT change single-product checkout flow (keep redirect to /checkout/[productId])
  - Do NOT add payment form to cart page (redirect to success handles it)
  - Do NOT remove existing UI components

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI updates with state management
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: For consistent UI and UX patterns
  - **Skills Evaluated but Omitted**:
    - `git-master`: Single file update

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (with Task 6)
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 3, 4, 6

  **References**:
  - `app/(marketplace)/cart/page.tsx:50-56` - Current handleCheckout() function
  - `hooks/use-cart-checkout.ts` - useCartCheckout() hook (from Task 4)
  - `contexts/cart-context.tsx` - useCart() context

  **Acceptance Criteria**:

  **Using playwright skill for browser automation:**
  ```
  # Agent verifies TypeScript:
  npx tsc --noEmit "app/(marketplace)/cart/page.tsx"
  # Assert: Exit code 0
  
  # Agent verifies hook import:
  grep "useCartCheckout" "app/(marketplace)/cart/page.tsx"
  # Assert: Hook is imported and used
  
  # Agent verifies currency validation:
  grep -E "통화|currency" "app/(marketplace)/cart/page.tsx"
  # Assert: Currency check exists
  
  # Agent verifies redirect to session success:
  grep "checkout/success/session" "app/(marketplace)/cart/page.tsx"
  # Assert: Redirect path exists
  ```

  **Evidence to Capture:**
  - [ ] Cart page updated
  - [ ] Uses useCartCheckout hook
  - [ ] Currency validation with Korean error message
  - [ ] Redirects to session success page

  **Commit**: YES
  - Message: `feat(cart): enable multi-product checkout from cart page`
  - Files: `app/(marketplace)/cart/page.tsx`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 8. Integration QA - Manual Verification

  **What to do**:
  - Full end-to-end manual testing of the multi-product checkout flow
  - Test all scenarios listed below
  - Document any issues found

  **Test Scenarios**:

  1. **Happy Path - Multi-Product Checkout (USD)**
     - Add 2+ USD products to cart
     - Click "결제하기"
     - Complete Stripe payment
     - Verify success page shows all products
     - Verify all orders created with same checkout_session_id
     - Verify cart is cleared

  2. **Happy Path - Multi-Product Checkout (KRW)**
     - Add 2+ KRW products to cart
     - Click "결제하기"
     - Complete TossPayments payment
     - Verify success page shows all products

  3. **Mixed Currency Blocked**
     - Add 1 USD product and 1 KRW product
     - Click "결제하기"
     - Verify error message: "모든 상품의 통화가 동일해야 합니다"

  4. **Single Product Still Works**
     - Add 1 product to cart
     - Click "결제하기"
     - Verify redirect to `/checkout/[productId]` (old flow)
     - Complete payment
     - Verify old success page works

  5. **Already Purchased Product**
     - Try to checkout with product already owned
     - Verify appropriate error message

  6. **Self-Purchase Blocked**
     - Try to checkout with own product
     - Verify error message

  7. **Webhook Processing**
     - Verify Stripe webhook completes all orders
     - Verify TossPayments webhook completes all orders
     - Check database: all orders have PAID status

  **Must NOT do**:
  - Do NOT skip any test scenario
  - Do NOT proceed if critical flows are broken

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Browser-based testing with UI verification
  - **Skills**: [`playwright`, `frontend-ui-ux`]
    - `playwright`: For browser automation testing
    - `frontend-ui-ux`: For visual verification
  - **Skills Evaluated but Omitted**:
    - None for QA task

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (Sequential, final)
  - **Blocks**: None (final task)
  - **Blocked By**: All previous tasks

  **References**:
  - All files modified in previous tasks
  - Stripe test mode credentials
  - TossPayments test mode credentials

  **Acceptance Criteria**:

  **Using playwright skill for browser automation:**
  ```
  # Start dev server:
  npm run dev &
  # Wait for server ready
  
  # Test 1: Add products to cart
  # Navigate to /products
  # Click "Add to Cart" on 2 products
  # Navigate to /cart
  # Verify 2 items shown
  # Click "결제하기"
  # Complete Stripe test payment (card: 4242424242424242)
  # Verify redirect to /checkout/success/session/[sessionId]
  # Verify both products listed
  # Navigate to /cart
  # Verify cart is empty
  
  # Test 2: Mixed currency error
  # Add USD product to cart
  # Add KRW product to cart
  # Click "결제하기"
  # Verify error toast/alert appears
  
  # Test 3: Single product fallback
  # Clear cart
  # Add 1 product to cart
  # Click "결제하기"
  # Verify redirect to /checkout/[productId] (not /cart/checkout)
  ```

  **Evidence to Capture:**
  - [ ] Screenshot: Multi-product cart page
  - [ ] Screenshot: Checkout success page with multiple orders
  - [ ] Screenshot: Mixed currency error message
  - [ ] Terminal: Database query showing orders with same checkout_session_id

  **Commit**: NO (QA task, no code changes)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(schema): add checkout_session_id to Order and Payment` | prisma/schema.prisma, migrations/* | npx prisma validate |
| 2 | `feat(checkout): add cart checkout service for multi-product orders` | lib/services/cart-checkout.ts | npx tsc --noEmit |
| 3 | `feat(api): add cart checkout endpoint for multi-product purchase` | app/api/cart/checkout/route.ts | npx tsc --noEmit |
| 4 | `feat(hooks): add cart checkout API client and React Query hooks` | lib/api/cart.ts, hooks/* | npx tsc --noEmit |
| 5 | `feat(webhooks): support checkout session completion for multi-product orders` | app/api/webhooks/*/route.ts | npx tsc --noEmit |
| 6 | `feat(checkout): add multi-order success page for checkout sessions` | app/(marketplace)/checkout/success/session/* | npx tsc --noEmit |
| 7 | `feat(cart): enable multi-product checkout from cart page` | app/(marketplace)/cart/page.tsx | npx tsc --noEmit |

---

## Success Criteria

### Verification Commands
```bash
# Build succeeds
npm run build
# Expected: Build completes without errors

# Type check passes
npx tsc --noEmit
# Expected: No TypeScript errors

# Prisma validates
npx prisma validate
# Expected: Schema is valid

# Dev server starts
npm run dev
# Expected: Server starts on localhost:3000
```

### Final Checklist
- [ ] All "Must Have" present:
  - [ ] checkout_session_id in Order and Payment models
  - [ ] Currency validation blocks mixed currencies
  - [ ] Multi-product checkout creates linked orders
  - [ ] Webhooks complete all session orders
  - [ ] Success page shows all products
  - [ ] Cart clears after checkout
- [ ] All "Must NOT Have" absent:
  - [ ] No mixed-currency support
  - [ ] No database cart persistence
  - [ ] No partial payment handling
  - [ ] No inventory management
- [ ] Build passes
- [ ] All 8 tasks completed

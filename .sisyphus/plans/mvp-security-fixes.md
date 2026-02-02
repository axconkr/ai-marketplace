# MVP Security & Feature Fixes

## TL;DR

> **Quick Summary**: Fix critical security hole where files can be downloaded without purchase verification, add missing view_count schema field, and implement order export for users.
> 
> **Deliverables**:
> - Purchase verification in `canAccessFile()` function
> - `view_count` field in Product schema with migration
> - Export button in orders page with CSV download
> 
> **Estimated Effort**: Short (3-5 days)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (security) is highest priority, Tasks 2-3 can run in parallel after

---

## Context

### Original Request
Fix TOP 3 priorities for MVP launch within 1-2 weeks:
1. Purchase access control (CRITICAL security hole)
2. Add view_count to Product schema (causes errors)
3. Order export functionality (user convenience)

### Interview Summary
**Key Discussions**:
- Timeline: 1-2 weeks, short-term focused on critical gaps
- Priority: User-facing features first (A)
- Email verification: Skip for now (payment processor handles)
- Purchase access control is exploitable NOW - files can be downloaded without payment

**Research Findings**:
- `canAccessFile()` in `lib/services/file.ts:277-282` has TODO, allows all published products
- Order model has `buyer_id`, `product_id`, `status`, `access_granted` - perfect for verification
- Export helpers already exist: `formatOrdersForExport()`, `exportToCSV()`
- Similar field `download_count` exists in Product schema - follow same pattern

### Gap Analysis
**Identified Gaps** (addressed):
- Free products: Allow access without purchase (price=0 check)
- Refunded orders: Exclude from access (status check)
- Sellers: Always have access to their own product files
- Export format: CSV only (matches existing pattern)

---

## Work Objectives

### Core Objective
Close the security hole where product files can be downloaded without purchase verification, fix schema mismatch causing errors, and add order export functionality.

### Concrete Deliverables
- Modified `lib/services/file.ts` with purchase verification logic
- New Prisma migration adding `view_count` to Product model
- Export button in `app/(marketplace)/orders/page.tsx`
- API endpoint or client-side export for user orders

### Definition of Done
- [ ] Attempting to download a product file without purchase returns 403
- [ ] Attempting to download after valid purchase returns file
- [ ] `view_count` field exists in database and can be incremented
- [ ] Users can export their order history as CSV

### Must Have
- Purchase verification queries Order table for PAID/COMPLETED status
- Free products (price=0) allow access without purchase
- Sellers always have access to their own product files
- Refunded/cancelled orders do NOT have access
- Export includes all order statuses for complete history

### Must NOT Have (Guardrails)
- NO changes to payment flow
- NO changes to authentication system
- NO new npm dependencies
- NO admin-only features in this plan
- NO download limits or rate limiting (separate concern)
- NO PDF export (CSV only, matches existing pattern)
- NO invoice generation (already exists separately)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: Unknown (no test config found in search)
- **User wants tests**: Not specified - assume manual verification
- **Framework**: N/A for this plan

### Automated Verification (ALWAYS include)

Each TODO includes executable verification procedures:

**For API/Backend changes** (using Bash curl):
- Test unauthorized access returns 403
- Test authorized access returns file/redirect
- Test edge cases (free product, seller access, refunded order)

**For Database changes** (using Bash bun/prisma):
- Run migration successfully
- Verify field exists with default value

**For Frontend changes** (using playwright skill):
- Verify export button appears
- Verify CSV download triggers
- Verify CSV contains correct data

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - CRITICAL SECURITY):
└── Task 1: Purchase access control in canAccessFile()

Wave 2 (After Wave 1 or in parallel if independent):
├── Task 2: Add view_count to Product schema
└── Task 3: Order export functionality

Wave 3 (Final verification):
└── Task 4: End-to-end verification of all features
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 4 | 2, 3 (if confident) |
| 2 | None | 4 | 1, 3 |
| 3 | None | 4 | 1, 2 |
| 4 | 1, 2, 3 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1 | sisyphus-junior (focused execution) |
| 2 | 2, 3 | sisyphus-junior x2 (parallel) |
| 3 | 4 | qa-tester (verification) |

---

## TODOs

### Task 1: Implement Purchase Access Control (CRITICAL)

- [ ] 1. Implement purchase verification in canAccessFile()

  **What to do**:
  - Modify `canAccessFile()` in `lib/services/file.ts` to check Order table
  - Query for Order where:
    - `buyer_id` = userId
    - `product_id` = file.product_id  
    - `status` IN ('PAID', 'COMPLETED')
  - Handle edge cases:
    - Free products (price=0): Allow access
    - Seller owns product: Allow access (current behavior preserved)
    - Refunded/cancelled: Deny access

  **Must NOT do**:
  - Change authentication flow
  - Add rate limiting
  - Modify order creation/completion logic
  - Touch payment processing

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Focused modification to single function with clear logic
  - **Skills**: [`git-master`]
    - `git-master`: For atomic commit of security fix

  **Parallelization**:
  - **Can Run In Parallel**: YES (independent of 2, 3)
  - **Parallel Group**: Wave 1 (priority) or Wave 2 with 2, 3
  - **Blocks**: Task 4 (verification)
  - **Blocked By**: None

  **References**:

  **Pattern References** (existing code to follow):
  - `lib/services/file.ts:258-285` - Current `canAccessFile()` function with TODO
  - `lib/services/order.ts:296-333` - `getOrder()` shows Order query pattern with relations

  **API/Type References** (contracts to implement against):
  - `prisma/schema.prisma:147-178` - Order model with status, buyer_id, product_id
  - `prisma/schema.prisma:555-562` - OrderStatus enum (PAID, COMPLETED, REFUNDED, CANCELLED)
  - `prisma/schema.prisma:77-122` - Product model with price field for free product check

  **WHY Each Reference Matters**:
  - `canAccessFile()` is THE function to modify - understand current logic
  - `getOrder()` shows how to query orders with buyer/product relation
  - Order model shows available fields for verification query
  - OrderStatus enum defines valid statuses to check

  **Acceptance Criteria**:

  **Automated Verification** (using Bash curl):
  ```bash
  # Setup: Need test user without purchase and product file ID
  # Test 1: Unauthorized user cannot download
  curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $UNPURCHASED_USER_TOKEN" \
    "http://localhost:3000/api/files/$PRODUCT_FILE_ID/download"
  # Assert: HTTP 403

  # Test 2: User with completed purchase CAN download
  curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $PURCHASED_USER_TOKEN" \
    "http://localhost:3000/api/files/$PRODUCT_FILE_ID/download"
  # Assert: HTTP 200 or 302 (redirect to signed URL)

  # Test 3: Seller can always download own product
  curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $SELLER_TOKEN" \
    "http://localhost:3000/api/files/$OWN_PRODUCT_FILE_ID/download"
  # Assert: HTTP 200 or 302
  ```

  **Manual Verification Steps** (if automated not possible):
  1. Create test user, browse to product, attempt download without purchase → 403
  2. Complete purchase for same product
  3. Attempt download again → Success (file downloads)
  4. As seller, download own product file → Success

  **Evidence to Capture:**
  - [ ] HTTP response codes from curl tests
  - [ ] Console/server logs showing access denied/granted

  **Commit**: YES
  - Message: `fix(security): implement purchase verification for file downloads`
  - Files: `lib/services/file.ts`
  - Pre-commit: Manual test of download with/without purchase

---

### Task 2: Add view_count Field to Product Schema

- [ ] 2. Add view_count field to Product model and run migration

  **What to do**:
  - Add `view_count Int @default(0)` to Product model in `prisma/schema.prisma`
  - Add index for `view_count` if sorting by popularity is expected
  - Generate and run Prisma migration
  - Update `incrementViewCount()` in `lib/services/product.ts` to use real field

  **Must NOT do**:
  - Change existing fields
  - Modify other models
  - Add complex view tracking logic (just the field)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple schema change + migration
  - **Skills**: [`git-master`]
    - `git-master`: For atomic commit with migration file

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Task 4 (verification)
  - **Blocked By**: None

  **References**:

  **Pattern References** (existing code to follow):
  - `prisma/schema.prisma:86` - `download_count Int @default(0)` - EXACT pattern to follow
  - `prisma/schema.prisma:110` - `@@index([download_count])` - Index pattern
  - `lib/services/product.ts:249-253` - Current placeholder that needs updating

  **Documentation References**:
  - Prisma migration docs: https://www.prisma.io/docs/concepts/components/prisma-migrate

  **WHY Each Reference Matters**:
  - `download_count` field shows exact syntax and default value pattern
  - Index pattern shows how to add index for sorting
  - `incrementViewCount()` is the function that will use this new field

  **Acceptance Criteria**:

  **Automated Verification** (using Bash):
  ```bash
  # Generate migration (dry run check)
  bunx prisma migrate dev --name add_view_count --create-only
  # Assert: Migration file created in prisma/migrations/

  # Apply migration
  bunx prisma migrate dev
  # Assert: Exit code 0

  # Verify field exists
  bunx prisma db execute --stdin <<< "SELECT view_count FROM \"Product\" LIMIT 1;"
  # Assert: No error (field exists)

  # Test increment works
  bun -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    async function test() {
      const product = await prisma.product.findFirst();
      if (!product) { console.log('No products'); return; }
      const before = product.view_count || 0;
      await prisma.product.update({
        where: { id: product.id },
        data: { view_count: { increment: 1 } }
      });
      const after = await prisma.product.findUnique({ where: { id: product.id }});
      console.log(after.view_count === before + 1 ? 'PASS' : 'FAIL');
      await prisma.\$disconnect();
    }
    test();
  "
  # Assert: Output is "PASS"
  ```

  **Evidence to Capture:**
  - [ ] Migration file created
  - [ ] Migration applied successfully
  - [ ] Field increment test passes

  **Commit**: YES
  - Message: `feat(schema): add view_count field to Product model`
  - Files: `prisma/schema.prisma`, `prisma/migrations/*`, `lib/services/product.ts`
  - Pre-commit: `bunx prisma validate`

---

### Task 3: Implement Order Export Functionality

- [ ] 3. Add order export button and CSV download to orders page

  **What to do**:
  - Add "Export CSV" button to orders page header
  - Use existing `formatOrdersForExport()` and `exportToCSV()` helpers
  - Fetch ALL user orders (not just current page) for export
  - Include all order statuses in export

  **Implementation approach**:
  - Option A: Client-side export (fetch all orders, format, download)
  - Option B: Server-side export (API returns CSV)
  - **Recommended: Option A** (matches existing pattern in seller analytics, no new API needed)

  **Must NOT do**:
  - Add PDF export
  - Add invoice generation
  - Add server-side CSV generation (unless client-side has issues)
  - Add export history tracking

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: UI addition using existing helpers
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: For button styling and placement

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: Task 4 (verification)
  - **Blocked By**: None

  **References**:

  **Pattern References** (existing code to follow):
  - `lib/utils/export.ts:1-38` - `exportToCSV()` function for client-side download
  - `lib/utils/export.ts:40-52` - `formatOrdersForExport()` - EXACT formatter to use
  - `app/(marketplace)/orders/page.tsx:95-136` - Header area where button should go

  **API/Type References**:
  - `lib/api/orders.ts:59-77` - `getOrders()` function - may need to fetch all pages
  - `hooks/use-orders.ts:20-28` - `useOrders()` hook pattern

  **UI References**:
  - `components/ui/button.tsx` - Button component to use
  - Lucide icon: `Download` for export button

  **WHY Each Reference Matters**:
  - `exportToCSV()` handles all CSV generation and download trigger
  - `formatOrdersForExport()` formats Order objects for CSV - just call it
  - Orders page header is where button goes - follow existing pattern

  **Acceptance Criteria**:

  **Automated Verification** (using playwright skill):
  ```
  # Agent executes via playwright browser automation:
  1. Login as test user with orders
  2. Navigate to: http://localhost:3000/orders
  3. Wait for: orders list to load (selector ".space-y-4" or OrderCard)
  4. Assert: Button with text "Export" or "CSV" or download icon visible
  5. Click: Export button
  6. Wait for: Download to trigger (file download event)
  7. Assert: Downloaded file is .csv
  8. Assert: CSV contains header row with "Order ID", "Date", "Product", etc.
  9. Screenshot: .sisyphus/evidence/task-3-export-button.png
  ```

  **Manual Verification Steps** (if playwright not available):
  1. Navigate to /orders as logged-in user
  2. Verify "Export" button visible in header area
  3. Click export button
  4. Verify CSV file downloads
  5. Open CSV, verify columns match `formatOrdersForExport()` output

  **Evidence to Capture:**
  - [ ] Screenshot of export button in UI
  - [ ] Sample CSV file content

  **Commit**: YES
  - Message: `feat(orders): add CSV export functionality for user orders`
  - Files: `app/(marketplace)/orders/page.tsx`, possibly new hook or component
  - Pre-commit: `bun run build` (verify no type errors)

---

### Task 4: End-to-End Verification

- [ ] 4. Verify all three features work together

  **What to do**:
  - Run through complete user flow testing all three features
  - Document any issues found
  - Create evidence artifacts

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification task, not implementation
  - **Skills**: [`playwright`]
    - `playwright`: For browser-based E2E testing

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (final)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 1, 2, 3

  **References**:
  - All acceptance criteria from Tasks 1-3

  **Acceptance Criteria**:

  **Full E2E Flow**:
  ```
  1. PURCHASE ACCESS CONTROL:
     a. As new user, browse to product with files
     b. Attempt to download file → Expect 403
     c. Complete purchase for product
     d. Attempt to download file → Expect success
     e. As seller of different product, download own file → Expect success

  2. VIEW COUNT:
     a. Check product in database has view_count field
     b. View product page
     c. Verify view_count can be incremented (check DB or API)

  3. ORDER EXPORT:
     a. Navigate to /orders
     b. Click export button
     c. Verify CSV downloads
     d. Verify CSV has correct headers and data
  ```

  **Evidence to Capture:**
  - [ ] Screenshots in .sisyphus/evidence/
  - [ ] Curl output logs
  - [ ] Sample exported CSV

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(security): implement purchase verification for file downloads` | `lib/services/file.ts` | Manual download test |
| 2 | `feat(schema): add view_count field to Product model` | `prisma/schema.prisma`, `prisma/migrations/*`, `lib/services/product.ts` | `bunx prisma validate` |
| 3 | `feat(orders): add CSV export functionality for user orders` | `app/(marketplace)/orders/page.tsx` | `bun run build` |

---

## Success Criteria

### Verification Commands
```bash
# Build passes
bun run build

# Prisma schema valid
bunx prisma validate

# (Manual) Download without purchase = 403
# (Manual) Download with purchase = Success
# (Manual) Export CSV works
```

### Final Checklist
- [ ] Files cannot be downloaded without purchase (except free products, sellers)
- [ ] view_count field exists and can be incremented
- [ ] Order export button visible and functional
- [ ] All commits made with descriptive messages
- [ ] No regression in existing functionality

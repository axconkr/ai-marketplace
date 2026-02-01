# Admin Features Implementation Plan

## TL;DR

> **Quick Summary**: Implement 6 fully functional admin pages (Products, Users, Issues, Settings, Verifications, Support) with API routes, service layers, and database models following existing settlements page patterns.
> 
> **Deliverables**:
> - 6 admin pages with full CRUD operations
> - 12+ API route files
> - 6 service files
> - 4 new/modified Prisma models
> - Korean UI with consistent patterns
> 
> **Estimated Effort**: Large (40-60 hours)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Schema → Services → API Routes → UI Pages

---

## Context

### Original Request
Implement ALL Admin Features for AI Marketplace:
1. /admin/products - Product Management
2. /admin/users - User Management
3. /admin/issues - Issue Management
4. /admin/settings - System Settings
5. /admin/verifications - Verification System
6. /admin/support - Technical Support

### Interview Summary
**Key Discoveries**:
- Settlements page is fully implemented (reference pattern)
- Other admin pages are placeholders
- Services exist for core features but need admin-specific extensions
- 3 new models needed: SupportTicket, Announcement, Category
- User model needs status field for suspension

**Patterns to Follow**:
- Client: useState/useEffect + fetch API
- API: requireRole() + handleError() + successResponse()
- UI: Summary cards → Filters → Table → Pagination
- Korean text for labels

### Decisions Made
| Decision | Choice | Rationale |
|----------|--------|-----------|
| SupportTicket model | CREATE | Essential admin feature |
| Announcement model | CREATE | Standard platform functionality |
| Category model | CREATE | Enables dynamic management |
| User suspension | ADD status field | Clean, explicit approach |
| SystemSettings model | CREATE | Global platform configuration |
| Tests | SKIP | Manual browser verification |

---

## Work Objectives

### Core Objective
Replace all admin placeholder pages with fully functional CRUD interfaces that enable administrators to manage the marketplace effectively.

### Concrete Deliverables
- `prisma/schema.prisma` - Updated with new models and fields
- `lib/services/admin/` - 6 admin-specific service files
- `app/api/admin/` - 12+ API route handlers
- `app/(admin)/*/page.tsx` - 6 fully functional admin pages

### Definition of Done
- [ ] All 6 admin pages load without errors
- [ ] All CRUD operations work via API
- [ ] Admin role required for all endpoints
- [ ] Korean UI text consistent with settlements page
- [ ] Pagination works on all list views
- [ ] Filter buttons functional on all pages

### Must Have
- Admin-only access (requireRole check)
- List view with pagination (20 items default)
- Filter by status/role/type
- Detail view for each entity
- Status change actions
- Error handling with user feedback
- Loading states

### Must NOT Have (Guardrails)
- NO breaking changes to existing APIs
- NO email notification integration
- NO audit logging system
- NO bulk operations (batch approve/reject)
- NO real-time WebSocket features
- NO complex analytics dashboards
- NO internationalization beyond Korean
- NO file upload changes
- NO payment provider integrations

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (no test config found)
- **User wants tests**: NO (skip per decision)
- **QA approach**: Manual browser verification

### Manual Verification Procedure

Each TODO includes verification steps:
1. Navigate to admin page
2. Verify data loads correctly
3. Test each filter option
4. Test pagination (if >20 items)
5. Test CRUD operations
6. Verify error handling (invalid inputs)
7. Verify role protection (non-admin blocked)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - Start Immediately):
├── Task 1: Update Prisma schema (new models + User.status)
├── Task 2: Create admin service utilities (shared helpers)
└── Task 3: Create admin API utilities (shared middleware)

Wave 2 (Services - After Wave 1):
├── Task 4: Product admin service
├── Task 5: User admin service
├── Task 6: Issue admin service (refunds + reviews)
├── Task 7: Settings admin service
├── Task 8: Verification admin service
└── Task 9: Support admin service

Wave 3 (API Routes - After Wave 2):
├── Task 10: Product admin API routes
├── Task 11: User admin API routes
├── Task 12: Issue admin API routes
├── Task 13: Settings admin API routes
├── Task 14: Verification admin API routes
└── Task 15: Support admin API routes

Wave 4 (UI Pages - After Wave 3):
├── Task 16: Products admin page
├── Task 17: Users admin page
├── Task 18: Issues admin page
├── Task 19: Settings admin page
├── Task 20: Verifications admin page
└── Task 21: Support admin page

Wave 5 (Final):
└── Task 22: Integration testing & fixes
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 4-9 | 2, 3 |
| 2 | None | 4-9 | 1, 3 |
| 3 | None | 10-15 | 1, 2 |
| 4-9 | 1, 2 | 10-15 | Each other |
| 10-15 | 3, corresponding service | 16-21 | Each other |
| 16-21 | Corresponding API | 22 | Each other |
| 22 | 16-21 | None | None |

---

## TODOs

### Wave 1: Foundation

---

- [ ] 1. Update Prisma Schema with New Models

  **What to do**:
  - Add `SupportTicket` model with fields: id, user_id, subject, description, status (OPEN/IN_PROGRESS/RESOLVED/CLOSED), priority (LOW/MEDIUM/HIGH/URGENT), assigned_to, created_at, updated_at, resolved_at
  - Add `Announcement` model with fields: id, title, content, type (INFO/WARNING/MAINTENANCE), is_active, start_date, end_date, created_at, updated_at
  - Add `Category` model with fields: id, name, slug, description, parent_id (self-relation for hierarchy), sort_order, is_active, created_at, updated_at
  - Add `SystemSettings` model with fields: id, key (unique), value (Json), description, updated_at, updated_by
  - Add `status` field to User model: enum UserStatus { ACTIVE, SUSPENDED, BANNED } default ACTIVE
  - Add `SupportTicketStatus`, `SupportTicketPriority`, `AnnouncementType`, `UserStatus` enums
  - Add relations: SupportTicket -> User (reporter), SupportTicket -> User (assignee), Category -> Category (parent)

  **Must NOT do**:
  - Change existing model fields or relations
  - Remove any existing enums
  - Modify existing indexes

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed - straightforward Prisma schema editing
  - **Reason**: Schema changes are well-defined, no complex logic

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4-9 (services need models)
  - **Blocked By**: None

  **References**:
  - `prisma/schema.prisma` - Existing schema with model patterns
  - `prisma/schema.prisma:11-57` - User model pattern (relations, indexes)
  - `prisma/schema.prisma:539-646` - Existing enum definitions pattern

  **Acceptance Criteria**:
  ```bash
  # Verify schema is valid
  npx prisma validate
  # Expected: "The schema is valid"
  
  # Generate Prisma client (dry run)
  npx prisma generate
  # Expected: "Generated Prisma Client"
  ```

  **Commit**: YES
  - Message: `feat(schema): add admin models (SupportTicket, Announcement, Category, SystemSettings, UserStatus)`
  - Files: `prisma/schema.prisma`
  - Pre-commit: `npx prisma validate`

---

- [ ] 2. Create Admin Service Utilities

  **What to do**:
  - Create `lib/services/admin/index.ts` - barrel export file
  - Create `lib/services/admin/utils.ts` with shared utilities:
    - `buildPaginationQuery(page, limit)` - returns skip/take for Prisma
    - `buildWhereClause(filters)` - generic filter builder
    - `formatAdminResponse(data, pagination)` - consistent response format
    - `validateAdminAction(userId, action)` - permission validation helper
  - Create `lib/services/admin/types.ts` with shared types:
    - `AdminListParams` - { page, limit, status?, search?, sortBy?, sortOrder? }
    - `AdminListResult<T>` - { items: T[], pagination: {...} }
    - `AdminActionResult` - { success: boolean, message: string, data?: any }

  **Must NOT do**:
  - Duplicate existing utilities from lib/api/response.ts
  - Create complex abstraction layers
  - Add external dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed
  - **Reason**: Utility functions with clear specifications

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 4-9 (services use these utilities)
  - **Blocked By**: None

  **References**:
  - `lib/services/settlement.ts:288-347` - listAllSettlements pattern with pagination
  - `lib/api/response.ts:56-75` - paginatedResponse pattern

  **Acceptance Criteria**:
  ```bash
  # Verify TypeScript compiles
  npx tsc --noEmit lib/services/admin/utils.ts lib/services/admin/types.ts
  # Expected: No errors
  ```

  **Commit**: YES (groups with Task 3)
  - Message: `feat(admin): add admin service utilities and types`
  - Files: `lib/services/admin/index.ts`, `lib/services/admin/utils.ts`, `lib/services/admin/types.ts`

---

- [ ] 3. Create Admin API Utilities

  **What to do**:
  - Create `app/api/admin/_lib/middleware.ts` with:
    - `withAdminAuth(handler)` - HOC that wraps route handlers with requireRole(['admin'])
    - `parseAdminListParams(searchParams)` - extract page, limit, filters from URL
  - Create `app/api/admin/_lib/schemas.ts` with Zod schemas:
    - `adminListParamsSchema` - validates page, limit, status, search, sortBy, sortOrder
    - `idParamSchema` - validates route [id] parameter
    - Re-export from single location for consistency

  **Must NOT do**:
  - Replace existing auth middleware
  - Add complex validation beyond basic types
  - Create middleware that modifies request/response

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed
  - **Reason**: Simple middleware and schema definitions

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 10-15 (API routes use these)
  - **Blocked By**: None

  **References**:
  - `lib/auth.ts:150-165` - requireRole implementation
  - `lib/api/response.ts:220-241` - parseBody, parseSearchParams patterns

  **Acceptance Criteria**:
  ```bash
  # Verify TypeScript compiles
  npx tsc --noEmit app/api/admin/_lib/middleware.ts app/api/admin/_lib/schemas.ts
  # Expected: No errors
  ```

  **Commit**: YES (groups with Task 2)
  - Message: `feat(admin): add admin API middleware and schemas`
  - Files: `app/api/admin/_lib/middleware.ts`, `app/api/admin/_lib/schemas.ts`

---

### Wave 2: Services

---

- [ ] 4. Product Admin Service

  **What to do**:
  - Create `lib/services/admin/product.ts` with functions:
    - `listProductsForAdmin(params)` - list all products with filters (status, category, seller_id, search), pagination, include seller info
    - `getProductDetailsForAdmin(productId)` - full product details with seller, orders count, reviews summary
    - `updateProductStatus(productId, status, reason?)` - change status (approve/reject/suspend)
    - `getProductStatistics()` - counts by status, category breakdown
  - Product statuses: 'draft', 'pending', 'approved', 'rejected', 'suspended'

  **Must NOT do**:
  - Modify existing product.ts service
  - Add product creation/deletion (sellers do that)
  - Change product pricing or content

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed
  - **Reason**: CRUD operations following existing settlement.ts pattern

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5-9)
  - **Blocks**: Task 10 (API routes)
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `lib/services/settlement.ts:288-347` - listAllSettlements pattern
  - `lib/services/product.ts` - existing product operations
  - `prisma/schema.prisma:71-117` - Product model with all fields

  **Acceptance Criteria**:
  ```bash
  # Verify TypeScript compiles
  npx tsc --noEmit lib/services/admin/product.ts
  # Expected: No errors
  ```

  **Commit**: NO (groups with Task 5-9)

---

- [ ] 5. User Admin Service

  **What to do**:
  - Create `lib/services/admin/user.ts` with functions:
    - `listUsersForAdmin(params)` - list users with filters (role, status, search by email/name), pagination
    - `getUserDetailsForAdmin(userId)` - full user details with statistics (order count, product count, total revenue, verification count)
    - `updateUserRole(userId, newRole)` - change user role (admin, seller, buyer, verifier)
    - `updateUserStatus(userId, status)` - suspend/activate/ban user
    - `getUserStatistics()` - counts by role, counts by status, new users this month
  - User statuses: 'ACTIVE', 'SUSPENDED', 'BANNED'
  - User roles: 'admin', 'seller', 'buyer', 'verifier'

  **Must NOT do**:
  - Allow changing own role/status (prevent self-lockout)
  - Delete users (use status instead)
  - Modify user passwords

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed
  - **Reason**: CRUD operations following established patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6-9)
  - **Blocks**: Task 11 (API routes)
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `lib/services/settlement.ts:288-347` - list pattern with pagination
  - `prisma/schema.prisma:11-57` - User model
  - `src/lib/auth/types.ts:12-17` - UserRole enum

  **Acceptance Criteria**:
  ```bash
  npx tsc --noEmit lib/services/admin/user.ts
  # Expected: No errors
  ```

  **Commit**: NO (groups with Task 4, 6-9)

---

- [ ] 6. Issue Admin Service (Refunds + Flagged Reviews)

  **What to do**:
  - Create `lib/services/admin/issue.ts` with functions:
    - `listRefundsForAdmin(params)` - list refunds with filters (status, date range), include order/product/buyer info
    - `approveRefund(refundId, adminId)` - approve and process refund
    - `rejectRefund(refundId, adminId, reason)` - reject with reason
    - `listFlaggedReviews(params)` - list reviews where flagged=true, include product/user info
    - `resolveReviewFlag(reviewId, action, adminId)` - action: 'approve' (unflag), 'delete', 'warn_user'
    - `getIssueStatistics()` - pending refunds count, flagged reviews count, resolved this week

  **Must NOT do**:
  - Process actual payment refunds (use existing refund service)
  - Delete reviews permanently (set status to DELETED)
  - Auto-approve anything

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed
  - **Reason**: Combines existing refund.ts and review.ts patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 7-9)
  - **Blocks**: Task 12 (API routes)
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `lib/services/refund.ts` - existing refund operations
  - `lib/services/review.ts` - existing review operations
  - `prisma/schema.prisma:196-214` - Refund model
  - `prisma/schema.prisma:376-405` - Review model with flagged field

  **Acceptance Criteria**:
  ```bash
  npx tsc --noEmit lib/services/admin/issue.ts
  # Expected: No errors
  ```

  **Commit**: NO (groups with Wave 2)

---

- [ ] 7. Settings Admin Service

  **What to do**:
  - Create `lib/services/admin/settings.ts` with functions:
    - `getSystemSettings()` - get all settings from SystemSettings model
    - `updateSystemSetting(key, value, adminId)` - update single setting
    - `getPlatformFeeRate()` - get current platform fee rate (default 0.15)
    - `updatePlatformFeeRate(rate, adminId)` - update fee rate (0.01-0.50 range)
    - `listAnnouncements(params)` - list announcements with filters (type, is_active)
    - `createAnnouncement(data)` - create new announcement
    - `updateAnnouncement(id, data)` - update announcement
    - `deleteAnnouncement(id)` - soft delete (set is_active=false)
    - `listCategories(params)` - list categories with hierarchy
    - `createCategory(data)` - create category
    - `updateCategory(id, data)` - update category
    - `deleteCategory(id)` - soft delete (check no products using it first)

  **Must NOT do**:
  - Delete categories with active products
  - Set platform fee outside 1-50% range
  - Allow duplicate category slugs

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed
  - **Reason**: Standard CRUD on new models

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4-6, 8-9)
  - **Blocks**: Task 13 (API routes)
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `prisma/schema.prisma` - New models (Announcement, Category, SystemSettings)
  - `lib/services/settlement.ts` - CRUD pattern reference

  **Acceptance Criteria**:
  ```bash
  npx tsc --noEmit lib/services/admin/settings.ts
  # Expected: No errors
  ```

  **Commit**: NO (groups with Wave 2)

---

- [ ] 8. Verification Admin Service

  **What to do**:
  - Create `lib/services/admin/verification.ts` with functions:
    - `listVerificationsForAdmin(params)` - list all verifications with filters (status, level), include product/verifier info
    - `getVerificationDetailsForAdmin(verificationId)` - full details with expert reviews
    - `assignVerifier(verificationId, verifierId)` - assign verifier to verification
    - `assignExpert(expertReviewId, expertId)` - assign expert to expert review slot
    - `listAvailableVerifiers()` - users with role='verifier'
    - `listAvailableExperts(expertType)` - users who can review specific type (DESIGN/PLANNING/DEVELOPMENT/DOMAIN)
    - `getVerificationStatistics()` - counts by status, average completion time, pending assignments

  **Must NOT do**:
  - Auto-complete verifications
  - Change verification fees
  - Override expert review scores

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed
  - **Reason**: Leverages existing verification service patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4-7, 9)
  - **Blocks**: Task 14 (API routes)
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `lib/services/verification/index.ts` - existing verification operations
  - `lib/services/verification/claim.ts` - verifier assignment patterns
  - `prisma/schema.prisma:260-286` - Verification model
  - `prisma/schema.prisma:288-313` - VerificationExpert model

  **Acceptance Criteria**:
  ```bash
  npx tsc --noEmit lib/services/admin/verification.ts
  # Expected: No errors
  ```

  **Commit**: NO (groups with Wave 2)

---

- [ ] 9. Support Admin Service

  **What to do**:
  - Create `lib/services/admin/support.ts` with functions:
    - `listSupportTickets(params)` - list tickets with filters (status, priority, assigned_to), include user info
    - `getSupportTicketDetails(ticketId)` - full ticket details
    - `assignTicket(ticketId, adminId)` - assign ticket to admin
    - `updateTicketStatus(ticketId, status, adminId)` - change status
    - `resolveTicket(ticketId, resolution, adminId)` - resolve with resolution notes
    - `getSupportStatistics()` - open count, avg resolution time, tickets by priority

  **Must NOT do**:
  - Create tickets (users do that via separate endpoint)
  - Delete tickets (keep for audit)
  - Send notifications (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed
  - **Reason**: Standard CRUD on new SupportTicket model

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4-8)
  - **Blocks**: Task 15 (API routes)
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `prisma/schema.prisma` - New SupportTicket model
  - `lib/services/settlement.ts` - CRUD pattern reference

  **Acceptance Criteria**:
  ```bash
  npx tsc --noEmit lib/services/admin/support.ts
  # Expected: No errors
  ```

  **Commit**: YES (all Wave 2 services)
  - Message: `feat(admin): add admin services for products, users, issues, settings, verifications, support`
  - Files: `lib/services/admin/*.ts`
  - Pre-commit: `npx tsc --noEmit lib/services/admin/*.ts`

---

### Wave 3: API Routes

---

- [ ] 10. Product Admin API Routes

  **What to do**:
  - Create `app/api/admin/products/route.ts`:
    - GET: list products with filters, pagination
  - Create `app/api/admin/products/[id]/route.ts`:
    - GET: get product details
    - PATCH: update product status
  - Create `app/api/admin/products/statistics/route.ts`:
    - GET: get product statistics
  - All routes use requireRole(['admin'])
  - Use handleError for error handling
  - Use successResponse/paginatedResponse for responses

  **Must NOT do**:
  - Allow product creation/deletion
  - Expose sensitive seller data
  - Bypass role checks

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed
  - **Reason**: Follow existing settlements API route pattern exactly

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11-15)
  - **Blocks**: Task 16 (UI page)
  - **Blocked By**: Tasks 3, 4

  **References**:
  - `app/api/settlements/route.ts` - list endpoint pattern
  - `app/api/settlements/[id]/route.ts` - detail endpoint pattern
  - `app/api/settlements/process/[id]/route.ts` - action endpoint pattern
  - `lib/api/response.ts` - response helpers

  **Acceptance Criteria**:
  ```bash
  # Verify routes compile
  npx tsc --noEmit app/api/admin/products/route.ts app/api/admin/products/[id]/route.ts
  # Expected: No errors
  
  # Test endpoint exists (dev server running)
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/products
  # Expected: 401 (unauthorized - no token) or 403 (forbidden - not admin)
  ```

  **Commit**: NO (groups with Wave 3)

---

- [ ] 11. User Admin API Routes

  **What to do**:
  - Create `app/api/admin/users/route.ts`:
    - GET: list users with filters (role, status, search), pagination
  - Create `app/api/admin/users/[id]/route.ts`:
    - GET: get user details with statistics
    - PATCH: update user role or status
  - Create `app/api/admin/users/statistics/route.ts`:
    - GET: get user statistics
  - Prevent admin from changing own role/status

  **Must NOT do**:
  - Allow password changes
  - Expose sensitive auth data
  - Allow self-role-change

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 12-15)
  - **Blocks**: Task 17 (UI page)
  - **Blocked By**: Tasks 3, 5

  **References**:
  - `app/api/settlements/route.ts` - list pattern
  - `lib/auth.ts:150-165` - role checking

  **Acceptance Criteria**:
  ```bash
  npx tsc --noEmit app/api/admin/users/route.ts app/api/admin/users/[id]/route.ts
  # Expected: No errors
  ```

  **Commit**: NO (groups with Wave 3)

---

- [ ] 12. Issue Admin API Routes

  **What to do**:
  - Create `app/api/admin/issues/refunds/route.ts`:
    - GET: list refund requests with filters
  - Create `app/api/admin/issues/refunds/[id]/route.ts`:
    - GET: get refund details
    - POST: approve or reject refund (action in body)
  - Create `app/api/admin/issues/reviews/route.ts`:
    - GET: list flagged reviews
  - Create `app/api/admin/issues/reviews/[id]/route.ts`:
    - GET: get review details
    - POST: resolve flag (action: approve/delete/warn)
  - Create `app/api/admin/issues/statistics/route.ts`:
    - GET: get issue statistics

  **Must NOT do**:
  - Auto-approve refunds
  - Permanently delete reviews
  - Process payments directly

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10-11, 13-15)
  - **Blocks**: Task 18 (UI page)
  - **Blocked By**: Tasks 3, 6

  **References**:
  - `lib/services/refund.ts` - refund processing flow
  - `app/api/settlements/process/[id]/route.ts` - action handling pattern

  **Acceptance Criteria**:
  ```bash
  npx tsc --noEmit app/api/admin/issues/**/*.ts
  # Expected: No errors
  ```

  **Commit**: NO (groups with Wave 3)

---

- [ ] 13. Settings Admin API Routes

  **What to do**:
  - Create `app/api/admin/settings/route.ts`:
    - GET: get all system settings
    - PATCH: update system setting
  - Create `app/api/admin/settings/fee/route.ts`:
    - GET: get platform fee rate
    - PATCH: update platform fee rate
  - Create `app/api/admin/settings/announcements/route.ts`:
    - GET: list announcements
    - POST: create announcement
  - Create `app/api/admin/settings/announcements/[id]/route.ts`:
    - GET: get announcement
    - PATCH: update announcement
    - DELETE: soft delete announcement
  - Create `app/api/admin/settings/categories/route.ts`:
    - GET: list categories
    - POST: create category
  - Create `app/api/admin/settings/categories/[id]/route.ts`:
    - GET: get category
    - PATCH: update category
    - DELETE: soft delete category

  **Must NOT do**:
  - Set fee outside 1-50% range
  - Delete categories with products
  - Allow duplicate category slugs

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10-12, 14-15)
  - **Blocks**: Task 19 (UI page)
  - **Blocked By**: Tasks 3, 7

  **References**:
  - CRUD pattern from settlements API
  - Zod validation from `lib/api/response.ts:220-230`

  **Acceptance Criteria**:
  ```bash
  npx tsc --noEmit app/api/admin/settings/**/*.ts
  # Expected: No errors
  ```

  **Commit**: NO (groups with Wave 3)

---

- [ ] 14. Verification Admin API Routes

  **What to do**:
  - Create `app/api/admin/verifications/route.ts`:
    - GET: list verifications with filters
  - Create `app/api/admin/verifications/[id]/route.ts`:
    - GET: get verification details
    - POST: assign verifier
  - Create `app/api/admin/verifications/experts/[id]/route.ts`:
    - POST: assign expert to expert review
  - Create `app/api/admin/verifications/verifiers/route.ts`:
    - GET: list available verifiers
  - Create `app/api/admin/verifications/experts/route.ts`:
    - GET: list available experts (query param: type)
  - Create `app/api/admin/verifications/statistics/route.ts`:
    - GET: get verification statistics

  **Must NOT do**:
  - Auto-complete verifications
  - Override scores
  - Change fees

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10-13, 15)
  - **Blocks**: Task 20 (UI page)
  - **Blocked By**: Tasks 3, 8

  **References**:
  - `lib/services/verification/claim.ts` - assignment patterns
  - Existing verification API routes

  **Acceptance Criteria**:
  ```bash
  npx tsc --noEmit app/api/admin/verifications/**/*.ts
  # Expected: No errors
  ```

  **Commit**: NO (groups with Wave 3)

---

- [ ] 15. Support Admin API Routes

  **What to do**:
  - Create `app/api/admin/support/route.ts`:
    - GET: list support tickets with filters
  - Create `app/api/admin/support/[id]/route.ts`:
    - GET: get ticket details
    - PATCH: update ticket (assign, change status)
    - POST: resolve ticket
  - Create `app/api/admin/support/statistics/route.ts`:
    - GET: get support statistics

  **Must NOT do**:
  - Create tickets (user-facing endpoint)
  - Delete tickets
  - Send notifications

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10-14)
  - **Blocks**: Task 21 (UI page)
  - **Blocked By**: Tasks 3, 9

  **References**:
  - Settlement API route patterns
  - Standard CRUD patterns

  **Acceptance Criteria**:
  ```bash
  npx tsc --noEmit app/api/admin/support/**/*.ts
  # Expected: No errors
  ```

  **Commit**: YES (all Wave 3 API routes)
  - Message: `feat(admin): add admin API routes for all features`
  - Files: `app/api/admin/**/*.ts`
  - Pre-commit: `npx tsc --noEmit app/api/admin/**/*.ts`

---

### Wave 4: UI Pages

---

- [ ] 16. Products Admin Page

  **What to do**:
  - Replace placeholder in `app/(admin)/products/page.tsx` with full implementation:
    - Header: "상품 관리" with back button
    - Statistics cards: 전체, 승인 대기, 승인됨, 거부됨, 정지됨
    - Filter buttons: 전체, 대기중, 승인됨, 거부됨, 정지됨
    - Search input for product name
    - Table columns: 상품명, 판매자, 카테고리, 가격, 상태, 등록일, 액션
    - Actions: 승인, 거부, 정지 (with confirm dialogs)
    - Pagination
    - Loading state
    - Error handling with toast/alert

  **Must NOT do**:
  - Add product creation UI
  - Add file management
  - Use external UI libraries beyond existing shadcn

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
  - **Reason**: UI implementation requiring design sensibility

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 17-21)
  - **Blocks**: Task 22
  - **Blocked By**: Task 10

  **References**:
  - `app/(admin)/settlements/page.tsx` - COMPLETE reference implementation (follow exactly)
  - `components/ui/` - shadcn components
  - `components/analytics/StatsCard.tsx` - stats card component

  **Acceptance Criteria**:
  ```
  Manual Browser Verification:
  1. Navigate to /admin/products (as admin user)
  2. Verify statistics cards show correct counts
  3. Click each filter button - verify list updates
  4. Test pagination if >20 products
  5. Click "승인" on pending product - verify status changes
  6. Click "거부" - verify confirm dialog and status change
  7. Test as non-admin user - verify access denied
  ```

  **Commit**: NO (groups with Wave 4)

---

- [ ] 17. Users Admin Page

  **What to do**:
  - Replace placeholder in `app/(admin)/users/page.tsx` with full implementation:
    - Header: "사용자 관리"
    - Statistics cards: 전체, 관리자, 판매자, 구매자, 검증자, 정지됨
    - Filter buttons: 전체, 관리자, 판매자, 구매자, 검증자
    - Search input for email/name
    - Table columns: 이름, 이메일, 역할, 상태, 가입일, 주문수, 상품수, 액션
    - Actions: 역할 변경 dropdown, 정지/활성화 toggle
    - User detail modal/drawer with statistics
    - Pagination

  **Must NOT do**:
  - Allow changing own role
  - Show password fields
  - Add user creation

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 16, 18-21)
  - **Blocks**: Task 22
  - **Blocked By**: Task 11

  **References**:
  - `app/(admin)/settlements/page.tsx` - reference implementation
  - Role change dropdown pattern

  **Acceptance Criteria**:
  ```
  Manual Browser Verification:
  1. Navigate to /admin/users
  2. Verify user list loads with role badges
  3. Filter by role - verify list updates
  4. Search by email - verify filtering
  5. Change user role - verify update
  6. Suspend user - verify status changes
  7. Cannot change own role (current admin)
  ```

  **Commit**: NO (groups with Wave 4)

---

- [ ] 18. Issues Admin Page

  **What to do**:
  - Replace placeholder in `app/(admin)/issues/page.tsx` with full implementation:
    - Header: "이슈 관리"
    - Tabs: 환불 요청, 신고된 리뷰
    - **환불 요청 Tab**:
      - Statistics: 대기중, 처리중, 승인됨, 거부됨
      - Filter by status
      - Table: 주문번호, 상품명, 구매자, 금액, 사유, 요청일, 액션
      - Actions: 승인, 거부 (with reason input for rejection)
    - **신고된 리뷰 Tab**:
      - Table: 상품명, 작성자, 평점, 신고 사유, 신고일, 액션
      - Actions: 승인(유지), 삭제, 경고

  **Must NOT do**:
  - Auto-approve refunds
  - Permanently delete reviews
  - Process payments directly

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 16-17, 19-21)
  - **Blocks**: Task 22
  - **Blocked By**: Task 12

  **References**:
  - `app/(admin)/settlements/page.tsx` - table/filter pattern
  - Tab component from shadcn/ui

  **Acceptance Criteria**:
  ```
  Manual Browser Verification:
  1. Navigate to /admin/issues
  2. Verify tabs work (환불 요청 / 신고된 리뷰)
  3. In refunds tab: filter by status works
  4. Approve refund - verify status updates
  5. Reject refund with reason - verify
  6. In reviews tab: approve (unflag) review
  7. Delete flagged review
  ```

  **Commit**: NO (groups with Wave 4)

---

- [ ] 19. Settings Admin Page

  **What to do**:
  - Replace placeholder in `app/(admin)/settings/page.tsx` with full implementation:
    - Header: "시스템 설정"
    - Sections with cards:
    - **플랫폼 수수료**:
      - Current rate display
      - Input to change (1-50%)
      - Save button
    - **공지사항 관리**:
      - List of announcements
      - Create button → modal with title, content, type, dates
      - Edit/Delete actions
    - **카테고리 관리**:
      - List of categories (hierarchical if parent_id used)
      - Create button → modal with name, slug, description, parent
      - Edit/Delete actions (delete disabled if products exist)

  **Must NOT do**:
  - Set fee outside range
  - Delete categories with products
  - Complex nested category UI (keep flat initially)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 16-18, 20-21)
  - **Blocks**: Task 22
  - **Blocked By**: Task 13

  **References**:
  - Settings form patterns
  - Modal/Dialog from @radix-ui/react-dialog
  - CRUD list pattern from settlements

  **Acceptance Criteria**:
  ```
  Manual Browser Verification:
  1. Navigate to /admin/settings
  2. View current platform fee rate
  3. Change fee rate - verify save works
  4. Create announcement - verify appears in list
  5. Edit announcement - verify updates
  6. Delete announcement - verify removed
  7. Create category - verify appears
  8. Try delete category with products - verify blocked
  ```

  **Commit**: NO (groups with Wave 4)

---

- [ ] 20. Verifications Admin Page

  **What to do**:
  - Replace placeholder in `app/(admin)/verifications/page.tsx` with full implementation:
    - Header: "검증 시스템 관리"
    - Statistics cards: 대기중, 진행중, 완료됨, 거부됨
    - Filter by status, level
    - Table: 상품명, 판매자, 검증 레벨, 상태, 검증자, 요청일, 액션
    - Actions: 검증자 배정 (dropdown of available verifiers)
    - Detail drawer/modal:
      - Verification details
      - Expert reviews list (DESIGN, PLANNING, DEVELOPMENT, DOMAIN)
      - Assign expert buttons for each slot

  **Must NOT do**:
  - Auto-assign verifiers
  - Override expert scores
  - Change verification fees

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 16-19, 21)
  - **Blocks**: Task 22
  - **Blocked By**: Task 14

  **References**:
  - `components/verification/VerificationList.tsx` - existing component
  - Expert type handling pattern

  **Acceptance Criteria**:
  ```
  Manual Browser Verification:
  1. Navigate to /admin/verifications
  2. Verify statistics cards show counts
  3. Filter by status - verify updates
  4. Open verification detail
  5. Assign verifier - verify assignment
  6. Assign expert to review slot - verify
  7. Verify expert type labels: 디자인, 기획, 개발, 도메인
  ```

  **Commit**: NO (groups with Wave 4)

---

- [ ] 21. Support Admin Page

  **What to do**:
  - Replace placeholder in `app/(admin)/support/page.tsx` with full implementation:
    - Header: "기술 지원 관리"
    - Statistics cards: 전체, 열림, 진행중, 해결됨, 종료됨
    - Filter by status, priority
    - Table: 제목, 요청자, 우선순위, 상태, 담당자, 생성일, 액션
    - Priority badges: 낮음(회색), 보통(파랑), 높음(주황), 긴급(빨강)
    - Actions: 담당자 배정, 상태 변경
    - Detail drawer/modal:
      - Full ticket description
      - Resolution notes input
      - Resolve button

  **Must NOT do**:
  - Create tickets
  - Delete tickets
  - Send notifications

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 16-20)
  - **Blocks**: Task 22
  - **Blocked By**: Task 15

  **References**:
  - `app/(admin)/settlements/page.tsx` - table pattern
  - Priority badge colors from settlements status badges

  **Acceptance Criteria**:
  ```
  Manual Browser Verification:
  1. Navigate to /admin/support
  2. Verify empty state or ticket list
  3. Filter by status/priority
  4. Assign ticket to self
  5. Open ticket detail
  6. Add resolution notes and resolve
  7. Verify status changes to RESOLVED
  ```

  **Commit**: YES (all Wave 4 UI pages)
  - Message: `feat(admin): implement all admin UI pages (products, users, issues, settings, verifications, support)`
  - Files: `app/(admin)/*/page.tsx`

---

### Wave 5: Finalization

---

- [ ] 22. Integration Testing & Fixes

  **What to do**:
  - Run full application build: `npm run build`
  - Fix any TypeScript errors
  - Fix any build warnings
  - Test each admin page end-to-end:
    1. Products: list → filter → approve/reject
    2. Users: list → filter → role change → suspend
    3. Issues: refunds tab → approve/reject, reviews tab → resolve
    4. Settings: fee change, announcement CRUD, category CRUD
    5. Verifications: list → assign verifier → assign experts
    6. Support: list → assign → resolve
  - Fix any runtime errors discovered
  - Ensure consistent Korean text across all pages

  **Must NOT do**:
  - Add new features
  - Refactor working code
  - Change existing non-admin functionality

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: None
  - **Reason**: Integration testing requires broad context and debugging

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Final (sequential)
  - **Blocks**: None (completion)
  - **Blocked By**: Tasks 16-21

  **References**:
  - All files created in previous tasks
  - Existing working pages as reference

  **Acceptance Criteria**:
  ```bash
  # Full build succeeds
  npm run build
  # Expected: "Compiled successfully"
  
  # No TypeScript errors
  npx tsc --noEmit
  # Expected: No errors
  ```

  **Manual verification of all 6 admin pages functional**

  **Commit**: YES (if fixes needed)
  - Message: `fix(admin): integration fixes and polish`
  - Files: Any files with fixes

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(schema): add admin models` | prisma/schema.prisma | npx prisma validate |
| 2-3 | `feat(admin): add admin utilities` | lib/services/admin/*, app/api/admin/_lib/* | npx tsc --noEmit |
| 4-9 | `feat(admin): add admin services` | lib/services/admin/*.ts | npx tsc --noEmit |
| 10-15 | `feat(admin): add admin API routes` | app/api/admin/**/*.ts | npx tsc --noEmit |
| 16-21 | `feat(admin): implement admin UI pages` | app/(admin)/*/page.tsx | npm run build |
| 22 | `fix(admin): integration fixes` | Various | npm run build |

---

## Success Criteria

### Verification Commands
```bash
# Schema valid
npx prisma validate

# TypeScript compiles
npx tsc --noEmit

# Build succeeds
npm run build
```

### Final Checklist
- [ ] All 6 admin pages load without errors
- [ ] All CRUD operations work
- [ ] Admin role required for all endpoints
- [ ] Korean UI text consistent
- [ ] Pagination works on all lists
- [ ] Filter buttons functional
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] No console errors in browser

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Prisma migration issues | Run `prisma db push` for development, document migration for production |
| Breaking existing APIs | All new routes under `/api/admin/`, no changes to existing routes |
| UI inconsistency | Use settlements page as exact template |
| Role check bypass | All routes use requireRole at top of handler |
| Self-lockout | Prevent admin from changing own role/status in service layer |

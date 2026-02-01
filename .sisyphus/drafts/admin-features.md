# Draft: AI Marketplace Admin System Implementation

## Context Gathered

### Existing Codebase Patterns

**API Route Pattern:**
- Uses `requireRole(request, [UserRole.ADMIN])` for admin-only routes
- Uses `handleError(error)` for consistent error handling
- Uses `successResponse()`, `paginatedResponse()` for responses
- Zod schemas for validation
- Service layer pattern in `lib/services/`

**Settlements Page (Reference Implementation):**
- Client-side: useState/useEffect, fetch API
- Summary cards at top, filter buttons, table, pagination
- Korean UI text for labels, English for data
- Actions via POST requests with confirm dialogs

**UserRole Enum:**
- ADMIN = 'admin'
- SELLER = 'seller'
- BUYER = 'buyer'
- VERIFIER = 'verifier'

**Database Models:**
- User: role (string), email, name, bank_account, platform_fee_rate
- Product: status (string), seller_id, verification_level, category
- Order: status (OrderStatus enum), buyer_id, product_id, refund_requested
- Refund: status (RefundStatus enum), order_id, reason, approved_by
- Settlement: status (SettlementStatus enum), seller_id, payout_amount
- Verification: status (VerificationStatus enum), product_id, verifier_id
- VerificationExpert: expert_type (DESIGN/PLANNING/DEVELOPMENT/DOMAIN)
- Review: flagged, flag_reason, status (ReviewStatus enum)

**NO SupportTicket model exists** - needs to be created or skipped

### Current Admin Pages Status
- `/admin/settlements` - FULLY IMPLEMENTED (reference)
- `/admin/products` - PLACEHOLDER ("이 기능은 현재 개발 중입니다")
- `/admin/users` - PLACEHOLDER
- `/admin/issues` - PLACEHOLDER
- `/admin/verifications` - PLACEHOLDER
- `/admin/support` - PLACEHOLDER
- `/admin/settings` - PLACEHOLDER

### Existing Services
- `lib/services/product.ts` - product operations
- `lib/services/order.ts` - order operations
- `lib/services/refund.ts` - refund processing
- `lib/services/settlement.ts` - settlement operations
- `lib/services/verification/` - verification system
- `lib/services/review.ts` - review operations

### Existing UI Components
- StatsCard, OrdersTable, RevenueChart
- SettlementList, SettlementCard
- VerificationList, ExpertReviewCard

---

## Requirements (from user request)

### 1. /admin/products - Product Management
- [ ] List all products with filters (status, category, seller)
- [ ] Change product status (approve/reject/suspend)
- [ ] View product details
- [ ] Policy violation actions

### 2. /admin/users - User Management
- [ ] List all users with role filter (ADMIN/SELLER/BUYER/VERIFIER)
- [ ] View user details
- [ ] Change user role
- [ ] Suspend/activate accounts
- [ ] View user statistics (orders, products, revenue)

### 3. /admin/issues - Issue Management
- [ ] List refund requests with status filter
- [ ] Approve/reject refunds
- [ ] View flagged reviews
- [ ] Dispute resolution interface

### 4. /admin/settings - System Settings
- [ ] Platform fee rate configuration
- [ ] Announcement management (CRUD)
- [ ] Category management

### 5. /admin/verifications - Verification System
- [ ] List all verifications with status filter
- [ ] Assign verifiers/experts
- [ ] Monitor verification progress
- [ ] Expert group management

### 6. /admin/support - Technical Support
- [ ] Support ticket listing
- [ ] Ticket assignment and resolution
- [ ] Support statistics

---

## Decisions Made

| Question | Decision | Rationale |
|----------|----------|-----------|
| SupportTicket model | CREATE | Essential admin feature for support management |
| Announcement model | CREATE | Standard platform announcement functionality |
| Category model | CREATE | Enables dynamic category management without code deployments |
| User suspension | ADD status field (ACTIVE/SUSPENDED/BANNED) | Clean, explicit approach that's industry standard |
| SystemSettings model | CREATE | Global platform configuration storage |
| Tests | SKIP | Focus on implementation with manual browser verification (matches existing codebase pattern) |

---

## Scope Boundaries

### IN Scope
- All 6 admin pages with full CRUD
- API routes for each feature
- Service layer for each feature
- Admin role protection
- Korean UI text
- Pagination for lists
- 4 new Prisma models (SupportTicket, Announcement, Category, SystemSettings)
- User status field addition

### OUT Scope (locked)
- NO email notifications for admin actions
- NO audit logging system
- NO bulk operations (batch approve/reject)
- NO real-time WebSocket features
- NO complex analytics dashboards
- NO internationalization beyond Korean

---

## Test Strategy Decision
- **Infrastructure exists**: NO
- **User wants tests**: SKIP (manual verification)
- **QA approach**: Manual browser verification following acceptance criteria in each task

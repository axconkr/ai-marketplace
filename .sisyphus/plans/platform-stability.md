# Platform Stability Milestone

## TL;DR

> **Quick Summary**: Implement 4 critical platform stability features: Supabase Storage (full CRUD), Password Reset Flow (database token + email), Email Notifications (Resend integration), and Product Approval Hooks (connect admin actions to notifications).
> 
> **Deliverables**:
> - `lib/storage/supabase.ts` - Full Supabase Storage implementation
> - `prisma/schema.prisma` - PasswordResetToken model
> - `app/api/auth/reset-password/route.ts` - Password reset validation endpoint
> - `lib/email/resend.ts` - Resend email service integration
> - Updated notification services with real email sending
> - Product publish/approve routes with notification triggers
> 
> **Estimated Effort**: Medium (16-24 hours)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Resend Setup → Email Service → Password Reset → Product Hooks

---

## Context

### Original Request
User requested: "차례대로 개발 진행하고 니가 판단해서 개발해" (Continue development in order, use your judgment)

Based on explore agent analysis, prioritized 4 features for platform stability:
1. Supabase Storage - Foundation for file handling
2. Password Reset Flow - Critical security feature
3. Email Notifications - Enables password reset + all notifications
4. Product Approval Hooks - Connects admin to user notifications

### Interview Summary
**Key Decisions**:
- **Email Provider**: Resend (user's choice)
- **Scope**: Features 1-4 only (platform stability milestone)
- **Password Reset Tokens**: Database storage with Prisma `PasswordResetToken` model
- **Test Strategy**: Tests after implementation (not TDD)

**Research Findings**:
- `lib/storage/supabase.ts`: All 5 methods are placeholders with commented example code
- `app/api/auth/forgot-password/route.ts`: Has TODO comments for token/email
- `lib/services/email-notifications.ts`: Has `sendEmail()` placeholder
- `lib/services/notification-service.ts`: Has `notifyProductApproved()` ready to use
- `app/api/products/[id]/approve/route.ts`: Has TODO for notification
- `app/api/files/[fileId]/download/route.ts`: Needs Supabase signed URL
- No `resend` or `@supabase/supabase-js` packages installed

### Decisions Made
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Email Provider | Resend | Simple API, Next.js friendly, user preference |
| Token Storage | Prisma model | Easy audit, existing patterns |
| Token Expiry | 1 hour | Security best practice |
| Test Strategy | Tests after | Speed priority per user |
| Signed URL Expiry | 1 hour | Balance security/usability |

---

## Work Objectives

### Core Objective
Replace all placeholder implementations with production-ready code for file storage, authentication recovery, and notification delivery.

### Concrete Deliverables
- `lib/storage/supabase.ts` - Working Supabase Storage with upload/download/delete/exists/metadata
- `prisma/schema.prisma` - PasswordResetToken model with user relation
- `app/api/auth/reset-password/route.ts` - Token validation and password update
- `lib/email/resend.ts` - Resend client and send function
- `lib/services/email-notifications.ts` - Updated with real Resend calls
- `app/api/auth/forgot-password/route.ts` - Token generation + email sending
- `app/api/files/[fileId]/download/route.ts` - Supabase signed URL support
- `app/api/products/[id]/publish/route.ts` - Admin notification trigger
- `app/api/products/[id]/approve/route.ts` - Seller notification trigger

### Definition of Done
- [ ] Supabase Storage: upload, download, delete, exists, getMetadata all work
- [ ] File download API returns signed URL for Supabase storage
- [ ] Password reset email sent via Resend
- [ ] Password reset token validated and password updated
- [ ] All notification emails sent via Resend (not console.log)
- [ ] Product publish triggers admin notification
- [ ] Product approve triggers seller notification
- [ ] All builds pass: `npm run build`

### Must Have
- Secure token generation (crypto.randomBytes)
- Token expiration (1 hour)
- Email enumeration prevention (same response for valid/invalid emails)
- Supabase signed URLs for file downloads
- Error handling with user feedback
- Environment variable validation

### Must NOT Have (Guardrails)
- NO changes to existing auth flow (login, register, session)
- NO changes to payment processing
- NO bulk email functionality (individual emails only)
- NO email templates beyond existing
- NO user-facing password reset UI (API only for now)
- NO rate limiting changes (already implemented)
- NO changes to local storage provider
- NO real-time notification features (WebSocket)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Jest configured in package.json)
- **User wants tests**: YES (tests after implementation)
- **QA approach**: Automated tests + manual verification

### Automated Verification

Each TODO includes verification commands:

**For Backend/API changes** (using Bash curl):
```bash
# Test endpoint returns expected status
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/endpoint
```

**For TypeScript compilation**:
```bash
npx tsc --noEmit path/to/file.ts
```

**For Build verification**:
```bash
npm run build
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - Start Immediately):
├── Task 1: Install dependencies (resend, @supabase/supabase-js)
├── Task 2: Add PasswordResetToken model to Prisma schema
└── Task 3: Implement Supabase Storage (all 5 methods)

Wave 2 (Email Infrastructure - After Wave 1):
├── Task 4: Create Resend email service
├── Task 5: Update email-notifications.ts with Resend
└── Task 6: Update file download API for Supabase signed URLs

Wave 3 (Password Reset Flow - After Wave 2):
├── Task 7: Implement forgot-password token generation + email
└── Task 8: Create reset-password validation endpoint

Wave 4 (Product Hooks - After Wave 2):
├── Task 9: Add notification to product publish route
└── Task 10: Add notification to product approve route

Wave 5 (Finalization):
├── Task 11: Add tests for new functionality
└── Task 12: Integration testing & fixes
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3, 4, 5 | 2 |
| 2 | None | 7, 8 | 1, 3 |
| 3 | 1 | 6 | 2 |
| 4 | 1 | 5, 7 | 6 |
| 5 | 4 | 7, 9, 10 | 6 |
| 6 | 3 | 12 | 4, 5 |
| 7 | 2, 4, 5 | 8 | None |
| 8 | 7 | 11 | 9, 10 |
| 9 | 5 | 11 | 8, 10 |
| 10 | 5 | 11 | 8, 9 |
| 11 | 8, 9, 10 | 12 | None |
| 12 | 11 | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2, 3 | quick (simple installs, schema, implementation) |
| 2 | 4, 5, 6 | quick (service implementation) |
| 3 | 7, 8 | quick (API route implementation) |
| 4 | 9, 10 | quick (minor route updates) |
| 5 | 11, 12 | unspecified-high (testing, integration) |

---

## TODOs

### Wave 1: Foundation

---

- [ ] 1. Install Required Dependencies

  **What to do**:
  - Install `resend` package for email sending
  - Install `@supabase/supabase-js` package for storage
  - Verify packages are added to package.json

  **Must NOT do**:
  - Remove any existing dependencies
  - Change package versions of existing packages
  - Add unnecessary dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple npm install command
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not committing yet, just installing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: None

  **References**:
  - `package.json` - Current dependencies list

  **Acceptance Criteria**:
  ```bash
  # Install packages
  npm install resend @supabase/supabase-js
  # Expected: Added to package.json dependencies
  
  # Verify installation
  npm list resend @supabase/supabase-js
  # Expected: Shows installed versions
  ```

  **Commit**: NO (groups with Wave 1)

---

- [ ] 2. Add PasswordResetToken Model to Prisma Schema

  **What to do**:
  - Add `PasswordResetToken` model with fields:
    - `id` - String @id @default(cuid())
    - `token` - String @unique (hashed token)
    - `user_id` - String (relation to User)
    - `expires_at` - DateTime
    - `used` - Boolean @default(false)
    - `used_at` - DateTime? (nullable)
    - `created_at` - DateTime @default(now())
  - Add relation: PasswordResetToken -> User
  - Add indexes: [token], [user_id], [expires_at]
  - Run `npx prisma generate` to update client

  **Must NOT do**:
  - Modify existing User model fields
  - Remove any existing models or relations
  - Change database provider settings

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward Prisma schema addition
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Will commit in Wave 1 batch

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 7, 8
  - **Blocked By**: None

  **References**:
  - `prisma/schema.prisma:11-62` - User model pattern with relations
  - `prisma/schema.prisma:64-74` - Session model pattern (similar token-based auth)
  - `prisma/schema.prisma:361-378` - Notification model with user relation pattern

  **Acceptance Criteria**:
  ```bash
  # Validate schema
  npx prisma validate
  # Expected: "The schema is valid"
  
  # Generate Prisma client
  npx prisma generate
  # Expected: "Generated Prisma Client"
  
  # Push to database (development)
  npx prisma db push
  # Expected: "Your database is now in sync"
  ```

  **Commit**: NO (groups with Wave 1)

---

- [ ] 3. Implement Supabase Storage Provider

  **What to do**:
  - Update `lib/storage/supabase.ts` to implement all 5 methods:
    - `upload()` - Upload file buffer to Supabase bucket
    - `delete()` - Remove file from bucket
    - `getUrl()` - Get public URL for file
    - `exists()` - Check if file exists in bucket
    - `getMetadata()` - Get file size, MIME type, last modified
  - Add new method `getSignedUrl(path: string, expiresIn?: number)` for private file downloads
  - Use `createClient` from `@supabase/supabase-js`
  - Handle errors gracefully with meaningful messages
  - Validate environment variables in constructor

  **Must NOT do**:
  - Change the `StorageProvider` interface
  - Modify `LocalStorage` implementation
  - Change `storage/index.ts` factory logic
  - Remove commented example code (keep for reference)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Implementation following commented example code
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not UI work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 6
  - **Blocked By**: Task 1 (needs @supabase/supabase-js)

  **References**:
  - `lib/storage/supabase.ts:26-67` - Commented upload example to follow
  - `lib/storage/supabase.ts:70-84` - Commented delete example
  - `lib/storage/supabase.ts:100-114` - Commented exists example
  - `lib/storage/supabase.ts:116-144` - Commented metadata example
  - `lib/storage/local.ts:29-64` - LocalStorage.upload() for return type reference
  - `lib/storage/interface.ts:6-56` - StorageProvider interface contract

  **Acceptance Criteria**:
  ```bash
  # TypeScript compiles
  npx tsc --noEmit lib/storage/supabase.ts
  # Expected: No errors
  
  # Build succeeds
  npm run build
  # Expected: "Compiled successfully"
  ```

  **Evidence to Capture**:
  - [ ] TypeScript compilation output
  - [ ] Build output showing no storage errors

  **Commit**: YES (Wave 1 Foundation)
  - Message: `feat(storage): implement Supabase storage provider with signed URLs`
  - Files: `lib/storage/supabase.ts`, `prisma/schema.prisma`, `package.json`, `package-lock.json`
  - Pre-commit: `npx prisma validate && npx tsc --noEmit lib/storage/supabase.ts`

---

### Wave 2: Email Infrastructure

---

- [ ] 4. Create Resend Email Service

  **What to do**:
  - Create `lib/email/resend.ts` with:
    - Resend client initialization with `RESEND_API_KEY`
    - `sendEmail(to, subject, html, text?)` function
    - `sendPasswordResetEmail(to, name, resetUrl)` function
    - `sendNotificationEmail(to, name, type, title, message, link?)` function
    - Environment variable validation
    - Error handling with retry logic (1 retry on failure)
  - Export types for email options
  - Use `RESEND_FROM_EMAIL` env var for sender (default: `noreply@yourdomain.com`)

  **Must NOT do**:
  - Remove existing email template files
  - Change notification-templates.tsx
  - Add complex queueing system
  - Implement batch sending (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward Resend API integration
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `librarian`: Resend docs are simple, no deep research needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Tasks 5, 7
  - **Blocked By**: Task 1 (needs resend package)

  **References**:
  - `lib/email/notification-templates.tsx:67-187` - HTML template generation
  - `lib/email/notification-templates.tsx:192-209` - Text template generation
  - `lib/services/email-notifications.ts:32-44` - sendEmail placeholder to replace
  - Resend API docs: https://resend.com/docs/api-reference/emails/send-email

  **Acceptance Criteria**:
  ```bash
  # TypeScript compiles
  npx tsc --noEmit lib/email/resend.ts
  # Expected: No errors
  
  # Verify types are exported
  grep -l "export" lib/email/resend.ts
  # Expected: File contains exports
  ```

  **Evidence to Capture**:
  - [ ] TypeScript compilation output

  **Commit**: NO (groups with Wave 2)

---

- [ ] 5. Update Email Notifications Service with Resend

  **What to do**:
  - Update `lib/services/email-notifications.ts`:
    - Import `sendEmail` from `lib/email/resend`
    - Replace `console.log` placeholder in `sendEmail()` with actual Resend call
    - Update `sendEmailNotification()` to use Resend
    - Keep existing template generation (generateNotificationEmail, generateNotificationText)
    - Add error handling for email failures (log but don't throw)
  - Ensure all existing notification functions work with real emails

  **Must NOT do**:
  - Change function signatures
  - Remove any existing notification functions
  - Add new notification types
  - Modify Prisma queries in the file

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Replacing placeholder with real implementation
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Tasks 7, 9, 10
  - **Blocked By**: Task 4

  **References**:
  - `lib/services/email-notifications.ts:32-44` - Current sendEmail placeholder
  - `lib/services/email-notifications.ts:49-85` - sendEmailNotification to update
  - `lib/email/notification-templates.tsx` - Template generators to use

  **Acceptance Criteria**:
  ```bash
  # TypeScript compiles
  npx tsc --noEmit lib/services/email-notifications.ts
  # Expected: No errors
  
  # Verify import from resend
  grep "from.*resend" lib/services/email-notifications.ts
  # Expected: Shows import statement
  ```

  **Commit**: NO (groups with Wave 2)

---

- [ ] 6. Update File Download API for Supabase Signed URLs

  **What to do**:
  - Update `app/api/files/[fileId]/download/route.ts`:
    - Import SupabaseStorage class
    - When `STORAGE_PROVIDER === 'supabase'`:
      - Generate signed URL using `SupabaseStorage.getSignedUrl()`
      - Return redirect response to signed URL
      - Set appropriate cache headers
    - Keep local storage flow unchanged
    - Update download count before redirect

  **Must NOT do**:
  - Change local storage download behavior
  - Modify authentication/authorization logic
  - Change file metadata handling
  - Remove existing error handling

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small API route update
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 12
  - **Blocked By**: Task 3

  **References**:
  - `app/api/files/[fileId]/download/route.ts:58-78` - Current local vs supabase branch
  - `app/api/files/[fileId]/download/route.ts:71-77` - TODO comment to implement
  - `lib/storage/supabase.ts` - SupabaseStorage class

  **Acceptance Criteria**:
  ```bash
  # TypeScript compiles
  npx tsc --noEmit app/api/files/[fileId]/download/route.ts
  # Expected: No errors
  
  # Verify supabase handling exists
  grep -l "getSignedUrl\|signed" app/api/files/[fileId]/download/route.ts
  # Expected: File contains signed URL handling
  ```

  **Commit**: YES (Wave 2 Email & Storage)
  - Message: `feat(email): integrate Resend for email notifications and add Supabase signed URL downloads`
  - Files: `lib/email/resend.ts`, `lib/services/email-notifications.ts`, `app/api/files/[fileId]/download/route.ts`
  - Pre-commit: `npx tsc --noEmit lib/email/resend.ts lib/services/email-notifications.ts`

---

### Wave 3: Password Reset Flow

---

- [ ] 7. Implement Forgot Password Token Generation and Email

  **What to do**:
  - Update `app/api/auth/forgot-password/route.ts`:
    - Generate secure token using `crypto.randomBytes(32).toString('hex')`
    - Hash token with `bcrypt` before storing (security best practice)
    - Create `PasswordResetToken` record with:
      - Hashed token
      - User ID
      - Expiration: `Date.now() + 1 hour`
    - Delete any existing unused tokens for this user (prevent token accumulation)
    - Generate reset URL: `${APP_URL}/auth/reset-password?token=${rawToken}`
    - Send email using `sendPasswordResetEmail()` from resend service
    - Always return same success response (prevent email enumeration)
  - Keep existing validation and error handling

  **Must NOT do**:
  - Change the response message (security - email enumeration)
  - Store raw token in database
  - Skip user existence check logging
  - Add rate limiting (already exists at middleware level)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: API route implementation with clear requirements
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Will commit in Wave 3 batch

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential)
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 2, 4, 5

  **References**:
  - `app/api/auth/forgot-password/route.ts:37-42` - TODO comments to implement
  - `prisma/schema.prisma` - New PasswordResetToken model
  - `lib/email/resend.ts` - sendPasswordResetEmail function
  - `lib/auth/verify-token.ts` - Token pattern reference

  **Acceptance Criteria**:
  ```bash
  # TypeScript compiles
  npx tsc --noEmit app/api/auth/forgot-password/route.ts
  # Expected: No errors
  
  # Verify token generation
  grep -l "randomBytes\|crypto" app/api/auth/forgot-password/route.ts
  # Expected: File contains crypto usage
  
  # Verify Prisma token creation
  grep -l "PasswordResetToken\|prisma" app/api/auth/forgot-password/route.ts
  # Expected: File contains Prisma operations
  ```

  **Commit**: NO (groups with Wave 3)

---

- [ ] 8. Create Reset Password Validation Endpoint

  **What to do**:
  - Create `app/api/auth/reset-password/route.ts`:
    - POST endpoint accepting `{ token, newPassword }`
    - Validate input with Zod schema:
      - token: string, min 64 chars (hex-encoded 32 bytes)
      - newPassword: string, min 8 chars
    - Hash provided token and find matching PasswordResetToken
    - Validate token:
      - Exists in database
      - Not expired (expires_at > now)
      - Not already used (used === false)
    - If valid:
      - Hash new password with bcrypt
      - Update user password
      - Mark token as used (used=true, used_at=now)
      - Delete all other tokens for this user
      - Return success response
    - If invalid:
      - Return generic error "Invalid or expired reset token"
      - Do NOT reveal specific failure reason (security)
  - Use existing auth patterns (handleError, successResponse)

  **Must NOT do**:
  - Reveal whether token was invalid vs expired vs used
  - Auto-login user after password reset
  - Send confirmation email (out of scope)
  - Change password validation rules

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard API route with Prisma operations
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after Task 7)
  - **Blocks**: Task 11
  - **Blocked By**: Task 7

  **References**:
  - `app/api/auth/forgot-password/route.ts` - Sibling endpoint pattern
  - `lib/api/response.ts:56-100` - Response helpers
  - `lib/auth.ts:31-48` - Password hashing pattern (bcrypt usage)
  - `prisma/schema.prisma` - PasswordResetToken model

  **Acceptance Criteria**:
  ```bash
  # TypeScript compiles
  npx tsc --noEmit app/api/auth/reset-password/route.ts
  # Expected: No errors
  
  # Verify endpoint exists
  curl -X POST http://localhost:3000/api/auth/reset-password \
    -H "Content-Type: application/json" \
    -d '{"token":"invalid","newPassword":"test1234"}' \
    -s -o /dev/null -w "%{http_code}"
  # Expected: 400 (validation error) or 401 (invalid token)
  ```

  **Commit**: YES (Wave 3 Password Reset)
  - Message: `feat(auth): implement password reset flow with secure token generation`
  - Files: `app/api/auth/forgot-password/route.ts`, `app/api/auth/reset-password/route.ts`
  - Pre-commit: `npx tsc --noEmit app/api/auth/forgot-password/route.ts app/api/auth/reset-password/route.ts`

---

### Wave 4: Product Approval Hooks

---

- [ ] 9. Add Notification to Product Publish Route

  **What to do**:
  - Update `app/api/products/[id]/publish/route.ts`:
    - Import `createNotification` from notification-service
    - After successful `publishProduct()`, notify admins:
      - Find all admin users
      - Create notification for each admin:
        - type: 'PRODUCT_APPROVED' (reuse - means "needs approval action")
        - title: '새 상품 승인 대기'
        - message: `${product.name} 상품이 승인 대기 중입니다`
        - link: `/admin/products?status=pending`
    - Don't fail the publish if notification fails (try-catch)

  **Must NOT do**:
  - Change publishProduct service logic
  - Add email notification (in-app only for admin)
  - Block publish on notification failure
  - Change response format

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small addition to existing route
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 10)
  - **Blocks**: Task 11
  - **Blocked By**: Task 5

  **References**:
  - `app/api/products/[id]/publish/route.ts:54-55` - TODO comment location
  - `lib/services/notification-service.ts:43-94` - createNotification function
  - `lib/services/notification-service.ts:436-452` - notifyProductApproved pattern

  **Acceptance Criteria**:
  ```bash
  # TypeScript compiles
  npx tsc --noEmit app/api/products/[id]/publish/route.ts
  # Expected: No errors
  
  # Verify notification import
  grep -l "createNotification\|notification-service" app/api/products/[id]/publish/route.ts
  # Expected: File contains notification import
  ```

  **Commit**: NO (groups with Wave 4)

---

- [ ] 10. Add Notification to Product Approve Route

  **What to do**:
  - Update `app/api/products/[id]/approve/route.ts`:
    - Import `notifyProductApproved` from notification-service
    - After successful `approveProduct()`, call `notifyProductApproved(productId)`
    - The existing function handles:
      - Creating in-app notification
      - Sending email if user has email notifications enabled
    - Don't fail the approval if notification fails (try-catch)

  **Must NOT do**:
  - Change approveProduct service logic
  - Modify notifyProductApproved function
  - Block approval on notification failure
  - Change response format

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single function call addition
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 9)
  - **Blocks**: Task 11
  - **Blocked By**: Task 5

  **References**:
  - `app/api/products/[id]/approve/route.ts:49-50` - TODO comment location
  - `lib/services/notification-service.ts:436-452` - notifyProductApproved function

  **Acceptance Criteria**:
  ```bash
  # TypeScript compiles
  npx tsc --noEmit app/api/products/[id]/approve/route.ts
  # Expected: No errors
  
  # Verify notification call
  grep -l "notifyProductApproved" app/api/products/[id]/approve/route.ts
  # Expected: File contains notification call
  ```

  **Commit**: YES (Wave 4 Product Hooks)
  - Message: `feat(products): add notification hooks to publish and approve workflows`
  - Files: `app/api/products/[id]/publish/route.ts`, `app/api/products/[id]/approve/route.ts`
  - Pre-commit: `npx tsc --noEmit app/api/products/[id]/publish/route.ts app/api/products/[id]/approve/route.ts`

---

### Wave 5: Finalization

---

- [ ] 11. Add Tests for New Functionality

  **What to do**:
  - Create `__tests__/unit/storage/supabase.test.ts`:
    - Test SupabaseStorage class methods (mock supabase client)
    - Test signed URL generation
    - Test error handling
  - Create `__tests__/unit/email/resend.test.ts`:
    - Test sendEmail function (mock Resend API)
    - Test sendPasswordResetEmail template
    - Test error retry logic
  - Create `__tests__/unit/auth/password-reset.test.ts`:
    - Test token generation format
    - Test token validation logic
    - Test expired token rejection
    - Test used token rejection
  - Use existing Jest configuration

  **Must NOT do**:
  - Write integration tests (unit only for speed)
  - Test actual API calls (mock all external services)
  - Modify existing tests
  - Change Jest configuration

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires understanding of test patterns and mocking
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `librarian`: Existing tests provide patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 5 (sequential)
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 8, 9, 10

  **References**:
  - `__tests__/unit/` - Existing unit test patterns
  - `jest.config.js` - Jest configuration
  - `package.json:27-39` - Test scripts

  **Acceptance Criteria**:
  ```bash
  # Run new tests
  npm test -- --testPathPattern="(supabase|resend|password-reset)"
  # Expected: All tests pass
  
  # Verify test files exist
  ls __tests__/unit/storage/supabase.test.ts __tests__/unit/email/resend.test.ts __tests__/unit/auth/password-reset.test.ts
  # Expected: Files exist
  ```

  **Commit**: YES
  - Message: `test: add unit tests for storage, email, and password reset`
  - Files: `__tests__/unit/**/*.test.ts`
  - Pre-commit: `npm test -- --testPathPattern="(supabase|resend|password-reset)"`

---

- [ ] 12. Integration Testing & Fixes

  **What to do**:
  - Run full build: `npm run build`
  - Fix any TypeScript errors
  - Fix any build warnings
  - Verify all new functionality:
    1. Supabase storage: File upload/download works (with env vars set)
    2. Password reset: Token generation, email sent, reset works
    3. Email notifications: Emails sent via Resend
    4. Product hooks: Notifications created on publish/approve
  - Update `.env.example` with new environment variables:
    - `RESEND_API_KEY`
    - `RESEND_FROM_EMAIL`
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `SUPABASE_STORAGE_BUCKET`
  - Fix any runtime errors discovered

  **Must NOT do**:
  - Add new features
  - Refactor working code
  - Change existing functionality
  - Deploy to production

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Integration testing requires broad debugging skills
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Final (sequential)
  - **Blocks**: None (completion)
  - **Blocked By**: Task 11

  **References**:
  - All files created in previous tasks
  - `.env.example` - Environment variable template

  **Acceptance Criteria**:
  ```bash
  # Full build succeeds
  npm run build
  # Expected: "Compiled successfully"
  
  # No TypeScript errors
  npx tsc --noEmit
  # Expected: No errors
  
  # All tests pass
  npm test
  # Expected: All tests pass
  ```

  **Commit**: YES (if fixes needed)
  - Message: `fix: integration fixes and env documentation for platform stability features`
  - Files: Any files with fixes, `.env.example`
  - Pre-commit: `npm run build`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 3 | `feat(storage): implement Supabase storage with signed URLs` | lib/storage/*, prisma/schema.prisma, package.json | prisma validate, tsc |
| 6 | `feat(email): integrate Resend for notifications` | lib/email/*, lib/services/email-*, app/api/files/* | tsc |
| 8 | `feat(auth): implement password reset flow` | app/api/auth/* | tsc |
| 10 | `feat(products): add notification hooks` | app/api/products/*/route.ts | tsc |
| 11 | `test: add unit tests for new features` | __tests__/unit/** | npm test |
| 12 | `fix: integration fixes` | Various, .env.example | npm run build |

---

## Success Criteria

### Verification Commands
```bash
# Schema valid
npx prisma validate
# Expected: "The schema is valid"

# TypeScript compiles
npx tsc --noEmit
# Expected: No errors

# All tests pass
npm test
# Expected: All tests pass

# Build succeeds
npm run build
# Expected: "Compiled successfully"
```

### Final Checklist
- [ ] Supabase Storage: all 5 methods implemented
- [ ] Signed URLs generated for file downloads
- [ ] PasswordResetToken model in database
- [ ] Password reset email sent via Resend
- [ ] Password reset token validation works
- [ ] All notification emails use Resend
- [ ] Product publish triggers admin notification
- [ ] Product approve triggers seller notification
- [ ] All unit tests pass
- [ ] Build succeeds
- [ ] .env.example updated with new vars

---

## Environment Variables Required

```bash
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Supabase Storage (if using production storage)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
SUPABASE_STORAGE_BUCKET=products
STORAGE_PROVIDER=supabase  # or 'local' for development

# App URL (for password reset links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Supabase credentials not available | Keep local storage as fallback, document setup |
| Resend rate limits | Add retry logic, log failures for manual follow-up |
| Token security | Hash tokens before storage, use crypto.randomBytes |
| Email deliverability | Use verified domain in Resend, test with real emails |
| Migration issues | Use `prisma db push` for development, document production migration |

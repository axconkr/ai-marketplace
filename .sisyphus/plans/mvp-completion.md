# AI Marketplace MVP Completion

## TL;DR

> **Quick Summary**: Complete 5 remaining MVP tasks across payment, search, security, performance, and deployment. Parallelized into 3 waves for efficient execution.
> 
> **Deliverables**:
> - Payment system cleanup (TossPayments webhook fix, confirm flow)
> - PostgreSQL full-text search with GIN indexes
> - Security hardening (httpOnly cookies, CSP, Redis rate limiting)
> - Performance optimization (bundle analyzer, Korean fonts, Redis caching)
> - Production-ready deployment (TypeScript errors fixed, Sentry monitoring)
> 
> **Estimated Effort**: Large (12-16 hours total)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: TypeScript Fixes (Wave 1) → Remove ignoreBuildErrors (Wave 3)

---

## Context

### Original Request
Complete 5 remaining tasks for AI Marketplace MVP:
1. Payment system completion (multi-provider, subscriptions)
2. Advanced search (full-text, improved filters)
3. Security audit (vulnerabilities)
4. Performance optimization (code splitting, caching)
5. Deployment preparation (production config)

### Interview Summary
**Key Discussions**:
- Payment: Stripe primary for subscriptions, TossPayments for basic KRW payments only
- Search: PostgreSQL full-text search (not Meilisearch) to avoid infrastructure complexity
- Security: httpOnly cookies (yes), Redis rate limiting (yes)
- Performance: Font + bundle optimization (no PWA for MVP)
- Deployment: Vercel primary, Sentry monitoring required

**Research Findings**:
- `IPaymentProvider` abstraction is well-designed, TossPayments webhook verification is incomplete
- Prisma search uses `contains` - PostgreSQL `to_tsvector` + GIN index is drop-in upgrade
- `lib/auth.ts` already supports cookie extraction (line 40-43), migration is straightforward
- 5+ TypeScript errors found that block production build - must fix before removing `ignoreBuildErrors`
- Redis mentioned in docker-compose but not implemented in application code

### Metis Review
**Identified Gaps** (addressed in plan):
- Backward compatibility for cookie migration (added grace period with dual support)
- Environment variables for Redis/Sentry on Vercel (added setup task)
- Test coverage for security changes (included in TDD tasks)

---

## Work Objectives

### Core Objective
Prepare AI Marketplace for production launch by completing payment cleanup, search enhancement, security hardening, performance optimization, and deployment configuration.

### Concrete Deliverables
- `lib/payment/toss.ts` - Proper webhook signature verification
- `app/(marketplace)/checkout/success/[orderId]/page.tsx` - Confirm flow wired
- `lib/services/product-search.ts` - PostgreSQL full-text search
- `prisma/schema.prisma` - GIN index for search
- `lib/auth.ts` - httpOnly cookie token storage
- `middleware.ts` - CSRF enforcement on all mutations
- `next.config.js` - CSP header, bundle analyzer, `ignoreBuildErrors: false`
- `lib/redis.ts` - Redis singleton client
- `lib/rate-limit.ts` - Redis-backed rate limiting
- `app/layout.tsx` - Korean font optimization
- `sentry.client.config.ts` - Sentry integration
- All TypeScript errors resolved

### Definition of Done
- [ ] `npm run build` succeeds with `ignoreBuildErrors: false`
- [ ] `npm run lint` passes
- [ ] All existing tests pass
- [ ] Security headers present (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting persists across server restarts
- [ ] Search returns relevance-ranked results
- [ ] Sentry captures errors in production

### Must Have
- TypeScript errors fixed
- CSP header configured
- httpOnly cookie authentication
- Redis rate limiting
- PostgreSQL full-text search
- Sentry error tracking

### Must NOT Have (Guardrails)
- NO Meilisearch integration (use PostgreSQL FTS only)
- NO TossPayments subscriptions (Stripe only)
- NO PWA/Service Worker setup
- NO breaking changes to existing API contracts
- NO `unsafe-inline` in CSP (use nonces)
- NO hard-coded secrets in code
- NO skipping existing tests

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (Jest/Vitest configured, `__tests__/` directory)
- **User wants tests**: TDD where applicable
- **Framework**: Jest + Testing Library

### TDD Tasks
Security changes (auth, CSRF, rate limiting) will follow RED-GREEN-REFACTOR.

### Automated Verification
All tasks include executable verification that agents can run directly.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately) - Foundation:
├── Task 1: Fix TypeScript Errors [CRITICAL PATH]
├── Task 2: Security - CSP Header
├── Task 3: Security - CSRF Global Enforcement
└── Task 4: Performance - Bundle Analyzer Setup

Wave 2 (After Wave 1) - Core Features:
├── Task 5: Security - httpOnly Cookie Migration [depends: 1]
├── Task 6: Security - Redis Rate Limiting [depends: 1]
├── Task 7: Search - PostgreSQL Full-Text [depends: 1]
├── Task 8: Payment - TossPayments Webhook Fix [depends: 1]
└── Task 9: Performance - Korean Font Optimization [depends: 4]

Wave 3 (After Wave 2) - Deployment:
├── Task 10: Payment - Confirm Flow Wiring [depends: 8]
├── Task 11: Performance - Redis Caching Layer [depends: 6]
├── Task 12: Deployment - Remove ignoreBuildErrors [depends: 1-9]
├── Task 13: Deployment - Sentry Integration [depends: 12]
└── Task 14: Deployment - Environment Variables [depends: 6, 13]

Critical Path: Task 1 → Task 5 → Task 12 → Task 13
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 5, 6, 7, 8, 12 | 2, 3, 4 |
| 2 | None | None | 1, 3, 4 |
| 3 | None | None | 1, 2, 4 |
| 4 | None | 9 | 1, 2, 3 |
| 5 | 1 | 12 | 6, 7, 8 |
| 6 | 1 | 11, 14 | 5, 7, 8 |
| 7 | 1 | 12 | 5, 6, 8 |
| 8 | 1 | 10 | 5, 6, 7 |
| 9 | 4 | 12 | 5, 6, 7, 8 |
| 10 | 8 | 12 | 9, 11 |
| 11 | 6 | 12 | 10 |
| 12 | 1-11 | 13 | None |
| 13 | 12 | 14 | None |
| 14 | 6, 13 | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2, 3, 4 | 4x sisyphus-junior in parallel |
| 2 | 5, 6, 7, 8, 9 | 5x sisyphus-junior in parallel |
| 3 | 10, 11, 12, 13, 14 | Sequential (dependencies) |

---

## TODOs

### Wave 1: Foundation (Parallel)

---

- [ ] 1. Fix All TypeScript Errors

  **What to do**:
  - Fix `lib/auth.ts` line 7: Change `JwtPayload` to `JWTPayload` (correct jose export)
  - Fix `lib/auth.ts` line 82: Add proper type assertion for JWT payload
  - Fix `lib/auth.ts` lines 211, 233: Update role comparison to use correct enum values
  - Fix `lib/payment/stripe.ts` line 28: Update Stripe API version to `"2023-10-16"`
  - Fix `src/middleware.ts` lines 7-8: Create missing modules or update imports
  - Fix `lib/validations/file.ts`: Add proper type assertions for MIME types
  - Fix `__tests__/performance/performance.test.ts`: Add proper typing for metrics

  **Must NOT do**:
  - Do NOT change any business logic
  - Do NOT add new features
  - Do NOT suppress errors with `// @ts-ignore`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Type fixes are straightforward edits
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commits per file/error type

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 5, 6, 7, 8, 12
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `lib/auth.ts:7` - Import statement with wrong export name
  - `lib/auth.ts:77-82` - JWT verification and type casting pattern

  **API/Type References**:
  - `jose` package exports `JWTPayload` not `JwtPayload`
  - `@/src/lib/auth/types` - `UserRole` enum definition

  **External References**:
  - jose docs: https://github.com/panva/jose#readme

  **Acceptance Criteria**:

  ```bash
  # Agent runs TypeScript compiler
  npx tsc --noEmit
  # Assert: Exit code 0, no errors
  
  # Verify specific files
  npx tsc --noEmit lib/auth.ts lib/payment/stripe.ts
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `fix(types): resolve TypeScript compilation errors`
  - Files: `lib/auth.ts`, `lib/payment/stripe.ts`, `src/middleware.ts`, `lib/validations/file.ts`, `__tests__/performance/performance.test.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 2. Add Content-Security-Policy Header

  **What to do**:
  - Add CSP header to `next.config.js` headers() function
  - Use strict policy: `default-src 'self'`, `script-src 'self'`, `style-src 'self' 'unsafe-inline'` (Tailwind needs inline)
  - Allow required external sources: Stripe.js, TossPayments SDK, Sentry
  - Allow image sources: self, data:, blob:, CDN domains

  **Must NOT do**:
  - Do NOT use `'unsafe-eval'` in script-src
  - Do NOT allow `*` wildcards
  - Do NOT break Stripe/Toss payment forms

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file configuration change
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `next.config.js:41-73` - Existing headers() function with security headers

  **External References**:
  - Next.js CSP docs: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
  - Stripe CSP requirements: https://stripe.com/docs/security/guide#content-security-policy
  - TossPayments domains: `*.tosspayments.com`, `*.toss.im`

  **Acceptance Criteria**:

  ```bash
  # Agent runs dev server and checks headers
  curl -I http://localhost:3000 2>/dev/null | grep -i "content-security-policy"
  # Assert: Header present with expected directives
  
  # Verify no unsafe-eval
  curl -I http://localhost:3000 2>/dev/null | grep -i "content-security-policy" | grep -v "unsafe-eval"
  # Assert: Returns the header (no unsafe-eval found)
  ```

  **Commit**: YES
  - Message: `feat(security): add Content-Security-Policy header`
  - Files: `next.config.js`
  - Pre-commit: `npm run build`

---

- [ ] 3. Enforce CSRF Protection Globally

  **What to do**:
  - Create `lib/csrf.ts` with double-submit cookie pattern
  - Update `middleware.ts` to validate CSRF token on all POST/PUT/PATCH/DELETE
  - Add Origin/Referer header validation as defense-in-depth
  - Create CSRF token endpoint `app/api/csrf/route.ts`
  - Update frontend to include CSRF token in mutation requests

  **Must NOT do**:
  - Do NOT break GET/HEAD/OPTIONS requests
  - Do NOT require CSRF for webhook endpoints (they use signatures)
  - Do NOT block legitimate cross-origin requests (API clients)

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Security-critical code requiring careful implementation
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No UI changes needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `middleware.ts` - Existing middleware structure
  - `lib/rate-limit.ts` - Pattern for request validation

  **External References**:
  - OWASP CSRF Prevention: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html

  **Acceptance Criteria**:

  **TDD (tests enabled):**
  - [ ] Test file created: `__tests__/lib/csrf.test.ts`
  - [ ] Test covers: valid token passes, invalid token rejects, missing token rejects
  - [ ] `npm test __tests__/lib/csrf.test.ts` → PASS

  **Automated Verification:**
  ```bash
  # Agent tests CSRF rejection
  curl -X POST http://localhost:3000/api/products \
    -H "Content-Type: application/json" \
    -d '{"name":"test"}' \
    -w "%{http_code}"
  # Assert: HTTP 403 (missing CSRF token)
  
  # Agent tests webhook bypass
  curl -X POST http://localhost:3000/api/webhooks/stripe \
    -H "Content-Type: application/json" \
    -H "Stripe-Signature: test" \
    -d '{}' \
    -w "%{http_code}"
  # Assert: NOT 403 (webhooks bypass CSRF)
  ```

  **Commit**: YES
  - Message: `feat(security): implement global CSRF protection`
  - Files: `lib/csrf.ts`, `middleware.ts`, `app/api/csrf/route.ts`
  - Pre-commit: `npm test __tests__/lib/csrf.test.ts`

---

- [ ] 4. Setup Bundle Analyzer

  **What to do**:
  - Install `@next/bundle-analyzer` as dev dependency
  - Wrap `next.config.js` with `withBundleAnalyzer`
  - Enable via `ANALYZE=true` environment variable
  - Add npm script `"analyze": "ANALYZE=true next build"`

  **Must NOT do**:
  - Do NOT enable analyzer by default (only when ANALYZE=true)
  - Do NOT change existing build behavior

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple dependency addition and config change
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `next.config.js` - Current config structure
  - `package.json` - Script definitions

  **External References**:
  - @next/bundle-analyzer: https://www.npmjs.com/package/@next/bundle-analyzer

  **Acceptance Criteria**:

  ```bash
  # Agent installs package
  npm install --save-dev @next/bundle-analyzer
  # Assert: Exit code 0
  
  # Agent verifies script exists
  npm run analyze --dry-run 2>&1 | grep -q "ANALYZE=true"
  # Assert: Script configured correctly
  ```

  **Commit**: YES
  - Message: `feat(perf): add bundle analyzer for build optimization`
  - Files: `next.config.js`, `package.json`
  - Pre-commit: `npm run build`

---

### Wave 2: Core Features (Parallel, after Wave 1)

---

- [ ] 5. Migrate Token Storage to httpOnly Cookies

  **What to do**:
  - Update `app/api/auth/login/route.ts` to set httpOnly cookie instead of returning token
  - Update `app/api/auth/register/route.ts` similarly
  - Update `app/api/auth/logout/route.ts` to clear cookie
  - Update `lib/auth.ts` to read from cookie (already partially supports this)
  - Add 7-day grace period: accept both cookie AND Authorization header
  - Update frontend auth hooks to stop storing in localStorage
  - Add `Secure`, `SameSite=Lax` attributes

  **Must NOT do**:
  - Do NOT immediately break Authorization header auth (grace period)
  - Do NOT store refresh token in accessible cookie
  - Do NOT use `SameSite=None` without necessity

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Security-critical, affects entire auth flow
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8)
  - **Blocks**: Task 12
  - **Blocked By**: Task 1 (TypeScript fixes)

  **References**:

  **Pattern References**:
  - `lib/auth.ts:38-60` - Token extraction (already has cookie support)
  - `app/api/auth/login/route.ts` - Current login implementation
  - `hooks/useAuth.ts` - Frontend auth state management

  **API/Type References**:
  - `AuthTokenPayload` in `lib/auth.ts:14-19`

  **External References**:
  - OWASP JWT storage: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html#token-storage-on-client-side

  **Acceptance Criteria**:

  **TDD (tests enabled):**
  - [ ] Test file: `__tests__/api/auth/login.test.ts`
  - [ ] Test covers: login sets httpOnly cookie, logout clears cookie
  - [ ] `npm test __tests__/api/auth/login.test.ts` → PASS

  **Automated Verification:**
  ```bash
  # Agent tests cookie is set on login
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password"}' \
    -c - 2>/dev/null | grep -i "httponly"
  # Assert: Cookie has HttpOnly flag
  
  # Agent verifies cookie attributes
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password"}' \
    -c - 2>/dev/null | grep -i "secure"
  # Assert: Cookie has Secure flag
  ```

  **Commit**: YES
  - Message: `feat(security): migrate JWT to httpOnly cookies`
  - Files: `app/api/auth/login/route.ts`, `app/api/auth/register/route.ts`, `app/api/auth/logout/route.ts`, `lib/auth.ts`, `hooks/useAuth.ts`
  - Pre-commit: `npm test`

---

- [ ] 6. Implement Redis Rate Limiting

  **What to do**:
  - Install `@upstash/ratelimit` and `@upstash/redis` packages
  - Create `lib/redis.ts` with singleton client pattern
  - Update `lib/rate-limit.ts` to use Redis backend
  - Configure sliding window algorithm
  - Keep existing rate limit thresholds (login: 5/15min, register: 3/1hr)
  - Add fallback to in-memory if Redis unavailable

  **Must NOT do**:
  - Do NOT remove in-memory fallback completely
  - Do NOT change rate limit thresholds without discussion
  - Do NOT expose Redis credentials in client code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Library integration with existing patterns
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 7, 8)
  - **Blocks**: Tasks 11, 14
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `lib/rate-limit.ts` - Current in-memory implementation
  - `docker-compose.yml` - Redis service definition

  **External References**:
  - Upstash Rate Limit: https://github.com/upstash/ratelimit-js
  - Upstash Redis: https://github.com/upstash/redis-js

  **Acceptance Criteria**:

  **TDD (tests enabled):**
  - [ ] Test file: `__tests__/lib/rate-limit.test.ts`
  - [ ] Test covers: rate limit triggers after threshold, resets after window
  - [ ] `npm test __tests__/lib/rate-limit.test.ts` → PASS

  **Automated Verification:**
  ```bash
  # Agent verifies Redis client initializes
  REDIS_URL="redis://localhost:6379" npx ts-node -e "
    import redis from './lib/redis';
    redis.ping().then(console.log);
  "
  # Assert: Output is "PONG"
  ```

  **Commit**: YES
  - Message: `feat(security): implement Redis-based rate limiting`
  - Files: `lib/redis.ts`, `lib/rate-limit.ts`, `package.json`
  - Pre-commit: `npm test __tests__/lib/rate-limit.test.ts`

---

- [ ] 7. Implement PostgreSQL Full-Text Search

  **What to do**:
  - Add `@@fulltext` index on Product.name and Product.description in Prisma schema
  - Create Prisma migration for GIN index: `CREATE INDEX idx_product_search ON "Product" USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')))`
  - Update `lib/services/product-search.ts` to use `$queryRaw` with `ts_rank`
  - Add relevance scoring to sort results
  - Fix status enum bug: `'active'` → `'ACTIVE'` on line 414
  - Add stemming support via `to_tsquery`

  **Must NOT do**:
  - Do NOT break existing filter functionality
  - Do NOT remove Prisma type safety where possible
  - Do NOT use Korean-specific dictionary (use 'simple' for multilingual)

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Database migration + query optimization
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 8)
  - **Blocks**: Task 12
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `lib/services/product-search.ts` - Current search implementation
  - `app/api/products/search/route.ts` - API endpoint
  - `prisma/schema.prisma:71-117` - Product model

  **External References**:
  - PostgreSQL Full Text Search: https://www.postgresql.org/docs/current/textsearch.html
  - Prisma Raw Queries: https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access

  **Acceptance Criteria**:

  **TDD (tests enabled):**
  - [ ] Test file: `__tests__/services/product-search.test.ts`
  - [ ] Test covers: relevance ranking, partial match, filter combination
  - [ ] `npm test __tests__/services/product-search.test.ts` → PASS

  **Automated Verification:**
  ```bash
  # Agent runs migration
  npx prisma migrate dev --name add_fulltext_search
  # Assert: Exit code 0
  
  # Agent tests search API
  curl "http://localhost:3000/api/products/search?q=automation&limit=5" \
    | jq '.products[0].name'
  # Assert: Returns product with "automation" in name (relevance ranked)
  ```

  **Commit**: YES
  - Message: `feat(search): implement PostgreSQL full-text search with GIN index`
  - Files: `prisma/schema.prisma`, `prisma/migrations/*`, `lib/services/product-search.ts`
  - Pre-commit: `npm test __tests__/services/product-search.test.ts`

---

- [ ] 8. Fix TossPayments Webhook Signature Verification

  **What to do**:
  - Update `lib/payment/toss.ts` `verifyWebhookSignature` method
  - Implement HMAC-SHA256 signature verification using `TOSS_WEBHOOK_SECRET`
  - Compare computed signature with `Toss-Signature` header
  - Add timestamp validation to prevent replay attacks
  - Update `handleWebhook` to use proper verification

  **Must NOT do**:
  - Do NOT process webhook without valid signature
  - Do NOT log sensitive payment data
  - Do NOT change webhook event type handling

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file fix with clear requirements
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7)
  - **Blocks**: Task 10
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `lib/payment/toss.ts:handleWebhook` - Current implementation
  - `lib/payment/stripe.ts:verifyWebhookSignature` - Stripe pattern to follow

  **External References**:
  - TossPayments Webhook Docs: https://docs.tosspayments.com/reference/webhook

  **Acceptance Criteria**:

  **TDD (tests enabled):**
  - [ ] Test file: `__tests__/lib/payment/toss.test.ts`
  - [ ] Test covers: valid signature passes, invalid signature rejects, missing signature rejects
  - [ ] `npm test __tests__/lib/payment/toss.test.ts` → PASS

  **Automated Verification:**
  ```bash
  # Agent tests invalid signature rejection
  curl -X POST http://localhost:3000/api/webhooks/toss \
    -H "Content-Type: application/json" \
    -H "Toss-Signature: invalid" \
    -d '{"eventType":"PAYMENT_DONE","data":{}}' \
    -w "%{http_code}"
  # Assert: HTTP 400 (invalid signature)
  ```

  **Commit**: YES
  - Message: `fix(payment): implement TossPayments webhook signature verification`
  - Files: `lib/payment/toss.ts`
  - Pre-commit: `npm test __tests__/lib/payment/toss.test.ts`

---

- [ ] 9. Optimize Korean Font Loading

  **What to do**:
  - Install and configure `next/font/google` for Noto Sans KR
  - Add font to `app/layout.tsx` with `subsets: ["latin", "korean"]`
  - Configure `display: "swap"` for better CLS
  - Apply font via CSS variable `--font-noto-kr`
  - Update Tailwind config to use the font variable
  - Remove any existing CDN font imports

  **Must NOT do**:
  - Do NOT load all font weights (only 400, 500, 700)
  - Do NOT use self-hosted fonts (Google Fonts is optimized)
  - Do NOT break existing font styling

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Configuration change
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Font optimization affects UI/UX

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7, 8)
  - **Blocks**: Task 12
  - **Blocked By**: Task 4

  **References**:

  **Pattern References**:
  - `app/layout.tsx` - Root layout
  - `tailwind.config.js` - Font family config

  **External References**:
  - next/font docs: https://nextjs.org/docs/app/building-your-application/optimizing/fonts

  **Acceptance Criteria**:

  **Automated Verification (playwright browser):**
  ```
  1. Navigate to: http://localhost:3000
  2. Execute JS: document.fonts.check('16px "Noto Sans KR"')
  3. Assert: Returns true (font loaded)
  4. Check computed style of body
  5. Assert: font-family includes "Noto Sans KR"
  ```

  **Commit**: YES
  - Message: `feat(perf): optimize Korean font loading with next/font`
  - Files: `app/layout.tsx`, `tailwind.config.js`
  - Pre-commit: `npm run build`

---

### Wave 3: Deployment (Sequential, after Wave 2)

---

- [ ] 10. Wire TossPayments Confirm Flow

  **What to do**:
  - Update `app/(marketplace)/checkout/success/[orderId]/page.tsx`
  - Call `/api/payments/confirm` on success page load for Toss payments
  - Handle confirm success: show confirmation
  - Handle confirm failure: show error with retry option
  - Add loading state during confirmation

  **Must NOT do**:
  - Do NOT skip confirmation (Toss requires server-side confirm)
  - Do NOT break Stripe success flow (it doesn't need confirm)
  - Do NOT expose payment secrets to client

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Frontend page with loading states
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: User-facing checkout experience

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 11)
  - **Blocks**: Task 12
  - **Blocked By**: Task 8

  **References**:

  **Pattern References**:
  - `app/(marketplace)/checkout/success/[orderId]/page.tsx` - Current success page
  - `app/api/payments/confirm/route.ts` - Confirm API endpoint
  - `components/payment/TossCheckoutForm.tsx` - Toss payment flow

  **Acceptance Criteria**:

  **Automated Verification (playwright browser):**
  ```
  1. Navigate to: http://localhost:3000/checkout/success/test-order-id?paymentKey=test&orderId=test&amount=10000
  2. Wait for: Network request to /api/payments/confirm
  3. Assert: Confirm API called with paymentKey, orderId, amount
  4. Assert: Success message displayed OR error with retry button
  ```

  **Commit**: YES
  - Message: `feat(payment): wire TossPayments confirmation on success page`
  - Files: `app/(marketplace)/checkout/success/[orderId]/page.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 11. Implement Redis Caching Layer

  **What to do**:
  - Create `lib/cache.ts` with `getCached<T>(key, ttl, fn)` helper
  - Add caching to expensive queries:
    - Product details: 5 min TTL
    - Search results: 1 min TTL
    - User profile: 5 min TTL
  - Add cache invalidation on mutations
  - Use key prefixes for namespace: `cache:product:`, `cache:search:`, etc.

  **Must NOT do**:
  - Do NOT cache authenticated user data without user-specific keys
  - Do NOT cache with unlimited TTL
  - Do NOT cache payment/order data

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Utility implementation with clear patterns
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 10)
  - **Blocks**: Task 12
  - **Blocked By**: Task 6

  **References**:

  **Pattern References**:
  - `lib/redis.ts` - Redis client (from Task 6)
  - `lib/services/product.ts` - Product queries to cache
  - `lib/providers/query-provider.tsx` - React Query config

  **Acceptance Criteria**:

  ```bash
  # Agent tests cache hit
  REDIS_URL="redis://localhost:6379" npx ts-node -e "
    import { getCached } from './lib/cache';
    const result1 = await getCached('test:key', 60, async () => 'value');
    const result2 = await getCached('test:key', 60, async () => 'different');
    console.log(result1 === result2); // Should be true (cache hit)
  "
  # Assert: Output is "true"
  ```

  **Commit**: YES
  - Message: `feat(perf): implement Redis caching layer`
  - Files: `lib/cache.ts`, `lib/services/product.ts`
  - Pre-commit: `npm test`

---

- [ ] 12. Remove ignoreBuildErrors and Verify Build

  **What to do**:
  - Update `next.config.js` line 15: set `ignoreBuildErrors: false`
  - Update `next.config.js` line 20: set `ignoreDuringBuilds: false` (ESLint)
  - Run full production build
  - Fix any remaining errors discovered during build
  - Verify all pages compile successfully

  **Must NOT do**:
  - Do NOT proceed if build fails
  - Do NOT add `// @ts-ignore` to suppress errors
  - Do NOT skip this step

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: May require debugging unexpected errors
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 3)
  - **Blocks**: Task 13
  - **Blocked By**: Tasks 1-11 (all previous must complete)

  **References**:

  **Pattern References**:
  - `next.config.js:14-21` - TypeScript and ESLint config

  **Acceptance Criteria**:

  ```bash
  # Agent runs production build
  npm run build
  # Assert: Exit code 0
  # Assert: Output shows "Compiled successfully"
  
  # Agent verifies no ignoreBuildErrors
  grep -q "ignoreBuildErrors: false" next.config.js
  # Assert: Exit code 0 (setting is false)
  ```

  **Commit**: YES
  - Message: `chore(build): remove ignoreBuildErrors, enable strict TypeScript`
  - Files: `next.config.js`
  - Pre-commit: `npm run build`

---

- [ ] 13. Integrate Sentry Error Monitoring

  **What to do**:
  - Install `@sentry/nextjs` package
  - Run `npx @sentry/wizard@latest -i nextjs` for guided setup
  - Create `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
  - Update `next.config.js` to wrap with `withSentryConfig`
  - Add `SENTRY_DSN` to environment variables
  - Configure source maps upload (production only)
  - Add error boundary component

  **Must NOT do**:
  - Do NOT expose Sentry DSN in client bundle (use NEXT_PUBLIC_SENTRY_DSN)
  - Do NOT capture PII (emails, names) without consent
  - Do NOT upload source maps in development

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: SDK integration with wizard
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 3)
  - **Blocks**: Task 14
  - **Blocked By**: Task 12

  **References**:

  **Pattern References**:
  - `next.config.js` - Config wrapper pattern

  **External References**:
  - Sentry Next.js Guide: https://docs.sentry.io/platforms/javascript/guides/nextjs/

  **Acceptance Criteria**:

  ```bash
  # Agent verifies Sentry files exist
  ls sentry.client.config.ts sentry.server.config.ts
  # Assert: Files exist
  
  # Agent verifies build with Sentry
  npm run build
  # Assert: Exit code 0
  # Assert: Output mentions Sentry source maps (if DSN configured)
  ```

  **Commit**: YES
  - Message: `feat(monitoring): integrate Sentry error tracking`
  - Files: `sentry.*.config.ts`, `next.config.js`, `package.json`
  - Pre-commit: `npm run build`

---

- [ ] 14. Configure Production Environment Variables

  **What to do**:
  - Document all required environment variables in `.env.example`
  - Add Vercel environment variables via CLI or dashboard:
    - `REDIS_URL` (Upstash Redis URL)
    - `SENTRY_DSN` (Sentry project DSN)
    - `SENTRY_AUTH_TOKEN` (for source map upload)
    - `TOSS_WEBHOOK_SECRET` (for webhook verification)
  - Verify all existing env vars are set in Vercel
  - Create `.env.production.local.example` with all required vars

  **Must NOT do**:
  - Do NOT commit actual secrets
  - Do NOT use development values in production
  - Do NOT skip validation of required vars

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Documentation and configuration
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 3)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 6, 13

  **References**:

  **Pattern References**:
  - `.env.example` - Existing env template
  - `vercel.json` - Vercel configuration

  **Acceptance Criteria**:

  ```bash
  # Agent verifies all env vars documented
  grep -E "REDIS_URL|SENTRY_DSN|TOSS_WEBHOOK_SECRET" .env.example
  # Assert: All three variables present
  
  # Agent verifies env validation
  grep -r "process.env.REDIS_URL" lib/
  # Assert: Redis URL is read from environment
  ```

  **Commit**: YES
  - Message: `docs(deploy): document production environment variables`
  - Files: `.env.example`, `.env.production.local.example`
  - Pre-commit: None

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(types): resolve TypeScript compilation errors` | lib/auth.ts, lib/payment/stripe.ts, + 3 | `npx tsc --noEmit` |
| 2 | `feat(security): add Content-Security-Policy header` | next.config.js | `npm run build` |
| 3 | `feat(security): implement global CSRF protection` | lib/csrf.ts, middleware.ts, + 1 | `npm test` |
| 4 | `feat(perf): add bundle analyzer` | next.config.js, package.json | `npm run build` |
| 5 | `feat(security): migrate JWT to httpOnly cookies` | app/api/auth/*.ts, lib/auth.ts, hooks/useAuth.ts | `npm test` |
| 6 | `feat(security): implement Redis rate limiting` | lib/redis.ts, lib/rate-limit.ts | `npm test` |
| 7 | `feat(search): implement PostgreSQL full-text search` | prisma/schema.prisma, lib/services/product-search.ts | `npm test` |
| 8 | `fix(payment): TossPayments webhook verification` | lib/payment/toss.ts | `npm test` |
| 9 | `feat(perf): optimize Korean font loading` | app/layout.tsx, tailwind.config.js | `npm run build` |
| 10 | `feat(payment): wire TossPayments confirm flow` | app/(marketplace)/checkout/success/[orderId]/page.tsx | `npm run build` |
| 11 | `feat(perf): implement Redis caching layer` | lib/cache.ts, lib/services/product.ts | `npm test` |
| 12 | `chore(build): remove ignoreBuildErrors` | next.config.js | `npm run build` |
| 13 | `feat(monitoring): integrate Sentry` | sentry.*.config.ts, next.config.js | `npm run build` |
| 14 | `docs(deploy): document production env vars` | .env.example | None |

---

## Success Criteria

### Verification Commands
```bash
# TypeScript compiles without errors
npx tsc --noEmit  # Expected: exit 0

# Production build succeeds
npm run build  # Expected: "Compiled successfully"

# All tests pass
npm test  # Expected: all green

# Lint passes
npm run lint  # Expected: no errors

# Security headers present
curl -I https://your-domain.vercel.app | grep -i "content-security-policy"
# Expected: CSP header present

# Search returns ranked results
curl "https://your-domain.vercel.app/api/products/search?q=ai+agent"
# Expected: relevance-ranked results

# Rate limiting persists
# Make 6 login attempts in 15 minutes, expect 429 on 6th

# Sentry captures errors
# Trigger a test error, verify it appears in Sentry dashboard
```

### Final Checklist
- [ ] All "Must Have" present (TS fixed, CSP, httpOnly, Redis, FTS, Sentry)
- [ ] All "Must NOT Have" absent (no Meilisearch, no Toss subscriptions, no PWA)
- [ ] All 14 tasks completed
- [ ] All tests pass
- [ ] Production build succeeds with `ignoreBuildErrors: false`
- [ ] Vercel deployment succeeds

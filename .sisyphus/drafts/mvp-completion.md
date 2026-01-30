# Draft: AI Marketplace MVP Completion

## Requirements (confirmed)
- 5 tasks to complete for MVP launch
- Payment system with multiple providers
- Advanced search capabilities
- Security audit and fixes
- Performance optimization
- Deployment preparation

## User Decisions (CONFIRMED 2026-01-30)

| Question | User Choice | Rationale |
|----------|-------------|-----------|
| Payment scope | B: Stripe Primary + Toss Basic | TossPayments for one-time KRW, Stripe for subscriptions |
| Search approach | B: Enhanced Prisma + PostgreSQL FTS | Avoid Meilisearch infra complexity |
| Token storage | A: Migrate to httpOnly cookies | Best practice for production security |
| Rate limiting | A: Redis-based | Persistent, scalable |
| PWA | B: Skip for MVP | Font + bundle optimization only |
| Deployment | A: Vercel Primary | Docker for dev/staging only |
| Monitoring | A: Sentry Integration | Essential for production |
| Test strategy | TDD where infra exists | Manual verification otherwise |

## Technical Context (from research)

### Payment System
- **Interface**: `IPaymentProvider` in `lib/payment/types.ts`
- **Implementations**: `StripeProvider`, `TossPaymentsProvider`
- **Factory**: `lib/payment/index.ts` routes KRW→Toss, others→Stripe
- **UI**: `PaymentMethodSelector.tsx`, `TossCheckoutForm.tsx`, `StripeCheckoutForm.tsx`
- **Schema**: `Subscription` model has Stripe-only fields (OK per user decision)
- **Gaps**:
  - TossPayments webhook signature verification incomplete (only checks field presence)
  - Confirm flow not wired on success page
  - Only `'카드'` payment method hardcoded

### Search System
- **API**: `app/api/products/search/route.ts`
- **Service**: `lib/services/product-search.ts` (Prisma `contains`)
- **Bug**: Line 414 has `status: 'active'` should be `'ACTIVE'`
- **Gaps**:
  - No PostgreSQL `to_tsvector` / GIN index
  - Missing: tag filter, pricing model filter, date filter
  - No autocomplete/suggestions

### Security
- **Auth**: `lib/auth.ts` already supports cookie extraction (line 40-43)
- **Headers**: Missing CSP in `next.config.js` headers()
- **CSRF**: Implemented but not enforced on all POST endpoints
- **Rate Limiting**: In-memory LRU in `lib/rate-limit.ts`
- **Known Issues**:
  - `lib/auth.ts` line 7: `JwtPayload` should be `JWTPayload` (jose export name)
  - Token expiry inconsistent (7d vs 15min in different files)

### Performance
- **Config**: `next.config.js` has basic optimizations
- **Fonts**: No `next/font` configured (using CDN or system)
- **Gaps**:
  - No `@next/bundle-analyzer`
  - No Redis caching layer
  - No Korean font optimization (Noto Sans KR, Pretendard)

### Deployment
- **CRITICAL**: `ignoreBuildErrors: true` in `next.config.js` line 15
- **TypeScript Errors Found**:
  - `lib/auth.ts`: JwtPayload import error, type casting issues
  - `lib/payment/stripe.ts`: Stripe API version mismatch
  - `src/middleware.ts`: Missing module imports
  - `lib/validations/file.ts`: String type assignability issues
  - `__tests__/performance/performance.test.ts`: Unknown type issues
- **CI/CD**: GitHub Actions configured but blocked by TS errors

## Scope Boundaries

### INCLUDE
- TossPayments webhook signature verification fix
- PostgreSQL full-text search with GIN index
- httpOnly cookie token storage migration
- CSP header + CSRF global enforcement
- Redis rate limiting with Upstash
- Bundle analyzer + Korean font optimization
- Fix ALL TypeScript errors
- Remove `ignoreBuildErrors: true`
- Sentry error monitoring

### EXCLUDE
- TossPayments subscriptions (keep Stripe-only)
- TossPayments escrow (keep Stripe-only)
- Meilisearch integration (use PostgreSQL FTS)
- PWA / Service Worker
- Additional Toss payment methods beyond card
- SSL/Nginx config (Vercel handles this)

## Self-Review Gap Analysis

### CRITICAL (Must Address)
1. TypeScript errors MUST be fixed before removing `ignoreBuildErrors`
2. Cookie migration needs backward compatibility strategy
3. Redis URL environment variable needed for Vercel

### MINOR (Auto-Resolved)
1. Status enum casing bug - will fix in search task
2. Jose import typo - will fix in security task

### DEFAULTS APPLIED
1. CSP policy: strict with nonces for scripts (Next.js pattern)
2. Redis provider: Upstash (works with Vercel serverless)
3. Font: Noto Sans KR via next/font/google (avoid self-hosting)
4. Sentry SDK: @sentry/nextjs (official integration)

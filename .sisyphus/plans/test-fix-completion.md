# AI Marketplace Test Fix & Completion Plan

## TL;DR

> **Quick Summary**: Fix all Jest test failures by correcting Jest configuration, fixing mock patterns for Prisma/Stripe, and resolving TypeScript errors in test helper files. Achieve 85%+ test coverage.
> 
> **Deliverables**:
> - All 17 Jest test files passing
> - 4 helper files excluded from test matching
> - 85%+ code coverage
> - Clean build with no errors
> 
> **Estimated Effort**: Medium (4-6 hours)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (Jest config) -> Task 2 (Mocks) -> Tasks 3-6 (parallel fixes) -> Task 7 (Verification)

---

## Context

### Original Request
사용자가 요청한 내용: "현재 프로젝트를 분석하고 개발 진행 계속 해줘 테스트까지 모두 완료하고 완벽하게 개발해줘"
(Translation: Analyze the current project and continue development. Complete all tests and develop perfectly.)

### Interview Summary
**Key Discussions**:
- Test infrastructure uses Jest 30.2.0 with @swc/jest and Playwright 1.57.0
- Current documented coverage: 82%, target: 85%
- 4 helper files incorrectly matched as tests
- Stripe and Prisma mocks have fundamental pattern issues

**Research Findings**:
- `testMatch` pattern `**/__tests__/**/*.{js,jsx,ts,tsx}` matches ALL files including helpers
- Prisma mock fails due to module ID mismatch (relative vs alias imports)
- Stripe mock fails because module-level `const stripe` ignores instance override
- `src/lib/subscriptions/stripe.ts` throws at import if env var missing

### Self-Analysis (Gap Review)
**Identified Gaps** (addressed):
- Mock patterns need complete rewrite for Stripe
- Helper files have schema drift from current Prisma schema
- No global mock setup for external services
- Coverage threshold in config (80%) doesn't match goal (85%)

---

## Work Objectives

### Core Objective
Fix all Jest test failures and achieve 85%+ test coverage with a clean build.

### Concrete Deliverables
- `jest.config.js` - Updated with proper exclusions
- `jest.setup.js` - Enhanced with global mocks
- `__mocks__/stripe.ts` - Proper Stripe constructor mock
- `__tests__/utils/test-helpers.ts` - Fixed TypeScript errors
- `__tests__/utils/db-helpers.ts` - Fixed TypeScript errors
- `__tests__/lib/payment/stripe.test.ts` - Fixed mock pattern
- `__tests__/integration/api/product-search.test.ts` - Fixed Prisma mock
- `__tests__/integration/subscriptions.test.ts` - Added Stripe mock

### Definition of Done
- [ ] `npm run test` exits with code 0 (all tests pass)
- [ ] `npm run test:coverage` shows ≥85% coverage on all metrics
- [ ] `npm run build` exits with code 0
- [ ] `npx tsc --noEmit` passes with no errors in test files

### Must Have
- All existing tests pass without modification to test assertions
- Coverage threshold updated to 85% in jest.config.js
- Global mock setup for Stripe SDK
- Proper Prisma mock with correct module ID

### Must NOT Have (Guardrails)
- DO NOT modify production source code (lib/, src/, app/) unless absolutely necessary
- DO NOT change Prisma schema
- DO NOT delete or skip existing tests
- DO NOT add new feature tests (only fix existing)
- DO NOT modify E2E/Playwright tests
- DO NOT add unnecessary dependencies

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES
- **User wants tests**: YES (fix existing)
- **Framework**: Jest 30.2.0 with @swc/jest

### Automated Verification

Each task includes verification procedures that can be run directly:

**For Jest Configuration Changes:**
```bash
# Agent runs:
npm run test -- --listTests 2>&1 | grep -c "test-helpers.ts"
# Assert: Returns 0 (helpers not listed as tests)

npm run test -- --passWithNoTests --testPathPattern="__tests__/utils" 2>&1
# Assert: No "must contain at least one test" errors
```

**For Mock Fixes:**
```bash
# Agent runs:
npm run test -- __tests__/lib/payment/stripe.test.ts 2>&1
# Assert: All tests pass, no "mockResolvedValue is not a function" errors

npm run test -- __tests__/integration/api/product-search.test.ts 2>&1
# Assert: All tests pass, no "is not a function" errors
```

**For Final Verification:**
```bash
# Agent runs:
npm run test 2>&1
# Assert: Exit code 0, all tests pass

npm run test:coverage 2>&1 | grep -E "All files.*\|"
# Assert: All metrics show ≥85%

npm run build 2>&1
# Assert: Exit code 0
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - Foundation):
├── Task 1: Fix jest.config.js exclusions
└── Task 2: Create global mock setup in jest.setup.js

Wave 2 (After Wave 1 - Fix Individual Tests):
├── Task 3: Fix test-helpers.ts TypeScript errors
├── Task 4: Fix db-helpers.ts TypeScript errors
├── Task 5: Fix stripe.test.ts mock pattern
└── Task 6: Fix product-search.test.ts Prisma mock

Wave 3 (After Wave 2 - Final Verification):
├── Task 7: Fix subscriptions.test.ts
├── Task 8: Update coverage threshold
└── Task 9: Run full test suite and verify

Critical Path: Task 1 -> Task 2 -> Task 5 -> Task 7 -> Task 9
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3,4,5,6,7 | 2 |
| 2 | None | 5,6,7 | 1 |
| 3 | 1 | 9 | 4,5,6 |
| 4 | 1 | 9 | 3,5,6 |
| 5 | 1,2 | 7,9 | 3,4,6 |
| 6 | 1,2 | 9 | 3,4,5 |
| 7 | 5 | 9 | 8 |
| 8 | None | 9 | 7 |
| 9 | 3,4,5,6,7,8 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | sisyphus-junior (parallel) |
| 2 | 3, 4, 5, 6 | sisyphus-junior (parallel, 4 agents) |
| 3 | 7, 8, 9 | sisyphus-junior (sequential for 9) |

---

## TODOs

- [ ] 1. Fix Jest Configuration - Exclude Helper Files

  **What to do**:
  - Add to `testPathIgnorePatterns` in `jest.config.js`:
    ```javascript
    testPathIgnorePatterns: [
      '/node_modules/',
      '/.next/',
      '/e2e/',
      '/playwright-report/',
      '/__tests__/utils/',      // ADD: exclude utils helpers
      '/__tests__/fixtures/',   // ADD: exclude fixtures
      '/__tests__/setup/',      // ADD: exclude setup helpers
    ],
    ```
  - Verify helper files are no longer matched as tests

  **Must NOT do**:
  - Do not rename or move helper files
  - Do not modify testMatch pattern (keep existing tests working)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple config file modification
  - **Skills**: [`git-master`]
    - `git-master`: For atomic commit after change

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5, 6, 7
  - **Blocked By**: None (can start immediately)

  **References**:
  - `jest.config.js:32-37` - Current testPathIgnorePatterns array
  - `__tests__/utils/test-helpers.ts` - Helper file to exclude
  - `__tests__/utils/db-helpers.ts` - Helper file to exclude
  - `__tests__/fixtures/test-data.ts` - Helper file to exclude
  - `__tests__/setup/test-helpers.ts` - Helper file to exclude

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  npm run test -- --listTests 2>&1 | grep -E "(test-helpers|db-helpers|test-data)" | wc -l
  # Assert: Returns 0 (no helper files in test list)
  
  npm run test -- --passWithNoTests 2>&1 | grep -c "must contain at least one test"
  # Assert: Returns 0 (no such errors)
  ```

  **Commit**: YES
  - Message: `fix(test): exclude helper files from Jest test matching`
  - Files: `jest.config.js`
  - Pre-commit: `npm run test -- --listTests`

---

- [ ] 2. Create Global Mock Setup for External Services

  **What to do**:
  - Update `jest.setup.js` to add:
    1. Fetch polyfill for Stripe SDK:
       ```javascript
       // Polyfill fetch for Stripe SDK
       if (typeof global.fetch === 'undefined') {
         global.fetch = jest.fn(() => Promise.resolve({
           ok: true,
           json: () => Promise.resolve({}),
         }));
       }
       ```
    2. Global Stripe mock:
       ```javascript
       // Mock Stripe SDK globally
       jest.mock('stripe', () => {
         const mockStripe = {
           paymentIntents: {
             create: jest.fn(),
             retrieve: jest.fn(),
             confirm: jest.fn(),
           },
           refunds: { create: jest.fn() },
           customers: { list: jest.fn(), create: jest.fn() },
           webhooks: { constructEvent: jest.fn() },
           checkout: { sessions: { create: jest.fn() } },
           billingPortal: { sessions: { create: jest.fn() } },
           subscriptions: {
             retrieve: jest.fn(),
             update: jest.fn(),
             cancel: jest.fn(),
           },
         };
         return {
           __esModule: true,
           default: jest.fn(() => mockStripe),
         };
       });
       ```

  **Must NOT do**:
  - Do not remove existing mocks (Next.js router, env vars)
  - Do not modify mockFetch utility function

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Setup file modification with known patterns
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 5, 6, 7
  - **Blocked By**: None (can start immediately)

  **References**:
  - `jest.setup.js:1-94` - Current setup file
  - `lib/payment/stripe.ts:27` - Where Stripe is instantiated
  - `src/lib/subscriptions/stripe.ts:14-20` - Where env check throws
  - Stripe SDK documentation for mock shape

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  node -e "require('./jest.setup.js')" 2>&1
  # Assert: No errors, file loads successfully
  
  grep -c "jest.mock('stripe'" jest.setup.js
  # Assert: Returns 1 (mock is present)
  ```

  **Commit**: YES
  - Message: `fix(test): add global Stripe mock and fetch polyfill to jest setup`
  - Files: `jest.setup.js`
  - Pre-commit: `node -e "require('./jest.setup.js')"`

---

- [ ] 3. Fix test-helpers.ts TypeScript Errors

  **What to do**:
  - Fix LSP errors in `__tests__/utils/test-helpers.ts`:
    1. Remove `SellerProfile` import (doesn't exist in current schema)
    2. Fix `MockUser.emailVerified` type (should be `Date | null`, not `boolean`)
    3. Remove `businessEmail` from `MockSellerProfile` (not in schema)
    4. Add explicit return types to avoid circular reference errors
  - Align mock data factories with current Prisma schema

  **Must NOT do**:
  - Do not modify Prisma schema to match test helpers
  - Do not remove mock functions (they're used by other tests)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: TypeScript fixes with clear error messages
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6)
  - **Blocks**: Task 9
  - **Blocked By**: Task 1

  **References**:
  - `__tests__/utils/test-helpers.ts:8` - SellerProfile import to remove
  - `__tests__/utils/test-helpers.ts:41` - emailVerified type fix
  - `__tests__/utils/test-helpers.ts:60` - businessEmail to remove
  - `prisma/schema.prisma` - Current schema definition for reference

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  npx tsc --noEmit __tests__/utils/test-helpers.ts 2>&1
  # Assert: Exit code 0, no TypeScript errors
  ```

  **Commit**: YES
  - Message: `fix(test): resolve TypeScript errors in test-helpers.ts`
  - Files: `__tests__/utils/test-helpers.ts`
  - Pre-commit: `npx tsc --noEmit __tests__/utils/test-helpers.ts`

---

- [ ] 4. Fix db-helpers.ts TypeScript Errors

  **What to do**:
  - Fix LSP errors in `__tests__/utils/db-helpers.ts`:
    1. `sellerProfile` -> `seller_profile` or remove if not in schema
    2. `sellerId` -> `seller_id` (snake_case in Prisma)
    3. Fix OrderStatus enum values
    4. Fix SettlementStatus enum values
    5. Fix verification level type (number, not string)
    6. Fix VerificationStatus enum values
  - Check Prisma schema for exact field names and types

  **Must NOT do**:
  - Do not modify Prisma schema
  - Do not create actual database connections in tests

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: TypeScript fixes with schema reference
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5, 6)
  - **Blocks**: Task 9
  - **Blocked By**: Task 1

  **References**:
  - `__tests__/utils/db-helpers.ts:55` - sellerProfile reference
  - `__tests__/utils/db-helpers.ts:101` - sellerProfile.create
  - `__tests__/utils/db-helpers.ts:133` - sellerId field
  - `__tests__/utils/db-helpers.ts:169` - OrderStatus type
  - `__tests__/utils/db-helpers.ts:193` - SettlementStatus type
  - `__tests__/utils/db-helpers.ts:218-219` - Verification fields
  - `prisma/schema.prisma` - Current schema for exact names

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  npx tsc --noEmit __tests__/utils/db-helpers.ts 2>&1
  # Assert: Exit code 0, no TypeScript errors
  ```

  **Commit**: YES
  - Message: `fix(test): resolve TypeScript errors in db-helpers.ts`
  - Files: `__tests__/utils/db-helpers.ts`
  - Pre-commit: `npx tsc --noEmit __tests__/utils/db-helpers.ts`

---

- [ ] 5. Fix stripe.test.ts Mock Pattern

  **What to do**:
  - Rewrite mock setup in `__tests__/lib/payment/stripe.test.ts`:
    1. Remove manual `mockStripe = (provider as any).stripe = {...}` pattern
    2. Use the global Stripe mock from jest.setup.js
    3. Access mock through `jest.mocked()` pattern:
       ```typescript
       import Stripe from 'stripe';
       const MockedStripe = jest.mocked(Stripe);
       
       beforeEach(() => {
         const mockStripeInstance = MockedStripe.mock.results[0]?.value;
         // Reset mocks
         mockStripeInstance.customers.list.mockReset();
         // etc.
       });
       ```
    4. Or use `jest.requireMock('stripe')` to get mock instance

  **Must NOT do**:
  - Do not modify the StripeProvider class
  - Do not change test assertions (only fix mock setup)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex mock pattern refactoring
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 6)
  - **Blocks**: Task 7, Task 9
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `__tests__/lib/payment/stripe.test.ts:18-44` - Current broken mock setup
  - `jest.setup.js` - Global Stripe mock (from Task 2)
  - `lib/payment/stripe.ts:27-30` - Module-level Stripe instantiation
  - Jest docs: `jest.mocked()` utility

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  npm run test -- __tests__/lib/payment/stripe.test.ts 2>&1
  # Assert: Exit code 0, all tests pass
  # Assert: No "mockResolvedValue is not a function" errors
  ```

  **Commit**: YES
  - Message: `fix(test): rewrite Stripe mock pattern in stripe.test.ts`
  - Files: `__tests__/lib/payment/stripe.test.ts`
  - Pre-commit: `npm run test -- __tests__/lib/payment/stripe.test.ts`

---

- [ ] 6. Fix product-search.test.ts Prisma Mock

  **What to do**:
  - Fix Prisma mock in `__tests__/integration/api/product-search.test.ts`:
    1. Check how `lib/services/product-search.ts` imports Prisma
    2. If it uses `import { prisma } from '../prisma'` (relative), mock that exact path
    3. Or change the mock to match both named and default exports:
       ```typescript
       jest.mock('@/lib/prisma', () => {
         const mockPrisma = {
           product: {
             findMany: jest.fn(),
             count: jest.fn(),
             groupBy: jest.fn(),
             aggregate: jest.fn(),
           },
         };
         return {
           __esModule: true,
           prisma: mockPrisma,
           default: mockPrisma,
         };
       });
       ```
    4. Ensure mock functions are properly typed for Jest

  **Must NOT do**:
  - Do not modify lib/services/product-search.ts
  - Do not change test assertions

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Module resolution debugging required
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 5)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `__tests__/integration/api/product-search.test.ts:18-28` - Current mock setup
  - `lib/services/product-search.ts` - How Prisma is imported
  - `lib/prisma.ts` - Prisma client export pattern
  - Jest docs: Module mocking with ES modules

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  npm run test -- __tests__/integration/api/product-search.test.ts 2>&1
  # Assert: Exit code 0, all tests pass
  # Assert: No "is not a function" errors
  ```

  **Commit**: YES
  - Message: `fix(test): correct Prisma mock module path in product-search.test.ts`
  - Files: `__tests__/integration/api/product-search.test.ts`
  - Pre-commit: `npm run test -- __tests__/integration/api/product-search.test.ts`

---

- [ ] 7. Fix subscriptions.test.ts - Add Stripe Mock

  **What to do**:
  - Add Stripe mock to `__tests__/integration/subscriptions.test.ts`:
    1. Mock `@/src/lib/subscriptions/stripe` module to avoid env check:
       ```typescript
       jest.mock('@/src/lib/subscriptions/stripe', () => ({
         StripeSubscriptionService: {
           createCheckoutSession: jest.fn(),
           createPortalSession: jest.fn(),
           // ... other methods
         },
         stripe: {},
       }));
       ```
    2. Or ensure STRIPE_SECRET_KEY is set in test environment before import
    3. The test currently imports from `@/src/lib/subscriptions` which re-exports stripe module
    4. Verify PlanService and SubscriptionService work without actual Stripe

  **Must NOT do**:
  - Do not use real Stripe API keys
  - Do not modify subscription service implementation

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Integration test with complex module dependencies
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 8)
  - **Blocks**: Task 9
  - **Blocked By**: Task 5

  **References**:
  - `__tests__/integration/subscriptions.test.ts:7-12` - Current imports
  - `src/lib/subscriptions/index.ts` - Re-exports stripe module
  - `src/lib/subscriptions/stripe.ts:14-16` - Env check that throws
  - `jest.setup.js` - Global Stripe mock (may need extension)

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  npm run test -- __tests__/integration/subscriptions.test.ts 2>&1
  # Assert: Exit code 0, all tests pass
  # Assert: No "fetch() function not provided" errors
  # Assert: No "STRIPE_SECRET_KEY is not defined" errors
  ```

  **Commit**: YES
  - Message: `fix(test): add Stripe mock to subscriptions.test.ts`
  - Files: `__tests__/integration/subscriptions.test.ts`
  - Pre-commit: `npm run test -- __tests__/integration/subscriptions.test.ts`

---

- [ ] 8. Update Coverage Threshold to 85%

  **What to do**:
  - Update `jest.config.js` coverage thresholds:
    ```javascript
    coverageThreshold: {
      global: {
        branches: 85,
        functions: 85,
        lines: 85,
        statements: 85,
      },
    },
    ```

  **Must NOT do**:
  - Do not lower any threshold
  - Do not remove coverage collection

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple config change
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 7)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - `jest.config.js:52-60` - Current coverage thresholds
  - `README.md` - Documents 85% goal

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  grep -A4 "coverageThreshold" jest.config.js | grep -c "85"
  # Assert: Returns 4 (all metrics at 85)
  ```

  **Commit**: YES
  - Message: `chore(test): update coverage threshold to 85%`
  - Files: `jest.config.js`
  - Pre-commit: N/A (config only)

---

- [ ] 9. Run Full Test Suite and Verify

  **What to do**:
  - Run complete test suite and verify all criteria:
    1. `npm run test` - All tests pass
    2. `npm run test:coverage` - Coverage ≥85%
    3. `npm run build` - Build succeeds
    4. `npx tsc --noEmit` - No TypeScript errors
  - If any failures, diagnose and fix
  - Document final test results

  **Must NOT do**:
  - Do not skip tests to make suite pass
  - Do not lower coverage threshold if not met

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Final verification may require debugging
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 3, 4, 5, 6, 7, 8

  **References**:
  - `package.json:26-39` - Test scripts
  - All fixed test files from previous tasks

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  npm run test 2>&1
  # Assert: Exit code 0
  # Assert: Output contains "Tests:.*passed"

  npm run test:coverage 2>&1 | tail -20
  # Assert: All metrics ≥85%

  npm run build 2>&1
  # Assert: Exit code 0

  npx tsc --noEmit 2>&1
  # Assert: Exit code 0
  ```

  **Evidence to Capture:**
  - Terminal output from `npm run test`
  - Coverage summary table
  - Build success message

  **Commit**: YES (if any additional fixes needed)
  - Message: `test: all tests passing with 85%+ coverage`
  - Files: Any additional fixes
  - Pre-commit: `npm run test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(test): exclude helper files from Jest test matching` | jest.config.js | npm run test -- --listTests |
| 2 | `fix(test): add global Stripe mock and fetch polyfill` | jest.setup.js | node -e "require('./jest.setup.js')" |
| 3 | `fix(test): resolve TypeScript errors in test-helpers.ts` | __tests__/utils/test-helpers.ts | tsc --noEmit |
| 4 | `fix(test): resolve TypeScript errors in db-helpers.ts` | __tests__/utils/db-helpers.ts | tsc --noEmit |
| 5 | `fix(test): rewrite Stripe mock pattern` | __tests__/lib/payment/stripe.test.ts | npm test [file] |
| 6 | `fix(test): correct Prisma mock module path` | __tests__/integration/api/product-search.test.ts | npm test [file] |
| 7 | `fix(test): add Stripe mock to subscriptions test` | __tests__/integration/subscriptions.test.ts | npm test [file] |
| 8 | `chore(test): update coverage threshold to 85%` | jest.config.js | grep check |
| 9 | `test: all tests passing with 85%+ coverage` | any remaining | npm run test |

---

## Success Criteria

### Verification Commands
```bash
# All tests pass
npm run test
# Expected: exit 0, "Tests: X passed"

# Coverage meets threshold
npm run test:coverage
# Expected: All metrics ≥85%

# Build succeeds
npm run build
# Expected: exit 0

# No TypeScript errors
npx tsc --noEmit
# Expected: exit 0
```

### Final Checklist
- [ ] All "Must Have" items present
- [ ] All "Must NOT Have" guardrails observed
- [ ] All 9 tasks completed
- [ ] Coverage ≥85% verified
- [ ] Build passes
- [ ] No TypeScript errors

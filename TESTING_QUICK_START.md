# Testing Quick Start Guide

## Installation

All testing dependencies are already installed. If you need to reinstall:

```bash
npm install
```

**Installed Testing Packages:**
```json
{
  "devDependencies": {
    "@playwright/test": "^1.57.0",
    "@swc/jest": "^0.2.39",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.1",
    "@testing-library/user-event": "^14.6.1",
    "@types/jest": "^30.0.0",
    "jest": "^30.2.0",
    "jest-environment-jsdom": "^30.2.0",
    "lighthouse": "^13.0.1"
  }
}
```

## Running Tests

### 1. Unit & Integration Tests (Jest)

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Watch mode (auto-rerun on file changes)
npm run test:watch

# Run specific test file
npm test __tests__/unit/lib/auth.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="JWT"
```

### 2. E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI mode (recommended for debugging)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run with visible browser
npm run test:e2e:headed

# View test report
npm run test:e2e:report
```

### 3. Specific Test Categories

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Security audit tests
npm run test:security

# Performance tests
npm run test:performance
```

### 4. Complete Test Suite

```bash
# Run everything (unit + integration + E2E + security + performance)
npm run test:all
```

## Sample Test Output

### Jest Output

```
PASS __tests__/lib/services/review.test.ts
PASS __tests__/unit/lib/utils.test.ts
PASS __tests__/lib/payment/stripe.test.ts

Test Suites: 5 passed, 5 total
Tests:       104 passed, 104 total
Snapshots:   0 total
Time:        2.871 s

Coverage Summary:
---------------------------|---------|----------|---------|---------|
File                       | % Stmts | % Branch | % Funcs | % Lines |
---------------------------|---------|----------|---------|---------|
All files                  |   76.54 |    70.23 |   78.91 |   75.87 |
 app/                      |   80.12 |    75.45 |   82.34 |   79.56 |
 components/               |   74.23 |    68.91 |   76.12 |   73.45 |
 lib/                      |   81.34 |    76.23 |   83.45 |   80.67 |
---------------------------|---------|----------|---------|---------|
```

### Playwright Output

```
Running 24 tests using 5 workers

  ✓ [chromium] › auth.spec.ts:8:5 › should register new user (2.3s)
  ✓ [chromium] › auth.spec.ts:18:5 › should login existing user (1.8s)
  ✓ [firefox] › purchase.spec.ts:12:5 › should complete purchase flow (3.1s)
  ✓ [webkit] › seller.spec.ts:9:5 › should create new product (2.5s)

  24 passed (18.2s)
```

## Test Structure Examples

### Unit Test Example

```typescript
// __tests__/unit/lib/auth.test.ts
import { generateToken, verifyToken } from '@/lib/auth/jwt'

describe('JWT Authentication', () => {
  it('should generate valid token', () => {
    const payload = { userId: 'user-1', role: 'USER' }
    const token = generateToken(payload)

    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
  })

  it('should verify valid token', () => {
    const payload = { userId: 'user-1', role: 'USER' }
    const token = generateToken(payload)
    const decoded = verifyToken(token)

    expect(decoded.userId).toBe('user-1')
    expect(decoded.role).toBe('USER')
  })
})
```

### Integration Test Example

```typescript
// __tests__/integration/api/products.test.ts
import { createMockAuthRequest, createMockUser } from '@/__tests__/utils/test-helpers'

describe('Products API', () => {
  it('should create new product', async () => {
    const seller = createMockUser({ role: 'SELLER' })
    const request = createMockAuthRequest(seller, {
      method: 'POST',
      body: {
        title: 'Test Product',
        price: 10000,
        category: 'N8N_TEMPLATE'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.title).toBe('Test Product')
  })
})
```

### E2E Test Example

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('user registration flow', async ({ page }) => {
  await page.goto('/register')

  await page.fill('input[name="email"]', 'newuser@test.com')
  await page.fill('input[name="password"]', 'Test123!@#')
  await page.fill('input[name="name"]', 'New User')

  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
})
```

## Using Test Utilities

### Mock Data Factories

```typescript
import {
  createMockUser,
  createMockProduct,
  createMockOrder
} from '@/__tests__/utils/test-helpers'

const user = createMockUser({ role: 'SELLER' })
const product = createMockProduct({ sellerId: user.id, price: 50000 })
const order = createMockOrder({ buyerId: 'buyer-1', productId: product.id })
```

### Database Seeding

```typescript
import { seedTestDatabase, cleanDatabase } from '@/__tests__/utils/db-helpers'

beforeAll(async () => {
  const testData = await seedTestDatabase()
  // testData contains: users, products, orders, etc.
})

afterAll(async () => {
  await cleanDatabase()
})
```

### Mock Authentication

```typescript
import { createMockAuthRequest, createMockAuthToken } from '@/__tests__/utils/test-helpers'

const user = createMockUser({ role: 'ADMIN' })
const token = createMockAuthToken(user)
const request = createMockAuthRequest(user, {
  method: 'GET',
  url: '/api/admin/users'
})
```

## Coverage Reports

### Generate HTML Coverage Report

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### Coverage Summary in Terminal

```bash
npm run test:coverage -- --coverage --coverageReporters=text
```

### Check Specific File Coverage

```bash
npm test -- --coverage --collectCoverageFrom="lib/auth/**/*.ts"
```

## Debugging Tests

### Debug Jest Tests in VSCode

1. Add breakpoint in test file
2. Press F5 or "Run > Start Debugging"
3. Select "Jest: Current File" configuration

### Debug Playwright Tests in VSCode

1. Add breakpoint in E2E test
2. Press F5 or "Run > Start Debugging"
3. Select "Playwright: Debug" configuration

### Debug in Terminal

```bash
# Jest with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Playwright with debug mode
npm run test:e2e:debug
```

## Common Commands Cheatsheet

| Command | Description |
|---------|-------------|
| `npm test` | Run all Jest tests |
| `npm run test:watch` | Watch mode for Jest |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run test:all` | Run complete test suite |
| `npm test -- --testNamePattern="pattern"` | Run tests matching pattern |
| `npm run test:e2e -- --project=chromium` | Run E2E on specific browser |

## Continuous Integration

Tests run automatically on:
- Push to main/develop branches
- Pull request creation
- Scheduled daily runs (security tests)

**CI Configuration:** `.github/workflows/test.yml`

## Troubleshooting

### Issue: Tests fail with "Cannot find module"

**Solution:** Regenerate Jest module mapper
```bash
npm run db:generate
npm test
```

### Issue: Playwright can't find browsers

**Solution:** Install Playwright browsers
```bash
npx playwright install
```

### Issue: Database connection errors

**Solution:** Update DATABASE_URL in `.env` or use test database
```bash
export DATABASE_URL="postgresql://test:test@localhost:5432/test"
```

### Issue: Port 3000 already in use

**Solution:** Stop existing Next.js dev server or change port in `playwright.config.ts`

## Next Steps

1. ✅ Run `npm test` to verify Jest setup
2. ✅ Run `npm run test:coverage` to check coverage
3. ✅ Run `npm run test:e2e:ui` to verify Playwright setup
4. 📝 Write tests for new features
5. 🎯 Maintain 80%+ code coverage

## Resources

- Full Documentation: `TESTING_INFRASTRUCTURE_COMPLETE.md`
- Test Implementation Report: `__tests__/TEST_IMPLEMENTATION_REPORT.md`
- Jest Documentation: https://jestjs.io/
- Playwright Documentation: https://playwright.dev/
- React Testing Library: https://testing-library.com/

## Support

For testing questions or issues:
1. Check `TESTING_INFRASTRUCTURE_COMPLETE.md` for detailed documentation
2. Review test examples in `__tests__/` directory
3. Check CI/CD logs in `.github/workflows/`
4. Create issue with test failure details

# CI/CD Pipeline - AI Marketplace

> Automated testing, quality gates, and deployment pipeline using GitHub Actions and Vercel

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Workflow Details](#workflow-details)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Overview

This project implements a production-ready CI/CD pipeline with:

- ✅ **Automated Testing**: Unit tests + E2E tests with 80% coverage requirement
- ✅ **Code Quality**: ESLint, Prettier, TypeScript validation
- ✅ **Database Integrity**: Prisma migration validation
- ✅ **Security Audits**: Dependency vulnerability scanning
- ✅ **Automated Deployment**: Zero-downtime deployment to Vercel
- ✅ **Post-deployment Verification**: Smoke tests and health checks
- ✅ **Automatic Rollback**: Failed deployments rollback automatically

## Features

### Pull Request Validation

Every PR automatically runs:

1. **Lint & Format Check** (10 min)
   - ESLint code quality
   - Prettier formatting
   - TypeScript type checking

2. **Unit Tests** (15 min)
   - Jest test suite
   - 80% coverage enforcement
   - Coverage upload to Codecov

3. **Database Migration** (10 min)
   - PostgreSQL container setup
   - Prisma migration validation
   - Schema integrity check

4. **Build Verification** (15 min)
   - Next.js production build
   - Build artifact upload
   - Size analysis

5. **E2E Tests** (20 min)
   - Playwright cross-browser testing
   - Chrome, Firefox, Safari, Mobile
   - Visual regression testing

6. **Security Audit** (10 min)
   - npm audit for vulnerabilities
   - Outdated dependency check

### Production Deployment

Automatic deployment on merge to `main`:

1. **Pre-deployment Checks** (15 min)
   - Full test suite execution
   - Commit message validation
   - Skip deployment with `[skip ci]`

2. **Database Migration** (10 min)
   - Production Supabase migration
   - Schema validation
   - Seed scripts execution

3. **Vercel Deployment** (15 min)
   - Production build
   - Environment variable injection
   - Deployment URL generation

4. **Post-deployment Tests** (15 min)
   - Smoke test suite
   - Health check endpoint validation
   - Critical flow verification

5. **Rollback (on failure)** (10 min)
   - Automatic rollback to previous version
   - Team notification
   - Incident logging

## Quick Start

### 1. Initial Setup

```bash
# Install dependencies
pnpm install

# Setup pre-commit hooks
pnpm prepare

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values
```

### 2. Configure GitHub Secrets

Add these secrets in GitHub repository settings:

```
Settings → Secrets and variables → Actions → New repository secret
```

Required secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `PRODUCTION_URL`
- `E2E_USER_EMAIL`
- `E2E_USER_PASSWORD`

### 3. Test the Pipeline

```bash
# Create test branch
git checkout -b test/ci-pipeline

# Make a change
echo "# Test CI" > test.md
git add test.md
git commit -m "test: verify CI pipeline"
git push origin test/ci-pipeline

# Create PR and watch CI run
```

## Workflow Details

### CI Workflow (`.github/workflows/ci.yml`)

**Trigger:** Pull requests to `main` or `develop`

**Concurrency:** Cancels previous runs for same PR

**Jobs:**
```yaml
lint-and-format     → Code quality checks
unit-tests          → Jest with coverage
database-migration  → Prisma validation
build               → Next.js production build
e2e-tests           → Playwright testing
security            → Vulnerability scanning
pr-report           → Summary generation
```

### Deploy Workflow (`.github/workflows/deploy.yml`)

**Trigger:** Push to `main` or manual dispatch

**Environment:** Production

**Jobs:**
```yaml
pre-deploy-checks       → Full validation
migrate-database        → Supabase migrations
deploy-vercel           → Production deployment
post-deploy-verification → Smoke tests
rollback-on-failure     → Automatic rollback
deployment-summary      → Results aggregation
```

## Configuration

### Test Configuration

#### Jest (`jest.config.js`)
```javascript
{
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

#### Playwright (`playwright.config.ts`)
```typescript
{
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
    { name: 'Mobile Chrome' },
    { name: 'Mobile Safari' }
  ]
}
```

### ESLint (`.eslintrc.json`)
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ]
}
```

### Prettier (`.prettierrc`)
```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## Testing

### Run Tests Locally

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e

# E2E with UI
pnpm test:e2e:ui

# Smoke tests
pnpm test:smoke
```

### Writing Tests

#### Unit Test Example

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

#### E2E Test Example

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

## Deployment

### Automatic Deployment

1. Create feature branch
2. Make changes and commit
3. Create PR to `main`
4. Wait for CI checks to pass
5. Merge PR → Automatic deployment

### Manual Deployment

```bash
# Via GitHub CLI
gh workflow run deploy.yml

# Via GitHub UI
Actions → Deploy to Production → Run workflow
```

### Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] Database migrations are ready
- [ ] Environment variables are configured
- [ ] Breaking changes are documented
- [ ] Rollback plan is prepared
- [ ] Team is notified
- [ ] Monitoring is active

## Monitoring

### CI/CD Monitoring

- **GitHub Actions Dashboard**: View workflow runs
- **Codecov**: Track test coverage
- **Vercel Dashboard**: Monitor deployments

### Production Monitoring

- **Health Endpoint**: `https://your-domain.com/api/health`
- **Vercel Analytics**: Real-time metrics
- **Error Tracking**: Configure Sentry/Bugsnag

### Alerts

Configure GitHub Actions notifications:
```
Settings → Notifications → Actions
```

## Troubleshooting

### Common Issues

#### 1. CI Tests Fail But Pass Locally

```bash
# Run tests in CI mode
CI=true pnpm test

# Check environment variables
NODE_ENV=test pnpm test
```

#### 2. Build Fails in CI

```bash
# Test production build locally
pnpm build

# Check for missing environment variables
SKIP_ENV_VALIDATION=false pnpm build
```

#### 3. Database Migration Fails

```bash
# Validate schema
pnpm prisma:validate

# Check migration status
pnpm prisma:migrate:status

# Create new migration
pnpm prisma:migrate:dev --name fix_issue
```

#### 4. Coverage Below 80%

```bash
# Generate coverage report
pnpm test:coverage

# View detailed report
open coverage/lcov-report/index.html

# Add tests for uncovered code
```

#### 5. Deployment Fails

**Check Vercel Logs:**
1. Go to Vercel dashboard
2. Select deployment
3. View build logs
4. Check runtime logs

**Common fixes:**
- Verify environment variables
- Check build command
- Review error messages
- Test build locally

### Debug Commands

```bash
# View workflow logs
gh run list
gh run view <run-id>

# Check deployment status
vercel ls

# View production logs
vercel logs <deployment-url>

# Inspect database
pnpm prisma:studio
```

## Best Practices

### Commit Messages

Use conventional commits:
```
feat: add new feature
fix: fix bug
docs: update documentation
test: add tests
refactor: refactor code
chore: update dependencies
```

### Branch Strategy

- `main` - Production
- `develop` - Integration
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

### PR Guidelines

- Keep PRs small and focused
- Write descriptive titles and descriptions
- Link related issues
- Wait for all checks before merging
- Request code reviews

### Testing Guidelines

- Write tests for all new features
- Maintain 80%+ coverage
- Include E2E tests for critical flows
- Use meaningful test descriptions
- Mock external dependencies

## Resources

### Documentation

- [Full CI/CD Setup Guide](./docs/CI-CD-SETUP.md)
- [Quick Start Guide](./docs/QUICK-START.md)
- [Project PRD](./AI_Marketplace_PRD.md)

### External Links

- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [Playwright](https://playwright.dev)
- [Jest](https://jestjs.io)

### Support

- **Issues**: Create GitHub issue
- **Discussions**: GitHub Discussions
- **Team**: Contact DevOps team

---

## File Structure

```
.github/
├── workflows/
│   ├── ci.yml           # PR validation workflow
│   └── deploy.yml       # Production deployment workflow

docs/
├── CI-CD-SETUP.md       # Comprehensive setup guide
└── QUICK-START.md       # Quick reference

e2e/
└── example.spec.ts      # E2E test examples

scripts/
└── check-coverage.js    # Coverage validation script

app/
└── api/
    └── health/
        └── route.ts     # Health check endpoint

Configuration:
├── jest.config.js       # Jest configuration
├── jest.setup.js        # Jest setup file
├── playwright.config.ts # Playwright configuration
├── tsconfig.json        # TypeScript configuration
├── .eslintrc.json       # ESLint rules
├── .prettierrc          # Prettier formatting
└── package.json         # Scripts and dependencies
```

---

**Last Updated:** 2024-12-27
**Version:** 1.0.0
**Maintained by:** DevOps Team

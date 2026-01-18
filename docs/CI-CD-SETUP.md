# CI/CD Pipeline Documentation

## Overview

This project uses **GitHub Actions** for automated CI/CD pipeline with comprehensive testing, quality gates, and deployment to Vercel.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Pull Request Flow                         │
├─────────────────────────────────────────────────────────────────┤
│ 1. Lint & Format Check → ESLint + Prettier + TypeScript        │
│ 2. Unit Tests → Jest with 80% coverage requirement             │
│ 3. Database Migration → Prisma migration validation            │
│ 4. Build Verification → Next.js production build               │
│ 5. E2E Tests → Playwright cross-browser testing                │
│ 6. Security Audit → npm audit + dependency check               │
│ 7. PR Quality Report → Summary of all checks                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Production Deployment                       │
├─────────────────────────────────────────────────────────────────┤
│ 1. Pre-deployment Checks → All tests must pass                 │
│ 2. Database Migration → Apply Prisma migrations                │
│ 3. Vercel Deployment → Build and deploy to production          │
│ 4. Post-deployment Tests → Smoke tests and health checks       │
│ 5. Rollback (if failure) → Automatic rollback on error         │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow Files

### 1. `.github/workflows/ci.yml` - Pull Request Validation

**Triggers:**
- Pull requests to `main` or `develop` branches
- Pushes to `develop` branch

**Jobs:**

#### 1.1 Lint & Format Check
- Runs ESLint for code quality
- Checks Prettier formatting
- Validates TypeScript types
- **Timeout:** 10 minutes

#### 1.2 Unit Tests
- Runs Jest unit tests
- Enforces 80% coverage threshold
- Uploads coverage to Codecov
- **Timeout:** 15 minutes

#### 1.3 Database Migration
- Spins up PostgreSQL container
- Runs Prisma migrations
- Validates schema integrity
- **Timeout:** 10 minutes

#### 1.4 Build Verification
- Builds Next.js production bundle
- Checks build size
- Uploads build artifacts
- **Timeout:** 15 minutes

#### 1.5 E2E Tests
- Installs Playwright browsers
- Runs cross-browser tests
- Generates test reports
- **Timeout:** 20 minutes

#### 1.6 Security Audit
- Runs `pnpm audit` for vulnerabilities
- Checks outdated dependencies
- **Timeout:** 10 minutes

#### 1.7 PR Quality Report
- Aggregates all job results
- Generates summary report
- Fails if any required check fails

### 2. `.github/workflows/deploy.yml` - Production Deployment

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Jobs:**

#### 2.1 Pre-deployment Checks
- Validates commit messages
- Runs full test suite
- Prevents deployment with `[skip ci]`
- **Timeout:** 15 minutes

#### 2.2 Database Migration
- Connects to production Supabase
- Applies Prisma migrations
- Runs production seed scripts
- **Timeout:** 10 minutes

#### 2.3 Vercel Deployment
- Pulls Vercel environment config
- Builds production artifacts
- Deploys to Vercel
- Posts deployment URL to commit
- **Timeout:** 15 minutes

#### 2.4 Post-deployment Tests
- Runs smoke tests on production
- Performs health check
- Validates critical user flows
- **Timeout:** 15 minutes

#### 2.5 Rollback (on failure)
- Automatically triggers on test failure
- Promotes previous stable deployment
- Notifies team of rollback
- **Timeout:** 10 minutes

## Required GitHub Secrets

Add the following secrets to your GitHub repository:

### Vercel Secrets
```bash
VERCEL_TOKEN           # Vercel deployment token
VERCEL_ORG_ID          # Vercel organization ID
VERCEL_PROJECT_ID      # Vercel project ID
```

### Database Secrets
```bash
DATABASE_URL           # Production database connection string
```

### Supabase Secrets
```bash
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY         # Supabase service role key
```

### Payment Secrets
```bash
STRIPE_SECRET_KEY                  # Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY # Stripe publishable key
TOSS_SECRET_KEY                    # Toss Payments secret key
```

### Cache Secrets
```bash
UPSTASH_REDIS_URL                  # Upstash Redis URL
UPSTASH_REDIS_TOKEN                # Upstash Redis token
```

### Test Secrets
```bash
PRODUCTION_URL         # Production URL for smoke tests
E2E_USER_EMAIL         # Test user email for E2E tests
E2E_USER_PASSWORD      # Test user password for E2E tests
```

## Local Development

### Initial Setup

```bash
# Install dependencies
pnpm install

# Setup Husky for pre-commit hooks
pnpm prepare

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate:dev

# Seed development database
pnpm db:seed
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run smoke tests only
pnpm test:smoke
```

### Code Quality

```bash
# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check formatting
pnpm format:check

# Format code
pnpm format

# Type check
pnpm type-check
```

### Database Management

```bash
# Open Prisma Studio
pnpm prisma:studio

# Create new migration
pnpm prisma:migrate:dev --name migration_name

# Apply migrations
pnpm prisma:migrate:deploy

# Check migration status
pnpm prisma:migrate:status

# Validate schema
pnpm prisma:validate

# Reset database (⚠️ Danger!)
pnpm db:reset
```

## Quality Gates

All PRs must pass the following quality gates:

### 1. Code Quality
- ✅ ESLint passes with no errors
- ✅ Prettier formatting is correct
- ✅ TypeScript compiles without errors
- ✅ No console.log statements (except console.warn/error)

### 2. Test Coverage
- ✅ Unit test coverage ≥ 80% (branches, functions, lines, statements)
- ✅ All unit tests pass
- ✅ All E2E tests pass

### 3. Build Verification
- ✅ Next.js production build succeeds
- ✅ No build warnings or errors
- ✅ Build size within acceptable limits

### 4. Database Integrity
- ✅ Prisma migrations apply successfully
- ✅ Schema validation passes
- ✅ No migration conflicts

### 5. Security
- ✅ No high/critical vulnerabilities in dependencies
- ✅ Security audit passes

## Pre-commit Hooks

Husky and lint-staged ensure code quality before commits:

```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,css}": [
    "prettier --write"
  ]
}
```

## Coverage Thresholds

Jest is configured to enforce 80% coverage:

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

## Environment Variables

### Development (.env.local)
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/marketplace_dev"

# Supabase (Development)
NEXT_PUBLIC_SUPABASE_URL="https://dev.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="dev-anon-key"
SUPABASE_SERVICE_ROLE_KEY="dev-service-key"

# Stripe (Test Mode)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Upstash Redis
UPSTASH_REDIS_URL="redis://localhost:6379"
UPSTASH_REDIS_TOKEN="local-token"
```

### Production (Vercel Environment Variables)
All production secrets should be configured in Vercel dashboard under:
- Settings → Environment Variables

## Deployment Process

### Automatic Deployment (Recommended)

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push and create PR: `git push origin feature/your-feature`
4. Wait for CI checks to pass
5. Merge to `main` → Automatic deployment to production

### Manual Deployment

```bash
# Trigger manual deployment
gh workflow run deploy.yml
```

## Troubleshooting

### CI Tests Failing

**Problem:** Unit tests fail in CI but pass locally

**Solution:**
```bash
# Run tests in CI mode locally
CI=true pnpm test

# Check for environment-specific issues
NODE_ENV=test pnpm test
```

### Build Failures

**Problem:** Next.js build fails in CI

**Solution:**
```bash
# Run production build locally
pnpm build

# Check build output
ls -la .next/
```

### Database Migration Issues

**Problem:** Migrations fail in CI

**Solution:**
```bash
# Validate schema locally
pnpm prisma:validate

# Check migration status
pnpm prisma:migrate:status

# Generate new migration
pnpm prisma:migrate:dev --name fix_issue
```

### Coverage Threshold Failures

**Problem:** Coverage below 80%

**Solution:**
```bash
# Run coverage report
pnpm test:coverage

# Check specific coverage
pnpm test -- --coverage --collectCoverageFrom="src/path/to/file.ts"

# View detailed HTML report
open coverage/lcov-report/index.html
```

## Best Practices

### 1. Commit Messages
Use conventional commits:
```
feat: add new feature
fix: fix bug
docs: update documentation
test: add tests
refactor: refactor code
chore: update dependencies
```

### 2. Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `hotfix/*` - Production hotfixes

### 3. PR Guidelines
- Keep PRs small and focused
- Write descriptive PR descriptions
- Link related issues
- Wait for all checks to pass
- Request reviews from team members

### 4. Testing Guidelines
- Write tests for new features
- Maintain 80%+ coverage
- Include E2E tests for critical flows
- Use data-testid attributes for E2E selectors

### 5. Security Guidelines
- Never commit secrets or API keys
- Use environment variables
- Keep dependencies up to date
- Run security audits regularly

## Monitoring & Alerts

### CI/CD Monitoring
- GitHub Actions dashboard
- Vercel deployment logs
- Codecov coverage reports

### Production Monitoring
- Vercel Analytics
- Error tracking (configure Sentry/Bugsnag)
- Performance monitoring
- Health check endpoint: `/api/health`

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Prisma](https://www.prisma.io/docs)
- [Playwright](https://playwright.dev/docs/intro)

### Getting Help
- Create issue in GitHub repository
- Check GitHub Actions logs
- Review Vercel deployment logs
- Consult team Slack/Discord

---

**Last Updated:** 2024-12-27
**Maintained by:** DevOps Team

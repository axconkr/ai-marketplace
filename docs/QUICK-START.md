# Quick Start Guide - CI/CD Pipeline

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+ (for local development)
- GitHub account
- Vercel account

## Setup Steps

### 1. Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd AI_marketplace

# Install dependencies
pnpm install

# Setup git hooks
pnpm prepare
```

### 2. Configure Environment

Create `.env.local`:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/marketplace_dev"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Setup Database

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate:dev

# Seed database
pnpm db:seed
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## GitHub Secrets Setup

### Step 1: Get Vercel Tokens

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Get project details
vercel project ls
```

### Step 2: Add Secrets to GitHub

1. Go to repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
DATABASE_URL=<production-database-url>
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-key>
STRIPE_SECRET_KEY=<stripe-secret>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe-public>
PRODUCTION_URL=https://your-domain.com
E2E_USER_EMAIL=test@example.com
E2E_USER_PASSWORD=test-password
```

## Testing the Pipeline

### Test PR Workflow

```bash
# Create feature branch
git checkout -b test/ci-pipeline

# Make a change
echo "# Test" > test.md

# Commit and push
git add test.md
git commit -m "test: verify CI pipeline"
git push origin test/ci-pipeline

# Create PR on GitHub
# Watch CI checks run automatically
```

### Test Deployment Workflow

```bash
# Merge PR to main
# Or push directly to main (not recommended)
git checkout main
git merge test/ci-pipeline
git push origin main

# Watch deployment on GitHub Actions
# Check Vercel dashboard for deployment status
```

## Common Commands

### Development

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
```

### Testing

```bash
pnpm test            # Run all tests
pnpm test:unit       # Run unit tests
pnpm test:e2e        # Run E2E tests
pnpm test:coverage   # Run with coverage
```

### Code Quality

```bash
pnpm lint            # Run linter
pnpm lint:fix        # Fix linting issues
pnpm format          # Format code
pnpm type-check      # Check TypeScript
```

### Database

```bash
pnpm prisma:studio              # Open database GUI
pnpm prisma:migrate:dev         # Create/apply migrations
pnpm db:seed                    # Seed database
```

## Troubleshooting

### CI Fails on First Run

**Problem:** Tests fail because database isn't seeded

**Solution:**
```bash
# Ensure seed script exists
pnpm db:seed

# Commit and push
git add .
git commit -m "fix: add database seed"
git push
```

### Vercel Deployment Fails

**Problem:** Missing environment variables

**Solution:**
1. Go to Vercel dashboard
2. Project Settings → Environment Variables
3. Add all required variables
4. Redeploy

### Coverage Threshold Not Met

**Problem:** New code not covered by tests

**Solution:**
```bash
# Check coverage report
pnpm test:coverage

# Add tests for uncovered code
# Commit and push
```

## Next Steps

1. ✅ Verify CI pipeline works
2. ✅ Add comprehensive tests
3. ✅ Configure production environment
4. ✅ Setup monitoring (Sentry, Analytics)
5. ✅ Configure notifications (Slack/Discord)
6. ✅ Document deployment process
7. ✅ Train team on workflow

## Resources

- [Full CI/CD Documentation](./CI-CD-SETUP.md)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Project PRD](../AI_Marketplace_PRD.md)

---

**Need help?** Create an issue or contact the team.

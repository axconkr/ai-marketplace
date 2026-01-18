# Docker-Based Test Environment Setup - Complete Summary

## Overview

A comprehensive Docker-based test environment has been configured for the AI Marketplace project, enabling easy testing and development with pre-configured databases, test data, and automated setup scripts.

## What Was Created

### 1. Enhanced Docker Compose Configuration

**File**: `docker-compose.yml`

**Services Added**:
- `postgres_test`: Separate PostgreSQL instance for testing
  - Port: 5433
  - Uses tmpfs for faster test execution
  - Isolated from development database
  - Credentials: test/test/test

**Existing Services**:
- `postgres`: Development database (port 5432)
- `redis`: Cache service (port 6379)
- `adminer`: Database management UI (port 8080, optional)

### 2. Test Environment Setup Script

**File**: `scripts/setup-test-env.sh`

**Features**:
- Checks Docker availability
- Creates .env.local from .env.example if needed
- Starts all Docker containers
- Waits for services to be ready
- Runs Prisma migrations
- Generates Prisma client
- Seeds test data
- Creates uploads directory
- Provides helpful command reference

**Usage**:
```bash
./scripts/setup-test-env.sh
```

### 3. Quick Start Script

**File**: `scripts/quick-start.sh`

**Features**:
- Runs the setup script
- Automatically starts the development server
- One-command setup and launch

**Usage**:
```bash
./scripts/quick-start.sh
```

### 4. Comprehensive Testing Guide

**File**: `docs/TESTING_GUIDE.md`

**Contents**:
- Quick start instructions
- Test user credentials
- Test data overview
- Running different types of tests
- Database management commands
- Docker commands reference
- Troubleshooting guide
- Testing workflows
- Quick reference section

### 5. Updated Environment Configuration

**File**: `.env.example`

**New Variables**:
```env
DATABASE_URL="postgresql://ai_marketplace:dev_password_change_in_prod@localhost:5432/ai_marketplace"
DATABASE_URL_TEST="postgresql://test:test@localhost:5433/test"
REDIS_URL="redis://localhost:6379"
```

### 6. Package.json Updates

**New Script**:
```json
"db:seed": "tsx prisma/seed.ts"
```

**Prisma Configuration**:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

## Test Users

The existing seed script (`prisma/seed.ts`) creates comprehensive test data including:

### Users (9 total)

| Role | Email | Password | Tier/Type |
|------|-------|----------|-----------|
| Admin | admin@aimarket.com | password123 | Platform Admin |
| Seller | seller1@example.com | password123 | Master Tier |
| Seller | seller2@example.com | password123 | Pro Tier |
| Seller | seller3@example.com | password123 | Verified Tier |
| Seller | seller4@example.com | password123 | New Seller |
| Buyer | buyer1@example.com | password123 | Regular Customer |
| Buyer | buyer2@example.com | password123 | Regular Customer |
| Verifier | verifier1@example.com | password123 | Code Reviewer |
| Verifier | verifier2@example.com | password123 | Security Expert |

### Test Data Included

- **7 Products**: Including N8N templates, AI agents, apps, and prompts
- **4 Orders**: 3 completed, 1 pending
- **3 Reviews**: With seller replies
- **6 Verifications**: 5 approved (Levels 1-3), 1 pending
- **4 Notifications**: Various types
- **2 Custom Requests**: Sample project requests

## Services and Ports

| Service | Port | Purpose | Access |
|---------|------|---------|--------|
| Next.js App | 3000 | Development server | http://localhost:3000 |
| PostgreSQL (Dev) | 5432 | Development database | localhost:5432 |
| PostgreSQL (Test) | 5433 | Testing database | localhost:5433 |
| Redis | 6379 | Cache and sessions | localhost:6379 |
| Adminer | 8080 | Database UI (optional) | http://localhost:8080 |

## Quick Start Guide

### First Time Setup

```bash
# Navigate to project directory
cd /Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace

# Install dependencies (if not done)
npm install

# Install tsx for running TypeScript files
npm install --save-dev tsx

# Run quick start
./scripts/quick-start.sh
```

### Daily Development

```bash
# Start Docker services
docker-compose up -d

# Start development server
npm run dev
```

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test types
npm test                  # Unit tests
npm run test:e2e         # E2E tests
npm run test:security    # Security tests
npm run test:performance # Performance tests
```

## Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Restart Services
```bash
docker-compose restart
```

### Reset Everything
```bash
docker-compose down -v
./scripts/setup-test-env.sh
```

## Database Management

### Prisma Commands
```bash
npm run db:studio      # Open database GUI
npm run db:migrate     # Run migrations
npm run db:seed        # Seed test data
npm run db:generate    # Generate Prisma client
```

### Direct Database Access
```bash
# Development database
docker exec -it ai_marketplace_db psql -U ai_marketplace -d ai_marketplace

# Test database
docker exec -it ai_marketplace_db_test psql -U test -d test
```

## File Structure

```
AI_marketplace/
├── docker-compose.yml                    # Enhanced with test database
├── .env.example                          # Updated with test DB URL
├── scripts/
│   ├── setup-test-env.sh                # Setup automation script
│   └── quick-start.sh                   # One-command launch script
├── docs/
│   ├── TESTING_GUIDE.md                 # Comprehensive testing guide
│   └── DOCKER_TEST_SETUP.md             # This document
└── prisma/
    └── seed.ts                          # Existing comprehensive seed data
```

## Testing Workflows

### 1. Test Authentication
```bash
# Start app
npm run dev

# Visit http://localhost:3000
# Login with: admin@aimarket.com / password123
```

### 2. Test Product Creation
```bash
# Login as seller: seller1@example.com / password123
# Navigate to product creation
# Upload files and submit
```

### 3. Test Purchase Flow
```bash
# Login as buyer: buyer1@example.com / password123
# Browse products
# Complete purchase
```

### 4. Test Verification
```bash
# Login as verifier: verifier1@example.com / password123
# Review pending verifications
# Submit verification report
```

## Troubleshooting

### Port Conflicts
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5432

# Kill the process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Check container status
docker ps

# Check PostgreSQL
docker exec -it ai_marketplace_db pg_isready -U ai_marketplace

# Restart PostgreSQL
docker-compose restart postgres
```

### Fresh Start
```bash
# Complete reset
docker-compose down -v
rm -rf node_modules .next
npm install
./scripts/setup-test-env.sh
```

## Environment Variables

Required in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://ai_marketplace:dev_password_change_in_prod@localhost:5432/ai_marketplace"
DATABASE_URL_TEST="postgresql://test:test@localhost:5433/test"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-jwt-secret-key-here-change-in-production"

# Payment (optional for testing)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## Testing Best Practices

1. **Use test database for automated tests**
   ```bash
   DATABASE_URL=$DATABASE_URL_TEST npm test
   ```

2. **Reset test data regularly**
   ```bash
   npm run db:seed
   ```

3. **Run E2E tests before commits**
   ```bash
   npm run test:e2e
   ```

4. **Check test coverage**
   ```bash
   npm run test:coverage
   ```

5. **Use Prisma Studio for debugging**
   ```bash
   npm run db:studio
   ```

## CI/CD Integration

The test environment is designed to work with CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Start test environment
  run: docker-compose up -d

- name: Wait for services
  run: |
    until docker exec ai_marketplace_db_test pg_isready; do sleep 1; done

- name: Run tests
  run: npm run test:all
  env:
    DATABASE_URL: postgresql://test:test@localhost:5433/test
```

## Performance Considerations

- **Test Database**: Uses tmpfs for faster I/O
- **Parallel Tests**: Test database supports concurrent test execution
- **Docker Health Checks**: Ensure services are ready before tests
- **Seed Script**: Optimized for quick data population

## Security Notes

- Test credentials are for development only
- Never use test credentials in production
- .env.local is gitignored
- Test database has weak credentials intentionally

## Next Steps

1. **Install tsx** (required for seed script):
   ```bash
   npm install --save-dev tsx
   ```

2. **Run setup**:
   ```bash
   ./scripts/setup-test-env.sh
   ```

3. **Start developing**:
   ```bash
   npm run dev
   ```

4. **Write tests** using the test users and data

5. **Run tests regularly**:
   ```bash
   npm run test:all
   ```

## Support

- See `docs/TESTING_GUIDE.md` for detailed testing instructions
- Check Docker logs: `docker-compose logs -f`
- Verify services: `docker ps`
- Reset everything: `./scripts/setup-test-env.sh`

## Summary

The Docker-based test environment provides:

✅ Isolated test database for safe testing
✅ Automated setup and teardown
✅ Comprehensive test data
✅ Easy-to-use scripts
✅ Complete documentation
✅ CI/CD ready configuration
✅ Multiple test types support
✅ Quick development workflow

All scripts are executable and ready to use!

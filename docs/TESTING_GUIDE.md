# AI Marketplace - Testing Guide

Complete guide for setting up and running tests in the AI Marketplace project.

## Table of Contents

- [Quick Start](#quick-start)
- [Test Users](#test-users)
- [Test Data](#test-data)
- [Running Tests](#running-tests)
- [Database Management](#database-management)
- [Docker Commands](#docker-commands)
- [Troubleshooting](#troubleshooting)

## Quick Start

### 1. First Time Setup

```bash
# Clone the repository (if not already done)
cd /Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Setup and start everything
./scripts/quick-start.sh
```

This will:
- Start Docker containers (PostgreSQL, PostgreSQL Test, Redis)
- Wait for all services to be ready
- Run Prisma migrations
- Generate Prisma client
- Seed test data
- Start the development server

### 2. Manual Setup (Alternative)

```bash
# Start Docker services
docker-compose up -d

# Run setup script
./scripts/setup-test-env.sh

# Start development server
npm run dev
```

## Test Users

The seed script creates the following test users:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@aimarket.com | password123 | Platform administrator |
| Seller (Master) | seller1@example.com | password123 | Experienced seller with master tier |
| Seller (Pro) | seller2@example.com | password123 | Professional seller |
| Seller (Verified) | seller3@example.com | password123 | Basic verified seller |
| Seller (New) | seller4@example.com | password123 | New seller with pending verification |
| Buyer | buyer1@example.com | password123 | Regular customer |
| Buyer | buyer2@example.com | password123 | Another customer |
| Verifier | verifier1@example.com | password123 | Code reviewer |
| Verifier (Security) | verifier2@example.com | password123 | Security specialist |

## Test Data

The seed script populates the database with:

### Products (7 total)
1. **이메일 자동 분류 및 응답 워크플로우** (N8N)
   - Price: $29.99
   - Verification Level: 3
   - Status: Active
   - Ratings: 4.8/5 (12 reviews)

2. **Slack 메시지 요약 AI Agent**
   - Price: $19.99 (subscription)
   - Verification Level: 2
   - Status: Active
   - Ratings: 4.5/5 (8 reviews)

3. **Customer Support Chatbot (RAG)**
   - Price: $299.00 (license)
   - Verification Level: 3
   - Status: Active
   - Ratings: 4.9/5 (15 reviews)

4. **소셜 미디어 자동 포스팅 도구**
   - Price: $49.99 (subscription)
   - Verification Level: 1
   - Status: Active
   - Ratings: 4.2/5 (5 reviews)

5. **간단한 To-Do 앱** (바이브코딩)
   - Price: $9.99
   - Verification Level: 0
   - Status: Active
   - Ratings: 3.8/5 (3 reviews)

6. **Make 시나리오 - CRM 자동화**
   - Price: $15.00
   - Verification Level: 0
   - Status: Pending

7. **마케팅 자동화 프롬프트 템플릿 50선**
   - Price: $14.99
   - Verification Level: 1
   - Status: Active
   - Ratings: 4.6/5 (28 reviews)

### Orders (4 total)
- 3 completed orders with payments
- 1 pending order

### Reviews (3 total)
- Includes seller replies
- Various ratings (4-5 stars)

### Verifications (6 total)
- 5 approved verifications (Levels 1-3)
- 1 pending verification
- Detailed verification reports

### Notifications (4 total)
- Order notifications
- Review notifications
- Verification notifications

### Custom Requests (2 total)
- ERP system integration request
- Instagram posting automation request

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit

# Run integration tests only
npm run test:integration
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Run E2E tests in debug mode
npm run test:e2e:debug

# View E2E test report
npm run test:e2e:report
```

### Security Tests

```bash
# Run security-specific tests
npm run test:security
```

### Performance Tests

```bash
# Run performance tests
npm run test:performance
```

### Run All Tests

```bash
# Run comprehensive test suite
npm run test:all

# This runs:
# - Unit tests with coverage
# - E2E tests
# - Security tests
# - Performance tests
```

## Database Management

### Prisma Commands

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma client
npm run db:generate

# Push schema changes without migrations
npm run db:push

# Create and apply migrations
npm run db:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database with test data
npx prisma db seed
```

### Manual Database Reset

```bash
# Stop containers
docker-compose down

# Remove volumes (this deletes all data)
docker-compose down -v

# Start fresh
./scripts/setup-test-env.sh
```

## Docker Commands

### Basic Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Service Management

```bash
# Start only specific services
docker-compose up -d postgres redis

# Stop specific service
docker-compose stop postgres

# Restart specific service
docker-compose restart postgres
```

### Database Management Tools

```bash
# Start Adminer (database UI)
docker-compose --profile tools up -d adminer

# Access Adminer at http://localhost:8080
# Server: postgres
# Username: ai_marketplace
# Password: dev_password_change_in_prod
# Database: ai_marketplace
```

### Docker Container Access

```bash
# Access PostgreSQL (development)
docker exec -it ai_marketplace_db psql -U ai_marketplace -d ai_marketplace

# Access PostgreSQL (test)
docker exec -it ai_marketplace_db_test psql -U test -d test

# Access Redis
docker exec -it ai_marketplace_redis redis-cli
```

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Check what's using the port
lsof -i :3000  # Next.js dev server
lsof -i :5432  # PostgreSQL
lsof -i :5433  # PostgreSQL test
lsof -i :6379  # Redis

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check Docker containers
docker ps

# Check if PostgreSQL is running
docker exec -it ai_marketplace_db pg_isready -U ai_marketplace -d ai_marketplace

# Check PostgreSQL logs
docker logs ai_marketplace_db

# Restart PostgreSQL
docker-compose restart postgres
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker exec -it ai_marketplace_redis redis-cli ping

# Check Redis logs
docker logs ai_marketplace_redis

# Restart Redis
docker-compose restart redis
```

### Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset Prisma migrations
npx prisma migrate reset

# Push schema without migrations
npx prisma db push --skip-generate
npx prisma generate
```

### Clear Everything and Start Fresh

If you encounter persistent issues:

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove node_modules
rm -rf node_modules

# Remove .next cache
rm -rf .next

# Reinstall dependencies
npm install

# Setup environment again
./scripts/setup-test-env.sh
```

### Test Database Issues

```bash
# Reset test database
docker-compose restart postgres_test

# Wait for it to be ready
docker exec -it ai_marketplace_db_test pg_isready -U test -d test

# Run migrations on test database
DATABASE_URL="postgresql://test:test@localhost:5433/test" npx prisma migrate dev
```

### Environment Variables

```bash
# Check if .env.local exists
ls -la .env.local

# If not, copy from example
cp .env.example .env.local

# Edit as needed
nano .env.local
```

### File Upload Issues

```bash
# Create uploads directory
npm run files:setup

# Or manually
mkdir -p public/uploads
chmod 755 public/uploads
```

## Testing Workflows

### Testing Authentication

1. Start the development server
2. Navigate to http://localhost:3000
3. Try logging in with test users
4. Test registration flow
5. Test password reset
6. Test OAuth integration (if configured)

### Testing Product Creation

1. Log in as a seller (seller1@example.com)
2. Navigate to "Create Product"
3. Fill in product details
4. Upload files
5. Submit product
6. Check product status in dashboard

### Testing Purchase Flow

1. Log in as a buyer (buyer1@example.com)
2. Browse products
3. Add product to cart
4. Complete checkout
5. Verify payment (use Stripe test cards)
6. Check download access

### Testing Verification

1. Log in as a verifier (verifier1@example.com)
2. View pending verifications
3. Review product details
4. Submit verification report
5. Check product verification status

### Testing Admin Functions

1. Log in as admin (admin@aimarket.com)
2. View all users
3. Manage products
4. Handle refund requests
5. Review verification reports
6. Check platform analytics

## Test Coverage

Current test coverage:

- Unit tests: Core business logic, utilities, API handlers
- Integration tests: Database operations, API endpoints
- E2E tests: User workflows, critical paths
- Security tests: Authentication, authorization, input validation
- Performance tests: Load testing, optimization validation

Run `npm run test:coverage` to see detailed coverage reports.

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Support

If you encounter issues not covered in this guide:

1. Check Docker logs: `docker-compose logs -f`
2. Check application logs in the console
3. Verify environment variables are set correctly
4. Ensure all Docker containers are running: `docker ps`
5. Try a fresh setup: `./scripts/setup-test-env.sh`

## Quick Reference

### Start Development
```bash
./scripts/quick-start.sh
# or
npm run dev
```

### Run Tests
```bash
npm run test:all
```

### Database GUI
```bash
npm run db:studio
```

### View Logs
```bash
docker-compose logs -f
```

### Reset Everything
```bash
docker-compose down -v
./scripts/setup-test-env.sh
```

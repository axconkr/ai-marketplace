# Docker Test Environment Setup - Installation Guide

## Summary

A comprehensive Docker-based test environment has been successfully configured for the AI Marketplace project. This setup provides isolated databases, automated setup scripts, and comprehensive test data for easy development and testing.

## What Was Implemented

### 1. Docker Configuration

**File**: `docker-compose.yml`

**New Service Added**:
- **postgres_test**: Separate PostgreSQL instance for testing
  - Port: 5433
  - Credentials: test/test/test
  - Uses tmpfs (in-memory) for faster tests
  - Isolated from development database

**Existing Services Enhanced**:
- **postgres**: Development database (port 5432)
- **redis**: Cache service (port 6379)
- **adminer**: Database UI (port 8080, optional)

### 2. Automation Scripts

#### Setup Script (`scripts/setup-test-env.sh`)
Automated environment setup that:
- Checks Docker availability
- Creates environment file if missing
- Starts all Docker services
- Waits for databases to be ready
- Runs Prisma migrations
- Generates Prisma client
- Seeds test data
- Creates upload directories
- Shows helpful command reference

#### Quick Start Script (`scripts/quick-start.sh`)
One-command solution that:
- Runs the setup script
- Starts the development server
- Perfect for daily development

### 3. Documentation

#### Testing Guide (`docs/TESTING_GUIDE.md`)
Comprehensive guide covering:
- Quick start instructions
- Test user credentials
- Running all test types
- Database management
- Docker commands
- Troubleshooting
- Testing workflows

#### Setup Documentation (`docs/DOCKER_TEST_SETUP.md`)
Complete reference including:
- Architecture overview
- Service details
- Test data description
- Best practices
- CI/CD integration

### 4. Configuration Updates

**`.env.example`**: Updated with test database URL and Redis configuration

**`package.json`**: Added seed script and Prisma configuration

## Test Users Created

The seed script creates 9 users across different roles:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@aimarket.com | password123 | Platform administration |
| Seller (Master) | seller1@example.com | password123 | Experienced seller testing |
| Seller (Pro) | seller2@example.com | password123 | Professional seller testing |
| Seller (Verified) | seller3@example.com | password123 | Basic seller testing |
| Seller (New) | seller4@example.com | password123 | New seller workflow testing |
| Buyer | buyer1@example.com | password123 | Purchase flow testing |
| Buyer | buyer2@example.com | password123 | Additional buyer testing |
| Verifier | verifier1@example.com | password123 | Code review testing |
| Verifier (Security) | verifier2@example.com | password123 | Security verification testing |

## Test Data Included

- **7 Products**: Various categories (N8N, AI Agent, Apps, Prompts)
- **4 Orders**: 3 completed, 1 pending
- **3 Reviews**: Including seller replies
- **6 Verifications**: Multiple levels (0-3)
- **4 Notifications**: Different notification types
- **2 Custom Requests**: Sample project requests

## Services and Ports

| Service | Port | Access |
|---------|------|--------|
| Next.js App | 3000 | http://localhost:3000 |
| PostgreSQL (Dev) | 5432 | localhost:5432 |
| PostgreSQL (Test) | 5433 | localhost:5433 |
| Redis | 6379 | localhost:6379 |
| Adminer (Optional) | 8080 | http://localhost:8080 |

## Installation Steps

### 1. Install Required Dependency

```bash
cd /Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace
npm install --save-dev tsx
```

### 2. Run Quick Start

```bash
./scripts/quick-start.sh
```

This single command will:
- Start all Docker services
- Wait for services to be ready
- Run database migrations
- Seed test data
- Start the development server

### 3. Verify Setup

Open your browser and visit:
- App: http://localhost:3000
- Database UI: http://localhost:8080 (if using adminer profile)

Login with any test user:
- Admin: admin@aimarket.com / password123
- Seller: seller1@example.com / password123
- Buyer: buyer1@example.com / password123
- Verifier: verifier1@example.com / password123

## Daily Usage

### Start Development

```bash
# Option 1: Quick start (setup + dev server)
./scripts/quick-start.sh

# Option 2: Manual start
docker-compose up -d
npm run dev
```

### Run Tests

```bash
# All tests
npm run test:all

# Specific test types
npm test                  # Unit tests
npm run test:e2e         # E2E tests
npm run test:security    # Security tests
npm run test:performance # Performance tests
```

### Database Management

```bash
# Open database GUI
npm run db:studio

# Seed test data
npm run db:seed

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

### Docker Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Reset everything
docker-compose down -v
./scripts/setup-test-env.sh
```

## File Structure

```
AI_marketplace/
├── docker-compose.yml                    # Enhanced Docker configuration
├── .env.example                          # Updated environment template
├── DOCKER_TEST_ENVIRONMENT_SETUP.md     # This file
├── scripts/
│   ├── setup-test-env.sh                # Automated setup script ✓
│   └── quick-start.sh                   # One-command launcher ✓
├── docs/
│   ├── TESTING_GUIDE.md                 # Comprehensive testing guide ✓
│   └── DOCKER_TEST_SETUP.md             # Detailed setup documentation ✓
├── prisma/
│   └── seed.ts                          # Existing seed data (enhanced)
└── package.json                         # Updated with seed script
```

## Testing Workflows

### 1. Authentication Testing
```bash
# Start app
npm run dev

# Visit http://localhost:3000
# Test login, registration, password reset
# Use any test user credentials
```

### 2. Product Management Testing
```bash
# Login as seller: seller1@example.com / password123
# Create, edit, delete products
# Test file uploads
# Verify product status changes
```

### 3. Purchase Flow Testing
```bash
# Login as buyer: buyer1@example.com / password123
# Browse products
# Add to cart
# Complete purchase (use Stripe test cards)
# Verify download access
```

### 4. Verification Testing
```bash
# Login as verifier: verifier1@example.com / password123
# View pending verifications
# Submit verification reports
# Check verification status updates
```

### 5. Admin Testing
```bash
# Login as admin: admin@aimarket.com / password123
# Manage users and products
# Handle refund requests
# Review verification reports
# Check analytics
```

## Troubleshooting

### Port Conflicts

```bash
# Check what's using the port
lsof -i :3000
lsof -i :5432
lsof -i :5433

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check Docker containers
docker ps

# Check PostgreSQL
docker exec -it ai_marketplace_db pg_isready -U ai_marketplace
docker exec -it ai_marketplace_db_test pg_isready -U test

# Restart PostgreSQL
docker-compose restart postgres postgres_test
```

### Complete Reset

```bash
# Stop and remove everything
docker-compose down -v

# Remove caches
rm -rf node_modules .next

# Reinstall
npm install

# Setup again
./scripts/setup-test-env.sh
```

## Environment Variables

Create or update `.env.local` with:

```env
# Database
DATABASE_URL="postgresql://ai_marketplace:dev_password_change_in_prod@localhost:5432/ai_marketplace"
DATABASE_URL_TEST="postgresql://test:test@localhost:5433/test"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-jwt-secret-key-here-change-in-production"
JWT_EXPIRES_IN="7d"

# Payment (Optional for testing)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## CI/CD Integration

The setup is ready for CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Start services
  run: docker-compose up -d

- name: Wait for databases
  run: |
    until docker exec ai_marketplace_db_test pg_isready; do sleep 1; done

- name: Run tests
  run: npm run test:all
  env:
    DATABASE_URL: postgresql://test:test@localhost:5433/test
```

## Performance Features

- **Test Database**: Uses tmpfs for fast I/O
- **Health Checks**: Ensures services are ready
- **Parallel Tests**: Isolated test database
- **Optimized Seeding**: Fast test data population

## Security Notes

⚠️ **Important**:
- Test credentials are for development only
- Never use these credentials in production
- .env.local is gitignored
- Test database has intentionally weak credentials

## Best Practices

1. **Use test database for automated tests**:
   ```bash
   DATABASE_URL=$DATABASE_URL_TEST npm test
   ```

2. **Reset test data regularly**:
   ```bash
   npm run db:seed
   ```

3. **Run tests before committing**:
   ```bash
   npm run test:all
   ```

4. **Check coverage**:
   ```bash
   npm run test:coverage
   ```

5. **Use Prisma Studio for debugging**:
   ```bash
   npm run db:studio
   ```

## Additional Resources

- **Testing Guide**: `docs/TESTING_GUIDE.md`
- **Setup Details**: `docs/DOCKER_TEST_SETUP.md`
- **Prisma Docs**: https://www.prisma.io/docs
- **Docker Compose Docs**: https://docs.docker.com/compose/

## Quick Reference Commands

```bash
# Setup
./scripts/setup-test-env.sh

# Start development
./scripts/quick-start.sh

# Run tests
npm run test:all

# Database GUI
npm run db:studio

# View logs
docker-compose logs -f

# Reset everything
docker-compose down -v && ./scripts/setup-test-env.sh
```

## Next Steps

1. **Install tsx dependency**:
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

4. **Write and run tests**:
   ```bash
   npm run test:all
   ```

## Support

If you encounter issues:

1. Check `docs/TESTING_GUIDE.md` for detailed instructions
2. View Docker logs: `docker-compose logs -f`
3. Verify services are running: `docker ps`
4. Try a complete reset: `./scripts/setup-test-env.sh`
5. Check environment variables in `.env.local`

## Summary

✅ **Docker Services**: PostgreSQL (dev + test), Redis, optional Adminer
✅ **Automation Scripts**: Setup and quick-start scripts
✅ **Test Data**: 9 users, 7 products, orders, reviews, verifications
✅ **Documentation**: Comprehensive testing and setup guides
✅ **CI/CD Ready**: Configured for automated testing
✅ **Easy to Use**: One-command setup and launch

The Docker-based test environment is now ready for development and testing!

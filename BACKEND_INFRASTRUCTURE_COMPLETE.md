# Backend Infrastructure - Complete Setup Guide

## Overview

Complete backend infrastructure for AI Marketplace has been created with:
- **Prisma Schema**: Full database schema with 8 models, 9 enums, 25+ indexes
- **Seed Data**: Comprehensive sample data for development
- **TypeScript Types**: Auto-generated type-safe types
- **Database Client**: Prisma Client singleton for Next.js
- **Documentation**: Complete setup and usage guides

## Files Created

### 1. Core Database Files

#### `/prisma/schema.marketplace.prisma` (10KB)
**Complete marketplace database schema - USE THIS FOR PRODUCTION**

Contains:
- **8 Models**: User, Product, Order, Payment, Review, Verification, Notification, CustomRequest
- **9 Enums**: UserRole, SellerTier, ProductCategory, PricingModel, ProductStatus, OrderStatus, VerificationStatus, PaymentProvider, Currency
- **25+ Indexes**: Optimized for query performance
- **UUID Primary Keys**: Production-ready with PostgreSQL UUID
- **RLS Compatible**: Field naming compatible with Supabase Row Level Security

Key Features:
```sql
Users: 4 roles (buyer, seller, verifier, admin), 4 seller tiers
Products: 6 categories, 3 pricing models, 4 verification levels
Orders: Complete workflow (pending → paid → completed)
Verifications: 3-level system with JSONB reports
Payments: Platform fee calculation, multi-provider support
```

#### `/prisma/schema.prisma` (1KB)
**Simplified authentication schema - REPLACE WITH MARKETPLACE SCHEMA**

Current file is a basic auth example. Replace with:
```bash
cp prisma/schema.marketplace.prisma prisma/schema.prisma
```

#### `/prisma/seed.ts` (23KB)
**Comprehensive seed data for development**

Creates:
- 9 Users (1 admin, 4 sellers, 2 buyers, 2 verifiers)
- 7 Products (all categories, various verification levels)
- 4 Orders (3 completed, 1 pending)
- 3 Reviews with seller replies
- 6 Verifications (all levels, with detailed reports)
- 3 Payments (Stripe + Toss examples)
- 4 Notifications
- 2 Custom Requests

Test Credentials:
```
Admin:          admin@aimarket.com / password123
Master Seller:  seller1@example.com / password123
Buyer:          buyer1@example.com / password123
Verifier:       verifier1@example.com / password123
```

### 2. Application Files

#### `/lib/prisma.ts` (579B)
**Prisma Client singleton for Next.js**

- Prevents connection exhaustion in development
- Development logging enabled
- Production-optimized

Usage:
```typescript
import { prisma } from '@/lib/prisma';

const products = await prisma.product.findMany({
  where: { status: 'active' }
});
```

#### `/lib/types.ts` (7.6KB)
**TypeScript types from Prisma schema**

Includes:
- Basic types: User, Product, Order, Payment, Review, Verification
- With relations: ProductDetail, OrderWithDetails, SellerProfile
- Specialized: ProductCard, ProductSearchParams, ApiResponse
- Dashboard: SellerDashboardStats, BuyerDashboardStats
- Verification reports: VerificationReportLevel1-3

Usage:
```typescript
import { ProductDetail, OrderWithDetails } from '@/lib/types';

async function getProduct(id: string): Promise<ProductDetail> {
  return await prisma.product.findUnique({
    where: { id },
    include: { seller: true, reviews: true }
  });
}
```

### 3. Configuration Files

#### `.env.example` (Updated)
Environment variables template with:
- Database URLs (local + Supabase)
- Authentication (NextAuth, JWT, OAuth)
- Payment providers (Stripe, Toss)
- Supabase configuration
- Redis, Email, Monitoring

#### `package.json` (Updated)
Added Prisma scripts:
```json
{
  "scripts": {
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "db:generate": "prisma generate",
    "postinstall": "prisma generate"
  }
}
```

Dependencies added:
- `@prisma/client`: Prisma client
- `prisma`: Prisma CLI (dev)
- `bcrypt`: Password hashing
- `zod`: Validation
- `tsx`: TypeScript execution for seed

### 4. Documentation

#### `DATABASE_SETUP.md` (15KB)
Complete database setup guide with:
- Prerequisites and installation
- PostgreSQL setup (Docker + local)
- Migration workflow
- Seed data usage
- Prisma Studio
- Production deployment (Supabase)
- RLS policy examples
- Troubleshooting

#### `BACKEND_SUMMARY.md` (7.2KB)
Quick reference with:
- File structure overview
- Database schema highlights
- Sample data statistics
- Key features
- Quick start commands
- Next development steps
- Production checklist

## Setup Instructions

### Step 1: Replace Schema File

```bash
# Replace simplified schema with complete marketplace schema
cp prisma/schema.marketplace.prisma prisma/schema.prisma
```

### Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

This will automatically run `prisma generate`.

### Step 3: Setup PostgreSQL

**Option A: Docker (Recommended)**
```bash
docker run --name ai-marketplace-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_marketplace_dev \
  -p 5432:5432 \
  -d postgres:16
```

**Option B: Local PostgreSQL**
```bash
createdb ai_marketplace_dev
```

### Step 4: Configure Environment

```bash
cp .env.example .env

# Edit .env - Update DATABASE_URL:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_marketplace_dev"
```

### Step 5: Run Migrations

```bash
npm run db:migrate

# Name migration when prompted:
# Example: "initial_marketplace_schema"
```

### Step 6: Seed Database

```bash
npm run db:seed
```

Expected output:
```
🌱 Starting database seed...
✅ Cleared existing data
✅ Created users
✅ Created products
✅ Created orders and payments
✅ Created reviews
✅ Created verifications
✅ Created notifications
✅ Created custom requests

🎉 Database seeding completed successfully!

📊 Summary:
- Users: 9 (1 admin, 4 sellers, 2 buyers, 2 verifiers)
- Products: 7 (6 active, 1 pending)
- Orders: 4 (3 completed, 1 pending)
- Reviews: 3
- Verifications: 6 (5 approved, 1 pending)
- Notifications: 4
- Custom Requests: 2
```

### Step 7: Verify Setup

```bash
# Open Prisma Studio
npm run db:studio

# Access at: http://localhost:5555
```

## Database Schema Overview

### Users Table
```typescript
- id: UUID (PK)
- email: String (unique)
- role: buyer | seller | verifier | admin
- seller_tier: new | verified | pro | master
- portfolio: JSON (flexible portfolio data)
- oauth_provider: String (google, github)
```

### Products Table
```typescript
- id: UUID (PK)
- seller_id: UUID (FK → users)
- category: n8n | make | ai_agent | app | api | prompt
- pricing_model: one_time | subscription | license
- verification_level: 0-3
- status: draft | pending | active | suspended
- rating_avg: Decimal (computed)
- tags: String[] (searchable)
```

### Orders Table
```typescript
- id: UUID (PK)
- buyer_id: UUID (FK → users)
- product_id: UUID (FK → products)
- payment_id: UUID (FK → payments)
- status: pending | paid | completed | refunded | disputed
- amount: Decimal
- refund_reason: String (optional)
```

### Verifications Table
```typescript
- id: UUID (PK)
- product_id: UUID (FK → products)
- verifier_id: UUID (FK → users, nullable)
- level: 1 | 2 | 3
- status: pending | in_progress | approved | rejected
- report: JSON (verification results)
- fee: Decimal (50 | 150 | 500)
```

### Reviews Table
```typescript
- id: UUID (PK)
- order_id: UUID (FK → orders, unique)
- rating: 1-5
- comment: String (optional)
- seller_reply: String (optional)
```

### Payments Table
```typescript
- id: UUID (PK)
- buyer_id, seller_id: UUID (FK → users)
- provider: stripe | tosspayments
- amount: Decimal
- platform_fee: Decimal (10-20%)
- seller_amount: Decimal (net)
```

## Usage Examples

### Query Products
```typescript
import { prisma } from '@/lib/prisma';

// Get active products
const products = await prisma.product.findMany({
  where: {
    status: 'active',
    verification_level: { gte: 1 }
  },
  include: {
    seller: {
      select: { name: true, seller_tier: true }
    }
  },
  orderBy: { rating_avg: 'desc' },
  take: 10
});
```

### Create Order
```typescript
const order = await prisma.order.create({
  data: {
    buyer_id: userId,
    product_id: productId,
    amount: product.price,
    currency: product.currency,
    status: 'pending'
  }
});
```

### Search Products
```typescript
const products = await prisma.product.findMany({
  where: {
    status: 'active',
    category: 'n8n',
    price: { gte: 10, lte: 100 },
    tags: { hasSome: ['automation', 'email'] }
  },
  orderBy: { created_at: 'desc' }
});
```

## Prisma Commands Reference

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes (no migration)
npm run db:push

# Create migration
npm run db:migrate

# Deploy to production
npm run db:migrate:prod

# Open Prisma Studio
npm run db:studio

# Reset database (WARNING: deletes all data)
npm run db:reset

# Seed database
npm run db:seed
```

## Production Deployment (Supabase)

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Copy credentials

### 2. Update Environment
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
```

### 3. Deploy Migrations
```bash
npm run db:migrate:prod
```

### 4. Enable RLS
```sql
-- In Supabase SQL Editor
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies (see DATABASE_SETUP.md for examples)
```

## Next Development Steps

1. **Authentication System**
   - [ ] Implement NextAuth.js with Prisma Adapter
   - [ ] Add OAuth providers (Google, GitHub)
   - [ ] Create auth API routes
   - [ ] Setup protected routes

2. **API Routes**
   - [ ] Product CRUD endpoints
   - [ ] Order processing workflow
   - [ ] Payment integration (Stripe, Toss)
   - [ ] Review submission
   - [ ] Verification workflow

3. **Business Logic**
   - [ ] Platform fee calculation (10-20% based on seller_tier)
   - [ ] Seller tier progression
   - [ ] Product approval workflow
   - [ ] Refund processing (7-day policy)
   - [ ] Verification report generation

4. **File Management**
   - [ ] Supabase Storage integration
   - [ ] File upload API
   - [ ] Access control with RLS
   - [ ] Virus scanning

5. **Search & Filtering**
   - [ ] Full-text search
   - [ ] Advanced filtering (category, price, verification)
   - [ ] Sorting options
   - [ ] Pagination

## Troubleshooting

### Migration Errors
```bash
# Reset and retry
npm run db:reset

# Or manually resolve
npx prisma migrate resolve --applied [migration-name]
```

### Connection Errors
```bash
# Check PostgreSQL
docker ps | grep postgres

# Test connection
psql $DATABASE_URL
```

### Type Generation Issues
```bash
# Regenerate
npm run db:generate

# Clean install
rm -rf node_modules .next
npm install
```

## File Locations Summary

```
/prisma/
  ├── schema.marketplace.prisma  ← COMPLETE SCHEMA (USE THIS)
  ├── schema.prisma              ← Current schema (replace)
  ├── seed.ts                    ← Sample data generator
  └── migrations/                ← Migration history

/lib/
  ├── prisma.ts                  ← Prisma Client singleton
  └── types.ts                   ← TypeScript types

/docs/
  ├── DATABASE_SETUP.md          ← Setup guide
  └── BACKEND_SUMMARY.md         ← Quick reference
```

## Status

✅ **Backend Infrastructure Complete**
- Database schema designed
- Seed data created
- Type system implemented
- Documentation provided
- Ready for application development

## Next Session

To continue development, start with:
1. Replace schema: `cp prisma/schema.marketplace.prisma prisma/schema.prisma`
2. Run migrations: `npm run db:migrate`
3. Seed database: `npm run db:seed`
4. Implement authentication
5. Build API routes

---

**Created**: 2024-12-27
**Status**: Complete and ready for development
**Documentation**: See DATABASE_SETUP.md for detailed instructions

# Backend Infrastructure - Quick Start

## 🚀 5-Minute Setup

### 1. Replace Schema (IMPORTANT!)
```bash
cp prisma/schema.marketplace.prisma prisma/schema.prisma
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start PostgreSQL
```bash
docker run --name ai-marketplace-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_marketplace_dev \
  -p 5432:5432 \
  -d postgres:16
```

### 4. Setup Environment
```bash
cp .env.example .env
# Edit DATABASE_URL in .env
```

### 5. Run Migrations & Seed
```bash
npm run db:migrate
npm run db:seed
```

### 6. Open Prisma Studio
```bash
npm run db:studio
# → http://localhost:5555
```

## ✅ Test Credentials

```
Admin:    admin@aimarket.com / password123
Seller:   seller1@example.com / password123
Buyer:    buyer1@example.com / password123
Verifier: verifier1@example.com / password123
```

## 📁 Files Created

| File | Size | Purpose |
|------|------|---------|
| `prisma/schema.marketplace.prisma` | 10KB | **FULL DATABASE SCHEMA** |
| `prisma/seed.ts` | 23KB | Sample data (9 users, 7 products, etc.) |
| `lib/prisma.ts` | 579B | Prisma Client singleton |
| `lib/types.ts` | 7.6KB | TypeScript types |
| `DATABASE_SETUP.md` | 9.4KB | Setup guide |
| `BACKEND_SUMMARY.md` | 7.2KB | Quick reference |

## 📊 Database Schema

### 8 Models
- **User**: 4 roles (buyer, seller, verifier, admin)
- **Product**: 6 categories, 3 pricing models, 4 verification levels
- **Order**: Complete purchase workflow
- **Payment**: Stripe + Toss support, platform fees
- **Review**: Ratings with seller replies
- **Verification**: 3-level verification system
- **Notification**: User notifications
- **CustomRequest**: Development requests (Phase 2)

### 9 Enums
UserRole, SellerTier, ProductCategory, PricingModel, ProductStatus, OrderStatus, VerificationStatus, PaymentProvider, Currency

## 🔨 Common Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create migration
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database (⚠️ deletes all data)
npm run db:reset
```

## 💻 Usage Example

```typescript
import { prisma } from '@/lib/prisma';

// Get active products
const products = await prisma.product.findMany({
  where: {
    status: 'active',
    verification_level: { gte: 1 }
  },
  include: { seller: true },
  orderBy: { rating_avg: 'desc' }
});
```

## 📝 Sample Data

| Entity | Count | Details |
|--------|-------|---------|
| Users | 9 | 1 admin, 4 sellers, 2 buyers, 2 verifiers |
| Products | 7 | 6 active, 1 pending approval |
| Orders | 4 | 3 completed, 1 pending |
| Reviews | 3 | Various ratings |
| Verifications | 6 | All levels (1-3) |
| Payments | 3 | Stripe + Toss examples |

## 🔗 Next Steps

1. **Authentication**: NextAuth.js + Prisma Adapter
2. **API Routes**: Product CRUD, Orders, Payments
3. **Frontend**: Product listing, checkout flow
4. **Payments**: Stripe/Toss integration
5. **File Upload**: Supabase Storage

## 📚 Documentation

- **DATABASE_SETUP.md**: Detailed setup instructions
- **BACKEND_SUMMARY.md**: Schema overview and examples
- **BACKEND_INFRASTRUCTURE_COMPLETE.md**: Complete reference guide

## ⚠️ Important Notes

1. **Replace Schema**: Always use `schema.marketplace.prisma` (not `schema.prisma`)
2. **UUID Keys**: All models use UUID primary keys
3. **RLS Ready**: Field naming compatible with Supabase RLS
4. **Development Only**: Current seed uses hardcoded passwords (change in production)

## 🐛 Troubleshooting

### Migration Error
```bash
npm run db:reset
npm run db:migrate
```

### Connection Error
```bash
docker ps | grep postgres
psql $DATABASE_URL
```

### Type Error
```bash
npm run db:generate
```

---

**Status**: ✅ Ready for development
**Created**: 2024-12-27
**Next**: Implement authentication

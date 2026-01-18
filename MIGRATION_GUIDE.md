# Database Migration Guide - File Upload System

Step-by-step guide to migrate your database for the file upload system.

## Prerequisites

- PostgreSQL database running
- Prisma CLI installed (`npx prisma` works)
- `.env` file configured with `DATABASE_URL`

## Migration Steps

### Step 1: Verify Database Connection

```bash
npx prisma db pull
```

Expected output: "Introspecting based on datasource defined in schema.prisma"

If error occurs, check your `DATABASE_URL` in `.env` file.

### Step 2: Review Schema Changes

Open `prisma/schema.prisma` and verify these models were added:

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Float
  seller_id   String
  status      String   @default("draft")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  seller User  @relation("ProductSeller", fields: [seller_id], references: [id])
  files  File[]
}

model File {
  id             String     @id @default(cuid())
  product_id     String?
  user_id        String
  filename       String
  original_name  String
  mime_type      String
  size           Int
  path           String
  url            String
  download_count Int        @default(0)
  status         FileStatus @default(ACTIVE)
  created_at     DateTime   @default(now())
  updated_at     DateTime   @updatedAt
  deleted_at     DateTime?

  product Product? @relation(fields: [product_id], references: [id])
  user    User     @relation("UserFiles", fields: [user_id], references: [id])
}

enum FileStatus {
  ACTIVE
  DELETED
  SCANNING
  QUARANTINED
}
```

Also verify `User` model has these relations:

```prisma
model User {
  // ... existing fields
  products      Product[] @relation("ProductSeller")
  files         File[]    @relation("UserFiles")
}
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

Expected output:
```
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

### Step 4: Create Migration

```bash
npx prisma migrate dev --name add_file_upload_system
```

This will:
1. Create a new migration file in `prisma/migrations/`
2. Apply the migration to your database
3. Regenerate Prisma Client

Expected output:
```
The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20241228XXXXXX_add_file_upload_system/
    └─ migration.sql

✔ Generated Prisma Client
```

### Step 5: Verify Migration

Check if tables were created:

```bash
npx prisma studio
```

Or using SQL:

```sql
-- Connect to your database and run:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('File', 'Product');
```

Expected result: Both `File` and `Product` tables should exist.

### Step 6: Inspect Generated Migration

Open the migration file: `prisma/migrations/XXXXXX_add_file_upload_system/migration.sql`

It should contain SQL like:

```sql
-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('ACTIVE', 'DELETED', 'SCANNING', 'QUARANTINED');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "seller_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "status" "FileStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_seller_id_idx" ON "Product"("seller_id");
CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE INDEX "File_product_id_idx" ON "File"("product_id");
CREATE INDEX "File_user_id_idx" ON "File"("user_id");
CREATE INDEX "File_status_idx" ON "File"("status");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_seller_id_fkey"
    FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Production Deployment

### Option 1: Using Prisma Migrate (Recommended)

```bash
# 1. Push schema to production database
npx prisma migrate deploy

# 2. Generate Prisma Client
npx prisma generate
```

### Option 2: Manual SQL (if Prisma Migrate not available)

```bash
# 1. Generate migration SQL
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql

# 2. Review migration.sql
# 3. Run on production database
psql $DATABASE_URL -f migration.sql
```

## Rollback (if needed)

If you need to undo the migration:

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back XXXXXX_add_file_upload_system

# Then manually drop tables
psql $DATABASE_URL -c "DROP TABLE IF EXISTS File CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS Product CASCADE;"
psql $DATABASE_URL -c "DROP TYPE IF EXISTS FileStatus;"
```

## Troubleshooting

### Error: "Migration failed"

**Cause**: Database constraint violation or existing tables

**Solution**:
```sql
-- Check for existing tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Drop conflicting tables if safe
DROP TABLE IF EXISTS "File" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;

-- Then retry migration
npx prisma migrate dev
```

### Error: "Relation already exists"

**Cause**: User model already has products or files relation

**Solution**: Check your existing schema and merge relations carefully

### Error: "Column type mismatch"

**Cause**: Existing column with different type

**Solution**: Create a custom migration to handle the type change

### Error: "Cannot connect to database"

**Cause**: Wrong DATABASE_URL

**Solution**:
```bash
# Verify connection
psql $DATABASE_URL -c "SELECT version();"

# Check .env file
cat .env | grep DATABASE_URL
```

## Verification Checklist

After migration, verify:

- [ ] `File` table exists with all columns
- [ ] `Product` table exists with all columns
- [ ] `FileStatus` enum exists with 4 values
- [ ] Indexes created on foreign keys and status
- [ ] Foreign key constraints working
- [ ] Prisma Client regenerated
- [ ] Can create a File record via Prisma
- [ ] Can create a Product record via Prisma

## Test Database Insertion

```typescript
// test-db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testInsertion() {
  // Create a test product (assuming you have a user)
  const product = await prisma.product.create({
    data: {
      name: 'Test Product',
      price: 99.99,
      seller_id: 'your-user-id', // Replace with real user ID
      status: 'draft',
    },
  });

  console.log('Created product:', product);

  // Create a test file
  const file = await prisma.file.create({
    data: {
      user_id: 'your-user-id', // Replace with real user ID
      product_id: product.id,
      filename: 'test-file.pdf',
      original_name: 'test.pdf',
      mime_type: 'application/pdf',
      size: 1024,
      path: 'products/test/test-file.pdf',
      url: '/uploads/products/test/test-file.pdf',
      status: 'ACTIVE',
    },
  });

  console.log('Created file:', file);

  // Cleanup
  await prisma.file.delete({ where: { id: file.id } });
  await prisma.product.delete({ where: { id: product.id } });

  console.log('Test successful!');
}

testInsertion()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run test:
```bash
npx tsx test-db.ts
```

## Post-Migration Tasks

1. **Create uploads directory**:
   ```bash
   mkdir -p public/uploads
   chmod 755 public/uploads
   ```

2. **Update .env**:
   ```env
   STORAGE_PROVIDER=local
   UPLOAD_DIR=/uploads
   ```

3. **Test upload API**:
   ```bash
   curl -X POST http://localhost:3000/api/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.pdf"
   ```

4. **Monitor logs**:
   ```bash
   tail -f .next/server.log
   ```

## Support

If migration fails or you encounter issues:

1. Check Prisma logs: `.next/server.log`
2. Verify database connection: `npx prisma studio`
3. Review migration SQL: `prisma/migrations/*/migration.sql`
4. Consult documentation: `docs/FILE_UPLOAD_SYSTEM.md`

## Summary

✅ Schema updated with File and Product models
✅ Migration created and applied
✅ Indexes and foreign keys established
✅ Prisma Client regenerated
✅ Ready for file upload operations

**Next**: Follow `docs/SETUP_GUIDE.md` to configure and test the upload system.

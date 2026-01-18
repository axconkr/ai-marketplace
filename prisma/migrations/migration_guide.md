# Notification System Migration Guide

## Step 1: Run the Migration

Execute the following command to create the notification tables:

```bash
npx prisma migrate dev --name add_notification_system
```

This will:
- Create the `Notification` table
- Add the `NotificationType` enum
- Add `notification_settings` field to User table
- Create necessary indexes

## Step 2: Generate Prisma Client

```bash
npx prisma generate
```

This regenerates the Prisma client with the new types.

## Step 3: Verify Migration

Check that the migration was successful:

```bash
npx prisma studio
```

You should see:
- `Notification` table in the database
- `notification_settings` field in User table

## Step 4: Seed Test Data (Optional)

Create a test notification to verify everything works:

```typescript
// scripts/seed-notifications.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get a test user
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log('No users found. Create a user first.');
    return;
  }

  // Create test notification
  await prisma.notification.create({
    data: {
      user_id: user.id,
      type: 'SYSTEM_ANNOUNCEMENT',
      title: 'Welcome to the Notification System',
      message: 'This is a test notification. The system is working correctly!',
      link: '/notifications',
    },
  });

  console.log('✅ Test notification created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run the seed:

```bash
npx tsx scripts/seed-notifications.ts
```

## Migration SQL Preview

The migration will generate SQL similar to:

```sql
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
  'ORDER_PLACED',
  'ORDER_COMPLETED',
  'PAYMENT_RECEIVED',
  'PAYMENT_FAILED',
  'REFUND_APPROVED',
  'REFUND_REJECTED',
  'PRODUCT_APPROVED',
  'PRODUCT_REJECTED',
  'VERIFICATION_REQUESTED',
  'VERIFICATION_COMPLETED',
  'VERIFICATION_ASSIGNED',
  'SETTLEMENT_READY',
  'SETTLEMENT_PAID',
  'REVIEW_RECEIVED',
  'MESSAGE_RECEIVED',
  'SYSTEM_ANNOUNCEMENT'
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_user_id_read_idx" ON "Notification"("user_id", "read");
CREATE INDEX "Notification_user_id_created_at_idx" ON "Notification"("user_id", "created_at");
CREATE INDEX "Notification_created_at_idx" ON "Notification"("created_at");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "notification_settings" JSONB;
```

## Rollback (if needed)

If you need to rollback the migration:

```bash
npx prisma migrate reset
```

**WARNING**: This will delete all data in your database!

For production, create a down migration:

```sql
-- Down migration
DROP TABLE "Notification";
DROP TYPE "NotificationType";
ALTER TABLE "User" DROP COLUMN "notification_settings";
```

## Troubleshooting

### Issue: Migration fails with "relation already exists"

**Solution**: The tables might already exist. Check your database and drop them manually if needed:

```sql
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TYPE IF EXISTS "NotificationType";
```

### Issue: Prisma client not updating

**Solution**:
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

### Issue: TypeScript errors after migration

**Solution**:
```bash
npm run build
# or
npx tsc --noEmit
```

## Verification Checklist

After running the migration:

- [ ] `Notification` table exists in database
- [ ] `NotificationType` enum exists
- [ ] User table has `notification_settings` column
- [ ] Indexes are created correctly
- [ ] Foreign key constraint is in place
- [ ] Prisma client regenerated
- [ ] TypeScript types updated
- [ ] Test notification can be created
- [ ] Application builds without errors

## Next Steps

After successful migration:

1. Add NotificationBell component to your layout
2. Configure email service
3. Integrate notification calls into your features
4. Test the complete flow
5. Deploy to production

See `docs/NOTIFICATION_SETUP.md` for complete setup instructions.

# File Upload System - Complete Installation Guide

## Quick Installation (5 Minutes)

```bash
# 1. Database migration
npx prisma generate
npx prisma migrate dev --name add_file_upload_system

# 2. Create upload directory
npm run files:setup

# 3. Configure environment (add to .env)
echo "STORAGE_PROVIDER=local" >> .env
echo "UPLOAD_DIR=/uploads" >> .env

# 4. Start server
npm run dev

# 5. Test at http://localhost:3000/examples/file-upload-demo
```

## Detailed Installation Steps

### Step 1: Database Setup

```bash
npx prisma generate
npx prisma migrate dev --name add_file_upload_system
npm run db:studio  # Verify tables created
```

### Step 2: File System

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### Step 3: Environment Variables

Add to `.env`:

```env
STORAGE_PROVIDER=local
FILE_UPLOAD_MAX_SIZE=104857600
UPLOAD_DIR=/uploads
```

### Step 4: Test

```bash
npm run dev
# Visit: http://localhost:3000/examples/file-upload-demo
```

## Verification Checklist

- [ ] Database migration successful
- [ ] `File` and `Product` tables exist
- [ ] `public/uploads/` directory created
- [ ] Environment variables set
- [ ] Demo page accessible
- [ ] File upload works
- [ ] File download works
- [ ] File delete works

## Troubleshooting

### Migration Failed
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Permission Denied
```bash
chmod 755 public/uploads
```

### Upload Returns 401
- Verify JWT token in Authorization header
- Check user role is 'service_provider' or 'admin'

## Documentation

- **Complete Guide**: `docs/FILE_UPLOAD_SYSTEM.md`
- **Quick Setup**: `docs/SETUP_GUIDE.md`
- **Migration**: `MIGRATION_GUIDE.md`
- **Summary**: `FILE_UPLOAD_SUMMARY.md`

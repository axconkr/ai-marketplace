# Database Setup Guide

## Issue Detected
❌ **PostgreSQL is not running** - Login API returns 500 error

## Quick Fix

### Option 1: Docker PostgreSQL (Recommended)
```bash
# Start PostgreSQL container
docker run -d \
  --name ai_marketplace_postgres \
  -e POSTGRES_USER=ai_marketplace \
  -e POSTGRES_PASSWORD=dev_password_change_in_prod \
  -e POSTGRES_DB=ai_marketplace \
  -p 5434:5432 \
  postgres:15-alpine

# Verify it's running
docker ps | grep ai_marketplace_postgres

# Test connection
pg_isready -h localhost -p 5434 -U ai_marketplace
```

### Option 2: Existing Docker Container
```bash
# Check for existing containers
docker ps -a | grep postgres

# Start existing container
docker start [container_name_or_id]
```

### Option 3: Local PostgreSQL Installation
```bash
# Start PostgreSQL service (macOS with Homebrew)
brew services start postgresql@15

# Or manually
pg_ctl -D /usr/local/var/postgresql@15 start
```

## After Starting Database

1. **Run Prisma migrations**:
```bash
cd /Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace
npx prisma migrate dev
```

2. **Verify connection**:
```bash
npx prisma db push
```

3. **Restart Next.js dev server**:
```bash
npm run dev
```

## Current Configuration

From `.env.local`:
```
DATABASE_URL="postgresql://ai_marketplace:dev_password_change_in_prod@localhost:5434/ai_marketplace"
```

- **Host**: localhost
- **Port**: 5434
- **User**: ai_marketplace
- **Password**: dev_password_change_in_prod
- **Database**: ai_marketplace

## Testing Login After Fix

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

Expected: 200 OK or 401 Unauthorized (not 500 Internal Server Error)

## Next Session Preparation

Before starting next session:
1. ✅ Ensure PostgreSQL is running
2. ✅ Run `npx prisma migrate dev`
3. ✅ Verify `.env.local` exists with correct DATABASE_URL
4. ✅ Test database connection with `pg_isready`

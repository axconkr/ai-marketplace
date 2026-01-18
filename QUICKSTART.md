# Authentication System - Quick Start Guide

Get up and running with the authentication system in 5 minutes.

## ⚡ Quick Setup

### 1. Install Dependencies (30 seconds)

```bash
npm install
```

### 2. Setup Environment (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Generate secrets (Linux/Mac)
openssl rand -base64 32  # Copy as JWT_SECRET
openssl rand -base64 32  # Copy as CSRF_SECRET

# Or use online generator: https://generate-secret.vercel.app/32
```

Edit `.env`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/ai_marketplace
JWT_SECRET=your-generated-secret-here
CSRF_SECRET=your-generated-secret-here
```

### 3. Setup Database (2 minutes)

```bash
# Start PostgreSQL (Docker)
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Wait 10 seconds for PostgreSQL to start
sleep 10

# Create database
docker exec -it postgres psql -U postgres -c "CREATE DATABASE ai_marketplace;"

# Run migrations
npx prisma generate
npx prisma db push
```

### 4. Start Server (10 seconds)

```bash
npm run dev
```

## 🎯 Test Authentication

### Test Registration (Browser/Postman)

POST to: `http://localhost:3000/api/auth/register`

Body:
```json
{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "name": "Test User"
}
```

### Test Login

POST to: `http://localhost:3000/api/auth/login`

Body:
```json
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

Cookies are set automatically!

### Test Current User

GET: `http://localhost:3000/api/auth/me`

Returns your user info if logged in.

## 🔧 Quick Examples

### Protect a Page

```typescript
// app/dashboard/page.tsx
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser(async (userId) => {
    return prisma.user.findUnique({ where: { id: userId } });
  });

  if (!user) redirect('/login');

  return <div>Welcome {user.name}!</div>;
}
```

### Protect an API Route

```typescript
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  return NextResponse.json({ message: 'Protected data' });
}
```

### Admin-Only Route

```typescript
// app/api/admin/route.ts
import { NextRequest } from 'next/server';
import { requireRole, UserRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authResponse = await requireRole(UserRole.ADMIN)(request);
  if (authResponse) return authResponse;

  return NextResponse.json({ message: 'Admin-only data' });
}
```

## 🧪 Quick Test with cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}' \
  -c cookies.txt

# Get current user
curl http://localhost:3000/api/auth/me -b cookies.txt

# Logout
curl -X POST http://localhost:3000/api/auth/logout -b cookies.txt
```

## 🌐 Optional: OAuth Setup

### Google OAuth (5 minutes)

1. Go to: https://console.cloud.google.com/
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add redirect URI: `http://localhost:3000/api/auth/google/callback`
5. Copy Client ID and Secret to .env:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

6. Test: Navigate to `http://localhost:3000/api/auth/google`

### GitHub OAuth (5 minutes)

1. Go to: https://github.com/settings/developers
2. New OAuth App
3. Callback URL: `http://localhost:3000/api/auth/github/callback`
4. Copy Client ID and Secret to .env:

```env
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

5. Test: Navigate to `http://localhost:3000/api/auth/github`

## 📚 Next Steps

- Read [AUTH_IMPLEMENTATION_GUIDE.md](./AUTH_IMPLEMENTATION_GUIDE.md) for detailed documentation
- Read [AUTH_TESTING.md](./AUTH_TESTING.md) for comprehensive testing
- Read [AUTH_IMPLEMENTATION_SUMMARY.md](./AUTH_IMPLEMENTATION_SUMMARY.md) for overview

## ⚠️ Common Issues

### Database connection fails
```bash
# Check PostgreSQL is running
docker ps

# Restart PostgreSQL
docker restart postgres
```

### JWT_SECRET error
Make sure JWT_SECRET is at least 32 characters long.

### Cookies not set
- Use localhost (not 127.0.0.1)
- Check browser allows cookies
- Verify NEXT_PUBLIC_APP_URL matches your URL

## 🎉 You're Ready!

Your authentication system is now fully functional with:

✅ Email/password authentication
✅ JWT-based sessions
✅ Role-based access control
✅ Rate limiting
✅ CSRF protection
✅ OAuth ready (Google, GitHub)

Start building your application! 🚀

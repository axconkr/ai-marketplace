# Authentication System Implementation Guide

Complete Next.js 14 authentication system with email/password and OAuth (Google, GitHub) support.

## 📁 Project Structure

```
src/
├── lib/
│   ├── auth/
│   │   ├── config.ts              # Authentication configuration
│   │   ├── types.ts               # TypeScript types and schemas
│   │   ├── password.ts            # Password hashing utilities
│   │   ├── jwt.ts                 # JWT token management
│   │   ├── csrf.ts                # CSRF protection
│   │   ├── rate-limit.ts          # Rate limiting
│   │   ├── session.ts             # Session management
│   │   ├── rbac.ts                # Role-based access control
│   │   ├── middleware.ts          # Auth middleware
│   │   ├── oauth/
│   │   │   ├── google.ts          # Google OAuth provider
│   │   │   └── github.ts          # GitHub OAuth provider
│   │   └── index.ts               # Main exports
│   └── db/
│       └── index.ts               # Database client
└── app/
    └── api/
        └── auth/
            ├── register/route.ts   # POST /api/auth/register
            ├── login/route.ts      # POST /api/auth/login
            ├── logout/route.ts     # POST /api/auth/logout
            ├── me/route.ts         # GET /api/auth/me
            ├── refresh/route.ts    # POST /api/auth/refresh
            ├── google/
            │   ├── route.ts        # GET /api/auth/google
            │   └── callback/route.ts
            └── github/
                ├── route.ts        # GET /api/auth/github
                └── callback/route.ts
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Minimum 32 characters (generate: `openssl rand -base64 32`)
- `CSRF_SECRET`: Minimum 32 characters (generate: `openssl rand -base64 32`)
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., http://localhost:3000)

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 4. Configure OAuth Providers (Optional)

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

#### GitHub OAuth:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

### 5. Start Development Server

```bash
npm run dev
```

## 📚 API Documentation

### Authentication Endpoints

#### 1. Register (Email/Password)

**POST** `/api/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "user" // Optional: user, client, service_provider
}
```

Response (201):
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "emailVerified": false
  },
  "accessToken": "eyJhbGci...",
  "message": "Registration successful. Please verify your email."
}
```

**Rate Limit**: 3 requests per hour per IP

#### 2. Login (Email/Password)

**POST** `/api/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Response (200):
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "accessToken": "eyJhbGci...",
  "message": "Login successful"
}
```

**Rate Limit**: 5 requests per 15 minutes per IP

#### 3. Logout

**POST** `/api/auth/logout`

Response (200):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### 4. Get Current User

**GET** `/api/auth/me`

Headers:
```
Cookie: auth_token=eyJhbGci...
```

Response (200):
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### 5. Refresh Token

**POST** `/api/auth/refresh`

Headers:
```
Cookie: refresh_token=eyJhbGci...
```

Response (200):
```json
{
  "success": true,
  "accessToken": "eyJhbGci...",
  "message": "Token refreshed successfully"
}
```

### OAuth Endpoints

#### 1. Initiate Google OAuth

**GET** `/api/auth/google?redirect=/dashboard`

Redirects to Google OAuth consent screen.

#### 2. Google OAuth Callback

**GET** `/api/auth/google/callback?code=...&state=...`

Handled automatically. Redirects to app with session cookie.

#### 3. Initiate GitHub OAuth

**GET** `/api/auth/github?redirect=/dashboard`

Redirects to GitHub OAuth authorization page.

#### 4. GitHub OAuth Callback

**GET** `/api/auth/github/callback?code=...&state=...`

Handled automatically. Redirects to app with session cookie.

## 🔒 Security Features

### 1. Password Security
- **Hashing**: bcrypt with 12 rounds
- **Validation**: Min 8 chars, uppercase, lowercase, number, special char
- **Rehashing**: Automatic rehash on bcrypt rounds change

### 2. JWT Tokens
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Flag**: Enabled in production
- **SameSite**: Lax (CSRF protection)

### 3. CSRF Protection
- **HMAC-based tokens**: SHA-256 hashing
- **State validation**: OAuth state parameters
- **Timing-safe comparison**: Prevents timing attacks

### 4. Rate Limiting
- **Login**: 5 attempts per 15 minutes
- **Register**: 3 attempts per hour
- **In-memory storage**: Single-server deployment
- **Auto-cleanup**: Expired entries removed every 5 minutes

### 5. Role-Based Access Control (RBAC)
- **Roles**: admin, service_provider, client, user
- **Permissions**: Fine-grained access control
- **Middleware**: Route protection utilities

## 🛠️ Usage Examples

### Server-Side Authentication Check

```typescript
// app/dashboard/page.tsx
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser(async (userId) => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  if (!user) {
    redirect('/login');
  }

  return <div>Welcome, {user.name}!</div>;
}
```

### Protected API Route

```typescript
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse; // Returns 401 if not authenticated

  // Get user info from request headers
  const userInfo = getUserFromRequest(request);

  return NextResponse.json({
    message: 'Protected data',
    user: userInfo,
  });
}
```

### Role-Based Protection

```typescript
// app/api/admin/route.ts
import { NextRequest } from 'next/server';
import { requireRole, UserRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Require admin role
  const authResponse = await requireRole(UserRole.ADMIN)(request);
  if (authResponse) return authResponse; // Returns 403 if not admin

  return NextResponse.json({ message: 'Admin-only data' });
}
```

### Permission-Based Protection

```typescript
// app/api/services/route.ts
import { NextRequest } from 'next/server';
import { requirePermission, Permission } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Require service creation permission
  const authResponse = await requirePermission(Permission.CREATE_SERVICE)(request);
  if (authResponse) return authResponse; // Returns 403 if no permission

  // Create service logic
  return NextResponse.json({ message: 'Service created' });
}
```

### Client-Side OAuth Login

```typescript
// components/LoginButtons.tsx
'use client';

export function LoginButtons() {
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google?redirect=/dashboard';
  };

  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github?redirect=/dashboard';
  };

  return (
    <div>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <button onClick={handleGitHubLogin}>Login with GitHub</button>
    </div>
  );
}
```

### Client-Side Email/Password Login

```typescript
// components/LoginForm.tsx
'use client';

import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = '/dashboard';
    } else {
      alert(data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

## 🧪 Testing Instructions

### 1. Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

### 2. Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt
```

### 3. Test Protected Route

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### 4. Test OAuth (Browser)

1. Navigate to: `http://localhost:3000/api/auth/google`
2. Complete Google OAuth flow
3. Should redirect back with session cookie

### 5. Test Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

## 🔧 TypeScript Configuration

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 📊 Database Schema

The Prisma schema includes:

- **User Model**: Email, password, OAuth fields, role
- **Session Model**: Refresh token storage
- **Indexes**: Optimized queries on email and OAuth fields

## 🚨 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": [] // Optional: validation errors
}
```

Common status codes:
- `400`: Bad request / validation error
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (insufficient permissions)
- `429`: Too many requests (rate limit)
- `500`: Internal server error

## 🔄 Token Refresh Flow

1. Access token expires (15 min)
2. Client receives 401 response
3. Client calls `/api/auth/refresh` with refresh token cookie
4. Server validates refresh token
5. Server issues new access token
6. Client retries original request

## 🛡️ Production Checklist

- [ ] Set strong `JWT_SECRET` and `CSRF_SECRET`
- [ ] Configure `DATABASE_URL` for production database
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (secure cookies)
- [ ] Configure OAuth redirect URLs for production domain
- [ ] Set up database migrations
- [ ] Configure rate limiting for production (Redis recommended)
- [ ] Implement email verification
- [ ] Set up monitoring and logging
- [ ] Configure CORS properly
- [ ] Implement password reset functionality
- [ ] Set up session invalidation on password change
- [ ] Configure backup and recovery

## 📝 Next Steps

1. **Email Verification**: Implement email verification flow
2. **Password Reset**: Add forgot password functionality
3. **Session Management**: Track active sessions per user
4. **Account Settings**: User profile update endpoints
5. **2FA**: Two-factor authentication support
6. **Social Providers**: Add more OAuth providers
7. **Audit Logging**: Track authentication events
8. **Redis**: Replace in-memory rate limiting with Redis

## 🤝 Support

For questions or issues, refer to the inline code documentation or create an issue in the project repository.

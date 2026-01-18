# Production Security Hardening Guide

## Overview

Comprehensive security checklist and implementation guide for production deployment of the AI Marketplace platform.

## 1. Environment Security

### Secret Management

**Vercel Environment Variables**:
```bash
# Generate secure secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET

# Add to Vercel via CLI
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production
vercel env add STRIPE_SECRET_KEY production
```

**Security Checklist**:
- [ ] All secrets rotated from development
- [ ] No secrets in Git history
- [ ] Separate secrets for dev/staging/prod
- [ ] Secret access logged and monitored
- [ ] 2FA enabled on all service accounts

### API Key Rotation Schedule
- **JWT Secrets**: Every 90 days
- **Payment Keys**: Annually or on breach
- **OAuth Credentials**: Annually
- **Email Service Keys**: Every 6 months

## 2. Application Security

### Authentication Hardening

**Password Policy**:
```typescript
// lib/auth/password-policy.ts
export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  passwordHistory: 5, // Cannot reuse last 5 passwords
};

export function validatePassword(password: string): boolean {
  if (password.length < PASSWORD_POLICY.minLength) return false;
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) return false;
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) return false;
  if (PASSWORD_POLICY.requireNumbers && !/[0-9]/.test(password)) return false;
  if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*]/.test(password)) return false;
  return true;
}
```

**Session Management**:
```typescript
// lib/auth/session.ts
export const SESSION_CONFIG = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  maxActiveSessions: 5,
  renewalThreshold: 5 * 60 * 1000, // Renew 5 min before expiry
  ipBindingEnabled: true,
  userAgentBindingEnabled: true,
};
```

**Account Lockout**:
```typescript
// lib/auth/lockout.ts
export async function checkAccountLockout(userId: string): Promise<boolean> {
  const attempts = await prisma.loginAttempt.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - PASSWORD_POLICY.lockoutDuration),
      },
    },
  });

  return attempts >= PASSWORD_POLICY.maxAttempts;
}
```

### Input Validation

**Request Validation Middleware**:
```typescript
// middleware/validate.ts
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export function validateRequest(schema: z.ZodSchema) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validated = schema.parse(body);
      return validated;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
  };
}

// Usage
const createPromptSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().min(0).max(1000000),
  category: z.enum(['ai-art', 'chatgpt', 'coding', 'writing', 'business']),
});

export const POST = validateRequest(createPromptSchema);
```

**SQL Injection Prevention**:
- Always use Prisma parameterized queries
- Never concatenate user input into SQL
- Validate and sanitize all inputs
- Use prepared statements for raw queries

```typescript
// Good: Parameterized query
const user = await prisma.user.findUnique({
  where: { email: userInput },
});

// Bad: String concatenation (vulnerable)
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = '${userInput}'
`;

// Good: Using Prisma.sql with parameters
const user = await prisma.$queryRaw(
  Prisma.sql`SELECT * FROM users WHERE email = ${userInput}`
);
```

**XSS Prevention**:
```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
  });
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

### Rate Limiting

**Implementation**:
```typescript
// middleware/rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function rateLimit(
  identifier: string,
  limit: number,
  window: number
): Promise<{ success: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, window);
  }

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}

// Usage in API routes
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success, remaining } = await rateLimit(ip, 100, 60); // 100 req/min

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
    );
  }

  // Process request...
}
```

**Rate Limit Tiers**:
```typescript
export const RATE_LIMITS = {
  anonymous: { requests: 20, window: 60 }, // 20 req/min
  authenticated: { requests: 100, window: 60 }, // 100 req/min
  premium: { requests: 500, window: 60 }, // 500 req/min
  payment: { requests: 10, window: 60 }, // 10 payment req/min
};
```

## 3. Network Security

### Security Headers

**Next.js Configuration**:
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.stripe.com https://*.supabase.co;
      frame-src https://js.stripe.com;
    `.replace(/\s+/g, ' ').trim(),
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### CORS Configuration

```typescript
// middleware/cors.ts
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://aimarketplace.com',
  'https://www.aimarketplace.com',
  'https://admin.aimarketplace.com',
];

export function corsMiddleware(req: NextRequest) {
  const origin = req.headers.get('origin');

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse('CORS policy violation', { status: 403 });
  }

  const response = NextResponse.next();

  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET,OPTIONS,PATCH,DELETE,POST,PUT'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
  }

  return response;
}
```

## 4. Database Security

### Connection Security

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Use connection pooling
const connectionString = `${process.env.DATABASE_URL}?pgbouncer=true&connection_limit=10`;
```

### Row Level Security (RLS)

```sql
-- Enable RLS on tables
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can read own prompts"
ON prompts FOR SELECT
USING (auth.uid() = seller_id);

-- Users can only update their own data
CREATE POLICY "Users can update own prompts"
ON prompts FOR UPDATE
USING (auth.uid() = seller_id);

-- Users can only view their own orders
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
```

### Data Encryption

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

## 5. File Upload Security

### Secure File Handling

```typescript
// lib/upload/security.ts
import { createHash } from 'crypto';
import fileType from 'file-type';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function validateFile(
  file: File
): Promise<{ valid: boolean; error?: string }> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large' };
  }

  // Check file type by content (not just extension)
  const buffer = await file.arrayBuffer();
  const type = await fileType.fromBuffer(Buffer.from(buffer));

  if (!type || !ALLOWED_TYPES.includes(type.mime)) {
    return { valid: false, error: 'Invalid file type' };
  }

  return { valid: true };
}

export function generateSecureFilename(originalName: string): string {
  const ext = originalName.split('.').pop();
  const hash = createHash('sha256')
    .update(`${Date.now()}-${Math.random()}`)
    .digest('hex');
  return `${hash}.${ext}`;
}
```

### Virus Scanning (ClamAV Integration)

```typescript
// lib/upload/virus-scan.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function scanFile(filePath: string): Promise<boolean> {
  try {
    await execAsync(`clamdscan ${filePath}`);
    return true; // No virus found
  } catch (error) {
    return false; // Virus detected or scan failed
  }
}
```

## 6. Payment Security

### Stripe Security

```typescript
// lib/payments/stripe-security.ts
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Verify webhook signatures
export async function verifyStripeWebhook(
  body: string,
  signature: string
): Promise<Stripe.Event | null> {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}

// Implement idempotency
export async function createPaymentIntent(
  amount: number,
  orderId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create(
    {
      amount,
      currency: 'krw',
      metadata: { orderId },
    },
    {
      idempotencyKey: orderId,
    }
  );
}
```

### PCI DSS Compliance

**Never Store**:
- Full credit card numbers
- CVV/CVC codes
- Card PINs
- Magnetic stripe data

**Use Tokenization**:
```typescript
// Client-side only
const { token, error } = await stripe.createToken(cardElement);
// Send token to server, never raw card details
```

## 7. Logging & Monitoring

### Security Event Logging

```typescript
// lib/security/audit-log.ts
export async function logSecurityEvent(event: {
  type: 'login' | 'failed_login' | 'password_change' | 'permission_change' | 'suspicious_activity';
  userId?: string;
  ip: string;
  userAgent: string;
  details: Record<string, any>;
}) {
  await prisma.securityLog.create({
    data: {
      type: event.type,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      details: event.details,
      timestamp: new Date(),
    },
  });

  // Alert on suspicious activity
  if (event.type === 'suspicious_activity') {
    await sendSecurityAlert(event);
  }
}
```

### Suspicious Activity Detection

```typescript
// lib/security/detection.ts
export async function detectSuspiciousActivity(
  userId: string,
  ip: string
): Promise<boolean> {
  const recentActivity = await prisma.securityLog.findMany({
    where: {
      userId,
      timestamp: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      },
    },
  });

  // Check for:
  // - Multiple IPs in short time
  // - Multiple failed logins
  // - Unusual transaction patterns

  const uniqueIps = new Set(recentActivity.map(a => a.ip));
  const failedLogins = recentActivity.filter(a => a.type === 'failed_login');

  return uniqueIps.size > 3 || failedLogins.length > 5;
}
```

## 8. Incident Response Plan

### Security Breach Procedure

1. **Immediate Actions** (0-15 minutes)
   - [ ] Isolate affected systems
   - [ ] Preserve evidence
   - [ ] Notify security team
   - [ ] Enable incident response mode

2. **Assessment** (15-60 minutes)
   - [ ] Identify scope of breach
   - [ ] Assess data exposure
   - [ ] Determine attack vector
   - [ ] Estimate user impact

3. **Containment** (1-4 hours)
   - [ ] Patch vulnerabilities
   - [ ] Rotate all credentials
   - [ ] Block malicious IPs
   - [ ] Implement additional monitoring

4. **Notification** (4-24 hours)
   - [ ] Notify affected users
   - [ ] Report to authorities (if required)
   - [ ] Public disclosure (if necessary)
   - [ ] Update status page

5. **Recovery** (1-7 days)
   - [ ] Restore services
   - [ ] Verify system integrity
   - [ ] Enhanced monitoring
   - [ ] User support

6. **Post-Mortem** (1-2 weeks)
   - [ ] Root cause analysis
   - [ ] Document lessons learned
   - [ ] Update security procedures
   - [ ] Implement preventive measures

## 9. Compliance Checklist

### GDPR Compliance
- [ ] User data inventory
- [ ] Privacy policy published
- [ ] Cookie consent implemented
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] Data breach notification process
- [ ] Data processing agreements

### OWASP Top 10 Protection
- [ ] Injection prevention (SQL, XSS)
- [ ] Broken authentication protection
- [ ] Sensitive data encryption
- [ ] XML external entities prevention
- [ ] Broken access control mitigation
- [ ] Security misconfiguration review
- [ ] XSS protection
- [ ] Insecure deserialization prevention
- [ ] Component vulnerability scanning
- [ ] Logging and monitoring

## 10. Security Checklist

### Pre-Launch
- [ ] All secrets rotated
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection tests passed
- [ ] XSS protection verified
- [ ] CSRF tokens implemented
- [ ] File upload security tested
- [ ] Payment security verified
- [ ] Logging configured

### Post-Launch
- [ ] Security monitoring active
- [ ] Incident response plan tested
- [ ] Team security training completed
- [ ] Regular security audits scheduled
- [ ] Vulnerability scanning automated
- [ ] Bug bounty program considered

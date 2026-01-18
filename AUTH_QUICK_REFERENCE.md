# Auth API Quick Reference

## Endpoints

| Endpoint | Method | Auth | Body |
|----------|--------|------|------|
| `/api/auth/register` | POST | No | `{ email, password, name?, role? }` |
| `/api/auth/login` | POST | No | `{ email, password }` |
| `/api/auth/me` | GET | Yes | - |
| `/api/auth/logout` | POST | Yes | `{ refreshToken? }` |
| `/api/auth/refresh` | POST | No | `{ refreshToken }` |

## Quick Start

### 1. Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"User"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 3. Get User (requires token)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

### 5. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Response Codes

- `200` - Success
- `201` - Created (register)
- `400` - Invalid input
- `401` - Invalid credentials / Unauthorized
- `404` - Not found
- `409` - Email already exists
- `500` - Server error

## Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with 7-day expiration
- Refresh tokens with 30-day expiration
- Session management in database
- Input validation with Zod
- No user enumeration (generic error messages)

## Integration Examples

### React/Next.js Frontend
```typescript
// Login
const login = async (email: string, password: string) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const { user, token, refreshToken } = await res.json();
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
  return user;
};

// Protected API call
const fetchProtected = async (url: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};
```

### API Route Protection
```typescript
import { requireAuth, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Require any authenticated user
  const user = await requireAuth(request);
  
  // Or require specific role
  const seller = await requireRole(request, ['seller', 'admin']);
  
  return NextResponse.json({ data: '...' });
}
```

## Testing

Run automated test suite:
```bash
bash test-auth-api.sh
```

See `AUTH_API_TESTING.md` for detailed testing guide.

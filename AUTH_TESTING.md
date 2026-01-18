# Authentication System Testing Guide

Comprehensive testing guide for the authentication system.

## 🧪 Test Categories

### 1. Unit Tests (Password Utilities)

#### Password Hashing
```typescript
import { hashPassword, verifyPassword, validatePasswordStrength } from '@/lib/auth';

// Test password hashing
const password = 'SecurePass123!';
const hash = await hashPassword(password);
console.assert(hash !== password, 'Password should be hashed');

// Test password verification
const isValid = await verifyPassword(password, hash);
console.assert(isValid === true, 'Valid password should verify');

const isInvalid = await verifyPassword('WrongPassword', hash);
console.assert(isInvalid === false, 'Invalid password should not verify');

// Test password strength validation
const weak = validatePasswordStrength('weak');
console.assert(weak.valid === false, 'Weak password should fail');

const strong = validatePasswordStrength('SecurePass123!');
console.assert(strong.valid === true, 'Strong password should pass');
```

### 2. Integration Tests (JWT)

#### Token Generation and Verification
```typescript
import { generateAccessToken, verifyToken } from '@/lib/auth';

const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user' as UserRole,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Generate token
const token = generateAccessToken(mockUser);
console.assert(typeof token === 'string', 'Token should be a string');

// Verify token
const payload = verifyToken(token);
console.assert(payload.userId === mockUser.id, 'User ID should match');
console.assert(payload.email === mockUser.email, 'Email should match');
console.assert(payload.role === mockUser.role, 'Role should match');
```

### 3. API Endpoint Tests

#### Registration Endpoint
```bash
#!/bin/bash

# Test successful registration
echo "Testing registration..."
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "name": "New User"
  }' | jq

# Test duplicate email
echo "Testing duplicate email..."
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "name": "Duplicate User"
  }' | jq

# Test weak password
echo "Testing weak password..."
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "another@example.com",
    "password": "weak",
    "name": "Another User"
  }' | jq

# Test invalid email
echo "Testing invalid email..."
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "SecurePass123!",
    "name": "Invalid Email"
  }' | jq
```

#### Login Endpoint
```bash
#!/bin/bash

# Test successful login
echo "Testing login..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt | jq

# Test invalid credentials
echo "Testing invalid credentials..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword"
  }' | jq

# Test non-existent user
echo "Testing non-existent user..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "SecurePass123!"
  }' | jq
```

#### Get Current User
```bash
#!/bin/bash

# Test with valid session
echo "Testing get current user (authenticated)..."
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt | jq

# Test without session
echo "Testing get current user (unauthenticated)..."
curl -X GET http://localhost:3000/api/auth/me | jq
```

#### Logout
```bash
#!/bin/bash

# Test logout
echo "Testing logout..."
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt | jq

# Verify session is cleared
echo "Testing access after logout..."
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt | jq
```

### 4. Rate Limiting Tests

```bash
#!/bin/bash

# Test login rate limiting (5 attempts per 15 minutes)
echo "Testing login rate limiting..."
for i in {1..6}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "WrongPassword"
    }' \
    -w "\nStatus: %{http_code}\n" | jq
  echo "---"
done

# Test registration rate limiting (3 attempts per hour)
echo "Testing registration rate limiting..."
for i in {1..4}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"user${i}@example.com\",
      \"password\": \"SecurePass123!\",
      \"name\": \"User ${i}\"
    }" \
    -w "\nStatus: %{http_code}\n" | jq
  echo "---"
done
```

### 5. OAuth Flow Tests

#### Google OAuth (Manual Browser Testing)
1. Navigate to: `http://localhost:3000/api/auth/google`
2. Complete Google sign-in
3. Should redirect back to app with session
4. Verify session: `curl http://localhost:3000/api/auth/me -b cookies.txt`

#### GitHub OAuth (Manual Browser Testing)
1. Navigate to: `http://localhost:3000/api/auth/github`
2. Complete GitHub authorization
3. Should redirect back to app with session
4. Verify session: `curl http://localhost:3000/api/auth/me -b cookies.txt`

### 6. RBAC Tests

#### Permission Checking
```typescript
import { hasPermission, canAccessResource, UserRole, Permission } from '@/lib/auth';

// Test admin has all permissions
console.assert(
  hasPermission(UserRole.ADMIN, Permission.MANAGE_PLATFORM),
  'Admin should have platform management permission'
);

// Test service provider permissions
console.assert(
  hasPermission(UserRole.SERVICE_PROVIDER, Permission.CREATE_SERVICE),
  'Service provider should create services'
);

console.assert(
  !hasPermission(UserRole.SERVICE_PROVIDER, Permission.MANAGE_PLATFORM),
  'Service provider should not manage platform'
);

// Test client permissions
console.assert(
  hasPermission(UserRole.CLIENT, Permission.CREATE_ORDER),
  'Client should create orders'
);

console.assert(
  !hasPermission(UserRole.CLIENT, Permission.CREATE_SERVICE),
  'Client should not create services'
);

// Test resource ownership
const userId = 'user123';
const resourceOwnerId = 'user123';
const otherUserId = 'user456';

console.assert(
  canAccessResource(userId, UserRole.CLIENT, Permission.VIEW_SERVICE, resourceOwnerId),
  'User should access their own resource'
);

console.assert(
  !canAccessResource(otherUserId, UserRole.CLIENT, Permission.EDIT_SERVICE, resourceOwnerId),
  'User should not edit others resources without permission'
);
```

### 7. Security Tests

#### CSRF Protection
```bash
#!/bin/bash

# Test OAuth without state parameter
echo "Testing CSRF protection..."
curl -X GET "http://localhost:3000/api/auth/google/callback?code=test" \
  -w "\nStatus: %{http_code}\n"

# Should redirect to login with CSRF error
```

#### SQL Injection
```bash
#!/bin/bash

# Test SQL injection in login
echo "Testing SQL injection protection..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com OR 1=1--",
    "password": "anything"
  }' | jq

# Should fail gracefully without exposing database errors
```

#### XSS Protection
```bash
#!/bin/bash

# Test XSS in registration
echo "Testing XSS protection..."
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "xss@example.com",
    "password": "SecurePass123!",
    "name": "<script>alert(\"XSS\")</script>"
  }' | jq

# Should sanitize or reject malicious input
```

### 8. Session Management Tests

#### Token Refresh
```bash
#!/bin/bash

# Login to get tokens
echo "Logging in..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt | jq

# Wait for access token to expire (or modify config for testing)
echo "Waiting for token to expire..."
# sleep 900 # 15 minutes

# Test token refresh
echo "Testing token refresh..."
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt | jq

# Verify new token works
echo "Testing with refreshed token..."
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt | jq
```

### 9. Error Handling Tests

```bash
#!/bin/bash

# Test malformed JSON
echo "Testing malformed JSON..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d 'invalid json' | jq

# Test missing required fields
echo "Testing missing fields..."
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }' | jq

# Test invalid token
echo "Testing invalid token..."
curl -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: auth_token=invalid.token.here" | jq
```

## 📊 Test Coverage Checklist

- [ ] **Password Security**
  - [ ] Hashing works correctly
  - [ ] Verification works correctly
  - [ ] Weak passwords rejected
  - [ ] Strong passwords accepted
  - [ ] Rehashing on config change

- [ ] **JWT Tokens**
  - [ ] Access token generation
  - [ ] Refresh token generation
  - [ ] Token verification
  - [ ] Token expiration
  - [ ] Token refresh flow

- [ ] **API Endpoints**
  - [ ] Registration success
  - [ ] Registration validation errors
  - [ ] Login success
  - [ ] Login failure
  - [ ] Logout
  - [ ] Get current user
  - [ ] Token refresh

- [ ] **OAuth**
  - [ ] Google OAuth flow
  - [ ] GitHub OAuth flow
  - [ ] CSRF protection
  - [ ] State validation
  - [ ] User creation/linking

- [ ] **Rate Limiting**
  - [ ] Login rate limit enforced
  - [ ] Registration rate limit enforced
  - [ ] Rate limit headers present
  - [ ] Rate limit reset

- [ ] **RBAC**
  - [ ] Admin permissions
  - [ ] Service provider permissions
  - [ ] Client permissions
  - [ ] User permissions
  - [ ] Resource ownership checks

- [ ] **Security**
  - [ ] CSRF protection
  - [ ] SQL injection protection
  - [ ] XSS protection
  - [ ] Password strength enforcement
  - [ ] Secure cookie flags
  - [ ] HTTP-only cookies

- [ ] **Session Management**
  - [ ] Session creation
  - [ ] Session validation
  - [ ] Session refresh
  - [ ] Session deletion

- [ ] **Error Handling**
  - [ ] Validation errors
  - [ ] Authentication errors
  - [ ] Authorization errors
  - [ ] Rate limit errors
  - [ ] Server errors

## 🚀 Running All Tests

Create a test script:

```bash
#!/bin/bash
# test-auth.sh

echo "==================================="
echo "Authentication System Test Suite"
echo "==================================="

# 1. Registration Tests
echo -e "\n1. Testing Registration..."
./tests/registration.sh

# 2. Login Tests
echo -e "\n2. Testing Login..."
./tests/login.sh

# 3. Session Tests
echo -e "\n3. Testing Session Management..."
./tests/session.sh

# 4. Rate Limiting Tests
echo -e "\n4. Testing Rate Limiting..."
./tests/rate-limit.sh

# 5. RBAC Tests
echo -e "\n5. Testing RBAC..."
./tests/rbac.sh

# 6. Security Tests
echo -e "\n6. Testing Security..."
./tests/security.sh

echo -e "\n==================================="
echo "All tests completed!"
echo "==================================="
```

Make executable and run:
```bash
chmod +x test-auth.sh
./test-auth.sh
```

## 📈 Performance Testing

### Load Testing with Apache Bench
```bash
# Test login endpoint
ab -n 1000 -c 10 -p login.json -T application/json \
  http://localhost:3000/api/auth/login

# Test registration endpoint
ab -n 100 -c 5 -p register.json -T application/json \
  http://localhost:3000/api/auth/register
```

### Stress Testing
```bash
# Simulate concurrent users
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "user'$i'@example.com",
      "password": "SecurePass123!"
    }' &
done
wait
```

## 🐛 Debugging Tips

1. **Enable verbose logging**:
   ```typescript
   // lib/db/index.ts
   log: ['query', 'error', 'warn', 'info']
   ```

2. **Check cookies**:
   ```bash
   curl -v http://localhost:3000/api/auth/login ... 2>&1 | grep "Set-Cookie"
   ```

3. **Decode JWT tokens**:
   ```bash
   # Use jwt.io or
   echo "TOKEN_HERE" | cut -d'.' -f2 | base64 -d | jq
   ```

4. **Monitor rate limiting**:
   ```typescript
   // Add logging to rate-limit.ts
   console.log('Rate limit check:', { key, count, resetAt });
   ```

## ✅ Test Results Format

Document test results:

```markdown
## Test Results - [Date]

### Registration Tests
- ✅ Successful registration
- ✅ Duplicate email rejection
- ✅ Password validation
- ✅ Email validation

### Login Tests
- ✅ Successful login
- ✅ Invalid credentials
- ✅ Non-existent user
- ✅ Rate limiting

[Continue for all test categories...]

### Issues Found
1. [Issue description]
   - Severity: High/Medium/Low
   - Steps to reproduce
   - Expected vs actual behavior

### Performance Metrics
- Average response time: XXms
- P95 response time: XXms
- P99 response time: XXms
- Throughput: XX req/s
```

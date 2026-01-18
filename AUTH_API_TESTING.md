# Authentication API Testing Guide

## Endpoints Overview

All authentication endpoints are now implemented and available:

1. **POST /api/auth/register** - User registration
2. **POST /api/auth/login** - User login
3. **GET /api/auth/me** - Get current user
4. **POST /api/auth/logout** - User logout
5. **POST /api/auth/refresh** - Refresh access token

---

## 1. User Registration

### Endpoint
```
POST http://localhost:3000/api/auth/register
```

### Request Body
```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User",
  "role": "user"
}
```

### cURL Command
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "user"
  }'
```

### Success Response (201)
```json
{
  "user": {
    "id": "clxxx...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

**409 - Email already exists**
```json
{
  "error": "Email already registered"
}
```

**400 - Invalid input**
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

## 2. User Login

### Endpoint
```
POST http://localhost:3000/api/auth/login
```

### Request Body
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### cURL Command
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Success Response (200)
```json
{
  "user": {
    "id": "clxxx...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

**401 - Invalid credentials**
```json
{
  "error": "Invalid email or password"
}
```

---

## 3. Get Current User

### Endpoint
```
GET http://localhost:3000/api/auth/me
```

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### cURL Command
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Success Response (200)
```json
{
  "user": {
    "id": "clxxx...",
    "email": "test@example.com",
    "name": "Test User",
    "avatar": null,
    "role": "user",
    "emailVerified": false,
    "createdAt": "2024-12-29T13:00:00.000Z",
    "updatedAt": "2024-12-29T13:00:00.000Z"
  }
}
```

### Error Responses

**401 - Missing or invalid token**
```json
{
  "error": "Authentication required"
}
```

---

## 4. User Logout

### Endpoint
```
POST http://localhost:3000/api/auth/logout
```

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Body (Optional)
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

### cURL Command
```bash
# Logout specific session
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'

# Logout all sessions
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Success Response (200)
```json
{
  "success": true
}
```

---

## 5. Refresh Access Token

### Endpoint
```
POST http://localhost:3000/api/auth/refresh
```

### Request Body
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

### cURL Command
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Success Response (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user"
  }
}
```

### Error Responses

**401 - Invalid or expired refresh token**
```json
{
  "error": "Invalid or expired refresh token"
}
```

---

## Complete Testing Workflow

### Step 1: Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepass123",
    "name": "New User"
  }'
```

Save the returned `token` and `user.id`.

### Step 2: Login with credentials
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepass123"
  }'
```

Save the returned `token` and `refreshToken`.

### Step 3: Get current user info
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 4: Refresh the access token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Step 5: Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
2. **JWT Tokens**: Access tokens expire in 7 days, refresh tokens in 30 days
3. **Session Management**: Refresh tokens are stored in database and can be revoked
4. **Input Validation**: All inputs are validated using Zod schemas
5. **Error Handling**: Consistent error responses with proper HTTP status codes

---

## Token Expiration

- **Access Token**: 7 days
- **Refresh Token**: 30 days

When the access token expires, use the refresh token endpoint to get a new access token.

---

## Environment Variables Required

Ensure `.env.local` has:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key-here"
```

---

## Common HTTP Status Codes

- **200**: Success (GET, POST for existing resources)
- **201**: Created (POST for new resources)
- **400**: Bad Request (Invalid input)
- **401**: Unauthorized (Missing or invalid authentication)
- **403**: Forbidden (Insufficient permissions)
- **404**: Not Found (Resource doesn't exist)
- **409**: Conflict (Duplicate resource, e.g., email already exists)
- **500**: Internal Server Error (Server-side error)

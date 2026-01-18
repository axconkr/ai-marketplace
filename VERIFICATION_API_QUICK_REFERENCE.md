# Verification API Quick Reference

## Base URL
```
http://localhost:3000/api/verifications
```

## Authentication
All endpoints require JWT authentication via Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints Summary

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/verifications` | All | List verifications (filtered by role) |
| POST | `/api/verifications` | Seller, Admin | Request verification |
| GET | `/api/verifications/:id` | Owner, Verifier, Admin | Get verification details |
| POST | `/api/verifications/:id/claim` | Verifier, Admin | Claim verification |
| POST | `/api/verifications/:id/submit` | Verifier, Admin | Submit review |
| POST | `/api/verifications/:id/assign` | Admin | Assign to verifier |
| POST | `/api/verifications/:id/cancel` | Owner, Admin | Cancel verification |
| GET | `/api/verifications/stats` | Admin | Platform statistics |
| GET | `/api/verifications/verifier-stats` | Verifier, Admin | Verifier statistics |
| GET | `/api/verifications/my-verifications` | Seller, Admin | Seller's verifications |
| GET | `/api/verifications/assigned-to-me` | Verifier, Admin | Verifier's assignments |

## Verification Levels & Pricing

| Level | Name | Price | Platform | Verifier | Features |
|-------|------|-------|----------|----------|----------|
| 0 | Automatic | Free | $0 | $0 | File check, virus scan, metadata |
| 1 | Basic Review | $50 | $15 | $35 | + Code quality, documentation |
| 2 | Expert Review | $150 | $45 | $105 | + Security, performance (Soon) |
| 3 | Security Audit | $500 | $150 | $350 | + Audit, load test (Soon) |

## Status Flow
```
PENDING → ASSIGNED → IN_PROGRESS → COMPLETED → APPROVED
                                              ↘ REJECTED
```

## Common Request Examples

### 1. Request Verification (Seller)
```bash
curl -X POST http://localhost:3000/api/verifications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": "clxxx", "level": 1}'
```

### 2. List My Verifications (Seller)
```bash
curl http://localhost:3000/api/verifications/my-verifications \
  -H "Authorization: Bearer $TOKEN"
```

### 3. List Available Verifications (Verifier)
```bash
curl http://localhost:3000/api/verifications?status=PENDING \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Claim Verification (Verifier)
```bash
curl -X POST http://localhost:3000/api/verifications/clxxx/claim \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Submit Review (Verifier)
```bash
curl -X POST http://localhost:3000/api/verifications/clxxx/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 85,
    "comments": "Good quality",
    "approved": true,
    "badges": ["security", "quality"],
    "improvements": ["Add tests"]
  }'
```

### 6. Get Verifier Stats (Verifier)
```bash
curl http://localhost:3000/api/verifications/verifier-stats \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Get Platform Stats (Admin)
```bash
curl http://localhost:3000/api/verifications/stats \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Assign Verification (Admin)
```bash
curl -X POST http://localhost:3000/api/verifications/clxxx/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"verifierId": "clyyyy"}'
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

## HTTP Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate verification)
- **500** - Internal Server Error

## File Locations

**API Routes**: `/app/api/verifications/`
**Types**: `/lib/types/verification.ts`
**Auth**: `/lib/auth.ts`
**Database**: `/prisma/schema.prisma`
**Documentation**: `/VERIFICATION_API_IMPLEMENTATION.md`

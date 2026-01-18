# Product API Quick Start Guide

Fast setup and testing guide for the Product CRUD API.

## 1. Quick Setup (5 minutes)

```bash
# Clone and install
cd AI_marketplace
npm install

# Setup environment
cat > .env.local << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/ai_marketplace"
JWT_SECRET="your-super-secret-jwt-key-change-this"
NODE_ENV="development"
EOF

# Setup database
npx prisma migrate dev
npx prisma generate

# Start server
npm run dev
```

## 2. Create Test User & Get JWT Token

You'll need JWT tokens for testing. Create test users in your database:

```sql
-- Run in your PostgreSQL client
INSERT INTO users (id, email, name, role, seller_tier, email_verified)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'seller@test.com', 'Test Seller', 'seller', 'verified', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'admin@test.com', 'Test Admin', 'admin', NULL, true);
```

Then generate JWT tokens (use a JWT generator or create a simple script):

```javascript
// generate-token.js
import { SignJWT } from 'jose';

async function generateToken(userId, email, role) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);
  console.log(`${role.toUpperCase()}_TOKEN="${token}"`);
}

generateToken('550e8400-e29b-41d4-a716-446655440001', 'seller@test.com', 'seller');
generateToken('550e8400-e29b-41d4-a716-446655440002', 'admin@test.com', 'admin');
```

```bash
node generate-token.js
# Copy the output tokens
```

## 3. Quick Test (2 minutes)

### Set environment variables:
```bash
export API_URL="http://localhost:3000"
export SELLER_TOKEN="your_seller_jwt_token_here"
export ADMIN_TOKEN="your_admin_jwt_token_here"
```

### Test workflow:

```bash
# 1. Create product
curl -X POST $API_URL/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "title": "My First Product",
    "description": "This is a test product",
    "category": "n8n",
    "tags": ["automation", "test"],
    "pricing_model": "one_time",
    "price": 29.99,
    "currency": "USD"
  }' | jq

# Save the product ID from response
export PRODUCT_ID="paste-product-id-here"

# 2. Publish product (draft → pending)
curl -X PATCH $API_URL/api/products/$PRODUCT_ID/publish \
  -H "Authorization: Bearer $SELLER_TOKEN" | jq

# 3. Approve product (pending → active) - as admin
curl -X PATCH $API_URL/api/products/$PRODUCT_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# 4. Search products (public - no auth needed)
curl "$API_URL/api/products?page=1&limit=10" | jq

# 5. Get product details (public)
curl "$API_URL/api/products/$PRODUCT_ID" | jq
```

## 4. Common Operations

### Create product
```bash
curl -X POST $API_URL/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"title":"Product","description":"Description","category":"n8n","tags":["tag"],"pricing_model":"one_time","price":49.99}'
```

### Update product
```bash
curl -X PUT $API_URL/api/products/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"price":59.99}'
```

### Search products
```bash
# Basic search
curl "$API_URL/api/products?search=automation&page=1&limit=10"

# With filters
curl "$API_URL/api/products?category=n8n&min_price=10&max_price=100&sort_by=popular"

# Seller's products
curl "$API_URL/api/products/seller/550e8400-e29b-41d4-a716-446655440001"
```

### Delete product
```bash
curl -X DELETE $API_URL/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

## 5. Debugging

### Check database
```bash
# Open Prisma Studio
npx prisma studio
# Navigate to http://localhost:5555
```

### Check logs
```bash
# Server logs show in the terminal where you ran `npm run dev`
# Look for "API Error:" messages
```

### Common issues

**401 Unauthorized**
- Check JWT token is valid and not expired
- Verify Authorization header format: `Bearer <token>`

**403 Forbidden**
- Check user role (seller, admin)
- Verify ownership for update/delete operations

**400 Bad Request**
- Review validation error details in response
- Check required fields and data types

**404 Not Found**
- Verify product ID is correct UUID format
- Check product status (draft/pending products not public)

## 6. API Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/products | Seller | Create product |
| GET | /api/products | Optional | List/search products |
| GET | /api/products/[id] | Optional | Get product details |
| PUT | /api/products/[id] | Owner/Admin | Update product |
| DELETE | /api/products/[id] | Owner/Admin | Delete product |
| PATCH | /api/products/[id]/publish | Owner | Publish product |
| PATCH | /api/products/[id]/approve | Admin | Approve product |
| GET | /api/products/seller/[id] | Optional | Get seller's products |

## 7. Full Documentation

For complete documentation, see:
- **docs/API_PRODUCTS.md** - Complete API reference with all examples
- **docs/IMPLEMENTATION_SUMMARY.md** - Technical implementation details

## 8. Next Steps

1. Integrate with frontend
2. Add file upload functionality
3. Implement notifications
4. Setup rate limiting
5. Configure CORS for production
6. Add monitoring and logging

## Need Help?

- Check server logs for detailed error messages
- Review Prisma schema for data model details
- Inspect validation schemas in lib/validations/product.ts
- Use Prisma Studio to inspect database state

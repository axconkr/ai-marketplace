# Product API Documentation

Complete API documentation for Product CRUD operations in AI Marketplace.

## Table of Contents

- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Testing Instructions](#testing-instructions)

---

## Authentication

All protected endpoints require JWT authentication via Authorization header:

```bash
Authorization: Bearer <jwt_token>
```

**Roles:**
- `seller` - Can create and manage their own products
- `admin` - Full access to all products and approval workflows
- `buyer` - Can view active products (no special auth needed)

---

## API Endpoints

### 1. Create Product

**POST** `/api/products`

Create a new product (draft status).

**Auth:** Required (seller role)

**Request Body:**
```json
{
  "title": "AI Workflow Automation Template",
  "description": "Complete n8n workflow for automating customer support",
  "category": "n8n",
  "tags": ["automation", "support", "ai"],
  "pricing_model": "one_time",
  "price": 49.99,
  "currency": "USD",
  "demo_url": "https://example.com/demo",
  "file_url": "https://storage.example.com/file.zip"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "seller_id": "seller-uuid",
    "title": "AI Workflow Automation Template",
    "description": "Complete n8n workflow for automating customer support",
    "category": "n8n",
    "tags": ["automation", "support", "ai"],
    "pricing_model": "one_time",
    "price": "49.99",
    "currency": "USD",
    "verification_level": 0,
    "status": "draft",
    "demo_url": "https://example.com/demo",
    "file_url": "https://storage.example.com/file.zip",
    "view_count": 0,
    "download_count": 0,
    "rating_avg": null,
    "review_count": 0,
    "created_at": "2025-12-28T00:00:00.000Z",
    "updated_at": "2025-12-28T00:00:00.000Z",
    "published_at": null,
    "seller": {
      "id": "seller-uuid",
      "name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "seller_tier": "verified"
    }
  }
}
```

**curl Example:**
```bash
curl -X POST https://api.example.com/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "AI Workflow Automation Template",
    "description": "Complete n8n workflow for automating customer support",
    "category": "n8n",
    "tags": ["automation", "support", "ai"],
    "pricing_model": "one_time",
    "price": 49.99,
    "currency": "USD",
    "demo_url": "https://example.com/demo"
  }'
```

---

### 2. List/Search Products

**GET** `/api/products`

List products with pagination, filtering, and search.

**Auth:** Optional (public for active products)

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `search` (string) - Search in title, description, tags
- `category` (enum) - Filter by category (n8n, make, ai_agent, app, api, prompt)
- `pricing_model` (enum) - Filter by pricing (one_time, subscription, license)
- `status` (enum) - Filter by status (draft, pending, active, suspended)
- `min_price` (number) - Minimum price
- `max_price` (number) - Maximum price
- `verification_level` (number: 0-3) - Filter by verification level
- `seller_id` (uuid) - Filter by seller
- `sort_by` (enum) - Sort order (newest, popular, price_asc, price_desc, rating)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-uuid",
      "title": "AI Workflow Automation Template",
      "category": "n8n",
      "price": "49.99",
      "currency": "USD",
      "verification_level": 0,
      "rating_avg": "4.50",
      "review_count": 10,
      "demo_url": "https://example.com/demo",
      "seller": {
        "name": "John Doe",
        "seller_tier": "verified"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**curl Examples:**

```bash
# Basic search
curl "https://api.example.com/api/products?page=1&limit=20"

# Search with filters
curl "https://api.example.com/api/products?search=automation&category=n8n&min_price=10&max_price=100&sort_by=popular"

# Get seller's products
curl "https://api.example.com/api/products?seller_id=seller-uuid"
```

---

### 3. Get Product Details

**GET** `/api/products/[id]`

Get detailed product information including seller info and reviews.

**Auth:** Optional (required for draft/pending products)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "seller_id": "seller-uuid",
    "title": "AI Workflow Automation Template",
    "description": "Complete n8n workflow...",
    "category": "n8n",
    "tags": ["automation", "support", "ai"],
    "pricing_model": "one_time",
    "price": "49.99",
    "currency": "USD",
    "verification_level": 0,
    "status": "active",
    "file_url": "https://storage.example.com/file.zip",
    "demo_url": "https://example.com/demo",
    "view_count": 100,
    "download_count": 25,
    "rating_avg": "4.50",
    "review_count": 10,
    "created_at": "2025-12-28T00:00:00.000Z",
    "updated_at": "2025-12-28T00:00:00.000Z",
    "published_at": "2025-12-28T00:00:00.000Z",
    "seller": {
      "id": "seller-uuid",
      "name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "seller_tier": "verified",
      "bio": "Professional automation expert"
    },
    "reviews": [
      {
        "id": "review-uuid",
        "rating": 5,
        "comment": "Excellent template!",
        "created_at": "2025-12-27T00:00:00.000Z",
        "buyer": {
          "id": "buyer-uuid",
          "name": "Jane Smith",
          "avatar_url": "https://example.com/avatar2.jpg"
        }
      }
    ],
    "verifications": []
  }
}
```

**curl Example:**
```bash
curl "https://api.example.com/api/products/123e4567-e89b-12d3-a456-426614174000"
```

---

### 4. Update Product

**PUT** `/api/products/[id]`

Update product details.

**Auth:** Required (seller - owner only, or admin)

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 59.99,
  "demo_url": "https://example.com/new-demo"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "title": "Updated Title",
    "description": "Updated description",
    "price": "59.99",
    "updated_at": "2025-12-28T01:00:00.000Z",
    ...
  }
}
```

**curl Example:**
```bash
curl -X PUT https://api.example.com/api/products/product-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Title",
    "price": 59.99
  }'
```

---

### 5. Delete Product

**DELETE** `/api/products/[id]`

Soft delete product (sets status to "suspended").

**Auth:** Required (seller - owner only, or admin)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Product deleted successfully",
    "id": "product-uuid"
  }
}
```

**curl Example:**
```bash
curl -X DELETE https://api.example.com/api/products/product-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. Publish Product

**PATCH** `/api/products/[id]/publish`

Submit product for approval (draft ’ pending).

**Auth:** Required (seller - owner only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Product submitted for approval",
    "product": {
      "id": "product-uuid",
      "status": "pending",
      "updated_at": "2025-12-28T01:00:00.000Z",
      ...
    }
  }
}
```

**curl Example:**
```bash
curl -X PATCH https://api.example.com/api/products/product-uuid/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 7. Approve Product

**PATCH** `/api/products/[id]/approve`

Approve product for sale (pending ’ active).

**Auth:** Required (admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Product approved successfully",
    "product": {
      "id": "product-uuid",
      "status": "active",
      "published_at": "2025-12-28T01:00:00.000Z",
      "updated_at": "2025-12-28T01:00:00.000Z",
      ...
    }
  }
}
```

**curl Example:**
```bash
curl -X PATCH https://api.example.com/api/products/product-uuid/approve \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

### 8. Get Seller's Products

**GET** `/api/products/seller/[sellerId]`

Get all products by a specific seller.

**Auth:** Optional (required to view draft/pending products)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sellerId": "seller-uuid",
    "products": [
      {
        "id": "product-uuid",
        "title": "AI Workflow Automation Template",
        "status": "active",
        ...
      }
    ],
    "total": 5
  }
}
```

**curl Example:**
```bash
curl "https://api.example.com/api/products/seller/seller-uuid"

# With auth to see draft/pending products
curl "https://api.example.com/api/products/seller/seller-uuid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Data Models

### Product Categories
```typescript
enum ProductCategory {
  n8n = "n8n",        // n8n workflow templates
  make = "make",      // Make scenarios
  ai_agent = "ai_agent", // AI agents
  app = "app",        // Vibecoding apps
  api = "api",        // API services
  prompt = "prompt"   // Prompt templates
}
```

### Pricing Models
```typescript
enum PricingModel {
  one_time = "one_time",      // One-time purchase
  subscription = "subscription", // Subscription
  license = "license"         // License
}
```

### Product Status
```typescript
enum ProductStatus {
  draft = "draft",        // Draft (not submitted)
  pending = "pending",    // Awaiting approval
  active = "active",      // Active and for sale
  suspended = "suspended" // Suspended/deleted
}
```

### Currency
```typescript
enum Currency {
  USD = "USD",  // US Dollar
  KRW = "KRW"   // Korean Won
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Invalid input or validation error |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Duplicate or conflicting resource |
| 500 | SERVER_ERROR | Internal server error |

### Validation Error Example

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "details": {
      "errors": [
        {
          "path": "title",
          "message": "Title must be at least 3 characters"
        },
        {
          "path": "price",
          "message": "Price must be positive"
        }
      ]
    }
  }
}
```

---

## Testing Instructions

### Prerequisites

1. **Environment Setup:**
```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

2. **Environment Variables:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_marketplace"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

3. **Start Development Server:**
```bash
npm run dev
# Server runs on http://localhost:3000
```

### Test Workflow

#### 1. Create Product (as Seller)

```bash
# Set your seller JWT token
export SELLER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Create product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "title": "Test Product",
    "description": "This is a test product for API testing",
    "category": "n8n",
    "tags": ["test", "automation"],
    "pricing_model": "one_time",
    "price": 29.99,
    "currency": "USD"
  }' | jq

# Save the product ID from response
export PRODUCT_ID="returned-product-uuid"
```

#### 2. Update Product

```bash
curl -X PUT http://localhost:3000/api/products/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "price": 39.99,
    "demo_url": "https://example.com/demo"
  }' | jq
```

#### 3. Publish Product

```bash
curl -X PATCH http://localhost:3000/api/products/$PRODUCT_ID/publish \
  -H "Authorization: Bearer $SELLER_TOKEN" | jq
```

#### 4. Approve Product (as Admin)

```bash
# Set your admin JWT token
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X PATCH http://localhost:3000/api/products/$PRODUCT_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

#### 5. Search Products (Public)

```bash
# Search all products
curl "http://localhost:3000/api/products?page=1&limit=10" | jq

# Search with filters
curl "http://localhost:3000/api/products?category=n8n&min_price=10&max_price=50&sort_by=newest" | jq

# Search by text
curl "http://localhost:3000/api/products?search=automation" | jq
```

#### 6. Get Product Details

```bash
curl "http://localhost:3000/api/products/$PRODUCT_ID" | jq
```

#### 7. Get Seller Products

```bash
# Get seller ID from create response
export SELLER_ID="seller-uuid"

# Public view (active only)
curl "http://localhost:3000/api/products/seller/$SELLER_ID" | jq

# Owner view (all statuses)
curl "http://localhost:3000/api/products/seller/$SELLER_ID" \
  -H "Authorization: Bearer $SELLER_TOKEN" | jq
```

#### 8. Delete Product

```bash
curl -X DELETE http://localhost:3000/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $SELLER_TOKEN" | jq
```

### Testing Checklist

- [ ] Create product as seller
- [ ] Update product as owner
- [ ] Try to update product as non-owner (should fail)
- [ ] Publish product (draft ’ pending)
- [ ] Approve product as admin (pending ’ active)
- [ ] Search products with various filters
- [ ] Get product details (public and authenticated)
- [ ] Get seller's products
- [ ] Delete product (soft delete)
- [ ] Test validation errors (missing fields, invalid data)
- [ ] Test authentication errors (missing token, invalid token)
- [ ] Test authorization errors (wrong role, not owner)

### Database Inspection

```bash
# Open Prisma Studio
npx prisma studio

# View products table
# Navigate to http://localhost:5555
```

### Performance Testing

```bash
# Install Apache Bench
# macOS: already installed
# Linux: sudo apt-get install apache2-utils

# Test GET /api/products (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:3000/api/products

# Test with authentication
ab -n 100 -c 10 -H "Authorization: Bearer $SELLER_TOKEN" \
  http://localhost:3000/api/products
```

---

## Rate Limiting (Future Enhancement)

Consider implementing rate limiting for production:

```typescript
// Example rate limit configuration
const rateLimits = {
  GET: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per window
  },
  POST: {
    windowMs: 15 * 60 * 1000,
    max: 10 // 10 creates per window
  }
}
```

---

## Security Considerations

1. **Always validate input** - Zod schemas are in place
2. **Never expose sensitive data** - Seller info is filtered
3. **Implement CORS** - Configure allowed origins
4. **Use HTTPS in production** - Never send tokens over HTTP
5. **Rotate JWT secrets** - Regular secret rotation
6. **Sanitize file URLs** - Validate file paths and URLs
7. **Monitor for abuse** - Track unusual activity patterns

---

## Support

For issues or questions:
- GitHub Issues: [repository-url]
- Email: support@example.com
- Documentation: [docs-url]

# Development Request System - API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## Authentication

All protected endpoints require a JWT token in the `access_token` cookie.

```http
Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Endpoints

### 1. List Requests

**GET** `/requests`

List all development requests with optional filters.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status | string | No | - | Filter by status: OPEN, IN_PROGRESS, COMPLETED, CANCELLED |
| category | string | No | - | Filter by category: n8n, make, ai_agent, app, api, prompt |
| budgetMin | number | No | - | Minimum budget filter |
| budgetMax | number | No | - | Maximum budget filter |
| page | number | No | 1 | Page number |
| limit | number | No | 20 | Items per page (max 100) |
| sortBy | string | No | createdAt | Sort field: createdAt, budgetMin, budgetMax |
| sortOrder | string | No | desc | Sort order: asc, desc |

**Response:**
```json
{
  "success": true,
  "requests": [
    {
      "id": "clxxx...",
      "title": "Build n8n workflow for email automation",
      "description": "I need automated email marketing...",
      "category": "n8n",
      "budgetMin": 100000,
      "budgetMax": 300000,
      "timeline": "2 weeks",
      "requirements": {},
      "attachments": [],
      "status": "OPEN",
      "buyerId": "clxxx...",
      "buyer": {
        "id": "clxxx...",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "_count": {
        "proposals": 3
      },
      "createdAt": "2026-01-17T00:00:00.000Z",
      "updatedAt": "2026-01-17T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 2. Create Request

**POST** `/requests`

Create a new development request.

**Authentication:** Required (Buyer)

**Request Body:**
```json
{
  "title": "Build custom AI agent",
  "description": "I need a custom AI agent that can handle customer inquiries...",
  "category": "ai_agent",
  "budgetMin": 500000,
  "budgetMax": 1000000,
  "timeline": "1 month",
  "requirements": {
    "integrations": ["OpenAI", "Slack"],
    "features": ["chat", "analytics"]
  },
  "attachments": ["https://example.com/requirements.pdf"]
}
```

**Validation Rules:**
- title: 10-200 characters
- description: 50-5000 characters
- category: Must be one of: n8n, make, ai_agent, app, api, prompt
- budgetMin: >= 10,000 KRW
- budgetMax: >= budgetMin
- timeline: 3-100 characters

**Response:** `201 Created`
```json
{
  "success": true,
  "request": {
    "id": "clxxx...",
    "title": "Build custom AI agent",
    "status": "OPEN",
    "...": "..."
  },
  "message": "Development request created successfully"
}
```

---

### 3. Get Request Details

**GET** `/requests/:id`

Get detailed information about a request including all proposals.

**Authentication:** Optional (affects proposal visibility)

**Response:**
```json
{
  "success": true,
  "request": {
    "id": "clxxx...",
    "title": "Build custom AI agent",
    "description": "...",
    "buyer": {
      "id": "clxxx...",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://..."
    },
    "proposals": [
      {
        "id": "clxxx...",
        "price": 750000,
        "timeline": "3 weeks",
        "description": "I have 5 years of experience...",
        "status": "PENDING",
        "seller": {
          "id": "clxxx...",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "avatar": "https://...",
          "rating_average": 4.8
        },
        "createdAt": "2026-01-17T00:00:00.000Z"
      }
    ],
    "selectedProposal": null,
    "createdAt": "2026-01-17T00:00:00.000Z",
    "updatedAt": "2026-01-17T00:00:00.000Z"
  }
}
```

**Note:** If not authenticated or not the buyer, only the user's own proposals and accepted proposals are visible.

---

### 4. Update Request

**PUT** `/requests/:id`

Update a development request.

**Authentication:** Required (Buyer only)

**Request Body:**
```json
{
  "title": "Updated title",
  "budgetMax": 1200000,
  "status": "CANCELLED"
}
```

**Restrictions:**
- Cannot update if proposals exist (except status change to CANCELLED)
- Only the buyer can update their request

**Response:**
```json
{
  "success": true,
  "request": {
    "id": "clxxx...",
    "...": "..."
  },
  "message": "Request updated successfully"
}
```

---

### 5. Delete Request

**DELETE** `/requests/:id`

Delete a development request.

**Authentication:** Required (Buyer only)

**Restrictions:**
- Cannot delete if proposals exist
- Only the buyer can delete their request

**Response:**
```json
{
  "success": true,
  "message": "Request deleted successfully"
}
```

---

### 6. Submit Proposal

**POST** `/requests/:id/proposals`

Submit a proposal for a development request.

**Authentication:** Required (Seller)

**Request Body:**
```json
{
  "price": 750000,
  "timeline": "3 weeks",
  "description": "I have 5 years of experience building AI agents. I can deliver this project with the following approach: ..."
}
```

**Validation Rules:**
- price: >= 10,000 KRW, must be within request budget range
- timeline: 3-100 characters
- description: 50-3000 characters

**Business Rules:**
- Request must be in OPEN status
- Cannot submit proposal to own request
- One proposal per seller per request
- Price must be within budgetMin and budgetMax

**Response:** `201 Created`
```json
{
  "success": true,
  "proposal": {
    "id": "clxxx...",
    "price": 750000,
    "timeline": "3 weeks",
    "status": "PENDING",
    "...": "..."
  },
  "message": "Proposal submitted successfully"
}
```

---

### 7. Get Proposal Details

**GET** `/proposals/:id`

Get detailed information about a proposal.

**Authentication:** Required (Buyer or Seller only)

**Response:**
```json
{
  "success": true,
  "proposal": {
    "id": "clxxx...",
    "price": 750000,
    "timeline": "3 weeks",
    "description": "...",
    "status": "PENDING",
    "seller": {
      "id": "clxxx...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "avatar": "https://..."
    },
    "request": {
      "id": "clxxx...",
      "title": "Build custom AI agent",
      "buyer": {
        "id": "clxxx...",
        "name": "John Doe",
        "avatar": "https://..."
      }
    },
    "createdAt": "2026-01-17T00:00:00.000Z",
    "updatedAt": "2026-01-17T00:00:00.000Z"
  }
}
```

---

### 8. Update Proposal

**PUT** `/proposals/:id`

Update a proposal.

**Authentication:** Required (Seller only)

**Request Body:**
```json
{
  "price": 800000,
  "timeline": "4 weeks",
  "description": "Updated proposal description..."
}
```

**Restrictions:**
- Can only update if status is PENDING
- Only the seller can update their proposal
- Price must still be within request budget range

**Response:**
```json
{
  "success": true,
  "proposal": {
    "id": "clxxx...",
    "...": "..."
  },
  "message": "Proposal updated successfully"
}
```

---

### 9. Withdraw Proposal

**DELETE** `/proposals/:id`

Withdraw a proposal.

**Authentication:** Required (Seller only)

**Restrictions:**
- Can only delete if status is PENDING
- Only the seller can delete their proposal

**Response:**
```json
{
  "success": true,
  "message": "Proposal withdrawn successfully"
}
```

---

### 10. Select Proposal

**POST** `/requests/:id/select-proposal`

Select a winning proposal and initiate escrow.

**Authentication:** Required (Buyer only)

**Request Body:**
```json
{
  "proposalId": "clxxx..."
}
```

**Business Logic:**
1. Updates request status to IN_PROGRESS
2. Updates selected proposal status to ACCEPTED
3. Updates all other proposals to REJECTED
4. Creates escrow record with status PENDING
5. Sends notifications to all parties

**Response:**
```json
{
  "success": true,
  "request": {
    "id": "clxxx...",
    "status": "IN_PROGRESS",
    "selectedProposalId": "clxxx..."
  },
  "escrow": {
    "id": "clxxx...",
    "requestId": "clxxx...",
    "proposalId": "clxxx...",
    "buyerId": "clxxx...",
    "sellerId": "clxxx...",
    "amount": 750000,
    "status": "PENDING",
    "stripePaymentIntent": null
  },
  "message": "Proposal selected successfully. Please proceed with payment to initiate escrow."
}
```

---

### 11. Create Payment Intent

**POST** `/requests/:id/payment`

Create a Stripe payment intent for escrow.

**Authentication:** Required (Buyer only)

**Request Body:** None

**Prerequisites:**
- Request must have a selected proposal
- Escrow must be in PENDING status

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "amount": 750000,
  "escrowId": "clxxx...",
  "message": "Payment intent created successfully"
}
```

**Frontend Usage:**
Use the `clientSecret` with Stripe.js to complete payment:

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(PUBLISHABLE_KEY);
const { error } = await stripe.confirmPayment({
  clientSecret,
  confirmParams: {
    return_url: `${window.location.origin}/requests/${requestId}/success`,
  },
});
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": [] // Optional: Validation error details
}
```

### Common Error Codes

| Status | Error Type | Description |
|--------|------------|-------------|
| 400 | Validation error | Invalid input data |
| 400 | Bad request | Business logic violation |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not found | Resource does not exist |
| 500 | Internal server error | Server-side error |

### Example Error Response

```json
{
  "success": false,
  "error": "Validation error",
  "message": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 10000,
      "type": "number",
      "inclusive": true,
      "exact": false,
      "message": "Number must be greater than or equal to 10000",
      "path": ["budgetMin"]
    }
  ]
}
```

---

## Notification Events

The system automatically sends notifications for these events:

| Event | Recipients | Type |
|-------|-----------|------|
| Request created | Buyer (confirmation) | REQUEST_CREATED |
| Proposal submitted | Buyer, Seller (confirmation) | PROPOSAL_SUBMITTED |
| Proposal selected | Winner, Rejected sellers | PROPOSAL_SELECTED, PROPOSAL_REJECTED |
| Escrow initiated | Buyer, Seller | ESCROW_INITIATED |
| Escrow released | Buyer, Seller | ESCROW_RELEASED |

Notifications are accessible via the existing notifications API:
- **GET** `/api/notifications` - List user notifications
- **PUT** `/api/notifications/:id/read` - Mark as read

---

## Rate Limits

- Inherits from existing auth system
- Default: 100 requests per 15 minutes per user
- Registration endpoints: 5 requests per hour per IP

---

## Testing

### Using cURL

```bash
# List requests
curl http://localhost:3000/api/requests

# Create request (requires auth cookie)
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT" \
  -d '{
    "title": "Build n8n workflow",
    "description": "Need automated workflow for email marketing campaigns...",
    "category": "n8n",
    "budgetMin": 100000,
    "budgetMax": 300000,
    "timeline": "2 weeks",
    "requirements": {},
    "attachments": []
  }'

# Submit proposal
curl -X POST http://localhost:3000/api/requests/REQUEST_ID/proposals \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=SELLER_JWT" \
  -d '{
    "price": 200000,
    "timeline": "10 days",
    "description": "I have extensive experience with n8n..."
  }'
```

### Using Postman

Import the following collection: (Create manually or use API client)

---

## Changelog

### Version 1.0.0 (2026-01-17)
- Initial release
- All CRUD endpoints for requests and proposals
- Escrow creation and payment intent generation
- Notification system integration
- Authentication and authorization
- Input validation and error handling

# Notification System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI Marketplace                                │
│                     Notification System                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────┐    ┌───────────────┐    ┌──────────────────┐   │
│  │ NotificationBell│◄──│  Header.tsx   │    │ Notifications    │   │
│  │   Component    │    │               │    │   Page           │   │
│  └───────┬───────┘    └───────────────┘    └────────┬─────────┘   │
│          │                                            │              │
│          │                                            │              │
│  ┌───────▼────────────────────────────────────────────▼──────────┐ │
│  │          NotificationList & NotificationItem                   │ │
│  │              (Shared Components)                               │ │
│  └───────┬────────────────────────────────────────────┬──────────┘ │
│          │                                            │              │
└──────────┼────────────────────────────────────────────┼──────────────┘
           │                                            │
           │                                            │
┌──────────▼────────────────────────────────────────────▼──────────────┐
│                         HOOKS LAYER                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                  useNotifications Hook                          │ │
│  │  - useNotifications()                                           │ │
│  │  - useMarkNotificationRead()                                    │ │
│  │  - useMarkAllNotificationsRead()                                │ │
│  │  - useDeleteNotification()                                      │ │
│  │  - useClearAllNotifications()                                   │ │
│  │                                                                  │ │
│  │  Features:                                                       │ │
│  │  ✓ React Query integration                                      │ │
│  │  ✓ Auto-refresh (30s polling)                                   │ │
│  │  ✓ Cache management                                             │ │
│  │  ✓ Optimistic updates                                           │ │
│  └────────────────────┬───────────────────────────────────────────┘ │
│                       │                                              │
└───────────────────────┼──────────────────────────────────────────────┘
                        │
                        │ HTTP Requests
                        │
┌───────────────────────▼──────────────────────────────────────────────┐
│                          API LAYER                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  GET    /api/notifications                 ─► List notifications     │
│  GET    /api/notifications?unread=true     ─► List unread only       │
│  PATCH  /api/notifications/[id]/read       ─► Mark as read           │
│  PATCH  /api/notifications/mark-all-read   ─► Mark all as read       │
│  DELETE /api/notifications/[id]            ─► Delete notification    │
│  DELETE /api/notifications/clear-all       ─► Clear all read         │
│                                                                       │
│  Features:                                                            │
│  ✓ JWT Authentication                                                │
│  ✓ User authorization                                                │
│  ✓ Error handling                                                    │
│  ✓ Input validation                                                  │
│                                                                       │
└───────────────────────┬──────────────────────────────────────────────┘
                        │
                        │ Service Calls
                        │
┌───────────────────────▼──────────────────────────────────────────────┐
│                       SERVICE LAYER                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │            notification-service.ts                              │ │
│  │                                                                  │ │
│  │  Core Functions:                                                 │ │
│  │  • createNotification()                                          │ │
│  │  • getUserNotifications()                                        │ │
│  │  • markNotificationAsRead()                                      │ │
│  │  • markAllNotificationsAsRead()                                  │ │
│  │  • deleteNotification()                                          │ │
│  │  • clearAllReadNotifications()                                   │ │
│  │                                                                  │ │
│  │  Automated Notification Functions:                               │ │
│  │  • notifyNewOrder()                                              │ │
│  │  • notifyOrderCompleted()                                        │ │
│  │  • notifyPaymentReceived()                                       │ │
│  │  • notifyVerificationRequested()                                 │ │
│  │  • notifyProductApproved()                                       │ │
│  │  • notifySettlementReady()                                       │ │
│  │  • ... and more                                                  │ │
│  │                                                                  │ │
│  │  Features:                                                        │ │
│  │  ✓ User preference checking                                      │ │
│  │  ✓ Email notification integration                                │ │
│  │  ✓ Bulk operations                                               │ │
│  └────────────────────┬───────────────────────────────────────────┘ │
│                       │                                              │
└───────────────────────┼──────────────────────────────────────────────┘
                        │
                        │ Database Queries
                        │
┌───────────────────────▼──────────────────────────────────────────────┐
│                      DATABASE LAYER                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                  Notification Table                             │ │
│  │                                                                  │ │
│  │  Columns:                                                        │ │
│  │  • id           (String, Primary Key)                            │ │
│  │  • user_id      (String, Foreign Key → User)                     │ │
│  │  • type         (NotificationType Enum)                          │ │
│  │  • title        (String)                                         │ │
│  │  • message      (String)                                         │ │
│  │  • link         (String, nullable)                               │ │
│  │  • data         (JSON, nullable)                                 │ │
│  │  • read         (Boolean, default: false)                        │ │
│  │  • read_at      (DateTime, nullable)                             │ │
│  │  • created_at   (DateTime)                                       │ │
│  │  • expires_at   (DateTime, nullable)                             │ │
│  │                                                                  │ │
│  │  Indexes:                                                         │ │
│  │  • [user_id, read]        ─► Fast unread count                   │ │
│  │  • [user_id, created_at]  ─► Fast sorted queries                 │ │
│  │  • [created_at]           ─► Fast cleanup                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Creating a Notification

```
┌─────────────┐
│ Order       │
│ Created     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│ notifyNewOrder(orderId)         │
│ (Service Function)              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ 1. Fetch order details          │
│ 2. Get seller info              │
│ 3. Check user preferences       │
└──────┬──────────────────────────┘
       │
       ├──────────────────────────┐
       │                          │
       ▼                          ▼
┌──────────────┐       ┌─────────────────┐
│ Create DB    │       │ Send Email      │
│ Notification │       │ (if enabled)    │
└──────┬───────┘       └─────────────────┘
       │
       ▼
┌──────────────────────┐
│ Notification Created │
└──────────────────────┘
```

---

### 2. Fetching Notifications (Real-time)

```
┌─────────────────┐
│ User Opens App  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ useNotifications()              │
│ - Initial fetch                 │
│ - Start 30s polling             │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ GET /api/notifications          │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ getUserNotifications()          │
│ - Query database                │
│ - Get unread count              │
│ - Paginate results              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Return to Frontend              │
│ {                               │
│   notifications: [...],         │
│   unreadCount: 5,               │
│   totalCount: 23                │
│ }                               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Update UI                       │
│ - NotificationBell badge        │
│ - Notification list             │
└─────────────────────────────────┘
         │
         │ Every 30 seconds
         │
         ▼
┌─────────────────────────────────┐
│ Auto-refresh (polling)          │
│ - Fetch latest notifications    │
│ - Update unread count           │
└─────────────────────────────────┘
```

---

### 3. Mark as Read Flow

```
┌─────────────────────┐
│ User Clicks         │
│ Notification        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ useMarkNotificationRead()       │
│ .mutateAsync(notificationId)    │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ PATCH /api/notifications/       │
│       [id]/read                 │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ markNotificationAsRead()        │
│ - Update read = true            │
│ - Set read_at = now             │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Response: Updated Notification  │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ React Query:                    │
│ - Invalidate cache              │
│ - Refetch notifications         │
│ - Update UI automatically       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ UI Updates:                     │
│ - Badge count decreases         │
│ - Notification loses blue tint  │
│ - Blue dot disappears           │
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Navigate to notification.link   │
│ (if provided)                   │
└─────────────────────────────────┘
```

---

## Component Hierarchy

```
App
│
├── Header
│   ├── Logo
│   ├── Navigation
│   └── Actions
│       ├── WishlistButton
│       ├── CartButton
│       └── NotificationBell ◄─── NEW
│           └── Popover
│               └── NotificationList
│                   ├── Header ("Notifications")
│                   ├── NotificationItem (x10)
│                   │   ├── Icon (type-specific)
│                   │   ├── Title
│                   │   ├── Message
│                   │   ├── Timestamp
│                   │   └── UnreadIndicator
│                   └── Footer
│                       ├── "View all" button
│                       └── "Clear read" button
│
└── Pages
    └── /notifications ◄─── Enhanced
        ├── Header
        │   ├── Title
        │   └── Settings Button
        ├── Tabs
        │   ├── All Tab
        │   └── Unread Tab
        ├── Action Buttons
        │   ├── "Mark all read"
        │   └── "Clear read notifications"
        ├── NotificationList
        │   └── NotificationItem (x20 per page)
        └── Pagination (future)
```

---

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                   React Query Cache                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Query Key: ['notifications', { unreadOnly, page, limit }]   │
│                                                               │
│  Data:                                                        │
│  {                                                            │
│    notifications: Notification[],                            │
│    unreadCount: number,                                       │
│    totalCount: number,                                        │
│    page: number,                                              │
│    limit: number,                                             │
│    totalPages: number                                         │
│  }                                                            │
│                                                               │
│  Auto-refetch: Every 30 seconds                               │
│  Cache Time: 5 minutes                                        │
│  Stale Time: 0 (always fresh)                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Mutations                                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  markAsRead         ──► Invalidates: ['notifications']       │
│  markAllAsRead      ──► Invalidates: ['notifications']       │
│  deleteNotification ──► Invalidates: ['notifications']       │
│  clearAll           ──► Invalidates: ['notifications']       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### 1. Order System
```
Order Created
    ↓
notifyNewOrder(orderId)
    ↓
Notification sent to SELLER
    ↓
SELLER sees notification in bell
```

### 2. Payment System
```
Payment Successful
    ↓
notifyPaymentReceived(orderId)
    ↓
Notification sent to SELLER

Payment Failed
    ↓
notifyPaymentFailed(orderId)
    ↓
Notification sent to BUYER
```

### 3. Verification System
```
Verification Requested
    ↓
notifyVerificationRequested(verificationId)
    ↓
Notification sent to VERIFIERS

Verification Completed
    ↓
notifyVerificationCompleted(verificationId)
    ↓
Notification sent to SELLER
```

### 4. Product Management
```
Product Approved
    ↓
notifyProductApproved(productId)
    ↓
Notification sent to SELLER

Product Rejected
    ↓
notifyProductRejected(productId, reason)
    ↓
Notification sent to SELLER
```

### 5. Settlement System
```
Settlement Ready
    ↓
notifySettlementReady(settlementId)
    ↓
Notification sent to SELLER

Settlement Paid
    ↓
notifySettlementPaid(settlementId)
    ↓
Notification sent to SELLER
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Security Layers                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Authentication (JWT)                                      │
│     ├── Verify token in request header                       │
│     ├── Extract user ID from token                           │
│     └── Reject if invalid/expired                            │
│                                                               │
│  2. Authorization                                             │
│     ├── User can only access own notifications               │
│     ├── User ID from token vs notification.user_id           │
│     └── Reject if mismatch                                    │
│                                                               │
│  3. Data Validation                                           │
│     ├── Validate notification type enum                      │
│     ├── Sanitize user inputs                                 │
│     └── Validate UUIDs                                        │
│                                                               │
│  4. Database Security                                         │
│     ├── Prisma ORM (SQL injection prevention)                │
│     ├── Parameterized queries                                │
│     └── Row-level security via WHERE clauses                 │
│                                                               │
│  5. API Security                                              │
│     ├── CORS configured                                       │
│     ├── Rate limiting (future)                               │
│     └── Input validation                                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Optimizations

### 1. Database Indexes
```sql
-- Fast unread count queries
CREATE INDEX "Notification_user_id_read_idx"
  ON "Notification"("user_id", "read");

-- Fast sorted pagination
CREATE INDEX "Notification_user_id_created_at_idx"
  ON "Notification"("user_id", "created_at");

-- Fast cleanup queries
CREATE INDEX "Notification_created_at_idx"
  ON "Notification"("created_at");
```

### 2. React Query Optimizations
- **Stale-While-Revalidate**: Show cached data while fetching new
- **Auto-refetch**: Poll every 30 seconds for updates
- **Cache Time**: 5 minutes to reduce API calls
- **Deduplication**: Multiple components share same query

### 3. Frontend Optimizations
- **Pagination**: Load only 20 notifications at a time
- **Virtual Scrolling**: (Future) For large lists
- **Code Splitting**: Lazy load notification components
- **Memoization**: React.memo on NotificationItem

### 4. API Optimizations
- **Single Query**: Fetch notifications + count in one query
- **Limit Fields**: Only select needed columns
- **Batch Updates**: Mark all as read in single query

---

## Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   Error Handling Flow                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Component)                                         │
│      ├── Try: Render notification list                       │
│      ├── Catch: Display error boundary                       │
│      └── Finally: Show fallback UI                           │
│                                                               │
│  Hooks (React Query)                                          │
│      ├── onError: Show toast notification                    │
│      ├── retry: Retry 3 times with backoff                   │
│      └── refetchOnReconnect: Auto-retry when online          │
│                                                               │
│  API Routes                                                   │
│      ├── Try: Execute logic                                  │
│      ├── Catch: Log error, return 500                        │
│      └── Return: JSON error response                         │
│                                                               │
│  Service Layer                                                │
│      ├── Try: Database operations                            │
│      ├── Catch: Log error, throw exception                   │
│      └── Validation: Check inputs before processing          │
│                                                               │
│  Database                                                     │
│      ├── Constraints: Enforce data integrity                 │
│      ├── Transactions: Atomic operations                     │
│      └── Rollback: Undo on failure                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Future Enhancements

### Phase 2: Real-time (WebSocket)
```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │◄────────┤   WebSocket  │◄────────┤   Backend    │
│              │ Push    │   Server     │ Emit    │              │
└──────────────┘         └──────────────┘         └──────────────┘
                                                          │
                         Notification Created ───────────┘
                         (Instant push to connected clients)
```

### Phase 3: Push Notifications
```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser    │◄────────┤   Service    │◄────────┤   Backend    │
│              │ Push    │   Worker     │ Send    │   + FCM      │
└──────────────┘         └──────────────┘         └──────────────┘
                         (Even when app is closed)
```

---

## Monitoring & Observability

### Metrics to Track
```
┌─────────────────────────────────────────────────────────────┐
│                   Key Metrics                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Performance Metrics                                       │
│     • API response time (p50, p95, p99)                       │
│     • Database query time                                     │
│     • Frontend render time                                    │
│     • Poll interval effectiveness                             │
│                                                               │
│  2. Business Metrics                                          │
│     • Notifications created per day                           │
│     • Notification read rate                                  │
│     • Notification click-through rate                         │
│     • Average time to read                                    │
│                                                               │
│  3. Error Metrics                                             │
│     • API error rate                                          │
│     • Failed notification deliveries                          │
│     • Email send failures                                     │
│     • Authentication failures                                 │
│                                                               │
│  4. User Metrics                                              │
│     • Active notification users                               │
│     • Notification settings preferences                       │
│     • Peak notification times                                 │
│     • User engagement with notifications                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

Last Updated: 2026-01-10
Version: 1.0.0

# Notification System Testing Guide

## Quick Start Testing

### Prerequisites
1. Start the application: `npm run dev`
2. Ensure PostgreSQL database is running
3. Have at least 2 test accounts (buyer and seller)

---

## Manual Testing Scenarios

### Test 1: Basic Notification Display

**Steps:**
1. Login as a user
2. Check header - NotificationBell should be visible (bell icon)
3. Initial state: No badge if no unread notifications

**Expected Results:**
- ✅ Bell icon visible in header (desktop)
- ✅ No badge if no notifications
- ✅ Bell is clickable

---

### Test 2: Create Test Notifications

**Option A: Via Order Flow**
1. Login as buyer
2. Purchase a product
3. Login as seller
4. Check notifications - should see "New Order" notification

**Option B: Via Database (Quick Testing)**
```sql
-- Run in PostgreSQL
INSERT INTO "Notification" (id, user_id, type, title, message, link, read, created_at)
VALUES (
  gen_random_uuid()::text,
  'YOUR_USER_ID',
  'ORDER_PLACED',
  'New Order Received',
  'You have received a new order for Product ABC',
  '/dashboard/orders',
  false,
  NOW()
);
```

**Option C: Via Prisma Studio**
1. Run: `npx prisma studio`
2. Navigate to Notification model
3. Add new record with your user_id

---

### Test 3: Unread Count Badge

**Steps:**
1. Create 3 unread notifications (see Test 2)
2. Refresh page or wait 30 seconds
3. Check bell icon in header

**Expected Results:**
- ✅ Red badge appears on bell icon
- ✅ Badge shows count "3"
- ✅ If >9 notifications, shows "9+"
- ✅ Badge updates every 30 seconds

---

### Test 4: Notification Popover

**Steps:**
1. Click bell icon
2. Popover should open below bell
3. Review notification list

**Expected Results:**
- ✅ Popover opens smoothly
- ✅ Shows last 10 notifications
- ✅ Header shows "Notifications"
- ✅ "Mark all read" button visible (if unread exists)
- ✅ Each notification shows:
  - Type-specific icon
  - Title
  - Message (truncated if long)
  - Relative timestamp ("5 minutes ago")
  - Blue dot if unread
- ✅ "View all" button at bottom
- ✅ "Clear read" button at bottom (if read notifications exist)

---

### Test 5: Click Notification

**Steps:**
1. Open notification popover
2. Click an unread notification with a link

**Expected Results:**
- ✅ Notification marked as read (blue dot disappears)
- ✅ Navigates to notification link
- ✅ Popover closes
- ✅ Unread count decreases
- ✅ Background color changes from blue tint to white

---

### Test 6: Mark All as Read

**Steps:**
1. Have multiple unread notifications
2. Open popover
3. Click "Mark all read" button

**Expected Results:**
- ✅ Button shows loading state
- ✅ All notifications marked as read
- ✅ Blue dots disappear
- ✅ Unread count badge disappears
- ✅ "Mark all read" button disappears

---

### Test 7: Notifications Page

**Steps:**
1. Click "View all" in popover, OR
2. Navigate to `/notifications`

**Expected Results:**
- ✅ Page loads with notification list
- ✅ Title: "알림" (Notifications)
- ✅ "Settings" button in top-right
- ✅ Two tabs: "전체" (All) and "읽지 않음" (Unread)
- ✅ Tab shows count in parentheses
- ✅ Notifications displayed in cards
- ✅ "모두 읽음 표시" (Mark all read) button visible if unread exists
- ✅ "읽은 알림 삭제" (Clear read) button visible if read exists

---

### Test 8: Filter Tabs

**Steps:**
1. On `/notifications` page
2. Click "Unread" tab
3. Should show only unread
4. Click "All" tab
5. Should show all notifications

**Expected Results:**
- ✅ "All" tab shows all notifications
- ✅ "Unread" tab shows only unread
- ✅ Count in tab header is accurate
- ✅ Switching tabs loads correct data
- ✅ Active tab is highlighted

---

### Test 9: Empty States

**Test 9A: No Notifications**
1. Delete all notifications for user
2. Open notification popover

**Expected:**
- ✅ Shows bell emoji 🔔
- ✅ Message: "No notifications"

**Test 9B: No Unread**
1. Mark all notifications as read
2. Click "Unread" tab on notifications page

**Expected:**
- ✅ Shows bell emoji 🔔
- ✅ Message: "읽지 않은 알림이 없습니다" (No unread notifications)

---

### Test 10: Clear All Read

**Steps:**
1. Have mix of read and unread notifications
2. Go to `/notifications` page
3. On "All" tab, click "읽은 알림 삭제"
4. Confirm dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ After confirm, all read notifications deleted
- ✅ Unread notifications remain
- ✅ List refreshes
- ✅ Total count decreases

---

### Test 11: Real-time Updates

**Steps:**
1. Open notifications page
2. In another tab/browser, create a new notification for same user
3. Wait 30 seconds (default polling interval)

**Expected Results:**
- ✅ New notification appears automatically
- ✅ Unread count updates
- ✅ No page refresh needed
- ✅ Happens within 30 seconds

---

### Test 12: Mobile Responsiveness

**Steps:**
1. Open in mobile viewport (< 768px)
2. Check header
3. Open mobile menu

**Expected Results:**
- ✅ Bell icon hidden on mobile
- ✅ Mobile menu has "알림" link
- ✅ Clicking link navigates to `/notifications`
- ✅ Notifications page fully responsive
- ✅ Cards stack vertically
- ✅ Buttons full-width on mobile

---

### Test 13: Notification Types & Icons

Create notifications of each type and verify correct icon/color:

| Type | Icon | Color | Link |
|------|------|-------|------|
| ORDER_PLACED | ShoppingCart | Blue | /dashboard/orders |
| ORDER_COMPLETED | CheckCircle | Green | /orders/[id] |
| PAYMENT_RECEIVED | DollarSign | Green | /dashboard/orders |
| PAYMENT_FAILED | XCircle | Red | /orders/[id] |
| PRODUCT_APPROVED | FileCheck | Green | /products/[id] |
| PRODUCT_REJECTED | FileX | Red | /dashboard/products |
| VERIFICATION_REQUESTED | ClipboardList | Blue | /verifications/[id] |
| VERIFICATION_COMPLETED | ClipboardCheck | Green | /dashboard/verifications |
| SETTLEMENT_READY | Banknote | Green | /dashboard/settlements |
| SETTLEMENT_PAID | CheckCircle | Green | /dashboard/settlements |
| REVIEW_RECEIVED | Star | Yellow | /products/[id] |
| SYSTEM_ANNOUNCEMENT | Megaphone | Purple | null |

**Steps:**
1. Create notification of each type
2. Check icon matches expected
3. Check color matches expected
4. Click notification
5. Verify navigation (if link exists)

---

### Test 14: Pagination

**Steps:**
1. Create 25+ notifications
2. Go to `/notifications` page
3. Scroll to bottom

**Expected Results:**
- ✅ Shows "1 / 2 페이지" or similar
- ✅ First 20 notifications displayed
- ✅ (Future enhancement: Pagination controls)

---

### Test 15: API Endpoint Testing

Use curl or Postman to test API directly:

**Get Notifications:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications
```

**Get Unread Only:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications?unread=true
```

**Mark as Read:**
```bash
curl -X PATCH -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications/NOTIFICATION_ID/read
```

**Mark All as Read:**
```bash
curl -X PATCH -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications/mark-all-read
```

**Delete Notification:**
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications/NOTIFICATION_ID
```

**Clear All Read:**
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications/clear-all
```

**Expected Responses:**
- ✅ 200 OK with JSON data
- ✅ 401 Unauthorized if no/invalid token
- ✅ 500 Internal Server Error with error message if fails

---

### Test 16: Authentication & Authorization

**Test 16A: Unauthenticated Access**
1. Logout
2. Try to access `/api/notifications` directly

**Expected:**
- ✅ 401 Unauthorized response

**Test 16B: Cross-user Access**
1. Login as User A
2. Get notification ID from User B
3. Try to mark User B's notification as read

**Expected:**
- ✅ Operation fails or only affects User A's notifications
- ✅ Cannot access other users' notifications

---

### Test 17: Performance Testing

**Steps:**
1. Create 100+ notifications
2. Open notifications page
3. Scroll through list
4. Open popover
5. Switch tabs

**Expected Results:**
- ✅ Page loads in < 2 seconds
- ✅ Smooth scrolling
- ✅ No lag when switching tabs
- ✅ API responses < 500ms
- ✅ Popover opens instantly

---

### Test 18: Error Handling

**Test 18A: Network Error**
1. Open DevTools
2. Set network to "Offline"
3. Try to mark notification as read

**Expected:**
- ✅ Error toast appears
- ✅ User-friendly error message
- ✅ Retry option (via React Query)

**Test 18B: Server Error**
1. Stop database
2. Try to fetch notifications

**Expected:**
- ✅ Loading state shows
- ✅ Eventually shows error state
- ✅ Error message displayed

---

### Test 19: Accessibility Testing

**Steps:**
1. Use keyboard only (no mouse)
2. Tab through header
3. Press Enter on bell icon
4. Tab through notifications
5. Use screen reader

**Expected Results:**
- ✅ Bell icon focusable
- ✅ Enter key opens popover
- ✅ Tab moves through notifications
- ✅ Enter on notification activates it
- ✅ Escape closes popover
- ✅ Screen reader announces:
  - "Notifications (3 unread)"
  - Notification title and message
  - "Unread" status
- ✅ Focus indicators visible
- ✅ Color contrast meets WCAG AA

---

### Test 20: Integration Testing

**Test with Order Flow:**
1. Login as buyer
2. Add product to cart
3. Proceed to checkout
4. Complete payment
5. Login as seller
6. Check notifications

**Expected:**
- ✅ Seller receives "New Order" notification
- ✅ Notification has correct title and message
- ✅ Link navigates to order details
- ✅ Notification created within seconds

**Test with Verification Flow:**
1. Seller requests verification
2. Login as verifier
3. Check notifications

**Expected:**
- ✅ Verifier receives "Verification Requested" notification
- ✅ Link navigates to verification details

---

## Automated Testing

### Unit Tests

Create tests for hooks:

```typescript
// __tests__/hooks/use-notifications.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications } from '@/hooks/use-notifications';

describe('useNotifications', () => {
  it('fetches notifications', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.data.notifications).toBeArray();
    });
  });

  it('filters unread notifications', async () => {
    const { result } = renderHook(() =>
      useNotifications({ unreadOnly: true })
    );

    await waitFor(() => {
      expect(result.current.data.notifications.every(n => !n.read)).toBe(true);
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/api/notifications.test.ts
import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/notifications/route';

describe('/api/notifications', () => {
  it('returns 401 without auth', async () => {
    const { req } = createMocks({ method: 'GET' });
    const response = await GET(req);
    expect(response.status).toBe(401);
  });

  it('returns notifications for authenticated user', async () => {
    // Mock authentication
    const { req } = createMocks({
      method: 'GET',
      headers: { authorization: 'Bearer valid-token' }
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('notifications');
    expect(data).toHaveProperty('unreadCount');
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/notifications.spec.ts
import { test, expect } from '@playwright/test';

test('notification bell shows unread count', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Login');
  // ... login flow

  const badge = page.locator('[data-testid="notification-badge"]');
  await expect(badge).toHaveText('3');
});

test('clicking notification marks as read', async ({ page }) => {
  await page.goto('/notifications');

  const notification = page.locator('[data-testid="notification-item"]').first();
  const isUnread = await notification.locator('.bg-blue-50').count() > 0;

  await notification.click();

  if (isUnread) {
    await expect(notification.locator('.bg-blue-50')).toHaveCount(0);
  }
});
```

---

## Performance Benchmarks

### Target Metrics
- API response time: < 200ms (avg)
- Page load time: < 2s
- Popover open time: < 100ms
- Mark as read latency: < 300ms
- Poll interval: 30s (configurable)

### Monitoring
```javascript
// In browser console
performance.mark('notification-fetch-start');
// ... fetch notifications
performance.mark('notification-fetch-end');
performance.measure('notification-fetch', 'notification-fetch-start', 'notification-fetch-end');
console.log(performance.getEntriesByName('notification-fetch'));
```

---

## Common Issues & Solutions

### Issue 1: Badge Not Updating
**Symptoms:** Unread count doesn't update
**Solutions:**
- Check if polling is enabled (30s interval)
- Verify React Query cache is working
- Check browser console for errors
- Manually refetch: `queryClient.invalidateQueries(['notifications'])`

### Issue 2: Notifications Not Appearing
**Symptoms:** Created notification doesn't show
**Solutions:**
- Check database: `SELECT * FROM "Notification" WHERE user_id = 'USER_ID';`
- Verify user_id matches logged-in user
- Check notification service logs
- Verify API returns notification

### Issue 3: Popover Not Opening
**Symptoms:** Click bell, nothing happens
**Solutions:**
- Check browser console for errors
- Verify `@radix-ui/react-popover` installed
- Check z-index conflicts
- Verify Popover component imported correctly

### Issue 4: Mark as Read Not Working
**Symptoms:** Notification stays unread after clicking
**Solutions:**
- Check API route: `/api/notifications/[id]/read`
- Verify authentication token valid
- Check notification ownership (user_id matches)
- Review browser network tab for API errors

---

## Test Data Generator

Use this script to generate test notifications:

```typescript
// scripts/generate-test-notifications.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateTestNotifications(userId: string, count: number) {
  const types = [
    'ORDER_PLACED',
    'PAYMENT_RECEIVED',
    'PRODUCT_APPROVED',
    'VERIFICATION_REQUESTED',
  ];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    await prisma.notification.create({
      data: {
        user_id: userId,
        type: type as any,
        title: `Test Notification ${i + 1}`,
        message: `This is test notification #${i + 1}`,
        link: '/dashboard',
        read: i % 3 === 0, // Every 3rd is read
      },
    });
  }
}

// Usage: generateTestNotifications('user-id-here', 50);
```

---

## Sign-off Checklist

Before marking as complete:

- [ ] All API endpoints tested and working
- [ ] NotificationBell appears in header
- [ ] Unread count displays correctly
- [ ] Popover opens and closes properly
- [ ] Notifications page loads and displays
- [ ] Mark as read functionality works
- [ ] Mark all as read works
- [ ] Clear all read works
- [ ] Filter tabs work correctly
- [ ] Empty states display correctly
- [ ] Loading states display correctly
- [ ] Error handling works
- [ ] Real-time updates work (30s polling)
- [ ] Mobile responsive design verified
- [ ] Keyboard navigation works
- [ ] Screen reader accessibility verified
- [ ] Performance meets targets
- [ ] Integration with orders works
- [ ] Integration with verifications works
- [ ] Integration with settlements works
- [ ] No console errors
- [ ] No build errors

---

## Next Steps

After testing:
1. Document any bugs found
2. File issues for enhancements
3. Update DEVELOPMENT_STATUS.md
4. Plan WebSocket implementation (future)
5. Plan push notifications (future)

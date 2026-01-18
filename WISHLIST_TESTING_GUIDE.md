# Wishlist Feature - Testing Guide

## Quick Start Testing

### Prerequisites
1. Start the development server: `npm run dev`
2. Have at least 2-3 test products in the database
3. Have both authenticated and non-authenticated test accounts ready

## Test Scenarios

### 1. Product Card Wishlist Button

#### Test 1.1: Add to Wishlist (Authenticated User)
**Steps**:
1. Navigate to `/products` page
2. Ensure you are logged in
3. Locate a product card
4. Click the heart icon in the top-left corner of the product image

**Expected Results**:
- Heart icon fills with red color
- Toast notification appears: "위시리스트에 추가되었습니다"
- Header wishlist counter increases by 1
- Button shows brief loading state

#### Test 1.2: Remove from Wishlist
**Steps**:
1. Click the filled heart icon on a product already in wishlist

**Expected Results**:
- Heart icon changes to outline
- Toast notification appears: "위시리스트에서 제거되었습니다"
- Header wishlist counter decreases by 1

#### Test 1.3: Unauthenticated User
**Steps**:
1. Log out
2. Navigate to `/products` page
3. Click heart icon on any product

**Expected Results**:
- Toast notification appears: "로그인이 필요합니다"
- User is redirected to `/login` page
- No changes to wishlist

#### Test 1.4: Rapid Clicking
**Steps**:
1. Click heart icon multiple times rapidly (5+ clicks in 1 second)

**Expected Results**:
- Button becomes disabled during API call
- Only one API request is sent
- No duplicate items in wishlist
- UI state remains consistent

---

### 2. Header Wishlist Counter

#### Test 2.1: Counter Display (Desktop)
**Steps**:
1. Log in
2. Add 3 products to wishlist
3. Observe header wishlist icon

**Expected Results**:
- Red badge with "3" appears on heart icon
- Badge is positioned at top-right of icon
- Badge is visible and readable

#### Test 2.2: Counter Display (Mobile)
**Steps**:
1. Resize browser to mobile width (< 768px)
2. Open mobile menu
3. Observe wishlist button

**Expected Results**:
- Wishlist button shows text "위시리스트"
- Badge with count appears next to text
- Button is full-width and touch-friendly

#### Test 2.3: Large Numbers
**Steps**:
1. Add 100+ items to wishlist (via API or database)
2. Observe header counter

**Expected Results**:
- Badge shows "99+"
- Badge remains readable
- No layout overflow

#### Test 2.4: Empty Wishlist
**Steps**:
1. Remove all items from wishlist
2. Observe header

**Expected Results**:
- Badge disappears
- Heart icon remains visible
- No "0" count shown

#### Test 2.5: Counter Updates
**Steps**:
1. Start with empty wishlist
2. Add item from product card
3. Add item from product detail page
4. Remove item from wishlist page

**Expected Results**:
- Counter increments immediately after each add
- Counter decrements immediately after remove
- No page refresh needed

---

### 3. Product Detail Page

#### Test 3.1: Wishlist Button - Not Saved
**Steps**:
1. Navigate to a product detail page for a product NOT in wishlist
2. Observe the wishlist button in purchase section

**Expected Results**:
- Button shows outline variant
- Text reads "저장"
- Heart icon is outline
- Button is clickable

#### Test 3.2: Wishlist Button - Saved
**Steps**:
1. Navigate to a product detail page for a product in wishlist
2. Observe the wishlist button

**Expected Results**:
- Button shows default variant (filled)
- Text reads "저장됨"
- Heart icon is filled with red
- Button is clickable

#### Test 3.3: Toggle from Detail Page
**Steps**:
1. Click "저장" button on product detail page
2. Wait for response
3. Click "저장됨" button

**Expected Results**:
- First click: Button changes to "저장됨", toast shows success
- Second click: Button changes to "저장", toast shows removal
- Header counter updates accordingly
- Button is disabled during API call

#### Test 3.4: Layout Responsiveness
**Steps**:
1. View product detail page on various screen sizes
2. Observe wishlist button layout

**Expected Results**:
- Desktop: 2-column grid (Buy Now | Save)
- Mobile: 2-column grid maintained
- Buttons are equal width
- No overflow or wrapping issues

---

### 4. Wishlist Page Integration

#### Test 4.1: Navigate from Header
**Steps**:
1. Click wishlist icon in header
2. Observe page load

**Expected Results**:
- Navigates to `/wishlist` page
- Page shows all wishlist items
- Items match those added via product cards

#### Test 4.2: Remove from Wishlist Page
**Steps**:
1. On `/wishlist` page, remove an item
2. Observe updates

**Expected Results**:
- Item removed from page
- Header counter decreases
- Product card heart icon becomes outline (if products page is refreshed)

---

### 5. Authentication Edge Cases

#### Test 5.1: Token Expiration
**Steps**:
1. Log in
2. Manually expire token in localStorage
3. Try to add to wishlist

**Expected Results**:
- Error toast appears
- User may be redirected to login
- No server errors

#### Test 5.2: Login During Session
**Steps**:
1. Start as unauthenticated user
2. Try to add to wishlist (should redirect to login)
3. Complete login
4. Return to product page

**Expected Results**:
- After login, wishlist state loads
- Can now add to wishlist
- Previous attempts don't create duplicates

---

### 6. Performance Tests

#### Test 6.1: Initial Page Load
**Steps**:
1. Clear cache
2. Navigate to `/products` page
3. Observe load time

**Expected Results**:
- Page loads in < 2 seconds
- Wishlist state loads asynchronously
- No blocking of product display

#### Test 6.2: Wishlist Toggle Speed
**Steps**:
1. Click wishlist button
2. Measure time to visual feedback

**Expected Results**:
- Optimistic UI update is instant (< 50ms)
- API confirmation within 500ms
- No perceived lag

#### Test 6.3: Multiple Products
**Steps**:
1. Load products page with 20+ products
2. Toggle wishlist on multiple products quickly

**Expected Results**:
- Each toggle responds quickly
- No UI freezing
- All state updates correctly

---

### 7. Accessibility Tests

#### Test 7.1: Keyboard Navigation
**Steps**:
1. Use Tab key to navigate to wishlist button
2. Press Enter to activate

**Expected Results**:
- Button receives focus outline
- Enter key triggers wishlist toggle
- Tab order is logical

#### Test 7.2: Screen Reader
**Steps**:
1. Enable screen reader
2. Navigate to wishlist button
3. Activate button

**Expected Results**:
- Button announces as "Add to wishlist" or "Remove from wishlist"
- State change is announced
- Toast messages are read aloud

#### Test 7.3: Color Contrast
**Steps**:
1. Use browser dev tools to check contrast
2. Test with color blindness simulator

**Expected Results**:
- Heart icon has sufficient contrast in all states
- Badge is readable
- No reliance on color alone for information

---

### 8. Error Handling Tests

#### Test 8.1: Network Error
**Steps**:
1. Enable network throttling or go offline
2. Try to add to wishlist

**Expected Results**:
- Error toast appears: "위시리스트 업데이트에 실패했습니다"
- Button returns to previous state
- No console errors

#### Test 8.2: Server Error (500)
**Steps**:
1. Modify API to return 500 error
2. Try to add to wishlist

**Expected Results**:
- Error toast with appropriate message
- UI state reverts
- User can retry

#### Test 8.3: Invalid Product ID
**Steps**:
1. Try to add non-existent product to wishlist

**Expected Results**:
- Error message from server
- Toast notification shown
- No crash or blank page

---

## Visual Regression Testing

### Product Card
```
Before: [ ♡ ] (outline heart)
After:  [ ♥ ] (filled red heart)
```

### Header Badge
```
Before: 🤍 (no badge)
After:  🤍③ (badge with count)
```

### Product Detail Button
```
Before: [ ♡ 저장 ] (outline button)
After:  [ ♥ 저장됨 ] (filled button)
```

## Browser Compatibility Checklist

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Device Testing Checklist

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile (414x896)

## Automated Testing Commands

```bash
# Run development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Run type checking
npx tsc --noEmit
```

## Manual Testing Workflow

1. **Initial Setup** (5 minutes)
   - Start dev server
   - Create test accounts
   - Seed test products

2. **Core Functionality** (10 minutes)
   - Test all product card scenarios
   - Test header counter
   - Test product detail page

3. **Edge Cases** (5 minutes)
   - Test authentication edge cases
   - Test error scenarios
   - Test rapid interactions

4. **Responsive Design** (5 minutes)
   - Test on different screen sizes
   - Test mobile menu
   - Test touch interactions

5. **Accessibility** (5 minutes)
   - Test keyboard navigation
   - Check color contrast
   - Verify ARIA labels

**Total Estimated Testing Time**: 30 minutes

## Bug Reporting Template

```markdown
### Bug Description
[Clear description of the issue]

### Steps to Reproduce
1.
2.
3.

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- Browser:
- Device:
- User Role:
- Authentication State:

### Screenshots
[Attach screenshots if applicable]

### Console Errors
[Paste any console errors]
```

## Success Criteria

✅ All functional tests pass
✅ No console errors or warnings
✅ Responsive design works on all screen sizes
✅ Accessibility standards met (WCAG 2.1 AA)
✅ Performance benchmarks met (< 2s load time)
✅ Error handling is graceful
✅ User feedback is clear and immediate
✅ Cross-browser compatibility confirmed

---

**Note**: This testing guide covers the wishlist UI integration. Backend wishlist API testing should be conducted separately.

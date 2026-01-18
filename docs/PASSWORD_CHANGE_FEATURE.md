# Password Change Feature Documentation

## Overview

This document describes the password change functionality implemented for the AI Marketplace platform. Users can securely change their passwords from their profile page.

## Features

### 1. Password Validation
- **Minimum Length**: 8 characters
- **Maximum Length**: 128 characters
- **Character Requirements**:
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 number (0-9)
  - At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

### 2. Password Strength Indicator
Real-time visual feedback showing password strength:
- **Weak** (0-39%): Red indicator
- **Medium** (40-59%): Orange indicator
- **Strong** (60-79%): Green indicator
- **Very Strong** (80-100%): Emerald indicator

### 3. Security Features
- Current password verification required
- New password must differ from current password
- Rate limiting: 5 attempts per 15 minutes
- Secure password hashing with bcrypt (12 rounds)
- Password visibility toggle for all fields
- Real-time client-side validation
- Server-side validation

### 4. User Experience
- Clear error messages
- Live password strength feedback
- Password requirements checklist
- Security tips and best practices
- Responsive design
- Keyboard navigation support
- Accessible ARIA labels

## Implementation

### File Structure

```
AI_marketplace/
├── app/
│   ├── api/user/password/
│   │   └── route.ts              # Password change API endpoint
│   └── (marketplace)/profile/
│       ├── page.tsx               # Profile page (updated)
│       └── password/
│           └── page.tsx           # Password change page
├── lib/
│   ├── validators/
│   │   └── password.ts            # Password validation utilities
│   └── rate-limit.ts              # Rate limiting utility
├── __tests__/
│   ├── unit/validators/
│   │   └── password.test.ts      # Unit tests for password validator
│   └── integration/api/
│       └── password-change.test.ts # Integration tests for API
└── docs/
    └── PASSWORD_CHANGE_FEATURE.md # This file
```

### API Endpoint

**Endpoint**: `PATCH /api/user/password`

**Authentication**: Required (JWT token)

**Request Body**:
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses**:

- **400 Bad Request** - Invalid input or validation error
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "newPassword",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

- **401 Unauthorized** - Incorrect current password or missing auth
```json
{
  "error": "Current password is incorrect"
}
```

- **429 Too Many Requests** - Rate limit exceeded
```json
{
  "error": "Too many password change attempts. Please try again later.",
  "retryAfter": 900
}
```

### Password Validation

The password validator provides multiple utility functions:

#### `validatePasswordRequirements(password: string)`
Validates password against all requirements.

```typescript
const result = validatePasswordRequirements('MyP@ssw0rd123');
// {
//   isValid: true,
//   errors: []
// }
```

#### `getPasswordStrengthDetails(password: string)`
Returns comprehensive strength analysis.

```typescript
const details = getPasswordStrengthDetails('MyP@ssw0rd123');
// {
//   score: 60,
//   level: 'strong',
//   label: 'Strong',
//   color: 'green',
//   percentage: 60
// }
```

#### `isCommonPassword(password: string)`
Checks against common passwords list.

```typescript
isCommonPassword('password123'); // true
isCommonPassword('MyUn1que!P@ss'); // false
```

### Rate Limiting

Protection against brute force attacks:
- **Limit**: 5 attempts per 15 minutes per user
- **Tracking**: By user ID (authenticated users)
- **Storage**: In-memory LRU cache
- **Headers**: Rate limit info in response headers

```typescript
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1641024000
```

## User Flow

1. User navigates to Profile page (`/profile`)
2. Clicks "Change Password" button in Security section
3. Redirected to Password Change page (`/profile/password`)
4. Fills out form:
   - Current password
   - New password (with strength indicator)
   - Confirm new password
5. Real-time validation feedback as user types
6. Submits form
7. API validates and updates password
8. Success message displayed
9. Redirected back to profile page

## Security Considerations

### Implemented
✅ Password hashing with bcrypt (12 rounds)
✅ Rate limiting to prevent brute force
✅ Current password verification
✅ Secure session management
✅ HTTPS enforced in production
✅ No password logging
✅ Constant-time password comparison
✅ OAuth user protection

### Future Enhancements
🔲 Email notification on password change
🔲 Password change audit log
🔲 Session invalidation after password change
🔲 Password history (prevent reuse)
🔲 Two-factor authentication
🔲 Suspicious activity detection

## Testing

### Unit Tests
Located in `__tests__/unit/validators/password.test.ts`

Run with:
```bash
npm test password.test.ts
```

Coverage includes:
- Password validation rules
- Strength calculation
- Common password detection
- Zod schema validation

### Integration Tests
Located in `__tests__/integration/api/password-change.test.ts`

Run with:
```bash
npm test password-change.test.ts
```

Coverage includes:
- Successful password change
- Incorrect current password
- Mismatched new passwords
- Same current and new password
- Weak password rejection
- Authentication requirement
- OAuth user protection
- Rate limiting

### Manual Testing Checklist

- [ ] Change password with valid inputs
- [ ] Try incorrect current password
- [ ] Try weak new password
- [ ] Try mismatched passwords
- [ ] Try same current and new password
- [ ] Verify password strength indicator updates
- [ ] Test password visibility toggles
- [ ] Test rate limiting (5+ attempts)
- [ ] Verify OAuth users cannot change password
- [ ] Test on mobile devices
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility

## Usage Examples

### For Users

1. **Navigate to Profile**
   ```
   Click on profile avatar → "내 프로필"
   ```

2. **Access Password Change**
   ```
   In Security section → Click "변경하기" button
   ```

3. **Change Password**
   ```
   Enter current password
   Enter new password (see strength indicator)
   Confirm new password
   Click "Change Password"
   ```

### For Developers

#### Using Password Validator

```typescript
import {
  passwordSchema,
  getPasswordStrengthDetails,
  isCommonPassword,
} from '@/lib/validators/password';

// Validate password
const result = passwordSchema.safeParse('MyP@ssw0rd123');
if (!result.success) {
  console.error(result.error.errors);
}

// Get strength details
const strength = getPasswordStrengthDetails('MyP@ssw0rd123');
console.log(`Password strength: ${strength.label} (${strength.percentage}%)`);

// Check for common passwords
if (isCommonPassword(password)) {
  console.warn('Password is too common!');
}
```

#### Calling API from Frontend

```typescript
const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await fetch('/api/user/password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
};
```

## Accessibility

- **ARIA Labels**: All form fields have descriptive labels
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper semantic HTML
- **Focus Management**: Logical tab order
- **Error Announcements**: Errors announced to screen readers
- **Color Contrast**: WCAG AA compliant

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- `zod` - Schema validation
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod resolver for react-hook-form
- `bcryptjs` - Password hashing
- `lru-cache` - Rate limiting cache
- `lucide-react` - Icons
- `@radix-ui` - UI components

## Performance

- **API Response Time**: < 500ms (typical)
- **Password Hash Time**: ~100ms
- **Client-side Validation**: Instant
- **Bundle Size Impact**: +15KB (gzipped)

## Troubleshooting

### Common Issues

**Issue**: "Current password is incorrect"
- **Solution**: Verify you're entering the correct current password
- **Check**: Caps Lock is off

**Issue**: "Too many attempts"
- **Solution**: Wait 15 minutes before trying again
- **Prevention**: Use password manager to avoid typos

**Issue**: "Password too weak"
- **Solution**: Include uppercase, lowercase, number, and special character
- **Tip**: Use the strength indicator for guidance

**Issue**: "Cannot change password for OAuth accounts"
- **Solution**: This is intentional - OAuth accounts use provider authentication
- **Alternative**: Manage password through OAuth provider (Google, GitHub, etc.)

## Monitoring

### Metrics to Track
- Password change success rate
- Failed attempts by reason
- Rate limit hits
- Average password strength
- Time to complete flow

### Logs to Monitor
- Failed password change attempts
- Rate limit violations
- Validation errors
- OAuth user attempts

## Support

For issues or questions:
- Create GitHub issue
- Contact dev team
- Check security documentation

---

**Last Updated**: 2026-01-10
**Version**: 1.0.0
**Author**: AI Marketplace Development Team

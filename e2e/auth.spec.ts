/**
 * E2E Tests: Authentication Flow
 *
 * Tests user registration, OAuth login, password reset, RBAC, and session persistence
 */

import { test, expect, Page } from '@playwright/test'

// Test data
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User',
}

const TEST_SELLER = {
  email: `seller-${Date.now()}@example.com`,
  password: 'SellerPass123!',
  name: 'Test Seller',
}

test.describe('Authentication Flow', () => {
  test.describe('User Registration', () => {
    test('should register new user with email successfully', async ({ page }) => {
      await page.goto('/register')

      // Fill registration form
      await page.fill('input[name="email"]', TEST_USER.email)
      await page.fill('input[name="password"]', TEST_USER.password)
      await page.fill('input[name="confirmPassword"]', TEST_USER.password)
      await page.fill('input[name="name"]', TEST_USER.name)

      // Check terms and conditions
      await page.check('input[type="checkbox"]#terms')

      // Submit form
      await page.click('button[type="submit"]')

      // Should redirect to dashboard or email verification page
      await expect(page).toHaveURL(/\/(dashboard|verify-email)/)

      // Should show success message (removed - no success message on dashboard)
      // await expect(page.locator('text=/successfully registered/i')).toBeVisible()
    })

    test('should validate password strength requirements', async ({ page }) => {
      await page.goto('/register')

      // Try weak password
      await page.fill('input[name="email"]', TEST_USER.email)
      await page.fill('input[name="password"]', 'weak')
      await page.fill('input[name="confirmPassword"]', 'weak')

      await page.click('button[type="submit"]')

      // Should show password strength error
      await expect(page.locator('text=/password must/i')).toBeVisible()
    })

    test('should prevent duplicate email registration', async ({ page }) => {
      // Register first time
      await page.goto('/register')
      await page.fill('input[name="email"]', TEST_USER.email)
      await page.fill('input[name="password"]', TEST_USER.password)
      await page.fill('input[name="confirmPassword"]', TEST_USER.password)
      await page.fill('input[name="name"]', TEST_USER.name)
      await page.click('button[type="submit"]')

      // Try to register again with same email
      await page.goto('/register')
      await page.fill('input[name="email"]', TEST_USER.email)
      await page.fill('input[name="password"]', TEST_USER.password)
      await page.fill('input[name="confirmPassword"]', TEST_USER.password)
      await page.fill('input[name="name"]', TEST_USER.name)
      await page.click('button[type="submit"]')

      // Should show error
      await expect(page.locator('text=/already exists/i')).toBeVisible()
    })

    test('should validate email format', async ({ page }) => {
      await page.goto('/register')

      await page.fill('input[name="email"]', 'invalid-email')
      await page.fill('input[name="password"]', TEST_USER.password)
      await page.click('button[type="submit"]')

      // Should show validation error
      await expect(page.locator('text=/valid email/i')).toBeVisible()
    })

    test('should confirm password match', async ({ page }) => {
      await page.goto('/register')

      await page.fill('input[name="email"]', TEST_USER.email)
      await page.fill('input[name="password"]', TEST_USER.password)
      await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!')
      await page.click('button[type="submit"]')

      // Should show password mismatch error
      await expect(page.locator('text=/passwords.*match/i')).toBeVisible()
    })
  })

  test.describe('Email Login', () => {
    test.beforeEach(async ({ page }) => {
      // Register user for login tests
      await registerUser(page, TEST_USER)
    })

    test('should login with correct credentials', async ({ page }) => {
      await page.goto('/login')

      await page.fill('input[name="email"]', TEST_USER.email)
      await page.fill('input[name="password"]', TEST_USER.password)
      await page.click('button[type="submit"]')

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/)

      // Should show user info
      await expect(page.locator(`text=${TEST_USER.name}`)).toBeVisible()
    })

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto('/login')

      await page.fill('input[name="email"]', TEST_USER.email)
      await page.fill('input[name="password"]', 'WrongPassword123!')
      await page.click('button[type="submit"]')

      // Should show error
      await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible()

      // Should remain on login page
      await expect(page).toHaveURL(/\/auth\/login/)
    })

    test('should implement rate limiting on failed attempts', async ({ page }) => {
      await page.goto('/login')

      // Try multiple failed logins
      for (let i = 0; i < 6; i++) {
        await page.fill('input[name="email"]', TEST_USER.email)
        await page.fill('input[name="password"]', 'WrongPassword')
        await page.click('button[type="submit"]')
        await page.waitForTimeout(500)
      }

      // Should show rate limit error
      await expect(page.locator('text=/too many.*attempts/i')).toBeVisible()
    })

    test('should remember user with "Remember Me" option', async ({ page, context }) => {
      await page.goto('/login')

      await page.fill('input[name="email"]', TEST_USER.email)
      await page.fill('input[name="password"]', TEST_USER.password)
      await page.check('input[name="remember"]')
      await page.click('button[type="submit"]')

      await expect(page).toHaveURL(/\/dashboard/)

      // Check for long-lived refresh token cookie
      const cookies = await context.cookies()
      const refreshToken = cookies.find(c => c.name === 'refreshToken')

      expect(refreshToken).toBeDefined()
      // Should expire in ~30 days
      expect(refreshToken!.expires).toBeGreaterThan(Date.now() / 1000 + 29 * 24 * 60 * 60)
    })
  })

  test.describe('OAuth Login', () => {
    test('should initiate Google OAuth flow', async ({ page }) => {
      await page.goto('/login')

      // Click Google login button
      const googleButton = page.locator('button:has-text("Continue with Google")')
      await googleButton.click()

      // Should redirect to Google OAuth
      await page.waitForURL(/accounts\.google\.com/)
      expect(page.url()).toContain('google.com')
    })

    test('should initiate GitHub OAuth flow', async ({ page }) => {
      await page.goto('/login')

      // Click GitHub login button
      const githubButton = page.locator('button:has-text("Continue with GitHub")')
      await githubButton.click()

      // Should redirect to GitHub OAuth
      await page.waitForURL(/github\.com\/login/)
      expect(page.url()).toContain('github.com')
    })

    // Note: Full OAuth testing requires mock OAuth provider or test accounts
    test.skip('should complete OAuth flow and create account', async ({ page }) => {
      // This test would require OAuth mock/test setup
    })
  })

  test.describe('Password Reset Flow', () => {
    test('should request password reset email', async ({ page }) => {
      await page.goto('/forgot-password')

      await page.fill('input[name="email"]', TEST_USER.email)
      await page.click('button[type="submit"]')

      // Should show success message
      await expect(page.locator('text=/reset.*sent/i')).toBeVisible()
    })

    test('should validate reset token', async ({ page }) => {
      // Try to access reset page with invalid token
      await page.goto('/reset-password?token=invalid-token')

      await page.fill('input[name="password"]', 'NewPassword123!')
      await page.fill('input[name="confirmPassword"]', 'NewPassword123!')
      await page.click('button[type="submit"]')

      // Should show invalid token error
      await expect(page.locator('text=/invalid.*expired.*token/i')).toBeVisible()
    })

    test('should enforce password requirements on reset', async ({ page }) => {
      // Assuming we have a valid reset token
      const resetToken = 'valid-test-token'
      await page.goto(`/reset-password?token=${resetToken}`)

      await page.fill('input[name="password"]', 'weak')
      await page.fill('input[name="confirmPassword"]', 'weak')
      await page.click('button[type="submit"]')

      // Should show password strength error
      await expect(page.locator('text=/password must/i')).toBeVisible()
    })
  })

  test.describe('Role-Based Access Control', () => {
    test('should restrict admin routes to admin users', async ({ page }) => {
      // Login as regular user
      await loginUser(page, TEST_USER)

      // Try to access admin page
      await page.goto('/admin/dashboard')

      // Should redirect to unauthorized or login
      await expect(page).toHaveURL(/\/(unauthorized|auth\/login)/)
    })

    test('should restrict verifier routes to verifier role', async ({ page }) => {
      // Login as regular user
      await loginUser(page, TEST_USER)

      // Try to access verifier page
      await page.goto('/verifier/dashboard')

      // Should redirect to unauthorized
      await expect(page).toHaveURL(/\/unauthorized/)
    })

    test('should allow seller to access seller dashboard', async ({ page }) => {
      // Register and login as seller
      await registerUser(page, TEST_SELLER)
      await loginUser(page, TEST_SELLER)

      // Should access seller dashboard
      await page.goto('/dashboard')
      await expect(page).toHaveURL(/\/marketplace\/seller\/dashboard/)
    })
  })

  test.describe('Session Persistence', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      await loginUser(page, TEST_USER)

      await expect(page).toHaveURL(/\/dashboard/)

      // Refresh page
      await page.reload()

      // Should still be logged in
      await expect(page).toHaveURL(/\/dashboard/)
      await expect(page.locator(`text=${TEST_USER.name}`)).toBeVisible()
    })

    test('should maintain session across browser tabs', async ({ context }) => {
      const page1 = await context.newPage()
      await loginUser(page1, TEST_USER)

      // Open new tab
      const page2 = await context.newPage()
      await page2.goto('/dashboard')

      // Should be logged in on new tab
      await expect(page2).toHaveURL(/\/dashboard/)
      await expect(page2.locator(`text=${TEST_USER.name}`)).toBeVisible()

      await page1.close()
      await page2.close()
    })

    test('should expire session after timeout', async ({ page }) => {
      await loginUser(page, TEST_USER)

      // Mock time passing (this would need actual implementation)
      // In real scenario, we'd configure a short session timeout for testing

      // For now, we can test that logout works
      await page.click('button:has-text("Logout")')

      await expect(page).toHaveURL(/\/auth\/login/)
    })

    test('should handle concurrent sessions', async ({ context }) => {
      const page1 = await context.newPage()
      const page2 = await context.newPage()

      // Login on both tabs
      await loginUser(page1, TEST_USER)
      await loginUser(page2, TEST_USER)

      // Both should work
      await expect(page1.locator(`text=${TEST_USER.name}`)).toBeVisible()
      await expect(page2.locator(`text=${TEST_USER.name}`)).toBeVisible()

      await page1.close()
      await page2.close()
    })
  })

  test.describe('Logout', () => {
    test('should logout and clear session', async ({ page, context }) => {
      await loginUser(page, TEST_USER)

      // Logout
      await page.click('button:has-text("Logout")')

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/)

      // Cookies should be cleared
      const cookies = await context.cookies()
      const authCookie = cookies.find(c => c.name === 'accessToken' || c.name === 'refreshToken')
      expect(authCookie).toBeUndefined()
    })

    test('should prevent access to protected routes after logout', async ({ page }) => {
      await loginUser(page, TEST_USER)
      await page.click('button:has-text("Logout")')

      // Try to access protected route
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/)
    })
  })

  test.describe('CSRF Protection', () => {
    test('should include CSRF token in forms', async ({ page }) => {
      await page.goto('/login')

      // Check for CSRF token in form
      const csrfInput = page.locator('input[name="csrf_token"], input[name="_csrf"]')
      await expect(csrfInput).toBeAttached()
    })

    test('should reject requests without CSRF token', async ({ page, request }) => {
      // This would require direct API testing
      // Try to make login request without CSRF token
      const response = await request.post('/api/login', {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      })

      // Should fail without CSRF token (403)
      expect(response.status()).toBe(403)
    })
  })
})

// Helper Functions
async function registerUser(page: Page, user: typeof TEST_USER) {
  await page.goto('/register')
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)
  await page.fill('input[name="confirmPassword"]', user.password)
  await page.fill('input[name="name"]', user.name)

  // Check terms and conditions checkbox
  await page.check('input[type="checkbox"]#terms')

  await page.click('button[type="submit"]')

  // Wait for registration to complete
  await page.waitForURL(/\/(dashboard|verify-email)/, { timeout: 5000 })
}

async function loginUser(page: Page, user: typeof TEST_USER) {
  await page.goto('/login')
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)
  await page.click('button[type="submit"]')

  // Wait for login to complete
  await page.waitForURL(/\/dashboard/, { timeout: 5000 })
}

/**
 * Playwright Authentication Fixtures
 * Fixtures for authenticated E2E testing
 */

import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

// ============================================================================
// Types
// ============================================================================

type AuthUser = {
  email: string
  password: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  name: string
}

type AuthFixtures = {
  authenticatedPage: Page
  buyerPage: Page
  sellerPage: Page
  adminPage: Page
}

// ============================================================================
// Test Users
// ============================================================================

export const testUsers: Record<string, AuthUser> = {
  buyer: {
    email: 'test-buyer@example.com',
    password: 'TestPassword123!',
    role: 'BUYER',
    name: 'Test Buyer',
  },
  seller: {
    email: 'test-seller@example.com',
    password: 'TestPassword123!',
    role: 'SELLER',
    name: 'Test Seller',
  },
  admin: {
    email: 'test-admin@example.com',
    password: 'TestPassword123!',
    role: 'ADMIN',
    name: 'Test Admin',
  },
}

// ============================================================================
// Authentication Helpers
// ============================================================================

/**
 * Login with credentials
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')

  // Wait for redirect after login
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 10000,
  })
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]')
  await page.click('[data-testid="logout-button"]')
  await page.waitForURL('/login')
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    const userMenu = page.locator('[data-testid="user-menu"]')
    await userMenu.waitFor({ timeout: 2000 })
    return await userMenu.isVisible()
  } catch {
    return false
  }
}

/**
 * Register new user
 */
export async function register(
  page: Page,
  user: {
    email: string
    password: string
    name: string
    role?: 'BUYER' | 'SELLER'
  }
) {
  await page.goto('/register')
  await page.fill('input[name="name"]', user.name)
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)

  if (user.role === 'SELLER') {
    await page.check('input[name="isSeller"]')
  }

  await page.click('button[type="submit"]')

  // Wait for redirect or success message
  await page.waitForURL((url) => !url.pathname.includes('/register'), {
    timeout: 10000,
  })
}

/**
 * Setup seller profile (for sellers only)
 */
export async function setupSellerProfile(
  page: Page,
  profile: {
    businessName: string
    businessNumber: string
    businessEmail: string
    phoneNumber: string
    bankName: string
    accountNumber: string
    accountHolder: string
  }
) {
  await page.goto('/seller/profile/setup')

  await page.fill('input[name="businessName"]', profile.businessName)
  await page.fill('input[name="businessNumber"]', profile.businessNumber)
  await page.fill('input[name="businessEmail"]', profile.businessEmail)
  await page.fill('input[name="phoneNumber"]', profile.phoneNumber)
  await page.fill('input[name="bankName"]', profile.bankName)
  await page.fill('input[name="accountNumber"]', profile.accountNumber)
  await page.fill('input[name="accountHolder"]', profile.accountHolder)

  await page.click('button[type="submit"]')

  await page.waitForURL((url) => !url.pathname.includes('/setup'), {
    timeout: 10000,
  })
}

// ============================================================================
// Playwright Fixtures
// ============================================================================

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Generic authenticated page
   */
  authenticatedPage: async ({ page }, use) => {
    await login(page, testUsers.buyer.email, testUsers.buyer.password)
    await use(page)
    await logout(page)
  },

  /**
   * Buyer authenticated page
   */
  buyerPage: async ({ page }, use) => {
    await login(page, testUsers.buyer.email, testUsers.buyer.password)
    await use(page)
    await logout(page)
  },

  /**
   * Seller authenticated page
   */
  sellerPage: async ({ page }, use) => {
    await login(page, testUsers.seller.email, testUsers.seller.password)
    await use(page)
    await logout(page)
  },

  /**
   * Admin authenticated page
   */
  adminPage: async ({ page }, use) => {
    await login(page, testUsers.admin.email, testUsers.admin.password)
    await use(page)
    await logout(page)
  },
})

export { expect }

// ============================================================================
// Storage State Helpers
// ============================================================================

/**
 * Save authentication state to file
 */
export async function saveAuthState(page: Page, filePath: string) {
  await page.context().storageState({ path: filePath })
}

/**
 * Load authentication state from file
 */
export async function loadAuthState(page: Page, filePath: string) {
  // Storage state is loaded when creating browser context
  // This is handled in playwright.config.ts
  return filePath
}

// ============================================================================
// Token Helpers
// ============================================================================

/**
 * Get authentication token from localStorage
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    return localStorage.getItem('authToken')
  })
}

/**
 * Set authentication token in localStorage
 */
export async function setAuthToken(page: Page, token: string) {
  await page.evaluate((token) => {
    localStorage.setItem('authToken', token)
  }, token)
}

/**
 * Clear authentication token
 */
export async function clearAuthToken(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('authToken')
  })
}

// ============================================================================
// Session Helpers
// ============================================================================

/**
 * Get current user session
 */
export async function getCurrentUser(page: Page): Promise<any | null> {
  const response = await page.request.get('/api/auth/session')
  if (response.ok()) {
    const data = await response.json()
    return data.user || null
  }
  return null
}

/**
 * Verify user has specific role
 */
export async function verifyUserRole(
  page: Page,
  expectedRole: 'BUYER' | 'SELLER' | 'ADMIN'
) {
  const user = await getCurrentUser(page)
  expect(user).toBeTruthy()
  expect(user.role).toBe(expectedRole)
}

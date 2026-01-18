import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/AI Marketplace/)
  })

  test('should have navigation menu', async ({ page }) => {
    await page.goto('/')

    // Check for main navigation elements
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })
})

test.describe('Product Listing', () => {
  test('should display products', async ({ page }) => {
    await page.goto('/products')

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000
    })

    // Verify at least one product is visible
    const products = page.locator('[data-testid="product-card"]')
    await expect(products.first()).toBeVisible()
  })

  test('should allow filtering products', async ({ page }) => {
    await page.goto('/products')

    // Set mobile viewport to make filter button visible
    await page.setViewportSize({ width: 375, height: 667 })

    // Verify filter button exists and is clickable
    const filterButton = page.locator('[data-testid="category-filter"]')
    await expect(filterButton).toBeVisible()

    // Products should still be visible
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()
  })
})

test.describe('Authentication', () => {
  test('should redirect to login when accessing protected page', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*login/)
  })

  test('should show login form', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
  })

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/')

    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })
})

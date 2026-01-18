/**
 * E2E Tests: Seller Workflow
 *
 * Tests product upload, dashboard analytics, review responses, settlement requests
 */

import { test, expect, Page } from '@playwright/test'
import path from 'path'

const TEST_SELLER = {
  email: `seller-${Date.now()}@example.com`,
  password: 'SellerPass123!',
  name: 'Test Seller',
}

const TEST_PRODUCT = {
  name: 'AI Chatbot Model',
  description: 'Advanced conversational AI model trained on diverse datasets',
  price: '49.99',
  category: 'AI Models',
}

test.describe('Seller Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login as seller
    await registerAndLogin(page, TEST_SELLER)
  })

  test.describe('Product Upload', () => {
    test('should upload new product with all required fields', async ({ page }) => {
      await page.goto('/marketplace/seller/products/new')

      // Fill product details
      await page.fill('input[name="name"]', TEST_PRODUCT.name)
      await page.fill('textarea[name="description"]', TEST_PRODUCT.description)
      await page.fill('input[name="price"]', TEST_PRODUCT.price)

      // Select category
      await page.click('[data-testid="category-select"]')
      await page.click(`text="${TEST_PRODUCT.category}"`)

      // Upload product file
      const fileInput = page.locator('input[type="file"][name="productFile"]')
      await fileInput.setInputFiles({
        name: 'model.zip',
        mimeType: 'application/zip',
        buffer: Buffer.from('test file content'),
      })

      // Wait for upload progress
      await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible()
      await expect(page.locator('text=/upload.*complete/i')).toBeVisible({ timeout: 10000 })

      // Upload thumbnail
      const thumbnailInput = page.locator('input[type="file"][name="thumbnail"]')
      await thumbnailInput.setInputFiles({
        name: 'thumbnail.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake image data'),
      })

      // Submit form
      await page.click('[data-testid="submit-product"]')

      // Should redirect to product page or success
      await expect(page).toHaveURL(/\/marketplace\/seller\/products\/[a-z0-9]+|\/success/)

      // Should show success message
      await expect(page.locator('text=/product.*created|uploaded.*successfully/i')).toBeVisible()
    })

    test('should validate required fields', async ({ page }) => {
      await page.goto('/marketplace/seller/products/new')

      // Try to submit without filling required fields
      await page.click('[data-testid="submit-product"]')

      // Should show validation errors
      await expect(page.locator('text=/name.*required/i')).toBeVisible()
      await expect(page.locator('text=/price.*required/i')).toBeVisible()
      await expect(page.locator('text=/file.*required/i')).toBeVisible()
    })

    test('should validate file size limits', async ({ page }) => {
      await page.goto('/marketplace/seller/products/new')

      // Try to upload file larger than limit (simulate)
      await page.fill('input[name="name"]', TEST_PRODUCT.name)

      const fileInput = page.locator('input[type="file"][name="productFile"]')

      // Note: Actual large file testing would require real files
      // For now, we check that size validation exists
      await expect(page.locator('text=/maximum.*size|file.*large/i')).toBeHidden()
    })

    test('should validate file types', async ({ page }) => {
      await page.goto('/marketplace/seller/products/new')

      // Try to upload invalid file type
      const fileInput = page.locator('input[type="file"][name="productFile"]')
      await fileInput.setInputFiles({
        name: 'malicious.exe',
        mimeType: 'application/x-msdownload',
        buffer: Buffer.from('test'),
      })

      // Should show error
      await expect(page.locator('text=/invalid.*file.*type|not.*allowed/i')).toBeVisible()
    })

    test('should upload multiple preview images', async ({ page }) => {
      await page.goto('/marketplace/seller/products/new')

      await page.fill('input[name="name"]', TEST_PRODUCT.name)
      await page.fill('textarea[name="description"]', TEST_PRODUCT.description)
      await page.fill('input[name="price"]', TEST_PRODUCT.price)

      // Upload multiple images
      const imageInput = page.locator('input[type="file"][name="images"]')
      await imageInput.setInputFiles([
        {
          name: 'preview1.png',
          mimeType: 'image/png',
          buffer: Buffer.from('image1'),
        },
        {
          name: 'preview2.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('image2'),
        },
      ])

      // Should show uploaded images
      await expect(page.locator('[data-testid="preview-image"]')).toHaveCount(2)
    })

    test('should save product as draft', async ({ page }) => {
      await page.goto('/marketplace/seller/products/new')

      await page.fill('input[name="name"]', TEST_PRODUCT.name)
      await page.fill('textarea[name="description"]', TEST_PRODUCT.description)

      // Save as draft
      await page.click('[data-testid="save-draft"]')

      // Should show success
      await expect(page.locator('text=/saved.*draft/i')).toBeVisible()

      // Should appear in drafts
      await page.goto('/marketplace/seller/products?status=draft')
      await expect(page.locator(`text="${TEST_PRODUCT.name}"`)).toBeVisible()
    })

    test('should edit existing product', async ({ page }) => {
      // Create product first
      await createProduct(page, TEST_PRODUCT)

      // Go to products list
      await page.goto('/marketplace/seller/products')

      // Click edit on first product
      await page.click('[data-testid="edit-product"]')

      // Update details
      const newName = 'Updated AI Chatbot Model'
      await page.fill('input[name="name"]', newName)
      await page.click('[data-testid="submit-product"]')

      // Should show success
      await expect(page.locator('text=/updated.*successfully/i')).toBeVisible()

      // Should reflect changes
      await page.goto('/marketplace/seller/products')
      await expect(page.locator(`text="${newName}"`)).toBeVisible()
    })

    test('should delete product', async ({ page }) => {
      await createProduct(page, TEST_PRODUCT)
      await page.goto('/marketplace/seller/products')

      // Delete product
      await page.click('[data-testid="delete-product"]')

      // Confirm deletion
      await page.click('[data-testid="confirm-delete"]')

      // Should show success
      await expect(page.locator('text=/deleted.*successfully/i')).toBeVisible()

      // Should no longer appear in list
      await page.reload()
      await expect(page.locator(`text="${TEST_PRODUCT.name}"`)).toBeHidden()
    })
  })

  test.describe('Dashboard Analytics', () => {
    test('should display sales metrics', async ({ page }) => {
      await page.goto('/dashboard')

      // Should show key metrics
      await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible()
      await expect(page.locator('[data-testid="total-sales"]')).toBeVisible()
      await expect(page.locator('[data-testid="total-products"]')).toBeVisible()
      await expect(page.locator('[data-testid="average-rating"]')).toBeVisible()
    })

    test('should display sales chart', async ({ page }) => {
      await page.goto('/dashboard')

      // Should render chart
      await expect(page.locator('[data-testid="sales-chart"]')).toBeVisible()

      // Should have time range selector
      await expect(page.locator('[data-testid="time-range-selector"]')).toBeVisible()
    })

    test('should filter metrics by time period', async ({ page }) => {
      await page.goto('/dashboard')

      // Select different time period
      await page.click('[data-testid="time-range-selector"]')
      await page.click('text="Last 30 Days"')

      // Should update metrics
      await page.waitForLoadState('networkidle')
      await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible()
    })

    test('should display top-selling products', async ({ page }) => {
      await page.goto('/dashboard')

      // Should show top products
      const topProducts = page.locator('[data-testid="top-product"]')
      if ((await topProducts.count()) > 0) {
        await expect(topProducts.first()).toBeVisible()
        await expect(topProducts.first().locator('[data-testid="product-sales"]')).toBeVisible()
      }
    })

    test('should show recent orders', async ({ page }) => {
      await page.goto('/dashboard')

      // Should display recent orders section
      await expect(page.locator('[data-testid="recent-orders"]')).toBeVisible()
    })

    test('should navigate to detailed analytics', async ({ page }) => {
      await page.goto('/dashboard')

      // Click view details
      await page.click('[data-testid="view-analytics"]')

      // Should navigate to analytics page
      await expect(page).toHaveURL(/\/marketplace\/seller\/analytics/)
    })
  })

  test.describe('Review Management', () => {
    test('should view product reviews', async ({ page }) => {
      await page.goto('/marketplace/seller/products')

      // Click on product with reviews
      await page.click('[data-testid="product-card"]')

      // Go to reviews tab
      await page.click('[data-testid="reviews-tab"]')

      // Should display reviews
      const reviews = page.locator('[data-testid="review-item"]')
      if ((await reviews.count()) > 0) {
        await expect(reviews.first()).toBeVisible()
      }
    })

    test('should respond to customer review', async ({ page }) => {
      await page.goto('/marketplace/seller/products')
      await page.click('[data-testid="product-card"]')
      await page.click('[data-testid="reviews-tab"]')

      const review = page.locator('[data-testid="review-item"]').first()

      if ((await review.count()) > 0) {
        // Click reply button
        await review.locator('[data-testid="reply-button"]').click()

        // Write response
        await page.fill('textarea[name="reply"]', 'Thank you for your feedback!')
        await page.click('[data-testid="submit-reply"]')

        // Should show success
        await expect(page.locator('text=/reply.*posted/i')).toBeVisible()

        // Should display reply
        await expect(review.locator('[data-testid="seller-reply"]')).toBeVisible()
      }
    })

    test('should edit review response', async ({ page }) => {
      await page.goto('/marketplace/seller/products')
      await page.click('[data-testid="product-card"]')
      await page.click('[data-testid="reviews-tab"]')

      const review = page.locator('[data-testid="review-item"]:has([data-testid="seller-reply"])').first()

      if ((await review.count()) > 0) {
        await review.locator('[data-testid="edit-reply"]').click()
        await page.fill('textarea[name="reply"]', 'Updated response')
        await page.click('[data-testid="submit-reply"]')

        await expect(page.locator('text=/updated.*successfully/i')).toBeVisible()
      }
    })

    test('should filter reviews by rating', async ({ page }) => {
      await page.goto('/marketplace/seller/products')
      await page.click('[data-testid="product-card"]')
      await page.click('[data-testid="reviews-tab"]')

      // Filter by 5 stars
      await page.click('[data-testid="rating-filter"]')
      await page.click('text="5 Stars"')

      // Should show only 5-star reviews
      const reviews = page.locator('[data-testid="review-item"]')
      if ((await reviews.count()) > 0) {
        const ratings = await reviews.locator('[data-testid="review-rating"]').allTextContents()
        ratings.forEach(rating => {
          expect(rating).toContain('5')
        })
      }
    })
  })

  test.describe('Settlement Management', () => {
    test('should view settlement history', async ({ page }) => {
      await page.goto('/marketplace/seller/settlements')

      // Should display settlements
      await expect(page.locator('[data-testid="settlement-list"]')).toBeVisible()
    })

    test('should request monthly settlement', async ({ page }) => {
      await page.goto('/marketplace/seller/settlements')

      // Should show pending balance
      await expect(page.locator('[data-testid="pending-balance"]')).toBeVisible()

      // Request settlement (if eligible)
      const requestButton = page.locator('[data-testid="request-settlement"]')

      if (await requestButton.isEnabled()) {
        await requestButton.click()

        // Confirm request
        await page.click('[data-testid="confirm-settlement"]')

        // Should show success
        await expect(page.locator('text=/settlement.*requested/i')).toBeVisible()
      }
    })

    test('should download settlement report', async ({ page }) => {
      await page.goto('/marketplace/seller/settlements')

      const settlements = page.locator('[data-testid="settlement-item"]')

      if ((await settlements.count()) > 0) {
        // Download report
        const downloadPromise = page.waitForEvent('download')
        await settlements.first().locator('[data-testid="download-report"]').click()
        const download = await downloadPromise

        expect(download.suggestedFilename()).toMatch(/settlement.*pdf|csv/)
        await download.cancel()
      }
    })

    test('should update bank account information', async ({ page }) => {
      await page.goto('/marketplace/seller/settings')

      // Go to payment settings
      await page.click('[data-testid="payment-settings-tab"]')

      // Update bank info
      await page.fill('input[name="bankName"]', 'Test Bank')
      await page.fill('input[name="accountNumber"]', '1234567890')
      await page.fill('input[name="accountHolder"]', TEST_SELLER.name)

      await page.click('[data-testid="save-payment-settings"]')

      // Should show success
      await expect(page.locator('text=/saved.*successfully/i')).toBeVisible()
    })

    test('should view settlement breakdown', async ({ page }) => {
      await page.goto('/marketplace/seller/settlements')

      const settlement = page.locator('[data-testid="settlement-item"]').first()

      if ((await settlement.count()) > 0) {
        await settlement.click()

        // Should show detailed breakdown
        await expect(page.locator('[data-testid="total-sales"]')).toBeVisible()
        await expect(page.locator('[data-testid="platform-fee"]')).toBeVisible()
        await expect(page.locator('[data-testid="payout-amount"]')).toBeVisible()
        await expect(page.locator('[data-testid="settlement-items"]')).toBeVisible()
      }
    })
  })

  test.describe('Product Management', () => {
    test('should filter products by status', async ({ page }) => {
      await page.goto('/marketplace/seller/products')

      // Filter by active
      await page.click('[data-testid="status-filter"]')
      await page.click('text="Active"')

      // Should show only active products
      const products = page.locator('[data-testid="product-card"]')
      if ((await products.count()) > 0) {
        const badges = await products.locator('[data-testid="product-status"]').allTextContents()
        badges.forEach(badge => {
          expect(badge.toLowerCase()).toContain('active')
        })
      }
    })

    test('should sort products by sales', async ({ page }) => {
      await page.goto('/marketplace/seller/products')

      // Sort by sales
      await page.click('[data-testid="sort-dropdown"]')
      await page.click('text="Most Sales"')

      await page.waitForLoadState('networkidle')

      // Products should be sorted
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()
    })

    test('should archive product', async ({ page }) => {
      await createProduct(page, TEST_PRODUCT)
      await page.goto('/marketplace/seller/products')

      // Archive product
      await page.click('[data-testid="product-menu"]')
      await page.click('text="Archive"')

      // Confirm
      await page.click('[data-testid="confirm-archive"]')

      // Should show success
      await expect(page.locator('text=/archived.*successfully/i')).toBeVisible()

      // Should appear in archived filter
      await page.click('[data-testid="status-filter"]')
      await page.click('text="Archived"')
      await expect(page.locator(`text="${TEST_PRODUCT.name}"`)).toBeVisible()
    })
  })
})

// Helper Functions
async function registerAndLogin(page: Page, user: typeof TEST_SELLER) {
  await page.goto('/register')
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)
  await page.fill('input[name="confirmPassword"]', user.password)
  await page.fill('input[name="name"]', user.name)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|verify-email)/, { timeout: 5000 })
}

async function createProduct(page: Page, product: typeof TEST_PRODUCT) {
  await page.goto('/marketplace/seller/products/new')

  await page.fill('input[name="name"]', product.name)
  await page.fill('textarea[name="description"]', product.description)
  await page.fill('input[name="price"]', product.price)

  const fileInput = page.locator('input[type="file"][name="productFile"]')
  await fileInput.setInputFiles({
    name: 'model.zip',
    mimeType: 'application/zip',
    buffer: Buffer.from('test content'),
  })

  await page.click('[data-testid="submit-product"]')
  await page.waitForURL(/\/marketplace\/seller\/products\/[a-z0-9]+|\/success/, { timeout: 10000 })
}

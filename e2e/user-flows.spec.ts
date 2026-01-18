/**
 * E2E Tests: Complete User Flows
 *
 * Tests end-to-end user journeys including:
 * - Buyer purchase flow
 * - Seller product lifecycle
 * - Verifier workflow
 * - Admin operations
 */

import { test, expect, Page } from '@playwright/test'

// Test data
const TEST_BUYER = {
  email: `buyer-flow-${Date.now()}@example.com`,
  password: 'BuyerPass123!',
  name: 'Test Buyer',
}

const TEST_SELLER = {
  email: `seller-flow-${Date.now()}@example.com`,
  password: 'SellerPass123!',
  name: 'Test Seller',
}

const TEST_VERIFIER = {
  email: `verifier-flow-${Date.now()}@example.com`,
  password: 'VerifierPass123!',
  name: 'Test Verifier',
}

const TEST_PRODUCT = {
  name: 'E2E Test Product',
  description: 'Complete end-to-end test product with all features',
  price: '49.99',
  category: 'AI_MODEL',
}

test.describe('Complete User Flows', () => {
  test.describe('Buyer Journey', () => {
    test('Complete buyer purchase flow', async ({ page }) => {
      // 1. Browse marketplace without login
      await page.goto('/products')
      await expect(page.locator('[data-testid="product-list"]')).toBeVisible()

      // 2. View product details
      const firstProduct = page.locator('[data-testid="product-card"]').first()
      if (await firstProduct.count() > 0) {
        await firstProduct.click()
        await expect(page.locator('[data-testid="product-details"]')).toBeVisible()
        await expect(page.locator('[data-testid="product-price"]')).toBeVisible()
      }

      // 3. Attempt to purchase (should require login)
      if (await page.locator('[data-testid="purchase-button"]').count() > 0) {
        await page.click('[data-testid="purchase-button"]')
        await expect(page).toHaveURL(/\/auth\/login/)
      }

      // 4. Register as buyer
      await page.goto('/register')
      await page.fill('input[name="email"]', TEST_BUYER.email)
      await page.fill('input[name="password"]', TEST_BUYER.password)
      await page.fill('input[name="confirmPassword"]', TEST_BUYER.password)
      await page.fill('input[name="name"]', TEST_BUYER.name)
      await page.click('button[type="submit"]')

      await page.waitForURL(/\/(dashboard|marketplace)/, { timeout: 10000 })

      // 5. Navigate to product and purchase
      await page.goto('/products')
      const product = page.locator('[data-testid="product-card"]').first()

      if (await product.count() > 0) {
        await product.click()
        await page.click('[data-testid="purchase-button"]')

        // 6. Complete payment
        await expect(page).toHaveURL(/\/checkout/)
        await expect(page.locator('[data-testid="payment-form"]')).toBeVisible()

        // Fill payment details (test mode)
        if (await page.locator('input[name="cardNumber"]').count() > 0) {
          await page.fill('input[name="cardNumber"]', '4242424242424242')
          await page.fill('input[name="expiry"]', '12/25')
          await page.fill('input[name="cvc"]', '123')
        }

        await page.click('[data-testid="complete-payment"]')

        // 7. Verify purchase success
        await expect(page.locator('text=/payment.*successful|order.*complete/i')).toBeVisible({
          timeout: 15000,
        })

        // 8. Check purchase in dashboard
        await page.goto('/dashboard/purchases')
        await expect(page.locator('[data-testid="purchase-list"]')).toBeVisible()
      }
    })

    test('Buyer can view purchase history', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)

      await page.goto('/dashboard/purchases')
      await expect(page.locator('[data-testid="purchase-list"]')).toBeVisible()

      // Should show purchased products
      const purchases = page.locator('[data-testid="purchase-item"]')
      if (await purchases.count() > 0) {
        await expect(purchases.first()).toBeVisible()
      }
    })

    test('Buyer can download purchased product', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)
      await page.goto('/dashboard/purchases')

      const downloadButton = page.locator('[data-testid="download-product"]').first()
      if (await downloadButton.count() > 0) {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          downloadButton.click(),
        ])

        expect(download).toBeDefined()
        expect(download.suggestedFilename()).toBeTruthy()
      }
    })

    test('Buyer can leave product review', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)
      await page.goto('/dashboard/purchases')

      const reviewButton = page.locator('[data-testid="write-review"]').first()
      if (await reviewButton.count() > 0) {
        await reviewButton.click()

        // Fill review form
        await page.fill('textarea[name="content"]', 'Great product! Works perfectly.')
        await page.click('[data-testid="rating-5"]')
        await page.click('[data-testid="submit-review"]')

        await expect(page.locator('text=/review.*submitted/i')).toBeVisible()
      }
    })
  })

  test.describe('Seller Journey', () => {
    test('Complete seller product lifecycle', async ({ page }) => {
      // 1. Register as seller
      await page.goto('/register')
      await page.fill('input[name="email"]', TEST_SELLER.email)
      await page.fill('input[name="password"]', TEST_SELLER.password)
      await page.fill('input[name="confirmPassword"]', TEST_SELLER.password)
      await page.fill('input[name="name"]', TEST_SELLER.name)
      await page.click('button[type="submit"]')

      await page.waitForURL(/\/(dashboard|verify-email)/, { timeout: 10000 })

      // 2. Navigate to seller dashboard
      await page.goto('/dashboard')
      await expect(page.locator('[data-testid="seller-dashboard"]')).toBeVisible()

      // 3. Create new product
      await page.click('[data-testid="create-product"]')
      await expect(page).toHaveURL(/\/marketplace\/seller\/products\/new/)

      await page.fill('input[name="name"]', TEST_PRODUCT.name)
      await page.fill('textarea[name="description"]', TEST_PRODUCT.description)
      await page.fill('input[name="price"]', TEST_PRODUCT.price)

      // Upload product file
      const fileInput = page.locator('input[type="file"][name="productFile"]')
      await fileInput.setInputFiles({
        name: 'test-product.zip',
        mimeType: 'application/zip',
        buffer: Buffer.from('test product content'),
      })

      // Upload thumbnail (if exists)
      const thumbnailInput = page.locator('input[type="file"][name="thumbnail"]')
      if (await thumbnailInput.count() > 0) {
        await thumbnailInput.setInputFiles({
          name: 'thumbnail.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake image data'),
        })
      }

      await page.click('[data-testid="submit-product"]')

      // 4. Verify product created
      await page.waitForURL(/\/marketplace\/seller\/products\/[a-z0-9]+/, { timeout: 10000 })
      await expect(page.locator(`text=${TEST_PRODUCT.name}`)).toBeVisible()

      // 5. Request Level 1 verification
      await page.click('[data-testid="request-verification"]')
      await page.click('[data-testid="verification-level-1"]')
      await page.click('[data-testid="confirm-verification-request"]')

      // Handle payment for verification (if required)
      if (page.url().includes('checkout')) {
        await completeMockPayment(page)
      }

      // 6. Check verification status
      await page.goto('/marketplace/seller/products')
      const verificationStatus = page.locator('[data-testid="verification-status"]').first()
      if (await verificationStatus.count() > 0) {
        await expect(verificationStatus).toHaveText(/pending|in.progress/i)
      }

      // 7. View sales analytics
      await page.goto('/dashboard')
      await expect(page.locator('[data-testid="sales-stats"]')).toBeVisible()
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()

      // 8. Check settlements
      await page.goto('/marketplace/seller/settlements')
      await expect(page.locator('[data-testid="settlement-list"]')).toBeVisible()
    })

    test('Seller can edit product', async ({ page }) => {
      await registerAndLogin(page, TEST_SELLER)
      await page.goto('/marketplace/seller/products')

      const editButton = page.locator('[data-testid="edit-product"]').first()
      if (await editButton.count() > 0) {
        await editButton.click()

        await page.fill('textarea[name="description"]', 'Updated description')
        await page.click('[data-testid="save-product"]')

        await expect(page.locator('text=/updated.*successfully/i')).toBeVisible()
      }
    })

    test('Seller can view order notifications', async ({ page }) => {
      await registerAndLogin(page, TEST_SELLER)
      await page.goto('/dashboard')

      // Check for order notifications
      const notifications = page.locator('[data-testid="notification"]')
      if (await notifications.count() > 0) {
        await expect(notifications.first()).toBeVisible()
      }
    })

    test('Seller can manage product pricing', async ({ page }) => {
      await registerAndLogin(page, TEST_SELLER)
      await page.goto('/marketplace/seller/products')

      const product = page.locator('[data-testid="product-item"]').first()
      if (await product.count() > 0) {
        await product.click()
        await page.click('[data-testid="edit-pricing"]')

        await page.fill('input[name="price"]', '39.99')
        await page.click('[data-testid="save-price"]')

        await expect(page.locator('text=/price.*updated/i')).toBeVisible()
      }
    })
  })

  test.describe('Verifier Journey', () => {
    test('Complete verifier workflow', async ({ page, context }) => {
      // Setup: Create a product that needs verification
      const sellerPage = await context.newPage()
      await registerAndLogin(sellerPage, TEST_SELLER)
      await createProductForVerification(sellerPage)
      await sellerPage.close()

      // 1. Register as verifier
      await page.goto('/register')
      await page.fill('input[name="email"]', TEST_VERIFIER.email)
      await page.fill('input[name="password"]', TEST_VERIFIER.password)
      await page.fill('input[name="confirmPassword"]', TEST_VERIFIER.password)
      await page.fill('input[name="name"]', TEST_VERIFIER.name)

      // Select verifier role if available
      if (await page.locator('input[name="isVerifier"]').count() > 0) {
        await page.check('input[name="isVerifier"]')
      }

      await page.click('button[type="submit"]')
      await page.waitForURL(/\/(dashboard|verify-email)/, { timeout: 10000 })

      // 2. Navigate to verifier dashboard
      await page.goto('/verifier/dashboard')
      await expect(page.locator('[data-testid="verifier-dashboard"]')).toBeVisible()

      // 3. View available verification tasks
      await page.goto('/verifier/available-tasks')
      const availableTasks = page.locator('[data-testid="available-task"]')

      if (await availableTasks.count() > 0) {
        // 4. Claim a task
        await availableTasks.first().locator('[data-testid="claim-task"]').click()
        await expect(page.locator('text=/claimed.*successfully/i')).toBeVisible()

        // 5. Navigate to my tasks
        await page.goto('/verifier/my-tasks')
        const myTask = page.locator('[data-testid="assigned-task"]').first()
        await expect(myTask).toBeVisible()

        // 6. Start verification
        await myTask.click()
        await page.click('[data-testid="start-verification"]')

        // 7. Download product for review
        const downloadButton = page.locator('[data-testid="download-product"]')
        if (await downloadButton.count() > 0) {
          await downloadButton.click()
        }

        // 8. Complete verification checklist
        await page.check('[data-testid="check-security"]')
        await page.check('[data-testid="check-quality"]')
        await page.check('[data-testid="check-performance"]')
        await page.check('[data-testid="check-documentation"]')

        // 9. Add review comments
        await page.fill('textarea[name="comments"]', 'Product meets all verification criteria.')

        // 10. Set score
        await page.fill('input[name="score"]', '88')

        // 11. Select badges
        await page.check('[data-testid="badge-security"]')
        await page.check('[data-testid="badge-quality"]')

        // 12. Submit verification
        await page.click('[data-testid="submit-verification"]')
        await expect(page.locator('text=/submitted.*successfully/i')).toBeVisible()

        // 13. View earnings
        await page.goto('/verifier/dashboard')
        await expect(page.locator('[data-testid="total-earnings"]')).toBeVisible()
      }
    })

    test('Verifier can reject product with feedback', async ({ page }) => {
      await registerAndLogin(page, TEST_VERIFIER)
      await page.goto('/verifier/my-tasks')

      const task = page.locator('[data-testid="assigned-task"]').first()
      if (await task.count() > 0) {
        await task.click()

        // Reject product
        await page.click('[data-testid="reject-product"]')

        // Select rejection reasons
        await page.check('[data-testid="reason-security"]')
        await page.fill('textarea[name="feedback"]', 'Security vulnerabilities detected.')

        await page.click('[data-testid="confirm-rejection"]')
        await expect(page.locator('text=/rejection.*submitted/i')).toBeVisible()
      }
    })

    test('Verifier can view performance stats', async ({ page }) => {
      await registerAndLogin(page, TEST_VERIFIER)
      await page.goto('/verifier/dashboard')

      await expect(page.locator('[data-testid="total-completed"]')).toBeVisible()
      await expect(page.locator('[data-testid="average-score"]')).toBeVisible()
      await expect(page.locator('[data-testid="approval-rate"]')).toBeVisible()
    })
  })

  test.describe('Cross-Role Interactions', () => {
    test('Complete verification flow across seller and verifier', async ({ context }) => {
      // Seller creates product and requests verification
      const sellerPage = await context.newPage()
      await registerAndLogin(sellerPage, TEST_SELLER)
      await createProductForVerification(sellerPage)

      // Get product ID from URL
      const productUrl = sellerPage.url()

      // Verifier claims and completes verification
      const verifierPage = await context.newPage()
      await registerAndLogin(verifierPage, TEST_VERIFIER)
      await verifierPage.goto('/verifier/available-tasks')

      const task = verifierPage.locator('[data-testid="available-task"]').first()
      if (await task.count() > 0) {
        await task.locator('[data-testid="claim-task"]').click()
        await verifierPage.goto('/verifier/my-tasks')
        await verifierPage.locator('[data-testid="assigned-task"]').first().click()

        // Complete verification
        await verifierPage.fill('input[name="score"]', '90')
        await verifierPage.fill('textarea[name="comments"]', 'Excellent product')
        await verifierPage.click('[data-testid="approve-product"]')
        await verifierPage.click('[data-testid="submit-verification"]')
      }

      // Seller checks verification result
      await sellerPage.bringToFront()
      await sellerPage.goto('/marketplace/seller/products')
      const status = sellerPage.locator('[data-testid="verification-status"]').first()

      if (await status.count() > 0) {
        await expect(status).toHaveText(/approved|verified/i)
      }

      await sellerPage.close()
      await verifierPage.close()
    })

    test('Buyer can see verified badge on products', async ({ page }) => {
      await page.goto('/products')

      const verifiedProducts = page.locator('[data-testid="product-card"]:has([data-testid="verification-badge"])')

      if (await verifiedProducts.count() > 0) {
        await verifiedProducts.first().click()

        // Should show verification details
        await expect(page.locator('[data-testid="verification-section"]')).toBeVisible()
        await expect(page.locator('[data-testid="verification-level"]')).toBeVisible()
        await expect(page.locator('[data-testid="verification-score"]')).toBeVisible()
      }
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('Handle payment failure gracefully', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)
      await page.goto('/products')

      const product = page.locator('[data-testid="product-card"]').first()
      if (await product.count() > 0) {
        await product.click()
        await page.click('[data-testid="purchase-button"]')

        // Simulate payment failure
        if (await page.locator('input[name="cardNumber"]').count() > 0) {
          await page.fill('input[name="cardNumber"]', '4000000000000002') // Decline card
          await page.fill('input[name="expiry"]', '12/25')
          await page.fill('input[name="cvc"]', '123')
        }

        await page.click('[data-testid="complete-payment"]')

        // Should show error message
        await expect(page.locator('text=/payment.*failed|declined/i')).toBeVisible({
          timeout: 15000,
        })
      }
    })

    test('Handle network errors during product upload', async ({ page }) => {
      await registerAndLogin(page, TEST_SELLER)
      await page.goto('/marketplace/seller/products/new')

      // Simulate offline mode
      await page.context().setOffline(true)

      await page.fill('input[name="name"]', 'Test Product')
      await page.fill('textarea[name="description"]', 'Test')
      await page.fill('input[name="price"]', '29.99')

      const fileInput = page.locator('input[type="file"][name="productFile"]')
      await fileInput.setInputFiles({
        name: 'test.zip',
        mimeType: 'application/zip',
        buffer: Buffer.from('test'),
      })

      await page.click('[data-testid="submit-product"]')

      // Should show network error
      await expect(page.locator('text=/network.*error|failed.*upload/i')).toBeVisible({
        timeout: 10000,
      })

      // Restore network
      await page.context().setOffline(false)
    })

    test('Handle session timeout', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)

      // Clear cookies to simulate session timeout
      await page.context().clearCookies()

      // Try to access protected page
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/)
    })
  })
})

// Helper Functions
async function registerAndLogin(page: Page, user: typeof TEST_BUYER) {
  await page.goto('/register')
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)
  await page.fill('input[name="confirmPassword"]', user.password)
  await page.fill('input[name="name"]', user.name)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|verify-email|marketplace)/, { timeout: 10000 })
}

async function createProductForVerification(page: Page) {
  await page.goto('/marketplace/seller/products/new')

  await page.fill('input[name="name"]', `Verif Product ${Date.now()}`)
  await page.fill('textarea[name="description"]', 'Product for verification')
  await page.fill('input[name="price"]', '39.99')

  const fileInput = page.locator('input[type="file"][name="productFile"]')
  await fileInput.setInputFiles({
    name: 'product.zip',
    mimeType: 'application/zip',
    buffer: Buffer.from('test content'),
  })

  await page.click('[data-testid="submit-product"]')
  await page.waitForURL(/\/marketplace\/seller\/products\/[a-z0-9]+/, { timeout: 10000 })

  // Request verification
  await page.click('[data-testid="request-verification"]')
  await page.click('[data-testid="verification-level-1"]')
  await page.click('[data-testid="confirm-verification-request"]')

  if (page.url().includes('checkout')) {
    await completeMockPayment(page)
  }
}

async function completeMockPayment(page: Page) {
  // Wait for payment page to load
  if (page.url().includes('checkout')) {
    await page.waitForTimeout(1000)

    // In test environment, payment might complete automatically
    // or require filling test card details
    if (await page.locator('input[name="cardNumber"]').count() > 0) {
      await page.fill('input[name="cardNumber"]', '4242424242424242')
      await page.fill('input[name="expiry"]', '12/25')
      await page.fill('input[name="cvc"]', '123')
      await page.click('[data-testid="complete-payment"]')
    }
  }
}

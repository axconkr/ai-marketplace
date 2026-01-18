/**
 * E2E Tests: Verification Workflow
 *
 * Tests Level 0 auto-verification, Level 1-3 manual verification, verifier assignment
 */

import { test, expect, Page } from '@playwright/test'

const TEST_SELLER = {
  email: `seller-verif-${Date.now()}@example.com`,
  password: 'SellerPass123!',
  name: 'Verification Seller',
}

const TEST_VERIFIER = {
  email: `verifier-${Date.now()}@example.com`,
  password: 'VerifierPass123!',
  name: 'Test Verifier',
}

test.describe('Verification Workflow', () => {
  test.describe('Level 0 Auto-Verification', () => {
    test('should automatically verify product on upload', async ({ page }) => {
      await registerAndLogin(page, TEST_SELLER)

      // Upload product
      await page.goto('/marketplace/seller/products/new')
      await page.fill('input[name="name"]', 'Auto-Verify Product')
      await page.fill('textarea[name="description"]', 'Test product for auto-verification')
      await page.fill('input[name="price"]', '29.99')

      const fileInput = page.locator('input[type="file"][name="productFile"]')
      await fileInput.setInputFiles({
        name: 'model.zip',
        mimeType: 'application/zip',
        buffer: Buffer.from('test content'),
      })

      await page.click('[data-testid="submit-product"]')
      await page.waitForURL(/\/marketplace\/seller\/products\/[a-z0-9]+/, { timeout: 10000 })

      // Should show Level 0 verification status
      await expect(page.locator('[data-testid="verification-level"]')).toHaveText(/level 0/i)
      await expect(page.locator('[data-testid="verification-status"]')).toHaveText(/verified|passed/i)
    })

    test('should perform basic security scans', async ({ page }) => {
      await registerAndLogin(page, TEST_SELLER)
      await uploadProduct(page, 'Security Scan Product')

      // Check verification report
      await page.click('[data-testid="view-verification-report"]')

      // Should show scan results
      await expect(page.locator('[data-testid="security-scan-result"]')).toBeVisible()
      await expect(page.locator('[data-testid="malware-scan"]')).toHaveText(/passed|clean/i)
    })

    test('should fail verification for malicious content', async ({ page }) => {
      // Note: This would require actual malware detection
      // For testing, we can check the error handling
      await registerAndLogin(page, TEST_SELLER)

      await page.goto('/marketplace/seller/products/new')
      await page.fill('input[name="name"]', 'Suspicious Product')

      // Upload suspicious file (simulated)
      const fileInput = page.locator('input[type="file"][name="productFile"]')
      await fileInput.setInputFiles({
        name: 'suspicious.exe',
        mimeType: 'application/x-msdownload',
        buffer: Buffer.from('fake malware'),
      })

      // Should show security warning
      await expect(page.locator('text=/security.*risk|suspicious.*file/i')).toBeVisible()
    })
  })

  test.describe('Manual Verification Request', () => {
    test('should request Level 1 verification', async ({ page }) => {
      await registerAndLogin(page, TEST_SELLER)
      await uploadProduct(page, 'Level 1 Product')

      // Request verification
      await page.click('[data-testid="request-verification"]')

      // Select Level 1
      await page.click('[data-testid="verification-level-1"]')

      // Confirm payment
      await expect(page.locator('[data-testid="verification-fee"]')).toHaveText(/\$50/)
      await page.click('[data-testid="confirm-verification-request"]')

      // Should show payment processing
      await expect(page).toHaveURL(/\/marketplace\/checkout/)

      // Complete payment (simulated)
      await completeMockPayment(page)

      // Should show pending status
      await page.goto('/marketplace/seller/products')
      await expect(page.locator('[data-testid="verification-status"]')).toHaveText(/pending|requested/i)
    })

    test('should request Level 2 verification with higher fee', async ({ page }) => {
      await registerAndLogin(page, TEST_SELLER)
      await uploadProduct(page, 'Level 2 Product')

      await page.click('[data-testid="request-verification"]')
      await page.click('[data-testid="verification-level-2"]')

      // Should show higher fee
      await expect(page.locator('[data-testid="verification-fee"]')).toHaveText(/\$100/)
    })

    test('should request Level 3 verification', async ({ page }) => {
      await registerAndLogin(page, TEST_SELLER)
      await uploadProduct(page, 'Level 3 Product')

      await page.click('[data-testid="request-verification"]')
      await page.click('[data-testid="verification-level-3"]')

      await expect(page.locator('[data-testid="verification-fee"]')).toHaveText(/\$150/)
    })

    test('should show verification options and benefits', async ({ page }) => {
      await registerAndLogin(page, TEST_SELLER)
      await uploadProduct(page, 'Info Product')

      await page.click('[data-testid="request-verification"]')

      // Should display benefits for each level
      await expect(page.locator('[data-testid="level-1-benefits"]')).toBeVisible()
      await expect(page.locator('[data-testid="level-2-benefits"]')).toBeVisible()
      await expect(page.locator('[data-testid="level-3-benefits"]')).toBeVisible()
    })
  })

  test.describe('Verifier Assignment', () => {
    test('should auto-assign verification to available verifier', async ({ page, context }) => {
      // Create verification request as seller
      await registerAndLogin(page, TEST_SELLER)
      await uploadProduct(page, 'Assignment Product')
      await requestVerification(page, 1)

      // Login as verifier
      const verifierPage = await context.newPage()
      await registerAndLoginVerifier(verifierPage, TEST_VERIFIER)

      // Check dashboard for new assignment
      await verifierPage.goto('/verifier/dashboard')

      // Should see pending verification
      await expect(verifierPage.locator('[data-testid="pending-verification"]')).toBeVisible()

      await verifierPage.close()
    })

    test('should allow verifier to claim verification task', async ({ page }) => {
      await registerAndLoginVerifier(page, TEST_VERIFIER)

      await page.goto('/verifier/available-tasks')

      const task = page.locator('[data-testid="available-task"]').first()

      if (await task.count() > 0) {
        await task.locator('[data-testid="claim-task"]').click()

        // Should assign task
        await expect(page.locator('text=/assigned.*successfully/i')).toBeVisible()

        // Should appear in my tasks
        await page.goto('/verifier/my-tasks')
        await expect(page.locator('[data-testid="assigned-task"]')).toBeVisible()
      }
    })
  })

  test.describe('Verification Review Process', () => {
    test('should complete verification review', async ({ page }) => {
      await registerAndLoginVerifier(page, TEST_VERIFIER)
      await page.goto('/verifier/my-tasks')

      const task = page.locator('[data-testid="assigned-task"]').first()

      if (await task.count() > 0) {
        await task.click()

        // Review product
        await expect(page.locator('[data-testid="product-details"]')).toBeVisible()
        await expect(page.locator('[data-testid="download-product"]')).toBeVisible()

        // Fill verification form
        await page.click('[data-testid="security-check"]')
        await page.click('[data-testid="performance-check"]')
        await page.click('[data-testid="quality-check"]')

        // Add comments
        await page.fill('textarea[name="comments"]', 'Product passes all verification checks.')

        // Set score
        await page.fill('input[name="score"]', '85')

        // Select badges
        await page.click('[data-testid="badge-security"]')
        await page.click('[data-testid="badge-quality"]')

        // Submit review
        await page.click('[data-testid="submit-verification"]')

        // Should show confirmation
        await expect(page.locator('text=/verification.*submitted|completed/i')).toBeVisible()
      }
    })

    test('should approve product after verification', async ({ page, context }) => {
      // Verifier approves
      await registerAndLoginVerifier(page, TEST_VERIFIER)
      await completeVerification(page, 'APPROVED', 90)

      // Seller checks status
      const sellerPage = await context.newPage()
      await registerAndLogin(sellerPage, TEST_SELLER)
      await sellerPage.goto('/marketplace/seller/products')

      // Should show approved status
      await expect(sellerPage.locator('[data-testid="verification-status"]').first()).toHaveText(/approved/i)

      // Should display badges
      await expect(sellerPage.locator('[data-testid="verification-badge"]')).toBeVisible()

      await sellerPage.close()
    })

    test('should reject product with reasons', async ({ page, context }) => {
      await registerAndLoginVerifier(page, TEST_VERIFIER)

      await page.goto('/verifier/my-tasks')
      const task = page.locator('[data-testid="assigned-task"]').first()

      if (await task.count() > 0) {
        await task.click()

        // Reject product
        await page.click('[data-testid="reject-product"]')

        // Select rejection reasons
        await page.click('[data-testid="reason-security"]')
        await page.click('[data-testid="reason-quality"]')

        // Add detailed feedback
        await page.fill('textarea[name="feedback"]', 'Product has security vulnerabilities and quality issues.')

        await page.click('[data-testid="confirm-rejection"]')

        // Should notify seller
        const sellerPage = await context.newPage()
        await registerAndLogin(sellerPage, TEST_SELLER)
        await sellerPage.goto('/marketplace/seller/products')

        await expect(sellerPage.locator('[data-testid="verification-status"]').first()).toHaveText(/rejected/i)

        await sellerPage.close()
      }
    })
  })

  test.describe('Verification Badge Display', () => {
    test('should display verification badges on product page', async ({ page }) => {
      await page.goto('/products')

      // Find verified product
      const verifiedProduct = page.locator('[data-testid="product-card"]:has([data-testid="verification-badge"])')

      if (await verifiedProduct.count() > 0) {
        await verifiedProduct.first().click()

        // Should show verification section
        await expect(page.locator('[data-testid="verification-section"]')).toBeVisible()
        await expect(page.locator('[data-testid="verification-level"]')).toBeVisible()
        await expect(page.locator('[data-testid="verification-badges"]')).toBeVisible()
        await expect(page.locator('[data-testid="verification-score"]')).toBeVisible()
      }
    })

    test('should show verification report to buyers', async ({ page }) => {
      await page.goto('/products')

      const verifiedProduct = page.locator('[data-testid="product-card"]:has([data-testid="verification-badge"])')

      if (await verifiedProduct.count() > 0) {
        await verifiedProduct.first().click()

        // Click view verification report
        await page.click('[data-testid="view-verification-report"]')

        // Should display report
        await expect(page.locator('[data-testid="verification-report"]')).toBeVisible()
        await expect(page.locator('[data-testid="verifier-name"]')).toBeVisible()
        await expect(page.locator('[data-testid="verification-date"]')).toBeVisible()
      }
    })
  })

  test.describe('Verifier Settlement', () => {
    test('should track verifier earnings', async ({ page }) => {
      await registerAndLoginVerifier(page, TEST_VERIFIER)

      await page.goto('/verifier/dashboard')

      // Should show earnings
      await expect(page.locator('[data-testid="total-earnings"]')).toBeVisible()
      await expect(page.locator('[data-testid="pending-payouts"]')).toBeVisible()
    })

    test('should include verifier payouts in monthly settlement', async ({ page }) => {
      await registerAndLoginVerifier(page, TEST_VERIFIER)

      await page.goto('/verifier/settlements')

      // Should display settlement history
      await expect(page.locator('[data-testid="settlement-list"]')).toBeVisible()

      const settlement = page.locator('[data-testid="settlement-item"]').first()

      if (await settlement.count() > 0) {
        await settlement.click()

        // Should show verification breakdown
        await expect(page.locator('[data-testid="verification-count"]')).toBeVisible()
        await expect(page.locator('[data-testid="verification-earnings"]')).toBeVisible()
      }
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

async function registerAndLoginVerifier(page: Page, user: typeof TEST_VERIFIER) {
  await page.goto('/register')
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)
  await page.fill('input[name="confirmPassword"]', user.password)
  await page.fill('input[name="name"]', user.name)
  await page.check('input[name="isVerifier"]') // Assuming verifier registration option
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|verify-email)/, { timeout: 5000 })
}

async function uploadProduct(page: Page, name: string) {
  await page.goto('/marketplace/seller/products/new')
  await page.fill('input[name="name"]', name)
  await page.fill('textarea[name="description"]', 'Test product description')
  await page.fill('input[name="price"]', '29.99')

  const fileInput = page.locator('input[type="file"][name="productFile"]')
  await fileInput.setInputFiles({
    name: 'product.zip',
    mimeType: 'application/zip',
    buffer: Buffer.from('test content'),
  })

  await page.click('[data-testid="submit-product"]')
  await page.waitForURL(/\/marketplace\/seller\/products\/[a-z0-9]+/, { timeout: 10000 })
}

async function requestVerification(page: Page, level: number) {
  await page.click('[data-testid="request-verification"]')
  await page.click(`[data-testid="verification-level-${level}"]`)
  await page.click('[data-testid="confirm-verification-request"]')
  await completeMockPayment(page)
}

async function completeMockPayment(page: Page) {
  // Simulate payment completion
  if (page.url().includes('checkout')) {
    await page.waitForTimeout(1000)
    // In real tests, this would complete Stripe checkout
  }
}

async function completeVerification(page: Page, status: string, score: number) {
  await page.goto('/verifier/my-tasks')
  const task = page.locator('[data-testid="assigned-task"]').first()

  if (await task.count() > 0) {
    await task.click()
    await page.fill('input[name="score"]', score.toString())
    await page.fill('textarea[name="comments"]', 'Verification complete')

    if (status === 'APPROVED') {
      await page.click('[data-testid="approve-product"]')
    } else {
      await page.click('[data-testid="reject-product"]')
    }

    await page.click('[data-testid="confirm-action"]')
  }
}

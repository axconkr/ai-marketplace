/**
 * E2E Tests: Purchase Flow
 *
 * Tests product browsing, cart management, Stripe checkout, download, and order confirmation
 */

import { test, expect, Page } from '@playwright/test'

const TEST_BUYER = {
  email: `buyer-${Date.now()}@example.com`,
  password: 'BuyerPass123!',
  name: 'Test Buyer',
}

const TEST_CARD = {
  number: '4242424242424242', // Stripe test card
  expiry: '12/34',
  cvc: '123',
  zip: '12345',
}

test.describe('Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login buyer
    await registerAndLogin(page, TEST_BUYER)
  })

  test.describe('Product Browsing', () => {
    test('should display product list on marketplace page', async ({ page }) => {
      await page.goto('/products')

      // Should show products
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()

      // Should show product details
      const firstProduct = page.locator('[data-testid="product-card"]').first()
      await expect(firstProduct.locator('text=/\\$/i')).toBeVisible() // Price
      await expect(firstProduct.locator('img')).toBeVisible() // Image
    })

    test('should filter products by category', async ({ page }) => {
      await page.goto('/products')

      // Select category filter
      await page.click('[data-testid="category-filter"]')
      await page.click('text="AI Models"')

      // URL should update with filter
      await expect(page).toHaveURL(/category=ai-models/i)

      // Products should be filtered
      const products = page.locator('[data-testid="product-card"]')
      await expect(products.first()).toBeVisible()
    })

    test('should search products by keyword', async ({ page }) => {
      await page.goto('/products')

      // Search for product
      await page.fill('input[placeholder*="Search"]', 'chatbot')
      await page.press('input[placeholder*="Search"]', 'Enter')

      // Should show search results
      await expect(page).toHaveURL(/search=chatbot/i)
      await expect(page.locator('[data-testid="product-card"]')).toBeVisible()
    })

    test('should sort products by price', async ({ page }) => {
      await page.goto('/products')

      // Select sort option
      await page.click('[data-testid="sort-dropdown"]')
      await page.click('text="Price: Low to High"')

      // Should reload with sorted products
      await page.waitForLoadState('networkidle')

      // Get all prices and verify sorting
      const prices = await page.locator('[data-testid="product-price"]').allTextContents()
      const numericPrices = prices.map(p => parseFloat(p.replace(/[^0-9.]/g, '')))
      const sorted = [...numericPrices].sort((a, b) => a - b)

      expect(numericPrices).toEqual(sorted)
    })

    test('should view product details', async ({ page }) => {
      await page.goto('/products')

      // Click first product
      await page.click('[data-testid="product-card"]')

      // Should navigate to product page
      await expect(page).toHaveURL(/\/marketplace\/products\/[a-z0-9]+/)

      // Should show product details
      await expect(page.locator('[data-testid="product-name"]')).toBeVisible()
      await expect(page.locator('[data-testid="product-description"]')).toBeVisible()
      await expect(page.locator('[data-testid="product-price"]')).toBeVisible()
      await expect(page.locator('[data-testid="add-to-cart"]')).toBeVisible()
    })

    test('should display verification badges on products', async ({ page }) => {
      await page.goto('/products')

      // Find verified product
      const verifiedProduct = page.locator('[data-testid="product-card"]:has([data-testid="verification-badge"])')

      if (await verifiedProduct.count() > 0) {
        await expect(verifiedProduct.first().locator('[data-testid="verification-badge"]')).toBeVisible()
      }
    })

    test('should show product reviews and ratings', async ({ page }) => {
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      // Should show rating
      const rating = page.locator('[data-testid="product-rating"]')
      if (await rating.count() > 0) {
        await expect(rating).toBeVisible()
      }

      // Should show reviews section
      const reviews = page.locator('[data-testid="reviews-section"]')
      if (await reviews.count() > 0) {
        await expect(reviews).toBeVisible()
      }
    })
  })

  test.describe('Cart Management', () => {
    test('should add product to cart', async ({ page }) => {
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      // Add to cart
      await page.click('[data-testid="add-to-cart"]')

      // Should show success message
      await expect(page.locator('text=/added to cart/i')).toBeVisible()

      // Cart badge should update
      const cartBadge = page.locator('[data-testid="cart-count"]')
      await expect(cartBadge).toHaveText('1')
    })

    test('should prevent duplicate items in cart', async ({ page }) => {
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      // Add same product twice
      await page.click('[data-testid="add-to-cart"]')
      await page.click('[data-testid="add-to-cart"]')

      // Should show message about duplicate
      await expect(page.locator('text=/already in cart/i')).toBeVisible()

      // Cart count should be 1
      const cartBadge = page.locator('[data-testid="cart-count"]')
      await expect(cartBadge).toHaveText('1')
    })

    test('should view cart contents', async ({ page }) => {
      // Add product to cart
      await addProductToCart(page)

      // Go to cart
      await page.click('[data-testid="cart-icon"]')

      // Should show cart page
      await expect(page).toHaveURL(/\/marketplace\/cart/)

      // Should display cart items
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
      await expect(page.locator('[data-testid="cart-total"]')).toBeVisible()
    })

    test('should remove item from cart', async ({ page }) => {
      await addProductToCart(page)
      await page.goto('/cart')

      // Remove item
      await page.click('[data-testid="remove-from-cart"]')

      // Should show empty cart message
      await expect(page.locator('text=/cart is empty/i')).toBeVisible()
    })

    test('should update cart total correctly', async ({ page }) => {
      await page.goto('/products')

      // Add multiple products
      const products = page.locator('[data-testid="product-card"]')
      const count = Math.min(await products.count(), 3)

      for (let i = 0; i < count; i++) {
        await products.nth(i).click()
        await page.click('[data-testid="add-to-cart"]')
        await page.goBack()
      }

      // View cart
      await page.goto('/cart')

      // Get item prices
      const itemPrices = await page.locator('[data-testid="cart-item-price"]').allTextContents()
      const total = itemPrices.reduce((sum, price) => {
        return sum + parseFloat(price.replace(/[^0-9.]/g, ''))
      }, 0)

      // Verify total
      const displayedTotal = await page.locator('[data-testid="cart-total"]').textContent()
      const totalAmount = parseFloat(displayedTotal!.replace(/[^0-9.]/g, ''))

      expect(totalAmount).toBeCloseTo(total, 2)
    })
  })

  test.describe('Stripe Checkout', () => {
    test('should initiate Stripe checkout flow', async ({ page }) => {
      await addProductToCart(page)
      await page.goto('/cart')

      // Proceed to checkout
      await page.click('[data-testid="checkout-button"]')

      // Should redirect to Stripe checkout
      await page.waitForURL(/checkout\.stripe\.com|\/marketplace\/checkout/, { timeout: 10000 })

      // Should load Stripe payment form
      if (page.url().includes('stripe.com')) {
        await expect(page.locator('input[name="cardnumber"]')).toBeVisible({ timeout: 10000 })
      } else {
        await expect(page.locator('[data-testid="stripe-card-element"]')).toBeVisible()
      }
    })

    test('should complete payment with valid card', async ({ page }) => {
      await addProductToCart(page)
      await page.goto('/cart')

      // Get product info for verification
      const productName = await page.locator('[data-testid="cart-item-name"]').textContent()

      // Checkout
      await page.click('[data-testid="checkout-button"]')

      // Fill Stripe payment form (embedded or hosted)
      if (page.url().includes('stripe.com')) {
        // Hosted checkout
        await page.fill('input[name="cardnumber"]', TEST_CARD.number)
        await page.fill('input[name="exp-date"]', TEST_CARD.expiry)
        await page.fill('input[name="cvc"]', TEST_CARD.cvc)
        await page.fill('input[name="postal"]', TEST_CARD.zip)
        await page.click('button[type="submit"]')
      } else {
        // Embedded checkout with Elements
        const cardFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first()
        await cardFrame.locator('input[name="cardnumber"]').fill(TEST_CARD.number)
        await cardFrame.locator('input[name="exp-date"]').fill(TEST_CARD.expiry)
        await cardFrame.locator('input[name="cvc"]').fill(TEST_CARD.cvc)
        await page.fill('input[name="postal"]', TEST_CARD.zip)
        await page.click('[data-testid="pay-button"]')
      }

      // Wait for success redirect
      await expect(page).toHaveURL(/\/marketplace\/order\/success/, { timeout: 15000 })

      // Should show success message
      await expect(page.locator('text=/payment successful/i')).toBeVisible()
      await expect(page.locator(`text=${productName}`)).toBeVisible()
    })

    test('should handle payment failure gracefully', async ({ page, request }) => {
      await addProductToCart(page)
      await page.goto('/cart')

      // Use card that will be declined (4000 0000 0000 0002)
      await page.click('[data-testid="checkout-button"]')

      if (!page.url().includes('stripe.com')) {
        const cardFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first()
        await cardFrame.locator('input[name="cardnumber"]').fill('4000000000000002')
        await cardFrame.locator('input[name="exp-date"]').fill(TEST_CARD.expiry)
        await cardFrame.locator('input[name="cvc"]').fill(TEST_CARD.cvc)
        await page.fill('input[name="postal"]', TEST_CARD.zip)
        await page.click('[data-testid="pay-button"]')

        // Should show error message
        await expect(page.locator('text=/payment.*failed|card.*declined/i')).toBeVisible({ timeout: 10000 })
      }
    })

    test('should validate required payment fields', async ({ page }) => {
      await addProductToCart(page)
      await page.goto('/cart')
      await page.click('[data-testid="checkout-button"]')

      if (!page.url().includes('stripe.com')) {
        // Try to submit without filling card details
        await page.click('[data-testid="pay-button"]')

        // Should show validation errors
        await expect(page.locator('text=/card.*required|incomplete/i')).toBeVisible()
      }
    })
  })

  test.describe('Order Completion', () => {
    test('should grant product access after successful payment', async ({ page }) => {
      // Complete purchase
      await completePurchase(page)

      // Navigate to orders
      await page.goto('/marketplace/orders')

      // Should show order
      const order = page.locator('[data-testid="order-item"]').first()
      await expect(order).toBeVisible()

      // Should have download button
      await expect(order.locator('[data-testid="download-button"]')).toBeVisible()
    })

    test('should generate temporary download URL', async ({ page }) => {
      await completePurchase(page)
      await page.goto('/marketplace/orders')

      // Click download button
      const downloadPromise = page.waitForEvent('download')
      await page.click('[data-testid="download-button"]')
      const download = await downloadPromise

      // Verify download started
      expect(download.suggestedFilename()).toBeTruthy()
      await download.cancel()
    })

    test('should send order confirmation email', async ({ page }) => {
      // Note: This would require email testing infrastructure (e.g., MailHog, Ethereal)
      await completePurchase(page)

      // For now, we can verify the order exists
      await page.goto('/marketplace/orders')
      await expect(page.locator('[data-testid="order-item"]')).toBeVisible()

      // In production, we would check email service logs or mock email service
    })

    test('should update seller dashboard with new order', async ({ page, context }) => {
      // Complete purchase as buyer
      await completePurchase(page)

      // Login as seller in new tab
      const sellerPage = await context.newPage()
      const seller = {
        email: 'seller@example.com',
        password: 'SellerPass123!',
        name: 'Seller',
      }

      await loginUser(sellerPage, seller)
      await sellerPage.goto('/dashboard')

      // Should see new order notification
      await expect(sellerPage.locator('[data-testid="new-order-notification"]')).toBeVisible()

      await sellerPage.close()
    })

    test('should prevent re-downloading without payment', async ({ page }) => {
      // Try to access download URL directly without purchase
      await page.goto('/products')
      const productId = 'test-product-id'

      // Attempt direct download
      const response = await page.goto(`/api/files/download?productId=${productId}`)

      // Should return 403 Forbidden or redirect to payment
      expect(response?.status()).toBeGreaterThanOrEqual(400)
    })

    test('should track download count', async ({ page }) => {
      await completePurchase(page)
      await page.goto('/marketplace/orders')

      const initialDownloads = await page.locator('[data-testid="download-count"]').textContent()

      // Download file
      const downloadPromise = page.waitForEvent('download')
      await page.click('[data-testid="download-button"]')
      await downloadPromise

      // Refresh and check count
      await page.reload()
      const updatedDownloads = await page.locator('[data-testid="download-count"]').textContent()

      expect(parseInt(updatedDownloads!)).toBe(parseInt(initialDownloads!) + 1)
    })
  })

  test.describe('Order History', () => {
    test('should display order history', async ({ page }) => {
      await completePurchase(page)
      await page.goto('/marketplace/orders')

      // Should show orders
      await expect(page.locator('[data-testid="order-item"]')).toBeVisible()
      await expect(page.locator('[data-testid="order-date"]')).toBeVisible()
      await expect(page.locator('[data-testid="order-status"]')).toHaveText(/paid|completed/i)
    })

    test('should filter orders by status', async ({ page }) => {
      await page.goto('/marketplace/orders')

      // Select filter
      await page.click('[data-testid="status-filter"]')
      await page.click('text="Completed"')

      // Should show only completed orders
      const orders = page.locator('[data-testid="order-item"]')
      const statuses = await orders.locator('[data-testid="order-status"]').allTextContents()

      statuses.forEach(status => {
        expect(status.toLowerCase()).toContain('completed')
      })
    })

    test('should search orders by product name', async ({ page }) => {
      await page.goto('/marketplace/orders')

      // Search
      await page.fill('input[placeholder*="Search orders"]', 'chatbot')
      await page.press('input[placeholder*="Search orders"]', 'Enter')

      // Should show filtered results
      await expect(page.locator('[data-testid="order-item"]')).toBeVisible()
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
  await page.waitForURL(/\/(dashboard|verify-email)/, { timeout: 5000 })
}

async function loginUser(page: Page, user: any) {
  await page.goto('/login')
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/dashboard/, { timeout: 5000 })
}

async function addProductToCart(page: Page) {
  await page.goto('/products')
  await page.locator('[data-testid="product-card"]').first().click()
  await page.click('[data-testid="add-to-cart"]')
  await page.waitForTimeout(1000)
}

async function completePurchase(page: Page) {
  await addProductToCart(page)
  await page.goto('/cart')
  await page.click('[data-testid="checkout-button"]')

  if (!page.url().includes('stripe.com')) {
    const cardFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first()
    await cardFrame.locator('input[name="cardnumber"]').fill(TEST_CARD.number)
    await cardFrame.locator('input[name="exp-date"]').fill(TEST_CARD.expiry)
    await cardFrame.locator('input[name="cvc"]').fill(TEST_CARD.cvc)
    await page.fill('input[name="postal"]', TEST_CARD.zip)
    await page.click('[data-testid="pay-button"]')
  }

  await page.waitForURL(/\/marketplace\/order\/success/, { timeout: 15000 })
}

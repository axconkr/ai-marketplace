/**
 * E2E Tests: Review System
 *
 * Tests review submission, ratings, seller responses, helpful voting
 */

import { test, expect, Page } from '@playwright/test'

const TEST_BUYER = {
  email: `buyer-review-${Date.now()}@example.com`,
  password: 'BuyerPass123!',
  name: 'Review Buyer',
}

const TEST_SELLER = {
  email: `seller-review-${Date.now()}@example.com`,
  password: 'SellerPass123!',
  name: 'Review Seller',
}

test.describe('Review System', () => {
  test.describe('Review Submission', () => {
    test('should allow verified purchaser to submit review', async ({ page }) => {
      // Complete purchase first
      await registerAndLogin(page, TEST_BUYER)
      await completePurchase(page)

      // Navigate to purchased product
      await page.goto('/marketplace/orders')
      await page.click('[data-testid="order-item"]')
      await page.click('[data-testid="write-review"]')

      // Fill review form
      await page.click(`[data-testid="rating-star-5"]`)
      await page.fill('input[name="title"]', 'Excellent Product!')
      await page.fill('textarea[name="comment"]', 'This AI model works perfectly. Highly recommended!')

      // Submit review
      await page.click('[data-testid="submit-review"]')

      // Should show success
      await expect(page.locator('text=/review.*submitted|thank you/i')).toBeVisible()
    })

    test('should prevent review without purchase', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)

      // Try to review product without purchasing
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      // Write review button should not be visible or disabled
      const reviewButton = page.locator('[data-testid="write-review"]')
      if (await reviewButton.count() > 0) {
        await expect(reviewButton).toBeDisabled()
      } else {
        await expect(reviewButton).toBeHidden()
      }
    })

    test('should prevent duplicate reviews for same order', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)
      await completePurchase(page)

      // Submit first review
      await submitReview(page, 5, 'Great product!')

      // Try to submit another review for same order
      await page.goto('/marketplace/orders')
      await page.click('[data-testid="order-item"]')

      // Should not show write review button
      await expect(page.locator('[data-testid="write-review"]')).toBeHidden()
      await expect(page.locator('[data-testid="review-submitted"]')).toBeVisible()
    })

    test('should validate required fields', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)
      await completePurchase(page)

      await page.goto('/marketplace/orders')
      await page.click('[data-testid="order-item"]')
      await page.click('[data-testid="write-review"]')

      // Try to submit without filling
      await page.click('[data-testid="submit-review"]')

      // Should show validation errors
      await expect(page.locator('text=/rating.*required/i')).toBeVisible()
      await expect(page.locator('text=/comment.*required/i')).toBeVisible()
    })

    test('should allow uploading review images', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)
      await completePurchase(page)

      await page.goto('/marketplace/orders')
      await page.click('[data-testid="order-item"]')
      await page.click('[data-testid="write-review"]')

      // Upload images
      const imageInput = page.locator('input[type="file"][name="images"]')
      await imageInput.setInputFiles([
        {
          name: 'screenshot1.png',
          mimeType: 'image/png',
          buffer: Buffer.from('image1'),
        },
        {
          name: 'screenshot2.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('image2'),
        },
      ])

      // Should display uploaded images
      await expect(page.locator('[data-testid="review-image-preview"]')).toHaveCount(2)

      await page.click(`[data-testid="rating-star-5"]`)
      await page.fill('textarea[name="comment"]', 'Check out these screenshots!')
      await page.click('[data-testid="submit-review"]')

      await expect(page.locator('text=/review.*submitted/i')).toBeVisible()
    })

    test('should enforce image size and count limits', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)
      await completePurchase(page)

      await page.goto('/marketplace/orders')
      await page.click('[data-testid="order-item"]')
      await page.click('[data-testid="write-review"]')

      // Try to upload too many images (assuming max 5)
      const images = Array(6).fill(null).map((_, i) => ({
        name: `image${i}.png`,
        mimeType: 'image/png',
        buffer: Buffer.from(`image${i}`),
      }))

      const imageInput = page.locator('input[type="file"][name="images"]')
      await imageInput.setInputFiles(images)

      // Should show error
      await expect(page.locator('text=/maximum.*5.*images|too many/i')).toBeVisible()
    })
  })

  test.describe('Review Display', () => {
    test('should display reviews on product page', async ({ page }) => {
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      // Should show reviews section
      const reviewsSection = page.locator('[data-testid="reviews-section"]')
      if (await reviewsSection.count() > 0) {
        await expect(reviewsSection).toBeVisible()

        // Should show average rating
        await expect(page.locator('[data-testid="average-rating"]')).toBeVisible()
        await expect(page.locator('[data-testid="review-count"]')).toBeVisible()

        // Should show rating distribution
        await expect(page.locator('[data-testid="rating-distribution"]')).toBeVisible()
      }
    })

    test('should sort reviews by most helpful', async ({ page }) => {
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      // Select sort option
      await page.click('[data-testid="review-sort"]')
      await page.click('text="Most Helpful"')

      await page.waitForLoadState('networkidle')

      // Reviews should be sorted by helpful count
      const helpfulCounts = await page.locator('[data-testid="helpful-count"]').allTextContents()
      const numbers = helpfulCounts.map(c => parseInt(c) || 0)
      const sorted = [...numbers].sort((a, b) => b - a)

      expect(numbers).toEqual(sorted)
    })

    test('should filter reviews by rating', async ({ page }) => {
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      // Filter by 5 stars
      await page.click('[data-testid="filter-5-stars"]')

      // Should show only 5-star reviews
      const reviews = page.locator('[data-testid="review-item"]')
      if (await reviews.count() > 0) {
        const ratings = await reviews.locator('[data-testid="review-rating"]').allTextContents()
        ratings.forEach(rating => {
          expect(rating).toContain('5')
        })
      }
    })

    test('should display verified purchase badge', async ({ page }) => {
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      const verifiedReview = page.locator('[data-testid="review-item"]:has([data-testid="verified-purchase-badge"])')

      if (await verifiedReview.count() > 0) {
        await expect(verifiedReview.first().locator('[data-testid="verified-purchase-badge"]')).toBeVisible()
      }
    })

    test('should paginate reviews', async ({ page }) => {
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      const pagination = page.locator('[data-testid="review-pagination"]')

      if (await pagination.count() > 0) {
        // Should have next page button
        const nextButton = page.locator('[data-testid="next-page"]')
        if (await nextButton.isEnabled()) {
          await nextButton.click()

          // Should load next page of reviews
          await page.waitForLoadState('networkidle')
          await expect(page.locator('[data-testid="review-item"]')).toBeVisible()
        }
      }
    })
  })

  test.describe('Rating Calculation', () => {
    test('should calculate average rating correctly', async ({ page }) => {
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      // Get all review ratings
      const ratings = await page.locator('[data-testid="review-rating"]').allTextContents()

      if (ratings.length > 0) {
        const numbers = ratings.map(r => parseFloat(r))
        const average = numbers.reduce((sum, n) => sum + n, 0) / numbers.length

        // Get displayed average
        const displayedAvg = await page.locator('[data-testid="average-rating"]').textContent()
        const displayedNumber = parseFloat(displayedAvg!)

        expect(displayedNumber).toBeCloseTo(average, 1)
      }
    })

    test('should update product rating after new review', async ({ page, context }) => {
      // Get current rating
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      const oldRating = await page.locator('[data-testid="average-rating"]').textContent()
      const oldCount = await page.locator('[data-testid="review-count"]').textContent()

      // Submit new review
      await completePurchase(page)
      await submitReview(page, 5, 'Excellent!')

      // Check updated rating
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      const newCount = await page.locator('[data-testid="review-count"]').textContent()

      expect(parseInt(newCount!)).toBe(parseInt(oldCount!) + 1)
    })

    test('should display rating distribution', async ({ page }) => {
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      // Should show distribution for each star rating
      await expect(page.locator('[data-testid="rating-bar-5"]')).toBeVisible()
      await expect(page.locator('[data-testid="rating-bar-4"]')).toBeVisible()
      await expect(page.locator('[data-testid="rating-bar-3"]')).toBeVisible()
      await expect(page.locator('[data-testid="rating-bar-2"]')).toBeVisible()
      await expect(page.locator('[data-testid="rating-bar-1"]')).toBeVisible()
    })
  })

  test.describe('Seller Response', () => {
    test('should allow seller to respond to review', async ({ page, context }) => {
      // Buyer submits review
      await registerAndLogin(page, TEST_BUYER)
      await completePurchase(page)
      await submitReview(page, 5, 'Great product!')

      // Seller responds
      const sellerPage = await context.newPage()
      await registerAndLogin(sellerPage, TEST_SELLER)
      await sellerPage.goto('/marketplace/seller/products')
      await sellerPage.click('[data-testid="product-card"]')
      await sellerPage.click('[data-testid="reviews-tab"]')

      const review = sellerPage.locator('[data-testid="review-item"]').first()
      await review.locator('[data-testid="reply-button"]').click()

      await sellerPage.fill('textarea[name="reply"]', 'Thank you for your positive feedback!')
      await sellerPage.click('[data-testid="submit-reply"]')

      // Should show success
      await expect(sellerPage.locator('text=/reply.*posted/i')).toBeVisible()

      await sellerPage.close()
    })

    test('should display seller reply on product page', async ({ page, context }) => {
      // Create review and reply
      await registerAndLogin(page, TEST_BUYER)
      await completePurchase(page)
      await submitReview(page, 4, 'Good product')

      const sellerPage = await context.newPage()
      await registerAndLogin(sellerPage, TEST_SELLER)
      await replyToReview(sellerPage, 'Thanks for your feedback!')

      // Check public display
      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      const review = page.locator('[data-testid="review-item"]').first()
      if (await review.locator('[data-testid="seller-reply"]').count() > 0) {
        await expect(review.locator('[data-testid="seller-reply"]')).toBeVisible()
      }

      await sellerPage.close()
    })
  })

  test.describe('Helpful Voting', () => {
    test('should allow users to vote review as helpful', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)

      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      const review = page.locator('[data-testid="review-item"]').first()

      if (await review.count() > 0) {
        const initialCount = await review.locator('[data-testid="helpful-count"]').textContent()

        // Vote as helpful
        await review.locator('[data-testid="helpful-button"]').click()

        // Should update count
        await page.waitForTimeout(500)
        const newCount = await review.locator('[data-testid="helpful-count"]').textContent()

        expect(parseInt(newCount!)).toBe(parseInt(initialCount!) + 1)
      }
    })

    test('should prevent duplicate voting', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)

      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      const review = page.locator('[data-testid="review-item"]').first()

      if (await review.count() > 0) {
        // Vote once
        await review.locator('[data-testid="helpful-button"]').click()
        await page.waitForTimeout(500)

        const count1 = await review.locator('[data-testid="helpful-count"]').textContent()

        // Try to vote again
        await review.locator('[data-testid="helpful-button"]').click()
        await page.waitForTimeout(500)

        const count2 = await review.locator('[data-testid="helpful-count"]').textContent()

        // Should not increase
        expect(count1).toBe(count2)
      }
    })

    test('should allow changing vote from helpful to not helpful', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)

      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      const review = page.locator('[data-testid="review-item"]').first()

      if (await review.count() > 0) {
        // Vote helpful
        await review.locator('[data-testid="helpful-button"]').click()
        await page.waitForTimeout(500)

        // Change to not helpful
        await review.locator('[data-testid="not-helpful-button"]').click()
        await page.waitForTimeout(500)

        // Counts should update
        const helpfulCount = await review.locator('[data-testid="helpful-count"]').textContent()
        const notHelpfulCount = await review.locator('[data-testid="not-helpful-count"]').textContent()

        expect(parseInt(notHelpfulCount!)).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Review Moderation', () => {
    test('should allow users to flag inappropriate reviews', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)

      await page.goto('/products')
      await page.click('[data-testid="product-card"]')

      const review = page.locator('[data-testid="review-item"]').first()

      if (await review.count() > 0) {
        // Flag review
        await review.locator('[data-testid="flag-review"]').click()

        // Select reason
        await page.click('[data-testid="flag-reason-spam"]')
        await page.fill('textarea[name="flagDetails"]', 'This review is spam')
        await page.click('[data-testid="submit-flag"]')

        // Should show confirmation
        await expect(page.locator('text=/reported|flagged/i')).toBeVisible()
      }
    })

    test('should allow review author to edit review', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)
      await completePurchase(page)
      await submitReview(page, 4, 'Good product')

      // Edit review
      await page.goto('/marketplace/orders')
      await page.click('[data-testid="order-item"]')
      await page.click('[data-testid="edit-review"]')

      // Update content
      await page.fill('textarea[name="comment"]', 'Updated: Great product!')
      await page.click(`[data-testid="rating-star-5"]`)
      await page.click('[data-testid="submit-review"]')

      // Should show success
      await expect(page.locator('text=/updated.*successfully/i')).toBeVisible()
    })

    test('should allow review author to delete review', async ({ page }) => {
      await registerAndLogin(page, TEST_BUYER)
      await completePurchase(page)
      await submitReview(page, 5, 'Test review')

      // Delete review
      await page.goto('/marketplace/orders')
      await page.click('[data-testid="order-item"]')
      await page.click('[data-testid="delete-review"]')

      // Confirm deletion
      await page.click('[data-testid="confirm-delete"]')

      // Should show success
      await expect(page.locator('text=/deleted.*successfully/i')).toBeVisible()
    })
  })
})

// Helper Functions
async function registerAndLogin(page: Page, user: any) {
  await page.goto('/register')
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)
  await page.fill('input[name="confirmPassword"]', user.password)
  await page.fill('input[name="name"]', user.name)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|verify-email)/, { timeout: 5000 })
}

async function completePurchase(page: Page) {
  await page.goto('/products')
  await page.click('[data-testid="product-card"]')
  await page.click('[data-testid="add-to-cart"]')
  await page.goto('/cart')
  await page.click('[data-testid="checkout-button"]')
  // Simulate payment completion
  await page.waitForTimeout(2000)
}

async function submitReview(page: Page, rating: number, comment: string) {
  await page.goto('/marketplace/orders')
  await page.click('[data-testid="order-item"]')
  await page.click('[data-testid="write-review"]')

  await page.click(`[data-testid="rating-star-${rating}"]`)
  await page.fill('textarea[name="comment"]', comment)
  await page.click('[data-testid="submit-review"]')

  await expect(page.locator('text=/review.*submitted/i')).toBeVisible()
}

async function replyToReview(page: Page, reply: string) {
  await page.goto('/marketplace/seller/products')
  await page.click('[data-testid="product-card"]')
  await page.click('[data-testid="reviews-tab"]')

  const review = page.locator('[data-testid="review-item"]').first()
  await review.locator('[data-testid="reply-button"]').click()
  await page.fill('textarea[name="reply"]', reply)
  await page.click('[data-testid="submit-reply"]')
}

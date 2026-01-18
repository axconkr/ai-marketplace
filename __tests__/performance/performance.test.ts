/**
 * Performance Testing Suite
 *
 * Tests load testing, frontend performance, database query optimization
 */

import { test, expect } from '@playwright/test'
import { chromium, Page } from '@playwright/test'

describe('Performance Testing - Load Tests', () => {
  test('should handle 100 concurrent users on homepage', async () => {
    const concurrentUsers = 100
    const requests: Promise<any>[] = []

    const startTime = Date.now()

    for (let i = 0; i < concurrentUsers; i++) {
      requests.push(
        fetch('http://localhost:3000/marketplace')
          .then(r => ({
            status: r.status,
            time: Date.now() - startTime
          }))
      )
    }

    const results = await Promise.all(requests)

    // All requests should succeed
    const successful = results.filter(r => r.status === 200)
    expect(successful.length).toBeGreaterThan(concurrentUsers * 0.95) // 95% success rate

    // Average response time should be under 500ms
    const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length
    expect(avgTime).toBeLessThan(500)

    // Max response time should be under 2000ms
    const maxTime = Math.max(...results.map(r => r.time))
    expect(maxTime).toBeLessThan(2000)
  })

  test('should handle API rate limiting gracefully', async () => {
    const rapidRequests = 50
    const requests: Promise<Response>[] = []

    for (let i = 0; i < rapidRequests; i++) {
      requests.push(
        fetch('http://localhost:3000/api/products')
      )
    }

    const responses = await Promise.all(requests)

    // Should have rate limiting in place
    const rateLimited = responses.filter(r => r.status === 429)

    // Some requests should be rate limited
    expect(rateLimited.length).toBeGreaterThan(0)

    // Should have proper rate limit headers
    const limitedResponse = rateLimited[0]
    expect(limitedResponse.headers.has('X-RateLimit-Limit')).toBe(true)
    expect(limitedResponse.headers.has('X-RateLimit-Remaining')).toBe(true)
  })

  test('should maintain response times under load', async () => {
    const testDuration = 30000 // 30 seconds
    const requestsPerSecond = 10
    const interval = 1000 / requestsPerSecond

    const results: number[] = []
    const startTime = Date.now()

    while (Date.now() - startTime < testDuration) {
      const requestStart = Date.now()

      const response = await fetch('http://localhost:3000/api/products')

      const responseTime = Date.now() - requestStart

      if (response.ok) {
        results.push(responseTime)
      }

      await new Promise(resolve => setTimeout(resolve, interval))
    }

    // Calculate statistics
    const avgResponseTime = results.reduce((a, b) => a + b, 0) / results.length
    const p95ResponseTime = results.sort((a, b) => a - b)[Math.floor(results.length * 0.95)]
    const p99ResponseTime = results.sort((a, b) => a - b)[Math.floor(results.length * 0.99)]

    console.log('Load Test Results:', {
      totalRequests: results.length,
      avgResponseTime: `${avgResponseTime.toFixed(2)}ms`,
      p95ResponseTime: `${p95ResponseTime}ms`,
      p99ResponseTime: `${p99ResponseTime}ms`
    })

    // Performance targets
    expect(avgResponseTime).toBeLessThan(200) // Avg < 200ms
    expect(p95ResponseTime).toBeLessThan(500) // P95 < 500ms
    expect(p99ResponseTime).toBeLessThan(1000) // P99 < 1000ms
  })

  test('should handle database connection pool efficiently', async () => {
    const simultaneousQueries = 50

    const queries = Array(simultaneousQueries).fill(null).map(() =>
      fetch('http://localhost:3000/api/products?limit=10')
    )

    const startTime = Date.now()
    const results = await Promise.all(queries)
    const totalTime = Date.now() - startTime

    // All queries should succeed
    expect(results.every(r => r.ok)).toBe(true)

    // Should complete in reasonable time (connection pooling working)
    expect(totalTime).toBeLessThan(5000) // 5 seconds for 50 queries

    console.log(`Database Connection Pool Test: ${simultaneousQueries} queries in ${totalTime}ms`)
  })
})

describe('Performance Testing - Frontend Performance', () => {
  test('should meet Core Web Vitals targets', async ({ page }) => {
    await page.goto('http://localhost:3000/marketplace')

    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const vitals: any = {}

          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime
            }
          })

          // LCP
          if (window.performance.getEntriesByType) {
            const lcpEntries = window.performance.getEntriesByType('largest-contentful-paint')
            if (lcpEntries.length > 0) {
              vitals.lcp = (lcpEntries[lcpEntries.length - 1] as any).renderTime || (lcpEntries[lcpEntries.length - 1] as any).loadTime
            }
          }

          resolve(vitals)
        })

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] })

        // Fallback timeout
        setTimeout(() => resolve({}), 5000)
      })
    })

    console.log('Core Web Vitals:', metrics)

    // Target: LCP < 2.5s
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500)
    }

    // Target: FCP < 1.8s
    if (metrics.fcp) {
      expect(metrics.fcp).toBeLessThan(1800)
    }
  })

  test('should load page in under 3 seconds on 3G', async () => {
    const browser = await chromium.launch()
    const context = await browser.newContext()

    // Emulate 3G network
    await context.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)) // Simulate latency
      route.continue()
    })

    const page = await context.newPage()

    const startTime = Date.now()
    await page.goto('http://localhost:3000/marketplace', { waitUntil: 'networkidle' })
    const loadTime = Date.now() - startTime

    console.log(`3G Load Time: ${loadTime}ms`)

    expect(loadTime).toBeLessThan(3000)

    await browser.close()
  })

  test('should have optimized bundle sizes', async ({ page }) => {
    await page.goto('http://localhost:3000/marketplace')

    // Get all JavaScript bundles
    const jsRequests = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      return entries
        .filter((entry: PerformanceResourceTiming) => entry.name.endsWith('.js'))
        .map((entry: PerformanceResourceTiming) => ({
          name: entry.name,
          size: entry.transferSize
        }))
    })

    console.log('JavaScript Bundles:', jsRequests)

    // Initial bundle should be < 500KB
    const initialBundle = jsRequests.find((r: any) => r.name.includes('main') || r.name.includes('index'))
    if (initialBundle) {
      expect(initialBundle.size).toBeLessThan(500 * 1024) // 500KB
    }

    // Total JS size should be < 2MB
    const totalSize = jsRequests.reduce((sum: number, r: any) => sum + r.size, 0)
    expect(totalSize).toBeLessThan(2 * 1024 * 1024) // 2MB
  })

  test('should lazy load images', async ({ page }) => {
    await page.goto('http://localhost:3000/marketplace')

    // Check for lazy loading attribute
    const images = await page.locator('img').all()

    if (images.length > 0) {
      const hasLazyLoading = await images[0].getAttribute('loading')
      expect(hasLazyLoading).toBe('lazy')
    }
  })

  test('should implement code splitting', async ({ page }) => {
    await page.goto('http://localhost:3000/marketplace')

    // Navigate to different page
    await page.click('a[href*="/marketplace/seller"]')

    // Should load new chunk
    const newChunks = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      return entries.filter((entry: PerformanceResourceTiming) =>
        entry.name.includes('.js') && entry.startTime > 1000
      ).length
    })

    // Should have loaded at least one new chunk
    expect(newChunks).toBeGreaterThan(0)
  })

  test('should use Next.js Image optimization', async ({ page }) => {
    await page.goto('http://localhost:3000/marketplace')

    // Check that images use Next.js image optimization
    const optimizedImages = await page.locator('img[src*="/_next/image"]').count()

    // At least some images should be optimized
    expect(optimizedImages).toBeGreaterThan(0)
  })

  test('should have minimal layout shift (CLS)', async ({ page }) => {
    await page.goto('http://localhost:3000/marketplace')

    await page.waitForLoadState('networkidle')

    // Measure Cumulative Layout Shift
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue
            clsValue += (entry as any).value
          }
        })

        observer.observe({ type: 'layout-shift', buffered: true })

        setTimeout(() => resolve(clsValue), 3000)
      })
    })

    console.log('Cumulative Layout Shift:', cls)

    // Target: CLS < 0.1
    expect(cls).toBeLessThan(0.1)
  })

  test('should have fast First Input Delay', async ({ page }) => {
    await page.goto('http://localhost:3000/marketplace')

    // Simulate user interaction
    const startTime = Date.now()
    await page.click('[data-testid="product-card"]')
    const fid = Date.now() - startTime

    console.log('First Input Delay:', fid)

    // Target: FID < 100ms
    expect(fid).toBeLessThan(100)
  })
})

describe('Performance Testing - Database Performance', () => {
  test('should execute queries in under 100ms', async () => {
    const queries = [
      'http://localhost:3000/api/products?limit=20',
      'http://localhost:3000/api/products?category=ai-models',
      'http://localhost:3000/api/user/orders',
    ]

    for (const query of queries) {
      const startTime = Date.now()
      const response = await fetch(query)
      const queryTime = Date.now() - startTime

      console.log(`Query time for ${query}: ${queryTime}ms`)

      expect(response.ok).toBe(true)
      expect(queryTime).toBeLessThan(100)
    }
  })

  test('should use database indexes effectively', async () => {
    // Test common queries that should use indexes

    // Product search by category (indexed)
    const categoryStart = Date.now()
    await fetch('http://localhost:3000/api/products?category=ai-models')
    const categoryTime = Date.now() - categoryStart

    // Product search by verification level (indexed)
    const verificationStart = Date.now()
    await fetch('http://localhost:3000/api/products?verification=1')
    const verificationTime = Date.now() - verificationStart

    // Should be fast due to indexes
    expect(categoryTime).toBeLessThan(50)
    expect(verificationTime).toBeLessThan(50)

    console.log('Indexed Query Performance:', {
      category: `${categoryTime}ms`,
      verification: `${verificationTime}ms`
    })
  })

  test('should prevent N+1 query problems', async () => {
    // Fetch products with seller info (should use joins, not N+1)
    const startTime = Date.now()
    const response = await fetch('http://localhost:3000/api/products?include=seller&limit=20')
    const queryTime = Date.now() - startTime

    console.log(`Products with seller query time: ${queryTime}ms`)

    // Should be fast even with joins (no N+1)
    expect(queryTime).toBeLessThan(200)
  })

  test('should implement pagination efficiently', async () => {
    // Test pagination performance
    const pageSize = 20

    // First page
    const page1Start = Date.now()
    await fetch(`http://localhost:3000/api/products?page=1&limit=${pageSize}`)
    const page1Time = Date.now() - page1Start

    // Later page
    const page10Start = Date.now()
    await fetch(`http://localhost:3000/api/products?page=10&limit=${pageSize}`)
    const page10Time = Date.now() - page10Start

    // Later pages shouldn't be significantly slower
    const timeDiff = Math.abs(page10Time - page1Time)
    expect(timeDiff).toBeLessThan(50)

    console.log('Pagination Performance:', {
      page1: `${page1Time}ms`,
      page10: `${page10Time}ms`,
      diff: `${timeDiff}ms`
    })
  })

  test('should handle complex queries efficiently', async () => {
    // Test complex query with multiple filters and joins
    const complexQuery = new URLSearchParams({
      category: 'ai-models',
      minPrice: '10',
      maxPrice: '100',
      verification: '1',
      sort: 'rating',
      include: 'seller,reviews'
    })

    const startTime = Date.now()
    const response = await fetch(`http://localhost:3000/api/products?${complexQuery}`)
    const queryTime = Date.now() - startTime

    console.log(`Complex query time: ${queryTime}ms`)

    expect(response.ok).toBe(true)
    expect(queryTime).toBeLessThan(300) // Allow more time for complex query
  })

  test('should optimize aggregation queries', async () => {
    // Test analytics aggregation query
    const startTime = Date.now()
    const response = await fetch('http://localhost:3000/api/analytics/sales-summary')
    const queryTime = Date.now() - startTime

    console.log(`Aggregation query time: ${queryTime}ms`)

    expect(response.ok).toBe(true)
    expect(queryTime).toBeLessThan(500)
  })
})

describe('Performance Testing - Caching', () => {
  test('should cache static assets', async ({ page }) => {
    await page.goto('http://localhost:3000/marketplace')

    // Get initial load resources
    const firstLoad = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      return entries.map((e: PerformanceResourceTiming) => e.name)
    })

    // Reload page
    await page.reload()

    // Check if resources are cached
    const cachedResources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      return entries.filter((e: PerformanceResourceTiming) => e.transferSize === 0).length
    })

    console.log(`Cached resources on reload: ${cachedResources}`)

    // Should have cached resources
    expect(cachedResources).toBeGreaterThan(0)
  })

  test('should use HTTP cache headers', async () => {
    const response = await fetch('http://localhost:3000/_next/static/css/app.css')

    const cacheControl = response.headers.get('cache-control')

    expect(cacheControl).toBeTruthy()
    expect(cacheControl).toContain('max-age')
  })

  test('should implement API response caching for expensive queries', async () => {
    // First request (no cache)
    const start1 = Date.now()
    const response1 = await fetch('http://localhost:3000/api/products/popular')
    const time1 = Date.now() - start1

    // Second request (should be cached)
    const start2 = Date.now()
    const response2 = await fetch('http://localhost:3000/api/products/popular')
    const time2 = Date.now() - start2

    console.log('API Caching:', {
      firstRequest: `${time1}ms`,
      cachedRequest: `${time2}ms`,
      improvement: `${((time1 - time2) / time1 * 100).toFixed(1)}%`
    })

    // Cached request should be significantly faster
    expect(time2).toBeLessThan(time1 * 0.5)
  })
})

describe('Performance Testing - Memory Management', () => {
  test('should not have memory leaks', async ({ page }) => {
    await page.goto('http://localhost:3000/marketplace')

    // Get initial memory
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize
      }
      return 0
    })

    // Perform actions that might cause memory leaks
    for (let i = 0; i < 20; i++) {
      await page.click('[data-testid="product-card"]')
      await page.goBack()
    }

    // Get final memory
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize
      }
      return 0
    })

    const memoryIncrease = finalMemory - initialMemory

    console.log('Memory Usage:', {
      initial: `${(initialMemory / 1024 / 1024).toFixed(2)}MB`,
      final: `${(finalMemory / 1024 / 1024).toFixed(2)}MB`,
      increase: `${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`
    })

    // Memory should not increase significantly (< 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
  })
})

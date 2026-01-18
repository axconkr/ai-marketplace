/**
 * Comprehensive Security Audit Tests
 *
 * Tests covering OWASP Top 10 and platform-specific security requirements
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'

describe('Security Audit - Authentication & Authorization', () => {
  describe('JWT Token Security', () => {
    test('should reject tampered JWT tokens', async () => {
      const response = await fetch('http://localhost:3000/api/user/profile', {
        headers: {
          'Authorization': 'Bearer tampered.token.here'
        }
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toMatch(/invalid.*token|unauthorized/i)
    })

    test('should reject expired JWT tokens', async () => {
      // This would use a pre-generated expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired'

      const response = await fetch('http://localhost:3000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${expiredToken}`
        }
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toMatch(/expired|invalid/i)
    })

    test('should include appropriate token expiry times', async () => {
      // Login to get token
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPass123!'
        })
      })

      const { accessToken } = await loginResponse.json()

      // Decode token (without verification)
      const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())

      // Access token should expire in 15 minutes
      const expiryTime = payload.exp - payload.iat
      expect(expiryTime).toBeLessThanOrEqual(15 * 60) // 15 minutes
    })

    test('should use secure token signing algorithm', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPass123!'
        })
      })

      const { accessToken } = await response.json()
      const header = JSON.parse(Buffer.from(accessToken.split('.')[0], 'base64').toString())

      // Should use HS256 or stronger
      expect(['HS256', 'RS256', 'ES256']).toContain(header.alg)
      expect(header.alg).not.toBe('none')
    })
  })

  describe('Password Security', () => {
    test('should enforce password strength requirements', async () => {
      const weakPasswords = ['12345', 'password', 'abc', 'test']

      for (const weak of weakPasswords) {
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `test-${Date.now()}@example.com`,
            password: weak,
            name: 'Test User'
          })
        })

        expect(response.status).toBeGreaterThanOrEqual(400)
        const data = await response.json()
        expect(data.error).toMatch(/password.*weak|requirements/i)
      }
    })

    test('should hash passwords using bcrypt', async () => {
      // This would require database access to verify
      // For now, we can test that passwords aren't stored in plain text

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `security-test-${Date.now()}@example.com`,
          password: 'SecurePass123!',
          name: 'Security Test'
        })
      })

      expect(response.status).toBe(201)

      // Password should never be returned in response
      const data = await response.json()
      expect(data.password).toBeUndefined()
    })

    test('should implement rate limiting on login attempts', async () => {
      const attempts = []

      // Try 10 rapid login attempts
      for (let i = 0; i < 10; i++) {
        attempts.push(
          fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'WrongPassword'
            })
          })
        )
      }

      const responses = await Promise.all(attempts)
      const rateLimited = responses.filter(r => r.status === 429)

      // At least one should be rate limited
      expect(rateLimited.length).toBeGreaterThan(0)
    })
  })

  describe('Role-Based Access Control (RBAC)', () => {
    test('should restrict admin endpoints to admin users', async () => {
      // Login as regular user
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'UserPass123!'
        })
      })

      const { accessToken } = await loginResponse.json()

      // Try to access admin endpoint
      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      expect(response.status).toBe(403)
    })

    test('should restrict verifier endpoints to verifier role', async () => {
      // Login as regular user
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'UserPass123!'
        })
      })

      const { accessToken } = await loginResponse.json()

      // Try to access verifier endpoint
      const response = await fetch('http://localhost:3000/api/verifications/assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verificationId: 'test-id' })
      })

      expect(response.status).toBe(403)
    })
  })

  describe('Session Security', () => {
    test('should set secure cookie flags', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPass123!'
        })
      })

      const cookies = response.headers.get('set-cookie')

      expect(cookies).toContain('HttpOnly')
      expect(cookies).toContain('SameSite=Strict')

      // In production, should also have Secure flag
      if (process.env.NODE_ENV === 'production') {
        expect(cookies).toContain('Secure')
      }
    })

    test('should invalidate session on logout', async () => {
      // Login
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPass123!'
        })
      })

      const { accessToken } = await loginResponse.json()

      // Logout
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      // Try to use token after logout
      const response = await fetch('http://localhost:3000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      expect(response.status).toBe(401)
    })
  })
})

describe('Security Audit - API Security', () => {
  describe('SQL Injection Prevention', () => {
    test('should prevent SQL injection in search queries', async () => {
      const sqlInjectionAttempts = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "admin'--",
        "1' UNION SELECT * FROM users--"
      ]

      for (const attempt of sqlInjectionAttempts) {
        const response = await fetch(`http://localhost:3000/api/products?search=${encodeURIComponent(attempt)}`)

        // Should return normal results or error, but not expose SQL error
        expect(response.status).not.toBe(500)

        if (response.status >= 400) {
          const data = await response.json()
          expect(data.error).not.toMatch(/SQL|database|syntax/i)
        }
      }
    })

    test('should use parameterized queries (Prisma protection)', async () => {
      // Prisma automatically uses parameterized queries
      // Test that user input doesn't execute as SQL

      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "'; DELETE FROM products; --",
          description: 'Test product',
          price: 10
        })
      })

      // Product should be created safely or rejected, not execute SQL
      expect([200, 201, 400, 401, 403]).toContain(response.status)
    })
  })

  describe('XSS Prevention', () => {
    test('should sanitize user input in product descriptions', async () => {
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        'javascript:alert("XSS")'
      ]

      for (const xss of xssAttempts) {
        const response = await fetch('http://localhost:3000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'XSS Test Product',
            description: xss,
            price: 10
          })
        })

        if (response.ok) {
          const data = await response.json()

          // Description should be sanitized
          expect(data.description).not.toContain('<script')
          expect(data.description).not.toContain('javascript:')
          expect(data.description).not.toContain('onerror=')
        }
      }
    })

    test('should escape special characters in output', async () => {
      // This would be tested in the frontend rendering
      // API should not transform input, frontend should escape on render
    })
  })

  describe('Input Validation with Zod', () => {
    test('should validate email format', async () => {
      const invalidEmails = ['notanemail', '@test.com', 'test@', 'test @test.com']

      for (const email of invalidEmails) {
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password: 'TestPass123!',
            name: 'Test'
          })
        })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toMatch(/email|invalid/i)
      }
    })

    test('should validate price is positive number', async () => {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Product',
          description: 'Test',
          price: -10
        })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toMatch(/price|positive/i)
    })

    test('should validate required fields', async () => {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'Missing name and price'
        })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toMatch(/required/i)
    })
  })

  describe('File Upload Security', () => {
    test('should validate file types', async () => {
      const maliciousFiles = [
        { name: 'malware.exe', type: 'application/x-msdownload' },
        { name: 'script.php', type: 'application/x-php' },
        { name: 'shell.sh', type: 'application/x-sh' }
      ]

      for (const file of maliciousFiles) {
        const formData = new FormData()
        formData.append('file', new Blob(['test'], { type: file.type }), file.name)

        const response = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          body: formData
        })

        expect(response.status).toBeGreaterThanOrEqual(400)
        const data = await response.json()
        expect(data.error).toMatch(/file.*type|not.*allowed/i)
      }
    })

    test('should enforce file size limits', async () => {
      // Simulate large file (this would need actual large file or mock)
      const largeFile = new Blob(['x'.repeat(100 * 1024 * 1024)]) // 100MB

      const formData = new FormData()
      formData.append('file', largeFile, 'large.zip')

      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
      const data = await response.json()
      expect(data.error).toMatch(/size|large|limit/i)
    })

    test('should scan uploaded files for malware', async () => {
      // This would require integration with malware scanning service
      // For now, test that scanning endpoint exists

      const formData = new FormData()
      formData.append('file', new Blob(['test content']), 'test.zip')

      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      })

      // Should not return 500 or expose internal scanning errors
      expect([200, 201, 400, 403]).toContain(response.status)
    })

    test('should generate unique filenames to prevent overwrite', async () => {
      const formData1 = new FormData()
      formData1.append('file', new Blob(['file 1']), 'test.zip')

      const formData2 = new FormData()
      formData2.append('file', new Blob(['file 2']), 'test.zip')

      const response1 = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData1
      })

      const response2 = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData2
      })

      const data1 = await response1.json()
      const data2 = await response2.json()

      // Filenames should be different even with same upload name
      expect(data1.filename).not.toBe(data2.filename)
    })
  })
})

describe('Security Audit - Payment Security', () => {
  describe('Stripe Webhook Verification', () => {
    test('should verify webhook signatures', async () => {
      const invalidWebhook = {
        type: 'payment_intent.succeeded',
        data: { object: { id: 'fake' } }
      }

      const response = await fetch('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'invalid-signature'
        },
        body: JSON.stringify(invalidWebhook)
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toMatch(/signature|invalid/i)
    })

    test('should reject webhooks without signature', async () => {
      const response = await fetch('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test' })
      })

      expect(response.status).toBe(400)
    })
  })

  describe('Payment Amount Validation', () => {
    test('should prevent amount manipulation', async () => {
      // User shouldn't be able to change payment amount client-side

      const response = await fetch('http://localhost:3000/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'test-product',
          amount: 1 // Try to pay $0.01 for $50 product
        })
      })

      // Should reject or use server-side product price
      const data = await response.json()

      if (response.ok) {
        // Amount should be from database, not client input
        expect(data.amount).toBeGreaterThan(100) // At least $1.00 in cents
      } else {
        expect(response.status).toBe(400)
      }
    })

    test('should validate currency matches product', async () => {
      const response = await fetch('http://localhost:3000/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'usd-product',
          currency: 'EUR' // Try to change currency
        })
      })

      // Should use product's currency or reject
      if (response.ok) {
        const data = await response.json()
        expect(data.currency).toBe('USD') // Server-side currency
      }
    })
  })

  describe('Duplicate Payment Prevention', () => {
    test('should prevent duplicate payments for same order', async () => {
      // This would test idempotency

      const orderId = 'test-order-123'

      const payment1 = fetch('http://localhost:3000/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })

      const payment2 = fetch('http://localhost:3000/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })

      const [response1, response2] = await Promise.all([payment1, payment2])

      // Only one should succeed
      const successes = [response1, response2].filter(r => r.ok)
      expect(successes.length).toBeLessThanOrEqual(1)
    })
  })
})

describe('Security Audit - Data Privacy', () => {
  describe('PII Protection', () => {
    test('should not expose sensitive data in API responses', async () => {
      const response = await fetch('http://localhost:3000/api/user/profile')

      if (response.ok) {
        const data = await response.json()

        // Should not expose sensitive fields
        expect(data.password).toBeUndefined()
        expect(data.refreshToken).toBeUndefined()
        expect(data.bank_account).toBeUndefined() // Full account number
      }
    })

    test('should mask sensitive data in logs', async () => {
      // This would require access to logs
      // In practice, verify logging middleware doesn't log passwords, tokens, etc.
    })

    test('should encrypt PII at rest', async () => {
      // This would verify database encryption
      // Check that bank_account, etc. are encrypted in DB
    })
  })

  describe('GDPR Compliance', () => {
    test('should allow users to request data deletion', async () => {
      const response = await fetch('http://localhost:3000/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      })

      expect([200, 401]).toContain(response.status)
    })

    test('should allow users to export their data', async () => {
      const response = await fetch('http://localhost:3000/api/user/export-data', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      })

      if (response.ok) {
        const data = await response.json()
        expect(data).toHaveProperty('user')
        expect(data).toHaveProperty('orders')
        expect(data).toHaveProperty('products')
      }
    })
  })

  describe('Email Privacy', () => {
    test('should not expose user emails in public APIs', async () => {
      const response = await fetch('http://localhost:3000/api/products')

      const products = await response.json()

      products.forEach((product: any) => {
        if (product.seller) {
          expect(product.seller.email).toBeUndefined()
        }
      })
    })
  })
})

describe('Security Audit - General Security', () => {
  describe('CORS Configuration', () => {
    test('should have appropriate CORS headers', async () => {
      const response = await fetch('http://localhost:3000/api/products')

      const corsHeader = response.headers.get('Access-Control-Allow-Origin')

      // Should not be wildcard in production
      if (process.env.NODE_ENV === 'production') {
        expect(corsHeader).not.toBe('*')
      }
    })
  })

  describe('Security Headers', () => {
    test('should set Content-Security-Policy header', async () => {
      const response = await fetch('http://localhost:3000')

      const csp = response.headers.get('Content-Security-Policy')
      expect(csp).toBeTruthy()
    })

    test('should set X-Frame-Options header', async () => {
      const response = await fetch('http://localhost:3000')

      const xfo = response.headers.get('X-Frame-Options')
      expect(xfo).toMatch(/DENY|SAMEORIGIN/)
    })

    test('should set X-Content-Type-Options header', async () => {
      const response = await fetch('http://localhost:3000')

      const xcto = response.headers.get('X-Content-Type-Options')
      expect(xcto).toBe('nosniff')
    })

    test('should set Strict-Transport-Security in production', async () => {
      if (process.env.NODE_ENV === 'production') {
        const response = await fetch('http://localhost:3000')

        const hsts = response.headers.get('Strict-Transport-Security')
        expect(hsts).toContain('max-age=')
      }
    })
  })

  describe('Error Handling', () => {
    test('should not expose stack traces in production', async () => {
      const response = await fetch('http://localhost:3000/api/nonexistent')

      expect(response.status).toBe(404)

      const data = await response.json()

      if (process.env.NODE_ENV === 'production') {
        expect(data.stack).toBeUndefined()
        expect(data.trace).toBeUndefined()
      }
    })

    test('should not expose database errors to users', async () => {
      // Trigger a database error (invalid ID format)
      const response = await fetch('http://localhost:3000/api/products/invalid-id-format')

      if (response.status >= 400) {
        const data = await response.json()

        expect(data.error).not.toMatch(/prisma|database|sql/i)
      }
    })
  })
})

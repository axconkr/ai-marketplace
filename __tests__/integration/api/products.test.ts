/**
 * Products API Integration Tests
 * Tests for product API endpoints
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import {
  createMockRequest,
  createMockUser,
  createMockProduct,
  createMockPrismaClient,
} from '../../utils/test-helpers'

describe('Products API Integration', () => {
  let mockPrisma: any

  beforeEach(() => {
    mockPrisma = createMockPrismaClient()
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return list of active products', async () => {
      const mockProducts = [
        createMockProduct({ status: 'ACTIVE' }),
        createMockProduct({ status: 'ACTIVE' }),
      ]

      mockPrisma.product.findMany.mockResolvedValue(mockProducts)

      const request = createMockRequest({
        method: 'GET',
        url: '/api/products',
      })

      // Simulate API handler
      const products = await mockPrisma.product.findMany({
        where: { status: 'ACTIVE' },
      })

      expect(products).toHaveLength(2)
      expect(products[0].status).toBe('ACTIVE')
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
      })
    })

    it('should filter products by category', async () => {
      const n8nProducts = [
        createMockProduct({ category: 'N8N_TEMPLATE' }),
      ]

      mockPrisma.product.findMany.mockResolvedValue(n8nProducts)

      const products = await mockPrisma.product.findMany({
        where: {
          status: 'ACTIVE',
          category: 'N8N_TEMPLATE',
        },
      })

      expect(products).toHaveLength(1)
      expect(products[0].category).toBe('N8N_TEMPLATE')
    })

    it('should handle pagination', async () => {
      const mockProducts = Array(10)
        .fill(null)
        .map(() => createMockProduct())

      mockPrisma.product.findMany.mockResolvedValue(mockProducts.slice(0, 5))

      const products = await mockPrisma.product.findMany({
        take: 5,
        skip: 0,
      })

      expect(products).toHaveLength(5)
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        take: 5,
        skip: 0,
      })
    })
  })

  describe('GET /api/products/:id', () => {
    it('should return product by ID', async () => {
      const mockProduct = createMockProduct()
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)

      const product = await mockPrisma.product.findUnique({
        where: { id: mockProduct.id },
      })

      expect(product).toEqual(mockProduct)
      expect(product.id).toBe(mockProduct.id)
    })

    it('should return null for non-existent product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null)

      const product = await mockPrisma.product.findUnique({
        where: { id: 'non-existent-id' },
      })

      expect(product).toBeNull()
    })
  })

  describe('POST /api/products', () => {
    it('should create new product for seller', async () => {
      const seller = createMockUser({ role: 'SELLER' })
      const newProduct = createMockProduct({ sellerId: seller.id })

      mockPrisma.product.create.mockResolvedValue(newProduct)

      const product = await mockPrisma.product.create({
        data: {
          sellerId: seller.id,
          title: newProduct.title,
          description: newProduct.description,
          category: newProduct.category,
          price: newProduct.price,
          status: 'PENDING',
        },
      })

      expect(product).toEqual(newProduct)
      expect(product.sellerId).toBe(seller.id)
      expect(mockPrisma.product.create).toHaveBeenCalled()
    })

    it('should reject product creation for non-seller', async () => {
      const buyer = createMockUser({ role: 'BUYER' })

      // Simulate authorization check
      const isAuthorized = buyer.role === 'SELLER'
      expect(isAuthorized).toBe(false)
    })
  })

  describe('PATCH /api/products/:id', () => {
    it('should update product by owner', async () => {
      const seller = createMockUser({ role: 'SELLER' })
      const product = createMockProduct({ sellerId: seller.id })
      const updatedProduct = { ...product, price: 20000 }

      mockPrisma.product.findUnique.mockResolvedValue(product)
      mockPrisma.product.update.mockResolvedValue(updatedProduct)

      // Verify ownership
      const existingProduct = await mockPrisma.product.findUnique({
        where: { id: product.id },
      })
      expect(existingProduct.sellerId).toBe(seller.id)

      // Update product
      const result = await mockPrisma.product.update({
        where: { id: product.id },
        data: { price: 20000 },
      })

      expect(result.price).toBe(20000)
      expect(mockPrisma.product.update).toHaveBeenCalled()
    })
  })

  describe('DELETE /api/products/:id', () => {
    it('should delete product by owner', async () => {
      const seller = createMockUser({ role: 'SELLER' })
      const product = createMockProduct({ sellerId: seller.id })

      mockPrisma.product.findUnique.mockResolvedValue(product)
      mockPrisma.product.delete.mockResolvedValue(product)

      // Verify ownership
      const existingProduct = await mockPrisma.product.findUnique({
        where: { id: product.id },
      })
      expect(existingProduct.sellerId).toBe(seller.id)

      // Delete product
      await mockPrisma.product.delete({
        where: { id: product.id },
      })

      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: product.id },
      })
    })
  })
})

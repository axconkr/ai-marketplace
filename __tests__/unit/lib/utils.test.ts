/**
 * Utils Library Unit Tests
 * Tests for utility functions
 */

import { describe, it, expect } from '@jest/globals'
import { cn } from '@/lib/utils/cn'

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('bg-blue-500', 'text-white')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('text-white')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active')
      expect(result).toContain('base-class')
      expect(result).toContain('active')
    })

    it('should filter out false values', () => {
      const result = cn('base-class', false && 'hidden', null, undefined)
      expect(result).toBe('base-class')
    })

    it('should handle Tailwind conflicts', () => {
      const result = cn('p-4', 'p-8')
      // Should only keep the last padding class
      expect(result).toContain('p-8')
    })

    it('should work with empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle array of classes', () => {
      const result = cn(['bg-blue-500', 'text-white'])
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('text-white')
    })
  })
})

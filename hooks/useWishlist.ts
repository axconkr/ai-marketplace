import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    description: string | null
    price: number
    currency: string
    category: string | null
    rating_average: number | null
    rating_count: number
    seller: {
      id: string
      name: string | null
      avatar: string | null
    }
    files: Array<{
      id: string
      url: string
      filename: string
    }>
  }
  addedAt: string
}

interface WishlistResponse {
  items: WishlistItem[]
  count: number
}

export function useWishlist() {
  const { isAuthenticated } = useAuth()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper to get token from localStorage
  const getToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  }

  // Fetch wishlist
  const fetchWishlist = async () => {
    const token = getToken()
    if (!token || !isAuthenticated) {
      setWishlist([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist')
      }

      const data: WishlistResponse = await response.json()
      setWishlist(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setWishlist([])
    } finally {
      setLoading(false)
    }
  }

  // Add to wishlist
  const addToWishlist = async (productId: string) => {
    const token = getToken()
    if (!token) {
      throw new Error('Please login to add to wishlist')
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add to wishlist')
      }

      // Refresh wishlist
      await fetchWishlist()
    } catch (err) {
      throw err
    }
  }

  // Remove from wishlist
  const removeFromWishlist = async (productId: string) => {
    const token = getToken()
    if (!token) {
      throw new Error('Please login to manage wishlist')
    }

    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove from wishlist')
      }

      // Update local state immediately
      setWishlist((prev) => prev.filter((item) => item.product.id !== productId))
    } catch (err) {
      throw err
    }
  }

  // Check if product is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item.product.id === productId)
  }

  // Toggle wishlist
  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  // Auto-fetch on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    } else {
      setWishlist([])
    }
  }, [isAuthenticated])

  return {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    refetch: fetchWishlist,
  }
}

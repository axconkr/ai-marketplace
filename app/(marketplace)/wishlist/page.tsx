'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default function WishlistPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { wishlist, loading, removeFromWishlist } = useWishlist()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/wishlist')
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading wishlist...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId)
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
    }
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold">위시리스트</h1>
        </div>
        <p className="text-gray-600">{wishlist.length}개 제품</p>
      </div>

      {wishlist.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">위시리스트가 비어있습니다</h2>
            <p className="text-gray-600 mb-6">
              마음에 드는 제품을 위시리스트에 추가해보세요
            </p>
            <Button asChild>
              <Link href="/products">제품 둘러보기</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const product = item.product
            const imageUrl =
              product.files && product.files.length > 0
                ? product.files[0].url
                : '/placeholder-product.png'

            return (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/products/${product.id}`}>
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/products/${product.id}`}>
                      <CardTitle className="text-lg hover:text-blue-600 transition-colors">
                        {product.name}
                      </CardTitle>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(product.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                    {product.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(product.price, product.currency)}
                      </p>
                      {product.rating_average && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <span>⭐</span>
                          <span>{product.rating_average.toFixed(1)}</span>
                          <span>({product.rating_count})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/products/${product.id}`}>
                        상세보기
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                    >
                      <Link href={`/checkout/${product.id}`}>
                        <ShoppingCart className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    추가일: {new Date(item.addedAt).toLocaleDateString('ko-KR')}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

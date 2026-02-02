'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/contexts/cart-context'
import { useCartCheckout } from '@/hooks/use-cart-checkout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react'

export default function CartPage() {
  const { items, removeFromCart } = useCart()
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  
  const cartCheckout = useCartCheckout({
    onSuccess: (data) => {
      window.location.href = `/checkout/success/session/${data.checkoutSessionId}`
    },
    onError: (error) => {
      setCheckoutError(error.message)
    },
  })

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  const hasVerifiedItems = items.some(i => i.verification_level >= 2)
  const platformFeeRate = hasVerifiedItems ? 0.12 : 0.15
  const platformFee = subtotal * platformFeeRate
  const total = subtotal + platformFee

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">장바구니</h1>
            <p className="text-sm sm:text-base text-gray-600">결제 전 상품을 확인하세요</p>
          </div>

          <Card className="p-12 text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold mb-4">장바구니가 비어있습니다</h2>
            <p className="text-gray-600 mb-8">
              마켓플레이스를 둘러보고 멋진 AI 솔루션을 장바구니에 추가해보세요!
            </p>
            <Link href="/products">
              <Button size="lg" className="gap-2">
                <ShoppingBag className="h-5 w-5" />
                상품 둘러보기
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const handleCheckout = () => {
    setCheckoutError(null)
    
    if (items.length === 1) {
      window.location.href = `/checkout/${items[0].id}`
      return
    }

    const currencies = new Set(items.map(item => item.currency))
    if (currencies.size > 1) {
      setCheckoutError('모든 상품의 통화가 동일해야 합니다')
      return
    }

    cartCheckout.mutate({ items })
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">장바구니</h1>
          <p className="text-sm sm:text-base text-gray-600">
            장바구니에 {items.length}개의 상품이 담겨있습니다
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Product Image Placeholder */}
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 sm:h-10 sm:w-10 text-primary/40" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.id}`}
                            className="hover:underline"
                          >
                            <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">
                              {item.title}
                            </h3>
                          </Link>

                          {/* Verification Badge */}
                          {item.verification_level >= 2 && (
                            <Badge variant="secondary" className="mb-2">
                              ✓ 인증됨
                            </Badge>
                          )}

                          {/* Seller Info */}
                          <p className="text-sm text-gray-500">
                            판매자: {item.seller.name}
                            {item.seller.seller_tier && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {item.seller.seller_tier}
                              </Badge>
                            )}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="flex-shrink-0 hover:text-destructive"
                          title="장바구니에서 제거"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="mt-3 sm:mt-4 flex items-center justify-between">
                        <div className="text-xl sm:text-2xl font-bold">
                          {formatCurrency(item.price * 100, item.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-4">
              <CardHeader>
                <CardTitle>주문 요약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    소계 ({items.length}개)
                  </span>
                  <span className="font-medium">
                    {formatCurrency(subtotal * 100, items[0]?.currency || 'USD')}
                  </span>
                </div>

                {/* Platform Fee */}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-600">플랫폼 수수료</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({platformFeeRate * 100}%)
                    </span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(platformFee * 100, items[0]?.currency || 'USD')}
                  </span>
                </div>

                {/* Verified Discount Notice */}
                {hasVerifiedItems && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    ✓ 인증 상품으로 플랫폼 수수료 3%를 절약하고 있습니다!
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">총액</span>
                    <span className="text-2xl font-bold">
                      {formatCurrency(total * 100, items[0]?.currency || 'USD')}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                {checkoutError && (
                  <div className="w-full text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {checkoutError}
                  </div>
                )}
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleCheckout}
                  disabled={cartCheckout.isPending}
                >
                  {cartCheckout.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      결제하기
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
                <Link href="/products" className="w-full">
                  <Button variant="outline" size="lg" className="w-full">
                    쇼핑 계속하기
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

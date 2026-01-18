'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Download, Eye, Shield, ShoppingCart, Check, Heart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/toast';
import type { Product } from '@/lib/api/products';
import { CATEGORY_LABELS } from '@/lib/validations/product';
import { useState, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ProductCard component
 * Displays product summary in a grid layout
 */

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const verificationBadge = getVerificationBadge(product.verification_level);
  const { addToCart, items } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const isInCart = items.some((item) => item.id === product.id);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCart) return;

    setIsAdding(true);

    // Map Product to CartItem format
    const cartItem = {
      id: product.id,
      title: product.name,
      price: product.price,
      currency: product.currency,
      verification_level: product.verification_level,
      seller: {
        name: product.seller?.name || 'Unknown',
        seller_tier: product.seller?.role,
      },
      quantity: 1,
    };

    addToCart(cartItem);

    setIsAdding(false);
    setJustAdded(true);

    // Reset "just added" state after 2 seconds
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  const handleToggleWishlist = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToast({
        title: '로그인이 필요합니다',
        description: '위시리스트를 사용하려면 로그인해주세요.',
        variant: 'error',
      });
      router.push('/login');
      return;
    }

    setIsTogglingWishlist(true);

    try {
      await toggleWishlist(product.id);
      addToast({
        title: inWishlist ? '위시리스트에서 제거되었습니다' : '위시리스트에 추가되었습니다',
        description: inWishlist
          ? `${product.name}이(가) 위시리스트에서 제거되었습니다.`
          : `${product.name}이(가) 위시리스트에 추가되었습니다.`,
      });
    } catch (error) {
      addToast({
        title: '오류',
        description: error instanceof Error ? error.message : '위시리스트 업데이트에 실패했습니다.',
        variant: 'error',
      });
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <Card data-testid="product-card" className="h-full transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 group flex flex-col overflow-hidden">
      <Link href={`/products/${product.id}`} className="flex-1 flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <div className="flex items-center justify-center h-full text-muted-foreground bg-gradient-to-br from-primary/5 to-primary/10 transition-transform duration-300 group-hover:scale-110">
            <span className="text-sm font-medium">{product.name}</span>
          </div>

          {/* Wishlist Button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm shadow-md hover:bg-white hover:scale-110 transition-all duration-200"
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
            aria-label={inWishlist ? '위시리스트에서 제거' : '위시리스트에 추가'}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                inWishlist
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </Button>

          {/* Verification Badge */}
          {verificationBadge && (
            <div className="absolute top-3 right-3 z-10">
              <Badge
                variant="default"
                className="bg-white/95 text-primary backdrop-blur-sm shadow-md"
              >
                <Shield className="w-3 h-3 mr-1" />
                {verificationBadge}
              </Badge>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardContent className="p-4 flex-1">
          {/* Category */}
          {product.category && (
            <Badge variant="secondary" className="mb-2">
              {CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS] || product.category}
            </Badge>
          )}

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            {product.rating_average && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground">
                  {Number(product.rating_average).toFixed(1)}
                </span>
                <span>({product.rating_count})</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>{product.download_count}</span>
            </div>
          </div>

          {/* Seller Info */}
          {product.seller && (
            <div className="flex items-center gap-2 text-sm">
              {product.seller.avatar ? (
                <Image
                  src={product.seller.avatar}
                  alt={product.seller.name || 'Seller'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                  {product.seller.name?.[0]?.toUpperCase() || 'S'}
                </div>
              )}
              <span className="text-muted-foreground">
                {product.seller.name || '익명'}
              </span>
              {product.seller.role === 'seller' && (
                <Badge variant="outline" className="text-xs">
                  판매자
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0">
          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between w-full gap-2">
            <div>
              <span data-testid="product-price" className="text-2xl font-bold text-primary">
                {formatPrice(product.price, product.currency)}
              </span>
            </div>
            <Button
              data-testid="add-to-cart"
              size="sm"
              variant={isInCart || justAdded ? 'outline' : 'default'}
              onClick={handleAddToCart}
              disabled={isAdding || isInCart}
              className="shrink-0"
            >
              {isInCart ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  In Cart
                </>
              ) : justAdded ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
  );
}

// Helper functions
function getVerificationBadge(level: number): string | null {
  switch (level) {
    case 1:
      return '레벨 1';
    case 2:
      return '레벨 2';
    case 3:
      return '레벨 3';
    default:
      return null;
  }
}

function formatPrice(price: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(price);
}

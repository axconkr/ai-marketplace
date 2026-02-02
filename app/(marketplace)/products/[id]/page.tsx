'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import {
  Download,
  Eye,
  Star,
  Shield,
  Calendar,
  Tag,
  ExternalLink,
  ShoppingCart,
  Check,
  FileText,
  MessageSquare,
  Package,
  User,
  TrendingUp,
  Heart,
} from 'lucide-react';
import { CATEGORY_LABELS, PRICING_MODEL_LABELS } from '@/lib/validations/product';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/lib/auth-context';
import { ReviewList } from '@/components/reviews/ReviewList';

/**
 * Product Detail Page
 * Display detailed information about a single product
 */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(id);
  const { addToast } = useToast();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  // Local state for button feedback
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  /**
   * Add product to cart with visual feedback
   */
  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    try {
      // Add product to cart
      addToCart({
        id: product.id,
        title: product.name,
        price: product.price,
        currency: product.currency,
        verification_level: product.verification_level,
        seller: product.seller,
        demo_url: (product as any).demo_url,
      });

      // Show success feedback
      setJustAdded(true);
      addToast({
        title: '장바구니에 추가되었습니다!',
        description: `${product.name}이(가) 장바구니에 추가되었습니다.`,
      });

      // Reset success state after 2 seconds
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      addToast({
        title: '오류',
        description: '장바구니에 추가하는데 실패했습니다. 다시 시도해주세요.',
        variant: 'error',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  /**
   * Direct checkout - navigate to checkout with this product
   */
  const handleBuyNow = () => {
    if (!product) return;

    // Navigate to checkout page with this product
    router.push(`/checkout?product=${product.id}`);
  };

  /**
   * Toggle wishlist with authentication check
   */
  const handleToggleWishlist = async () => {
    if (!product) return;

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
      const inWishlist = isInWishlist(product.id);
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

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">제품을 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-4">
            {error?.message || '찾으시는 제품이 존재하지 않습니다.'}
          </p>
          <Button asChild>
            <Link href="/products">제품 목록으로 돌아가기</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const verificationBadge = getVerificationBadge(product.verification_level);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">
          홈
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground transition-colors">
          제품
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Product Images */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video w-full bg-muted group">
              {(product as any).demo_url ? (
                <Image
                  src={(product as any).demo_url}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Package className="w-16 h-16 mb-2" />
                </div>
              )}
              {verificationBadge && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-white/95 text-primary backdrop-blur-sm shadow-lg">
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    {verificationBadge}
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Product Info */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-sm">
                  {CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS]}
                </Badge>
                {(product as any).tags && (product as any).tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                {product.name}
              </h1>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {product.rating_average && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-foreground">
                      {Number(product.rating_average).toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({product.rating_count}개 리뷰)
                    </span>
                  </div>
                )}
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Download className="w-4 h-4" />
                  <span>{product.download_count.toLocaleString()}회</span>
                </div>
              </div>
            </div>

            {/* Tabs for detailed information */}
            <Tabs defaultValue="description" className="mt-6">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="description" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">제품 설명</span>
                  <span className="sm:hidden">설명</span>
                </TabsTrigger>
                <TabsTrigger value="details" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">상세 정보</span>
                  <span className="sm:hidden">정보</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  리뷰
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                        {product.description || '제품 설명이 없습니다.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm font-medium text-muted-foreground">
                          가격 모델
                        </span>
                        <span className="text-sm font-semibold">
                          일회성 구매
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm font-medium text-muted-foreground">
                          카테고리
                        </span>
                        <Badge variant="secondary">
                          {CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS]}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm font-medium text-muted-foreground">
                          검증 레벨
                        </span>
                        <Badge variant="default">
                          <Shield className="w-3 h-3 mr-1" />
                          {verificationBadge || '미검증'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm font-medium text-muted-foreground">
                          출시일
                        </span>
                        <span className="text-sm font-medium">
                          {product.createdAt
                            ? new Date(product.createdAt).toLocaleDateString('ko-KR')
                            : '미출시'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          최종 업데이트
                        </span>
                        <span className="text-sm font-medium">
                          {new Date(product.updatedAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>

                    {/* Tags Section */}
                    {(product as any).tags && (product as any).tags.length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          태그
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(product as any).tags.map((tag: string) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <ReviewList
                      productId={product.id}
                      currentUserId={isAuthenticated ? (id as string) : undefined}
                      isProductSeller={product.seller_id === (isAuthenticated ? (id as string) : undefined)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Purchase Card */}
          <Card className="lg:sticky lg:top-6">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  {formatPrice(product.price, product.currency)}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  1회 구매
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || justAdded}
                  aria-label="장바구니에 추가"
                >
                  {justAdded ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      추가됨!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {isAddingToCart ? '추가 중...' : '장바구니에 담기'}
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    onClick={handleBuyNow}
                    aria-label="바로 구매"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    바로 구매
                  </Button>

                  <Button
                    size="lg"
                    variant={isInWishlist(product.id) ? 'default' : 'outline'}
                    className="w-full"
                    onClick={handleToggleWishlist}
                    disabled={isTogglingWishlist}
                    aria-label={isInWishlist(product.id) ? '위시리스트에서 제거' : '위시리스트에 추가'}
                  >
                    <Heart
                      className={`w-5 h-5 mr-2 ${isInWishlist(product.id) ? 'fill-current' : ''
                        }`}
                    />
                    {isInWishlist(product.id) ? '저장됨' : '저장'}
                  </Button>
                </div>
              </div>

              {(product as any).demo_url && (
                <>
                  <Separator />
                  <Button size="sm" variant="ghost" className="w-full" asChild>
                    <a
                      href={(product as any).demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="데모 보기 (새 창)"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      데모 보기
                    </a>
                  </Button>
                </>
              )}

              {/* Trust Indicators */}
              <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>구매자 보호 정책</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>100% 환불 보장</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>무료 업데이트</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          {product.seller && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  판매자 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  {product.seller.avatar ? (
                    <div className="relative w-14 h-14 rounded-full overflow-hidden">
                      <Image
                        src={product.seller.avatar}
                        alt={product.seller.name || 'Seller'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {product.seller.name?.[0]?.toUpperCase() || 'S'}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      {product.seller.name || '익명 판매자'}
                    </p>
                    {product.seller.role && (
                      <Badge variant="secondary" className="mt-1">
                        {product.seller.role === 'seller' ? '검증된 판매자' : product.seller.role}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">제품</span>
                    <span className="font-medium">5개</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">평점</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">판매</span>
                    <span className="font-medium">120+</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/sellers/${product.seller.id}`}>
                    <User className="w-4 h-4 mr-2" />
                    판매자 프로필 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getVerificationBadge(level: number): string | null {
  switch (level) {
    case 1:
      return 'Level 1';
    case 2:
      return 'Level 2';
    case 3:
      return 'Level 3';
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

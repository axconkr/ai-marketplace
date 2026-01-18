'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, User, ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LogoutButton } from '@/components/auth/logout-button';
import { useAuth } from '@/lib/auth-context';
import { useWishlist } from '@/hooks/useWishlist';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { wishlist } = useWishlist();
  const pathname = usePathname();

  // Navigation items based on user role
  const navItems = [
    { href: '/products', label: '제품', roles: ['user', 'seller', 'admin'] },
    ...(user?.role === 'service_provider' || user?.role === 'admin'
      ? [{ href: '/dashboard', label: '대시보드', roles: ['seller', 'admin'] }]
      : []
    ),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">AI Marketplace</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Wishlist */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
              {isAuthenticated && wishlist.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {wishlist.length > 99 ? '99+' : wishlist.length}
                </Badge>
              )}
              <span className="sr-only">위시리스트</span>
            </Link>
          </Button>

          {/* Shopping Cart */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">장바구니</span>
            </Link>
          </Button>

          {/* Notifications - Only show when authenticated */}
          {isAuthenticated && <NotificationBell />}
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name || user.email}</span>
                <span className="text-xs text-muted-foreground">
                  ({user.role === 'service_provider' ? '판매자' : user.role === 'admin' ? '관리자' : '구매자'})
                </span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">프로필</Link>
              </Button>
              <LogoutButton variant="outline" size="sm" showIcon={false} />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/register">시작하기</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">메뉴</span>
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="container flex flex-col gap-4 py-4">
            {isAuthenticated && user && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                <User className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name || user.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.role === 'service_provider' ? '판매자' : user.role === 'admin' ? '관리자' : '구매자'}
                  </span>
                </div>
              </div>
            )}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Wishlist, Cart & Notifications Links */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/wishlist" className="flex items-center justify-center gap-2">
                  <Heart className="h-4 w-4" />
                  위시리스트
                  {isAuthenticated && wishlist.length > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {wishlist.length}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/cart" className="flex items-center justify-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  장바구니
                </Link>
              </Button>
            </div>

            {/* Mobile Notifications Link */}
            {isAuthenticated && (
              <Button variant="outline" asChild className="w-full">
                <Link href="/notifications" className="flex items-center justify-center gap-2">
                  알림
                </Link>
              </Button>
            )}

            <div className="flex flex-col gap-2 pt-4 border-t">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/profile">프로필</Link>
                  </Button>
                  <LogoutButton variant="outline" className="w-full" showIcon={true} />
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">로그인</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register">시작하기</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

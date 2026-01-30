'use client';

import Link from 'next/link';
import { Package, Search, User, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ToastProvider } from '@/components/ui/toast';
import { useCart } from '@/contexts/cart-context';
import { getUserRoleFromToken } from '@/lib/auth/middleware-helper';
import { UserRole } from '@/src/lib/auth/types';
import { useEffect, useState } from 'react';

/**
 * Marketplace Layout
 * Shared layout for all marketplace pages
 */

function MarketplaceHeader() {
  const { count } = useCart();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    setUserRole(getUserRoleFromToken());
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/products" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl hidden sm:inline-block">
            AI Marketplace
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Products
          </Link>
          <Link
            href="/products?category=n8n"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            n8n Workflows
          </Link>
          <Link
            href="/products?category=ai_agent"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            AI Agents
          </Link>
          <Link
            href="/dashboard/products"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {count}
                </Badge>
              )}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="md:hidden">
            <button>
              <Menu className="h-5 w-5" />
            </button>
          </Button>

          {/* Show "Sell Product" button only for sellers */}
          {(userRole === UserRole.SELLER || userRole === UserRole.ADMIN) && (
            <Button variant="default" asChild className="hidden md:flex">
              <Link href="/products/new">Sell Product</Link>
            </Button>
          )}

          <Button variant="outline" size="icon" asChild>
            <Link href="/profile">
              <User className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <ToastProvider>
        <div className="min-h-screen flex flex-col">
          {/* Navigation Header */}
          <MarketplaceHeader />

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t bg-muted/50">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-3">
                  <h3 className="font-semibold">AI Marketplace</h3>
                  <p className="text-sm text-muted-foreground">
                    Buy and sell AI automation solutions, workflows, and tools.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Products</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link href="/products?category=n8n" className="hover:text-foreground">
                        n8n Workflows
                      </Link>
                    </li>
                    <li>
                      <Link href="/products?category=make" className="hover:text-foreground">
                        Make Scenarios
                      </Link>
                    </li>
                    <li>
                      <Link href="/products?category=ai_agent" className="hover:text-foreground">
                        AI Agents
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Sellers</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link href="/products/new" className="hover:text-foreground">
                        Sell Your Product
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/products" className="hover:text-foreground">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs/seller-guide" className="hover:text-foreground">
                        Seller Guide
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Support</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link href="/help" className="hover:text-foreground">
                        Help Center
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="hover:text-foreground">
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy" className="hover:text-foreground">
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                <p>© 2024 AI Marketplace. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </ToastProvider>
    </QueryProvider>
  );
}

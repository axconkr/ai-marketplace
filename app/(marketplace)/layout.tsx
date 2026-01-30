import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ToastProvider } from '@/components/ui/toast';

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
          <Header />

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

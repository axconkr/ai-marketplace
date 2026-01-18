import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/contexts/cart-context';
import { ToastProvider } from '@/components/ui/toast';
import { QueryProvider } from '@/lib/react-query';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AI Marketplace',
    template: '%s | AI Marketplace',
  },
  description: 'AI 자동화 솔루션 거래 플랫폼',
  keywords: ['AI', 'n8n', 'automation', 'marketplace', 'AI Agent'],
  authors: [{ name: 'AI Marketplace Team' }],
  creator: 'AI Marketplace',
  publisher: 'AI Marketplace',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'AI Marketplace',
    description: 'AI 자동화 솔루션 거래 플랫폼',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'AI Marketplace',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Marketplace',
    description: 'AI 자동화 솔루션 거래 플랫폼',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.variable} suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

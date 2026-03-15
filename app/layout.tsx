import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { CartProvider } from '@/contexts/cart-context';
import { ToastProvider } from '@/components/ui/toast';
import { QueryProvider } from '@/lib/react-query';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: {
    default: 'VIBE CTO | 바이브코딩 배포 전 현직 CTO 검증 & 운영 전문 업체 지원',
    template: '%s | VIBE CTO',
  },
  description:
    '바이브코딩으로 만든 서비스를 배포 전에 현직 CTO가 직접 검증합니다. 코드 리뷰, 보안 점검, 인프라 검토 후 운영 전문 업체가 상시 지원하여 실제 서비스 운영까지 도와드립니다. 솔로프리너, 1인 개발자를 위한 기술 검증 및 운영 파트너.',
  keywords: [
    '바이브코딩',
    'vibe coding',
    '바이브코딩 검증',
    '바이브코딩 배포',
    'CTO 코드리뷰',
    '기술 검증',
    '코드 검증 서비스',
    '솔로프리너',
    '1인 개발자 지원',
    '서비스 운영 지원',
    '운영 전문 업체',
    'AI 코딩 검증',
    '배포 전 점검',
    '스타트업 CTO',
    '기술 리뷰',
  ],
  authors: [{ name: 'VIBE CTO' }],
  creator: 'VIBE CTO',
  publisher: 'VIBE CTO',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'VIBE CTO | 바이브코딩 배포 전 현직 CTO 검증 & 운영 지원',
    description:
      '바이브코딩으로 만든 서비스, 배포 전에 현직 CTO가 직접 검증하고 운영 전문 업체가 실제 서비스 운영을 지원합니다.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'VIBE CTO',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VIBE CTO | 바이브코딩 배포 전 현직 CTO 검증',
    description:
      '바이브코딩으로 만든 서비스를 현직 CTO가 검증하고, 운영 전문 업체가 실제 서비스 운영을 지원합니다.',
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
      <body className="font-sans-app" suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <CartProvider>
                {children}
                <Analytics />
                <SpeedInsights />
              </CartProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

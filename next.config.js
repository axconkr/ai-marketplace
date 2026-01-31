/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Enable strict mode for better error handling
  reactStrictMode: true,

  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,

  // Docker deployment - standalone output
  output: 'standalone',

  // Ignore TypeScript errors during build (temporary)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignore ESLint errors during build (temporary)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Environment variables accessible on client side
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
           {
             key: 'Referrer-Policy',
             value: 'origin-when-cross-origin',
           },
           {
             key: 'Content-Security-Policy',
             value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://js.tosspayments.com https://*.sentry.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com https://api.tosspayments.com https://*.sentry.io https://*.ingest.sentry.io https://*.supabase.co wss://*.supabase.co; frame-src https://js.stripe.com https://hooks.stripe.com https://tosspayments.com; worker-src 'self' blob:;",
           },
         ],
       },
     ];
   },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Turbopack configuration (Next.js 16+)
  turbopack: {},
};

const sentryConfig = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
};

module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(withBundleAnalyzer(nextConfig), sentryConfig)
  : withBundleAnalyzer(nextConfig);

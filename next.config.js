// Only load bundle analyzer in development
let withBundleAnalyzer = (config) => config
if (process.env.NODE_ENV === 'development') {
  try {
    withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: process.env.ANALYZE === 'true'
    })
  } catch (e) {
    // Bundle analyzer not available, skip
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // typedRoutes: true, // Disabled temporarily to fix deployment
    optimizePackageImports: [
      'date-fns', 
      'react-icons', 
      'lucide-react',
      'zod',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-progress',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs'
    ],
    webpackBuildWorker: true,
    scrollRestoration: true
  },
  // output: 'standalone', // Temporarily disabled to fix SSR issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  productionBrowserSourceMaps: false,
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Cache-Control', value: 'private, no-cache, no-store, must-revalidate' },
        { 
          key: 'Content-Security-Policy', 
          value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com; frame-ancestors 'none';"
        }
      ]
    },
    {
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { 
          key: 'Content-Security-Policy', 
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://lh3.googleusercontent.com; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com; font-src 'self'; object-src 'none'; media-src 'self'; frame-src https://accounts.google.com; frame-ancestors 'self';"
        }
      ]
    },
    {
      source: '/manifest.json',
      headers: [
        { key: 'Content-Type', value: 'application/manifest+json' },
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
      ]
    },
    {
      source: '/sw.js',
      headers: [
        { key: 'Content-Type', value: 'application/javascript' },
        { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' }
      ]
    },
    {
      source: '/static/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
      ]
    }
  ],
  webpack: (config, { isServer }) => {
    // Simple fix for SSR issues
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'isomorphic-dompurify': false,
        'dompurify': false,
      }
    }

    return config
  }
}

module.exports = withBundleAnalyzer(nextConfig)
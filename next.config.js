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

// Polyfill for server-side builds
if (typeof self === 'undefined') {
  global.self = global;
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
  output: 'standalone',
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
  webpack: (config, { isServer, webpack }) => {
    // Fix for 'self is not defined' error in server-side builds
    if (isServer) {
      // Add polyfills for server-side
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        
        if (entries['main.js'] && !entries['main.js'].includes('./lib/polyfills.js')) {
          entries['main.js'].unshift('./lib/polyfills.js');
        }
        
        return entries;
      };
      
      // Define globals
      config.plugins.push(
        new webpack.DefinePlugin({
          'typeof self': "'object'",
          'typeof window': "'undefined'",
        })
      );
      
      // Provide plugin for self
      config.plugins.push(
        new webpack.ProvidePlugin({
          self: 'global',
        })
      );
    }

    // Bundle optimization configurations
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor libraries
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          // Common utilities
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          },
          // Security libraries
          security: {
            name: 'security',
            test: /node_modules\/(crypto-js|bcryptjs|jsonwebtoken|next-auth)/,
            chunks: 'all',
            priority: 30
          },
          // UI libraries
          ui: {
            name: 'ui',
            test: /node_modules\/(@radix-ui|lucide-react)/,
            chunks: 'all',
            priority: 25
          },
          // Date libraries
          date: {
            name: 'date',
            test: /node_modules\/date-fns/,
            chunks: 'all',
            priority: 25
          }
        }
      }
    }

    // Tree shaking optimization
    config.optimization.usedExports = true
    config.optimization.sideEffects = false

    // Minimize dependencies and fix SSR issues
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: false,
        process: false,
      }
      
      // Additional fix for problematic modules
      config.externals = [...(config.externals || []), 'canvas', 'jsdom']
    }

    // Bundle size analysis in development
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new webpack.DefinePlugin({
          __BUNDLE_ANALYZE__: JSON.stringify(true)
        })
      )
    }

    return config
  }
}

module.exports = withBundleAnalyzer(nextConfig)
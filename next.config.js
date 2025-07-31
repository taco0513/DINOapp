// Only load bundle analyzer in development
let withBundleAnalyzer = config => config;
if (process.env.NODE_ENV === 'development') {
  try {
    withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: process.env.ANALYZE === 'true',
    });
  } catch (e) {
    // Bundle analyzer not available, skip
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // optimizeCss: true, // Temporarily disabled due to critters error
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-progress',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      'date-fns',
    ],
    scrollRestoration: true,
    webVitalsAttribution: ['CLS', 'LCP', 'FID', 'FCP', 'TTFB'],
    // Advanced performance features
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
    // Enable faster builds
    serverMinification: true,
  },
  // output: 'standalone', // Temporarily disabled to fix SSR issues
  eslint: {
    ignoreDuringBuilds: false, // Enable lint checking but allow warnings
  },
  typescript: {
    ignoreBuildErrors: false, // Enable type checking
  },
  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Performance optimizations
    loader: 'default',
    unoptimized: false,
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
        {
          key: 'Cache-Control',
          value: 'private, no-cache, no-store, must-revalidate',
        },
        {
          key: 'Content-Security-Policy',
          value:
            "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com; frame-ancestors 'none';",
        },
      ],
    },
    {
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
        },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Content-Security-Policy',
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://lh3.googleusercontent.com; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com; font-src 'self'; object-src 'none'; media-src 'self'; frame-src https://accounts.google.com; frame-ancestors 'self';",
        },
      ],
    },
    {
      source: '/manifest.json',
      headers: [
        { key: 'Content-Type', value: 'application/manifest+json' },
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      source: '/sw.js',
      headers: [
        { key: 'Content-Type', value: 'application/javascript' },
        { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
      ],
    },
    {
      source: '/static/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
  webpack: (config, { isServer }) => {
    // Simple fix for SSR issues
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'isomorphic-dompurify': false,
        dompurify: false,
      };
    }

    // Performance optimizations
    if (!isServer) {
      // Code splitting optimization
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            // React libraries chunk
            react: {
              name: 'react-vendors',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              chunks: 'all',
              priority: 30,
              enforce: true,
            },
            // UI component libraries
            ui: {
              name: 'ui-vendors',
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|class-variance-authority)[\\/]/,
              chunks: 'all',
              priority: 25,
              enforce: true,
            },
            // Database and auth libraries
            database: {
              name: 'database-vendors',
              test: /[\\/]node_modules[\\/](@prisma|prisma|zod|bcryptjs)[\\/]/,
              chunks: 'all',
              priority: 25,
              enforce: true,
            },
            // Date and utility libraries
            utils: {
              name: 'utils-vendors',
              test: /[\\/]node_modules[\\/](date-fns|lodash|nanoid)[\\/]/,
              chunks: 'all',
              priority: 25,
              enforce: true,
            },
            // Large vendor libraries
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
              minChunks: 1,
              maxSize: 200000,
            },
            common: {
              minChunks: 2,
              chunks: 'all',
              name: 'common',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    // Bundle size optimization
    if (process.env.NODE_ENV === 'production') {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      config.optimization.innerGraph = true;
      config.optimization.providedExports = true;

      // Tree shaking optimization
      config.optimization.minimize = true;
      config.optimization.concatenateModules = true;

      // Module resolution optimizations
      config.resolve.alias = {
        ...config.resolve.alias,
        // Remove heavy polyfills
        crypto: false,
        stream: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false,
        zlib: false,
      };
    }

    // Ignore heavy dependencies on client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);

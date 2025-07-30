// Performance optimization configuration

export const PERFORMANCE_CONFIG = {
  // Image optimization
  images: {
    quality: 75,
    formats: ['webp', 'avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },

  // Bundle optimization
  bundling: {
    // Maximum size for chunks
    maxChunkSize: 244000, // ~240KB
    minChunkSize: 20000, // ~20KB
    
    // Code splitting strategy
    splitChunks: {
      react: ['react', 'react-dom', 'next'],
      ui: ['@radix-ui', 'lucide-react', 'class-variance-authority'],
      utils: ['date-fns', 'lodash', 'nanoid'],
      database: ['@prisma/client', 'zod'],
    }
  },

  // Caching strategy
  caching: {
    // Static assets
    static: {
      maxAge: 31536000, // 1 year
      immutable: true,
    },
    
    // API responses
    api: {
      maxAge: 0,
      swr: 3600, // 1 hour stale-while-revalidate
      private: true,
    },
    
    // HTML pages
    pages: {
      maxAge: 0,
      swr: 86400, // 24 hours stale-while-revalidate
    }
  },

  // Resource hints
  resourceHints: {
    dnsPrefetch: [
      'https://fonts.googleapis.com',
      'https://accounts.google.com',
    ],
    preconnect: [
      { origin: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { origin: 'https://lh3.googleusercontent.com', crossOrigin: 'anonymous' },
    ],
    prefetch: [
      '/dashboard',
      '/trips',
      '/schengen',
    ]
  },

  // Performance budgets
  budgets: {
    // Size budgets (in KB)
    javascript: 300,
    css: 60,
    images: 500,
    fonts: 100,
    total: 1000,
    
    // Timing budgets (in ms)
    fcp: 1800, // First Contentful Paint
    lcp: 2500, // Largest Contentful Paint
    fid: 100,  // First Input Delay
    cls: 0.1,  // Cumulative Layout Shift
    ttfb: 600, // Time to First Byte
  },

  // Lazy loading configuration
  lazyLoading: {
    // Intersection Observer options
    threshold: 0.1,
    rootMargin: '50px',
    
    // Components to lazy load
    components: [
      'SchengenCalculator',
      'TravelStatsWidget',
      'YearView',
      'GmailIntegration',
    ]
  },

  // Critical CSS
  criticalCss: {
    inline: true,
    minify: true,
    extract: [
      'app/globals.css',
      'styles/mobile-touch.css',
    ]
  },

  // Service Worker
  serviceWorker: {
    // Cache strategies
    cacheStrategies: {
      static: 'CacheFirst',
      api: 'NetworkFirst',
      images: 'StaleWhileRevalidate',
    },
    
    // Precache patterns
    precache: [
      '/',
      '/dashboard',
      '/offline',
      '/manifest.json',
    ],
    
    // Runtime caching
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-stylesheets',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          }
        }
      }
    ]
  }
}

// Performance monitoring thresholds
export const PERFORMANCE_THRESHOLDS = {
  good: {
    fcp: 1000,
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    ttfb: 800,
  },
  needsImprovement: {
    fcp: 3000,
    lcp: 4000,
    fid: 300,
    cls: 0.25,
    ttfb: 1800,
  }
}

// Get performance rating
export function getPerformanceRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const good = PERFORMANCE_THRESHOLDS.good[metric as keyof typeof PERFORMANCE_THRESHOLDS.good]
  const needsImprovement = PERFORMANCE_THRESHOLDS.needsImprovement[metric as keyof typeof PERFORMANCE_THRESHOLDS.needsImprovement]
  
  if (value <= good) return 'good'
  if (value <= needsImprovement) return 'needs-improvement'
  return 'poor'
}
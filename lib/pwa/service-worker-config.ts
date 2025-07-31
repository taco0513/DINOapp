// PWA Service Worker Configuration
export const SW_CONFIG = {
  // Cache version management
  VERSION: '2.0.0',
  CACHE_NAMES: {
    STATIC: 'dino-static-v2.0.0',
    API: 'dino-api-v2.0.0',
    IMAGES: 'dino-images-v2.0.0',
    RUNTIME: 'dino-runtime-v2.0.0',
  },

  // Cache expiration times (in seconds)
  CACHE_EXPIRY: {
    API: 5 * 60, // 5 minutes for API responses
    IMAGES: 7 * 24 * 60 * 60, // 7 days for images
    STATIC: 30 * 24 * 60 * 60, // 30 days for static assets
  },

  // Files to pre-cache on install
  STATIC_CACHE_URLS: [
    '/',
    '/dashboard',
    '/trips',
    '/trips/new',
    '/visa',
    '/schengen',
    '/calendar',
    '/analytics',
    '/profile',
    '/settings',
    '/offline',
    '/manifest.json',
    '/favicon.ico',
  ],

  // API endpoints to cache
  API_CACHE_PATTERNS: [
    /^\/api\/trips/,
    /^\/api\/schengen/,
    /^\/api\/auth\/session/,
    /^\/api\/visa/,
    /^\/api\/analytics/,
    /^\/api\/profile/,
  ],

  // Assets to never cache
  CACHE_EXCLUSIONS: [
    /^\/api\/auth\/(signin|signout|callback)/,
    /^\/api\/gmail/,
    /^\/api\/upload/,
    /\.(mp4|webm|ogg)$/i, // Video files
    /chrome-extension:\/\//,
  ],

  // Network first patterns (always try network first)
  NETWORK_FIRST_PATTERNS: [
    /^\/api\/auth/,
    /^\/api\/trips\/(create|update|delete)/,
    /^\/api\/settings/,
    /^\/api\/notifications/,
  ],

  // Cache first patterns (prefer cache for performance)
  CACHE_FIRST_PATTERNS: [
    /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
    /\.(woff|woff2|ttf|otf)$/i,
    /\.(css|js)$/i,
    /^\/icons\//,
  ],

  // Background sync tags
  SYNC_TAGS: {
    TRIPS: 'sync-trips',
    SETTINGS: 'sync-settings',
    ANALYTICS: 'sync-analytics',
  },

  // Push notification settings
  NOTIFICATION_SETTINGS: {
    BADGE: '/icons/badge-72x72.png',
    ICON: '/icons/icon-192x192.png',
    VIBRATE_PATTERN: [100, 50, 100],
    ACTIONS: [
      { action: 'view', title: '확인하기' },
      { action: 'dismiss', title: '나중에' },
    ],
  },
};

// Helper functions for service worker
export const swHelpers = {
  // Check if request should be cached
  shouldCache(request: Request): boolean {
    const url = new URL(request.url);

    // Check exclusions
    for (const pattern of SW_CONFIG.CACHE_EXCLUSIONS) {
      if (pattern.test(url.pathname)) {
        return false;
      }
    }

    // Only cache GET requests
    return request.method === 'GET';
  },

  // Get cache strategy for request
  getCacheStrategy(
    request: Request
  ): 'network-first' | 'cache-first' | 'network-only' {
    const url = new URL(request.url);

    // Check network first patterns
    for (const pattern of SW_CONFIG.NETWORK_FIRST_PATTERNS) {
      if (pattern.test(url.pathname)) {
        return 'network-first';
      }
    }

    // Check cache first patterns
    for (const pattern of SW_CONFIG.CACHE_FIRST_PATTERNS) {
      if (pattern.test(url.pathname)) {
        return 'cache-first';
      }
    }

    // Default to network first for everything else
    return 'network-first';
  },

  // Get appropriate cache name for request
  getCacheName(request: Request): string {
    const url = new URL(request.url);

    // API requests
    if (url.pathname.startsWith('/api/')) {
      return SW_CONFIG.CACHE_NAMES.API;
    }

    // Images
    if (/\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname)) {
      return SW_CONFIG.CACHE_NAMES.IMAGES;
    }

    // Static assets
    if (/\.(css|js|woff|woff2|ttf|otf)$/i.test(url.pathname)) {
      return SW_CONFIG.CACHE_NAMES.STATIC;
    }

    // Everything else goes to runtime cache
    return SW_CONFIG.CACHE_NAMES.RUNTIME;
  },

  // Check if cached response is expired
  isCacheExpired(response: Response, cacheName: string): boolean {
    const cachedDate = response.headers.get('sw-cached-date');
    if (!cachedDate) return true;

    const age = (Date.now() - new Date(cachedDate).getTime()) / 1000;

    switch (cacheName) {
      case SW_CONFIG.CACHE_NAMES.API:
        return age > SW_CONFIG.CACHE_EXPIRY.API;
      case SW_CONFIG.CACHE_NAMES.IMAGES:
        return age > SW_CONFIG.CACHE_EXPIRY.IMAGES;
      case SW_CONFIG.CACHE_NAMES.STATIC:
        return age > SW_CONFIG.CACHE_EXPIRY.STATIC;
      default:
        return age > SW_CONFIG.CACHE_EXPIRY.API; // Default to API expiry
    }
  },

  // Add cache metadata to response
  addCacheMetadata(response: Response): Response {
    const headers = new Headers(response.headers);
    headers.set('sw-cached-date', new Date().toISOString());
    headers.set('sw-cache-version', SW_CONFIG.VERSION);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

// IndexedDB configuration for offline data
export const IDB_CONFIG = {
  DB_NAME: 'dino-offline-db',
  VERSION: 1,
  STORES: {
    TRIPS: 'trips',
    PENDING_SYNC: 'pending-sync',
    SETTINGS: 'settings',
    ANALYTICS: 'analytics',
  },
};

// Background sync queue configuration
export const SYNC_CONFIG = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000, // 5 seconds
  BATCH_SIZE: 10,
  SYNC_INTERVAL: 15 * 60 * 1000, // 15 minutes
};

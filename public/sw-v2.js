// DINO Service Worker v2.0.0 - Enhanced PWA functionality
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Configuration
const SW_VERSION = '2.0.0';
const CACHE_NAMES = {
  STATIC: `dino-static-v${SW_VERSION}`,
  API: `dino-api-v${SW_VERSION}`,
  IMAGES: `dino-images-v${SW_VERSION}`,
  RUNTIME: `dino-runtime-v${SW_VERSION}`
};

// Initialize Workbox
if (workbox) {
  console.log(`Workbox is loaded with v${SW_VERSION}`);
  workbox.setConfig({ debug: false });
} else {
  console.log('Workbox failed to load');
}

// Precaching static assets
workbox.precaching.precacheAndRoute([
  { url: '/', revision: SW_VERSION },
  { url: '/dashboard', revision: SW_VERSION },
  { url: '/trips', revision: SW_VERSION },
  { url: '/trips/new', revision: SW_VERSION },
  { url: '/visa', revision: SW_VERSION },
  { url: '/schengen', revision: SW_VERSION },
  { url: '/calendar', revision: SW_VERSION },
  { url: '/analytics', revision: SW_VERSION },
  { url: '/profile', revision: SW_VERSION },
  { url: '/settings', revision: SW_VERSION },
  { url: '/offline', revision: SW_VERSION },
  { url: '/manifest.json', revision: SW_VERSION }
]);

// Clean up old caches
workbox.precaching.cleanupOutdatedCaches();

// API Routes - Network First with Cache Fallback
workbox.routing.registerRoute(
  /^\/api\//,
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAMES.API,
    networkTimeoutSeconds: 5,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
        purgeOnQuotaError: true
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Images - Cache First
workbox.routing.registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_NAMES.IMAGES,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        purgeOnQuotaError: true
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Static Assets (JS, CSS, Fonts) - Stale While Revalidate
workbox.routing.registerRoute(
  /\.(?:js|css|woff|woff2|ttf|otf)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE_NAMES.STATIC,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// HTML Pages - Network First
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAMES.RUNTIME,
    networkTimeoutSeconds: 3,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Offline fallback
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline');
  }
  
  // Return offline API response for API requests
  if (event.request.url.includes('/api/')) {
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: '오프라인 상태입니다. 인터넷 연결을 확인해주세요.',
        cached: false
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      }
    );
  }
  
  return Response.error();
});

// Background Sync for offline actions
workbox.backgroundSync.Queue('dino-sync-queue', {
  maxRetentionTime: 24 * 60 // Retry for up to 24 hours
});

// Register sync for specific API endpoints
const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('dino-sync-queue', {
  maxRetentionTime: 24 * 60
});

// POST/PUT/DELETE requests - use background sync
workbox.routing.registerRoute(
  ({ url, request }) => {
    return url.pathname.startsWith('/api/') && 
           ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
  },
  new workbox.strategies.NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);

// Skip waiting and claim clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// Push Notifications
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'DINO 알림',
    body: '새로운 알림이 있습니다.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'dino-notification',
    requireInteraction: false,
    silent: false,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  try {
    if (event.data) {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    }
  } catch (error) {
    console.error('Error parsing push data:', error);
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      vibrate: notificationData.vibrate,
      requireInteraction: notificationData.requireInteraction,
      actions: [
        { action: 'view', title: '확인하기' },
        { action: 'dismiss', title: '나중에' }
      ]
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Check if there is already a window/tab open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then(() => {
              return client.navigate(urlToOpen);
            });
          }
        }
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Periodic Background Sync (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-trips') {
    console.log('Periodic sync: update-trips');
    event.waitUntil(updateTripsInBackground());
  }
});

async function updateTripsInBackground() {
  try {
    const response = await fetch('/api/trips/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log('Trips synced successfully');
      // Update local cache
      const cache = await caches.open(CACHE_NAMES.API);
      await cache.put('/api/trips', response.clone());
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Service Worker Update Handler
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    event.waitUntil(
      checkForUpdates().then(updateAvailable => {
        event.ports[0].postMessage({ updateAvailable });
      })
    );
  }
});

async function checkForUpdates() {
  try {
    const response = await fetch('/api/version');
    const data = await response.json();
    return data.version !== SW_VERSION;
  } catch (error) {
    console.error('Update check failed:', error);
    return false;
  }
}

console.log(`DINO Service Worker v${SW_VERSION} loaded successfully`);
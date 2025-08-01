import { logger } from '@/lib/logger'

// DINO Service Worker - PWA 오프라인 기능
const CACHE_NAME = 'dino-v1.0.0'
const API_CACHE_NAME = 'dino-api-v1.0.0'
const STATIC_CACHE_NAME = 'dino-static-v1.0.0'

// 캐시할 정적 파일들
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/trips',
  '/schengen',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// 캐시할 API 엔드포인트들 (오프라인 조회용)
const API_ENDPOINTS = [
  '/api/trips',
  '/api/schengen',
  '/api/auth/session'
]

// Service Worker 설치
self.addEventListener('install', (event) => {
  logger.info('Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      // 정적 파일 캐시
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        logger.info('Caching static files')
        return cache.addAll(STATIC_FILES)
      }),
      // 즉시 활성화
      self.skipWaiting()
    ])
  )
})

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  logger.info('Service Worker activating...')
  
  event.waitUntil(
    Promise.all([
      // 오래된 캐시 삭제
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME) {
              logger.debug('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // 모든 클라이언트 즉시 제어
      self.clients.claim()
    ])
  )
})

// Fetch 이벤트 처리 - 캐시 우선 전략
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API 요청 처리
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // 정적 파일 처리
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request))
    return
  }
})

// API 요청 처리 함수
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  try {
    // 네트워크 우선 시도
    const response = await fetch(request)
    
    // 성공한 GET 요청만 캐시
    if (request.method === 'GET' && response.ok) {
      const cache = await caches.open(API_CACHE_NAME)
      // Response clone 필요 (한 번만 사용 가능)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    logger.debug('Network failed, trying cache for:', url.pathname)
    
    // 네트워크 실패 시 캐시에서 조회
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // 캐시에도 없으면 오프라인 응답
    return handleOfflineApiResponse(url.pathname)
  }
}

// 정적 파일 요청 처리 함수
async function handleStaticRequest(request) {
  try {
    // 캐시에서 먼저 확인
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // 네트워크에서 가져오기
    const response = await fetch(request)
    
    // 성공하면 캐시에 저장
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    logger.debug('Network failed for static file:', request.url)
    
    // 오프라인 페이지 반환
    const offlineResponse = await caches.match('/offline')
    if (offlineResponse) {
      return offlineResponse
    }
    
    // 기본 오프라인 응답
    return new Response(
      '<html><body><h1>오프라인 상태</h1><p>인터넷 연결을 확인해주세요.</p></body></html>', 
      { headers: { 'Content-Type': 'text/html' } }
    )
  }
}

// 오프라인 API 응답 처리
function handleOfflineApiResponse(pathname) {
  const offlineData = {
    error: 'offline',
    message: '오프라인 상태입니다. 인터넷 연결을 확인해주세요.',
    pathname: pathname,
    timestamp: new Date().toISOString()
  }
  
  // 특정 API에 대한 오프라인 응답
  switch (pathname) {
    case '/api/trips':
      return new Response(JSON.stringify({
        ...offlineData,
        data: [],
        cached: true
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      })
      
    case '/api/schengen':
      return new Response(JSON.stringify({
        ...offlineData,
        data: {
          daysUsed: 0,
          daysRemaining: 90,
          nextReset: null
        },
        cached: true
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      })
      
    default:
      return new Response(JSON.stringify(offlineData), {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      })
  }
}

// 백그라운드 동기화 (향후 구현)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    logger.info('Background sync triggered')
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // 오프라인 중 저장된 데이터 동기화
  try {
    logger.info('Performing background sync...')
    // TODO: IndexedDB에서 대기 중인 데이터 가져와서 서버로 전송
  } catch (error) {
    logger.error('Background sync failed:', error)
  }
}

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  logger.info('[SW] Push notification received')

  if (!event.data) {
    logger.info('[SW] No data in push notification')
    return
  }

  try {
    const data = event.data.json()
    const { title, body, icon, badge, tag, data: notificationData } = data

    const options = {
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/icon-72x72.png',
      tag: tag || 'dino-notification',
      data: notificationData || {},
      vibrate: [200, 100, 200],
      requireInteraction: notificationData?.priority === 'high',
      actions: []
    }

    // Add actions based on notification type
    if (notificationData?.type === 'visa_expiry') {
      options.actions = [
        { action: 'view', title: '비자 보기' },
        { action: 'dismiss', title: '나중에' }
      ]
    } else if (notificationData?.type === 'overstay_warning') {
      options.actions = [
        { action: 'view', title: '경고 확인' },
        { action: 'plan', title: '출국 계획' }
      ]
    } else if (notificationData?.type === 'stay_reminder') {
      options.actions = [
        { action: 'record', title: '기록하기' },
        { action: 'dismiss', title: '건너뛰기' }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(title, options)
    )
  } catch (error) {
    logger.error('[SW] Error processing push notification:', error)
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('DINO 알림', {
        body: event.data.text(),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      })
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  logger.debug('[SW] Notification clicked:', event.action)
  event.notification.close()

  const data = event.notification.data || {}
  let targetUrl = '/dashboard'

  // Determine target URL based on action and notification type
  if (event.action === 'view') {
    switch (data.type) {
      case 'visa_expiry':
        targetUrl = `/my-visas/${data.visaId}`
        break
      case 'overstay_warning':
        targetUrl = '/overstay-warnings'
        break
      case 'stay_reminder':
        targetUrl = '/stay-tracking'
        break
      default:
        targetUrl = '/notifications'
    }
  } else if (event.action === 'plan') {
    targetUrl = '/trip-planning'
  } else if (event.action === 'record') {
    targetUrl = '/trips/new'
  } else if (!event.action) {
    // Default action when notification body is clicked
    if (data.url) {
      targetUrl = data.url
    } else if (data.type === 'visa_expiry') {
      targetUrl = '/my-visas'
    } else if (data.type === 'overstay_warning') {
      targetUrl = '/overstay-warnings'
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            data: {
              ...data,
              action: event.action,
              targetUrl
            }
          })
          return
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

logger.info('DINO Service Worker loaded successfully')
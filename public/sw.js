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
  console.log('Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      // 정적 파일 캐시
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching static files')
        return cache.addAll(STATIC_FILES)
      }),
      // 즉시 활성화
      self.skipWaiting()
    ])
  )
})

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    Promise.all([
      // 오래된 캐시 삭제
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
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
    console.log('Network failed, trying cache for:', url.pathname)
    
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
    console.log('Network failed for static file:', request.url)
    
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
    console.log('Background sync triggered')
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // 오프라인 중 저장된 데이터 동기화
  try {
    console.log('Performing background sync...')
    // TODO: IndexedDB에서 대기 중인 데이터 가져와서 서버로 전송
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// 푸시 알림 처리 (향후 구현)
self.addEventListener('push', (event) => {
  console.log('Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icons/xmark.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('DINO 알림', options)
  )
})

console.log('DINO Service Worker loaded successfully')
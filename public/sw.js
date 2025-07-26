const CACHE_NAME = 'dino-v1';
const STATIC_CACHE_NAME = 'dino-static-v1';
const DYNAMIC_CACHE_NAME = 'dino-dynamic-v1';

// 캐시할 정적 자산들
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/trips',
  '/schengen',
  '/calendar',
  '/manifest.json',
  '/favicon.ico'
];

// 캐시할 API 경로들 (오프라인에서 사용할 데이터)
const API_CACHE_PATTERNS = [
  '/api/trips',
  '/api/schengen',
  '/api/countries'
];

// 캐시하지 않을 경로들
const EXCLUDED_PATHS = [
  '/api/auth',
  '/api/gmail',
  '/api/calendar'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 인터셉트
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 제외된 경로는 캐시하지 않음
  if (EXCLUDED_PATHS.some(path => url.pathname.startsWith(path))) {
    return;
  }
  
  // GET 요청만 캐시
  if (request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // 캐시된 응답이 있으면 반환
        if (cachedResponse) {
          // 백그라운드에서 네트워크 업데이트 시도
          updateCache(request);
          return cachedResponse;
        }
        
        // 캐시된 응답이 없으면 네트워크에서 가져오기
        return fetch(request)
          .then((networkResponse) => {
            // 성공적인 응답인 경우 캐시에 저장
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone();
              cacheResponse(request, responseClone);
            }
            return networkResponse;
          })
          .catch(() => {
            // 네트워크 실패 시 오프라인 페이지 반환
            if (request.destination === 'document') {
              return getOfflinePage();
            }
            
            // API 요청 실패 시 기본 응답 반환
            if (url.pathname.startsWith('/api/')) {
              return getOfflineApiResponse(url.pathname);
            }
            
            throw error;
          });
      })
  );
});

// 백그라운드에서 캐시 업데이트
function updateCache(request) {
  fetch(request)
    .then((response) => {
      if (response.ok) {
        const responseClone = response.clone();
        cacheResponse(request, responseClone);
      }
    })
    .catch(() => {
      // 네트워크 업데이트 실패는 무시
    });
}

// 응답 캐시하기
function cacheResponse(request, response) {
  const url = new URL(request.url);
  
  // 정적 자산인지 API 요청인지 확인
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname === '/') {
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => cache.put(request, response));
  } else if (API_CACHE_PATTERNS.some(pattern => 
             url.pathname.startsWith(pattern))) {
    caches.open(DYNAMIC_CACHE_NAME)
      .then((cache) => cache.put(request, response));
  } else if (url.pathname.startsWith('/')) {
    // 페이지 요청
    caches.open(DYNAMIC_CACHE_NAME)
      .then((cache) => cache.put(request, response));
  }
}

// 오프라인 페이지 반환
function getOfflinePage() {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>DINO - 오프라인</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          margin: 0;
          padding: 40px 20px;
          background: #ffffff;
          text-align: center;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          max-width: 400px;
          margin: 0 auto;
        }
        h1 { color: #000; margin-bottom: 20px; }
        p { color: #666; margin-bottom: 30px; line-height: 1.6; }
        button {
          padding: 12px 30px;
          background: #000;
          color: #fff;
          border: none;
          font-size: 14px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌐 오프라인 모드</h1>
        <p>현재 인터넷에 연결되어 있지 않습니다. 캐시된 데이터를 사용하여 기본 기능을 이용할 수 있습니다.</p>
        <button onclick="window.location.reload()">다시 시도</button>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// 오프라인 API 응답 반환
function getOfflineApiResponse(pathname) {
  let data = {};
  
  if (pathname.startsWith('/api/trips')) {
    data = {
      success: false,
      message: '오프라인 상태입니다. 캐시된 데이터를 확인해주세요.',
      data: []
    };
  } else if (pathname.startsWith('/api/schengen')) {
    data = {
      success: false,
      message: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.',
      data: null
    };
  } else {
    data = {
      success: false,
      message: '오프라인 상태입니다.',
      data: null
    };
  }
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// 백그라운드 동기화 (향후 구현용)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 오프라인 중 저장된 데이터 동기화
      syncOfflineData()
    );
  }
});

async function syncOfflineData() {
  // 향후 오프라인 중 작성된 데이터 동기화 로직 구현
  console.log('Background sync triggered');
}
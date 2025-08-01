# 📱 Mobile Native Experience - 네이티브 모바일 경험 구현

## 📋 개요

웹 기술로 네이티브 모바일 앱과 동일한 사용자 경험을 제공합니다. PWA, 네이티브 제스처, 하드웨어 기능 활용, 오프라인 지원을 통해 모바일 사용자에게 어플 스토어에서 다운로드한 앱과 구별되지 않는 경험을 제공합니다.

## 🎯 핵심 목표

1. **App-like Experience**: 네이티브 앱 수준의 UX
2. **Hardware Integration**: 디바이스 하드웨어 활용
3. **Offline First**: 오프라인 우선 설계
4. **Platform Integration**: OS 기능과 완벽 통합
5. **Performance Parity**: 네이티브 앱 수준 성능

## 🏗️ 모바일 네이티브 아키텍처

```typescript
interface MobileNativeExperience {
  // PWA 기능
  pwa: {
    manifest: WebAppManifest;
    serviceWorker: ServiceWorkerManager;
    installPrompt: InstallPromptManager;
    updates: UpdateManager;
  };

  // 네이티브 인터랙션
  native: {
    gestures: GestureHandler;
    haptics: HapticsController;
    camera: CameraAPI;
    geolocation: LocationAPI;
  };

  // 플랫폼 통합
  platform: {
    ios: IOSIntegration;
    android: AndroidIntegration;
    sharing: NativeSharing;
    notifications: PushNotifications;
  };
}
```

## 🚀 PWA (Progressive Web App) 구현

### 1. 웹 앱 매니페스트

```typescript
// public/manifest.json
interface WebAppManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  theme_color: string;
  background_color: string;
  icons: ManifestIcon[];
  shortcuts?: AppShortcut[];
  categories?: string[];
}

const manifest: WebAppManifest = {
  name: '모바일 네이티브 앱',
  short_name: '네이티브앱',
  description: '웹 기술로 만든 네이티브 모바일 경험',
  start_url: '/',
  display: 'standalone',
  orientation: 'portrait',
  theme_color: '#007AFF',
  background_color: '#FFFFFF',

  // 다양한 해상도 아이콘
  icons: [
    {
      src: '/icons/icon-72x72.png',
      sizes: '72x72',
      type: 'image/png',
      purpose: 'maskable any',
    },
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable any',
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable any',
    },
  ],

  // 앱 바로가기
  shortcuts: [
    {
      name: '새 노트',
      short_name: '노트',
      description: '새 노트 작성',
      url: '/new-note',
      icons: [{ src: '/icons/note.png', sizes: '96x96' }],
    },
    {
      name: '설정',
      short_name: '설정',
      description: '앱 설정',
      url: '/settings',
      icons: [{ src: '/icons/settings.png', sizes: '96x96' }],
    },
  ],

  categories: ['productivity', 'utilities'],
};
```

### 2. 서비스 워커 구현

```typescript
// sw.ts
class AdvancedServiceWorker {
  private static CACHE_NAME = 'mobile-native-v1';
  private static OFFLINE_URL = '/offline';

  // 설치 이벤트
  static install(event: ExtendableEvent): void {
    event.waitUntil(
      caches.open(this.CACHE_NAME).then(cache => {
        return cache.addAll([
          '/',
          '/offline',
          '/static/js/bundle.js',
          '/static/css/main.css',
          '/manifest.json',
        ]);
      })
    );
  }

  // 네트워크 인터셉
  static fetch(event: FetchEvent): void {
    // HTML 요청 처리
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => caches.match(this.OFFLINE_URL))
      );
      return;
    }

    // API 요청 처리
    if (event.request.url.includes('/api/')) {
      event.respondWith(this.handleAPIRequest(event.request));
      return;
    }

    // 정적 자산 처리
    event.respondWith(
      caches
        .match(event.request)
        .then(response => response || fetch(event.request))
    );
  }

  // API 요청 오프라인 처리
  private static async handleAPIRequest(request: Request): Promise<Response> {
    try {
      const response = await fetch(request);

      // 성공적인 GET 요청은 캐시
      if (request.method === 'GET' && response.ok) {
        const cache = await caches.open(this.CACHE_NAME);
        cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      // 오프라인일 때 캐시된 데이터 반환
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // 오프라인 답변
      return new Response(
        JSON.stringify({
          error: 'offline',
          message: '오프라인 상태입니다',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
}

// 서비스 워커 등록
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(registration => {
      console.log('SW registered: ', registration);
    })
    .catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
}
```

### 3. 앱 설치 프롬프트

```typescript
class InstallPromptManager {
  private deferredPrompt: any;
  private installButton: HTMLElement | null = null;

  constructor() {
    this.setupInstallPrompt();
  }

  private setupInstallPrompt(): void {
    // beforeinstallprompt 이벤트 대기
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // 설치 완료 시
    window.addEventListener('appinstalled', () => {
      console.log('앱이 설치되었습니다');
      this.hideInstallButton();
      this.trackInstallation();
    });
  }

  // 설치 버튼 표시
  private showInstallButton(): void {
    this.installButton = document.createElement('button');
    this.installButton.textContent = '홈 화면에 추가';
    this.installButton.className = 'install-button';

    this.installButton.addEventListener('click', () => {
      this.promptInstall();
    });

    // 전략적 위치에 배치
    const header = document.querySelector('header');
    if (header) {
      header.appendChild(this.installButton);
    }
  }

  // 설치 프롬프트 표시
  private async promptInstall(): Promise<void> {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();

    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // 분석 데이터 전송
    this.trackPromptResponse(outcome);

    this.deferredPrompt = null;
    this.hideInstallButton();
  }

  // 사용자 반응 추적
  private trackPromptResponse(outcome: string): void {
    // 분석 도구로 전송
    if (typeof gtag === 'function') {
      gtag('event', 'pwa_install_prompt', {
        outcome,
        timestamp: Date.now(),
      });
    }
  }
}
```

## 🤲 네이티브 제스처 및 인터랙션

### 1. 터치 제스처 처리

```typescript
class NativeGestureHandler {
  private element: HTMLElement;
  private hammer: HammerManager;

  constructor(element: HTMLElement) {
    this.element = element;
    this.hammer = new Hammer(element);
    this.setupGestures();
  }

  private setupGestures(): void {
    // 스와이프 제스처
    this.hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

    // 핀치 제스처
    this.hammer.get('pinch').set({ enable: true });

    // 로테이션 제스처
    this.hammer.get('rotate').set({ enable: true });

    // 이벤트 리스너 등록
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // 스와이프 이벤트
    this.hammer.on('swipeleft', () => this.onSwipeLeft());
    this.hammer.on('swiperight', () => this.onSwipeRight());
    this.hammer.on('swipeup', () => this.onSwipeUp());
    this.hammer.on('swipedown', () => this.onSwipeDown());

    // 핀치 이벤트
    this.hammer.on('pinchstart', e => this.onPinchStart(e));
    this.hammer.on('pinchmove', e => this.onPinchMove(e));
    this.hammer.on('pinchend', e => this.onPinchEnd(e));

    // 로테이션 이벤트
    this.hammer.on('rotatestart', e => this.onRotateStart(e));
    this.hammer.on('rotatemove', e => this.onRotateMove(e));
    this.hammer.on('rotateend', e => this.onRotateEnd(e));
  }

  private onSwipeLeft(): void {
    // 좌측 스와이프 - 다음 페이지/아이템
    this.triggerHapticFeedback('light');
    this.element.dispatchEvent(
      new CustomEvent('native:swipe', {
        detail: { direction: 'left' },
      })
    );
  }

  private onPinchMove(event: HammerInput): void {
    // 줄 확대/축소
    const scale = event.scale;
    this.element.style.transform = `scale(${scale})`;

    // 진동 피드백
    if (scale > 1.5) {
      this.triggerHapticFeedback('medium');
    }
  }

  // 했틱 피드백
  private triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy'): void {
    if (navigator.vibrate) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50,
      };
      navigator.vibrate(patterns[intensity]);
    }
  }
}
```

### 2. 디바이스 하드웨어 활용

```typescript
class DeviceHardwareAPI {
  // 카메라 접근
  async openCamera(options: CameraOptions = {}): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: options.facing || 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      throw new Error(`카메라 접근 실패: ${error.message}`);
    }
  }

  // 사진 촬영
  capturePhoto(stream: MediaStream): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;

      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // 프레임 캐처
        context.drawImage(video, 0, 0);

        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('사진 촬영 실패'));
            }
          },
          'image/jpeg',
          0.9
        );
      };
    });
  }

  // 위치 정보 가져오기
  async getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('위치 서비스가 지원되지 않습니다'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });
    });
  }

  // 디바이스 모션 감지
  startMotionDetection(): void {
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', event => {
        const acceleration = event.acceleration;
        if (acceleration) {
          const movement = Math.sqrt(
            acceleration.x! ** 2 + acceleration.y! ** 2 + acceleration.z! ** 2
          );

          // 흔들림 감지 (예: 흥들기 제스처)
          if (movement > 15) {
            this.onShakeDetected();
          }
        }
      });
    }
  }

  private onShakeDetected(): void {
    // 흔들림 액션 (예: 실행 취소, 새로고침)
    document.dispatchEvent(new CustomEvent('device:shake'));
  }
}
```

## 🔔 푸시 알림 시스템

### 1. 웹 푸시 알림

```typescript
class WebPushNotificationManager {
  private vapidPublicKey: string;
  private subscription: PushSubscription | null = null;

  constructor(vapidPublicKey: string) {
    this.vapidPublicKey = vapidPublicKey;
  }

  // 알림 권한 요청
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('이 브라우저는 알림을 지원하지 않습니다');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // 푸시 구독
  async subscribe(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('푸시 메시징이 지원되지 않습니다');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      // 서버에 구독 정보 전송
      await this.sendSubscriptionToServer(this.subscription);

      return this.subscription;
    } catch (error) {
      console.error('푸시 구독 실패:', error);
      return null;
    }
  }

  // 로컬 알림 표시
  showLocalNotification(
    title: string,
    options: NotificationOptions = {}
  ): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        ...options,
      });

      // 클릭 이벤트
      notification.onclick = () => {
        window.focus();
        notification.close();

        // 알림 관련 액션
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
      };
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}
```

### 2. 네이티브 공유 API

```typescript
class NativeSharing {
  // 네이티브 공유
  async shareContent(data: ShareData): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.log('공유 실패:', error);
        return false;
      }
    } else {
      // 폴백: 클립보드 또는 소셜 미디어 공유
      return this.fallbackShare(data);
    }
  }

  // 파일 공유
  async shareFile(file: File): Promise<boolean> {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: file.name,
          text: '파일 공유',
        });
        return true;
      } catch (error) {
        console.log('파일 공유 실패:', error);
        return false;
      }
    }

    return false;
  }

  // 폴백 공유 옵션
  private fallbackShare(data: ShareData): boolean {
    // 클립보드에 URL 복사
    if (data.url && navigator.clipboard) {
      navigator.clipboard.writeText(data.url).then(() => {
        this.showShareToast('링크가 복사되었습니다');
      });
      return true;
    }

    return false;
  }

  private showShareToast(message: string): void {
    // 토스트 메시지 표시
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'share-toast';
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }
}
```

## 📵 오프라인 우선 설계

### 1. 데이터 동기화 전략

```typescript
class OfflineDataManager {
  private db: IDBDatabase | null = null;
  private syncQueue: SyncOperation[] = [];

  // IndexedDB 초기화
  async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineApp', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 데이터 저장소 생성
        if (!db.objectStoreNames.contains('data')) {
          const store = db.createObjectStore('data', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }

        // 동기화 대기열 저장소
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { autoIncrement: true });
        }
      };
    });
  }

  // 데이터 저장 (오프라인)
  async saveData(data: any): Promise<void> {
    if (!this.db) await this.initializeDB();

    const transaction = this.db!.transaction(['data'], 'readwrite');
    const store = transaction.objectStore('data');

    const record = {
      ...data,
      id: data.id || this.generateId(),
      timestamp: Date.now(),
      synced: false,
    };

    await store.put(record);

    // 동기화 대기열에 추가
    this.addToSyncQueue({
      type: 'create',
      data: record,
      timestamp: Date.now(),
    });
  }

  // 온라인 상태에서 동기화
  async syncWhenOnline(): Promise<void> {
    if (!navigator.onLine) return;

    const pendingOperations = await this.getSyncQueue();

    for (const operation of pendingOperations) {
      try {
        await this.performSync(operation);
        await this.removeSyncOperation(operation.id);
      } catch (error) {
        console.error('동기화 실패:', error);
        // 실패 시 재시도 로직
        this.scheduleRetry(operation);
      }
    }
  }

  // 백그라운드 동기화
  registerBackgroundSync(): void {
    if (
      'serviceWorker' in navigator &&
      'sync' in window.ServiceWorkerRegistration.prototype
    ) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('background-sync');
      });
    }
  }
}
```

### 2. 네트워크 상태 관리

```typescript
class NetworkStatusManager {
  private isOnline: boolean = navigator.onLine;
  private callbacks: Map<string, (online: boolean) => void> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyStatusChange(true);
      this.showConnectionToast('인터넷에 연결되었습니다');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyStatusChange(false);
      this.showConnectionToast('오프라인 모드입니다');
    });
  }

  // 연결 상태 확인
  async checkConnectivity(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    try {
      const response = await fetch('/api/ping', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // 상태 변경 콜백 등록
  onStatusChange(id: string, callback: (online: boolean) => void): void {
    this.callbacks.set(id, callback);
  }

  private notifyStatusChange(online: boolean): void {
    this.callbacks.forEach(callback => callback(online));
  }

  private showConnectionToast(message: string): void {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = `connection-toast ${this.isOnline ? 'online' : 'offline'}`;
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }
}
```

## 🎯 Best Practices

### 1. 모바일 디자인 원칙

```typescript
const MOBILE_DESIGN_PRINCIPLES = {
  // 터치 친화적 인터페이스
  touch: {
    minTouchTarget: 44, // px (iOS HIG)
    spacing: 8, // px
    gestureSupport: true,
    hapticFeedback: true,
  },

  // 성능 최적화
  performance: {
    lazyLoading: true,
    imageOptimization: true,
    codesplitting: true,
    offlineFirst: true,
  },

  // 접근성
  accessibility: {
    voiceOver: true,
    highContrast: true,
    largeText: true,
    reducedMotion: true,
  },
};
```

### 2. 성공 메트릭

```typescript
const MOBILE_SUCCESS_METRICS = {
  // 사용자 참여
  engagement: {
    installRate: 15, // %
    retentionRate: 60, // % (7일)
    sessionDuration: 180, // seconds
    offlineUsage: 30, // %
  },

  // 기술 성능
  technical: {
    loadTime: 2, // seconds
    offlineCapability: 90, // %
    crashRate: 0.1, // %
    batteryEfficiency: 'good',
  },

  // 비즈니스 영향
  business: {
    conversionIncrease: 25, // %
    customerSatisfaction: 4.7,
    appStoreRating: 4.5,
  },
};
```

---

_Mobile Native Experience: 웹에서 네이티브로, 한계를 넘나서는 경험_

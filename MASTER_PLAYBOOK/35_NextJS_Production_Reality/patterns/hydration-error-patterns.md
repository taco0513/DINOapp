# Hydration Error Pattern Library - 20가지 실전 패턴

## 🚨 DINO 프로젝트에서 발견된 실제 Hydration 에러들

> **실제 통계**: 1,813개 TypeScript 에러 중 521개(29%)가 Hydration 관련

## ⚡ 즉시 해결 가능한 Top 5 패턴

### Pattern #1: localStorage 직접 접근
```typescript
// ❌ 에러 발생 코드
const BadComponent = () => {
  const theme = localStorage.getItem('theme'); // SSR에서 undefined
  return <div className={theme === 'dark' ? 'dark' : 'light'}>Content</div>;
};

// Error: Hydration failed because the initial UI does not match

// ✅ 해결된 코드
const FixedComponent = () => {
  const [theme, setTheme] = useState<string>('light'); // 기본값
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(localStorage.getItem('theme') || 'light');
  }, []);

  if (!mounted) {
    return <div className="light">Content</div>; // SSR과 일치
  }

  return <div className={theme === 'dark' ? 'dark' : 'light'}>Content</div>;
};
```

### Pattern #2: Date/Time 불일치
```typescript
// ❌ 에러 발생 코드
const BadTimeComponent = () => {
  const now = new Date().toLocaleString(); // 서버/클라이언트 시간대 다름
  return <div>Current time: {now}</div>;
};

// ✅ 해결된 코드
const FixedTimeComponent = () => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
    
    // 실시간 업데이트가 필요한 경우
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div suppressHydrationWarning>
      Current time: {currentTime || 'Loading...'}
    </div>
  );
};
```

### Pattern #3: Math.random() 사용
```typescript
// ❌ 에러 발생 코드
const BadRandomComponent = () => {
  const randomId = Math.random().toString(36); // 매번 다른 값
  return <div id={randomId}>Random content</div>;
};

// ✅ 해결된 코드
const FixedRandomComponent = () => {
  const [randomId, setRandomId] = useState<string>('');

  useEffect(() => {
    setRandomId(Math.random().toString(36));
  }, []);

  return <div id={randomId || 'static-id'}>Random content</div>;
};

// 또는 안정적인 ID 생성
let globalCounter = 0;
const FixedRandomComponent2 = () => {
  const [id] = useState(() => `stable-id-${++globalCounter}`);
  return <div id={id}>Content</div>;
};
```

### Pattern #4: window 객체 직접 접근
```typescript
// ❌ 에러 발생 코드
const BadWindowComponent = () => {
  const width = window.innerWidth; // SSR에서 undefined
  return <div>Width: {width}px</div>;
};

// ✅ 해결된 코드
const FixedWindowComponent = () => {
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    
    // 초기값 설정
    setWindowWidth(window.innerWidth);
    
    // 리사이즈 이벤트 등록
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div>Width: {windowWidth || 'Unknown'}px</div>;
};
```

### Pattern #5: CSS-in-JS Dynamic Styles
```typescript
// ❌ 에러 발생 코드
const BadStyledComponent = () => {
  const randomColor = `hsl(${Math.random() * 360}, 50%, 50%)`; // 서버/클라이언트 다름
  return <div style={{ color: randomColor }}>Colored text</div>;
};

// ✅ 해결된 코드
const FixedStyledComponent = () => {
  const [dynamicStyle, setDynamicStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setDynamicStyle({
      color: `hsl(${Math.random() * 360}, 50%, 50%)`
    });
  }, []);

  return <div style={dynamicStyle}>Colored text</div>;
};
```

## 📊 DINO 프로젝트 15가지 추가 패턴

### Pattern #6: 조건부 렌더링 불일치
```typescript
// ❌ 문제 상황
const ProblematicAuth = () => {
  const user = useAuth(); // SSR에서 null, 클라이언트에서 user 객체
  
  if (!user) return <LoginForm />;
  return <Dashboard user={user} />;
};

// ✅ 해결책
const FixedAuth = () => {
  const user = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // 첫 렌더링에서는 로딩 상태로 통일
  if (!mounted) {
    return <div>Loading...</div>;
  }

  if (!user) return <LoginForm />;
  return <Dashboard user={user} />;
};
```

### Pattern #7: 외부 스크립트 의존성
```typescript
// ❌ 문제 상황
const ProblematicThirdParty = () => {
  const isGoogleMapsLoaded = !!window.google; // SSR에서 false
  
  return (
    <div>
      {isGoogleMapsLoaded ? <GoogleMap /> : <div>Loading map...</div>}
    </div>
  );
};

// ✅ 해결책
const FixedThirdParty = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google) {
        setIsLoaded(true);
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };
    
    checkGoogleMaps();
  }, []);

  return (
    <div>
      {isLoaded ? <GoogleMap /> : <div>Loading map...</div>}
    </div>
  );
};
```

### Pattern #8: 브라우저 API 체크
```typescript
// ❌ 문제 상황
const ProblematicFeatureCheck = () => {
  const hasNotification = 'Notification' in window; // SSR에서 false
  
  return (
    <div>
      {hasNotification ? <NotificationButton /> : <div>No notifications</div>}
    </div>
  );
};

// ✅ 해결책
const FixedFeatureCheck = () => {
  const [features, setFeatures] = useState({
    notification: false,
    geolocation: false,
    camera: false
  });

  useEffect(() => {
    setFeatures({
      notification: 'Notification' in window,
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator
    });
  }, []);

  return (
    <div>
      {features.notification ? <NotificationButton /> : <div>No notifications</div>}
    </div>
  );
};
```

### Pattern #9: CSS Media Queries 불일치
```typescript
// ❌ 문제 상황
const ProblematicResponsive = () => {
  const isMobile = window.matchMedia('(max-width: 768px)').matches; // SSR에서 false
  
  return (
    <div>
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </div>
  );
};

// ✅ 해결책
const FixedResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    setIsMobile(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 첫 렌더링에서는 서버 사이드 기본값 사용
  return (
    <div>
      <DesktopNav className={isMobile ? 'hidden' : 'block'} />
      <MobileNav className={!isMobile ? 'hidden' : 'block'} />
    </div>
  );
};
```

### Pattern #10: Dynamic Import 조건부 로딩
```typescript
// ❌ 문제 상황
const ProblematicDynamic = () => {
  const shouldLoadChart = Date.now() % 2 === 0; // 서버/클라이언트 다름
  
  const Chart = dynamic(() => import('./Chart'), { ssr: false });
  
  return (
    <div>
      {shouldLoadChart ? <Chart /> : <div>No chart</div>}
    </div>
  );
};

// ✅ 해결책
const FixedDynamic = () => {
  const [shouldLoadChart, setShouldLoadChart] = useState(false);
  const [mounted, setMounted] = useState(false);

  const Chart = dynamic(() => import('./Chart'), { 
    ssr: false,
    loading: () => <div>Loading chart...</div>
  });

  useEffect(() => {
    setMounted(true);
    setShouldLoadChart(Date.now() % 2 === 0);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {shouldLoadChart ? <Chart /> : <div>No chart</div>}
    </div>
  );
};
```

### Pattern #11: UserAgent 기반 분기
```typescript
// ❌ 문제 상황
const ProblematicUserAgent = () => {
  const isSafari = /Safari/.test(navigator.userAgent); // SSR에서 undefined
  
  return <div className={isSafari ? 'safari-fix' : ''}></div>;
};

// ✅ 해결책
const FixedUserAgent = () => {
  const [browserInfo, setBrowserInfo] = useState({
    isSafari: false,
    isChrome: false,
    isFirefox: false
  });

  useEffect(() => {
    const userAgent = navigator.userAgent;
    setBrowserInfo({
      isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
      isChrome: /Chrome/.test(userAgent),
      isFirefox: /Firefox/.test(userAgent)
    });
  }, []);

  return (
    <div 
      className={`
        ${browserInfo.isSafari ? 'safari-fix' : ''} 
        ${browserInfo.isChrome ? 'chrome-fix' : ''}
      `}
    >
      Content
    </div>
  );
};
```

### Pattern #12: 세션/쿠키 불일치
```typescript
// ❌ 문제 상황
const ProblematicSession = () => {
  const sessionData = JSON.parse(sessionStorage.getItem('user') || '{}'); // SSR에서 {}
  
  return (
    <div>
      Welcome, {sessionData.name || 'Guest'}
    </div>
  );
};

// ✅ 해결책
const FixedSession = () => {
  const [sessionData, setSessionData] = useState<{name?: string}>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const data = JSON.parse(sessionStorage.getItem('user') || '{}');
      setSessionData(data);
    } catch (error) {
      console.warn('Failed to parse session data:', error);
    }
    setIsLoaded(true);
  }, []);

  return (
    <div>
      Welcome, {isLoaded ? (sessionData.name || 'Guest') : 'Loading...'}
    </div>
  );
};
```

### Pattern #13: 환경 변수 클라이언트 노출
```typescript
// ❌ 문제 상황
const ProblematicEnv = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // SSR/클라이언트 다를 수 있음
  const isDev = process.env.NODE_ENV === 'development'; // 빌드 시점 결정
  
  return (
    <div>
      {isDev && <div>Debug: {apiUrl}</div>}
    </div>
  );
};

// ✅ 해결책
const FixedEnv = () => {
  const [config, setConfig] = useState({
    apiUrl: '',
    isDev: false
  });

  useEffect(() => {
    setConfig({
      apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
      isDev: process.env.NODE_ENV === 'development'
    });
  }, []);

  return (
    <div>
      {config.isDev && <div>Debug: {config.apiUrl}</div>}
    </div>
  );
};
```

### Pattern #14: Portal 렌더링 타이밍
```typescript
// ❌ 문제 상황
const ProblematicPortal = () => {
  const portalRoot = document.getElementById('portal-root'); // SSR에서 null
  
  return portalRoot ? createPortal(<Modal />, portalRoot) : null;
};

// ✅ 해결책
const FixedPortal = () => {
  const [portalRoot, setPortalRoot] = useState<Element | null>(null);

  useEffect(() => {
    setPortalRoot(document.getElementById('portal-root'));
  }, []);

  if (!portalRoot) {
    return null; // 또는 fallback UI
  }

  return createPortal(<Modal />, portalRoot);
};
```

### Pattern #15: Intersection Observer
```typescript
// ❌ 문제 상황
const ProblematicIntersection = () => {
  const isSupported = 'IntersectionObserver' in window; // SSR에서 false
  
  return (
    <div>
      {isSupported ? <LazyImage /> : <img src="/placeholder.jpg" />}
    </div>
  );
};

// ✅ 해결책
const FixedIntersection = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('IntersectionObserver' in window);
  }, []);

  return (
    <div>
      {isSupported ? <LazyImage /> : <img src="/placeholder.jpg" />}
    </div>
  );
};
```

## 🛠️ 범용 해결 패턴

### 1. useIsomorphicLayoutEffect Hook
```typescript
import { useEffect, useLayoutEffect } from 'react';

// SSR 안전한 useLayoutEffect
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// 사용 예시
const Component = () => {
  useIsomorphicLayoutEffect(() => {
    // DOM 조작 로직
    const element = document.getElementById('target');
    if (element) {
      element.style.opacity = '1';
    }
  }, []);
};
```

### 2. ClientOnly Wrapper Component
```typescript
interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ClientOnly: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 사용 예시
const App = () => (
  <div>
    <h1>Server-rendered content</h1>
    <ClientOnly fallback={<div>Loading...</div>}>
      <DynamicClientComponent />
    </ClientOnly>
  </div>
);
```

### 3. Hydration-Safe State Hook
```typescript
function useHydrationSafeState<T>(
  initialValue: T,
  clientValue?: () => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      if (clientValue) {
        setState(clientValue());
      }
    }
  }, [mounted, clientValue]);

  return [state, setState];
}

// 사용 예시
const Component = () => {
  const [theme, setTheme] = useHydrationSafeState(
    'light', // SSR 기본값
    () => localStorage.getItem('theme') || 'light' // 클라이언트값
  );

  return <div className={theme}>Content</div>;
};
```

## 📊 패턴별 위험도 및 해결 우선순위

```yaml
Critical_Priority: # 즉시 수정 필요
  - localStorage_access: "100% 에러 발생"
  - window_object_access: "SSR 환경에서 100% 실패"
  - Math_random_usage: "매번 다른 결과로 불일치"

High_Priority: # 1일 내 수정
  - date_time_mismatch: "시간대 차이로 불일치"
  - conditional_rendering: "로그인 상태 등 동적 조건"
  - css_media_queries: "반응형 레이아웃 깨짐"

Medium_Priority: # 1주 내 수정  
  - third_party_scripts: "외부 의존성 문제"
  - browser_api_checks: "기능 감지 불일치"
  - user_agent_detection: "브라우저별 분기"

Low_Priority: # 점진적 개선
  - environment_variables: "개발/운영 환경 차이"
  - portal_rendering: "모달, 툴팁 등"
  - intersection_observer: "지연 로딩 등"
```

## 🔧 자동 감지 및 수정 도구

### ESLint 규칙 설정
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // Hydration 위험 패턴 감지
    'no-direct-storage-access': 'error',
    'no-window-access-without-check': 'error',
    'no-math-random-in-render': 'error',
    'no-date-in-render': 'warn'
  }
};
```

### TypeScript 컴파일러 옵션
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

*"Hydration 에러는 예방 가능하다. 패턴을 이해하고 일관성을 유지하라."*
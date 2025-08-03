# Next.js Hydration 완전 정복 가이드

## 🔍 Hydration 에러의 본질

Hydration은 서버에서 렌더링된 HTML에 클라이언트 JavaScript가 이벤트를 연결하는 과정입니다. 서버와 클라이언트의 렌더링 결과가 다르면 에러가 발생합니다.

## 🪤 실전에서 겪은 10가지 함정

### 1. Window/Document 객체 직접 참조
```tsx
// ❌ 문제 코드 - CupNote에서 실제 발생
const ThemeToggle = () => {
  const isDark = window.localStorage.getItem('theme') === 'dark';
  return <button>{isDark ? '🌙' : '☀️'}</button>;
};

// ✅ 해결 방법 1: useEffect 사용
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    setIsDark(window.localStorage.getItem('theme') === 'dark');
  }, []);
  
  return <button>{isDark ? '🌙' : '☀️'}</button>;
};

// ✅ 해결 방법 2: Dynamic Import
const ThemeToggle = dynamic(() => import('./ThemeToggle'), {
  ssr: false,
  loading: () => <button>🌓</button>
});
```

### 2. Date/Time 렌더링 문제
```tsx
// ❌ 문제 코드 - 서버와 클라이언트 시간차
const TimeDisplay = () => {
  return <div>현재 시간: {new Date().toLocaleTimeString()}</div>;
};

// ✅ 해결 방법 1: suppressHydrationWarning
const TimeDisplay = () => {
  return (
    <div suppressHydrationWarning>
      현재 시간: {new Date().toLocaleTimeString()}
    </div>
  );
};

// ✅ 해결 방법 2: 클라이언트 전용 렌더링
const TimeDisplay = () => {
  const [time, setTime] = useState<string>('');
  
  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return <div>현재 시간: {time || 'Loading...'}</div>;
};
```

### 3. 조건부 렌더링 함정
```tsx
// ❌ 문제 코드 - 모바일 감지
const MobileMenu = () => {
  const isMobile = window.innerWidth < 768;
  return isMobile ? <MobileNav /> : <DesktopNav />;
};

// ✅ 해결 방법: Mounted 패턴
const MobileMenu = () => {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 마운트 전에는 기본 UI 표시
  if (!mounted) {
    return <DesktopNav />; // 또는 스켈레톤
  }
  
  return isMobile ? <MobileNav /> : <DesktopNav />;
};
```

### 4. LocalStorage 초기값 문제
```tsx
// ❌ 문제 코드 - CupNote의 실제 에러
const CoffeeList = () => {
  const [coffees] = useState(() => {
    return JSON.parse(localStorage.getItem('coffees') || '[]');
  });
  
  return <div>{coffees.map(coffee => ...)}</div>;
};

// ✅ 해결 방법: 지연 초기화
const CoffeeList = () => {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const stored = localStorage.getItem('coffees');
    if (stored) {
      setCoffees(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);
  
  if (isLoading) {
    return <CoffeeSkeleton />;
  }
  
  return <div>{coffees.map(coffee => ...)}</div>;
};
```

### 5. Random 값 사용
```tsx
// ❌ 문제 코드 - 랜덤 ID 생성
const RandomCard = () => {
  const id = Math.random().toString(36);
  return <div id={id}>Card Content</div>;
};

// ✅ 해결 방법 1: useId Hook (React 18+)
import { useId } from 'react';

const RandomCard = () => {
  const id = useId();
  return <div id={id}>Card Content</div>;
};

// ✅ 해결 방법 2: 고정된 ID 생성
const RandomCard = ({ index }: { index: number }) => {
  const id = `card-${index}`;
  return <div id={id}>Card Content</div>;
};
```

### 6. 브라우저 API 조건부 사용
```tsx
// ❌ 문제 코드
const Features = () => {
  const hasWebGL = !!window.WebGLRenderingContext;
  return hasWebGL ? <Canvas3D /> : <Canvas2D />;
};

// ✅ 해결 방법: 안전한 체크
const Features = () => {
  const [hasWebGL, setHasWebGL] = useState(false);
  
  useEffect(() => {
    setHasWebGL(typeof window !== 'undefined' && !!window.WebGLRenderingContext);
  }, []);
  
  return hasWebGL ? <Canvas3D /> : <Canvas2D />;
};
```

### 7. CSS-in-JS 동적 스타일
```tsx
// ❌ 문제 코드 - 동적 클래스명
const StyledButton = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return <button className={isDark ? 'dark-btn' : 'light-btn'}>Click</button>;
};

// ✅ 해결 방법: CSS 변수 사용
const StyledButton = () => {
  useEffect(() => {
    const updateTheme = (e: MediaQueryListEvent) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);
    updateTheme({ matches: mediaQuery.matches } as MediaQueryListEvent);
    
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, []);
  
  return <button className="theme-btn">Click</button>;
};

// CSS
.theme-btn {
  background: var(--button-bg);
  color: var(--button-text);
}

[data-theme="dark"] {
  --button-bg: #333;
  --button-text: #fff;
}
```

### 8. 서드파티 라이브러리 초기화
```tsx
// ❌ 문제 코드 - 차트 라이브러리
import Chart from 'chart.js';

const Analytics = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  
  // 서버에서 Chart is not defined 에러
  new Chart(chartRef.current!, { ... });
  
  return <canvas ref={chartRef} />;
};

// ✅ 해결 방법: Dynamic Import + useEffect
const Analytics = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chart, setChart] = useState<any>(null);
  
  useEffect(() => {
    const loadChart = async () => {
      const { Chart } = await import('chart.js/auto');
      
      if (chartRef.current) {
        const newChart = new Chart(chartRef.current, {
          // 차트 설정
        });
        setChart(newChart);
      }
    };
    
    loadChart();
    
    return () => {
      chart?.destroy();
    };
  }, []);
  
  return <canvas ref={chartRef} />;
};
```

### 9. 사용자 인증 상태
```tsx
// ❌ 문제 코드 - 쿠키 직접 읽기
const UserProfile = () => {
  const isLoggedIn = document.cookie.includes('auth-token');
  return isLoggedIn ? <Profile /> : <LoginButton />;
};

// ✅ 해결 방법: 서버/클라이언트 동기화
// app/layout.tsx
import { cookies } from 'next/headers';

export default function RootLayout({ children }) {
  const isLoggedIn = cookies().has('auth-token');
  
  return (
    <html>
      <body>
        <AuthProvider initialAuth={isLoggedIn}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// components/UserProfile.tsx
const UserProfile = () => {
  const { isLoggedIn } = useAuth(); // Context에서 가져옴
  return isLoggedIn ? <Profile /> : <LoginButton />;
};
```

### 10. 환경 변수 사용
```tsx
// ❌ 문제 코드 - 클라이언트 전용 환경변수
const ApiClient = () => {
  const apiUrl = process.env.REACT_APP_API_URL; // undefined on server
  return <div>API: {apiUrl}</div>;
};

// ✅ 해결 방법: Next.js 환경변수 규칙
const ApiClient = () => {
  // NEXT_PUBLIC_ 접두사 필요
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  return <div>API: {apiUrl}</div>;
};
```

## 🛠️ 디버깅 도구

### 1. Hydration 에러 정확히 찾기
```tsx
// utils/hydration-debugger.tsx
export const HydrationDebugger = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const originalError = console.error;
    
    console.error = (...args) => {
      if (args[0]?.includes?.('Hydration')) {
        console.log('🚨 Hydration Error Detected:');
        console.trace();
        debugger; // 브라우저 개발자 도구에서 중단점
      }
      originalError.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);
  
  return <>{children}</>;
};
```

### 2. 서버/클라이언트 렌더링 차이 확인
```tsx
// utils/render-check.tsx
export const RenderCheck = ({ name }: { name: string }) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    console.log(`Component ${name} mounted on client`);
  }, [name]);
  
  return (
    <div style={{ display: 'none' }}>
      {isClient ? `[CLIENT: ${name}]` : `[SERVER: ${name}]`}
    </div>
  );
};
```

## 🎯 예방 체크리스트

### 개발 시 확인사항
- [ ] window, document, navigator 직접 사용 금지
- [ ] localStorage, sessionStorage는 useEffect 내에서만
- [ ] Date, Math.random() 사용 시 suppressHydrationWarning
- [ ] 조건부 렌더링은 mounted 상태 확인 후
- [ ] CSS-in-JS는 정적 스타일 우선 고려
- [ ] 서드파티 라이브러리는 dynamic import
- [ ] 환경변수는 NEXT_PUBLIC_ 접두사 확인

### 배포 전 테스트
```bash
# 1. 프로덕션 빌드로 테스트
npm run build
npm run start

# 2. 느린 네트워크 시뮬레이션
# Chrome DevTools > Network > Slow 3G

# 3. JavaScript 비활성화 테스트
# 기본 콘텐츠가 표시되는지 확인
```

## 💡 핵심 원칙

> "서버에서 렌더링된 것과 클라이언트에서 렌더링된 것이 **정확히 일치**해야 한다"

1. **불확실한 것은 클라이언트에서**: 브라우저 API, 시간, 랜덤값
2. **마운트 확인 후 렌더링**: useState + useEffect 패턴 활용
3. **점진적 향상**: 서버 렌더링 → 클라이언트 향상
4. **에러 격리**: suppressHydrationWarning으로 부분적 허용

---

_이 가이드는 CupNote 프로젝트에서 실제로 겪은 수십 번의 hydration 에러를 해결하며 정리된 내용입니다._
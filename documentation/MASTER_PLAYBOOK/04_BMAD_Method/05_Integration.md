# 🔗 Integration (통합 구현)

## 🎯 개요

BMAD의 모든 요소를 **하나의 작동하는 시스템으로 통합**하는 마지막 단계입니다. Business, Model, API, Design이 조화롭게 작동하도록 연결합니다.

### 통합의 핵심
1. **Frontend ↔ Backend 연결**
2. **데이터 플로우 구현**
3. **상태 관리 설정**
4. **에러 처리 통합**

## 🏗️ 전체 스택 연결

### 아키텍처 구조
```
┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│    Backend      │
│  React/Next.js  │     │  Node/Express   │
└─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   State Mgmt    │     │    Database     │
│  Redux/Zustand  │     │  PostgreSQL     │
└─────────────────┘     └─────────────────┘
```

### 프로젝트 구조
```
project/
├── frontend/
│   ├── components/     # UI 컴포넌트
│   ├── pages/         # 페이지 컴포넌트
│   ├── services/      # API 호출
│   ├── hooks/         # 커스텀 훅
│   ├── store/         # 상태 관리
│   └── utils/         # 유틸리티
├── backend/
│   ├── routes/        # API 라우트
│   ├── controllers/   # 비즈니스 로직
│   ├── models/        # 데이터 모델
│   ├── middleware/    # 미들웨어
│   └── services/      # 외부 서비스
└── shared/
    ├── types/         # 공유 타입
    └── constants/     # 공유 상수
```

## 🔄 데이터 플로우 구현

### API 서비스 레이어
```typescript
// frontend/services/api.ts
class ApiService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message, response.status);
    }

    return response.json();
  }

  // 상품 관련 API
  products = {
    list: (params?: ProductParams) => 
      this.request<ProductList>('/products', {
        params: new URLSearchParams(params),
      }),
    
    get: (id: string) => 
      this.request<Product>(`/products/${id}`),
    
    create: (data: CreateProductDto) =>
      this.request<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };
}

export const api = new ApiService();
```

### 상태 관리 통합
```typescript
// frontend/store/products.ts (Zustand)
import { create } from 'zustand';
import { api } from '@/services/api';

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  
  fetchProducts: () => Promise<void>;
  createProduct: (data: CreateProductDto) => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.products.list();
      set({ products: data.items, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createProduct: async (data) => {
    set({ loading: true });
    try {
      const newProduct = await api.products.create(data);
      set((state) => ({
        products: [...state.products, newProduct],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

### React Query 통합
```typescript
// frontend/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

// 상품 목록 조회
export const useProducts = (params?: ProductParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.products.list(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 상품 생성
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.products.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
```

## 🛡️ 에러 처리 통합

### 전역 에러 처리
```typescript
// frontend/components/ErrorBoundary.tsx
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
    // 에러 로깅 서비스로 전송
    logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// frontend/utils/errorHandler.ts
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // 로그아웃 처리
        logout();
        return '로그인이 필요합니다';
      case 403:
        return '권한이 없습니다';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다';
      default:
        return error.message;
    }
  }
  
  return '알 수 없는 오류가 발생했습니다';
};
```

### Toast 알림 시스템
```typescript
// frontend/hooks/useToast.ts
export const useToast = () => {
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    toast[type](message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  return {
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
  };
};
```

## 🔐 인증 통합

### 인증 플로우 구현
```typescript
// frontend/contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 인증 상태 확인
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await api.auth.me();
          setUser(user);
        } catch {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (credentials: LoginDto) => {
    const { token, user } = await api.auth.login(credentials);
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Protected Routes
```typescript
// frontend/components/ProtectedRoute.tsx
const ProtectedRoute: FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <LoadingSpinner />;
  if (!user) return null;

  return <>{children}</>;
};
```

## 🧪 테스트 전략

### 단위 테스트
```typescript
// frontend/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 10000,
    image: '/test.jpg',
  };

  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₩10,000')).toBeInTheDocument();
  });
});
```

### 통합 테스트
```typescript
// backend/routes/products.test.ts
import request from 'supertest';
import { app } from '../app';

describe('Products API', () => {
  it('GET /api/products returns product list', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);
      
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### E2E 테스트
```typescript
// e2e/products.spec.ts
import { test, expect } from '@playwright/test';

test('user can view and purchase product', async ({ page }) => {
  await page.goto('/');
  
  // 상품 클릭
  await page.click('[data-testid="product-card"]');
  
  // 장바구니 추가
  await page.click('[data-testid="add-to-cart"]');
  
  // 장바구니 확인
  await page.goto('/cart');
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
});
```

## 🚀 배포 준비

### 환경 변수 설정
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.production.com
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=production-secret
STRIPE_API_KEY=sk_live_xxx
```

### 빌드 최적화
```json
// package.json
{
  "scripts": {
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "start": "next start",
    "start:prod": "NODE_ENV=production node server.js"
  }
}
```

### Docker 설정
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 모니터링 설정

### 에러 추적
```typescript
// Sentry 설정
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 성능 모니터링
```typescript
// Analytics 설정
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

## 🎯 Day 16-17 실행 계획

### Day 16: 통합 구현
```
오전:
- Frontend-Backend 연결
- API 서비스 구현
- 상태 관리 설정

오후:
- 인증 플로우 구현
- 에러 처리 통합
- 실시간 기능 구현
```

### Day 17: 테스트 및 배포
```
오전:
- 통합 테스트 실행
- 버그 수정
- 성능 최적화

오후:
- 배포 환경 설정
- 프로덕션 배포
- 모니터링 설정
```

## ✅ 체크리스트

### 통합 완료 기준
- [ ] 모든 API 엔드포인트 연결
- [ ] 인증/인가 작동
- [ ] 에러 처리 완성
- [ ] 테스트 커버리지 70%+
- [ ] 배포 준비 완료
- [ ] 모니터링 설정

## 💡 실전 팁

### Do's ✅
1. **점진적 통합**: 한 번에 하나씩
2. **로그 많이**: 디버깅 쉽게
3. **에러 처리**: 모든 케이스 고려
4. **성능 측정**: 병목 지점 파악

### Don'ts ❌
1. **한꺼번에 통합**: 디버깅 어려움
2. **에러 무시**: 나중에 큰 문제
3. **테스트 생략**: 프로덕션 장애
4. **최적화 미루기**: 사용자 이탈

---

> 🔗 **"통합은 퍼즐의 마지막 조각이다"**

다음: [실전 프로젝트](06_Real_Projects.md) →
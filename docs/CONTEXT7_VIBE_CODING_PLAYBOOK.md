# 🚀 Context7 바이브 코딩 플레이북

## 코딩 초보자를 위한 Context7 활용 앱 개발 완벽 가이드

### 목차
1. [Context7란 무엇인가?](#context7란-무엇인가)
2. [Context7 vs SuperClaude](#context7-vs-superclause)
3. [시작하기 전 준비사항](#시작하기-전-준비사항)
4. [Phase 1: Context7로 프로젝트 시작하기 (Day 1-2)](#phase-1-context7로-프로젝트-시작하기-day-1-2)
5. [Phase 2: 라이브러리 문서 활용한 개발 (Day 3-7)](#phase-2-라이브러리-문서-활용한-개발-day-3-7)
6. [Phase 3: UI 프레임워크 마스터하기 (Day 8-11)](#phase-3-ui-프레임워크-마스터하기-day-8-11)
7. [Phase 4: API 통합과 백엔드 (Day 12-15)](#phase-4-api-통합과-백엔드-day-12-15)
8. [Phase 5: 최적화와 배포 (Day 16-18)](#phase-5-최적화와-배포-day-16-18)
9. [Context7 고급 활용법](#context7-고급-활용법)
10. [트러블슈팅 가이드](#트러블슈팅-가이드)
11. [Context7 최적화 팁](#context7-최적화-팁)

---

## Context7란 무엇인가?

### 개념 소개
**Context7**은 공식 라이브러리 문서와 베스트 프랙티스를 실시간으로 참조하며 코드를 생성하는 MCP(Model Context Protocol) 서버입니다.

### 핵심 강점
- 📚 **공식 문서 기반**: 항상 최신 라이브러리 문서 참조
- 🎯 **정확한 구현**: 프레임워크별 베스트 프랙티스 적용
- 🌐 **다국어 지원**: 한국어 문서와 예제 제공
- ⚡ **실시간 업데이트**: 라이브러리 버전 변경 즉시 반영

### Context7이 특히 유용한 경우
```
✅ React, Vue, Angular 같은 프레임워크 사용
✅ 복잡한 라이브러리 통합 (Redux, GraphQL 등)
✅ 최신 API 사용법이 필요할 때
✅ 프레임워크별 관례를 정확히 따라야 할 때
```

---

## Context7 vs SuperClaude

### 비교표

| 특징 | Context7 | SuperClaude |
|------|----------|-------------|
| **강점** | 라이브러리 문서 정확성 | 종합적인 프로젝트 관리 |
| **초점** | 프레임워크 구현 | 전체 개발 프로세스 |
| **문서 참조** | 실시간 공식 문서 | 내장된 패턴 지식 |
| **코드 생성** | 프레임워크 최적화 | 범용적 접근 |
| **학습 곡선** | 낮음 (문서 기반) | 중간 (명령어 학습) |

### Context7 선택 기준
```
"다음 중 하나라도 해당되면 Context7가 최적입니다:"
- React/Vue/Angular 프로젝트
- 특정 라이브러리 집중 사용
- 공식 문서 준수가 중요한 경우
- 프레임워크 마이그레이션
```

---

## 시작하기 전 준비사항

### 필수 도구 설치
```bash
# 1. Node.js 설치 확인
node --version  # v18 이상

# 2. 패키지 매니저 선택
npm --version   # 또는
yarn --version  # 또는
pnpm --version  # 또는
bun --version   # (가장 빠름!)

# 3. VS Code 설치
# 4. Chrome 브라우저
```

### Context7 활성화
```bash
# Claude Code에서 Context7 자동 활성화됨
# 수동 활성화가 필요한 경우:
--c7 또는 --context7 플래그 사용
```

### 마인드셋 준비
- 🎯 **목표 명확히**: "무엇을 만들고 싶은가?"
- 📚 **문서 친화적**: Context7는 문서를 잘 활용합니다
- 🔄 **반복 개선**: 한 번에 완벽할 필요 없음
- 💬 **자연어 사용**: 기술 용어 몰라도 OK

---

## Phase 1: Context7로 프로젝트 시작하기 (Day 1-2)

### Step 1.1: 프로젝트 아이디어 구체화

#### 자연어로 설명하기
```
"여행 기록 웹앱을 만들고 싶어.
- React로 만들기
- 예쁜 UI 컴포넌트
- 반응형 디자인
- 지도에 여행지 표시"
```

#### Context7 활용 초기 설정
```bash
# Context7가 React 문서를 참조하여 프로젝트 생성
"React 최신 버전으로 여행 기록 앱 프로젝트 만들어줘"

# Context7 응답 예시:
📚 React 18.2.0 문서 참조 중...
✅ Create React App 대신 Vite 추천 (더 빠름)
✅ TypeScript 설정 포함
✅ 필수 라이브러리 자동 선택
```

### Step 1.2: 프레임워크별 프로젝트 생성

#### React 프로젝트 (Vite)
```bash
# Context7가 최신 React 문서 기반으로 생성
"Vite로 React TypeScript 프로젝트 만들어줘"

# 자동 생성 내용:
npm create vite@latest travel-diary -- --template react-ts
cd travel-diary
npm install
npm run dev
```

#### Vue 프로젝트
```bash
# Vue 3 공식 문서 기반 설정
"Vue 3 Composition API로 프로젝트 시작해줘"

# Context7가 생성:
npm create vue@latest travel-diary
# ✅ TypeScript 
# ✅ Vue Router
# ✅ Pinia
# ✅ ESLint + Prettier
```

#### Angular 프로젝트
```bash
# Angular 최신 CLI 활용
"Angular로 여행 앱 프로젝트 만들어줘"

# Context7 자동 설정:
npm install -g @angular/cli
ng new travel-diary --routing --style=scss
cd travel-diary
ng serve
```

### Step 1.3: Context7로 프로젝트 구조 최적화

```bash
# 프레임워크별 최적 구조 생성
"이 React 프로젝트의 폴더 구조 최적화해줘"

# Context7가 React 문서 기반으로 생성:
src/
├── components/          # 재사용 컴포넌트
│   ├── common/         # 공통 UI 컴포넌트
│   ├── features/       # 기능별 컴포넌트
│   └── layout/         # 레이아웃 컴포넌트
├── pages/              # 라우트별 페이지
├── hooks/              # 커스텀 훅
├── services/           # API 통신
├── store/              # 상태 관리
├── styles/             # 글로벌 스타일
└── utils/              # 유틸리티 함수
```

---

## Phase 2: 라이브러리 문서 활용한 개발 (Day 3-7)

### Step 2.1: UI 라이브러리 선택과 설정

#### Material-UI (MUI) 통합
```bash
# Context7가 MUI 공식 문서 참조
"Material-UI 최신 버전 설치하고 기본 테마 설정해줘"

# 자동 실행:
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material

# 테마 설정 자동 생성:
// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Noto Sans KR", "Roboto", sans-serif',
  },
});
```

#### Ant Design 통합
```bash
# Context7가 Ant Design 문서 기반 설정
"Ant Design으로 UI 구성해줘"

# 자동 구성:
npm install antd
npm install @ant-design/icons

// App.tsx에 자동 추가
import 'antd/dist/reset.css';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
```

### Step 2.2: 상태 관리 라이브러리 통합

#### Redux Toolkit 설정
```bash
# Context7가 Redux 공식 문서 참조하여 최신 패턴 적용
"Redux Toolkit으로 여행 데이터 상태 관리 설정해줘"

# 자동 생성되는 구조:
// store/store.ts
import { configureStore } from '@reduxjs/toolkit'
import tripsReducer from './slices/tripsSlice'

export const store = configureStore({
  reducer: {
    trips: tripsReducer,
  },
})

// store/slices/tripsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Trip {
  id: string
  country: string
  startDate: string
  endDate: string
}

const tripsSlice = createSlice({
  name: 'trips',
  initialState: [] as Trip[],
  reducers: {
    addTrip: (state, action: PayloadAction<Trip>) => {
      state.push(action.payload)
    },
    removeTrip: (state, action: PayloadAction<string>) => {
      return state.filter(trip => trip.id !== action.payload)
    },
  },
})
```

#### Zustand 설정 (더 간단한 대안)
```bash
# Context7가 Zustand 문서 참조
"Zustand로 간단한 상태 관리 만들어줘"

# 자동 생성:
// store/useTripStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TripStore {
  trips: Trip[]
  addTrip: (trip: Trip) => void
  removeTrip: (id: string) => void
}

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
      trips: [],
      addTrip: (trip) => set((state) => ({ 
        trips: [...state.trips, trip] 
      })),
      removeTrip: (id) => set((state) => ({ 
        trips: state.trips.filter(t => t.id !== id) 
      })),
    }),
    {
      name: 'trip-storage',
    }
  )
)
```

### Step 2.3: 라우팅 설정

#### React Router 설정
```bash
# Context7가 React Router v6 문서 기반 설정
"React Router로 페이지 라우팅 설정해줘"

# 자동 생성:
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/trips/:id" element={<TripDetailPage />} />
        <Route path="/add-trip" element={<AddTripPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

---

## Phase 3: UI 프레임워크 마스터하기 (Day 8-11)

### Step 3.1: 컴포넌트 라이브러리 활용

#### 기본 컴포넌트 생성
```bash
# Context7가 MUI 문서 참조하여 생성
"여행 카드 컴포넌트 만들어줘"

# 자동 생성되는 컴포넌트:
// components/TripCard.tsx
import { Card, CardContent, CardMedia, Typography, Chip } from '@mui/material'
import { LocationOn, CalendarToday } from '@mui/icons-material'

export function TripCard({ trip }: { trip: Trip }) {
  return (
    <Card sx={{ maxWidth: 345, m: 2 }}>
      <CardMedia
        component="img"
        height="140"
        image={trip.image || '/placeholder.jpg'}
        alt={trip.country}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {trip.country}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarToday fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </Typography>
        </Box>
        <Box mt={2}>
          <Chip label={trip.visaType} size="small" color="primary" />
        </Box>
      </CardContent>
    </Card>
  )
}
```

#### 폼 컴포넌트 생성
```bash
# Context7가 React Hook Form + MUI 통합
"여행 추가 폼 만들어줘"

# 자동 생성:
// components/AddTripForm.tsx
import { useForm, Controller } from 'react-hook-form'
import { TextField, Button, Autocomplete } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'

export function AddTripForm() {
  const { control, handleSubmit } = useForm<TripFormData>()
  
  const onSubmit = (data: TripFormData) => {
    // Context7가 자동으로 Zustand store 연결
    useTripStore.getState().addTrip({
      id: generateId(),
      ...data
    })
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="country"
        control={control}
        render={({ field }) => (
          <Autocomplete
            {...field}
            options={countries}
            renderInput={(params) => (
              <TextField {...params} label="국가 선택" />
            )}
          />
        )}
      />
      
      <Controller
        name="startDate"
        control={control}
        render={({ field }) => (
          <DatePicker
            {...field}
            label="시작일"
            renderInput={(params) => <TextField {...params} />}
          />
        )}
      />
      
      <Button type="submit" variant="contained">
        여행 추가
      </Button>
    </form>
  )
}
```

### Step 3.2: 반응형 디자인 구현

```bash
# Context7가 MUI Grid v2 문서 참조
"반응형 여행 목록 그리드 만들어줘"

# 자동 생성:
// pages/TripsPage.tsx
import Grid from '@mui/material/Unstable_Grid2'
import { Container } from '@mui/material'

export function TripsPage() {
  const trips = useTripStore(state => state.trips)
  
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {trips.map(trip => (
          <Grid key={trip.id} xs={12} sm={6} md={4}>
            <TripCard trip={trip} />
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
```

### Step 3.3: 애니메이션과 트랜지션

```bash
# Context7가 Framer Motion 문서 참조
"카드에 애니메이션 효과 추가해줘"

# 자동 통합:
npm install framer-motion

// components/AnimatedTripCard.tsx
import { motion } from 'framer-motion'

export function AnimatedTripCard({ trip, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <TripCard trip={trip} />
    </motion.div>
  )
}
```

---

## Phase 4: API 통합과 백엔드 (Day 12-15)

### Step 4.1: API 클라이언트 설정

#### Axios 설정
```bash
# Context7가 Axios 문서 기반 설정
"Axios로 API 클라이언트 설정해줘"

# 자동 생성:
// services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 응답 인터셉터
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // 자동 로그아웃 처리
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

#### React Query 통합
```bash
# Context7가 TanStack Query v5 문서 참조
"React Query로 데이터 페칭 최적화해줘"

# 자동 설정:
// hooks/useTrips.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: () => api.get('/trips'),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

export function useCreateTrip() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (newTrip: TripInput) => api.post('/trips', newTrip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}

// 컴포넌트에서 사용
function TripsList() {
  const { data: trips, isLoading, error } = useTrips()
  const createTrip = useCreateTrip()
  
  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage />
  
  return (
    <div>
      {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
    </div>
  )
}
```

### Step 4.2: 인증 시스템 구현

```bash
# Context7가 NextAuth.js 문서 참조 (Next.js 사용 시)
"구글 로그인 구현해줘"

# React 앱에서는 Firebase Auth 추천:
npm install firebase

// services/auth.ts
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    const token = await result.user.getIdToken()
    localStorage.setItem('token', token)
    return result.user
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return unsubscribe
  }, [])
  
  return { user, signInWithGoogle, signOut }
}
```

### Step 4.3: 실시간 기능 구현

```bash
# Context7가 Socket.io 문서 참조
"실시간 여행 업데이트 기능 추가해줘"

# 자동 구현:
// services/socket.ts
import { io } from 'socket.io-client'

const socket = io(process.env.REACT_APP_SOCKET_URL)

export function useRealtimeTrips() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    socket.on('trip:created', (newTrip) => {
      queryClient.setQueryData(['trips'], (old: Trip[]) => 
        [...old, newTrip]
      )
    })
    
    socket.on('trip:updated', (updatedTrip) => {
      queryClient.setQueryData(['trips'], (old: Trip[]) =>
        old.map(trip => 
          trip.id === updatedTrip.id ? updatedTrip : trip
        )
      )
    })
    
    return () => {
      socket.off('trip:created')
      socket.off('trip:updated')
    }
  }, [queryClient])
}
```

---

## Phase 5: 최적화와 배포 (Day 16-18)

### Step 5.1: 성능 최적화

#### 코드 스플리팅
```bash
# Context7가 React.lazy 문서 참조
"라우트별 코드 스플리팅 적용해줘"

# 자동 구현:
// App.tsx
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('./pages/HomePage'))
const TripsPage = lazy(() => import('./pages/TripsPage'))
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
      </Routes>
    </Suspense>
  )
}
```

#### 이미지 최적화
```bash
# Context7가 next/image 또는 react-lazy-load-image 활용
"이미지 레이지 로딩 구현해줘"

# 자동 구현:
// components/OptimizedImage.tsx
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'

export function OptimizedImage({ src, alt, ...props }) {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      effect="blur"
      placeholder={<Skeleton variant="rectangular" />}
      {...props}
    />
  )
}
```

### Step 5.2: PWA 구현

```bash
# Context7가 Workbox 문서 참조
"PWA로 만들어줘"

# Vite PWA 플러그인 사용:
npm install -D vite-plugin-pwa

// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '여행 다이어리',
        short_name: 'TravelDiary',
        theme_color: '#1976d2',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300 // 5분
              }
            }
          }
        ]
      }
    })
  ]
}
```

### Step 5.3: 배포

#### Vercel 배포
```bash
# Context7가 Vercel 문서 참조
"Vercel로 배포 설정해줘"

# 자동 설정:
# 1. vercel.json 생성
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

# 2. 환경 변수 설정
VITE_API_URL=https://api.your-domain.com
VITE_FIREBASE_CONFIG={"apiKey":"..."}

# 3. 배포 명령
npx vercel --prod
```

---

## Context7 고급 활용법

### 프레임워크 마이그레이션

#### Vue 2에서 Vue 3로
```bash
# Context7가 Vue 마이그레이션 가이드 참조
"Vue 2 프로젝트를 Vue 3로 마이그레이션해줘"

# Context7가 자동으로:
1. Composition API 변환
2. 라이프사이클 훅 업데이트
3. 패키지 의존성 업데이트
4. Breaking changes 처리
```

#### Class Component에서 Function Component로
```bash
# Context7가 React Hooks 문서 참조
"클래스 컴포넌트를 함수형으로 변환해줘"

# 자동 변환 예시:
// Before (Class)
class TripList extends Component {
  state = { trips: [] }
  
  componentDidMount() {
    fetchTrips().then(trips => this.setState({ trips }))
  }
  
  render() {
    return <div>{this.state.trips.map(...)}</div>
  }
}

// After (Function)
function TripList() {
  const [trips, setTrips] = useState([])
  
  useEffect(() => {
    fetchTrips().then(setTrips)
  }, [])
  
  return <div>{trips.map(...)}</div>
}
```

### 라이브러리별 최적화

#### React 최적화
```bash
# Context7가 React 성능 문서 참조
"React 렌더링 최적화해줘"

# 자동 적용:
// 1. React.memo 적용
export const TripCard = React.memo(({ trip }) => {
  return <Card>...</Card>
})

// 2. useMemo 활용
const expensiveCalculation = useMemo(() => {
  return calculateTotalDays(trips)
}, [trips])

// 3. useCallback 사용
const handleClick = useCallback((id) => {
  setSelectedTrip(id)
}, [])
```

#### Bundle 크기 최적화
```bash
# Context7가 번들 분석 도구 활용
"번들 크기 줄여줘"

# 자동 최적화:
// 1. Tree shaking
import { Button, TextField } from '@mui/material' // ❌
import Button from '@mui/material/Button' // ✅
import TextField from '@mui/material/TextField' // ✅

// 2. Dynamic imports
const HeavyComponent = lazy(() => 
  import(/* webpackChunkName: "heavy" */ './HeavyComponent')
)

// 3. 라이브러리 교체
// moment.js (290KB) → day.js (7KB)
import dayjs from 'dayjs'
```

---

## 트러블슈팅 가이드

### 자주 발생하는 문제들

#### 1. "Module not found" 에러
```bash
# Context7가 패키지 문서 확인
"Module not found 에러 해결해줘"

# Context7 해결 과정:
1. 패키지 설치 확인
2. import 경로 수정
3. TypeScript 타입 설치
4. 설정 파일 업데이트
```

#### 2. CORS 에러
```bash
# Context7가 CORS 해결 방법 제시
"CORS 에러 해결해줘"

# 해결 방법:
// 1. 프록시 설정 (개발)
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}

// 2. 백엔드 CORS 설정
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))
```

#### 3. 상태 관리 문제
```bash
# Context7가 상태 관리 디버깅
"상태가 업데이트 안 돼"

# Context7 진단:
1. 불변성 확인
2. 비동기 처리 검증
3. 의존성 배열 체크
4. DevTools로 추적
```

---

## Context7 최적화 팁

### 1. 라이브러리 ID 해상도 향상
```bash
# 명확한 라이브러리명 사용
"Material-UI로..." → "MUI v5로..."
"React Router로..." → "React Router v6로..."
```

### 2. 버전 특정하기
```bash
# 특정 버전 문서 참조
"React 18의 Suspense 사용법 보여줘"
"Vue 3 Composition API로 구현해줘"
```

### 3. 프레임워크 컨텍스트 제공
```bash
# 프로젝트 정보 명시
"Next.js 14 App Router에서..."
"Vite + React + TypeScript 환경에서..."
```

### 4. 통합 시나리오 명시
```bash
# 라이브러리 조합 명확히
"React Query + Axios로 데이터 페칭"
"Redux Toolkit + RTK Query 설정"
```

### 5. 한국어 문서 활용
```bash
# 한국어 설명 요청
"한국어로 설명하면서 구현해줘"
"주석도 한국어로 달아줘"
```

---

## 마무리

### Context7의 장점 활용하기

#### 📚 문서 기반 개발
- 항상 최신 공식 문서 참조
- 프레임워크별 베스트 프랙티스
- 정확한 API 사용법

#### 🎯 정확한 구현
- 타입 안전성 보장
- 프레임워크 관례 준수
- 버전별 호환성 확인

#### 🚀 빠른 개발
- 보일러플레이트 자동 생성
- 일반적인 패턴 즉시 적용
- 에러 해결 방법 제시

### 성공적인 Context7 활용 전략

1. **명확한 요구사항**: "React로 투두 리스트" → "React 18 + TypeScript + MUI로 투두 리스트"
2. **단계별 접근**: 한 번에 모든 걸 하지 말고 단계별로
3. **문서 활용**: Context7가 참조하는 문서 링크 확인
4. **반복 개선**: 첫 구현 후 계속 개선

### 다음 단계

1. **실제 프로젝트 시작**: 작은 프로젝트부터
2. **라이브러리 탐험**: 새로운 라이브러리 시도
3. **성능 최적화**: 프로덕션 레벨로 개선
4. **커뮤니티 참여**: 만든 앱 공유하기

**Context7와 함께라면 공식 문서 기반의 정확한 코드를 작성할 수 있습니다! 🚀**
# Performance Optimization

DINO 프로젝트의 성능 최적화 전략과 구현 내용입니다.

## 코드 스플리팅

### Next.js 설정
```javascript
// next.config.js
splitChunks: {
  chunks: 'all',
  cacheGroups: {
    react: ['react', 'react-dom', 'next'],
    ui: ['@radix-ui', 'lucide-react'],
    utils: ['date-fns', 'lodash'],
    database: ['@prisma/client', 'zod']
  }
}
```

### 청크 전략
- **React 벤더**: 핵심 React 라이브러리
- **UI 컴포넌트**: Radix UI, Lucide 아이콘
- **유틸리티**: 날짜 처리, 유틸리티 함수
- **데이터베이스**: Prisma, 유효성 검사

## 지연 로딩

### LazyLoad 컴포넌트
- 동적 import를 통한 컴포넌트 지연 로딩
- 로딩 중 스켈레톤 UI 표시
- SSR 지원 옵션

### 구현된 지연 로딩
- SchengenCalculator
- TravelStatsWidget
- YearView
- 대용량 차트 라이브러리

## 이미지 최적화

### OptimizedImage 컴포넌트
- Next.js Image 컴포넌트 래퍼
- 자동 포맷 변환 (WebP, AVIF)
- 지연 로딩 및 블러 플레이스홀더
- 반응형 이미지 크기

### 최적화 설정
- Quality: 75%
- 다양한 디바이스 크기 지원
- 1년 캐시 TTL

## Web Vitals 모니터링

### 측정 지표
- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms

### 모니터링 구현
- 실시간 성능 측정
- Google Analytics 통합
- 성능 등급 자동 평가

## 리소스 힌트

### 구현된 힌트
- **DNS Prefetch**: 외부 도메인 DNS 사전 조회
- **Preconnect**: 중요 도메인 연결 사전 설정
- **Prefetch**: 다음 페이지 리소스 사전 로드
- **Preload**: 현재 페이지 중요 리소스 우선 로드

### 스마트 프리페치
- 연결 속도 기반 조건부 프리페치
- 호버 시 프리페치 시작
- 유휴 시간 활용 배치 프리페치

## 번들 최적화

### 최적화 전략
- Tree Shaking 활성화
- 사이드 이펙트 제거
- 불필요한 폴리필 제거
- 프로덕션 빌드 시 콘솔 제거

### 번들 크기 목표
- JavaScript: < 300KB
- CSS: < 60KB
- 총 번들: < 1MB

## 캐싱 전략

### 정적 자산
- Max-Age: 1년
- Immutable 헤더 설정

### API 응답
- SWR: 1시간
- Private 캐시

### HTML 페이지
- SWR: 24시간
- 동적 콘텐츠 최신성 보장

## 성능 예산

### 크기 예산
- JavaScript: 300KB
- CSS: 60KB
- 이미지: 500KB
- 폰트: 100KB
- 총합: 1MB

### 타이밍 예산
- FCP: 1.8초
- LCP: 2.5초
- TTI: 3.5초

## 모니터링 및 분석

### 도구
- Chrome DevTools
- Lighthouse
- WebPageTest
- Bundle Analyzer

### 지속적 모니터링
- 빌드 시 성능 체크
- 실사용자 모니터링 (RUM)
- 성능 리그레션 방지
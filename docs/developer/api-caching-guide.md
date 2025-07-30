# 🚀 API 캐싱 시스템 사용 가이드

## 개요

DINO 프로젝트의 analytics와 monitoring 페이지 성능 최적화를 위한 고성능 인메모리 캐싱 시스템입니다.

## 핵심 기능

### 1. 자동 캐싱

- **TTL 기반**: 데이터 유형별 맞춤 캐시 수명
- **자동 정리**: 만료된 항목 자동 제거
- **성능 모니터링**: 실시간 캐시 성능 추적

### 2. 지능형 캐시 관리

- **패턴 기반 무효화**: 관련 캐시 일괄 제거
- **메모리 압박 관리**: 자동 정리로 메모리 최적화
- **성능 등급**: 캐시 효율성 평가

### 3. 실시간 모니터링

- **적중률 추적**: 캐시 성능 실시간 모니터링
- **메모리 사용량**: 메모리 압박 상태 추적
- **성능 등급**: 자동 성능 평가

## 사용법

### 1. 기본 캐싱

```typescript
import { withCache, CacheKeys, CacheTTL } from '@/lib/cache/memory-cache';

// 간단한 캐시 적용
const userData = await withCache(
  CacheKeys.USER_TRIPS(userId),
  async () => {
    // 실제 데이터 조회
    return await fetchUserTrips(userId);
  },
  CacheTTL.USER_DATA
);
```

### 2. Analytics API 사용

```typescript
import { AnalyticsAPI } from '@/lib/api/analytics-api';

// 캐시가 자동 적용된 분석 데이터 조회
const overview = await AnalyticsAPI.getAnalyticsOverview(userId);
const countryStats = await AnalyticsAPI.getCountryStats(userId);
const visaBreakdown = await AnalyticsAPI.getVisaBreakdown(userId);

// 데이터 변경 시 캐시 무효화
AnalyticsAPI.invalidateUserCache(userId);
```

### 3. Monitoring API 사용

```typescript
import { MonitoringAPI } from '@/lib/api/monitoring-api';

// 실시간 모니터링 데이터
const performance = await MonitoringAPI.getPerformanceMetrics();
const usage = await MonitoringAPI.getUsageStats();
const errors = await MonitoringAPI.getErrorStats();

// 모든 데이터 병렬 수집
const allData = await MonitoringAPI.getAllMonitoringData();

// 알림 확인
const alerts = await MonitoringAPI.getAlerts();
```

### 4. 캐시 관리

```typescript
import { CacheManager } from '@/lib/cache/memory-cache';

// 사용자별 캐시 무효화
CacheManager.invalidateUser(userId);

// 카테고리별 캐시 무효화
CacheManager.invalidateCategory('analytics');

// 성능 메트릭 조회
const metrics = CacheManager.getPerformanceMetrics();

// 자동 정리
const { cleaned, pressure } = CacheManager.autoCleanup();
```

## 캐시 TTL 설정

### 데이터 유형별 TTL

```typescript
export const CacheTTL = {
  USER_DATA: 5 * 60 * 1000, // 5분 - 사용자 데이터
  ANALYTICS: 10 * 60 * 1000, // 10분 - 분석 데이터
  MONITORING: 30 * 1000, // 30초 - 모니터링 데이터
  DASHBOARD: 2 * 60 * 1000, // 2분 - 대시보드
  STATIC: 30 * 60 * 1000, // 30분 - 정적 데이터
  REALTIME: 10 * 1000, // 10초 - 실시간 데이터
};
```

### 용도별 가이드라인

- **실시간 성능**: 10-30초 (MONITORING, REALTIME)
- **사용자 데이터**: 2-5분 (USER_DATA, DASHBOARD)
- **분석 데이터**: 5-10분 (ANALYTICS)
- **정적 데이터**: 30분+ (STATIC)

## 캐시 키 관리

### 표준화된 키 네이밍

```typescript
export const CacheKeys = {
  // 사용자 데이터
  USER_TRIPS: (userId: string) => `user:${userId}:trips`,
  USER_SCHENGEN_STATUS: (userId: string) => `user:${userId}:schengen`,

  // 분석 데이터
  USER_ANALYTICS_OVERVIEW: (userId: string) => `analytics:${userId}:overview`,
  USER_ANALYTICS_COUNTRIES: (userId: string) => `analytics:${userId}:countries`,

  // 모니터링 데이터
  MONITORING_PERFORMANCE: 'monitoring:performance',
  MONITORING_ERRORS: 'monitoring:errors',
};
```

### 키 네이밍 규칙

1. **구조**: `{category}:{identifier}:{type}`
2. **일관성**: 동일한 패턴 사용
3. **검색성**: 패턴 매칭 가능한 구조

## 성능 모니터링

### 캐시 성능 메트릭

```typescript
const metrics = CacheManager.getPerformanceMetrics();

console.log(`Hit Rate: ${metrics.hitRate}%`); // 적중률
console.log(`Memory: ${metrics.memoryUsageMB}MB`); // 메모리 사용량
console.log(`Grade: ${metrics.performance.hitRateGrade}`); // 성능 등급
```

### 성능 등급 기준

- **Excellent**: 90%+ 적중률
- **Good**: 75-90% 적중률
- **Fair**: 50-75% 적중률
- **Poor**: 50% 미만 적중률

### 메모리 압박 관리

- **Low**: 10MB 미만
- **Medium**: 10-50MB
- **High**: 50-100MB
- **Critical**: 100MB 이상

## 실제 적용 예시

### Analytics 페이지

```typescript
// app/analytics/page.tsx
export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  // 캐시된 데이터 조회 (첫 로드 시 느릴 수 있음)
  const [overview, countries, timeline] = await Promise.all([
    AnalyticsAPI.getAnalyticsOverview(userId),
    AnalyticsAPI.getCountryStats(userId),
    AnalyticsAPI.getTravelTimeline(userId)
  ])

  return (
    <div>
      <OverviewWidget data={overview} />
      <CountryChart data={countries} />
      <TimelineChart data={timeline} />
    </div>
  )
}
```

### Monitoring 대시보드

```typescript
// app/dashboard/monitoring/page.tsx
export default async function MonitoringPage() {
  // 모든 모니터링 데이터 병렬 수집
  const data = await MonitoringAPI.getAllMonitoringData()
  const alerts = await MonitoringAPI.getAlerts()

  return (
    <div>
      <AlertsWidget alerts={alerts} />
      <PerformanceChart data={data.performance} />
      <UsageStats data={data.usage} />
      <ErrorDashboard data={data.errors} />
      <CacheMonitor data={data.cache} />
    </div>
  )
}
```

### 클라이언트 사이드 캐시 무효화

```typescript
// 새 여행 추가 시
const handleAddTrip = async (tripData: TripFormData) => {
  await ApiClient.addTrip(tripData);

  // 관련 캐시 무효화
  AnalyticsAPI.invalidateUserCache(userId);

  // UI 새로고침
  router.refresh();
};
```

## 캐시 최적화 팁

### 1. 적절한 TTL 설정

```typescript
// ❌ 너무 짧은 TTL (캐시 효과 없음)
withCache(key, fetcher, 1000); // 1초

// ❌ 너무 긴 TTL (오래된 데이터)
withCache(key, fetcher, 24 * 60 * 60 * 1000); // 24시간

// ✅ 적절한 TTL
withCache(key, fetcher, CacheTTL.ANALYTICS); // 10분
```

### 2. 효율적인 캐시 무효화

```typescript
// ❌ 전체 캐시 클리어
memoryCache.clear();

// ✅ 패턴 기반 무효화
CacheManager.invalidateUser(userId);
CacheManager.invalidateCategory('analytics');
```

### 3. 병렬 데이터 로딩

```typescript
// ❌ 순차 로딩
const overview = await AnalyticsAPI.getAnalyticsOverview(userId);
const countries = await AnalyticsAPI.getCountryStats(userId);

// ✅ 병렬 로딩
const [overview, countries] = await Promise.all([
  AnalyticsAPI.getAnalyticsOverview(userId),
  AnalyticsAPI.getCountryStats(userId),
]);
```

## 디버깅 및 모니터링

### 캐시 상태 확인

```typescript
// 캐시 통계 확인
const stats = memoryCache.getStats();
console.log('Cache Stats:', stats);

// 성능 메트릭 확인
const performance = CacheManager.getPerformanceMetrics();
console.log('Performance:', performance);
```

### 로깅

```typescript
// 캐시 적중/미스 로깅 (개발 환경)
if (process.env.NODE_ENV === 'development') {
  console.log(`Cache ${cached ? 'HIT' : 'MISS'}: ${key}`);
}
```

## 주의사항

### 1. 메모리 관리

- 정기적인 정리 필요
- 메모리 사용량 모니터링
- 적절한 TTL 설정

### 2. 데이터 일관성

- 적시 캐시 무효화
- 관련 캐시 함께 관리
- 데이터 변경 시 즉시 무효화

### 3. 성능 고려사항

- 캐시 키 복잡도 최소화
- 직렬화 가능한 데이터만 저장
- 대용량 데이터 캐싱 주의

이 캐싱 시스템을 통해 analytics와 monitoring 페이지의 성능을 크게 향상시킬 수 있습니다!

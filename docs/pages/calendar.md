# 여행 캘린더 (/calendar)

## 개요

여행 일정을 캘린더 뷰로 시각화하고 Gmail 연동으로 추출한 여행 정보를 Google Calendar와 동기화하는 종합 캘린더 관리 시스템입니다.

### 주요 기능
- 여행 일정 캘린더 뷰
- Gmail 여행 정보 자동 동기화
- Google Calendar 통합
- 체류 기간 시각화
- 여행 통계 대시보드
- 5개 탭 구성 (일정, 개요, 동기화, 시각화, 관리)

## 사용자 역할 및 플로우

### 1. 초기 사용자 플로우
```mermaid
graph TD
    A[캘린더 페이지 방문] --> B{로그인 상태}
    B -->|미로그인| C[로그인 요청]
    B -->|로그인| D[캘린더 데이터 로드]
    D --> E[Gmail 여행 정보 확인]
    E -->|없음| F[Gmail 분석 유도]
    E -->|있음| G[동기화 준비]
```

### 2. 동기화 플로우
```mermaid
graph TD
    A[Gmail 분석 완료] --> B[여행 정보 표시]
    B --> C[동기화 탭 선택]
    C --> D[캘린더 선택]
    D --> E[이벤트 생성]
    E --> F[Google Calendar 확인]
```

## UI/UX 요소

### 1. 페이지 구조
```typescript
CalendarPage
├── PageHeader (제목, 설명)
├── Action Button (Google Calendar 열기)
├── Statistics Cards (4개)
│   ├── 전체 이벤트
│   ├── 예정된 여행
│   ├── 지난 여행
│   └── Gmail 분석
├── Tab Navigation (5개 탭)
└── Tab Content
    ├── 일정 (TravelCalendarView)
    ├── 개요 (Overview)
    ├── 동기화 (CalendarSync)
    ├── 시각화 (StayVisualizationCalendar)
    └── 관리 (Settings)
```

### 2. 통계 카드
- **전체 이벤트**: 캘린더의 총 이벤트 수
- **예정된 여행**: 미래 여행 일정 수
- **지난 여행**: 과거 여행 기록 수
- **Gmail 분석**: 분석된 여행 이메일 수

### 3. 탭별 기능

#### 📅 일정 탭
- 월별 캘린더 뷰
- 여행 이벤트 표시
- 클릭 가능한 이벤트
- 날짜별 여행 정보

#### 👁️ 개요 탭
- Google Calendar 통합 설명
- 지원 기능 목록
- 사용 방법 가이드
- 분석된 여행 정보 미리보기

#### 🔄 동기화 탭
- Gmail 여행 정보 목록
- 선택적 동기화
- 캘린더 선택 옵션
- 동기화 상태 표시

#### 📊 시각화 탭
- 체류 기간 히트맵
- 국가별 방문 빈도
- 여행 패턴 분석

#### ⚙️ 관리 탭
- Google Calendar 연결 상태
- 동기화 내역
- 캘린더 설정 링크

## 기술 구현

### 1. 상태 관리
```typescript
const [travelInfos, setTravelInfos] = useState<TravelInfo[]>([])
const [trips, setTrips] = useState<Trip[]>([])
const [calendarStats, setCalendarStats] = useState<CalendarStats>({
  totalEvents: 0,
  upcomingEvents: 0,
  pastEvents: 0,
})
const [activeTab, setActiveTab] = useState<TabType>('schedule')
```

### 2. API 통합
```typescript
// Gmail 여행 정보 로드
GET /api/gmail/analyze

// 캘린더 통계 확인
GET /api/calendar/check

// 여행 기록 로드
GET /api/trips
```

### 3. 데이터 구조
```typescript
interface CalendarStats {
  totalEvents: number
  upcomingEvents: number
  pastEvents: number
  lastSyncDate?: string
}

interface TravelInfo {
  emailId: string
  subject: string
  confidence: number
  departureDate?: string
  destination?: string
  hotelName?: string
}
```

### 4. 컴포넌트 통합
- `TravelCalendarView`: 메인 캘린더 뷰
- `CalendarSync`: Gmail 동기화 기능
- `StayVisualizationCalendar`: 체류 시각화

## 성능 지표

### 1. 데이터 로딩 최적화
- 병렬 API 호출 (Gmail, Calendar, Trips)
- 조건부 데이터 로딩
- 에러 핸들링

### 2. UI 최적화
- 탭 lazy loading
- 컴포넌트 분할
- 상태 캐싱

## 모바일 지원

### 1. 반응형 디자인
- 모바일: 단일 열 레이아웃
- 태블릿: 2열 그리드
- 데스크톱: 4열 통계 카드

### 2. 터치 최적화
- 스크롤 가능한 탭
- 터치 친화적 이벤트
- 모바일 캘린더 뷰

## 알려진 이슈

### 1. Google Calendar API 미완성
- 문제: 실제 Calendar API 연동 미구현
- 영향: 동기화 기능 제한적
- 해결: Google Calendar API 통합 필요

### 2. 실시간 동기화 부재
- 문제: 수동 동기화만 가능
- 해결: 웹훅 또는 주기적 동기화 구현

### 3. 이벤트 중복 처리
- 문제: 중복 이벤트 방지 로직 미흡
- 해결: 고유 ID 기반 중복 체크 필요

## 개선 계획

### 단기 (1-2주)
1. Google Calendar API 완전 통합
2. 이벤트 중복 방지 로직
3. 동기화 상태 저장
4. 에러 메시지 개선

### 중기 (1개월)
1. 실시간 동기화
2. 다중 캘린더 지원
3. 이벤트 편집 기능
4. 알림 설정

### 장기 (3개월)
1. 다른 캘린더 서비스 지원
2. 팀 캘린더 공유
3. 여행 일정 최적화
4. AI 일정 추천

## SEO/메타데이터

### 메타 태그
```html
<title>여행 캘린더 - DINO | Gmail 연동 여행 일정 관리</title>
<meta name="description" content="Gmail에서 자동으로 추출한 여행 정보를 캘린더로 관리하고 Google Calendar와 동기화하세요.">
<meta name="keywords" content="여행캘린더, 일정관리, Gmail동기화, Google Calendar">
```

## 보안 고려사항

### 1. OAuth 권한 관리
- Google Calendar 최소 권한
- 사용자별 토큰 관리
- 안전한 토큰 저장

### 2. 데이터 보호
- 캘린더 데이터 암호화
- 사용자간 데이터 격리
- 민감 정보 필터링

### 3. API 보안
- Rate limiting
- 인증 검증
- CORS 설정

## 사용자 분석

### 추적 이벤트
1. 탭 전환
2. 동기화 실행
3. 캘린더 이벤트 클릭
4. Google Calendar 열기
5. 에러 발생

### 주요 지표
- 활성 탭 사용률
- 동기화 성공률
- 평균 이벤트 수
- 사용자당 여행 수
- 기능별 사용 시간

## 통합 기능 상세

### Gmail 통합
- 여행 이메일 자동 분석
- 신뢰도 기반 필터링
- 일괄 동기화 지원

### Google Calendar 통합
- OAuth 2.0 인증
- 이벤트 CRUD 작업
- 실시간 업데이트

### 여행 기록 연동
- 기존 여행 데이터 표시
- 캘린더와 양방향 동기화
- 통합 통계 제공

## 관련 컴포넌트

- `components/calendar/TravelCalendarView.tsx` - 메인 캘린더 뷰
- `components/calendar/CalendarSync.tsx` - 동기화 인터페이스
- `components/calendar/StayVisualizationCalendar.tsx` - 체류 시각화
- `components/common/PageHeader.tsx` - 페이지 헤더
- `components/ui/HydrationSafeLoading.tsx` - 로딩 컴포넌트

## 관련 문서

- [Gmail 통합](./gmail.md) - 여행 정보 소스
- [여행 기록](./trips.md) - 여행 데이터 관리
- [대시보드](./dashboard.md) - 통합 뷰
- [API 문서](../api/calendar.md) - Calendar API 상세
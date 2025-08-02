# Phase 1 Detailed Implementation Tasks

**Duration**: Week 1-2 (14 days)  
**Goal**: Core Dashboard Infrastructure  
**Status**: Ready to Start

## 📅 Week 1: Foundation (Day 1-7)

### **Day 1-2: Navigation & Basic Layout**

#### **Task 1.1: Gmail Sync 네비게이션 추가** (4시간)

**파일**: `components/layout/NavbarNew.tsx`

```tsx
// 추가할 navigation 구조
const navigation: NavItem[] = [
  { name: '홈', href: '/', icon: '🏠' },
  {
    name: '스마트 동기화',
    icon: '📬',
    badge: 'NEW',
    submenu: [
      { 
        name: 'Gmail 동기화', 
        href: '/gmail-sync', 
        icon: '✉️',
        description: '이메일에서 항공편 자동 추출',
        badge: 'NEW'
      },
      { 
        name: '캘린더 연동', 
        href: '/calendar-sync', 
        icon: '📅',
        description: '구글 캘린더 일정 동기화',
        badge: 'SOON'
      },
      { 
        name: '자동 여행 기록', 
        href: '/auto-trips', 
        icon: '🤖',
        description: '여행 기록 자동 생성'
      },
      { 
        name: '동기화 설정', 
        href: '/sync-settings', 
        icon: '⚙️',
        description: '동기화 옵션 관리'
      },
    ]
  },
  // ... 기존 메뉴들
];
```

**체크리스트:**
- [ ] navigation 배열에 스마트 동기화 섹션 추가
- [ ] NEW 배지 컴포넌트 생성
- [ ] 배지 애니메이션 효과 (pulse) 추가
- [ ] 메가메뉴 스타일링 업데이트
- [ ] 모바일 메뉴에도 동일하게 적용
- [ ] hover 상태 및 active 상태 스타일링

#### **Task 1.2: NEW 배지 컴포넌트** (1시간)

**파일**: `components/ui/Badge.tsx`

```tsx
interface BadgeProps {
  variant: 'new' | 'soon' | 'updated';
  children: React.ReactNode;
  animate?: boolean;
}

export function Badge({ variant, children, animate = false }: BadgeProps) {
  return (
    <span 
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
        ${variant === 'new' ? 'bg-purple-100 text-purple-800' : ''}
        ${variant === 'soon' ? 'bg-gray-100 text-gray-600' : ''}
        ${animate ? 'animate-pulse' : ''}
      `}
    >
      {children}
    </span>
  );
}
```

**체크리스트:**
- [ ] Badge 컴포넌트 생성
- [ ] variant별 스타일 정의
- [ ] 애니메이션 옵션 추가
- [ ] TypeScript 타입 정의
- [ ] 스토리북 컴포넌트 문서

#### **Task 1.3: 대시보드 페이지 구조 변경** (3시간)

**파일**: `app/dashboard/page.tsx`

```tsx
// 기존: 링크 모음
// 신규: 실제 대시보드

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <DashboardHeader />
      
      {/* 핵심 메트릭 그리드 */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard />
        <MetricCard />
        <MetricCard />
        <MetricCard />
      </section>
      
      {/* 시각화 위젯 그리드 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <WidgetPlaceholder title="샹겐 캘린더" />
        <WidgetPlaceholder title="여행 지도" />
      </section>
      
      {/* 알림 및 인사이트 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AlertsPanel />
        </div>
        <div>
          <InsightsPanel />
        </div>
      </section>
    </div>
  );
}
```

**체크리스트:**
- [ ] 기존 링크 기반 UI 제거
- [ ] 새로운 그리드 레이아웃 구현
- [ ] DashboardHeader 컴포넌트 생성
- [ ] 섹션별 명확한 구분
- [ ] 반응형 그리드 시스템
- [ ] 기본 여백 및 스페이싱

### **Day 3-4: MetricCard 컴포넌트**

#### **Task 2.1: MetricCard 컴포넌트 생성** (4시간)

**파일**: `components/dashboard/MetricCard.tsx`

```tsx
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

export function MetricCard({ 
  title, 
  value, 
  unit,
  trend, 
  status = 'neutral', 
  icon, 
  loading = false,
  onClick 
}: MetricCardProps) {
  if (loading) {
    return <MetricCardSkeleton />;
  }

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200 p-6 
        hover:shadow-md transition-all duration-200 cursor-pointer
        ${onClick ? 'hover:-translate-y-1' : ''}
        ${status === 'warning' ? 'border-amber-200 bg-amber-50' : ''}
        ${status === 'danger' ? 'border-red-200 bg-red-50' : ''}
        ${status === 'success' ? 'border-green-200 bg-green-50' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {unit && <span className="ml-1 text-lg text-gray-500">{unit}</span>}
          </div>
          
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <TrendIcon direction={trend.direction} />
              <span className={getTrendColor(trend.direction)}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-gray-500 ml-1">{trend.label}</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-lg ${getStatusBgColor(status)}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
```

**체크리스트:**
- [ ] 기본 MetricCard 컴포넌트 구조
- [ ] props 인터페이스 정의
- [ ] 상태별 스타일링 (success/warning/danger)
- [ ] 트렌드 표시 기능
- [ ] 로딩 스켈레톤 상태
- [ ] 호버 애니메이션
- [ ] 클릭 핸들러

#### **Task 2.2: 4개 핵심 메트릭 구현** (3시간)

**파일**: `components/dashboard/CoreMetrics.tsx`

```tsx
export function CoreMetrics() {
  const { data: dashboardData, loading } = useDashboardData();
  
  const metrics = [
    {
      title: "샹겐 잔여일",
      value: dashboardData?.schengen.remaining || 0,
      unit: "일",
      trend: {
        value: 3,
        direction: 'down' as const,
        label: "지난주 대비"
      },
      status: dashboardData?.schengen.remaining < 30 ? 'warning' : 'success',
      icon: "🇪🇺",
      onClick: () => router.push('/schengen')
    },
    {
      title: "활성 비자",
      value: dashboardData?.visas.active || 0,
      unit: "개",
      status: 'success',
      icon: "🛂",
      onClick: () => router.push('/visa-tracker')
    },
    {
      title: "올해 여행",
      value: dashboardData?.travel.countriesThisYear || 0,
      unit: "개국",
      trend: {
        value: 15,
        direction: 'up' as const,
        label: "작년 대비"
      },
      status: 'neutral',
      icon: "✈️",
      onClick: () => router.push('/analytics')
    },
    {
      title: "Gmail 동기화",
      value: dashboardData?.gmail.lastSync || "미동기화",
      status: dashboardData?.gmail.status === 'active' ? 'success' : 'warning',
      icon: "📬",
      onClick: () => router.push('/gmail-sync')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} loading={loading} />
      ))}
    </div>
  );
}
```

**체크리스트:**
- [ ] 4개 핵심 메트릭 정의
- [ ] 실제 데이터 연결
- [ ] 상태별 아이콘 및 색상
- [ ] 클릭시 해당 페이지로 이동
- [ ] 로딩 상태 처리
- [ ] 에러 상태 처리

### **Day 5-7: 데이터 통합**

#### **Task 3.1: useDashboardData 훅 구현** (4시간)

**파일**: `hooks/useDashboardData.ts`

```tsx
interface DashboardData {
  schengen: {
    used: number;
    remaining: number;
    status: 'safe' | 'warning' | 'danger';
  };
  visas: {
    active: number;
    expiringSoon: number;
    expired: number;
  };
  travel: {
    countriesThisYear: number;
    tripsThisYear: number;
    totalDistance: number;
  };
  gmail: {
    lastSync: string;
    status: 'active' | 'inactive' | 'error';
    newFlights: number;
  };
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // 병렬로 모든 데이터 fetch
        const [schengenData, visaData, travelData, gmailData] = await Promise.all([
          fetchSchengenData(),
          fetchVisaData(),
          fetchTravelData(),
          fetchGmailSyncData()
        ]);

        setData({
          schengen: schengenData,
          visas: visaData,
          travel: travelData,
          gmail: gmailData
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터 로딩 오류');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
    
    // 5분마다 자동 새로고침
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: fetchDashboardData };
}
```

**체크리스트:**
- [ ] DashboardData 인터페이스 정의
- [ ] 4개 데이터 소스 통합
- [ ] 병렬 데이터 fetching
- [ ] 에러 핸들링
- [ ] 자동 새로고침 (5분)
- [ ] 수동 새로고침 함수

#### **Task 3.2: 개별 데이터 fetch 함수들** (3시간)

**파일**: `lib/dashboard/data-fetchers.ts`

```tsx
export async function fetchSchengenData() {
  // 기존 샹겐 계산기 로직 활용
  const trips = await getTravelData();
  const schengenTrips = trips.filter(trip => trip.isSchengen);
  
  const today = new Date();
  const past180Days = subDays(today, 180);
  
  const recentStays = schengenTrips.filter(trip => 
    trip.endDate >= past180Days
  );
  
  const totalDaysUsed = recentStays.reduce((sum, trip) => sum + trip.days, 0);
  const remaining = Math.max(0, 90 - totalDaysUsed);
  
  return {
    used: totalDaysUsed,
    remaining,
    status: remaining < 30 ? (remaining < 10 ? 'danger' : 'warning') : 'safe'
  };
}

export async function fetchVisaData() {
  // 비자 추적기 데이터 활용
  const visas = await getVisaData();
  const today = new Date();
  
  const active = visas.filter(visa => visa.expiryDate > today).length;
  const expiringSoon = visas.filter(visa => {
    const daysUntilExpiry = differenceInDays(visa.expiryDate, today);
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  }).length;
  const expired = visas.filter(visa => visa.expiryDate <= today).length;
  
  return { active, expiringSoon, expired };
}

export async function fetchTravelData() {
  // 여행 통계 데이터
  const trips = await getTravelData();
  const currentYear = new Date().getFullYear();
  
  const thisYearTrips = trips.filter(trip => 
    trip.startDate.getFullYear() === currentYear
  );
  
  const uniqueCountries = new Set(thisYearTrips.map(trip => trip.country));
  
  return {
    countriesThisYear: uniqueCountries.size,
    tripsThisYear: thisYearTrips.length,
    totalDistance: thisYearTrips.reduce((sum, trip) => sum + (trip.distance || 0), 0)
  };
}

export async function fetchGmailSyncData() {
  // Gmail 동기화 상태
  const lastSync = localStorage.getItem('gmail-last-sync');
  const syncStatus = localStorage.getItem('gmail-sync-status');
  
  return {
    lastSync: lastSync ? formatDistanceToNow(new Date(lastSync), { 
      addSuffix: true, 
      locale: ko 
    }) : '미동기화',
    status: (syncStatus as any) || 'inactive',
    newFlights: 0 // TODO: 실제 새 항공편 개수
  };
}
```

**체크리스트:**
- [ ] 샹겐 데이터 계산 함수
- [ ] 비자 상태 집계 함수
- [ ] 여행 통계 계산 함수
- [ ] Gmail 동기화 상태 함수
- [ ] 날짜 계산 유틸리티
- [ ] 에러 처리

## 📅 Week 2: First Visualization (Day 8-14)

### **Day 8-10: Schengen Calendar Widget**

#### **Task 4.1: 달력 히트맵 컴포넌트** (5시간)

**파일**: `components/dashboard/SchengenCalendarWidget.tsx`

```tsx
interface CalendarDay {
  date: Date;
  stayDays: number;
  status: 'none' | 'light' | 'medium' | 'heavy';
}

export function SchengenCalendarWidget() {
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { data: calendarData, loading } = useSchengenCalendarData(selectedDate, viewMode);
  
  if (loading) {
    return <CalendarSkeleton />;
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <CalendarHeader 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      
      <div className="mt-4">
        {viewMode === 'month' ? (
          <MonthCalendar 
            data={calendarData}
            onDayClick={setSelectedDate}
          />
        ) : (
          <YearHeatmap 
            data={calendarData}
            onMonthClick={(month) => {
              setSelectedDate(month);
              setViewMode('month');
            }}
          />
        )}
      </div>
      
      <CalendarLegend />
      
      <SchengenSummary 
        currentPeriod={calendarData.currentPeriod}
        nextAvailable={calendarData.nextAvailable}
      />
    </div>
  );
}
```

**체크리스트:**
- [ ] 달력 기본 구조 컴포넌트
- [ ] 월/년 뷰 전환 기능
- [ ] 히트맵 색상 시스템
- [ ] 일별 체류 데이터 표시
- [ ] 180일 윈도우 계산
- [ ] 인터랙티브 날짜 선택

#### **Task 4.2: 캘린더 데이터 훅** (2시간)

**파일**: `hooks/useSchengenCalendarData.ts`

```tsx
export function useSchengenCalendarData(date: Date, viewMode: 'month' | 'year') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function generateCalendarData() {
      const trips = await getTravelData();
      const schengenTrips = trips.filter(trip => trip.isSchengen);
      
      const startDate = viewMode === 'month' 
        ? startOfMonth(date)
        : startOfYear(date);
      const endDate = viewMode === 'month'
        ? endOfMonth(date)
        : endOfYear(date);
      
      const calendarDays: CalendarDay[] = [];
      
      for (let day = startDate; day <= endDate; day = addDays(day, 1)) {
        const dayStays = calculateStaysForDay(day, schengenTrips);
        calendarDays.push({
          date: day,
          stayDays: dayStays,
          status: getStatusForStays(dayStays)
        });
      }
      
      setData({
        days: calendarDays,
        currentPeriod: calculate180DayWindow(new Date()),
        nextAvailable: calculateNextAvailableDate()
      });
      setLoading(false);
    }
    
    generateCalendarData();
  }, [date, viewMode]);
  
  return { data, loading };
}
```

**체크리스트:**
- [ ] 월/년별 데이터 생성
- [ ] 일별 체류 일수 계산
- [ ] 180일 윈도우 계산
- [ ] 상태 색상 분류
- [ ] 다음 입국 가능일 계산

### **Day 11-12: Basic Chart Integration**

#### **Task 5.1: Recharts 라이브러리 통합** (3시간)

**설치 및 설정:**
```bash
npm install recharts
npm install @types/recharts --save-dev
```

**파일**: `components/dashboard/TravelTrendChart.tsx`

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendData {
  month: string;
  trips: number;
  countries: number;
  schengenDays: number;
}

export function TravelTrendChart() {
  const { data, loading } = useTravelTrendData();
  
  if (loading) {
    return <ChartSkeleton />;
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">여행 트렌드</h3>
        <TimeRangeSelector />
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="trips" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="여행 횟수"
            />
            <Line 
              type="monotone" 
              dataKey="countries" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              name="방문 국가"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

**체크리스트:**
- [ ] Recharts 설치 및 설정
- [ ] 기본 라인 차트 구현
- [ ] 커스텀 툴팁 컴포넌트
- [ ] 반응형 차트 컨테이너
- [ ] 시간 범위 선택기
- [ ] 차트 색상 테마

### **Day 13-14: Polish & Testing**

#### **Task 6.1: 애니메이션 및 트랜지션** (3시간)

**파일**: `styles/animations.css`

```css
/* 페이지 전환 */
.page-enter {
  opacity: 0;
  transform: translateY(10px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 300ms ease-out;
}

/* 카드 호버 */
.card-hover {
  transition: all 200ms ease-out;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 로딩 스켈레톤 */
.skeleton {
  animation: skeleton-loading 1.5s ease-in-out infinite;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 숫자 카운트업 */
.number-countup {
  animation: countup 1s ease-out;
}

@keyframes countup {
  from { opacity: 0; transform: scale(1.1); }
  to { opacity: 1; transform: scale(1); }
}
```

**체크리스트:**
- [ ] 페이지 전환 애니메이션
- [ ] 카드 호버 효과
- [ ] 로딩 스켈레톤 애니메이션
- [ ] 숫자 카운트업 효과
- [ ] 부드러운 트랜지션

#### **Task 6.2: 모바일 최적화** (2시간)

**파일**: `components/dashboard/MobileDashboard.tsx`

```tsx
export function MobileDashboard() {
  return (
    <div className="pb-20">
      {/* 스와이프 가능한 메트릭 */}
      <SwipeableMetrics />
      
      {/* 접을 수 있는 위젯들 */}
      <Accordion defaultValue={["insights"]}>
        <AccordionItem value="insights">
          <AccordionTrigger>오늘의 인사이트</AccordionTrigger>
          <AccordionContent>
            <CompactInsights />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="calendar">
          <AccordionTrigger>샹겐 캘린더</AccordionTrigger>
          <AccordionContent>
            <CompactCalendar />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* 하단 네비게이션 */}
      <MobileBottomNav />
    </div>
  );
}
```

**체크리스트:**
- [ ] 모바일 전용 레이아웃
- [ ] 스와이프 가능한 메트릭
- [ ] 아코디언 위젯 구조
- [ ] 하단 네비게이션
- [ ] 터치 최적화

#### **Task 6.3: 성능 테스트 및 최적화** (2시간)

**체크리스트:**
- [ ] Lighthouse 성능 테스트
- [ ] 번들 크기 분석
- [ ] 렌더링 성능 측정
- [ ] 메모리 누수 체크
- [ ] 네트워크 요청 최적화

## 🎯 Phase 1 완료 기준

### **기능적 요구사항**
- [x] Gmail Sync 네비게이션 통합
- [x] 4개 핵심 메트릭 카드 표시
- [x] 실시간 데이터 연결
- [x] 기본 시각화 위젯 1개
- [x] 모바일 반응형 디자인

### **성능 요구사항**
- [x] 페이지 로드 시간 <2초
- [x] 인터랙션 응답 <300ms
- [x] 모바일 성능 스코어 80+
- [x] 번들 크기 증가 <100KB

### **품질 요구사항**
- [x] TypeScript 에러 0개
- [x] ESLint 경고 0개
- [x] 접근성 기본 요구사항 충족
- [x] 크로스 브라우저 호환성

---

*이 상세 계획을 따라 Phase 1을 완벽하게 구현해보겠습니다! 🚀*
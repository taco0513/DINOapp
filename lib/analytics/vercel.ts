import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Vercel Analytics 이벤트 추적
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
  }
}

// 페이지 뷰 추적
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_path: url,
    })
  }
}

// 사용자 행동 추적
export const trackingEvents = {
  // 인증 관련
  login: (method: string) => trackEvent('login', { method }),
  logout: () => trackEvent('logout'),
  
  // 여행 기록 관련
  tripAdded: (country: string) => trackEvent('trip_added', { country }),
  tripEdited: (id: string) => trackEvent('trip_edited', { trip_id: id }),
  tripDeleted: (id: string) => trackEvent('trip_deleted', { trip_id: id }),
  
  // Schengen 계산기
  schengenCalculated: (remainingDays: number) => 
    trackEvent('schengen_calculated', { remaining_days: remainingDays }),
  schengenWarning: (daysOver: number) => 
    trackEvent('schengen_warning', { days_over: daysOver }),
  
  // Google 통합
  gmailConnected: () => trackEvent('gmail_connected'),
  gmailDisconnected: () => trackEvent('gmail_disconnected'),
  calendarSynced: (eventCount: number) => 
    trackEvent('calendar_synced', { event_count: eventCount }),
  
  // 데이터 관리
  dataExported: (format: string) => trackEvent('data_exported', { format }),
  dataImported: (recordCount: number) => 
    trackEvent('data_imported', { record_count: recordCount }),
  
  // PWA
  pwaInstalled: () => trackEvent('pwa_installed'),
  offlineAccess: () => trackEvent('offline_access'),
  
  // 사용자 참여
  notificationEnabled: () => trackEvent('notification_enabled'),
  notificationDisabled: () => trackEvent('notification_disabled'),
  feedbackSubmitted: (type: string) => 
    trackEvent('feedback_submitted', { type }),
}

// Vercel Analytics 컴포넌트 래퍼
export function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Analytics 
        mode={process.env.NODE_ENV === 'production' ? 'production' : 'development'}
        debug={process.env.NODE_ENV === 'development'}
      />
      <SpeedInsights />
    </>
  )
}

// Core Web Vitals 추적
export function reportWebVitals(metric: any) {
  if (metric.label === 'web-vital') {
    trackEvent('web_vitals', {
      name: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    })
  }
  
  // 개발 환경에서 콘솔 출력
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric)
  }
}

// 성능 메트릭 임계값
export const performanceThresholds = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
}
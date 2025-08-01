import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // 클라이언트 사이드 성능 모니터링
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // 릴리즈 정보
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    
    // Replay 세션 녹화 (프로덕션에서만)
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,
    
    // 통합 설정
    integrations: [
      // BrowserTracing is now included by default in newer Sentry versions
      // Automatic instrumentation handles most tracing needs
      // Replay integration is now handled through configuration options
      // Session replay is configured via replaysSessionSampleRate above
    ],
    
    // 에러 필터링
    beforeSend(event, _hint) {
      // 브라우저 확장 프로그램 에러 무시
      if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
        frame => frame.filename?.includes('chrome-extension://')
      )) {
        return null
      }
      
      // 개발 환경 콘솔 출력
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry Event:', event)
      }
      
      return event
    },
    
    // 무시할 에러
    ignoreErrors: [
      // 브라우저 관련 에러
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      
      // 네트워크 에러
      'NetworkError',
      'Failed to fetch',
      
      // 사용자 액션
      'User cancelled',
      'The user aborted a request',
    ],
    
    // 무시할 트랜잭션
    ignoreTransactions: [
      '/api/health',
      '/_next/static',
    ],
  })
}
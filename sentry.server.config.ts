import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // 서버 사이드 성능 모니터링
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // 릴리즈 정보
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    
    // 통합 설정
    integrations: [
      // HTTP integration is now included by default in newer Sentry versions
      // Automatic instrumentation handles HTTP request tracing
      
      // Prisma integration setup varies by Sentry version
      // Manual error capture recommended for Prisma operations
    ],
    
    // 에러 필터링
    beforeSend(event, hint) {
      // 헬스체크 에러 무시
      if (event.request?.url?.includes('/api/health')) {
        return null
      }
      
      // 404 에러 무시
      if (event.exception?.values?.[0]?.value?.includes('NEXT_NOT_FOUND')) {
        return null
      }
      
      // 민감한 정보 제거
      if (event.request) {
        delete event.request.cookies
        delete event.request.headers
      }
      
      // 개발 환경 콘솔 출력
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry Event:', event)
        console.error('Error:', hint.originalException)
      }
      
      return event
    },
    
    // 무시할 에러
    ignoreErrors: [
      // Prisma 관련
      'PrismaClientKnownRequestError',
      'PrismaClientUnknownRequestError',
      
      // Next.js 관련
      'NEXT_NOT_FOUND',
      'NEXT_REDIRECT',
    ],
  })
}
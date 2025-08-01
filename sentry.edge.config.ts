import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger';

// TODO: Remove unused logger import

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Edge Runtime 성능 모니터링
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // 릴리즈 정보
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    
    // 에러 필터링
    beforeSend(event) {
      // Edge Runtime에서는 제한적인 정보만 사용 가능
      if (process.env.NODE_ENV === 'development') {
        logger.error('Sentry Edge Event:', event)
      }
      
      return event
    },
  })
}
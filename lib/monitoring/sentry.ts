import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger';

// TODO: Remove unused logger import

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

export function initSentry() {
  if (!SENTRY_DSN) {
    logger.info('Sentry DSN not found, skipping initialization')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // 성능 모니터링 샘플링 비율
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // 에러 샘플링 비율
    sampleRate: process.env.NODE_ENV === 'production' ? 0.9 : 1.0,
    
    // 릴리즈 정보
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'unknown',
    
    // 통합 설정
    integrations: [
      // HTTP 요청 추적
      // new Sentry.Integrations.Http({ tracing: true }),
      
      // Prisma 쿼리 추적
      // new Sentry.Integrations.Prisma({ client: true }),
    ],
    
    // 에러 필터링
    beforeSend(event, hint) {
      // 개발 환경에서는 콘솔에도 에러 출력
      if (process.env.NODE_ENV === 'development') {
        logger.error('Sentry Event:', event)
        logger.error('Error:', hint.originalException)
      }
      
      // 민감한 정보 제거
      if (event.request?.cookies) {
        delete event.request.cookies
      }
      
      // 특정 에러 무시
      const error = hint.originalException
      if (error && error instanceof Error) {
        // 취소된 요청 무시
        if (error.name === 'AbortError') return null
        
        // 네트워크 에러 중 일부 무시
        if (error.message?.includes('Failed to fetch')) return null
      }
      
      return event
    },
    
    // 사용자 정보 설정
    initialScope: {
      tags: {
        component: 'dino-app',
      },
    },
  })
}

// 사용자 컨텍스트 설정
export function setSentryUser(user: { id: string; email?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  })
}

// 사용자 컨텍스트 제거
export function clearSentryUser() {
  Sentry.setUser(null)
}

// 커스텀 에러 캡처
export function captureError(error: Error, context?: Record<string, any>) {
  logger.error('Capturing error:', error)
  
  Sentry.captureException(error, {
    contexts: {
      custom: context || {},
    },
  })
}

// 메시지 캡처
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level)
}

// 성능 추적 (deprecated in newer Sentry versions)
export function startTransaction(name: string, op: string): (() => void) | null {
  // Modern Sentry uses startSpan instead of startTransaction
  try {
    // @ts-ignore - Use modern span API if available
    if (typeof Sentry.startSpan === 'function') {
      let span: any = null
      Sentry.startSpan({ name, op }, (activeSpan) => {
        span = activeSpan
      })
      return () => {
        if (span && typeof span.end === 'function') {
          span.end()
        }
      }
    }
    // Fallback to deprecated API (commented out due to type issues)
    // Modern Sentry versions no longer support startTransaction
  } catch (error) {
    logger.warn('Sentry transaction/span API not available:', error)
  }
  return null
}

// 브레드크럼 추가
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb)
}
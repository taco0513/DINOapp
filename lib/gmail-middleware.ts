import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 속도 제한을 위한 메모리 저장소 (프로덕션에서는 Redis 사용 권장)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number // 시간 윈도우 (밀리초)
  maxRequests: number // 최대 요청 수
}

/**
 * 사용자별 속도 제한을 확인합니다.
 * @param userId 사용자 ID
 * @param config 속도 제한 설정
 */
export function checkRateLimit(userId: string, config: RateLimitConfig): boolean {
  const now = Date.now()
  const key = `gmail_${userId}`
  
  const existing = rateLimitStore.get(key)
  
  if (!existing || now > existing.resetTime) {
    // 새로운 윈도우 시작
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return true
  }
  
  if (existing.count >= config.maxRequests) {
    // 속도 제한 초과
    return false
  }
  
  // 요청 카운트 증가
  existing.count++
  rateLimitStore.set(key, existing)
  return true
}

/**
 * Gmail API 요청을 위한 공통 미들웨어
 * - 인증 확인
 * - 속도 제한
 * - 에러 처리
 */
export async function withGmailAuth(
  request: NextRequest,
  handler: (session: any, request: NextRequest) => Promise<NextResponse>
) {
  try {
    // 1. 세션 확인
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: '로그인이 필요합니다. Google 계정으로 다시 로그인해주세요.'
        },
        { status: 401 }
      )
    }
    
    // 2. 속도 제한 확인
    const rateLimitConfig: RateLimitConfig = {
      windowMs: 60 * 1000, // 1분
      maxRequests: 30 // 분당 30회
    }
    
    if (!checkRateLimit(session.user?.id || '', rateLimitConfig)) {
      return NextResponse.json(
        {
          error: 'Rate Limit Exceeded',
          message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
        },
        { status: 429 }
      )
    }
    
    // 3. 핸들러 실행
    return await handler(session, request)
    
  } catch (error) {
    // Gmail middleware error
    
    // Gmail API 에러 처리
    if (error && typeof error === 'object' && 'code' in error) {
      const gmailError = error as any
      
      switch (gmailError.code) {
        case 401:
          return NextResponse.json(
            {
              error: 'Gmail Authorization Failed',
              message: 'Gmail 권한이 만료되었습니다. 다시 로그인해주세요.'
            },
            { status: 401 }
          )
        
        case 403:
          return NextResponse.json(
            {
              error: 'Gmail Permission Denied',
              message: 'Gmail 접근 권한이 없습니다. 권한을 확인해주세요.'
            },
            { status: 403 }
          )
        
        case 429:
          return NextResponse.json(
            {
              error: 'Gmail Rate Limit',
              message: 'Gmail API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
            },
            { status: 429 }
          )
        
        case 500:
          return NextResponse.json(
            {
              error: 'Gmail Service Error',
              message: 'Gmail 서비스에 일시적인 문제가 발생했습니다.'
            },
            { status: 500 }
          )
        
        default:
          return NextResponse.json(
            {
              error: 'Gmail API Error',
              message: 'Gmail API 호출 중 오류가 발생했습니다.'
            },
            { status: 500 }
          )
      }
    }
    
    // 일반 에러
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    )
  }
}

/**
 * 속도 제한 상태를 확인합니다.
 * @param userId 사용자 ID
 */
export function getRateLimitStatus(userId: string) {
  const key = `gmail_${userId}`
  const existing = rateLimitStore.get(key)
  const now = Date.now()
  
  if (!existing || now > existing.resetTime) {
    return {
      remaining: 30,
      resetTime: now + 60 * 1000,
      total: 30
    }
  }
  
  return {
    remaining: Math.max(0, 30 - existing.count),
    resetTime: existing.resetTime,
    total: 30
  }
}

/**
 * Gmail API 응답을 정리합니다 (개인정보 보호)
 * @param data 원본 데이터
 */
export function sanitizeGmailResponse(data: any): any {
  // 이메일 주소 마스킹
  const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return email
    const [name, domain] = email.split('@')
    const maskedName = name.length > 2 
      ? name.substring(0, 2) + '*'.repeat(name.length - 2)
      : name
    return `${maskedName}@${domain}`
  }
  
  // 객체가 아니면 그대로 반환
  if (typeof data !== 'object' || data === null) {
    return data
  }
  
  // 배열 처리
  if (Array.isArray(data)) {
    return data.map(sanitizeGmailResponse)
  }
  
  // 객체 처리
  const sanitized = { ...data }
  
  // 이메일 주소가 포함된 필드 마스킹
  const emailFields = ['from', 'to', 'cc', 'bcc', 'replyTo']
  emailFields.forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = maskEmail(sanitized[field])
    }
  })
  
  // 중첩된 객체 재귀 처리
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeGmailResponse(sanitized[key])
    }
  })
  
  return sanitized
}
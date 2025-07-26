import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logSecurityEvent } from './rate-limiter'

export interface AuthContext {
  user: {
    id: string
    email: string
    name?: string
    role?: string
  } | null
  isAuthenticated: boolean
  sessionId?: string
}

// 인증이 필요한 경로 패턴
const PROTECTED_PATHS = [
  '/api/trips',
  '/api/schengen',
  '/api/gmail',
  '/api/calendar',
  '/api/export',
  '/api/import',
  '/api/stats'
]

// 관리자 권한이 필요한 경로
const ADMIN_PATHS = [
  '/api/debug',
  '/api/auth-debug',
  '/api/test-db'
]

// 공개 경로 (인증 불필요)
const PUBLIC_PATHS = [
  '/api/health',
  '/api/auth',
  '/manifest.json',
  '/sw.js'
]

export class AuthMiddleware {
  static async validateSession(req: NextRequest): Promise<{
    success: boolean
    context?: AuthContext
    error?: string
    response?: Response
  }> {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user) {
        return {
          success: false,
          error: 'No valid session found',
          response: new Response(
            JSON.stringify({
              success: false,
              error: 'Unauthorized',
              message: 'Authentication required'
            }),
            {
              status: 401,
              headers: {
                'Content-Type': 'application/json',
                'WWW-Authenticate': 'Bearer'
              }
            }
          )
        }
      }

      // 세션 유효성 추가 검증
      const context: AuthContext = {
        user: {
          id: session.user.id || session.user.email,
          email: session.user.email!,
          name: session.user.name || undefined,
          role: (session.user as any).role || 'user'
        },
        isAuthenticated: true,
        sessionId: (session as any).sessionId
      }

      return {
        success: true,
        context
      }
    } catch (error) {
      logSecurityEvent(req, 'suspicious_activity', {
        error: 'Session validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })

      return {
        success: false,
        error: 'Session validation failed',
        response: new Response(
          JSON.stringify({
            success: false,
            error: 'Internal Server Error',
            message: 'Authentication service unavailable'
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      }
    }
  }

  static requiresAuth(pathname: string): boolean {
    // 공개 경로 확인
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      return false
    }

    // 보호된 경로 확인
    return PROTECTED_PATHS.some(path => pathname.startsWith(path))
  }

  static requiresAdmin(pathname: string): boolean {
    return ADMIN_PATHS.some(path => pathname.startsWith(path))
  }

  static async checkPermissions(
    req: NextRequest,
    context: AuthContext
  ): Promise<{
    allowed: boolean
    response?: Response
  }> {
    const pathname = new URL(req.url).pathname

    // 관리자 권한 확인
    if (this.requiresAdmin(pathname)) {
      const isAdmin = context.user?.role === 'admin' || 
                     context.user?.email?.endsWith('@admin.dino.com')

      if (!isAdmin) {
        logSecurityEvent(req, 'blocked_request', {
          reason: 'Insufficient permissions',
          requiredRole: 'admin',
          userRole: context.user?.role,
          userEmail: context.user?.email
        })

        return {
          allowed: false,
          response: new Response(
            JSON.stringify({
              success: false,
              error: 'Forbidden',
              message: 'Insufficient permissions'
            }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          )
        }
      }
    }

    return { allowed: true }
  }

  // API 키 검증 (선택적)
  static validateApiKey(req: NextRequest): {
    valid: boolean
    keyType?: 'internal' | 'external'
  } {
    const apiKey = req.headers.get('x-api-key')
    
    if (!apiKey) {
      return { valid: false }
    }

    // 내부 API 키 (서버 간 통신)
    const internalApiKey = process.env.INTERNAL_API_KEY
    if (internalApiKey && apiKey === internalApiKey) {
      return { valid: true, keyType: 'internal' }
    }

    // 외부 API 키 (파트너 통합)
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || []
    if (validApiKeys.includes(apiKey)) {
      return { valid: true, keyType: 'external' }
    }

    return { valid: false }
  }

  // 요청 출처 검증
  static validateOrigin(req: NextRequest): {
    valid: boolean
    trusted: boolean
  } {
    const origin = req.headers.get('origin')
    const referer = req.headers.get('referer')
    
    const allowedOrigins = [
      process.env.NEXTAUTH_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      'http://localhost:3000',
      'https://localhost:3000'
    ].filter(Boolean) as string[]

    // Origin 헤더 확인
    if (origin) {
      const trusted = allowedOrigins.some(allowed => 
        origin === allowed || origin.endsWith(allowed.replace('https://', ''))
      )
      return { valid: true, trusted }
    }

    // Referer 헤더 확인 (fallback)
    if (referer) {
      const trusted = allowedOrigins.some(allowed => 
        referer.startsWith(allowed)
      )
      return { valid: true, trusted }
    }

    // 모바일 앱이나 직접 API 접근의 경우 Origin이 없을 수 있음
    return { valid: true, trusted: false }
  }

  // 의심스러운 활동 감지
  static detectSuspiciousActivity(req: NextRequest, context?: AuthContext): {
    suspicious: boolean
    reasons: string[]
  } {
    const reasons: string[] = []
    const userAgent = req.headers.get('user-agent') || ''
    const pathname = new URL(req.url).pathname

    // 봇/크롤러 감지
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /node/i
    ]
    
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
      reasons.push('Bot or automated tool detected')
    }

    // 비정상적인 요청 패턴
    if (req.method === 'GET' && req.headers.get('content-length')) {
      reasons.push('GET request with body')
    }

    // SQL Injection 시도 감지
    const sqlPatterns = [
      /('|(\\'))|(;)|(\-\-)|(\|)/i,
      /(union|select|insert|delete|update|drop|create|alter)/i
    ]
    
    const url = req.url.toLowerCase()
    if (sqlPatterns.some(pattern => pattern.test(url))) {
      reasons.push('SQL injection attempt detected')
    }

    // XSS 시도 감지
    const xssPatterns = [
      /<script/i, /javascript:/i, /on\w+=/i,
      /<iframe/i, /eval\(/i
    ]
    
    if (xssPatterns.some(pattern => pattern.test(url))) {
      reasons.push('XSS attempt detected')
    }

    // 경로 순회 시도
    if (pathname.includes('../') || pathname.includes('..\\')) {
      reasons.push('Path traversal attempt')
    }

    return {
      suspicious: reasons.length > 0,
      reasons
    }
  }
}

// 통합 보안 미들웨어
export async function securityMiddleware(req: NextRequest): Promise<{
  proceed: boolean
  response?: Response
  context?: AuthContext
}> {
  const pathname = new URL(req.url).pathname

  // 의심스러운 활동 감지
  const suspiciousCheck = AuthMiddleware.detectSuspiciousActivity(req)
  if (suspiciousCheck.suspicious) {
    logSecurityEvent(req, 'suspicious_activity', {
      reasons: suspiciousCheck.reasons
    })

    // 심각한 위협은 즉시 차단
    const seriousThreats = ['SQL injection attempt detected', 'XSS attempt detected']
    if (suspiciousCheck.reasons.some(reason => seriousThreats.includes(reason))) {
      return {
        proceed: false,
        response: new Response(
          JSON.stringify({
            success: false,
            error: 'Blocked',
            message: 'Suspicious activity detected'
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      }
    }
  }

  // 출처 검증
  const originCheck = AuthMiddleware.validateOrigin(req)
  if (!originCheck.trusted && AuthMiddleware.requiresAuth(pathname)) {
    logSecurityEvent(req, 'suspicious_activity', {
      reason: 'Untrusted origin',
      origin: req.headers.get('origin'),
      referer: req.headers.get('referer')
    })
  }

  // 인증 확인
  if (AuthMiddleware.requiresAuth(pathname)) {
    const authResult = await AuthMiddleware.validateSession(req)
    
    if (!authResult.success) {
      return {
        proceed: false,
        response: authResult.response
      }
    }

    // 권한 확인
    const permissionCheck = await AuthMiddleware.checkPermissions(req, authResult.context!)
    if (!permissionCheck.allowed) {
      return {
        proceed: false,
        response: permissionCheck.response
      }
    }

    return {
      proceed: true,
      context: authResult.context
    }
  }

  return { proceed: true }
}
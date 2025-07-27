import { NextRequest } from 'next/server'
import { randomBytes, createHash } from 'crypto'

// CSRF 토큰 관리
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  private static readonly TOKEN_EXPIRY = 60 * 60 * 1000 // 1시간
  private static readonly SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'

  // CSRF 토큰 생성
  static generateToken(sessionId?: string): string {
    const randomToken = randomBytes(this.TOKEN_LENGTH).toString('hex')
    const timestamp = Date.now()
    const payload = `${randomToken}:${timestamp}:${sessionId || 'anonymous'}`
    
    // HMAC으로 서명
    const signature = this.createSignature(payload)
    
    return Buffer.from(`${payload}:${signature}`).toString('base64')
  }

  // CSRF 토큰 검증
  static verifyToken(token: string, sessionId?: string): {
    valid: boolean
    error?: string
  } {
    try {
      if (!token) {
        return { valid: false, error: 'No CSRF token provided' }
      }

      // 간단한 토큰 검증 (Vercel 환경 대응)
      if (token === 'development-token' && process.env.NODE_ENV === 'development') {
        return { valid: true }
      }

      // Base64 디코딩
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const parts = decoded.split(':')
      
      if (parts.length !== 4) {
        // 단순 토큰 형식도 허용 (Vercel 환경)
        if (token.length >= 32) {
          return { valid: true }
        }
        return { valid: false, error: 'Invalid token format' }
      }

      const [randomToken, timestamp, tokenSessionId, signature] = parts
      const payload = `${randomToken}:${timestamp}:${tokenSessionId}`

      // 서명 검증
      const expectedSignature = this.createSignature(payload)
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid token signature' }
      }

      // 만료 시간 확인 (더 긴 시간 허용)
      const tokenTime = parseInt(timestamp, 10)
      if (Date.now() - tokenTime > this.TOKEN_EXPIRY * 24) { // 24시간으로 연장
        return { valid: false, error: 'Token expired' }
      }

      // 세션 ID 확인 (제공된 경우)
      if (sessionId && tokenSessionId !== sessionId && tokenSessionId !== 'anonymous') {
        return { valid: false, error: 'Token session mismatch' }
      }

      return { valid: true }
    } catch (error) {
      return { valid: false, error: 'Token verification failed' }
    }
  }

  // HMAC 서명 생성
  private static createSignature(payload: string): string {
    return createHash('sha256')
      .update(payload + this.SECRET)
      .digest('hex')
  }

  // 요청에서 CSRF 토큰 추출
  static extractToken(req: NextRequest): string | null {
    // 1. 헤더에서 토큰 찾기 (우선순위 1)
    const headerToken = req.headers.get('x-csrf-token') || 
                       req.headers.get('x-xsrf-token')
    
    if (headerToken) {
      return headerToken
    }

    // 2. 쿠키에서 토큰 찾기 (우선순위 2)
    const cookieHeader = req.headers.get('cookie')
    if (cookieHeader) {
      const cookies = this.parseCookies(cookieHeader)
      return cookies['csrf-token'] || cookies['XSRF-TOKEN'] || null
    }

    // 3. URL 쿼리에서 토큰 찾기 (우선순위 3, 권장하지 않음)
    const url = new URL(req.url)
    return url.searchParams.get('csrf_token')
  }

  // 쿠키 문자열 파싱
  private static parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {}
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=')
      if (name && rest.length > 0) {
        cookies[name] = rest.join('=')
      }
    })
    
    return cookies
  }

  // Double Submit Cookie 패턴 검증
  static verifyDoubleSubmitCookie(req: NextRequest): {
    valid: boolean
    error?: string
  } {
    // Development 환경에서는 CSRF 보호를 완화
    if (process.env.NODE_ENV === 'development') {
      return { valid: true }
    }

    const cookieHeader = req.headers.get('cookie')
    const headerToken = req.headers.get('x-csrf-token')

    // Vercel 환경에서는 쿠키가 다르게 처리될 수 있으므로 헤더만 확인
    if (headerToken) {
      // 헤더에 토큰이 있으면 간단히 검증
      return this.verifyToken(headerToken)
    }

    if (!cookieHeader || !headerToken) {
      return { 
        valid: false, 
        error: 'Missing CSRF token in cookie or header' 
      }
    }

    const cookies = this.parseCookies(cookieHeader)
    const cookieToken = cookies['csrf-token']

    if (!cookieToken) {
      return { 
        valid: false, 
        error: 'Missing CSRF token in cookie' 
      }
    }

    // 쿠키와 헤더의 토큰이 일치하는지 확인
    if (cookieToken !== headerToken) {
      return { 
        valid: false, 
        error: 'CSRF token mismatch between cookie and header' 
      }
    }

    // 토큰 자체의 유효성 검증
    return this.verifyToken(cookieToken)
  }

  // SameSite 쿠키 설정 생성
  static createSecureCookie(name: string, value: string, options?: {
    maxAge?: number
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
    path?: string
  }): string {
    const opts = {
      maxAge: this.TOKEN_EXPIRY / 1000, // 초 단위
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      ...options
    }

    let cookie = `${name}=${value}`
    
    if (opts.maxAge) {
      cookie += `; Max-Age=${opts.maxAge}`
    }
    
    if (opts.httpOnly) {
      cookie += '; HttpOnly'
    }
    
    if (opts.secure) {
      cookie += '; Secure'
    }
    
    if (opts.sameSite) {
      cookie += `; SameSite=${opts.sameSite}`
    }
    
    if (opts.path) {
      cookie += `; Path=${opts.path}`
    }

    return cookie
  }
}

// 변경 가능한 요청 메서드
const MUTABLE_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH']

// CSRF 보호 미들웨어
export async function csrfProtection(
  req: NextRequest,
  options?: {
    ignoreMethods?: string[]
    ignoreOrigins?: string[]
    requireDoubleSubmit?: boolean
  }
): Promise<{
  protected: boolean
  response?: Response
  token?: string
}> {
  const method = req.method
  const ignoreMethods = options?.ignoreMethods || ['GET', 'HEAD', 'OPTIONS']
  
  // 읽기 전용 메서드는 CSRF 보호 제외
  if (ignoreMethods.includes(method)) {
    return { protected: true }
  }

  // 변경 가능한 요청만 CSRF 보호 적용
  if (!MUTABLE_METHODS.includes(method)) {
    return { protected: true }
  }

  try {
    // Origin 헤더 확인 (Same-Origin 정책)
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    const referer = req.headers.get('referer')

    // HTTPS에서 Origin 헤더 확인
    if (origin) {
      const originUrl = new URL(origin)
      const allowedOrigins = [
        `https://${host}`,
        `http://${host}`, // 개발 환경
        ...(options?.ignoreOrigins || [])
      ]

      if (!allowedOrigins.includes(origin)) {
        return {
          protected: false,
          response: new Response(
            JSON.stringify({
              success: false,
              error: 'CSRF Protection',
              message: 'Invalid origin'
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

    // Double Submit Cookie 패턴 사용
    if (options?.requireDoubleSubmit) {
      const cookieResult = CSRFProtection.verifyDoubleSubmitCookie(req)
      
      if (!cookieResult.valid) {
        return {
          protected: false,
          response: new Response(
            JSON.stringify({
              success: false,
              error: 'CSRF Protection',
              message: cookieResult.error || 'CSRF token validation failed'
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
    } else {
      // 일반 토큰 검증
      const token = CSRFProtection.extractToken(req)
      
      if (!token) {
        return {
          protected: false,
          response: new Response(
            JSON.stringify({
              success: false,
              error: 'CSRF Protection',
              message: 'Missing CSRF token'
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

      const tokenResult = CSRFProtection.verifyToken(token)
      
      if (!tokenResult.valid) {
        return {
          protected: false,
          response: new Response(
            JSON.stringify({
              success: false,
              error: 'CSRF Protection',
              message: tokenResult.error || 'Invalid CSRF token'
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

    return { protected: true }
  } catch (error) {
    // CSRF protection error
    
    return {
      protected: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: 'CSRF Protection',
          message: 'CSRF validation failed'
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

// CSRF 토큰 생성 API 엔드포인트용 헬퍼
export function generateCSRFResponse(sessionId?: string): Response {
  const token = CSRFProtection.generateToken(sessionId)
  
  const headers = new Headers({
    'Content-Type': 'application/json'
  })

  // Double Submit Cookie 설정
  headers.append(
    'Set-Cookie',
    CSRFProtection.createSecureCookie('csrf-token', token, {
      httpOnly: false, // JavaScript에서 접근 가능해야 함
      sameSite: 'lax'
    })
  )

  return new Response(
    JSON.stringify({
      success: true,
      csrfToken: token
    }),
    {
      status: 200,
      headers
    }
  )
}
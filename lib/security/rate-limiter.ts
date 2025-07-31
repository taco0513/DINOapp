import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // 시간 윈도우 (밀리초)
  maxRequests: number; // 최대 요청 수
  skipSuccessfulRequests?: boolean; // 성공적인 요청 제외
  skipFailedRequests?: boolean; // 실패한 요청 제외
  keyGenerator?: (req: NextRequest) => string; // 키 생성 함수
}

interface RateLimitData {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// 메모리 기반 레이트 리미터 (프로덕션에서는 Redis 사용 권장)
class MemoryRateLimiter {
  private store = new Map<string, RateLimitData>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // 5분마다 만료된 항목 정리
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (data.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  async increment(key: string, windowMs: number): Promise<RateLimitData> {
    const now = Date.now();
    const resetTime = now + windowMs;

    const existing = this.store.get(key);

    if (!existing || existing.resetTime < now) {
      // 새로운 윈도우 시작
      const data: RateLimitData = {
        count: 1,
        resetTime,
        blocked: false,
      };
      this.store.set(key, data);
      return data;
    }

    // 기존 윈도우에서 카운트 증가
    existing.count++;
    this.store.set(key, existing);
    return existing;
  }

  async get(key: string): Promise<RateLimitData | null> {
    const data = this.store.get(key);
    if (!data) return null;

    const now = Date.now();
    if (data.resetTime < now) {
      this.store.delete(key);
      return null;
    }

    return data;
  }

  async block(key: string, durationMs: number): Promise<void> {
    const data = this.store.get(key);
    if (data) {
      data.blocked = true;
      data.resetTime = Date.now() + durationMs;
      this.store.set(key, data);
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// 싱글톤 인스턴스
const rateLimiter = new MemoryRateLimiter();

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: req => this.getClientIdentifier(req),
      ...config,
    };
  }

  private getClientIdentifier(req: NextRequest): string {
    // IP 주소 기반 식별 (프록시 고려)
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const remoteAddr =
      req.headers.get('x-vercel-forwarded-for') ||
      req.headers.get('cf-connecting-ip') ||
      forwarded?.split(',')[0] ||
      realIp ||
      '127.0.0.1';

    // User-Agent와 조합하여 더 정확한 식별
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const userAgentHash = this.simpleHash(userAgent);

    return `${remoteAddr}:${userAgentHash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  async checkLimit(req: NextRequest): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const key = this.config.keyGenerator!(req);
    const data = await rateLimiter.increment(key, this.config.windowMs);

    // 차단된 클라이언트 확인
    if (data.blocked) {
      const retryAfter = Math.ceil((data.resetTime - Date.now()) / 1000);
      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime: data.resetTime,
        retryAfter: Math.max(retryAfter, 1),
      };
    }

    const allowed = data.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - data.count);

    // 한계 초과 시 일시적 차단
    if (!allowed) {
      await rateLimiter.block(key, this.config.windowMs);
      const retryAfter = Math.ceil(this.config.windowMs / 1000);

      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime: data.resetTime,
        retryAfter,
      };
    }

    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining,
      resetTime: data.resetTime,
    };
  }

  // 특정 엔드포인트별 설정
  static configs = {
    // 일반 API 엔드포인트
    general: new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15분
      maxRequests: 100, // 15분당 100회
    }),

    // 인증 관련 엔드포인트 (더 엄격)
    auth: new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15분
      maxRequests: 10, // 15분당 10회
    }),

    // 데이터 생성/수정 엔드포인트
    mutation: new RateLimiter({
      windowMs: 60 * 1000, // 1분
      maxRequests: 20, // 1분당 20회
    }),

    // 파일 업로드/다운로드
    upload: new RateLimiter({
      windowMs: 60 * 1000, // 1분
      maxRequests: 5, // 1분당 5회
    }),

    // 이메일/알림 발송
    notification: new RateLimiter({
      windowMs: 60 * 60 * 1000, // 1시간
      maxRequests: 50, // 1시간당 50회
    }),
  };
}

// 미들웨어 함수
export async function applyRateLimit(
  req: NextRequest,
  limiterType: keyof typeof RateLimiter.configs = 'general'
): Promise<Response | null> {
  try {
    const limiter = RateLimiter.configs[limiterType];
    const result = await limiter.checkLimit(req);

    // 헤더 설정
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      if (result.retryAfter) {
        headers.set('Retry-After', result.retryAfter.toString());
      }

      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(headers),
          },
        }
      );
    }

    // 성공 시 헤더만 추가 (요청 계속 진행)
    return null;
  } catch (error) {
    // Rate limiter error
    // 오류 시 요청 허용 (fail-open)
    return null;
  }
}

// 보안 로깅
export function logSecurityEvent(
  req: NextRequest,
  event: 'rate_limit_exceeded' | 'suspicious_activity' | 'blocked_request',
  details?: Record<string, any>
) {
  const clientId =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const timestamp = new Date().toISOString();

  // Security event logged

  // 프로덕션에서는 보안 모니터링 시스템으로 전송
  // 예: Sentry, DataDog, CloudWatch 등
}

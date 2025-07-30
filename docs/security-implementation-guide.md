# 🔒 DINO 프로젝트 보안 구현 가이드

## 개요

DINO 프로젝트의 서버 사이드 권한 검증 시스템 강화를 위한 종합 보안 가이드입니다.

## 1. 관리자 권한 검증 시스템

### 현재 문제점

- 클라이언트 사이드에서만 관리자 접근 제어
- 환경 변수 기반 단순 이메일 체크

### 개선된 구현

```typescript
// lib/auth-guards.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export interface AuthGuardResult {
  authorized: boolean;
  user?: {
    id: string;
    email: string;
    role: UserRole;
    permissions: string[];
  };
  error?: string;
}

export class AuthGuard {
  static async requireAuth(): Promise<AuthGuardResult> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { authorized: false, error: 'Authentication required' };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return { authorized: false, error: 'User not found' };
    }

    return {
      authorized: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
        permissions: user.permissions || [],
      },
    };
  }

  static async requireAdmin(): Promise<AuthGuardResult> {
    const authResult = await this.requireAuth();

    if (!authResult.authorized) {
      return authResult;
    }

    const user = authResult.user!;
    const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

    if (!adminRoles.includes(user.role)) {
      return {
        authorized: false,
        error: 'Administrator privileges required',
      };
    }

    return authResult;
  }

  static async requirePermission(permission: string): Promise<AuthGuardResult> {
    const authResult = await this.requireAuth();

    if (!authResult.authorized) {
      return authResult;
    }

    const user = authResult.user!;

    // Super admin은 모든 권한 보유
    if (user.role === UserRole.SUPER_ADMIN) {
      return authResult;
    }

    // 특정 권한 체크
    if (!user.permissions.includes(permission)) {
      return {
        authorized: false,
        error: `Permission '${permission}' required`,
      };
    }

    return authResult;
  }

  static async hasRole(role: UserRole): Promise<AuthGuardResult> {
    const authResult = await this.requireAuth();

    if (!authResult.authorized) {
      return authResult;
    }

    const user = authResult.user!;

    if (user.role !== role) {
      return {
        authorized: false,
        error: `Role '${role}' required`,
      };
    }

    return authResult;
  }
}

// 데코레이터 스타일 가드
export function withAuth() {
  return async function (request: Request) {
    const authResult = await AuthGuard.requireAuth();
    if (!authResult.authorized) {
      return Response.json({ error: authResult.error }, { status: 401 });
    }
    return null; // 인증 성공
  };
}

export function withAdmin() {
  return async function (request: Request) {
    const authResult = await AuthGuard.requireAdmin();
    if (!authResult.authorized) {
      return Response.json({ error: authResult.error }, { status: 403 });
    }
    return null; // 인증 성공
  };
}

export function withPermission(permission: string) {
  return async function (request: Request) {
    const authResult = await AuthGuard.requirePermission(permission);
    if (!authResult.authorized) {
      return Response.json({ error: authResult.error }, { status: 403 });
    }
    return null; // 인증 성공
  };
}
```

### 권한 기반 API 라우트 구현

```typescript
// app/api/admin/users/route.ts
import { AuthGuard } from '@/lib/auth-guards';
import { NextResponse } from 'next/server';

export async function GET() {
  // 관리자 권한 필요
  const authResult = await AuthGuard.requireAdmin();
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: 403 });
  }

  // 사용자 목록 조회 로직
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        // 민감 정보 제외
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  // 특정 권한 필요
  const authResult = await AuthGuard.requirePermission('users:write');
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: 403 });
  }

  // 사용자 정보 업데이트 로직
}
```

### 데이터베이스 스키마 확장

```prisma
// prisma/schema.prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  role          String    @default("user") // user, admin, super_admin
  permissions   String[]  @default([])      // 세분화된 권한 배열
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  profile       UserProfile?
  trips         CountryVisit[]
  sessions      Session[]
  accounts      Account[]

  @@map("users")
}

model UserProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  bio             String   @default("")
  location        String   @default("")
  nationality     String   @default("")
  dateOfBirth     DateTime?

  // 암호화된 민감 정보
  encryptedData   Json?    // 여권 정보 등

  travelPreferences Json   @default("{}")

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("user_profiles")
}
```

## 2. API 보안 미들웨어

```typescript
// lib/api-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import rateLimit from 'express-rate-limit';

// Rate Limiting
export class RateLimiter {
  private static limiters = new Map();

  static create(options: {
    windowMs: number;
    max: number;
    keyGenerator?: (request: NextRequest) => string;
  }) {
    const limiter = rateLimit({
      windowMs: options.windowMs,
      max: options.max,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator:
        options.keyGenerator ||
        (req => {
          // IP 기반 제한
          return req.ip || req.headers.get('x-forwarded-for') || 'anonymous';
        }),
    });

    return limiter;
  }

  static async check(
    request: NextRequest,
    limiterId: string,
    options: { windowMs: number; max: number }
  ): Promise<{ allowed: boolean; remaining?: number }> {
    const key = this.getKey(request, limiterId);
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // 기존 요청 기록 조회
    const requests = this.getRequests(key, windowStart);

    if (requests.length >= options.max) {
      return { allowed: false };
    }

    // 새 요청 기록
    this.addRequest(key, now);

    return {
      allowed: true,
      remaining: options.max - requests.length - 1,
    };
  }

  private static getKey(request: NextRequest, limiterId: string): string {
    const ip =
      request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
    return `${limiterId}:${ip}`;
  }

  private static getRequests(key: string, windowStart: number): number[] {
    const requests = this.limiters.get(key) || [];
    return requests.filter((timestamp: number) => timestamp > windowStart);
  }

  private static addRequest(key: string, timestamp: number): void {
    const requests = this.limiters.get(key) || [];
    requests.push(timestamp);
    this.limiters.set(key, requests);
  }
}

// CORS 설정
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// 보안 헤더
export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'",
  };
}
```

## 3. 입력 검증 및 Sanitization

```typescript
// lib/validation.ts
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// 공통 검증 스키마
export const UserProfileSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  bio: z.string().max(500).trim().optional(),
  location: z.string().max(100).trim().optional(),
  nationality: z.string().max(50).trim().optional(),
  dateOfBirth: z.string().datetime().optional(),
  travelPreferences: z
    .object({
      favoriteCountries: z.array(z.string()).max(20),
      travelStyle: z.enum(['budget', 'comfort', 'luxury']),
      groupSize: z.enum(['solo', 'couple', 'group']),
    })
    .optional(),
  visaInfo: z
    .object({
      passportCountry: z.string().max(50).trim(),
      passportNumber: z.string().max(20).trim().optional(),
      passportExpiry: z.string().trim(),
      preferredLanguage: z.string().max(10).trim().optional(),
    })
    .optional(),
});

export class InputValidator {
  static validateAndSanitize<T>(
    data: unknown,
    schema: z.ZodSchema<T>
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      // 1. 기본 검증
      const result = schema.safeParse(data);

      if (!result.success) {
        return {
          success: false,
          errors: result.error.errors.map(
            err => `${err.path.join('.')}: ${err.message}`
          ),
        };
      }

      // 2. HTML Sanitization
      const sanitized = this.sanitizeObject(result.data);

      return { success: true, data: sanitized as T };
    } catch (error) {
      return {
        success: false,
        errors: ['Validation failed'],
      };
    }
  }

  private static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return DOMPurify.sanitize(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  // SQL Injection 방지를 위한 파라미터 검증
  static validateId(id: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(id) && id.length <= 50;
  }

  // 이메일 검증
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }
}
```

## 4. 감사 로그 시스템

```typescript
// lib/audit-logger.ts
interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export class AuditLogger {
  static async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    try {
      await prisma.auditLog.create({
        data: {
          ...entry,
          id: generateId(),
          timestamp: new Date(),
          details: JSON.stringify(entry.details),
        },
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  static async logUserAction(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>,
    request?: Request
  ) {
    await this.log({
      userId,
      action,
      resource,
      resourceId,
      details: details || {},
      ipAddress: this.getClientIP(request),
      userAgent: request?.headers.get('user-agent') || 'unknown',
      success: true,
    });
  }

  static async logSecurityEvent(
    action: string,
    details: Record<string, any>,
    request?: Request,
    success: boolean = false
  ) {
    await this.log({
      action,
      resource: 'security',
      details,
      ipAddress: this.getClientIP(request),
      userAgent: request?.headers.get('user-agent') || 'unknown',
      success,
    });
  }

  private static getClientIP(request?: Request): string {
    if (!request) return 'unknown';

    return (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'
    );
  }
}
```

## 5. 환경 변수 보안

```bash
# .env.local (예시)
# 절대 Git에 커밋하지 않음

# 데이터베이스
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 암호화
ENCRYPTION_SECRET_KEY="your-32-character-secret-key-here"

# 관리자 설정
ADMIN_EMAILS="admin1@example.com,admin2@example.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15분
RATE_LIMIT_MAX_REQUESTS=100

# 보안 설정
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
SESSION_MAX_AGE=2592000  # 30일
```

## 6. 배포 시 보안 체크리스트

### 프로덕션 배포 전 필수 확인사항

- [ ] 모든 환경 변수 설정 완료
- [ ] HTTPS 강제 설정
- [ ] CSP (Content Security Policy) 헤더 설정
- [ ] Rate Limiting 활성화
- [ ] 관리자 계정 2FA 설정
- [ ] 데이터베이스 백업 설정
- [ ] 로그 모니터링 설정
- [ ] 에러 추적 (Sentry) 설정
- [ ] 보안 헤더 검증
- [ ] 의존성 취약점 스캔

### 지속적인 보안 관리

1. **정기 보안 감사**: 월 1회
2. **의존성 업데이트**: 주 1회
3. **로그 모니터링**: 일일 확인
4. **백업 검증**: 주 1회
5. **침입 테스트**: 분기 1회

이 가이드를 따라 구현하면 DINO 프로젝트의 보안 수준을 대폭 향상시킬 수 있습니다.

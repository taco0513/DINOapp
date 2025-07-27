import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/database/dev-prisma'
const prisma = getPrismaClient()
import { getUserTripsOptimized } from '@/lib/database/query-optimizer'
import { systemAlert } from '@/lib/notifications/alert-manager'
import { z } from 'zod'
import { applyRateLimit } from '@/lib/security/rate-limiter'
import { securityMiddleware } from '@/lib/security/auth-middleware'
import { csrfProtection } from '@/lib/security/csrf-protection'
import { sanitizeRequestBody, InputSanitizer } from '@/lib/security/input-sanitizer'
import { createErrorResponse, ErrorCode, generateRequestId, handleApiError, createValidationError } from '@/lib/api/error-handler'

// Zod schema for trip validation
const createTripSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  entryDate: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid entry date'),
  exitDate: z.string().optional().nullable(),
  visaType: z.enum([
    'Tourist', 'Business', 'Student', 'Working Holiday', 'Digital Nomad',
    'Transit', 'Work', 'Investor', 'Retirement', 'Volunteer', 'Visa Run',
    'Extension', 'Spouse', 'Medical'
  ]),
  maxDays: z.number().min(1).max(365),
  passportCountry: z.enum(['US', 'UK', 'EU', 'CA', 'AU', 'JP', 'OTHER']),
  notes: z.string().optional()
})

// GET /api/trips - Get all trips for authenticated user
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'general')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Security middleware (인증, 권한, 의심스러운 활동 감지)
    const securityResult = await securityMiddleware(request)
    if (!securityResult.proceed) {
      return securityResult.response!
    }

    const session = await getServerSession(authOptions)
    const user = await prisma.user.findUnique({
      where: { email: session!.user!.email! }
    })

    if (!user) {
      return createErrorResponse(ErrorCode.NOT_FOUND, 'User not found', undefined, requestId)
    }

    // Use optimized query with caching
    const trips = await getUserTripsOptimized(user.id, {
      limit: 100, // 기본 100개 제한
      includeActive: undefined // 모든 여행 포함
    })

    // Debug logging
    console.log(`[GET /api/trips] Found ${trips.length} trips for user ${user.id}`)

    return NextResponse.json({
      success: true,
      data: trips
    })

  } catch (error) {
    // Error fetching trips
    return handleApiError(error, ErrorCode.DATABASE_ERROR, requestId)
  }
}

// POST /api/trips - Create new trip
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    // Rate limiting (더 엄격한 제한)
    const rateLimitResponse = await applyRateLimit(request, 'mutation')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // CSRF 보호 (개선된 버전)
    const csrfResult = await csrfProtection(request, {
      requireDoubleSubmit: true
    })
    if (!csrfResult.protected) {
      return csrfResult.response!
    }

    // Security middleware
    const securityResult = await securityMiddleware(request)
    if (!securityResult.proceed) {
      return securityResult.response!
    }

    // 요청 본문 정화
    const sanitizedBody = await sanitizeRequestBody(request, {
      country: 'text',
      notes: 'text',
      visaType: 'text'
    })

    if (!sanitizedBody) {
      return createErrorResponse(ErrorCode.BAD_REQUEST, 'Invalid request body', undefined, requestId)
    }

    // 입력 검증
    const validatedData = createTripSchema.parse(sanitizedBody)

    // 사용자 확인
    const session = await getServerSession(authOptions)
    const user = await prisma.user.findUnique({
      where: { email: session!.user!.email! }
    })

    if (!user) {
      return createErrorResponse(ErrorCode.NOT_FOUND, 'User not found', undefined, requestId)
    }

    // 여행 기록 생성 - Convert date strings to ISO-8601 format
    const trip = await prisma.countryVisit.create({
      data: {
        userId: user.id,
        country: validatedData.country,
        entryDate: new Date(validatedData.entryDate).toISOString(),
        exitDate: validatedData.exitDate ? new Date(validatedData.exitDate).toISOString() : null,
        visaType: validatedData.visaType,
        maxDays: validatedData.maxDays,
        passportCountry: validatedData.passportCountry,
        notes: validatedData.notes || null
      }
    })

    return NextResponse.json({
      success: true,
      data: trip,
      message: 'Trip created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Trip creation error:', error)
    
    if (error instanceof z.ZodError) {
      const validationErrors: Record<string, string[]> = {}
      error.issues.forEach(issue => {
        const field = issue.path.join('.')
        if (!validationErrors[field]) {
          validationErrors[field] = []
        }
        validationErrors[field].push(issue.message)
      })
      return createValidationError(validationErrors, requestId)
    }

    // Error creating trip
    return handleApiError(error, ErrorCode.DATABASE_ERROR, requestId)
  }
}


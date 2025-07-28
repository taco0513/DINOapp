import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/database/dev-prisma'
const prisma = getPrismaClient()
import { getUserTripsOptimized } from '@/lib/database/query-optimizer'
import { systemAlert } from '@/lib/notifications/alert-manager'
import { createTravelManager } from '@/lib/travel-manager'
import { z } from 'zod'
import { applyRateLimit } from '@/lib/security/rate-limiter'
import { securityMiddleware } from '@/lib/security/auth-middleware'
import { csrfProtection } from '@/lib/security/csrf-protection'
import { sanitizeRequestBody, InputSanitizer } from '@/lib/security/input-sanitizer'
import { createErrorResponse, ErrorCode, generateRequestId, handleApiError, createValidationError } from '@/lib/api/error-handler'

// Zod schema for trip validation (enhanced)
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
  notes: z.string().optional(),
  status: z.enum(['completed', 'ongoing', 'planned']).optional().default('completed'),
  purpose: z.string().optional(),
  accommodation: z.string().optional(),
  cost: z.number().optional(),
  isEmergency: z.boolean().optional().default(false)
})

const updateTripSchema = z.object({
  country: z.string().min(1).optional(),
  entryDate: z.string().refine(date => !isNaN(Date.parse(date))).optional(),
  exitDate: z.string().nullable().optional(),
  visaType: z.enum([
    'Tourist', 'Business', 'Student', 'Working Holiday', 'Digital Nomad',
    'Transit', 'Work', 'Investor', 'Retirement', 'Volunteer', 'Visa Run',
    'Extension', 'Spouse', 'Medical'
  ]).optional(),
  maxDays: z.number().min(1).max(365).optional(),
  notes: z.string().optional(),
  status: z.enum(['completed', 'ongoing', 'planned']).optional(),
  purpose: z.string().optional(),
  accommodation: z.string().optional(),
  cost: z.number().optional(),
  rating: z.number().min(1).max(5).optional(),
  isEmergency: z.boolean().optional()
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

    // Use TravelManager for enhanced functionality
    const travelManager = createTravelManager(user.id)
    
    // Parse query parameters
    const url = new URL(request.url)
    const includeCompleted = url.searchParams.get('includeCompleted') !== 'false'
    const includePlanned = url.searchParams.get('includePlanned') !== 'false'
    const includeOngoing = url.searchParams.get('includeOngoing') !== 'false'
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const sortBy = url.searchParams.get('sortBy') as 'entryDate' | 'createdAt' | 'country' || 'entryDate'
    const sortOrder = url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'
    
    const trips = await travelManager.getTrips({
      includeCompleted,
      includePlanned,
      includeOngoing,
      limit,
      sortBy,
      sortOrder
    })

    
    return NextResponse.json({
      success: true,
      data: trips,
      count: trips.length
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

    // Use TravelManager to create trip with enhanced functionality
    const travelManager = createTravelManager(user.id)
    
    const trip = await travelManager.createTrip({
      country: validatedData.country,
      entryDate: validatedData.entryDate,
      exitDate: validatedData.exitDate,
      visaType: validatedData.visaType,
      maxDays: validatedData.maxDays,
      passportCountry: validatedData.passportCountry,
      notes: validatedData.notes,
      status: validatedData.status,
      purpose: validatedData.purpose,
      accommodation: validatedData.accommodation,
      cost: validatedData.cost,
      isEmergency: validatedData.isEmergency
    })

    return NextResponse.json({
      success: true,
      data: trip,
      message: 'Trip created successfully'
    }, { status: 201 })

  } catch (error) {
    
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


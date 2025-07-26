import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserTripsOptimized } from '@/lib/database/query-optimizer'
import { systemAlert } from '@/lib/notifications/alert-manager'
import { z } from 'zod'
import { applyRateLimit } from '@/lib/security/rate-limiter'
import { securityMiddleware } from '@/lib/security/auth-middleware'
import { csrfProtection } from '@/lib/security/csrf-protection'
import { sanitizeRequestBody, InputSanitizer } from '@/lib/security/input-sanitizer'

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
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Use optimized query with caching
    const trips = await getUserTripsOptimized(user.id, {
      limit: 100, // 기본 100개 제한
      includeActive: undefined // 모든 여행 포함
    })

    return NextResponse.json({
      success: true,
      trips: trips
    })

  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}

// POST /api/trips - Create new trip
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (더 엄격한 제한)
    const rateLimitResponse = await applyRateLimit(request, 'mutation')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // CSRF 보호
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
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // 입력 검증
    const validatedData = createTripSchema.parse(sanitizedBody)

    // 사용자 확인
    const session = await getServerSession(authOptions)
    const user = await prisma.user.findUnique({
      where: { email: session!.user!.email! }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 여행 기록 생성
    const trip = await prisma.countryVisit.create({
      data: {
        userId: user.id,
        country: validatedData.country,
        entryDate: validatedData.entryDate,
        exitDate: validatedData.exitDate || null,
        visaType: validatedData.visaType,
        maxDays: validatedData.maxDays,
        passportCountry: validatedData.passportCountry,
        notes: validatedData.notes || null
      }
    })

    return NextResponse.json({
      success: true,
      trip: trip,
      message: 'Trip created successfully'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('Error creating trip:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}

// PUT 및 DELETE 메서드 추가
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'mutation')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // CSRF 보호
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

    const sanitizedBody = await sanitizeRequestBody(request, {
      country: 'text',
      notes: 'text',
      visaType: 'text'
    })

    if (!sanitizedBody || !sanitizedBody.id) {
      return NextResponse.json(
        { success: false, error: 'Trip ID is required for updates' },
        { status: 400 }
      )
    }

    const validatedData = createTripSchema.parse(sanitizedBody)
    const session = await getServerSession(authOptions)
    const user = await prisma.user.findUnique({
      where: { email: session!.user!.email! }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 소유권 확인
    const existingTrip = await prisma.countryVisit.findFirst({
      where: { 
        id: sanitizedBody.id,
        userId: user.id
      }
    })

    if (!existingTrip) {
      return NextResponse.json(
        { success: false, error: 'Trip not found' },
        { status: 404 }
      )
    }

    const updatedTrip = await prisma.countryVisit.update({
      where: { id: sanitizedBody.id },
      data: {
        country: validatedData.country,
        entryDate: validatedData.entryDate,
        exitDate: validatedData.exitDate || null,
        visaType: validatedData.visaType,
        maxDays: validatedData.maxDays,
        passportCountry: validatedData.passportCountry,
        notes: validatedData.notes || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      trip: updatedTrip,
      message: 'Trip updated successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('Error updating trip:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'mutation')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // CSRF 보호
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

    const url = new URL(request.url)
    const tripId = url.searchParams.get('id')

    if (!tripId) {
      return NextResponse.json(
        { success: false, error: 'Trip ID is required for deletion' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const user = await prisma.user.findUnique({
      where: { email: session!.user!.email! }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 소유권 확인
    const existingTrip = await prisma.countryVisit.findFirst({
      where: { 
        id: tripId,
        userId: user.id
      }
    })

    if (!existingTrip) {
      return NextResponse.json(
        { success: false, error: 'Trip not found' },
        { status: 404 }
      )
    }

    await prisma.countryVisit.delete({
      where: { id: tripId }
    })

    return NextResponse.json({
      success: true,
      message: 'Trip deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
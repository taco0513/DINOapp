import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/database/dev-prisma'
import { createTravelManager } from '@/lib/travel-manager'
import { applyRateLimit } from '@/lib/security/rate-limiter'
import { securityMiddleware } from '@/lib/security/auth-middleware'
import { createErrorResponse, ErrorCode, generateRequestId, handleApiError } from '@/lib/api/error-handler'

const prisma = getPrismaClient()

// GET /api/trips/insights - Get comprehensive travel insights
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'general')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Security middleware
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

    // Use TravelManager to get comprehensive insights
    const travelManager = createTravelManager(user.id)
    const insights = await travelManager.getTravelInsights()

    return NextResponse.json({
      success: true,
      data: insights
    })

  } catch (error) {
    return handleApiError(error, ErrorCode.DATABASE_ERROR, requestId)
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateSchengenStatus, getSchengenWarnings } from '@/lib/schengen-calculator'
import { createErrorResponse, ErrorCode, generateRequestId, handleApiError } from '@/lib/api/error-handler'

type VisaType = 'Tourist' | 'Business' | 'Student' | 'Working Holiday' | 'Digital Nomad' |
  'Transit' | 'Work' | 'Investor' | 'Retirement' | 'Volunteer' | 'Visa Run' |
  'Extension' | 'Spouse' | 'Medical'

type PassportCountry = 'US' | 'UK' | 'EU' | 'CA' | 'AU' | 'JP' | 'OTHER'

// GET /api/schengen - Calculate Schengen status for authenticated user
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, undefined, undefined, requestId)
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        countryVisits: {
          orderBy: { entryDate: 'desc' }
        }
      }
    })

    if (!user) {
      return createErrorResponse(ErrorCode.NOT_FOUND, 'User not found', undefined, requestId)
    }

    // Convert Prisma dates to match our types
    const visits = user.countryVisits.map(visit => ({
      id: visit.id,
      userId: user.id,
      country: visit.country,
      entryDate: visit.entryDate.toISOString(),
      exitDate: visit.exitDate?.toISOString() || null,
      visaType: visit.visaType as VisaType,
      maxDays: visit.maxDays,
      passportCountry: visit.passportCountry as PassportCountry,
      notes: visit.notes || undefined,
      createdAt: new Date(visit.createdAt),
      updatedAt: new Date(visit.updatedAt)
    }))

    // Calculate Schengen status
    const schengenStatus = calculateSchengenStatus(visits)
    const warnings = getSchengenWarnings(schengenStatus)

    return NextResponse.json({
      success: true,
      data: {
        status: schengenStatus,
        warnings,
        totalVisits: visits.length,
        schengenVisits: visits.filter(visit => {
          const schengenCountries = [
            'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 
            'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 
            'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 
            'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
          ]
          return schengenCountries.includes(visit.country)
        }).length
      }
    })

  } catch (error) {
    // Error calculating Schengen status
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId)
  }
}
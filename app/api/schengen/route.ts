import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { calculateSchengenStatus, getSchengenWarnings } from '@/lib/schengen-calculator'

// GET /api/schengen - Calculate Schengen status for authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Convert Prisma dates to match our types
    const visits = user.countryVisits.map(visit => ({
      id: visit.id,
      country: visit.country,
      entryDate: visit.entryDate.toISOString(),
      exitDate: visit.exitDate?.toISOString() || null,
      visaType: visit.visaType as any,
      maxDays: visit.maxDays,
      passportCountry: visit.passportCountry as any,
      notes: visit.notes || undefined,
      createdAt: visit.createdAt.toISOString(),
      updatedAt: visit.updatedAt.toISOString()
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
    console.error('Error calculating Schengen status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
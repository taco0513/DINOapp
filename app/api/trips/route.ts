import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const trips = await prisma.countryVisit.findMany({
      where: { userId: user.id },
      orderBy: { entryDate: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: trips
    })

  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/trips - Create new trip
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = createTripSchema.parse(body)

    // Create trip
    const trip = await prisma.countryVisit.create({
      data: {
        userId: user.id,
        country: validatedData.country,
        entryDate: new Date(validatedData.entryDate),
        exitDate: validatedData.exitDate ? new Date(validatedData.exitDate) : null,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.issues
        },
        { status: 400 }
      )
    }

    console.error('Error creating trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
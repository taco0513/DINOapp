import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Zod schema for trip updates
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
  passportCountry: z.enum(['US', 'UK', 'EU', 'CA', 'AU', 'JP', 'OTHER']).optional(),
  notes: z.string().optional()
})

async function checkTripOwnership(tripId: string, userEmail: string) {
  const trip = await prisma.countryVisit.findFirst({
    where: {
      id: tripId,
      user: { email: userEmail }
    },
    include: { user: true }
  })
  
  return trip
}

// GET /api/trips/[id] - Get specific trip
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const trip = await checkTripOwnership(params.id, session.user.email)

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: trip
    })

  } catch (error) {
    console.error('Error fetching trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/trips/[id] - Update trip
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check trip ownership
    const existingTrip = await checkTripOwnership(params.id, session.user.email)

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updateTripSchema.parse(body)

    // Update trip
    const updatedTrip = await prisma.countryVisit.update({
      where: { id: params.id },
      data: {
        ...(validatedData.country && { country: validatedData.country }),
        ...(validatedData.entryDate && { entryDate: new Date(validatedData.entryDate) }),
        ...(validatedData.exitDate !== undefined && { 
          exitDate: validatedData.exitDate ? new Date(validatedData.exitDate) : null 
        }),
        ...(validatedData.visaType && { visaType: validatedData.visaType }),
        ...(validatedData.maxDays && { maxDays: validatedData.maxDays }),
        ...(validatedData.passportCountry && { passportCountry: validatedData.passportCountry }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes })
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedTrip,
      message: 'Trip updated successfully'
    })

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

    console.error('Error updating trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/trips/[id] - Delete trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check trip ownership
    const existingTrip = await checkTripOwnership(params.id, session.user.email)

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    // Delete trip
    await prisma.countryVisit.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Trip deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
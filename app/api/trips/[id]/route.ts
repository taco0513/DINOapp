import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfProtection } from '@/lib/security/csrf-protection'
import { z } from 'zod'
import { createErrorResponse, ErrorCode, generateRequestId, handleApiError, createValidationError } from '@/lib/api/error-handler'

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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const requestId = generateRequestId()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, undefined, undefined, requestId)
    }

    const trip = await checkTripOwnership(id, session.user.email)

    if (!trip) {
      return createErrorResponse(ErrorCode.NOT_FOUND, 'Trip not found', undefined, requestId)
    }

    return NextResponse.json({
      success: true,
      data: trip
    })

  } catch (error) {
    // Error fetching trip
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId)
  }
}

// PUT /api/trips/[id] - Update trip
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const requestId = generateRequestId()
  
  try {
    // CSRF 보호
    const csrfResult = await csrfProtection(request, {
      requireDoubleSubmit: true
    })
    if (!csrfResult.protected) {
      return csrfResult.response!
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, undefined, undefined, requestId)
    }

    // Check trip ownership
    const existingTrip = await checkTripOwnership(id, session.user.email)

    if (!existingTrip) {
      return createErrorResponse(ErrorCode.NOT_FOUND, 'Trip not found', undefined, requestId)
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updateTripSchema.parse(body)

    // Update trip
    const updatedTrip = await prisma.countryVisit.update({
      where: { id: id },
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

    // Error updating trip
    return handleApiError(error, ErrorCode.DATABASE_ERROR, requestId)
  }
}

// DELETE /api/trips/[id] - Delete trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const requestId = generateRequestId()
  
  try {
    // CSRF 보호
    const csrfResult = await csrfProtection(request, {
      requireDoubleSubmit: true
    })
    if (!csrfResult.protected) {
      return csrfResult.response!
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, undefined, undefined, requestId)
    }

    // Check trip ownership
    const existingTrip = await checkTripOwnership(id, session.user.email)

    if (!existingTrip) {
      return createErrorResponse(ErrorCode.NOT_FOUND, 'Trip not found', undefined, requestId)
    }

    // Delete trip
    await prisma.countryVisit.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Trip deleted successfully'
    })

  } catch (error) {
    // Error deleting trip
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId)
  }
}
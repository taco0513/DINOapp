import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrismaClient } from '@/lib/database/dev-prisma';
import { createTravelManager } from '@/lib/travel-manager';
import { csrfProtection } from '@/lib/security/csrf-protection';
import { z } from 'zod';
import {
  createErrorResponse,
  ErrorCode,
  generateRequestId,
  handleApiError,
  createValidationError,
} from '@/lib/api/error-handler';

// Zod schema for trip updates (enhanced)
const updateTripSchema = z.object({
  country: z.string().min(1).optional(),
  entryDate: z
    .string()
    .refine(date => !isNaN(Date.parse(date)))
    .optional(),
  exitDate: z.string().nullable().optional(),
  visaType: z
    .enum([
      'Tourist',
      'Business',
      'Student',
      'Working Holiday',
      'Digital Nomad',
      'Transit',
      'Work',
      'Investor',
      'Retirement',
      'Volunteer',
      'Visa Run',
      'Extension',
      'Spouse',
      'Medical',
    ])
    .optional(),
  maxDays: z.number().min(1).max(365).optional(),
  passportCountry: z
    .enum(['US', 'UK', 'EU', 'CA', 'AU', 'JP', 'OTHER'])
    .optional(),
  notes: z.string().optional(),
  status: z.enum(['completed', 'ongoing', 'planned']).optional(),
  purpose: z.string().optional(),
  accommodation: z.string().optional(),
  cost: z.number().optional(),
  rating: z.number().min(1).max(5).optional(),
  isEmergency: z.boolean().optional(),
});

async function checkTripOwnership(tripId: string, userEmail: string) {
  const prisma = await getPrismaClient();
  const trip = await prisma.countryVisit.findFirst({
    where: {
      id: tripId,
      user: { email: userEmail },
    },
    include: { user: true },
  });

  return trip;
}

// GET /api/trips/[id] - Get specific trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requestId = generateRequestId();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        undefined,
        undefined,
        requestId
      );
    }

    const trip = await checkTripOwnership(id, session.user.email);

    if (!trip) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        'Trip not found',
        undefined,
        requestId
      );
    }

    return NextResponse.json({
      success: true,
      data: trip,
    });
  } catch (error) {
    // Error fetching trip
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId);
  }
}

// PUT /api/trips/[id] - Update trip
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requestId = generateRequestId();

  try {
    // CSRF 보호 (개선된 버전)
    const csrfResult = await csrfProtection(request, {
      requireDoubleSubmit: true,
    });
    if (!csrfResult.protected) {
      return csrfResult.response!;
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        undefined,
        undefined,
        requestId
      );
    }

    // Check trip ownership
    const existingTrip = await checkTripOwnership(id, session.user.email);

    if (!existingTrip) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        'Trip not found',
        undefined,
        requestId
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = updateTripSchema.parse(body);

    // Use TravelManager for enhanced trip update
    const travelManager = createTravelManager(existingTrip.user.id);
    const updatedTrip = await travelManager.updateTrip(id, validatedData);

    return NextResponse.json({
      success: true,
      data: updatedTrip,
      message: 'Trip updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: Record<string, string[]> = {};
      error.issues.forEach(issue => {
        const field = issue.path.join('.');
        if (!validationErrors[field]) {
          validationErrors[field] = [];
        }
        validationErrors[field].push(issue.message);
      });
      return createValidationError(validationErrors, requestId);
    }

    // Error updating trip
    return handleApiError(error, ErrorCode.DATABASE_ERROR, requestId);
  }
}

// DELETE /api/trips/[id] - Delete trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requestId = generateRequestId();

  try {
    // CSRF 보호 (개선된 버전)
    const csrfResult = await csrfProtection(request, {
      requireDoubleSubmit: true,
    });
    if (!csrfResult.protected) {
      return csrfResult.response!;
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        undefined,
        undefined,
        requestId
      );
    }

    // Check trip ownership
    const existingTrip = await checkTripOwnership(id, session.user.email);

    if (!existingTrip) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        'Trip not found',
        undefined,
        requestId
      );
    }

    // Use TravelManager for trip deletion
    const travelManager = createTravelManager(existingTrip.user.id);
    const deleted = await travelManager.deleteTrip(id);

    if (!deleted) {
      return createErrorResponse(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to delete trip',
        undefined,
        requestId
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    // Error deleting trip
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId);
  }
}

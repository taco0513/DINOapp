import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrismaClient } from '@/lib/database/dev-prisma';
import { createTravelManager } from '@/lib/travel-manager';
import { z } from 'zod';
import { applyRateLimit } from '@/lib/security/rate-limiter';
import { securityMiddleware } from '@/lib/security/auth-middleware';
import { sanitizeRequestBody } from '@/lib/security/input-sanitizer';
import {
  createErrorResponse,
  ErrorCode,
  generateRequestId,
  handleApiError,
  createValidationError,
} from '@/lib/api/error-handler';

// Validation schema for trip validation request
const validateTripSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  entryDate: z
    .string()
    .refine(date => !isNaN(Date.parse(date)), 'Invalid entry date'),
  exitDate: z
    .string()
    .refine(date => !isNaN(Date.parse(date)), 'Invalid exit date'),
  passportCountry: z.string().optional(),
});

// POST /api/trips/validate - Validate a planned trip
export async function POST(request: Request) {
  const requestId = generateRequestId();

  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'general');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Security middleware
    const securityResult = await securityMiddleware(request);
    if (!securityResult.proceed) {
      return securityResult.response!;
    }

    // Sanitize request body
    const sanitizedBody = await sanitizeRequestBody(request, {
      country: 'text',
      entryDate: 'text',
      exitDate: 'text',
      passportCountry: 'text',
    });

    if (!sanitizedBody) {
      return createErrorResponse(
        ErrorCode.BAD_REQUEST,
        'Invalid request body',
        undefined,
        requestId
      );
    }

    // Validate input data
    const validatedData = validateTripSchema.parse(sanitizedBody);

    const session = await getServerSession(authOptions);
    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session!.user!.email! },
    });

    if (!user) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        'User not found',
        undefined,
        requestId
      );
    }

    // Use TravelManager to validate the planned trip
    const travelManager = createTravelManager(user.id);
    const validation = await travelManager.validatePlannedTrip(
      validatedData.country,
      validatedData.entryDate,
      validatedData.exitDate,
      validatedData.passportCountry
    );

    return NextResponse.json({
      success: true,
      data: validation,
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

    return handleApiError(error, ErrorCode.DATABASE_ERROR, requestId);
  }
}

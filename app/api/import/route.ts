import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { csrfProtection } from '@/lib/security/csrf-protection';
import { z } from 'zod';

// Validation schema for import data
const importTripSchema = z.object({
  country: z.string().min(1),
  entryDate: z.string().refine(date => !isNaN(Date.parse(date))),
  exitDate: z.string().nullable().optional(),
  visaType: z.enum([
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
  ]),
  maxDays: z.number().min(1).max(365),
  passportCountry: z.enum(['US', 'UK', 'EU', 'CA', 'AU', 'JP', 'OTHER']),
  notes: z.string().optional().nullable(),
});

const importDataSchema = z.object({
  version: z.string().optional(),
  trips: z.array(importTripSchema),
  notificationSettings: z
    .object({
      visaExpiryDays: z.array(z.number()).optional(),
      schengenWarningDays: z.number().optional(),
      emailEnabled: z.boolean().optional(),
      pushEnabled: z.boolean().optional(),
    })
    .optional(),
});

// POST /api/import - Import user's travel data
export async function POST(request: NextRequest) {
  try {
    // CSRF 보호
    const csrfResult = await csrfProtection(request, {
      requireDoubleSubmit: true,
    });
    if (!csrfResult.protected) {
      return csrfResult.response!;
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate import data
    const validatedData = importDataSchema.parse(body);

    // Import options from query parameters
    const url = new URL(request.url);
    const replaceExisting = url.searchParams.get('replace') === 'true';
    const skipDuplicates = url.searchParams.get('skipDuplicates') !== 'false';

    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Handle existing data
    if (replaceExisting) {
      await prisma.countryVisit.deleteMany({
        where: { userId: user.id },
      });
    }

    // Import trips
    for (const tripData of validatedData.trips) {
      try {
        // Check for duplicates if skipDuplicates is enabled
        if (skipDuplicates && !replaceExisting) {
          const existingTrip = await prisma.countryVisit.findFirst({
            where: {
              userId: user.id,
              country: tripData.country,
              entryDate: new Date(tripData.entryDate),
              exitDate: tripData.exitDate ? new Date(tripData.exitDate) : null,
            },
          });

          if (existingTrip) {
            skippedCount++;
            continue;
          }
        }

        await prisma.countryVisit.create({
          data: {
            userId: user.id,
            country: tripData.country,
            entryDate: new Date(tripData.entryDate),
            exitDate: tripData.exitDate ? new Date(tripData.exitDate) : null,
            visaType: tripData.visaType,
            maxDays: tripData.maxDays,
            passportCountry: tripData.passportCountry,
            notes: tripData.notes || null,
          },
        });

        importedCount++;
      } catch (error) {
        errorCount++;
        errors.push(
          `Failed to import trip to ${tripData.country}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Import notification settings if provided
    if (validatedData.notificationSettings) {
      try {
        await prisma.notificationSettings.upsert({
          where: { userId: user.id },
          update: {
            visaExpiryDays: validatedData.notificationSettings.visaExpiryDays
              ? JSON.stringify(
                  validatedData.notificationSettings.visaExpiryDays
                )
              : undefined,
            schengenWarningDays:
              validatedData.notificationSettings.schengenWarningDays,
            emailEnabled: validatedData.notificationSettings.emailEnabled,
            pushEnabled: validatedData.notificationSettings.pushEnabled,
          },
          create: {
            userId: user.id,
            visaExpiryDays: validatedData.notificationSettings.visaExpiryDays
              ? JSON.stringify(
                  validatedData.notificationSettings.visaExpiryDays
                )
              : '7,14,30',
            schengenWarningDays:
              validatedData.notificationSettings.schengenWarningDays || 10,
            emailEnabled:
              validatedData.notificationSettings.emailEnabled ?? true,
            pushEnabled:
              validatedData.notificationSettings.pushEnabled ?? false,
          },
        });
      } catch (error) {
        errors.push(
          `Failed to import notification settings: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data import completed',
      summary: {
        imported: importedCount,
        skipped: skippedCount,
        errors: errorCount,
        total: validatedData.trips.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    // Error importing data
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DINO v2.0 - Trips API
 * CRUD operations for user travel history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCountryByCode } from '@/data/countries';

/**
 * GET /api/trips - Get user's trips
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's trips
    const trips = await prisma.trip.findMany({
      where: { userId: user.id },
      orderBy: { entryDate: 'desc' },
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trips - Create new trip
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { country, entryDate, exitDate, purpose = 'tourism', notes = '' } = body;

    // Validate required fields
    if (!country || !entryDate) {
      return NextResponse.json(
        { error: 'Country and entry date are required' },
        { status: 400 }
      );
    }

    // Get country info
    const countryInfo = getCountryByCode(country);
    if (!countryInfo) {
      return NextResponse.json(
        { error: 'Invalid country code' },
        { status: 400 }
      );
    }

    // Calculate stay days if exit date provided
    let stayDays = null;
    if (exitDate) {
      const entry = new Date(entryDate);
      const exit = new Date(exitDate);
      stayDays = Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        country,
        countryName: countryInfo.name,
        entryDate: new Date(entryDate),
        exitDate: exitDate ? new Date(exitDate) : null,
        purpose,
        notes,
        isSchengen: countryInfo.isSchengen,
        stayDays,
      },
    });

    return NextResponse.json({ trip });
  } catch (error) {
    console.error('Failed to create trip:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}
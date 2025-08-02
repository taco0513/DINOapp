/**
 * DINO v2.0 - Visa Management API
 * CRUD operations for visa records
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCountryByCode } from '@/data/countries';

/**
 * GET /api/visas - Get user's visa records
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

    // Get user's visas
    const visas = await prisma.visa.findMany({
      where: { userId: user.id },
      orderBy: { expiryDate: 'asc' },
    });

    return NextResponse.json({ visas });
  } catch (error) {
    console.error('Failed to fetch visas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/visas - Create new visa record
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
    const { 
      country, 
      visaType, 
      issueDate, 
      expiryDate, 
      maxStayDays, 
      entries, 
      notes,
      documentUrl 
    } = body;

    // Validate required fields
    if (!country || !visaType || !issueDate || !expiryDate || !maxStayDays || !entries) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Check if visa is expired
    const expiry = new Date(expiryDate);
    const status = expiry < new Date() ? 'expired' : 'active';

    // Create visa record
    const visa = await prisma.visa.create({
      data: {
        userId: user.id,
        country,
        countryName: countryInfo.name,
        visaType,
        issueDate: new Date(issueDate),
        expiryDate: expiry,
        maxStayDays: parseInt(maxStayDays),
        entries,
        status,
        notes: notes || '',
        documentUrl,
      },
    });

    return NextResponse.json({ visa });
  } catch (error) {
    console.error('Failed to create visa:', error);
    return NextResponse.json(
      { error: 'Failed to create visa' },
      { status: 500 }
    );
  }
}
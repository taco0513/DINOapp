/**
 * DINO v2.0 - Visa API Route
 * API endpoints for visa management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/prisma';
import { getUserVisas, createVisa, updateVisa, deleteVisa } from '@/lib/db/visa';

// GET /api/visa - Fetch user's visas
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch user's visas from database
    const visas = await getUserVisas(user.id);

    return NextResponse.json({ visas });
  } catch (error) {
    console.error('Error fetching visas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visas' },
      { status: 500 }
    );
  }
}

// POST /api/visa - Create a new visa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['country', 'countryName', 'visaType', 'issueDate', 'expiryDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create visa in database
    const newVisa = await createVisa({
      userId: user.id,
      country: body.country,
      countryName: body.countryName,
      visaType: body.visaType,
      issueDate: new Date(body.issueDate),
      expiryDate: new Date(body.expiryDate),
      maxStayDays: body.maxStayDays || 90,
      entries: body.entries || 'single',
      notes: body.notes,
      documentUrl: body.documentUrl
    });

    return NextResponse.json({ visa: newVisa });
  } catch (error) {
    console.error('Error creating visa:', error);
    return NextResponse.json(
      { error: 'Failed to create visa' },
      { status: 500 }
    );
  }
}

// PUT /api/visa/[id] - Update a visa
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Visa ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Update visa in database
    const updatedVisa = await updateVisa(id, user.id, body);

    return NextResponse.json({ visa: updatedVisa });
  } catch (error) {
    console.error('Error updating visa:', error);
    return NextResponse.json(
      { error: 'Failed to update visa' },
      { status: 500 }
    );
  }
}

// DELETE /api/visa/[id] - Delete a visa
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Visa ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete visa from database
    const result = await deleteVisa(id, user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting visa:', error);
    return NextResponse.json(
      { error: 'Failed to delete visa' },
      { status: 500 }
    );
  }
}
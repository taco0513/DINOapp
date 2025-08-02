/**
 * DINO v2.0 - Schengen API Route
 * Clean, type-safe API implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateComprehensiveStatus, validateFutureTrip } from '@/lib/schengen/calculator';
import type { CountryVisit, ApiResult, SchengenCalculationResult, FutureTripValidation } from '@/types/schengen';

/**
 * GET /api/schengen - Calculate current Schengen status
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResult<SchengenCalculationResult>>> {
  try {
    const { searchParams } = new URL(request.url);
    const visitsParam = searchParams.get('visits');
    
    // For demo purposes, use empty visits array
    // In production, this would fetch from database based on user authentication
    const visits: CountryVisit[] = visitsParam ? JSON.parse(visitsParam) : [];
    
    const result = calculateComprehensiveStatus(visits);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch {
    // TODO: Implement proper logging system
    
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate Schengen status'
    }, { status: 500 });
  }
}

/**
 * POST /api/schengen/validate - Validate a future trip
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResult<FutureTripValidation>>> {
  try {
    const body = await request.json();
    
    // Validate request body
    const { visits, plannedEntry, plannedExit, plannedCountry } = body;
    
    if (!plannedEntry || !plannedExit || !plannedCountry) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: plannedEntry, plannedExit, plannedCountry'
      }, { status: 400 });
    }
    
    const entryDate = new Date(plannedEntry);
    const exitDate = new Date(plannedExit);
    
    // Validate dates
    if (isNaN(entryDate.getTime()) || isNaN(exitDate.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date format'
      }, { status: 400 });
    }
    
    if (exitDate <= entryDate) {
      return NextResponse.json({
        success: false,
        error: 'Exit date must be after entry date'
      }, { status: 400 });
    }
    
    const validation = validateFutureTrip(
      visits || [],
      entryDate,
      exitDate,
      plannedCountry
    );
    
    return NextResponse.json({
      success: true,
      data: validation
    });
  } catch {
    // TODO: Implement proper logging system
    
    return NextResponse.json({
      success: false,
      error: 'Failed to validate trip'
    }, { status: 500 });
  }
}
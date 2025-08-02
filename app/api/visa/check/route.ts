/**
 * DINO v2.0 - Visa Checker API
 * RESTful API endpoint for visa requirement checking
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkVisaRequirements } from '@/lib/visa/checker';
import type { VisaCheckerRequest, TravelPurpose } from '@/types/visa';

/**
 * POST /api/visa/check
 * Check visa requirements between countries
 */
export async function POST(request: NextRequest) {
  try {
    const body: VisaCheckerRequest = await request.json();
    
    // Validate required fields
    if (!body.passportCountry || !body.destination) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: passportCountry and destination are required' 
        },
        { status: 400 }
      );
    }

    // Validate country codes (basic format check)
    if (!/^[A-Z]{2}$/.test(body.passportCountry) || !/^[A-Z]{2}$/.test(body.destination)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid country code format. Use ISO 3166-1 alpha-2 codes (e.g., KR, US)' 
        },
        { status: 400 }
      );
    }

    // Check visa requirements
    const result = checkVisaRequirements(body);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400,
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Visa check API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error while checking visa requirements' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/visa/check
 * Get visa requirements via query parameters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const passportCountry = searchParams.get('passport');
    const destination = searchParams.get('destination');
    const purpose = searchParams.get('purpose') || 'tourism';
    const stayDuration = searchParams.get('duration');

    if (!passportCountry || !destination) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: passport and destination are required' 
        },
        { status: 400 }
      );
    }

    const parsedStayDuration = stayDuration ? parseInt(stayDuration) : undefined;
    
    const body: VisaCheckerRequest = {
      passportCountry: passportCountry.toUpperCase(),
      destination: destination.toUpperCase(),
      purpose: purpose as TravelPurpose,
      ...(parsedStayDuration !== undefined && { stayDuration: parsedStayDuration })
    };

    // Validate country codes
    if (!/^[A-Z]{2}$/.test(body.passportCountry) || !/^[A-Z]{2}$/.test(body.destination)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid country code format. Use ISO 3166-1 alpha-2 codes (e.g., KR, US)' 
        },
        { status: 400 }
      );
    }

    const result = checkVisaRequirements(body);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400,
      headers: {
        'Cache-Control': 'public, max-age=3600',
      }
    });

  } catch (error) {
    console.error('Visa check API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error while checking visa requirements' 
      },
      { status: 500 }
    );
  }
}
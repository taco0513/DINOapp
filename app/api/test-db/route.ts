import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/database/dev-prisma'
const prisma = getPrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const visitCount = await prisma.countryVisit.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        userCount,
        visitCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    // Database connection error
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
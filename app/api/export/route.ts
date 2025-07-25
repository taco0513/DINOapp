import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/export - Export user's travel data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        countryVisits: {
          orderBy: { entryDate: 'desc' }
        },
        notificationSettings: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get query parameter for format
    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'json'

    // Prepare export data
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        passportCountry: user.passportCountry,
        timezone: user.timezone
      },
      trips: user.countryVisits.map(trip => ({
        id: trip.id,
        country: trip.country,
        entryDate: trip.entryDate.toISOString(),
        exitDate: trip.exitDate?.toISOString() || null,
        visaType: trip.visaType,
        maxDays: trip.maxDays,
        passportCountry: trip.passportCountry,
        notes: trip.notes,
        createdAt: trip.createdAt.toISOString(),
        updatedAt: trip.updatedAt.toISOString()
      })),
      notificationSettings: user.notificationSettings ? {
        visaExpiryDays: JSON.parse(user.notificationSettings.visaExpiryDays),
        schengenWarningDays: user.notificationSettings.schengenWarningDays,
        emailEnabled: user.notificationSettings.emailEnabled,
        pushEnabled: user.notificationSettings.pushEnabled
      } : null
    }

    if (format === 'csv') {
      // Generate CSV format
      const headers = [
        'Country', 'Entry Date', 'Exit Date', 'Visa Type', 'Max Days', 
        'Passport Country', 'Notes', 'Created At'
      ]
      
      const csvRows = [
        headers.join(','),
        ...exportData.trips.map(trip => [
          `"${trip.country}"`,
          trip.entryDate.split('T')[0],
          trip.exitDate ? trip.exitDate.split('T')[0] : '',
          `"${trip.visaType}"`,
          trip.maxDays,
          trip.passportCountry,
          `"${trip.notes || ''}"`,
          trip.createdAt.split('T')[0]
        ].join(','))
      ]

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="dinocal-trips-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Default JSON format
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dinocal-data-${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
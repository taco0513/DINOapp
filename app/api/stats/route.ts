import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrismaClient } from '@/lib/database/dev-prisma';

// GET /api/stats - Get travel statistics for authenticated user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        countryVisits: {
          orderBy: { entryDate: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const visits = user.countryVisits;

    // Calculate statistics
    const _uniqueCountries = new Set(visits.map(visit => visit.country));

    const _totalDays = visits.reduce((sum: number, visit) => {
      if (visit.exitDate) {
        const days = Math.ceil(
          (visit.exitDate.getTime() - visit.entryDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }
      return sum;
    }, 0);

    const schengenCountries = [
      'Austria',
      'Belgium',
      'Czech Republic',
      'Denmark',
      'Estonia',
      'Finland',
      'France',
      'Germany',
      'Greece',
      'Hungary',
      'Iceland',
      'Italy',
      'Latvia',
      'Lithuania',
      'Luxembourg',
      'Malta',
      'Netherlands',
      'Norway',
      'Poland',
      'Portugal',
      'Slovakia',
      'Slovenia',
      'Spain',
      'Sweden',
      'Switzerland',
    ];

    const schengenVisits = visits.filter(visit =>
      schengenCountries.includes(visit.country)
    );

    const _schengenDays = schengenVisits.reduce((sum: number, visit) => {
      if (visit.exitDate) {
        const days = Math.ceil(
          (visit.exitDate.getTime() - visit.entryDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }
      return sum;
    }, 0);

    // Current year statistics
    const currentYear = new Date().getFullYear();
    const currentYearVisits = visits.filter(
      visit => visit.entryDate.getFullYear() === currentYear
    );

    const _currentYearCountries = new Set(
      currentYearVisits.map(visit => visit.country)
    );

    // Most visited countries
    const countryCount = visits.reduce(
      (acc: Record<string, number>, visit) => {
        acc[visit.country] = (acc[visit.country] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostVisitedCountries = Object.entries(countryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ country, visits: count }));

    // Recent activity (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentVisits = visits.filter(
      visit => visit.entryDate >= sixMonthsAgo
    );

    // Visa type distribution
    const visaTypes = visits.reduce(
      (acc: Record<string, number>, visit) => {
        acc[visit.visaType] = (acc[visit.visaType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCountries: uniqueCountries.size,
          totalVisits: visits.length,
          totalDays,
          schengenDays,
          schengenVisits: schengenVisits.length,
        },
        currentYear: {
          visits: currentYearVisits.length,
          countries: currentYearCountries.size,
        },
        mostVisitedCountries,
        recentActivity: {
          visits: recentVisits.length,
          countries: new Set(recentVisits.map(v => v.country)).size,
        },
        visaTypeDistribution: Object.entries(visaTypes)
          .sort(([, a], [, b]) => b - a)
          .map(([type, count]) => ({ type, count })),
        timeline: visits.slice(0, 10).map(visit => ({
          id: visit.id,
          country: visit.country,
          entryDate: visit.entryDate.toISOString(),
          exitDate: visit.exitDate?.toISOString() || null,
          visaType: visit.visaType,
          days: visit.exitDate
            ? Math.ceil(
                (visit.exitDate.getTime() - visit.entryDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : null,
        })),
      },
    });
  } catch (error) {
    // Error fetching statistics
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

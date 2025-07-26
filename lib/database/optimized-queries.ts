import { PrismaClient } from '@prisma/client'
import type { CountryVisit } from '@/types/global'

const prisma = new PrismaClient()

/**
 * Optimized database queries for DiNoCal
 * Uses proper indexes and query optimization techniques
 */

export interface TripQueryOptions {
  userId: string
  limit?: number
  offset?: number
  country?: string
  visaType?: string
  dateFrom?: Date
  dateTo?: Date
  orderBy?: 'entryDate' | 'createdAt'
  orderDirection?: 'asc' | 'desc'
}

export interface SchengenQueryOptions {
  userId: string
  fromDate?: Date
  toDate?: Date
  passportCountry?: string
}

/**
 * Get user trips with optimized filtering and pagination
 */
export async function getUserTrips(options: TripQueryOptions): Promise<CountryVisit[]> {
  const {
    userId,
    limit = 50,
    offset = 0,
    country,
    visaType,
    dateFrom,
    dateTo,
    orderBy = 'entryDate',
    orderDirection = 'desc'
  } = options

  const where: any = { userId }

  // Add filters
  if (country) {
    where.country = country
  }
  
  if (visaType) {
    where.visaType = visaType
  }

  if (dateFrom || dateTo) {
    where.entryDate = {}
    if (dateFrom) {
      where.entryDate.gte = dateFrom
    }
    if (dateTo) {
      where.entryDate.lte = dateTo
    }
  }

  // Use optimized query with proper indexes
  const trips = await prisma.countryVisit.findMany({
    where,
    orderBy: {
      [orderBy]: orderDirection
    },
    take: limit,
    skip: offset,
    select: {
      id: true,
      userId: true,
      country: true,
      entryDate: true,
      exitDate: true,
      visaType: true,
      maxDays: true,
      passportCountry: true,
      notes: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return trips.map(trip => ({
    ...trip,
    entryDate: trip.entryDate.toISOString(),
    exitDate: trip.exitDate?.toISOString() || null,
    visaType: trip.visaType as any,
    passportCountry: trip.passportCountry as any
  })) as CountryVisit[]
}

/**
 * Get trips for Schengen calculation (optimized for date ranges)
 */
export async function getSchengenTrips(options: SchengenQueryOptions): Promise<CountryVisit[]> {
  const { userId, fromDate, toDate, passportCountry } = options

  const where: any = {
    userId,
    country: {
      in: getSchengenCountries() // List of Schengen countries
    }
  }

  if (passportCountry) {
    where.passportCountry = passportCountry
  }

  if (fromDate || toDate) {
    where.OR = [
      // Entry date in range
      {
        entryDate: {
          gte: fromDate,
          lte: toDate
        }
      },
      // Exit date in range
      {
        exitDate: {
          gte: fromDate,
          lte: toDate
        }
      },
      // Trip spans the entire range
      {
        AND: [
          { entryDate: { lte: fromDate } },
          {
            OR: [
              { exitDate: { gte: toDate } },
              { exitDate: null } // Still in country
            ]
          }
        ]
      }
    ]
  }

  // Use compound index [userId, entryDate, exitDate]
  const trips = await prisma.countryVisit.findMany({
    where,
    orderBy: {
      entryDate: 'asc'
    },
    select: {
      id: true,
      country: true,
      entryDate: true,
      exitDate: true,
      visaType: true,
      maxDays: true,
      passportCountry: true
    }
  })

  return trips.map(trip => ({
    ...trip,
    entryDate: trip.entryDate.toISOString(),
    exitDate: trip.exitDate?.toISOString() || null,
    visaType: trip.visaType as any,
    passportCountry: trip.passportCountry as any
  })) as CountryVisit[]
}

/**
 * Get user statistics (optimized aggregation)
 */
export async function getUserStats(userId: string) {
  // Use Promise.all for parallel execution
  const [
    totalTrips,
    countriesVisited,
    currentTrips,
    schengenTrips,
    recentTrips
  ] = await Promise.all([
    // Total trips count
    prisma.countryVisit.count({
      where: { userId }
    }),

    // Unique countries count
    prisma.countryVisit.groupBy({
      by: ['country'],
      where: { userId },
      _count: { country: true }
    }),

    // Current ongoing trips
    prisma.countryVisit.count({
      where: {
        userId,
        exitDate: null
      }
    }),

    // Schengen trips in last 180 days
    prisma.countryVisit.count({
      where: {
        userId,
        country: {
          in: getSchengenCountries()
        },
        entryDate: {
          gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        }
      }
    }),

    // Recent trips (last 30 days)
    prisma.countryVisit.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        country: true,
        entryDate: true,
        visaType: true
      }
    })
  ])

  return {
    totalTrips,
    countriesVisited: countriesVisited.length,
    currentTrips,
    schengenTrips,
    recentTrips
  }
}

/**
 * Bulk operations for better performance
 */
export async function createMultipleTrips(userId: string, trips: Omit<CountryVisit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]) {
  const data = trips.map(trip => ({
    ...trip,
    userId,
    passportCountry: trip.passportCountry || 'Unknown',
    entryDate: new Date(trip.entryDate),
    exitDate: trip.exitDate ? new Date(trip.exitDate) : null
  }))

  return await prisma.countryVisit.createMany({
    data
  })
}

/**
 * Search trips with full-text search on notes
 */
export async function searchTrips(userId: string, query: string, limit = 20): Promise<CountryVisit[]> {
  // Use LIKE for SQLite compatibility
  const trips = await prisma.countryVisit.findMany({
    where: {
      userId,
      OR: [
        {
          country: {
            contains: query
          }
        },
        {
          notes: {
            contains: query
          }
        },
        {
          visaType: {
            contains: query
          }
        }
      ]
    },
    orderBy: {
      entryDate: 'desc'
    },
    take: limit,
    select: {
      id: true,
      userId: true,
      country: true,
      entryDate: true,
      exitDate: true,
      visaType: true,
      maxDays: true,
      passportCountry: true,
      notes: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return trips.map(trip => ({
    ...trip,
    entryDate: trip.entryDate.toISOString(),
    exitDate: trip.exitDate?.toISOString() || null,
    visaType: trip.visaType as any,
    passportCountry: trip.passportCountry as any
  })) as CountryVisit[]
}

/**
 * Get Schengen countries list (cached)
 */
function getSchengenCountries(): string[] {
  return [
    'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
    'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia',
    'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland',
    'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
    'Liechtenstein'
  ]
}

/**
 * Database health check and optimization suggestions
 */
export async function getDatabaseHealth() {
  const [
    totalUsers,
    totalTrips,
    recentActivity,
    oldestTrip,
    newestTrip
  ] = await Promise.all([
    prisma.user.count(),
    prisma.countryVisit.count(),
    prisma.countryVisit.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    }),
    prisma.countryVisit.findFirst({
      orderBy: { entryDate: 'asc' },
      select: { entryDate: true }
    }),
    prisma.countryVisit.findFirst({
      orderBy: { entryDate: 'desc' },
      select: { entryDate: true }
    })
  ])

  return {
    totalUsers,
    totalTrips,
    recentActivity,
    dataRange: {
      oldest: oldestTrip?.entryDate,
      newest: newestTrip?.entryDate
    },
    avgTripsPerUser: totalUsers > 0 ? Math.round(totalTrips / totalUsers) : 0
  }
}

/**
 * Clean up old data (for maintenance)
 */
export async function cleanupOldData(olderThanDays = 365 * 2) {
  const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
  
  const result = await prisma.countryVisit.deleteMany({
    where: {
      entryDate: {
        lt: cutoffDate
      },
      // Only delete if user hasn't been active recently
      user: {
        updatedAt: {
          lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year inactive
        }
      }
    }
  })
  
  return result.count
}

export default prisma
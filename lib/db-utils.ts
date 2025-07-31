import { prisma } from './prisma'
import { OptimizedQueries, dbPerformanceMonitor } from './db-performance'
import type { VisaType, PassportCountry } from '@/types/global'

// User operations with performance optimization
export async function getUserByEmail(email: string) {
  const startTime = Date.now()
  
  const result = await prisma.user.findUnique({
    where: { email },
    include: {
      countryVisits: {
        orderBy: { entryDate: 'desc' },
        take: 50 // Limit initial load for performance
      },
      notificationSettings: true
    }
  })
  
  const duration = Date.now() - startTime
  dbPerformanceMonitor.trackQuery('getUserByEmail', duration, { email })
  
  return result
}

export async function getUserById(id: string) {
  // Use optimized query with caching
  return await OptimizedQueries.getUserWithTrips(prisma, id, 50)
}

// Country visit operations
export async function createCountryVisit(data: {
  userId: string
  country: string
  entryDate: Date
  exitDate?: Date | null
  visaType: VisaType
  maxDays: number
  passportCountry: PassportCountry
  notes?: string
}) {
  return await prisma.countryVisit.create({
    data: {
      ...data,
      entryDate: new Date(data.entryDate),
      exitDate: data.exitDate ? new Date(data.exitDate) : null,
    }
  })
}

export async function updateCountryVisit(id: string, data: {
  country?: string
  entryDate?: Date
  exitDate?: Date | null
  visaType?: VisaType
  maxDays?: number
  notes?: string
}) {
  return await prisma.countryVisit.update({
    where: { id },
    data: {
      ...data,
      entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
      exitDate: data.exitDate ? new Date(data.exitDate) : undefined,
    }
  })
}

export async function deleteCountryVisit(id: string) {
  return await prisma.countryVisit.delete({
    where: { id }
  })
}

export async function getUserCountryVisits(userId: string, limit: number = 100) {
  const startTime = Date.now()
  
  const result = await prisma.countryVisit.findMany({
    where: { userId },
    orderBy: { entryDate: 'desc' },
    take: limit
  })
  
  const duration = Date.now() - startTime
  dbPerformanceMonitor.trackQuery('getUserCountryVisits', duration, { userId, limit })
  
  return result
}

// Schengen calculations with optimization
export async function getSchengenCountryVisits(userId: string, fromDate: Date, toDate: Date = new Date()) {
  // Use optimized query with caching and compound indexes
  return await OptimizedQueries.getSchengenVisitsOptimized(prisma, userId, fromDate, toDate)
}

// Notification settings
export async function updateNotificationSettings(userId: string, settings: {
  visaExpiryDays?: number[]
  schengenWarningDays?: number
  emailEnabled?: boolean
  pushEnabled?: boolean
}) {
  return await prisma.notificationSettings.upsert({
    where: { userId },
    update: {
      ...settings,
      visaExpiryDays: settings.visaExpiryDays ? JSON.stringify(settings.visaExpiryDays) : undefined,
    },
    create: {
      userId,
      ...settings,
      visaExpiryDays: settings.visaExpiryDays ? JSON.stringify(settings.visaExpiryDays) : "7,14,30",
    }
  })
}

// Analytics with optimized aggregation
export async function getUserTravelStats(userId: string) {
  // Use optimized country statistics query
  const countryStats = await OptimizedQueries.getCountryStatistics(prisma, userId) as Array<{
    country: string
    visit_count: number
    total_days: number
    first_visit: Date
    last_visit: Date
  }>
  
  // Calculate aggregate statistics
  const totalCountries = countryStats.length
  const totalDays = countryStats.reduce((sum: number, stat) => sum + Number(stat.total_days || 0), 0)
  const totalVisits = countryStats.reduce((sum: number, stat) => sum + Number(stat.visit_count || 0), 0)
  
  // Calculate Schengen-specific stats
  const schengenCountries = [
    'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 
    'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 
    'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 
    'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
  ]
  
  const schengenStats = countryStats.filter(stat => schengenCountries.includes(stat.country))
  const schengenDays = schengenStats.reduce((sum: number, stat) => sum + Number(stat.total_days || 0), 0)

  return {
    totalCountries,
    totalDays,
    schengenDays,
    totalVisits,
    countryBreakdown: countryStats
  }
}

// Cache invalidation helper
export function invalidateUserCache(userId: string) {
  OptimizedQueries.clearUserCache(userId)
}
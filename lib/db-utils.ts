import { prisma } from './prisma'
import type { VisaType, PassportCountry, CountryVisit, User } from '@/types/global'

// User operations
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      countryVisits: {
        orderBy: { entryDate: 'desc' }
      },
      notificationSettings: true
    }
  })
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      countryVisits: {
        orderBy: { entryDate: 'desc' }
      },
      notificationSettings: true
    }
  })
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

export async function getUserCountryVisits(userId: string) {
  return await prisma.countryVisit.findMany({
    where: { userId },
    orderBy: { entryDate: 'desc' }
  })
}

// Schengen calculations
export async function getSchengenCountryVisits(userId: string, fromDate: Date) {
  const schengenCountries = [
    'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 
    'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 
    'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 
    'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
  ]

  return await prisma.countryVisit.findMany({
    where: {
      userId,
      country: { in: schengenCountries },
      entryDate: { gte: fromDate }
    },
    orderBy: { entryDate: 'asc' }
  })
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

// Analytics
export async function getUserTravelStats(userId: string) {
  const visits = await prisma.countryVisit.findMany({
    where: { userId }
  })

  const uniqueCountries = new Set(visits.map(visit => visit.country))
  const totalDays = visits.reduce((sum, visit) => {
    if (visit.exitDate) {
      const days = Math.ceil((visit.exitDate.getTime() - visit.entryDate.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }
    return sum
  }, 0)

  const schengenVisits = visits.filter(visit => {
    const schengenCountries = [
      'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 
      'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 
      'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 
      'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
    ]
    return schengenCountries.includes(visit.country)
  })

  const schengenDays = schengenVisits.reduce((sum, visit) => {
    if (visit.exitDate) {
      const days = Math.ceil((visit.exitDate.getTime() - visit.entryDate.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }
    return sum
  }, 0)

  return {
    totalCountries: uniqueCountries.size,
    totalDays,
    schengenDays,
    totalVisits: visits.length
  }
}
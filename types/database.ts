/**
 * Database types for client-side use
 * These types mirror Prisma types but can be safely imported on the client side
 */

export interface CountryVisit {
  id: string
  userId: string
  country: string
  entryDate: Date
  exitDate: Date
  purpose: string
  notes?: string | null
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name?: string | null
  image?: string | null
  provider?: string | null
  providerId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Trip {
  id: string
  userId: string
  country: string
  entryDate: Date
  exitDate: Date
  purpose: string
  notes?: string | null
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

// Helper type for API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Travel-related enums and constants
export const TripPurpose = {
  TOURISM: 'TOURISM',
  BUSINESS: 'BUSINESS',
  EDUCATION: 'EDUCATION',
  FAMILY: 'FAMILY',
  MEDICAL: 'MEDICAL',
  TRANSIT: 'TRANSIT',
  OTHER: 'OTHER'
} as const

export type TripPurposeType = typeof TripPurpose[keyof typeof TripPurpose]

export const TripStatus = {
  PLANNED: 'PLANNED',
  ONGOING: 'ONGOING', 
  COMPLETED: 'COMPLETED'
} as const

export type TripStatusType = typeof TripStatus[keyof typeof TripStatus]
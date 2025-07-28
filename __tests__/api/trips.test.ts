import { GET, POST, PUT, DELETE } from '@/app/api/trips/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { getPrismaClient } from '@/lib/database/dev-prisma'
import { getUserTripsOptimized } from '@/lib/database/query-optimizer'

// Get mocked prisma client
const prisma = getPrismaClient()

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

const mockTrip = {
  id: '1',
  userId: 'test-user',
  country: 'France',
  entryDate: '2024-01-01',
  exitDate: '2024-01-15',
  visaType: 'Tourist',
  maxDays: 90,
  passportCountry: 'US',
  notes: 'Test trip 1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

const mockSession = {
  user: {
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User'
  }
}

describe('/api/trips API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
  })

  describe('GET /api/trips', () => {
    it('should return trips for authenticated user', async () => {
      const mockUser = { id: 'test-user', email: 'test@example.com' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(getUserTripsOptimized as jest.Mock).mockResolvedValue([mockTrip])

      const request = new NextRequest('http://localhost:3000/api/trips')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0]).toMatchObject({
        id: '1',
        country: 'France',
        entryDate: '2024-01-01',
        exitDate: '2024-01-15'
      })
    })

    it('should return 401 for unauthenticated user', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)
      
      const request = new NextRequest('http://localhost:3000/api/trips')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('should handle database errors gracefully', async () => {
      const mockUser = { id: 'test-user', email: 'test@example.com' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(getUserTripsOptimized as jest.Mock).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/trips')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.error).toBe('Database operation failed')
    })
  })

  describe('POST /api/trips', () => {
    const validTripData = {
      country: 'Italy',
      entryDate: '2024-07-01',
      exitDate: '2024-07-15',
      visaType: 'Tourist' as const,
      maxDays: 90,
      passportCountry: 'US' as const,
      notes: 'Summer vacation'
    }

    it('should create a new trip', async () => {
      const mockUser = { id: 'test-user', email: 'test@example.com' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      
      const createdTrip = { ...mockTrip, ...validTripData, id: '3' }
      ;(prisma.countryVisit.create as jest.Mock).mockResolvedValue(createdTrip)

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(validTripData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toMatchObject({
        country: 'Italy',
        entryDate: '2024-07-01',
        exitDate: '2024-07-15'
      })
    })

    it('should validate required fields', async () => {
      const mockUser = { id: 'test-user', email: 'test@example.com' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      
      const invalidData = {
        country: '', // Empty country
        entryDate: '2024-07-01',
        visaType: 'Tourist' as const,
        passportCountry: 'US' as const
        // Missing exitDate, maxDays
      }

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.error).toContain('Validation')
    })

    it('should validate date format', async () => {
      const invalidDateData = {
        ...validTripData,
        entryDate: 'invalid-date',
        exitDate: '2024-13-45' // Invalid date
      }

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(invalidDateData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should require authentication', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(validTripData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('PUT /api/trips', () => {
    const updateData = {
      id: '1',
      country: 'Spain',
      entryDate: '2024-01-01',
      exitDate: '2024-01-20', // Extended stay
      visaType: 'Tourist' as const,
      maxDays: 90,
      passportCountry: 'US' as const,
      notes: 'Extended vacation'
    }

    it('should update existing trip', async () => {
      ;(prisma.countryVisit.findUnique as jest.Mock).mockResolvedValue(mockTrip)
      ;(prisma.countryVisit.update as jest.Mock).mockResolvedValue({ ...mockTrip, ...updateData })

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.trip.country).toBe('Spain')
      expect(data.trip.exitDate).toBe('2024-01-20')
    })

    it('should require trip ID for updates', async () => {
      const dataWithoutId = {
        ...updateData
      }
      delete (dataWithoutId as any).id

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'PUT',
        body: JSON.stringify(dataWithoutId),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Trip ID is required')
    })

    it('should return 404 for non-existent trip', async () => {
      ;(prisma.countryVisit.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'PUT',
        body: JSON.stringify({ ...updateData, id: '999' }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Trip not found')
    })
  })

  describe('DELETE /api/trips', () => {
    it('should delete existing trip', async () => {
      ;(prisma.countryVisit.findUnique as jest.Mock).mockResolvedValue(mockTrip)
      ;(prisma.countryVisit.delete as jest.Mock).mockResolvedValue(mockTrip)

      const request = new NextRequest('http://localhost:3000/api/trips?id=1', {
        method: 'DELETE'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Trip deleted successfully')
    })

    it('should require trip ID for deletion', async () => {
      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'DELETE'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Trip ID is required')
    })

    it('should return 404 for non-existent trip', async () => {
      ;(prisma.countryVisit.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/trips?id=999', {
        method: 'DELETE'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Trip not found')
    })

    it('should require authentication', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/trips?id=1', {
        method: 'DELETE'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('API Security', () => {
    it('should sanitize SQL injection attempts', async () => {
      const maliciousData = {
        country: "'; DROP TABLE trips; --",
        entryDate: '2024-07-01',
        exitDate: '2024-07-15',
        visaType: 'Tourist' as const,
        maxDays: 90,
        passportCountry: 'US' as const,
        notes: 'Malicious attempt'
      }

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(maliciousData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      
      // Should either reject or sanitize the input
      expect([400, 201]).toContain(response.status)
      
      if (response.status === 201) {
        const data = await response.json()
        expect(data.trip.country).not.toContain('DROP TABLE')
      }
    })

    it('should validate content type', async () => {
      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'text/plain'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('Data Consistency', () => {
    it('should maintain data integrity across operations', async () => {
      // Create a trip
      const tripData = {
        country: 'Portugal',
        entryDate: '2024-08-01',
        exitDate: '2024-08-15',
        visaType: 'Tourist' as const,
        maxDays: 90,
        passportCountry: 'US' as const,
        notes: 'Beach vacation'
      }

      const createdTrip = { ...mockTrip, ...tripData, id: 'new-trip-id' }
      ;(prisma.countryVisit.create as jest.Mock).mockResolvedValue(createdTrip)

      const createRequest = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(tripData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const createResponse = await POST(createRequest)
      expect(createResponse.status).toBe(201)

      // Update the trip
      const updateData = {
        id: 'new-trip-id',
        ...tripData,
        exitDate: '2024-08-20', // Extended
        notes: 'Extended beach vacation'
      }

      const updatedTrip = { ...createdTrip, ...updateData }
      ;(prisma.countryVisit.findUnique as jest.Mock).mockResolvedValue(createdTrip)
      ;(prisma.countryVisit.update as jest.Mock).mockResolvedValue(updatedTrip)

      const updateRequest = new NextRequest('http://localhost:3000/api/trips', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const updateResponse = await PUT(updateRequest)
      expect(updateResponse.status).toBe(200)

      const updateResponseData = await updateResponse.json()
      expect(updateResponseData.trip.exitDate).toBe('2024-08-20')
      expect(updateResponseData.trip.notes).toBe('Extended beach vacation')
    })
  })
})
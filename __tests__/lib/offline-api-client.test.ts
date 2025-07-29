import { OfflineApiClient } from '@/lib/offline-api-client'
import { ApiClient } from '@/lib/api-client'
import type { CountryVisit } from '@/types/global'

// Mock api-client
jest.mock('@/lib/api-client', () => ({
  ApiClient: {
    getTrips: jest.fn(),
    createTrip: jest.fn(),
    getCountries: jest.fn(),
    getSchengenStatus: jest.fn()
  }
}))

// Mock offline-storage
jest.mock('@/lib/offline-storage', () => ({
  offlineStorage: {
    saveTrips: jest.fn(),
    getTrips: jest.fn(),
    saveCountries: jest.fn(),
    getCountries: jest.fn(),
    cacheApiResponse: jest.fn(),
    deleteCachedApiResponse: jest.fn(),
    addTripToQueue: jest.fn(),
    getOfflineQueue: jest.fn(),
    clearOfflineQueue: jest.fn(),
    cleanExpiredCache: jest.fn()
  }
}))

describe('OfflineApiClient Integration Tests', () => {
  const mockTrip: CountryVisit = {
    id: '1',
    userId: 'test-user',
    country: 'France',
    entryDate: '2024-01-01',
    exitDate: '2024-01-15',
    visaType: 'Tourist',
    maxDays: 90,
    notes: 'Test trip',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true
    })
  })

  describe('Online Operations', () => {
    it('should fetch trips when online', async () => {
      const mockApiResponse = {
        success: true,
        data: [mockTrip],
        message: 'Success'
      }

      ;(ApiClient.getTrips as jest.Mock).mockResolvedValue(mockApiResponse)

      const result = await OfflineApiClient.getTrips('test-user')

      expect(ApiClient.getTrips).toHaveBeenCalledWith('test-user')
      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockTrip])
    })

    it('should create trip when online', async () => {
      const tripData = {
        country: 'Germany',
        entryDate: '2024-02-01',
        exitDate: '2024-02-15',
        visaType: 'Tourist' as const,
        maxDays: 90,
        notes: 'Business trip'
      }

      const mockApiResponse = {
        success: true,
        data: { ...mockTrip, ...tripData },
        message: 'Created successfully'
      }

      ;(ApiClient.createTrip as jest.Mock).mockResolvedValue(mockApiResponse)

      const result = await OfflineApiClient.createTrip(tripData, 'test-user')

      expect(ApiClient.createTrip).toHaveBeenCalledWith(tripData, 'test-user')
      expect(result.success).toBe(true)
    })

    it('should get countries when online', async () => {
      const mockCountries = [
        { code: 'FR', name: 'France', continent: 'Europe' },
        { code: 'DE', name: 'Germany', continent: 'Europe' }
      ]

      const mockApiResponse = {
        success: true,
        data: mockCountries,
        message: 'Success'
      }

      ;(ApiClient.getCountries as jest.Mock).mockResolvedValue(mockApiResponse)

      const result = await OfflineApiClient.getCountries()

      expect(ApiClient.getCountries).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockCountries)
    })
  })

  describe('Offline Operations', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      })
    })

    it('should return cached trips when offline', async () => {
      const { offlineStorage } = require('@/lib/offline-storage')
      offlineStorage.getTrips.mockResolvedValue([mockTrip])

      const result = await OfflineApiClient.getTrips('test-user')

      expect(offlineStorage.getTrips).toHaveBeenCalledWith('test-user')
      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockTrip])
      expect(result.message).toContain('오프라인')
    })

    it('should queue trip creation when offline', async () => {
      const { offlineStorage } = require('@/lib/offline-storage')
      const tripData = {
        country: 'Italy',
        entryDate: '2024-03-01',
        exitDate: '2024-03-15',
        visaType: 'Tourist' as const,
        maxDays: 90,
        notes: 'Vacation'
      }

      offlineStorage.getTrips.mockResolvedValue([])

      const result = await OfflineApiClient.createTrip(tripData, 'test-user')

      expect(offlineStorage.addTripToQueue).toHaveBeenCalledWith(tripData)
      expect(offlineStorage.saveTrips).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.message).toContain('오프라인')
    })

    it('should return cached countries when offline', async () => {
      const { offlineStorage } = require('@/lib/offline-storage')
      const mockCountries = [
        { code: 'FR', name: 'France', continent: 'Europe' }
      ]

      offlineStorage.getCountries.mockResolvedValue(mockCountries)

      const result = await OfflineApiClient.getCountries()

      expect(offlineStorage.getCountries).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockCountries)
    })

    it('should return default countries when no cached data', async () => {
      const { offlineStorage } = require('@/lib/offline-storage')
      offlineStorage.getCountries.mockResolvedValue([])

      const result = await OfflineApiClient.getCountries()

      expect(result.success).toBe(true)
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.message).toContain('기본')
    })
  })

  describe('Schengen Calculation', () => {
    it('should calculate Schengen status online', async () => {
      const mockSchengenStatus = {
        usedDays: 15,
        remainingDays: 75,
        isCompliant: true,
        nextResetDate: '2024-07-01'
      }

      const mockApiResponse = {
        success: true,
        data: mockSchengenStatus,
        message: 'Success'
      }

      ;(ApiClient.getSchengenStatus as jest.Mock).mockResolvedValue(mockApiResponse)

      const result = await OfflineApiClient.getSchengenStatus('test-user')

      expect(ApiClient.getSchengenStatus).toHaveBeenCalledWith('test-user')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSchengenStatus)
    })

    it('should calculate Schengen status offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      })

      const { offlineStorage } = require('@/lib/offline-storage')
      // Use a recent date that's within the last 180 days
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 30) // 30 days ago
      const entryDate = recentDate.toISOString().split('T')[0]
      const exitDateObj = new Date(recentDate)
      exitDateObj.setDate(exitDateObj.getDate() + 14) // 14 day trip
      const exitDate = exitDateObj.toISOString().split('T')[0]

      const schengenTrips = [
        {
          ...mockTrip,
          country: 'France',
          entryDate,
          exitDate
        }
      ]

      offlineStorage.getTrips.mockResolvedValue(schengenTrips)

      const result = await OfflineApiClient.getSchengenStatus('test-user')

      expect(result.success).toBe(true)
      expect(result.data.usedDays).toBeGreaterThan(0)
      expect(result.data.remainingDays).toBeLessThan(90)
      expect(result.message).toContain('오프라인')
    })
  })

  describe('Offline Sync', () => {
    it('should sync offline data when online', async () => {
      const { offlineStorage } = require('@/lib/offline-storage')
      const queuedItems = [
        {
          type: 'ADD_TRIP',
          data: {
            country: 'Spain',
            entryDate: '2024-04-01',
            exitDate: '2024-04-15',
            visaType: 'Tourist',
            maxDays: 90
          }
        }
      ]

      offlineStorage.getOfflineQueue.mockResolvedValue(queuedItems)
      ;(ApiClient.createTrip as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTrip
      })

      await OfflineApiClient.syncOfflineData()

      expect(ApiClient.createTrip).toHaveBeenCalledWith(queuedItems[0].data)
      expect(offlineStorage.clearOfflineQueue).toHaveBeenCalled()
    })

    it('should not sync when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      })

      const { offlineStorage } = require('@/lib/offline-storage')

      await OfflineApiClient.syncOfflineData()

      expect(offlineStorage.getOfflineQueue).not.toHaveBeenCalled()
    })
  })

  describe('Network State Management', () => {
    it('should detect online state correctly', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true
      })

      expect(OfflineApiClient.isOnline()).toBe(true)
    })

    it('should detect offline state correctly', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      })

      expect(OfflineApiClient.isOnline()).toBe(false)
    })

    it('should handle API failures gracefully', async () => {
      ;(ApiClient.getTrips as jest.Mock).mockRejectedValue(new Error('Network error'))

      const { offlineStorage } = require('@/lib/offline-storage')
      offlineStorage.getTrips.mockResolvedValue([mockTrip])

      const result = await OfflineApiClient.getTrips('test-user')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockTrip])
      expect(result.message).toContain('오프라인')
    })
  })

  describe('Data Preloading', () => {
    it('should preload offline data successfully', async () => {
      const { offlineStorage } = require('@/lib/offline-storage')
      const mockCountries = [
        { code: 'FR', name: 'France', continent: 'Europe' }
      ]

      ;(ApiClient.getCountries as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCountries
      })

      await OfflineApiClient.preloadOfflineData()

      expect(ApiClient.getCountries).toHaveBeenCalled()
      expect(offlineStorage.cleanExpiredCache).toHaveBeenCalled()
    })

    it('should handle preload failures gracefully', async () => {
      ;(ApiClient.getCountries as jest.Mock).mockRejectedValue(new Error('Preload failed'))

      // Should not throw
      await expect(OfflineApiClient.preloadOfflineData()).resolves.toBeUndefined()
    })
  })
})
// Offline Storage Tests - IndexedDB Storage Testing

import { offlineStorage } from '@/lib/offline-storage';

// Mock IndexedDB
const mockDB: Partial<IDBDatabase> = {
  transaction: jest.fn(),
  objectStoreNames: {
    contains: jest.fn(),
  } as any,
  createObjectStore: jest.fn(),
};

const mockTransaction: Partial<IDBTransaction> = {
  objectStore: jest.fn(),
  oncomplete: null,
  onerror: null,
};

const mockObjectStore: Partial<IDBObjectStore> = {
  add: jest.fn(),
  put: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  createIndex: jest.fn(),
  index: jest.fn(),
};

const mockRequest: Partial<IDBRequest> = {
  onsuccess: null,
  onerror: null,
  result: null,
};

const mockIndex: Partial<IDBIndex> = {
  openCursor: jest.fn(),
};

const mockCursor: Partial<IDBCursorWithValue> = {
  continue: jest.fn(),
  delete: jest.fn(),
  value: null,
};

// Setup global IndexedDB mock
global.indexedDB = {
  open: jest.fn(),
} as any;

describe('Offline Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    (mockDB.transaction as jest.Mock).mockReturnValue(mockTransaction);
    (mockTransaction.objectStore as jest.Mock).mockReturnValue(mockObjectStore);
    (mockObjectStore.add as jest.Mock).mockReturnValue(mockRequest);
    (mockObjectStore.put as jest.Mock).mockReturnValue(mockRequest);
    (mockObjectStore.get as jest.Mock).mockReturnValue(mockRequest);
    (mockObjectStore.getAll as jest.Mock).mockReturnValue(mockRequest);
    (mockObjectStore.delete as jest.Mock).mockReturnValue(mockRequest);
    (mockObjectStore.clear as jest.Mock).mockReturnValue(mockRequest);
    (mockObjectStore.index as jest.Mock).mockReturnValue(mockIndex);
    (mockIndex.openCursor as jest.Mock).mockReturnValue(mockRequest);
  });

  describe('initialization', () => {
    it('should initialize IndexedDB with correct database name and version', async () => {
      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockDB,
      };

      (global.indexedDB.open as jest.Mock).mockReturnValue(mockOpenRequest);

      const initPromise = offlineStorage.init();

      expect(global.indexedDB.open).toHaveBeenCalledWith('DinoOfflineDB', 1);

      // Simulate successful connection
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess({} as any);
      }

      await expect(initPromise).resolves.toBeUndefined();
    });

    it('should handle initialization errors', async () => {
      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        error: new Error('Database initialization failed'),
      };

      (global.indexedDB.open as jest.Mock).mockReturnValue(mockOpenRequest);

      const initPromise = offlineStorage.init();

      // Simulate error
      if (mockOpenRequest.onerror) {
        mockOpenRequest.onerror({} as any);
      }

      await expect(initPromise).rejects.toEqual(mockOpenRequest.error);
    });

    it('should create object stores during database upgrade', async () => {
      const mockUpgradeDB = {
        objectStoreNames: {
          contains: jest
            .fn()
            .mockReturnValueOnce(false) // trips
            .mockReturnValueOnce(false) // countries
            .mockReturnValueOnce(false) // apiCache
            .mockReturnValueOnce(false), // offlineQueue
        },
        createObjectStore: jest.fn().mockReturnValue({
          createIndex: jest.fn(),
        }),
      };

      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockDB,
      };

      (global.indexedDB.open as jest.Mock).mockReturnValue(mockOpenRequest);

      const initPromise = offlineStorage.init();

      // Simulate upgrade needed
      if (mockOpenRequest.onupgradeneeded) {
        mockOpenRequest.onupgradeneeded({
          target: { result: mockUpgradeDB },
        } as any);
      }

      // Then success
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess({} as any);
      }

      await initPromise;

      expect(mockUpgradeDB.createObjectStore).toHaveBeenCalledWith('trips', {
        keyPath: 'id',
      });
      expect(mockUpgradeDB.createObjectStore).toHaveBeenCalledWith(
        'countries',
        { keyPath: 'code' }
      );
      expect(mockUpgradeDB.createObjectStore).toHaveBeenCalledWith('apiCache', {
        keyPath: 'key',
      });
      expect(mockUpgradeDB.createObjectStore).toHaveBeenCalledWith(
        'offlineQueue',
        { keyPath: 'id', autoIncrement: true }
      );
    });
  });

  describe('trip management', () => {
    beforeEach(async () => {
      // Mock successful initialization
      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockDB,
      };

      (global.indexedDB.open as jest.Mock).mockReturnValue(mockOpenRequest);

      const initPromise = offlineStorage.init();
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess({} as any);
      }
      await initPromise;
    });

    it('should save trips successfully', async () => {
      const mockTrips = [
        {
          id: '1',
          userId: 'user1',
          country: 'France',
          entryDate: '2024-01-01',
        },
        {
          id: '2',
          userId: 'user1',
          country: 'Germany',
          entryDate: '2024-02-01',
        },
      ];

      const savePromise = offlineStorage.saveTrips(mockTrips);

      expect(mockDB.transaction).toHaveBeenCalledWith(['trips'], 'readwrite');
      expect(mockTransaction.objectStore).toHaveBeenCalledWith('trips');
      expect(mockObjectStore.clear).toHaveBeenCalled();

      // Simulate successful clear
      const clearRequest = mockObjectStore.clear();
      if (clearRequest && (clearRequest as any).onsuccess) {
        (clearRequest as any).onsuccess();
      }

      // Simulate successful transaction
      if (mockTransaction.oncomplete) {
        mockTransaction.oncomplete({} as any);
      }

      await expect(savePromise).resolves.toBeUndefined();
      expect(mockObjectStore.add).toHaveBeenCalledTimes(2);
    });

    it('should handle save trips errors', async () => {
      const mockTrips = [{ id: '1', userId: 'user1', country: 'France' }];
      const error = new Error('Save failed');

      const savePromise = offlineStorage.saveTrips(mockTrips);

      // Simulate transaction error
      if (mockTransaction.onerror) {
        mockTransaction.error = error;
        mockTransaction.onerror({} as any);
      }

      await expect(savePromise).rejects.toEqual(error);
    });

    it('should get all trips', async () => {
      const mockTrips = [
        { id: '1', userId: 'user1', country: 'France' },
        { id: '2', userId: 'user2', country: 'Germany' },
      ];

      (mockRequest as any).result = mockTrips;

      const getPromise = offlineStorage.getTrips();

      expect(mockDB.transaction).toHaveBeenCalledWith(['trips'], 'readonly');
      expect(mockObjectStore.getAll).toHaveBeenCalled();

      // Simulate successful get
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({} as any);
      }

      const result = await getPromise;
      expect(result).toEqual(mockTrips);
    });

    it('should filter trips by userId', async () => {
      const mockTrips = [
        { id: '1', userId: 'user1', country: 'France' },
        { id: '2', userId: 'user2', country: 'Germany' },
        { id: '3', userId: 'user1', country: 'Spain' },
      ];

      (mockRequest as any).result = mockTrips;

      const getPromise = offlineStorage.getTrips('user1');

      // Simulate successful get
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({} as any);
      }

      const result = await getPromise;
      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe('user1');
      expect(result[1].userId).toBe('user1');
    });

    it('should add trip to offline queue', async () => {
      const tripData = {
        country: 'France',
        entryDate: '2024-01-01',
        userId: 'user1',
      };

      const addPromise = offlineStorage.addTripToQueue(tripData);

      expect(mockDB.transaction).toHaveBeenCalledWith(
        ['offlineQueue'],
        'readwrite'
      );
      expect(mockObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ADD_TRIP',
          data: tripData,
          timestamp: expect.any(Number),
        })
      );

      // Simulate successful add
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({} as any);
      }

      await expect(addPromise).resolves.toBeUndefined();
    });
  });

  describe('country management', () => {
    it('should save countries', async () => {
      const mockCountries = [
        { code: 'FR', name: 'France', flag: '🇫🇷' },
        { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      ];

      const savePromise = offlineStorage.saveCountries(mockCountries);

      expect(mockDB.transaction).toHaveBeenCalledWith(
        ['countries'],
        'readwrite'
      );
      expect(mockObjectStore.put).toHaveBeenCalledTimes(2);

      // Simulate successful transaction
      if (mockTransaction.oncomplete) {
        mockTransaction.oncomplete({} as any);
      }

      await expect(savePromise).resolves.toBeUndefined();
    });

    it('should get countries', async () => {
      const mockCountries = [
        { code: 'FR', name: 'France', flag: '🇫🇷' },
        { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      ];

      (mockRequest as any).result = mockCountries;

      const getPromise = offlineStorage.getCountries();

      expect(mockDB.transaction).toHaveBeenCalledWith(
        ['countries'],
        'readonly'
      );
      expect(mockObjectStore.getAll).toHaveBeenCalled();

      // Simulate successful get
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({} as any);
      }

      const result = await getPromise;
      expect(result).toEqual(mockCountries);
    });
  });

  describe('API cache management', () => {
    it('should cache API response with TTL', async () => {
      const key = 'api:trips:user1';
      const data = { trips: [] };
      const ttl = 3600000; // 1 hour

      const cachePromise = offlineStorage.cacheApiResponse(key, data, ttl);

      expect(mockDB.transaction).toHaveBeenCalledWith(
        ['apiCache'],
        'readwrite'
      );
      expect(mockObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          key,
          data,
          timestamp: expect.any(Number),
          expires: expect.any(Number),
        })
      );

      // Simulate successful put
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({} as any);
      }

      await expect(cachePromise).resolves.toBeUndefined();
    });

    it('should get cached API response if not expired', async () => {
      const key = 'api:trips:user1';
      const cachedData = {
        key,
        data: { trips: [] },
        timestamp: Date.now() - 1800000, // 30 minutes ago
        expires: Date.now() + 1800000, // 30 minutes from now
      };

      (mockRequest as any).result = cachedData;

      const getPromise = offlineStorage.getCachedApiResponse(key);

      expect(mockDB.transaction).toHaveBeenCalledWith(['apiCache'], 'readonly');
      expect(mockObjectStore.get).toHaveBeenCalledWith(key);

      // Simulate successful get
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({} as any);
      }

      const result = await getPromise;
      expect(result).toEqual(cachedData.data);
    });

    it('should return null for expired cache', async () => {
      const key = 'api:trips:user1';
      const expiredData = {
        key,
        data: { trips: [] },
        timestamp: Date.now() - 7200000, // 2 hours ago
        expires: Date.now() - 3600000, // 1 hour ago (expired)
      };

      (mockRequest as any).result = expiredData;

      // Mock the delete call for expired cache
      const deleteSpy = jest
        .spyOn(offlineStorage, 'deleteCachedApiResponse')
        .mockResolvedValue();

      const getPromise = offlineStorage.getCachedApiResponse(key);

      // Simulate successful get
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({} as any);
      }

      const result = await getPromise;
      expect(result).toBeNull();
      expect(deleteSpy).toHaveBeenCalledWith(key);

      deleteSpy.mockRestore();
    });

    it('should return null for non-existent cache', async () => {
      const key = 'api:nonexistent';
      (mockRequest as any).result = null;

      const getPromise = offlineStorage.getCachedApiResponse(key);

      // Simulate successful get with null result
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({} as any);
      }

      const result = await getPromise;
      expect(result).toBeNull();
    });

    it('should delete cached API response', async () => {
      const key = 'api:trips:user1';

      const deletePromise = offlineStorage.deleteCachedApiResponse(key);

      expect(mockDB.transaction).toHaveBeenCalledWith(
        ['apiCache'],
        'readwrite'
      );
      expect(mockObjectStore.delete).toHaveBeenCalledWith(key);

      // Simulate successful delete
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({} as any);
      }

      await expect(deletePromise).resolves.toBeUndefined();
    });
  });

  describe('offline queue management', () => {
    it('should get offline queue', async () => {
      const mockQueue = [
        { id: 1, type: 'ADD_TRIP', data: {}, timestamp: Date.now() },
        { id: 2, type: 'UPDATE_TRIP', data: {}, timestamp: Date.now() },
      ];

      (mockRequest as any).result = mockQueue;

      const getPromise = offlineStorage.getOfflineQueue();

      expect(mockDB.transaction).toHaveBeenCalledWith(
        ['offlineQueue'],
        'readonly'
      );
      expect(mockObjectStore.getAll).toHaveBeenCalled();

      // Simulate successful get
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({} as any);
      }

      const result = await getPromise;
      expect(result).toEqual(mockQueue);
    });

    it('should clear offline queue', async () => {
      const clearPromise = offlineStorage.clearOfflineQueue();

      expect(mockDB.transaction).toHaveBeenCalledWith(
        ['offlineQueue'],
        'readwrite'
      );
      expect(mockObjectStore.clear).toHaveBeenCalled();

      // Simulate successful clear
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({} as any);
      }

      await expect(clearPromise).resolves.toBeUndefined();
    });
  });

  describe('cache cleanup', () => {
    it('should clean expired cache entries', async () => {
      const expiredItem = {
        key: 'expired:item',
        data: {},
        timestamp: Date.now() - 7200000,
        expires: Date.now() - 3600000, // Expired 1 hour ago
      };

      const validItem = {
        key: 'valid:item',
        data: {},
        timestamp: Date.now() - 1800000,
        expires: Date.now() + 1800000, // Expires in 30 minutes
      };

      // Mock cursor iteration
      let cursorCall = 0;
      (mockRequest as any).onsuccess = (event: any) => {
        const cursor =
          cursorCall === 0
            ? {
                ...mockCursor,
                value: expiredItem,
                continue: jest.fn(() => cursorCall++),
              }
            : cursorCall === 1
              ? {
                  ...mockCursor,
                  value: validItem,
                  continue: jest.fn(() => cursorCall++),
                }
              : null;

        event.target = { result: cursor };
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess(event);
        }
      };

      const cleanupPromise = offlineStorage.cleanExpiredCache();

      expect(mockDB.transaction).toHaveBeenCalledWith(
        ['apiCache'],
        'readwrite'
      );
      expect(mockObjectStore.index).toHaveBeenCalledWith('timestamp');
      expect(mockIndex.openCursor).toHaveBeenCalled();

      // Trigger cursor iteration
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: { result: null } });
      }

      await expect(cleanupPromise).resolves.toBeUndefined();
    });

    it('should handle cleanup errors', async () => {
      const error = new Error('Cleanup failed');

      const cleanupPromise = offlineStorage.cleanExpiredCache();

      // Simulate request error
      if (mockRequest.onerror) {
        mockRequest.error = error;
        mockRequest.onerror({} as any);
      }

      await expect(cleanupPromise).rejects.toEqual(error);
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      const error = new Error('Connection failed');

      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        error,
      };

      (global.indexedDB.open as jest.Mock).mockReturnValue(mockOpenRequest);

      const initPromise = offlineStorage.init();

      // Simulate error
      if (mockOpenRequest.onerror) {
        mockOpenRequest.onerror({} as any);
      }

      await expect(initPromise).rejects.toEqual(error);
    });

    it('should handle transaction errors in trip operations', async () => {
      // Initialize first
      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockDB,
      };

      (global.indexedDB.open as jest.Mock).mockReturnValue(mockOpenRequest);

      const initPromise = offlineStorage.init();
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess({} as any);
      }
      await initPromise;

      // Now test error handling
      const error = new Error('Transaction failed');
      const trips = [{ id: '1', userId: 'user1', country: 'France' }];

      const savePromise = offlineStorage.saveTrips(trips);

      // Simulate transaction error
      if (mockTransaction.onerror) {
        mockTransaction.error = error;
        mockTransaction.onerror({} as any);
      }

      await expect(savePromise).rejects.toEqual(error);
    });

    it('should handle request errors in get operations', async () => {
      // Initialize first
      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockDB,
      };

      (global.indexedDB.open as jest.Mock).mockReturnValue(mockOpenRequest);

      const initPromise = offlineStorage.init();
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess({} as any);
      }
      await initPromise;

      // Now test error handling
      const error = new Error('Request failed');

      const getPromise = offlineStorage.getTrips();

      // Simulate request error
      if (mockRequest.onerror) {
        mockRequest.error = error;
        mockRequest.onerror({} as any);
      }

      await expect(getPromise).rejects.toEqual(error);
    });
  });
});

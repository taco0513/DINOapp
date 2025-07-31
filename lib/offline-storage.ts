// IndexedDB를 사용한 오프라인 데이터 저장
class OfflineStorage {
  private dbName = 'DinoOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 여행 기록 저장소
        if (!db.objectStoreNames.contains('trips')) {
          const tripsStore = db.createObjectStore('trips', { keyPath: 'id' });
          tripsStore.createIndex('userId', 'userId', { unique: false });
          tripsStore.createIndex('countryCode', 'countryCode', {
            unique: false,
          });
        }

        // 국가 정보 저장소
        if (!db.objectStoreNames.contains('countries')) {
          db.createObjectStore('countries', { keyPath: 'code' });
        }

        // 캐시된 API 응답 저장소
        if (!db.objectStoreNames.contains('apiCache')) {
          const cacheStore = db.createObjectStore('apiCache', {
            keyPath: 'key',
          });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 오프라인 작업 큐
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const queueStore = db.createObjectStore('offlineQueue', {
            keyPath: 'id',
            autoIncrement: true,
          });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // 여행 기록 관련
  async saveTrips(trips: any[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['trips'], 'readwrite');
      const store = transaction.objectStore('trips');

      // 기존 데이터 삭제 후 새 데이터 저장
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        trips.forEach(trip => {
          store.add(trip);
        });
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getTrips(userId?: string): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['trips'], 'readonly');
      const store = transaction.objectStore('trips');
      const request = store.getAll();

      request.onsuccess = () => {
        let trips = request.result;
        if (userId) {
          trips = trips.filter(trip => trip.userId === userId);
        }
        resolve(trips);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async addTripToQueue(tripData: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineQueue'], 'readwrite');
      const store = transaction.objectStore('offlineQueue');

      const queueItem = {
        type: 'ADD_TRIP',
        data: tripData,
        timestamp: Date.now(),
      };

      const request = store.add(queueItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 국가 정보 관련
  async saveCountries(countries: any[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['countries'], 'readwrite');
      const store = transaction.objectStore('countries');

      countries.forEach(country => {
        store.put(country);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getCountries(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['countries'], 'readonly');
      const store = transaction.objectStore('countries');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // API 캐시 관련
  async cacheApiResponse(
    key: string,
    data: any,
    ttl: number = 3600000
  ): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');

      const cacheItem = {
        key,
        data,
        timestamp: Date.now(),
        expires: Date.now() + ttl,
      };

      const request = store.put(cacheItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedApiResponse(key: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readonly');
      const store = transaction.objectStore('apiCache');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // TTL 확인
        if (Date.now() > result.expires) {
          // 만료된 캐시 삭제
          this.deleteCachedApiResponse(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async deleteCachedApiResponse(key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 오프라인 큐 관리
  async getOfflineQueue(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineQueue'], 'readonly');
      const store = transaction.objectStore('offlineQueue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearOfflineQueue(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineQueue'], 'readwrite');
      const store = transaction.objectStore('offlineQueue');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 만료된 캐시 정리
  async cleanExpiredCache(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      const index = store.index('timestamp');
      const request = index.openCursor();

      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const item = cursor.value;
          if (Date.now() > item.expires) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();

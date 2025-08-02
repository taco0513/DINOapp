/**
 * DINO v2.0 - Offline Cache Hook
 * Manages offline data caching for PWA functionality
 */

import { useEffect, useState, useCallback } from 'react';

interface CacheOptions {
  key: string;
  ttl?: number; // Time to live in milliseconds
  fallbackData?: unknown;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export function useOfflineCache<T>({ key, ttl = 24 * 60 * 60 * 1000, fallbackData }: CacheOptions) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get data from cache
  const getFromCache = useCallback((): T | null => {
    try {
      const cached = localStorage.getItem(`dino-cache-${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        localStorage.removeItem(`dino-cache-${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }, [key]);

  // Save data to cache
  const saveToCache = (newData: T) => {
    try {
      const cacheItem: CacheItem<T> = {
        data: newData,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(`dino-cache-${key}`, JSON.stringify(cacheItem));
      setData(newData);
    } catch (error) {
      console.error('Error saving to cache:', error);
      // If localStorage is full, try to clear old cache items
      clearOldCacheItems();
    }
  };

  // Clear old cache items
  const clearOldCacheItems = () => {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach((k) => {
      if (k.startsWith('dino-cache-')) {
        try {
          const cached = localStorage.getItem(k);
          if (cached) {
            const cacheItem = JSON.parse(cached);
            if (now - cacheItem.timestamp > cacheItem.ttl) {
              localStorage.removeItem(k);
            }
          }
        } catch {
          // Invalid cache item, remove it
          localStorage.removeItem(k);
        }
      }
    });
  };

  // Invalidate cache
  const invalidateCache = () => {
    localStorage.removeItem(`dino-cache-${key}`);
    setData(null);
  };

  // Load initial data
  useEffect(() => {
    const cachedData = getFromCache();
    if (cachedData) {
      setData(cachedData);
    } else if (fallbackData) {
      setData(fallbackData);
    }
    setIsLoading(false);
  }, [key, fallbackData, getFromCache]);

  return {
    data,
    isLoading,
    isOnline,
    saveToCache,
    invalidateCache,
    getFromCache,
  };
}
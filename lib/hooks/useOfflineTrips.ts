/**
 * DINO v2.0 - Offline Trips Hook
 * Manages trip data with offline support
 */

import { useEffect, useState, useCallback } from 'react';
import { useOfflineCache } from './useOfflineCache';
import type { Trip } from '@prisma/client';

export function useOfflineTrips(userId?: string) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    data: cachedTrips, 
    saveToCache, 
    isOnline 
  } = useOfflineCache<Trip[]>({
    key: `trips-${userId || 'anonymous'}`,
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    fallbackData: [],
  });

  // Fetch trips from API
  const fetchTrips = useCallback(async () => {
    if (!userId) {
      setTrips([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/trips', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }

      const data = await response.json();
      setTrips(data.trips || []);
      saveToCache(data.trips || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching trips:', err);
      
      // If offline, use cached data
      if (!isOnline && cachedTrips) {
        setTrips(cachedTrips);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load trips');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isOnline, cachedTrips, saveToCache]);

  // Load trips on mount and when online status changes
  useEffect(() => {
    if (isOnline) {
      fetchTrips();
    } else if (cachedTrips) {
      setTrips(cachedTrips);
      setIsLoading(false);
    }
  }, [userId, isOnline, cachedTrips, fetchTrips]);

  // Add trip (with offline queue)
  const addTrip = async (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isOnline) {
      // Queue for later sync
      const offlineQueue = JSON.parse(localStorage.getItem('dino-offline-queue') || '[]');
      offlineQueue.push({
        type: 'ADD_TRIP',
        data: trip,
        timestamp: Date.now(),
      });
      localStorage.setItem('dino-offline-queue', JSON.stringify(offlineQueue));

      // Optimistically update local state
      const newTrip = {
        ...trip,
        id: `offline-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Trip;

      const updatedTrips = [...trips, newTrip];
      setTrips(updatedTrips);
      saveToCache(updatedTrips);
      
      return newTrip;
    }

    // Online: send to API
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(trip),
      });

      if (!response.ok) {
        throw new Error('Failed to add trip');
      }

      const newTrip = await response.json();
      const updatedTrips = [...trips, newTrip];
      setTrips(updatedTrips);
      saveToCache(updatedTrips);
      
      return newTrip;
    } catch (err) {
      console.error('Error adding trip:', err);
      throw err;
    }
  };

  // Sync offline queue when back online
  useEffect(() => {
    if (isOnline) {
      const syncOfflineQueue = async () => {
        const queue = JSON.parse(localStorage.getItem('dino-offline-queue') || '[]');
        if (queue.length === 0) return;

        for (const item of queue) {
          if (item.type === 'ADD_TRIP') {
            try {
              await fetch('/api/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(item.data),
              });
            } catch (err) {
              console.error('Error syncing offline trip:', err);
            }
          }
        }

        // Clear queue after sync
        localStorage.removeItem('dino-offline-queue');
        
        // Refresh trips
        fetchTrips();
      };

      syncOfflineQueue();
    }
  }, [isOnline, fetchTrips]);

  return {
    trips,
    isLoading,
    error,
    isOnline,
    refetch: fetchTrips,
    addTrip,
  };
}
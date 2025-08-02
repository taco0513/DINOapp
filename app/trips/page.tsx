'use client';

/**
 * DINO v2.0 - Travel History Management
 * Track and manage all your trips
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TripForm } from '@/components/trips/TripForm';
import { TripList } from '@/components/trips/TripList';
import type { Trip } from '@prisma/client';

export default function TripsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    fetchTrips();
  }, [session, status, router]);

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips');
      if (response.ok) {
        const data = await response.json();
        setTrips(data.trips);
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTripAdded = (newTrip: Trip) => {
    setTrips([newTrip, ...trips]);
    setShowForm(false);
  };

  const handleTripDeleted = (tripId: string) => {
    setTrips(trips.filter(trip => trip.id !== tripId));
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ✈️ 나의 여행 기록
          </h1>
          <p className="text-gray-600">
            여행 기록을 추가하고 셰겐 체류 일수를 자동으로 계산하세요.
          </p>
        </div>

        {/* Add Trip Button */}
        <div className="mb-8">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span className="text-xl">+</span>
              <span>새 여행 추가</span>
            </button>
          )}
        </div>

        {/* Trip Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                새 여행 추가
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <TripForm 
              onSuccess={handleTripAdded}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Trip List */}
        <TripList 
          trips={trips}
          onTripDeleted={handleTripDeleted}
        />
      </div>
    </div>
  );
}
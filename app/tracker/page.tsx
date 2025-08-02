/**
 * DINO v2.0 - Multi-Country Travel Tracker Page
 * Advanced tracking for digital nomads across all countries
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/prisma';
import { MultiCountryDashboard } from '@/components/country-tracker/MultiCountryDashboard';
import type { StayRecord } from '@/types/country-tracker';

export default async function MultiCountryTrackerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Get user trips from database and convert to StayRecord format
  let stays: StayRecord[] = [];
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        trips: {
          orderBy: { entryDate: 'desc' },
        },
      },
    });

    if (user) {
      stays = user.trips.map(trip => ({
        id: trip.id,
        countryCode: trip.country,
        entryDate: new Date(trip.entryDate),
        exitDate: trip.exitDate ? new Date(trip.exitDate) : null,
        purpose: trip.purpose,
        notes: trip.notes || undefined
      }));
    }
  } catch (error) {
    console.error('Database error:', error);
    // Continue with empty stays array
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            🌍 다국가 여행 추적기
          </h1>
          <p className="mt-2 text-gray-600">
            모든 국가의 체류 한도를 실시간으로 모니터링하세요. 디지털 노마드를 위한 스마트한 여행 관리.
          </p>
        </div>

        {/* Multi-Country Dashboard */}
        <MultiCountryDashboard 
          stays={stays}
          nationality="KR" // TODO: Get from user profile
        />
      </div>
    </div>
  );
}
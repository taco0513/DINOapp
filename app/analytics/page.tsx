/**
 * DINO v2.0 - Dedicated Analytics Page
 * Full-screen travel analytics dashboard
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/prisma';
import { TravelAnalyticsDashboard } from '@/components/dashboard/TravelAnalyticsDashboard';
import { DEMO_TRAVEL_DATA } from '@/lib/demo-data';
import Image from 'next/image';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Try to get user trips
  let trips = [];
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        trips: {
          orderBy: { entryDate: 'desc' },
        }
      },
    });
    
    trips = user?.trips || [];
  } catch (error) {
    console.error('Database error:', error);
    trips = [];
  }

  // Convert trips to StayRecord format or use demo data
  const stayRecords = trips.length > 0 
    ? trips.map(trip => ({
        id: trip.id,
        countryCode: trip.country.toUpperCase(),
        entryDate: new Date(trip.entryDate),
        exitDate: trip.exitDate ? new Date(trip.exitDate) : null,
        purpose: trip.purpose || 'tourism',
        notes: trip.notes || undefined
      }))
    : DEMO_TRAVEL_DATA;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← 대시보드로 돌아가기
              </a>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">
                여행 분석
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {session.user.name || session.user.email}
              </span>
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Analytics Dashboard */}
      <div className="py-8">
        <TravelAnalyticsDashboard 
          stays={stayRecords}
          nationality="KR"
        />
      </div>
      
      {/* Demo Data Notice */}
      {trips.length === 0 && (
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <div className="font-medium text-blue-900">
                  데모 데이터를 표시 중입니다
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  실제 여행 기록을 추가하면 개인화된 분석 결과를 확인할 수 있습니다.
                  <a href="/trips" className="ml-2 underline hover:no-underline">
                    여행 기록 추가하기 →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
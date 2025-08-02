/**
 * DINO v2.0 - Enhanced User Dashboard
 * Real-time travel data with Schengen tracking
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/prisma';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { SchengenStatus } from '@/components/dashboard/SchengenStatus';
import { RecentTrips } from '@/components/dashboard/RecentTrips';
import { UpcomingVisaExpiry } from '@/components/dashboard/UpcomingVisaExpiry';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TravelAnalyticsDashboard } from '@/components/dashboard/TravelAnalyticsDashboard';
import { DEMO_TRAVEL_DATA } from '@/lib/demo-data';
import { VisaPolicyUpdates } from '@/components/visa/VisaPolicyUpdates';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Try to get user from database, create if doesn't exist
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        trips: {
          orderBy: { entryDate: 'desc' },
          take: 10,
        },
        visas: {
          where: {
            expiryDate: {
              gte: new Date(),
            },
          },
          orderBy: { expiryDate: 'asc' },
          take: 5,
        },
      },
    });

    // Create user if doesn't exist (for JWT strategy)
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email!,
          name: session.user.name || null,
          image: session.user.image || null,
        },
        include: {
          trips: true,
          visas: true,
        },
      });
    }
  } catch (error) {
    console.error('Database error:', error);
    // If database is not available, create a mock user for display
    user = {
      id: 'temp',
      email: session.user.email!,
      name: session.user.name,
      image: session.user.image,
      trips: [],
      visas: [],
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      nationality: null,
      passportExpiry: null,
      preferences: null,
    };
  }

  // Calculate statistics
  const currentYear = new Date().getFullYear();
  const thisYearTrips = user.trips.filter(
    trip => new Date(trip.entryDate).getFullYear() === currentYear
  );

  const stats = {
    totalTrips: user.trips.length,
    countriesVisited: new Set(user.trips.map(trip => trip.country)).size,
    daysAbroad: user.trips.reduce((total, trip) => {
      const exitDate = trip.exitDate || new Date();
      const days = Math.ceil(
        (new Date(exitDate).getTime() - new Date(trip.entryDate).getTime()) / 
        (1000 * 60 * 60 * 24)
      ) + 1;
      return total + days;
    }, 0),
    tripsThisYear: thisYearTrips.length,
  };

  // Get Schengen trips for the last 180 days
  const today = new Date();
  const schengenWindowStart = new Date(today);
  schengenWindowStart.setDate(today.getDate() - 180);
  
  const schengenTrips = user.trips.filter(trip => 
    trip.isSchengen && new Date(trip.entryDate) >= schengenWindowStart
  );

  // Convert trips to StayRecord format for analytics
  const stayRecords = user.trips.length > 0 
    ? user.trips.map(trip => ({
        id: trip.id,
        countryCode: trip.country.toUpperCase(),
        entryDate: new Date(trip.entryDate),
        exitDate: trip.exitDate ? new Date(trip.exitDate) : null,
        purpose: trip.purpose || 'tourism',
        notes: trip.notes || undefined
      }))
    : DEMO_TRAVEL_DATA; // Use demo data if no trips exist

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            안녕하세요, {user.name || session.user.name}님! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            오늘의 여행 상태를 확인하고 다음 여행을 계획해보세요.
          </p>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Travel Analytics Dashboard */}
        <div className="mt-8">
          <TravelAnalyticsDashboard 
            stays={stayRecords}
            nationality="KR"
          />
        </div>

        {/* Legacy Dashboard Components */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Schengen */}
          <div className="lg:col-span-2 space-y-8">
            {/* Statistics */}
            <DashboardStats stats={stats} />

            {/* Schengen Status */}
            <SchengenStatus trips={schengenTrips} />

            {/* Recent Trips */}
            <RecentTrips trips={user.trips.slice(0, 5)} />
          </div>

          {/* Right Column - Visa Expiry & Updates */}
          <div className="space-y-8">
            <UpcomingVisaExpiry visaRecords={user.visas} />
            
            {/* Visa Policy Updates */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                <span>비자 정책 업데이트</span>
                <a 
                  href="/visa-updates" 
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  모두 보기 →
                </a>
              </h3>
              <VisaPolicyUpdates userCountries={['KR']} maxItems={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
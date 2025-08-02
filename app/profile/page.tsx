/**
 * DINO v2.0 - User Profile Page
 * User profile and settings management
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/prisma';
import { ProfileClient } from '@/components/profile/ProfileClient';

export const metadata = {
  title: '프로필 설정 - DINO v2.0',
  description: '계정 정보와 여행 설정을 관리하세요',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Get user with related data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      passports: true,
      visas: {
        where: {
          expiryDate: {
            gte: new Date(),
          },
        },
        orderBy: { expiryDate: 'asc' },
      },
      trips: {
        select: {
          id: true,
          country: true,
        },
        distinct: ['country'],
      },
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  // Calculate user statistics
  const stats = {
    totalTrips: await prisma.trip.count({
      where: { userId: user.id },
    }),
    countriesVisited: user.trips.length,
    activeVisas: user.visas.length,
    passports: user.passports.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>
          <p className="mt-1 text-sm text-gray-600">
            계정 정보와 여행 설정을 관리하세요
          </p>
        </div>
      </div>

      <ProfileClient user={user} stats={stats} />
    </div>
  );
}
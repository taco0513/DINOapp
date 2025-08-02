/**
 * DINO v2.0 - Visa Tracker Page
 * Track visa expiration dates and manage renewals
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { VisaTrackerClient } from '@/components/visa/VisaTrackerClient';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { getUserVisas } from '@/lib/db/visa';

export const metadata = {
  title: '비자 만료 추적기 - DINO v2.0',
  description: '비자 만료일을 추적하고 갱신 시기를 놓치지 마세요',
};

// Demo visa data for development
const DEMO_VISAS = [
  {
    id: '1',
    userId: 'demo',
    country: 'US',
    countryName: '미국',
    visaType: 'tourist',
    entries: 'multiple',
    issueDate: new Date('2023-01-15'),
    expiryDate: new Date('2033-01-14'),
    maxStayDays: 180,
    status: 'active',
    notes: 'ESTA 비자 면제 프로그램',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: '2',
    userId: 'demo',
    country: 'CN',
    countryName: '중국',
    visaType: 'tourist',
    entries: 'multiple',
    issueDate: new Date('2023-06-01'),
    expiryDate: new Date('2024-05-31'),
    maxStayDays: 30,
    status: 'active',
    notes: '10년 복수 비자',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01')
  },
  {
    id: '3',
    userId: 'demo',
    country: 'JP',
    countryName: '일본',
    visaType: 'tourist',
    entries: 'multiple',
    issueDate: new Date('2023-03-01'),
    expiryDate: new Date('2024-02-29'),
    maxStayDays: 90,
    status: 'active',
    notes: '3년 복수 비자',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-03-01')
  },
  {
    id: '4',
    userId: 'demo',
    country: 'VN',
    countryName: '베트남',
    visaType: 'tourist',
    entries: 'single',
    issueDate: new Date('2023-11-01'),
    expiryDate: new Date('2024-01-31'),
    maxStayDays: 30,
    status: 'active',
    notes: '단수 비자',
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2023-11-01')
  },
  {
    id: '5',
    userId: 'demo',
    country: 'IN',
    countryName: '인도',
    visaType: 'business',
    entries: 'multiple',
    issueDate: new Date('2022-09-01'),
    expiryDate: new Date('2023-08-31'),
    maxStayDays: 180,
    status: 'expired',
    notes: '1년 비즈니스 비자 - 갱신 필요',
    createdAt: new Date('2022-09-01'),
    updatedAt: new Date('2022-09-01')
  }
];

export default async function VisaTrackerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch actual visa data from database
  const visas = await getUserVisas(user.id);
  
  // Use demo data if no real visas exist
  const displayVisas = visas.length > 0 ? visas : DEMO_VISAS;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                ← 대시보드로 돌아가기
              </a>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">
                비자 만료 추적기
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VisaTrackerClient initialVisas={displayVisas} />
      </div>

      {/* Features Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            비자 만료 추적기 주요 기능
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="font-medium text-gray-900">실시간 만료일 추적</div>
                  <div className="text-sm text-gray-600">
                    모든 비자의 만료일을 한눈에 확인하고 관리하세요
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <div className="font-medium text-gray-900">자동 갱신 알림</div>
                  <div className="text-sm text-gray-600">
                    만료 30일, 90일 전 자동으로 알림을 받으세요
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <div className="font-medium text-gray-900">시각적 상태 표시</div>
                  <div className="text-sm text-gray-600">
                    색상으로 구분되는 직관적인 비자 상태 확인
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="font-medium text-gray-900">통계 대시보드</div>
                  <div className="text-sm text-gray-600">
                    전체, 유효, 갱신 필요, 만료 비자 현황을 한눈에
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/visa-assistant"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              비자 도우미로 이동 →
            </a>
            <a
              href="/multi-passport"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              다중 여권 관리 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
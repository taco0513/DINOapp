/**
 * DINO v2.0 - Multi-Passport Page
 * Multiple passport management for dual/multi-citizenship
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { MultiPassportClient } from '@/components/passport/MultiPassportClient';
import { DEMO_PASSPORTS } from '@/lib/demo-passport-data';
import Image from 'next/image';
// import { getUserPassports, createPassport, updatePassport, deletePassport } from '@/lib/db/passport';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: '다중 여권 관리 - DINO v2.0',
  description: '여러 여권을 효율적으로 관리하고 최적의 여행 계획을 세워보세요',
};

export default async function MultiPassportPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { passports: true }
  });

  // Use actual passports or demo data
  const passports = user?.passports.length ? user.passports : DEMO_PASSPORTS;

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
                다중 여권 관리
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

      {/* Multi-Passport Dashboard */}
      <MultiPassportClient initialPassports={passports} />
      
      {/* Demo Data Notice */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">ℹ️</span>
            <div>
              <div className="font-semibold text-blue-900 mb-2">
                다중 여권 관리 데모
              </div>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• 현재 표시된 여권은 한국-미국 이중국적자 샘플 데이터입니다</p>
                <p>• 실제 서비스에서는 보유하신 모든 여권을 안전하게 관리할 수 있습니다</p>
                <p>• 목적지별 최적 여권 추천으로 비자 비용과 시간을 절약하세요</p>
                <p>• 여권 만료일 추적으로 갱신을 놓치지 않습니다</p>
              </div>
              <div className="mt-4 space-x-4">
                <a 
                  href="/visa-assistant" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  비자 도우미 사용하기 →
                </a>
                <a 
                  href="/analytics" 
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  여행 분석 보기 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
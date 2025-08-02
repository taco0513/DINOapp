/**
 * DINO v2.0 - Visa Assistant Page
 * Comprehensive visa application management with automatic alerts
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { VisaAssistantClient } from '@/components/visa/VisaAssistantClient';
import { DEMO_VISA_APPLICATIONS, DEMO_VISA_ALERTS } from '@/lib/demo-visa-data';
import Image from 'next/image';
import { getUserVisaApplications, getUserAlerts } from '@/lib/db/visa-application';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: '비자 도우미 - DINO v2.0',
  description: '비자 신청을 체계적으로 관리하고 자동 알림을 받으세요',
};

export default async function VisaAssistantPage() {
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

  // Get actual data from database
  const applications = await getUserVisaApplications(user.id);
  const alerts = await getUserAlerts(user.id);
  
  // Use demo data if no real data exists
  const displayApplications = applications.length > 0 ? applications : DEMO_VISA_APPLICATIONS;
  const displayAlerts = alerts.length > 0 ? alerts : DEMO_VISA_ALERTS;

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
                비자 도우미
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

      {/* Visa Assistant Dashboard */}
      <VisaAssistantClient 
        initialApplications={displayApplications}
        initialAlerts={displayAlerts}
      />
      
      {/* Demo Data Notice */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">ℹ️</span>
            <div>
              <div className="font-semibold text-blue-900 mb-2">
                데모 버전을 체험 중입니다
              </div>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• 현재 표시된 비자 신청과 알림은 샘플 데이터입니다</p>
                <p>• 실제 서비스에서는 개인의 비자 신청 정보가 안전하게 관리됩니다</p>
                <p>• 자동 알림 시스템으로 중요한 마감일을 놓치지 않습니다</p>
                <p>• 서류 체크리스트로 누락없이 비자 신청을 완료할 수 있습니다</p>
              </div>
              <div className="mt-4 space-x-4">
                <a 
                  href="/visa" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  비자 체크 도구 사용하기 →
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
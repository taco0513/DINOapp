/**
 * DINO v2.0 - Visa Policy Updates Page
 * Real-time visa policy monitoring dashboard
 */

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { VisaPolicyUpdates } from '@/components/visa/VisaPolicyUpdates';

export const metadata: Metadata = {
  title: '비자 정책 업데이트 - DINO v2.0',
  description: '실시간 비자 정책 변경사항을 확인하세요',
};

export default async function VisaUpdatesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  // In production, get user's passport countries from profile
  const userCountries = ['KR']; // Default to Korea for demo

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                비자 정책 업데이트
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                전 세계 비자 정책 변경사항을 실시간으로 확인하세요
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm text-gray-600">실시간 모니터링 중</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Updates */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                최근 업데이트
              </h2>
              <VisaPolicyUpdates userCountries={userCountries} maxItems={10} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                알림 설정
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    이메일 알림 받기
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    푸시 알림 받기
                  </span>
                </label>
              </div>
            </div>

            {/* Monitored Countries */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                모니터링 국가
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">🇰🇷 대한민국</span>
                  <span className="text-xs text-gray-500">여권 국가</span>
                </div>
                <button className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  + 국가 추가
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                💡 알고 계셨나요?
              </h3>
              <p className="text-sm text-blue-800">
                DINO는 전 세계 195개국의 비자 정책을 실시간으로 모니터링하여 
                여행 계획에 영향을 줄 수 있는 변경사항을 즉시 알려드립니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
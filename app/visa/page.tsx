/**
 * DINO v2.0 - Visa Requirements Page
 * Main page for visa requirement checking functionality
 */

import { Metadata } from 'next';
import { VisaChecker } from '@/components/visa/VisaChecker';

export const metadata: Metadata = {
  title: '비자 요구사항 체커 | DINO v2.0',
  description: '전세계 국가 간 비자 요구사항을 즉시 확인하고 필요한 서류 정보를 얻어보세요.',
  keywords: ['비자', '여행', '여권', '입국', '무비자', '전자비자', '도착비자', 'visa', 'travel'],
};

export default function VisaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                🛂 비자 요구사항 체커
              </h1>
              <p className="mt-2 text-gray-600">
                여권 국가와 목적지를 선택하면 비자 요구사항을 즉시 확인할 수 있습니다
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">200+</div>
                <div>지원 국가</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">실시간</div>
                <div>정보 업데이트</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Visa Checker Component */}
          <VisaChecker />

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎉</span>
                <h3 className="text-lg font-semibold text-gray-900">무비자 여행</h3>
              </div>
              <p className="text-gray-600 text-sm">
                비자 없이 입국 가능한 국가들을 확인하고 최대 체류 기간을 알아보세요.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">💻</span>
                <h3 className="text-lg font-semibold text-gray-900">전자비자</h3>
              </div>
              <p className="text-gray-600 text-sm">
                온라인으로 간편하게 신청할 수 있는 전자비자 정보와 처리 시간을 확인하세요.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📝</span>
                <h3 className="text-lg font-semibold text-gray-900">비자 신청</h3>
              </div>
              <p className="text-gray-600 text-sm">
                필요한 서류, 처리 기간, 비용 등 비자 신청에 필요한 모든 정보를 제공합니다.
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-xl mt-0.5">⚠️</span>
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">중요 안내사항</h4>
                <ul className="text-yellow-800 text-sm space-y-1">
                  <li>• 비자 정보는 일반적인 관광 목적을 기준으로 제공되며, 실제 입국 시 상황에 따라 달라질 수 있습니다.</li>
                  <li>• 여행 전 반드시 해당 국가의 공식 외교부 또는 대사관에서 최신 정보를 확인하시기 바랍니다.</li>
                  <li>• 여권 유효기간, 백신 접종 증명서 등 추가 요구사항이 있을 수 있습니다.</li>
                  <li>• 경유지가 있는 경우 경유국의 비자 요구사항도 별도로 확인해야 합니다.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">🔗 유용한 링크</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a 
                href="https://www.0404.go.kr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <span>🏛️</span>
                외교부 해외안전여행
              </a>
              <a 
                href="https://www.passport.go.kr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <span>📘</span>
                여권 발급 안내
              </a>
              <a 
                href="https://www.visa.go.kr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <span>📋</span>
                비자 발급 안내
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client'

import { QuickVisaCheck } from '@/components/visa/QuickVisaCheck'
import { Globe, Info } from 'lucide-react'
import Link from 'next/link'

export default function VisaCheckPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Globe className="h-8 w-8 text-blue-600" />
              비자 빠른 체크
            </h1>
            <Link 
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              대시보드로 돌아가기
            </Link>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400">
            여행하고 싶은 국가를 선택하면 비자 필요 여부를 바로 확인할 수 있어요.
          </p>
        </div>

        {/* 빠른 비자 체크 컴포넌트 */}
        <QuickVisaCheck />

        {/* 안내 사항 */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium">비자 정보 안내</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>표시되는 정보는 일반적인 관광 비자 기준입니다</li>
                  <li>정확한 비자 정보는 해당 국가 대사관이나 영사관에 확인하세요</li>
                  <li>비자 정책은 수시로 변경될 수 있습니다</li>
                  <li>장기 체류나 업무 목적은 별도의 비자가 필요할 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 유용한 링크 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/trips"
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold mb-1">여행 일정 관리</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                여행 일정을 등록하고 비자 만료일을 추적하세요
              </p>
            </Link>
            
            <Link 
              href="/dashboard"
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold mb-1">셴겐 계산기</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                유럽 셴겐 지역 체류일수를 자동으로 계산해요
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
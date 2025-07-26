'use client'

import { useState } from 'react'
import Container from '@/components/layout/Container'
import PageHeader from '@/components/ui/PageHeader'
import Link from 'next/link'

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'schengen'>('overview')

  return (
    <Container className="py-8">
      <PageHeader
        title="DINO 대시보드 미리보기"
        description="디지털 노마드를 위한 스마트 여행 관리 플랫폼을 체험해보세요"
        action={
          <Link 
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            시작하기
          </Link>
        }
      />

      {/* Demo Notice */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          🎯 이것은 데모 페이지입니다. 실제 데이터를 보려면 로그인하세요.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            개요
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'trips'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            여행 기록
          </button>
          <button
            onClick={() => setActiveTab('schengen')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'schengen'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            셰겐 계산기
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">✈️</div>
              <h3 className="text-lg font-semibold text-gray-900">총 여행</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">23</div>
            <p className="text-gray-600 text-sm">12개국 방문</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">🏰</div>
              <h3 className="text-lg font-semibold text-gray-900">셰겐 체류</h3>
            </div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">45/90</div>
            <p className="text-gray-600 text-sm">안전한 상태 ✅</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">📅</div>
              <h3 className="text-lg font-semibold text-gray-900">현재 체류</h3>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">태국</div>
            <p className="text-gray-600 text-sm">15일째 체류 중</p>
          </div>
        </div>
      )}

      {activeTab === 'trips' && (
        <div className="space-y-4">
          {/* Sample Trip Cards */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">🇫🇷 프랑스</h3>
                <p className="text-gray-600 mt-1">2024년 3월 1일 - 2024년 3월 15일</p>
                <div className="mt-2 flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">셰겐</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">관광</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">14일</p>
                <p className="text-sm text-gray-600">체류</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">🇰🇷 한국</h3>
                <p className="text-gray-600 mt-1">2024년 2월 1일 - 2024년 2월 28일</p>
                <div className="mt-2 flex gap-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">비자면제</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">가족방문</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">27일</p>
                <p className="text-sm text-gray-600">체류</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">🇹🇭 태국</h3>
                <p className="text-gray-600 mt-1">2024년 4월 1일 - 현재</p>
                <div className="mt-2 flex gap-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">현재 체류 중</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">디지털노마드</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">15일</p>
                <p className="text-sm text-gray-600">진행 중</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schengen' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">셰겐 90/180일 규칙 계산기</h3>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700">현재 상태</span>
              <span className="text-2xl font-bold text-indigo-600">45/90일</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: '50%' }}
              />
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              지난 180일 중 45일을 셰겐 지역에서 체류했습니다. 
              앞으로 45일 더 체류할 수 있습니다.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✅ 안전</h4>
              <p className="text-sm text-green-700">
                현재 셰겐 규정을 준수하고 있습니다. 
                다음 셰겐 입국 가능일: 즉시 가능
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">💡 팁</h4>
              <p className="text-sm text-blue-700">
                셰겐 지역 밖에서 90일을 보내면 다시 90일 전체를 사용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-12 text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          실제 여행 데이터로 시작하세요
        </h3>
        <p className="text-gray-600 mb-6">
          무료로 가입하고 여행 기록을 관리하세요
        </p>
        <Link
          href="/auth/signin"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
        >
          지금 시작하기
        </Link>
      </div>
    </Container>
  )
}
/**
 * DINO v2.0 - Schengen Page
 * Main page for Schengen 90/180 day calculations
 */

import { Metadata } from 'next';
import { SchengenCalculator } from '@/components/schengen/Calculator';

export const metadata: Metadata = {
  title: '셰겐 계산기 | DINO v2.0',
  description: '셰겐 지역 90/180일 규칙 계산기로 안전한 여행 계획을 세우세요',
  keywords: ['schengen', 'visa', 'travel', 'europe', '90 day rule', 'digital nomad'],
};

export default function SchengenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🇪🇺 셰겐 계산기
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            디지털 노마드를 위한 셰겐 지역 90/180일 규칙 계산기입니다.
            현재 상태를 확인하고 안전한 여행 계획을 세우세요.
          </p>
        </div>

        {/* Main Calculator */}
        <SchengenCalculator />

        {/* Information Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">90/180일 규칙이란?</h3>
            <p className="text-gray-600">
              셰겐 지역에서는 180일 기간 동안 최대 90일까지만 체류할 수 있습니다. 
              이 규칙을 위반하면 입국 거부나 벌금 등의 제재를 받을 수 있습니다.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold mb-2">셰겐 지역 국가</h3>
            <p className="text-gray-600">
              현재 27개 국가가 셰겐 협정에 참여하고 있습니다. 
              독일, 프랑스, 이탈리아, 스페인 등 주요 유럽 국가들이 포함됩니다.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">실시간 계산</h3>
            <p className="text-gray-600">
              여행 기록을 바탕으로 실시간으로 현재 상태를 계산하고, 
              미래 여행 계획의 안전성도 미리 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-blue-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            🚀 DINO v2.0에서 더 많은 기능을 만나보세요
          </h2>
          <p className="text-blue-100 mb-6">
            비자 관리, 여행 계획, 체류 추적 등 디지털 노마드를 위한 
            모든 기능을 하나의 플랫폼에서 이용하세요.
          </p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
            대시보드로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
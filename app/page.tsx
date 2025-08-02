/**
 * DINO v2.0 - Home Page
 * Clean, modern landing page for digital nomads
 */

import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DINO v2.0 | Digital Nomad Travel Manager',
  description: 'Smart travel management platform for digital nomads. Track Schengen compliance, manage visas, and plan trips with confidence.',
  keywords: ['digital nomad', 'travel management', 'schengen calculator', 'visa tracking', 'travel planning'],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="text-8xl mb-8 animate-bounce">🦕</div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              DINO v2.0
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4">
              Digital Nomad Travel Manager
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
              디지털 노마드를 위한 스마트 여행 관리 플랫폼입니다. 
              셰겐 규정 준수, 비자 관리, 여행 계획을 한 곳에서 해결하세요.
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg inline-block"
              >
                🚀 시작하기
              </Link>
              <Link
                href="/schengen"
                className="w-full sm:w-auto bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
              >
                🇪🇺 셰겐 계산기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 DINO v2.0인가요?
            </h2>
            <p className="text-xl text-gray-600">
              완전히 새롭게 설계된 아키텍처로 더 빠르고 안정적인 서비스를 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-6">🧮</div>
              <h3 className="text-xl font-bold mb-4">정확한 셰겐 계산</h3>
              <p className="text-gray-600">
                90/180일 규칙을 정확하게 계산하여 
                안전한 여행 계획을 세울 수 있습니다
              </p>
            </div>

            <div className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-6">⚡</div>
              <h3 className="text-xl font-bold mb-4">제로 기술부채</h3>
              <p className="text-gray-600">
                처음부터 새롭게 설계한 아키텍처로 
                빠르고 안정적인 성능을 보장합니다
              </p>
            </div>

            <div className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-6">🛡️</div>
              <h3 className="text-xl font-bold mb-4">완벽한 타입 안전성</h3>
              <p className="text-gray-600">
                TypeScript 100% 적용으로 
                오류 없는 안정적인 서비스를 제공합니다
              </p>
            </div>

            <div className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-6">📱</div>
              <h3 className="text-xl font-bold mb-4">모바일 최적화</h3>
              <p className="text-gray-600">
                언제 어디서나 편리하게 이용할 수 있는 
                반응형 디자인을 제공합니다
              </p>
            </div>

            <div className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-6">🚀</div>
              <h3 className="text-xl font-bold mb-4">초고속 성능</h3>
              <p className="text-gray-600">
                번들 크기 300KB 미만, 
                1초 미만 로딩으로 빠른 사용자 경험을 제공합니다
              </p>
            </div>

            <div className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-6">🎯</div>
              <h3 className="text-xl font-bold mb-4">핵심 기능 집중</h3>
              <p className="text-gray-600">
                불필요한 기능을 제거하고 
                정말 필요한 핵심 기능에만 집중했습니다
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-12">
              v2.0 개발 현황
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-white mb-2">0</div>
                <div className="text-blue-100">TypeScript 에러</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">&lt;300KB</div>
                <div className="text-blue-100">번들 크기</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">&lt;1s</div>
                <div className="text-blue-100">로딩 시간</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">100%</div>
                <div className="text-blue-100">타입 안전성</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            새롭게 태어난 DINO v2.0으로 스마트한 여행 관리를 경험해보세요
          </p>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-12 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg inline-block"
          >
            🦕 DINO v2.0 시작하기
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-3xl mb-4">🦕</div>
            <p className="text-gray-600 mb-4">
              DINO v2.0 - Digital Nomad Travel Manager
            </p>
            <p className="text-sm text-gray-500">
              Built with Next.js 14, TypeScript, and ❤️ for digital nomads
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
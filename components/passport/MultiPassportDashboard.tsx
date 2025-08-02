/**
 * DINO v2.0 - Multi-Passport Dashboard
 * Unified dashboard for multiple passport management
 */

'use client';

import { useState } from 'react';
import { Passport } from '@/types/passport';
import { PassportManager } from './PassportManager';
import { PassportOptimizer } from './PassportOptimizer';

interface MultiPassportDashboardProps {
  passports: Passport[];
  onAddPassport?: (passport: Omit<Passport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePassport?: (passport: Passport) => void;
  onDeletePassport?: (id: string) => void;
}

type DashboardView = 'overview' | 'passports' | 'optimizer' | 'travel';

export function MultiPassportDashboard({
  passports,
  onAddPassport,
  onUpdatePassport,
  onDeletePassport
}: MultiPassportDashboardProps) {
  const [activeView, setActiveView] = useState<DashboardView>('overview');

  // Calculate statistics
  const stats = {
    totalPassports: passports.length,
    activePassports: passports.filter(p => p.isActive).length,
    expiringPassports: passports.filter(p => {
      const daysUntilExpiry = Math.ceil((new Date(p.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 365 && daysUntilExpiry > 0;
    }).length,
    expiredPassports: passports.filter(p => {
      const daysUntilExpiry = Math.ceil((new Date(p.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 0;
    }).length,
    totalVisaFreeCountries: Array.from(new Set(passports.flatMap(p => p.visaFreeCountries))).length
  };

  const tabs = [
    { key: 'overview', label: '개요', icon: '📊' },
    { key: 'passports', label: '여권 관리', icon: '🛂' },
    { key: 'optimizer', label: '최적화', icon: '🎯' },
    { key: 'travel', label: '여행 계획', icon: '✈️' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">다중 여권 관리</h1>
        <p className="text-gray-600">
          여러 여권을 효율적으로 관리하고 최적의 여행 계획을 세워보세요
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as DashboardView)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeView === 'overview' && (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">보유 여권</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPassports}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🛂</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">활성 여권</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activePassports}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">갱신 필요</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.expiringPassports}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">무비자 국가</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalVisaFreeCountries}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌍</span>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Passport Benefits */}
          {passports.length >= 2 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start space-x-4">
                <span className="text-3xl">🌟</span>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">다중 여권의 장점</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div className="space-y-2">
                      <div>• 더 많은 무비자 국가 ({stats.totalVisaFreeCountries}개국)</div>
                      <div>• 비자 비용 절약 가능</div>
                      <div>• 처리 시간 단축</div>
                    </div>
                    <div className="space-y-2">
                      <div>• 체류 기간 연장 가능</div>
                      <div>• 입국 거부 위험 분산</div>
                      <div>• 비상시 대안 확보</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button 
                      onClick={() => setActiveView('optimizer')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      여권 최적화 도구 사용하기 →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button 
              onClick={() => setActiveView('passports')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🛂</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">여권 관리</div>
                  <div className="text-sm text-gray-600">여권 추가, 수정, 삭제</div>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setActiveView('optimizer')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">최적화 도구</div>
                  <div className="text-sm text-gray-600">목적지별 최적 여권 추천</div>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setActiveView('travel')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✈️</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">여행 계획</div>
                  <div className="text-sm text-gray-600">다중 여권 여행 전략</div>
                </div>
              </div>
            </button>
          </div>

          {/* Getting Started Guide */}
          {passports.length === 0 && (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">다중 여권 관리 시작하기</h3>
              <p className="text-gray-600 mb-6">
                여러 여권을 등록하면 각 목적지에 최적화된 여행 계획을 세울 수 있습니다
              </p>
              <div className="space-y-3 text-sm text-gray-700 mb-6">
                <div>1. 보유하신 모든 여권을 등록하세요</div>
                <div>2. 목적지를 입력하여 최적의 여권을 찾아보세요</div>
                <div>3. 비자 비용과 시간을 절약하는 여행을 계획하세요</div>
              </div>
              <button 
                onClick={() => setActiveView('passports')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                첫 번째 여권 등록하기
              </button>
            </div>
          )}

          {/* Passport Summary */}
          {passports.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">등록된 여권</h3>
              <div className="space-y-3">
                {passports.map((passport) => {
                  const daysUntilExpiry = Math.ceil((new Date(passport.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const expiryStatus = daysUntilExpiry <= 0 ? 'expired' : 
                                      daysUntilExpiry <= 180 ? 'expiring' : 'valid';
                  
                  return (
                    <div key={passport.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
                          {passport.countryCode}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{passport.countryName}</div>
                          <div className="text-xs text-gray-600">
                            {passport.visaFreeCountries.length}개국 무비자
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passport.isPrimary && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">주여권</span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          expiryStatus === 'expired' ? 'bg-red-100 text-red-700' :
                          expiryStatus === 'expiring' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {expiryStatus === 'expired' ? '만료' :
                           expiryStatus === 'expiring' ? '만료임박' : '유효'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeView === 'passports' && (
        <PassportManager 
          passports={passports}
          onAddPassport={onAddPassport}
          onUpdatePassport={onUpdatePassport}
          onDeletePassport={onDeletePassport}
        />
      )}

      {activeView === 'optimizer' && (
        <PassportOptimizer 
          passports={passports}
        />
      )}

      {activeView === 'travel' && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="text-4xl mb-4">✈️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">여행 계획 도구 개발 예정</h3>
          <p className="text-gray-600">
            다중 여권을 활용한 고급 여행 계획 기능을 준비 중입니다
          </p>
          <div className="mt-6 text-sm text-gray-700 space-y-2">
            <div>• 다국가 연속 여행 최적화</div>
            <div>• 비자 런 전략 계획</div>
            <div>• 체류 기간 극대화 루트</div>
            <div>• 비자 비용 최소화 경로</div>
          </div>
        </div>
      )}
    </div>
  );
}
/**
 * DINO v2.0 - Passport Optimizer Component
 * Recommend optimal passport for specific destinations
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { Passport, PASSPORT_RANKINGS } from '@/types/passport';
// import { PassportComparison } from '@/types/passport';

interface PassportOptimizerProps {
  passports: Passport[];
  onSelectDestination?: (destination: string) => void;
}

interface OptimizationResult {
  destination: string;
  recommendations: {
    passportId: string;
    countryCode: string;
    countryName: string;
    advantages: string[];
    disadvantages: string[];
    score: number;
    rank: 'best' | 'good' | 'acceptable' | 'avoid';
  }[];
  summary: {
    bestPassport: string;
    potentialSavings: {
      visaFee?: number;
      processingTime?: number;
      additionalStayDays?: number;
    };
  };
}

export function PassportOptimizer({ passports, onSelectDestination: _onSelectDestination }: PassportOptimizerProps) {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [optimizationStrategy, setOptimizationStrategy] = useState<'cost' | 'time' | 'convenience' | 'stay'>('convenience');
  // const [showResults, setShowResults] = useState(false);

  // Popular destinations that benefit from passport optimization
  const popularDestinations = [
    { code: 'CN', name: '중국', flag: '🇨🇳', difficulty: 'high' },
    { code: 'IN', name: '인도', flag: '🇮🇳', difficulty: 'medium' },
    { code: 'RU', name: '러시아', flag: '🇷🇺', difficulty: 'high' },
    { code: 'BR', name: '브라질', flag: '🇧🇷', difficulty: 'medium' },
    { code: 'SA', name: '사우디아라비아', flag: '🇸🇦', difficulty: 'medium' },
    { code: 'NG', name: '나이지리아', flag: '🇳🇬', difficulty: 'high' },
    { code: 'ZA', name: '남아프리카공화국', flag: '🇿🇦', difficulty: 'medium' },
    { code: 'EG', name: '이집트', flag: '🇪🇬', difficulty: 'medium' }
  ];

  // Mock optimization logic (would be replaced with real API calls)
  const optimizePassportSelection = useCallback((destination: string): OptimizationResult | null => {
    if (!destination || passports.length < 2) return null;

    // Mock data for demonstration
    const mockResults: OptimizationResult = {
      destination,
      recommendations: passports.map((passport, index) => {
        const power = PASSPORT_RANKINGS[passport.countryCode as keyof typeof PASSPORT_RANKINGS];
        const baseScore = power ? power.visaFreeCount : 100;
        
        // Mock advantages/disadvantages based on passport strength
        const advantages = [];
        const disadvantages = [];
        
        if (passport.countryCode === 'KR') {
          if (destination === 'CN') {
            advantages.push('15일 무비자 입국 가능');
            advantages.push('처리 시간 없음');
            disadvantages.push('장기 체류시 비자 필요');
          } else if (destination === 'IN') {
            advantages.push('e-Visa 신청 가능');
            advantages.push('빠른 처리 (72시간)');
          }
        } else if (passport.countryCode === 'US') {
          if (destination === 'CN') {
            advantages.push('10년 다중 비자 가능');
            advantages.push('B1/B2 비자로 다목적 사용');
            disadvantages.push('비자 신청 필수');
            disadvantages.push('면접 필요');
          }
        }

        return {
          passportId: passport.id,
          countryCode: passport.countryCode,
          countryName: passport.countryName,
          advantages,
          disadvantages,
          score: baseScore + Math.random() * 20,
          rank: (index === 0 ? 'best' : index === 1 ? 'good' : 'acceptable') as 'best' | 'good' | 'acceptable' | 'avoid'
        };
      }).sort((a, b) => b.score - a.score),
      summary: {
        bestPassport: passports[0].countryName,
        potentialSavings: {
          visaFee: 60,
          processingTime: 7,
          additionalStayDays: 15
        }
      }
    };

    // Assign ranks based on sorted scores
    mockResults.recommendations.forEach((rec, index) => {
      if (index === 0) rec.rank = 'best';
      else if (index === 1) rec.rank = 'good';
      else rec.rank = 'acceptable';
    });

    return mockResults;
  }, [passports]);

  const optimizationResult = useMemo(() => {
    if (!selectedDestination) return null;
    return optimizePassportSelection(selectedDestination);
  }, [selectedDestination, optimizePassportSelection]);

  if (passports.length < 2) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">🛂</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          최적화하려면 2개 이상의 여권이 필요합니다
        </h3>
        <p className="text-gray-600">
          여권을 추가하면 여행지별 최적의 여권을 추천받을 수 있습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">여권 최적화</h2>
        <p className="text-gray-600">
          목적지별로 가장 유리한 여권을 찾아드립니다
        </p>
      </div>

      {/* Current Passports Overview */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">보유 여권</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {passports.map((passport) => {
            const power = PASSPORT_RANKINGS[passport.countryCode as keyof typeof PASSPORT_RANKINGS];
            return (
              <div key={passport.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
                  {passport.countryCode}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{passport.countryName}</div>
                  <div className="text-xs text-gray-600">
                    세계 {power?.rank || '?'}위 • {power?.visaFreeCount || 0}개국 무비자
                  </div>
                </div>
                {passport.isPrimary && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">주여권</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Destination Selection */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">목적지 선택</h3>
        
        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="국가명을 입력하세요..."
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Popular Destinations */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-3">인기 목적지</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {popularDestinations.map((dest) => (
              <button
                key={dest.code}
                onClick={() => setSelectedDestination(dest.name)}
                className={`p-3 rounded-lg border transition-colors text-left ${
                  selectedDestination === dest.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{dest.flag}</span>
                  <div>
                    <div className="font-medium text-sm">{dest.name}</div>
                    <div className={`text-xs ${
                      dest.difficulty === 'high' ? 'text-red-600' :
                      dest.difficulty === 'medium' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {dest.difficulty === 'high' ? '까다로움' :
                       dest.difficulty === 'medium' ? '보통' : '쉬움'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Optimization Strategy */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">최적화 기준</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'convenience', label: '편의성', desc: '무비자 우선', icon: '⚡' },
            { key: 'cost', label: '비용', desc: '비자 비용 최소화', icon: '💰' },
            { key: 'time', label: '시간', desc: '처리 시간 단축', icon: '⏰' },
            { key: 'stay', label: '체류기간', desc: '장기 체류 가능', icon: '📅' }
          ].map((strategy) => (
            <button
              key={strategy.key}
              onClick={() => setOptimizationStrategy(strategy.key as 'cost' | 'time' | 'convenience' | 'stay')}
              className={`p-4 rounded-lg border transition-colors text-center ${
                optimizationStrategy === strategy.key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">{strategy.icon}</div>
              <div className="font-medium text-sm">{strategy.label}</div>
              <div className="text-xs text-gray-600 mt-1">{strategy.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Optimization Results */}
      {optimizationResult && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            {optimizationResult.destination} 여행 최적화 결과
          </h3>

          {/* Best Recommendation */}
          {optimizationResult.recommendations[0] && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🏆</span>
                <div className="flex-1">
                  <div className="font-semibold text-green-900 mb-2">
                    추천: {optimizationResult.recommendations[0].countryName} 여권
                  </div>
                  <div className="space-y-1 mb-3">
                    {optimizationResult.recommendations[0].advantages.map((advantage, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-green-800">
                        <span>✓</span>
                        <span>{advantage}</span>
                      </div>
                    ))}
                  </div>
                  {optimizationResult.summary.potentialSavings && (
                    <div className="text-sm text-green-700">
                      <span className="font-medium">예상 절약:</span>
                      {optimizationResult.summary.potentialSavings.visaFee && (
                        <span className="ml-2">${optimizationResult.summary.potentialSavings.visaFee} 비자비</span>
                      )}
                      {optimizationResult.summary.potentialSavings.processingTime && (
                        <span className="ml-2">{optimizationResult.summary.potentialSavings.processingTime}일 처리시간</span>
                      )}
                      {optimizationResult.summary.potentialSavings.additionalStayDays && (
                        <span className="ml-2">+{optimizationResult.summary.potentialSavings.additionalStayDays}일 체류</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* All Recommendations */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">전체 비교</h4>
            {optimizationResult.recommendations.map((rec) => (
              <div
                key={rec.passportId}
                className={`p-4 rounded-lg border ${
                  rec.rank === 'best' ? 'border-green-300 bg-green-50' :
                  rec.rank === 'good' ? 'border-blue-300 bg-blue-50' :
                  rec.rank === 'acceptable' ? 'border-yellow-300 bg-yellow-50' :
                  'border-red-300 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
                      {rec.countryCode}
                    </div>
                    <div>
                      <div className="font-medium">{rec.countryName} 여권</div>
                      <div className="text-sm text-gray-600">점수: {Math.round(rec.score)}/100</div>
                    </div>
                  </div>
                  <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                    rec.rank === 'best' ? 'bg-green-100 text-green-700' :
                    rec.rank === 'good' ? 'bg-blue-100 text-blue-700' :
                    rec.rank === 'acceptable' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {rec.rank === 'best' ? '최적' :
                     rec.rank === 'good' ? '양호' :
                     rec.rank === 'acceptable' ? '가능' : '비권장'}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Advantages */}
                  {rec.advantages.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">장점</div>
                      <div className="space-y-1">
                        {rec.advantages.map((advantage, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-sm text-gray-600">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>{advantage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disadvantages */}
                  {rec.disadvantages.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">단점</div>
                      <div className="space-y-1">
                        {rec.disadvantages.map((disadvantage, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-sm text-gray-600">
                            <span className="text-red-600 mt-0.5">✗</span>
                            <span>{disadvantage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started */}
      {!selectedDestination && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">🎯</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">여권 최적화 시작하기</h3>
              <p className="text-sm text-blue-800 mb-4">
                목적지를 선택하면 각 여권의 장단점을 분석하여 최적의 선택을 추천해드립니다.
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <div>• 비자 요구사항 및 비용 비교</div>
                <div>• 체류 기간 및 입국 조건 분석</div>
                <div>• 처리 시간 및 편의성 평가</div>
                <div>• 예상 절약 효과 계산</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
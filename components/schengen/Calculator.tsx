'use client';

/**
 * DINO v2.0 - Schengen Calculator Component
 * Clean, modern implementation with zero technical debt
 */

import { useState, useCallback, useEffect } from 'react';
import type { CountryVisit, SchengenCalculationResult } from '@/types/schengen';
import { calculateComprehensiveStatus } from '@/lib/schengen/calculator';

interface SchengenCalculatorProps {
  readonly visits?: readonly CountryVisit[];
  readonly onCalculate?: (result: SchengenCalculationResult) => void;
}

export function SchengenCalculator({ 
  visits = [], 
  onCalculate 
}: SchengenCalculatorProps) {
  const [result, setResult] = useState<SchengenCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [importedVisits, setImportedVisits] = useState<readonly CountryVisit[]>([]);
  const [showImportNotification, setShowImportNotification] = useState(false);

  // Check for imported data on component mount
  useEffect(() => {
    const checkForImportedData = () => {
      try {
        const importData = localStorage.getItem('schengenImportData');
        if (importData) {
          const parsed = JSON.parse(importData);
          setImportedVisits(parsed.visits || []);
          setShowImportNotification(true);
          
          // Clear the import data
          localStorage.removeItem('schengenImportData');
          
          console.log('📥 Found imported data:', parsed.visits?.length, 'visits');
        }
      } catch (error) {
        console.error('Failed to load imported data:', error);
      }
    };

    checkForImportedData();
    
    // Also check URL params for import flag
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('imported') === 'true') {
      setShowImportNotification(true);
    }
  }, []);

  // Combine props visits with imported visits
  const allVisits = [...visits, ...importedVisits];

  const handleCalculate = useCallback(async () => {
    setIsCalculating(true);
    
    try {
      // Simulate async calculation (for future API integration)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const calculationResult = calculateComprehensiveStatus(allVisits);
      setResult(calculationResult);
      onCalculate?.(calculationResult);
    } catch {
      // TODO: Implement proper error handling
    } finally {
      setIsCalculating(false);
    }
  }, [allVisits, onCalculate]);

  const getStatusColor = (isCompliant: boolean, remainingDays: number) => {
    if (!isCompliant) return 'text-red-600';
    if (remainingDays <= 10) return 'text-orange-600';
    if (remainingDays <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (isCompliant: boolean, remainingDays: number) => {
    if (!isCompliant) return '🚫';
    if (remainingDays <= 10) return '⚠️';
    if (remainingDays <= 30) return '📅';
    return '✅';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      {/* Import Notification */}
      {showImportNotification && importedVisits.length > 0 && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <div className="text-green-600 text-xl">📧</div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">Gmail 데이터 가져오기 완료!</h3>
              <p className="text-sm text-green-700 mt-1">
                {importedVisits.length}개의 여행 기록이 Gmail에서 자동으로 가져와졌습니다.
              </p>
              <div className="mt-2 space-y-1">
                {importedVisits.map((visit, index) => (
                  <div key={index} className="text-xs text-green-600">
                    • {visit.country}: {new Date(visit.entryDate).toLocaleDateString()} → {visit.exitDate ? new Date(visit.exitDate).toLocaleDateString() : '진행중'}
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setShowImportNotification(false)}
              className="text-green-400 hover:text-green-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            🇪🇺 셰겐 계산기
          </h2>
          {allVisits.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              총 {allVisits.length}개의 여행 기록 분석
            </p>
          )}
        </div>
        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCalculating ? '계산 중...' : '계산하기'}
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">
                {getStatusIcon(result.status.isCompliant, result.status.remainingDays)}
              </span>
              <h3 className="text-lg font-semibold text-gray-900">
                현재 상태
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result.status.usedDays}
                </div>
                <div className="text-sm text-gray-600">사용한 일수</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getStatusColor(result.status.isCompliant, result.status.remainingDays)}`}>
                  {result.status.remainingDays}
                </div>
                <div className="text-sm text-gray-600">남은 일수</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  90
                </div>
                <div className="text-sm text-gray-600">최대 일수</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>셰겐 사용량</span>
              <span>{result.status.usedDays}/90일 ({Math.round((result.status.usedDays / 90) * 100)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  result.status.usedDays > 90 
                    ? 'bg-red-500' 
                    : result.status.usedDays > 80 
                    ? 'bg-orange-500' 
                    : result.status.usedDays > 60 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min((result.status.usedDays / 90) * 100, 100)}%` 
                }}
              />
            </div>
          </div>

          {/* Next Reset Date */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              📅 다음 리셋 날짜
            </h4>
            <p className="text-blue-800">
              {new Date(result.status.nextResetDate).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">
                ⚠️ 주의사항
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="text-yellow-700">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <h4 className="font-semibold text-green-800 mb-2">
                💡 권장사항
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-green-700">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Violations */}
          {result.status.violations.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <h4 className="font-semibold text-red-800 mb-2">
                🚫 규정 위반
              </h4>
              <ul className="space-y-2">
                {result.status.violations.map((violation, index) => (
                  <li key={index} className="text-red-700">
                    <div className="font-medium">
                      {violation.date}: {violation.daysOverLimit}일 초과
                    </div>
                    <div className="text-sm">
                      {violation.description}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !isCalculating && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🧮</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            셰겐 규정 준수 상태를 확인하세요
          </h3>
          <p className="text-gray-600 mb-6">
            90/180일 규칙에 따른 현재 상태와 권장사항을 제공합니다
          </p>
          <button
            onClick={handleCalculate}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            계산 시작하기
          </button>
        </div>
      )}
    </div>
  );
}
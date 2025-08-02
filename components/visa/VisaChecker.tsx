'use client'

/**
 * DINO v2.0 - Visa Checker Component
 * Interactive component for checking visa requirements
 */

import { useState, useCallback } from 'react';
import type { VisaCheckerRequest, VisaCheckerResponse, TravelPurpose } from '@/types/visa';
import { COUNTRIES, POPULAR_PASSPORTS } from '@/data/countries';
import { checkVisaRequirements } from '@/lib/visa/checker';

interface VisaCheckerProps {
  onResult?: (result: VisaCheckerResponse) => void;
}

export function VisaChecker({ onResult }: VisaCheckerProps) {
  const [formData, setFormData] = useState<VisaCheckerRequest>({
    passportCountry: 'KR',
    destination: '',
    purpose: 'tourism',
    stayDuration: undefined
  });
  
  const [result, setResult] = useState<VisaCheckerResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const handleCheck = useCallback(async () => {
    // Enhanced validation
    if (!formData.destination) {
      setValidationError('목적지를 선택해주세요.');
      return;
    }
    
    if (formData.stayDuration && formData.stayDuration > 365) {
      setValidationError('체류 기간은 365일을 초과할 수 없습니다.');
      return;
    }
    
    setValidationError('');
    setIsChecking(true);
    
    try {
      const response = checkVisaRequirements(formData);
      setResult(response);
      onResult?.(response);
    } catch {
      setResult({
        success: false,
        error: '비자 정보를 확인하는 중 오류가 발생했습니다.'
      });
    } finally {
      setIsChecking(false);
    }
  }, [formData, onResult]);

  const handleReset = useCallback(() => {
    setResult(null);
    setValidationError('');
    setFormData(prev => ({
      ...prev,
      destination: '',
      stayDuration: undefined
    }));
  }, []);
  
  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCheck();
      } else if (e.key === 'r') {
        e.preventDefault();
        handleReset();
      }
    }
  }, [handleCheck, handleReset]);

  return (
    <div 
      className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6"
      onKeyDown={handleKeyDown}
      role="application"
      aria-label="비자 요구사항 체커 폼"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🛂 비자 요구사항 체커
        </h2>
        <p className="text-gray-600">
          여권 국가와 목적지를 선택하면 비자 요구사항을 즉시 확인할 수 있습니다.
        </p>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Passport Country */}
        <div className="space-y-2">
          <label htmlFor="passport-country" className="block text-sm font-semibold text-gray-700">
            여권 발급 국가
          </label>
          <select
            id="passport-country"
            value={formData.passportCountry}
            onChange={(e) => setFormData(prev => ({ ...prev, passportCountry: e.target.value }))}
            className="form-select font-medium"
          >
            {POPULAR_PASSPORTS.map(countryCode => {
              const country = COUNTRIES.find(c => c.code === countryCode);
              return country ? (
                <option key={countryCode} value={countryCode}>
                  {country.name} ({countryCode})
                </option>
              ) : null;
            })}
            <optgroup label="기타 국가">
              {COUNTRIES
                .filter(country => !POPULAR_PASSPORTS.includes(country.code as (typeof POPULAR_PASSPORTS)[number]))
                .map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </option>
                ))
              }
            </optgroup>
          </select>
        </div>

        {/* Destination Country */}
        <div className="space-y-2">
          <label htmlFor="destination" className="block text-sm font-semibold text-gray-700">
            목적지 국가 *
          </label>
          <select
            id="destination"
            value={formData.destination}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, destination: e.target.value }));
              if (validationError) setValidationError('');
            }}
            className={`form-select font-medium transition-colors ${
              validationError && !formData.destination ? 'border-red-300 bg-red-50' : ''
            }`}
            aria-describedby={validationError ? "destination-error" : undefined}
          >
            <option value="" className="text-gray-500">목적지를 선택하세요</option>
            <optgroup label="인기 목적지">
              {['US', 'JP', 'CN', 'DE', 'FR', 'GB', 'AU', 'SG', 'TH', 'VN'].map(countryCode => {
                const country = COUNTRIES.find(c => c.code === countryCode);
                return country ? (
                  <option key={countryCode} value={countryCode}>
                    {country.name} ({countryCode})
                  </option>
                ) : null;
              })}
            </optgroup>
            <optgroup label="모든 국가">
              {COUNTRIES.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Travel Purpose */}
        <div className="space-y-2">
          <label htmlFor="purpose" className="block text-sm font-semibold text-gray-700">
            여행 목적
          </label>
          <select
            id="purpose"
            value={formData.purpose}
            onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value as TravelPurpose }))}
            className="form-select font-medium"
          >
            <option value="tourism">관광</option>
            <option value="business">사업</option>
            <option value="transit">경유</option>
            <option value="work">취업</option>
            <option value="study">유학</option>
            <option value="family_visit">가족방문</option>
          </select>
        </div>

        {/* Stay Duration */}
        <div className="space-y-2">
          <label htmlFor="duration" className="block text-sm font-semibold text-gray-700">
            예상 체류 기간 (일)
          </label>
          <div className="relative">
            <input
              id="duration"
              type="number"
              min="1"
              max="365"
              value={formData.stayDuration || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined;
                setFormData(prev => ({ ...prev, stayDuration: value }));
                if (value && value > 365) {
                  setValidationError('체류 기간은 365일을 초과할 수 없습니다.');
                } else if (validationError && validationError.includes('체류 기간')) {
                  setValidationError('');
                }
              }}
              placeholder="예: 7"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium placeholder:text-gray-500 transition-colors ${
                validationError && validationError.includes('체류 기간') ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              aria-describedby="duration-help"
            />
            <div id="duration-help" className="mt-1 text-xs text-gray-500">
              선택사항: 더 정확한 비자 정보를 위해 입력해주세요 (최대 365일)
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={handleCheck}
          disabled={isChecking || !formData.destination}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-md transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="비자 요구사항 확인"
          title={!formData.destination ? '목적지를 선택해주세요' : '비자 요구사항 확인'}
        >
          {isChecking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              확인 중...
            </>
          ) : (
            <>
              🔍 비자 요구사항 확인
              {!formData.destination && (
                <span className="text-xs opacity-75 ml-1">(목적지 선택 필요)</span>
              )}
            </>
          )}
        </button>
        
        {result && (
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-md transition-all duration-200 shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="폼 초기화 및 다시 확인"
            title="폼을 초기화하고 다시 확인합니다"
          >
            🔄 다시 확인
          </button>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="border-t pt-6">
          {result.success ? (
            <VisaResult result={result} />
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 text-red-800">
                <span className="text-xl">❌</span>
                <span className="font-semibold">오류 발생</span>
              </div>
              <p className="text-red-700 mt-2">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface VisaResultProps {
  result: VisaCheckerResponse & { success: true };
}

function VisaResult({ result }: VisaResultProps) {
  const { requirement, applicationInfo, recommendations } = result.data;
  
  const getRequirementColor = (req: string) => {
    switch (req) {
      case 'visa_free': return 'bg-green-50 border-green-200 text-green-800';
      case 'visa_on_arrival': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'evisa': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'visa_required': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };
  
  const getRequirementText = (req: string) => {
    switch (req) {
      case 'visa_free': return '무비자 입국';
      case 'visa_on_arrival': return '도착비자';
      case 'evisa': return '전자비자';
      case 'visa_required': return '사전비자 필수';
      default: return '확인 필요';
    }
  };
  
  const getRequirementIcon = (req: string) => {
    switch (req) {
      case 'visa_free': return '🎉';
      case 'visa_on_arrival': return '✈️';
      case 'evisa': return '💻';
      case 'visa_required': return '📝';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Result */}
      <div className={`rounded-lg border p-6 ${getRequirementColor(requirement.requirement)}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{getRequirementIcon(requirement.requirement)}</span>
          <div>
            <h3 className="text-xl font-bold">
              {getRequirementText(requirement.requirement)}
            </h3>
            <p className="text-sm opacity-80">
              {COUNTRIES.find(c => c.code === requirement.fromCountry)?.name} → {' '}
              {COUNTRIES.find(c => c.code === requirement.toCountry)?.name}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <span className="text-sm font-semibold opacity-80">최대 체류기간</span>
            <p className="text-lg font-bold">{requirement.maxStayDays}일</p>
          </div>
          {requirement.processingTime && (
            <div>
              <span className="text-sm font-semibold opacity-80">처리기간</span>
              <p className="text-lg font-bold">{requirement.processingTime}</p>
            </div>
          )}
          {requirement.cost && (
            <div>
              <span className="text-sm font-semibold opacity-80">비용</span>
              <p className="text-lg font-bold">{requirement.cost}</p>
            </div>
          )}
        </div>
        
        <p className="text-sm">{requirement.notes}</p>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">💡 추천사항</h4>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-blue-800 text-sm">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Application Info */}
      {applicationInfo && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">📋 신청 정보</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm font-semibold text-gray-700">처리기간</span>
              <p className="text-gray-900">{applicationInfo.processingTime}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">비자 비용</span>
              <p className="text-gray-900">{applicationInfo.cost}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">유효기간</span>
              <p className="text-gray-900">{applicationInfo.validityPeriod}</p>
            </div>
          </div>
          
          {applicationInfo.requirements.length > 0 && (
            <div>
              <span className="text-sm font-semibold text-gray-700 block mb-2">필요 서류</span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-gray-600">
                {applicationInfo.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {applicationInfo.applicationUrl && (
            <div className="mt-4 pt-4 border-t border-gray-300">
              <a 
                href={applicationInfo.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
              >
                🔗 공식 신청 사이트 바로가기
                <span className="text-xs">↗</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
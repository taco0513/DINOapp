'use client';

import { useState } from 'react';

export interface VisaRequirement {
  id: string;
  fromCountry: string;
  toCountry: string;
  visaRequired: boolean;
  visaFreeStay?: number;
  visaTypes: string[];
  processingTime?: string;
  cost?: string;
  requirements?: string[];
  validityPeriod?: number;
  multipleEntry: boolean;
  notes?: string;
  lastUpdated: string;
}

interface VisaRequirementCardProps {
  requirement: VisaRequirement;
  countryName?: string;
}

// 국가 코드를 국가명으로 변환하는 함수
const getCountryName = (countryCode: string): string => {
  const countryNames: { [key: string]: string } = {
    'KR': '대한민국',
    'JP': '일본',
    'TH': '태국',
    'SG': '싱가포르',
    'MY': '말레이시아',
    'VN': '베트남',
    'PH': '필리핀',
    'ID': '인도네시아',
    'FR': '프랑스',
    'DE': '독일',
    'IT': '이탈리아',
    'ES': '스페인',
    'US': '미국',
    'CA': '캐나다',
    'MX': '멕시코',
    'CN': '중국',
    'IN': '인도',
    'RU': '러시아',
    'EG': '이집트',
    'AU': '호주',
    'NZ': '뉴질랜드',
    'AE': '아랍에미리트',
    'TR': '터키',
    'IL': '이스라엘'
  };
  return countryNames[countryCode] || countryCode;
};

// 비자 타입을 한국어로 변환
const getVisaTypeName = (visaType: string): string => {
  const visaTypeNames: { [key: string]: string } = {
    'tourist': '관광',
    'business': '비즈니스',
    'transit': '트랜짓',
    'e-visa': '전자비자',
    'work': '취업',
    'student': '학생',
    'digital-nomad': '디지털노마드'
  };
  return visaTypeNames[visaType] || visaType;
};

export default function VisaRequirementCard({ 
  requirement, 
  countryName 
}: VisaRequirementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const displayCountryName = countryName || getCountryName(requirement.toCountry);

  return (
    <div className="ios-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {requirement.toCountry === 'US' && '🇺🇸'}
            {requirement.toCountry === 'JP' && '🇯🇵'}
            {requirement.toCountry === 'CN' && '🇨🇳'}
            {requirement.toCountry === 'TH' && '🇹🇭'}
            {requirement.toCountry === 'SG' && '🇸🇬'}
            {requirement.toCountry === 'FR' && '🇫🇷'}
            {requirement.toCountry === 'DE' && '🇩🇪'}
            {requirement.toCountry === 'AU' && '🇦🇺'}
            {requirement.toCountry === 'CA' && '🇨🇦'}
            {requirement.toCountry === 'IN' && '🇮🇳'}
            {!['US', 'JP', 'CN', 'TH', 'SG', 'FR', 'DE', 'AU', 'CA', 'IN'].includes(requirement.toCountry) && '🌍'}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              {displayCountryName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {requirement.toCountry}
            </p>
          </div>
        </div>
        
        {/* 비자 상태 배지 */}
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          requirement.visaRequired
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {requirement.visaRequired ? '비자 필요' : '무비자'}
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="space-y-2 mb-4">
        {!requirement.visaRequired && requirement.visaFreeStay && (
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-2">📅</span>
            <span>최대 {requirement.visaFreeStay}일 체류 가능</span>
          </div>
        )}
        
        {requirement.visaRequired && requirement.processingTime && (
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-2">⏱️</span>
            <span>처리 기간: {requirement.processingTime}</span>
          </div>
        )}
        
        {requirement.cost && (
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-2">💰</span>
            <span>비용: {requirement.cost}</span>
          </div>
        )}
        
        {requirement.multipleEntry && (
          <div className="flex items-center text-sm text-green-600">
            <span className="mr-2">🔄</span>
            <span>복수 입국 가능</span>
          </div>
        )}
      </div>

      {/* 간단한 노트 */}
      {requirement.notes && (
        <div className="bg-blue-50 p-3 rounded-md mb-4">
          <p className="text-sm text-blue-800">
            ℹ️ {requirement.notes}
          </p>
        </div>
      )}

      {/* 상세 정보 토글 */}
      {(requirement.visaTypes.length > 0 || requirement.requirements) && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <span>상세 정보</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-4 border-t border-border pt-4">
              {/* 비자 타입 */}
              {requirement.visaTypes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-foreground">
                    사용 가능한 비자 타입
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {requirement.visaTypes.map((type, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      >
                        {getVisaTypeName(type)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 필요 서류 */}
              {requirement.requirements && requirement.requirements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-foreground">
                    필요 서류
                  </h4>
                  <ul className="space-y-1">
                    {requirement.requirements.map((req, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-2">📋</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 유효 기간 */}
              {requirement.validityPeriod && (
                <div>
                  <h4 className="font-medium mb-2 text-foreground">
                    비자 유효 기간
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {requirement.validityPeriod}일
                  </p>
                </div>
              )}

              {/* 마지막 업데이트 */}
              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                마지막 업데이트: {new Date(requirement.lastUpdated).toLocaleDateString('ko-KR')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import VisaRequirementCard, { VisaRequirement } from './VisaRequirementCard';

interface VisaRequirementsListProps {
  fromCountry?: string;
}

export default function VisaRequirementsList({ fromCountry }: VisaRequirementsListProps) {
  const [requirements, setRequirements] = useState<VisaRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'visa-free' | 'visa-required'>('all');
  const [passportCountry, setPassportCountry] = useState<string>('');

  // 비자 요구사항 데이터 로드
  useEffect(() => {
    fetchVisaRequirements();
  }, [fromCountry]);

  const fetchVisaRequirements = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL('/api/visa-requirements', window.location.origin);
      if (fromCountry) {
        url.searchParams.set('from', fromCountry);
      }

      const response = await fetch(url.toString());
      const result = await response.json();

      if (result.success) {
        setRequirements(result.data);
        setPassportCountry(result.passportCountry);
      } else {
        setError(result.error || '비자 요구사항을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching visa requirements:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 요구사항
  const filteredRequirements = requirements.filter(req => {
    // 검색어 필터
    const countryName = getCountryName(req.toCountry);
    const matchesSearch = 
      countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.toCountry.toLowerCase().includes(searchTerm.toLowerCase());

    // 비자 타입 필터
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'visa-free' && !req.visaRequired) ||
      (filterType === 'visa-required' && req.visaRequired);

    return matchesSearch && matchesFilter;
  });

  // 국가 코드를 국가명으로 변환
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-muted-foreground">비자 요구사항을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">❌</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchVisaRequirements}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const visaFreeCount = requirements.filter(req => !req.visaRequired).length;
  const visaRequiredCount = requirements.filter(req => req.visaRequired).length;

  return (
    <div className="space-y-6">
      {/* 헤더 및 통계 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {getCountryName(passportCountry)} 여권 비자 요구사항
        </h2>
        <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            무비자: {visaFreeCount}개국
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            비자 필요: {visaRequiredCount}개국
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* 검색 */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="국가명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* 필터 */}
        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilterType('visa-free')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-l border-border ${
              filterType === 'visa-free'
                ? 'bg-green-100 text-green-700'
                : 'bg-background text-muted-foreground hover:bg-muted'
            }`}
          >
            무비자
          </button>
          <button
            onClick={() => setFilterType('visa-required')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-l border-border ${
              filterType === 'visa-required'
                ? 'bg-red-100 text-red-700'
                : 'bg-background text-muted-foreground hover:bg-muted'
            }`}
          >
            비자 필요
          </button>
        </div>
      </div>

      {/* 결과 개수 */}
      <div className="text-sm text-muted-foreground mb-4">
        {filteredRequirements.length}개의 결과
      </div>

      {/* 비자 요구사항 목록 */}
      {filteredRequirements.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-muted-foreground">검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequirements.map((requirement) => (
            <VisaRequirementCard
              key={requirement.id}
              requirement={requirement}
            />
          ))}
        </div>
      )}
    </div>
  );
}
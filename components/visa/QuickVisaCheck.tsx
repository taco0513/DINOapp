'use client'

import { useState, useCallback } from 'react'
import { Search, Plane, Clock, FileText, AlertCircle } from 'lucide-react'
import { COUNTRIES } from '@/constants/countries'
import { getVisaRequirements } from '@/lib/visa-requirements'
import type { PassportCountry } from '@/types/global'

interface VisaInfo {
  country: string
  countryCode: string
  visaRequired: boolean
  visaType: string
  maxStayDays: number
  notes: string
  isSchengen: boolean
}

export function QuickVisaCheck() {
  const [searchQuery, setSearchQuery] = useState('')
  const [_selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [passportCountry, setPassportCountry] = useState<PassportCountry>('KR' as PassportCountry)
  const [visaInfo, setVisaInfo] = useState<VisaInfo | null>(null)
  const [_loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // 국가 검색
  const filteredCountries = searchQuery
    ? COUNTRIES.filter(country => 
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : []

  // 비자 정보 조회
  const checkVisa = useCallback(async (countryCode: string) => {
    setLoading(true)
    try {
      const requirements = getVisaRequirements(passportCountry, countryCode)
      
      const country = COUNTRIES.find(c => c.code === countryCode)
      if (!country) return

      setVisaInfo({
        country: country.name,
        countryCode: country.code,
        visaRequired: requirements.visaRequired,
        visaType: requirements.visaType,
        maxStayDays: requirements.maxStayDays,
        notes: requirements.notes || '',
        isSchengen: country.schengen || false
      })
      
      setShowResults(true)
    } catch (error) {
      console.error('비자 정보 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [passportCountry])

  // 국가 선택
  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode)
    const country = COUNTRIES.find(c => c.code === countryCode)
    if (country) {
      setSearchQuery(country.name)
    }
    checkVisa(countryCode)
  }

  // 엔터키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredCountries.length > 0) {
      handleCountrySelect(filteredCountries[0].code)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Plane className="h-5 w-5" />
            빠른 비자 체크
          </h2>
        </div>
        
        <div className="card-body space-y-6">
          {/* 여권 국가 선택 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              내 여권 국가
            </label>
            <select
              value={passportCountry}
              onChange={(e) => setPassportCountry(e.target.value as PassportCountry)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="KR">🇰🇷 대한민국</option>
              <option value="US">🇺🇸 미국</option>
              <option value="JP">🇯🇵 일본</option>
              <option value="CN">🇨🇳 중국</option>
              <option value="OTHER">기타</option>
            </select>
          </div>

          {/* 목적지 국가 검색 */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              어디로 가시나요?
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="국가명 또는 코드 입력 (예: 프랑스, FR)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* 검색 결과 드롭다운 */}
            {searchQuery && filteredCountries.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country.code)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <div className="font-medium">{country.name}</div>
                      <div className="text-sm text-gray-500">{country.code}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 비자 정보 결과 */}
          {showResults && visaInfo && (
            <div className={`mt-6 p-6 rounded-lg border-2 ${
              visaInfo.visaRequired 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  visaInfo.visaRequired 
                    ? 'bg-yellow-100' 
                    : 'bg-green-100'
                }`}>
                  {visaInfo.visaRequired ? (
                    <FileText className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <Plane className="h-6 w-6 text-green-600" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {COUNTRIES.find(c => c.code === visaInfo.countryCode)?.flag}
                    {visaInfo.country}
                  </h3>
                  
                  <div className="mt-2 space-y-2">
                    <p className={`font-medium ${
                      visaInfo.visaRequired 
                        ? 'text-yellow-700' 
                        : 'text-green-700'
                    }`}>
                      {visaInfo.visaRequired 
                        ? '비자 필요 ⚠️' 
                        : '무비자 입국 가능 ✅'}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>최대 체류: {visaInfo.maxStayDays}일</span>
                    </div>

                    {visaInfo.visaType && (
                      <div className="text-sm text-gray-600">
                        비자 종류: {visaInfo.visaType}
                      </div>
                    )}

                    {visaInfo.isSchengen && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>셴겐 지역 (180일 중 90일 규칙 적용)</span>
                      </div>
                    )}

                    {visaInfo.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        {visaInfo.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 빠른 인기 국가 버튼 */}
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-3">인기 목적지 빠른 선택</p>
            <div className="flex flex-wrap gap-2">
              {['US', 'JP', 'FR', 'DE', 'TH', 'VN', 'ES', 'IT'].map(code => {
                const country = COUNTRIES.find(c => c.code === code)
                if (!country) return null
                
                return (
                  <button
                    key={code}
                    onClick={() => handleCountrySelect(code)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full flex items-center gap-1.5 transition-colors"
                  >
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
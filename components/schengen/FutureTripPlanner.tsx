'use client'

import { useState } from 'react'
import { validateFutureTrip, getSafeTravelDates, isSchengenCountry } from '@/lib/schengen-calculator'
import type { CountryVisit } from '@/types/global'
import { countries } from '@/data/countries'
import { Button } from '@/components/ui/button'

interface FutureTripPlannerProps {
  visits: CountryVisit[]
}

export default function FutureTripPlanner({ visits }: FutureTripPlannerProps) {
  const [plannedCountry, setPlannedCountry] = useState('')
  const [entryDate, setEntryDate] = useState('')
  const [exitDate, setExitDate] = useState('')
  const [desiredDuration, setDesiredDuration] = useState('7')
  const [validation, setValidation] = useState<ReturnType<typeof validateFutureTrip> | null>(null)
  const [safeDates, setSafeDates] = useState<{ startDate: Date; endDate: Date } | null>(null)

  const schengenCountries = countries.filter(country => isSchengenCountry(country.name))

  const handleValidate = () => {
    if (!plannedCountry || !entryDate || !exitDate) {
      return
    }

    const entry = new Date(entryDate)
    const exit = new Date(exitDate)

    if (exit <= entry) {
      return
    }

    const result = validateFutureTrip(visits, entry, exit, plannedCountry)
    setValidation(result)
  }

  const handleFindSafeDates = () => {
    if (!plannedCountry || !desiredDuration) {
      return
    }

    const duration = parseInt(desiredDuration)
    if (duration < 1 || duration > 90) {
      return
    }

    const safe = getSafeTravelDates(visits, duration)
    setSafeDates(safe)
  }

  return (
    <div className="space-y-6">
      {/* 미래 여행 계획 검증 */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">🔮 미래 여행 계획 검증</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              방문 예정 국가
            </label>
            <select
              value={plannedCountry}
              onChange={(e) => setPlannedCountry(e.target.value)}
              className="w-full px-3 py-2 border border-border-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">국가 선택</option>
              <optgroup label="셰겐 지역">
                {schengenCountries.map(country => (
                  <option key={country.code} value={country.name}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="비셰겐 지역">
                {countries.filter(c => !isSchengenCountry(c.name)).map(country => (
                  <option key={country.code} value={country.name}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              입국 예정일
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-border-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              출국 예정일
            </label>
            <input
              type="date"
              value={exitDate}
              onChange={(e) => setExitDate(e.target.value)}
              min={entryDate || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-border-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <Button
          onClick={handleValidate}
        >
          여행 계획 검증하기
        </Button>

        {validation && (
          <div className={`mt-4 alert ${validation.canTravel ? 'alert-success' : 'alert-error'}`}>
            <div className="space-y-2">
              {validation.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">경고</h4>
                  {validation.warnings.map((warning, idx) => (
                    <p key={idx} className="text-sm">{warning}</p>
                  ))}
                </div>
              )}
              
              {validation.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">제안</h4>
                  {validation.suggestions.map((suggestion, idx) => (
                    <p key={idx} className="text-sm">{suggestion}</p>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                <div>
                  <span className="text-sm text-secondary">최대 체류 가능일:</span>
                  <p className="font-semibold">{validation.maxStayDays}일</p>
                </div>
                <div>
                  <span className="text-sm text-secondary">여행 후 남은 일수:</span>
                  <p className="font-semibold">{validation.remainingDaysAfterTrip}일</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 안전한 여행 날짜 찾기 */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">📅 안전한 여행 날짜 찾기</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              희망 체류 기간 (일)
            </label>
            <input
              type="number"
              value={desiredDuration}
              onChange={(e) => setDesiredDuration(e.target.value)}
              min="1"
              max="90"
              className="w-full px-3 py-2 border border-border-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleFindSafeDates}
            >
              안전한 날짜 찾기
            </Button>
          </div>
        </div>

        {safeDates && (
          <div className="mt-4 alert">
            <h4 className="font-medium mb-2">추천 여행 날짜</h4>
            <p>
              <span className="font-semibold">
                {safeDates.startDate.toLocaleDateString('ko-KR')}
              </span>
              {' ~ '}
              <span className="font-semibold">
                {safeDates.endDate.toLocaleDateString('ko-KR')}
              </span>
              {' '}
              ({desiredDuration}일간)
            </p>
            <p className="text-sm mt-1">
              이 날짜로 여행하면 셰겐 90/180일 규칙을 준수할 수 있습니다.
            </p>
          </div>
        )}

        {safeDates === null && desiredDuration && (
          <div className="mt-4 alert alert-warning">
            <p>
              향후 1년 내에 {desiredDuration}일간 안전하게 여행할 수 있는 날짜를 찾을 수 없습니다.
              더 짧은 기간을 고려해보세요.
            </p>
          </div>
        )}
      </div>

      {/* 도움말 */}
      <div className="alert">
        <h4 className="font-medium mb-2">💡 사용 방법</h4>
        <ul className="text-sm text-secondary space-y-1 list-disc list-inside">
          <li>미래 여행을 계획하기 전에 셰겐 규정 준수 여부를 확인하세요</li>  
          <li>경고가 표시되면 대안 날짜나 기간을 고려하세요</li>
          <li>안전한 날짜 찾기 기능으로 규정을 준수하는 여행 날짜를 자동으로 찾을 수 있습니다</li>
          <li>비셰겐 국가는 90/180일 규칙이 적용되지 않습니다</li>
        </ul>
      </div>
    </div>
  )
}
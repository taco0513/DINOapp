'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CountryUtils } from '@/constants/countries';
import { getCountryFlag } from '@/lib/visa-utils';

interface UserVisa {
  id: string;
  countryCode: string;
  countryName: string;
  visaType: string;
  maxStayDays?: number;
  expiryDate: string;
  status: string;
}

interface TripValidation {
  schengenValidation: {
    canTravel: boolean;
    warnings: string[];
    suggestions: string[];
    maxStayDays: number;
    violatesRule: boolean;
    daysUsedAfterTrip: number;
    remainingDaysAfterTrip: number;
  };
  visaValidation: {
    hasValidVisa: boolean;
    visaExpiry?: string;
    maxStayDays?: number;
    remainingDays?: number;
    warnings: string[];
    suggestions: string[];
  };
  overall: {
    canTravel: boolean;
    criticalWarnings: string[];
    recommendations: string[];
  };
}

interface EnhancedSchengenPlannerProps {
  userVisas: UserVisa[];
  onRefresh?: () => void;
}

export function EnhancedSchengenPlanner({ userVisas, onRefresh }: EnhancedSchengenPlannerProps) {
  const [plannedEntry, setPlannedEntry] = useState('');
  const [plannedExit, setPlannedExit] = useState('');
  const [plannedCountry, setPlannedCountry] = useState('');
  const [selectedVisaId, setSelectedVisaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<TripValidation | null>(null);

  // 계획된 기간 자동 계산
  useEffect(() => {
    if (plannedEntry && !plannedExit) {
      // 기본적으로 7일 여행으로 설정
      const entryDate = new Date(plannedEntry);
      const exitDate = addDays(entryDate, 6); // 7일 여행 (entry + 6일)
      setPlannedExit(format(exitDate, 'yyyy-MM-dd'));
    }
  }, [plannedEntry, plannedExit]);

  // 국가 변경 시 해당 국가의 비자 필터링
  const availableVisas = userVisas.filter(visa => 
    !plannedCountry || visa.countryName === plannedCountry
  );

  // 유효한 비자만 필터링 (활성 상태이고 미래에 만료)
  const validVisas = availableVisas.filter(visa => 
    visa.status === 'active' && new Date(visa.expiryDate) > new Date()
  );

  const schengenCountries = CountryUtils.getSchengenCountryOptions();

  const handleCountryChange = (country: string) => {
    setPlannedCountry(country);
    setSelectedVisaId(''); // 국가 변경 시 비자 선택 초기화
    setValidation(null); // 검증 결과 초기화
  };

  const validateTrip = async () => {
    if (!plannedEntry || !plannedExit || !plannedCountry) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    const entryDate = new Date(plannedEntry);
    const exitDate = new Date(plannedExit);

    if (exitDate <= entryDate) {
      toast.error('출국일은 입국일보다 늦어야 합니다.');
      return;
    }

    if (entryDate < new Date()) {
      toast.error('입국일은 오늘 이후여야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/schengen/validate-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plannedEntry,
          plannedExit,
          plannedCountry,
          visaId: selectedVisaId || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to validate trip');
      }

      setValidation(result.data);
    } catch (error) {
      console.error('Error validating trip:', error);
      toast.error(error instanceof Error ? error.message : '여행 검증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getTripDuration = () => {
    if (!plannedEntry || !plannedExit) return 0;
    const entryDate = new Date(plannedEntry);
    const exitDate = new Date(plannedExit);
    return Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getValidationColor = (canTravel: boolean, hasWarnings: boolean) => {
    if (!canTravel) return 'border-red-200 bg-red-50';
    if (hasWarnings) return 'border-orange-200 bg-orange-50';
    return 'border-green-200 bg-green-50';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          🔮 향상된 여행 계획 검증기
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-600">
          비자 정보와 셰겐 규칙을 모두 고려한 정확한 여행 가능 여부를 확인하세요
        </p>

        {/* 여행 정보 입력 */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedCountry">방문 국가</Label>
              <Select value={plannedCountry} onValueChange={handleCountryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="국가를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {schengenCountries.map(option => (
                    <SelectItem key={option.code} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{getCountryFlag(option.code)}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedEntry">입국일</Label>
              <Input
                id="plannedEntry"
                type="date"
                value={plannedEntry}
                onChange={(e) => setPlannedEntry(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedExit">출국일</Label>
              <Input
                id="plannedExit"
                type="date"
                value={plannedExit}
                onChange={(e) => setPlannedExit(e.target.value)}
                min={plannedEntry || format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>

          {/* 비자 선택 */}
          {plannedCountry && (
            <div className="space-y-2">
              <Label htmlFor="selectedVisa">비자 선택 (선택사항)</Label>
              {validVisas.length > 0 ? (
                <Select value={selectedVisaId} onValueChange={setSelectedVisaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="비자를 선택하세요 (더 정확한 검증)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">비자 없이 검증 (기본 셰겐 규칙만)</SelectItem>
                    {validVisas.map(visa => (
                      <SelectItem key={visa.id} value={visa.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {visa.countryName} - {visa.visaType}
                            {visa.maxStayDays && ` (최대 ${visa.maxStayDays}일)`}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {format(new Date(visa.expiryDate), 'yyyy.MM.dd', { locale: ko })} 만료
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {plannedCountry}의 유효한 비자가 없습니다. 
                    <button 
                      onClick={onRefresh}
                      className="ml-1 text-yellow-800 underline hover:no-underline"
                    >
                      비자를 먼저 추가
                    </button>
                    하거나 기본 셰겐 규칙으로만 검증하세요.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 여행 요약 */}
          {plannedCountry && plannedEntry && plannedExit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">여행 계획 요약</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{plannedCountry}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(plannedEntry), 'M월 d일', { locale: ko })} ~ {' '}
                    {format(new Date(plannedExit), 'M월 d일', { locale: ko })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{getTripDuration()}일 체류</span>
                </div>
                {selectedVisaId && (
                  <div className="flex items-center gap-2 col-span-full">
                    <CreditCard className="h-4 w-4" />
                    <span>
                      선택된 비자: {validVisas.find(v => v.id === selectedVisaId)?.visaType}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={validateTrip}
            disabled={loading || !plannedCountry || !plannedEntry || !plannedExit}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                검증 중...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                여행 가능 여부 확인
              </>
            )}
          </Button>
        </div>

        {/* 검증 결과 */}
        {validation && (
          <div className="space-y-4">
            {/* 전체 결과 */}
            <div className={`p-4 rounded-lg border-2 ${getValidationColor(
              validation.overall.canTravel,
              validation.overall.criticalWarnings.length > 0
            )}`}>
              <div className="flex items-center gap-2 mb-3">
                {validation.overall.canTravel ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <h3 className="text-lg font-semibold">
                  {validation.overall.canTravel ? '✅ 여행 가능!' : '❌ 여행 불가!'}
                </h3>
              </div>

              {validation.overall.criticalWarnings.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-red-800">주요 경고사항:</h4>
                  {validation.overall.criticalWarnings.map((warning, index) => (
                    <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                      {warning}
                    </div>
                  ))}
                </div>
              )}

              {validation.overall.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">권장사항:</h4>
                  {validation.overall.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 상세 검증 결과 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 셰겐 규칙 검증 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    🇪🇺 셰겐 90/180일 규칙
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>규칙 준수</span>
                    <Badge variant={validation.schengenValidation.canTravel ? "default" : "destructive"}>
                      {validation.schengenValidation.canTravel ? '준수' : '위반'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>최대 체류 가능일</span>
                      <strong>{validation.schengenValidation.maxStayDays}일</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>여행 후 잔여일수</span>
                      <strong>{validation.schengenValidation.remainingDaysAfterTrip}일</strong>
                    </div>
                  </div>

                  {validation.schengenValidation.warnings.length > 0 && (
                    <div className="space-y-1">
                      {validation.schengenValidation.warnings.map((warning, index) => (
                        <div key={index} className="text-xs text-orange-700 bg-orange-50 p-2 rounded">
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 비자 검증 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    🛂 비자 요구사항
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>유효한 비자</span>
                    <Badge variant={validation.visaValidation.hasValidVisa ? "default" : "secondary"}>
                      {validation.visaValidation.hasValidVisa ? '있음' : '없음/선택안함'}
                    </Badge>
                  </div>

                  {validation.visaValidation.hasValidVisa && (
                    <div className="text-sm space-y-1">
                      {validation.visaValidation.maxStayDays && (
                        <div className="flex justify-between">
                          <span>비자 최대 체류일</span>
                          <strong>{validation.visaValidation.maxStayDays}일</strong>
                        </div>
                      )}
                      {validation.visaValidation.remainingDays !== undefined && (
                        <div className="flex justify-between">
                          <span>비자 잔여일수</span>
                          <strong>{validation.visaValidation.remainingDays}일</strong>
                        </div>
                      )}
                      {validation.visaValidation.visaExpiry && (
                        <div className="flex justify-between">
                          <span>비자 만료일</span>
                          <strong>
                            {format(new Date(validation.visaValidation.visaExpiry), 'yyyy.MM.dd', { locale: ko })}
                          </strong>
                        </div>
                      )}
                    </div>
                  )}

                  {validation.visaValidation.warnings.length > 0 && (
                    <div className="space-y-1">
                      {validation.visaValidation.warnings.map((warning, index) => (
                        <div key={index} className="text-xs text-orange-700 bg-orange-50 p-2 rounded">
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
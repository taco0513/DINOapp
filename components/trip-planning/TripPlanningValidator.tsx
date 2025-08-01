'use client';

import React, { useState } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  Loader2,
  Plane,
  Shield,
  FileText,
  AlertCircle
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface TripDestination {
  id: string;
  countryCode: string;
  countryName: string;
  startDate: string;
  endDate: string;
  purpose?: string;
}

interface VisaRequirement {
  countryCode: string;
  countryName: string;
  hasValidVisa: boolean;
  visaRequired: boolean;
  visaInfo: {
    id?: string;
    visaType?: string;
    expiryDate?: string;
    maxStayDays?: number | null;
    remainingDays?: number | null;
  } | null;
  stayDuration: number;
  issues: string[];
  recommendations: string[];
  status: 'valid' | 'warning' | 'invalid' | 'visa_required';
}

interface ValidationResult {
  tripId: string;
  overallStatus: 'valid' | 'warning' | 'invalid';
  totalDuration: number;
  destinations: VisaRequirement[];
  schengenAnalysis?: {
    totalSchengenDays: number;
    remainingDays: number;
    periodStart: string;
    periodEnd: string;
    violations: string[];
  };
  recommendations: string[];
  actionItems: string[];
}

const COUNTRIES = [
  { code: 'US', name: '미국' },
  { code: 'DE', name: '독일' },
  { code: 'FR', name: '프랑스' },
  { code: 'IT', name: '이탈리아' },
  { code: 'ES', name: '스페인' },
  { code: 'NL', name: '네덜란드' },
  { code: 'GB', name: '영국' },
  { code: 'JP', name: '일본' },
  { code: 'TH', name: '태국' },
  { code: 'SG', name: '싱가포르' },
  { code: 'AU', name: '호주' },
  { code: 'CA', name: '캐나다' },
];

const TRIP_PURPOSES = [
  { value: 'tourism', label: '관광' },
  { value: 'business', label: '비즈니스' },
  { value: 'work', label: '업무' },
  { value: 'study', label: '학습/연수' },
  { value: 'medical', label: '의료' },
  { value: 'family', label: '가족 방문' },
  { value: 'transit', label: '경유' },
  { value: 'other', label: '기타' },
];

export function TripPlanningValidator() {
  const [destinations, setDestinations] = useState<TripDestination[]>([
    {
      id: '1',
      countryCode: '',
      countryName: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      purpose: 'tourism'
    }
  ]);

  const [passportExpiry, setPassportExpiry] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const addDestination = () => {
    const lastDestination = destinations[destinations.length - 1];
    const newStartDate = lastDestination?.endDate 
      ? format(addDays(parseISO(lastDestination.endDate), 1), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd');

    setDestinations([
      ...destinations,
      {
        id: Date.now().toString(),
        countryCode: '',
        countryName: '',
        startDate: newStartDate,
        endDate: format(addDays(parseISO(newStartDate), 7), 'yyyy-MM-dd'),
        purpose: 'tourism'
      }
    ]);
  };

  const removeDestination = (id: string) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter(d => d.id !== id));
    }
  };

  const updateDestination = (id: string, field: keyof TripDestination, value: string) => {
    setDestinations(destinations.map(dest => {
      if (dest.id === id) {
        const updated = { ...dest, [field]: value };
        
        // 국가 코드가 변경되면 국가 이름도 업데이트
        if (field === 'countryCode') {
          const country = COUNTRIES.find(c => c.code === value);
          updated.countryName = country?.name || '';
        }
        
        return updated;
      }
      return dest;
    }));
  };

  const validateTrip = async () => {
    // 유효성 검사
    const invalidDestinations = destinations.filter(d => 
      !d.countryCode || !d.countryName || !d.startDate || !d.endDate
    );

    if (invalidDestinations.length > 0) {
      toast.error('모든 목적지 정보를 입력해주세요.');
      return;
    }

    // 날짜 순서 검사
    for (const dest of destinations) {
      if (new Date(dest.startDate) >= new Date(dest.endDate)) {
        toast.error('종료일은 시작일보다 늦어야 합니다.');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/trip-planning/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinations: destinations.map(d => ({
            countryCode: d.countryCode,
            countryName: d.countryName,
            startDate: d.startDate,
            endDate: d.endDate,
            purpose: d.purpose,
          })),
          travelerInfo: passportExpiry ? {
            passportExpiry: passportExpiry
          } : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setValidationResult(result.data);
        toast.success('여행 계획 검증이 완료되었습니다.');
      } else {
        throw new Error(result.error || 'Failed to validate trip');
      }
    } catch (error) {
      console.error('Error validating trip:', error);
      toast.error('여행 계획 검증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'invalid': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'visa_required': return <Shield className="h-5 w-5 text-blue-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'invalid': return 'border-red-200 bg-red-50';
      case 'visa_required': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid': return <Badge className="bg-green-50 text-green-800 border-green-200">유효</Badge>;
      case 'warning': return <Badge className="bg-orange-50 text-orange-800 border-orange-200">주의</Badge>;
      case 'invalid': return <Badge variant="destructive">무효</Badge>;
      case 'visa_required': return <Badge className="bg-blue-50 text-blue-800 border-blue-200">비자 필요</Badge>;
      default: return <Badge variant="outline">확인 필요</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 여행 계획 입력 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            여행 계획 입력
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 여권 만료일 */}
          <div className="space-y-2">
            <Label htmlFor="passportExpiry">여권 만료일 (선택사항)</Label>
            <Input
              id="passportExpiry"
              type="date"
              value={passportExpiry}
              onChange={(e) => setPassportExpiry(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          {/* 목적지 목록 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">여행 목적지</Label>
              <Button onClick={addDestination} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                목적지 추가
              </Button>
            </div>

            {destinations.map((destination, index) => (
              <Card key={destination.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      목적지 {index + 1}
                    </h4>
                    {destinations.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDestination(destination.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 국가 선택 */}
                    <div className="space-y-2">
                      <Label>국가</Label>
                      <Select
                        value={destination.countryCode}
                        onValueChange={(value) => updateDestination(destination.id, 'countryCode', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="국가를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(country => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 여행 목적 */}
                    <div className="space-y-2">
                      <Label>여행 목적</Label>
                      <Select
                        value={destination.purpose}
                        onValueChange={(value) => updateDestination(destination.id, 'purpose', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="목적을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {TRIP_PURPOSES.map(purpose => (
                            <SelectItem key={purpose.value} value={purpose.value}>
                              {purpose.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 시작일 */}
                    <div className="space-y-2">
                      <Label>시작일</Label>
                      <Input
                        type="date"
                        value={destination.startDate}
                        onChange={(e) => updateDestination(destination.id, 'startDate', e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>

                    {/* 종료일 */}
                    <div className="space-y-2">
                      <Label>종료일</Label>
                      <Input
                        type="date"
                        value={destination.endDate}
                        onChange={(e) => updateDestination(destination.id, 'endDate', e.target.value)}
                        min={destination.startDate}
                      />
                    </div>
                  </div>

                  {destination.startDate && destination.endDate && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      체류 기간: {Math.ceil((new Date(destination.endDate).getTime() - new Date(destination.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}일
                      ({format(new Date(destination.startDate), 'MM/dd', { locale: ko })} ~ {format(new Date(destination.endDate), 'MM/dd', { locale: ko })})
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 검증 버튼 */}
          <Button
            onClick={validateTrip}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                검증 중...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                여행 계획 검증하기
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 검증 결과 */}
      {validationResult && (
        <div className="space-y-6">
          {/* 전체 상태 요약 */}
          <Card className={`border-l-4 ${
            validationResult.overallStatus === 'valid' 
              ? 'border-l-green-500' 
              : validationResult.overallStatus === 'warning'
              ? 'border-l-orange-500'
              : 'border-l-red-500'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getStatusIcon(validationResult.overallStatus)}
                <div>
                  <div className="flex items-center gap-2">
                    여행 계획 검증 결과
                    {getStatusBadge(validationResult.overallStatus)}
                  </div>
                  <div className="text-sm font-normal text-gray-600">
                    총 {validationResult.destinations.length}개 목적지, {validationResult.totalDuration}일간 여행
                  </div>
                </div>
              </CardTitle>
            </CardHeader>

            {validationResult.actionItems.length > 0 && (
              <CardContent>
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium text-yellow-800 mb-2">필요한 조치 사항</div>
                    <ul className="space-y-1 text-sm text-yellow-700">
                      {validationResult.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
          </Card>

          {/* 셰겐 분석 결과 */}
          {validationResult.schengenAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  셰겐 지역 90/180일 규칙 분석
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {validationResult.schengenAnalysis.totalSchengenDays}일
                    </div>
                    <div className="text-sm text-gray-600">총 셰겐 체류일</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {validationResult.schengenAnalysis.remainingDays}일
                    </div>
                    <div className="text-sm text-gray-600">잔여 가능 일수</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.ceil((new Date(validationResult.schengenAnalysis.periodEnd).getTime() - new Date(validationResult.schengenAnalysis.periodStart).getTime()) / (1000 * 60 * 60 * 24)) + 1}일
                    </div>
                    <div className="text-sm text-gray-600">총 기간</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>셰겐 90일 한도 사용률</span>
                    <span>{validationResult.schengenAnalysis.totalSchengenDays} / 90일</span>
                  </div>
                  <Progress 
                    value={(validationResult.schengenAnalysis.totalSchengenDays / 90) * 100}
                    className={`h-2 ${
                      validationResult.schengenAnalysis.totalSchengenDays > 90
                        ? '[&>div]:bg-red-500'
                        : validationResult.schengenAnalysis.totalSchengenDays > 75
                        ? '[&>div]:bg-orange-500'
                        : '[&>div]:bg-green-500'
                    }`}
                  />
                </div>

                {validationResult.schengenAnalysis.violations.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">셰겐 규칙 위반 사항</div>
                      <ul className="space-y-1 text-sm">
                        {validationResult.schengenAnalysis.violations.map((violation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">•</span>
                            <span>{violation}</span>
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* 목적지별 상세 결과 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">목적지별 검증 결과</h3>
            {validationResult.destinations.map((dest, index) => (
              <Card key={index} className={`border-l-4 ${getStatusColor(dest.status)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(dest.status)}
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {dest.countryName}
                          {getStatusBadge(dest.status)}
                        </h4>
                        <p className="text-sm text-gray-600">{dest.stayDuration}일 체류</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 비자 정보 */}
                  {dest.hasValidVisa && dest.visaInfo ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        사용 가능한 비자
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                        <div>
                          <span className="font-medium">비자 타입:</span> {dest.visaInfo.visaType}
                        </div>
                        <div>
                          <span className="font-medium">만료일:</span> {dest.visaInfo.expiryDate}
                        </div>
                        {dest.visaInfo.maxStayDays && (
                          <div>
                            <span className="font-medium">최대 체류:</span> {dest.visaInfo.maxStayDays}일
                          </div>
                        )}
                        {dest.visaInfo.remainingDays !== null && (
                          <div>
                            <span className="font-medium">잔여일수:</span> {dest.visaInfo.remainingDays}일
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        비자 필요
                      </h5>
                      <p className="text-sm text-blue-700">
                        {dest.countryName} 여행을 위해 비자가 필요합니다.
                      </p>
                    </div>
                  )}

                  {/* 문제점 및 권장사항 */}
                  {dest.issues.length > 0 && (
                    <Alert className={
                      dest.status === 'invalid' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-orange-50 border-orange-200'
                    }>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-2">주의사항</div>
                        <ul className="space-y-1 text-sm">
                          {dest.issues.map((issue, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="mt-0.5">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {dest.recommendations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h5 className="font-medium text-blue-800 mb-2">💡 권장사항</h5>
                      <ul className="space-y-1 text-sm text-blue-700">
                        {dest.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
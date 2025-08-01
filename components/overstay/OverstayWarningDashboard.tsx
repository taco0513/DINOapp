'use client';

import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  AlertTriangle,
  Clock,
  Calendar,
  MapPin,
  Shield,
  TrendingUp,
  X,
  ChevronRight,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface OverstayWarning {
  id: string;
  visaId: string;
  entryId: string;
  countryName: string;
  countryCode: string;
  warningType: 'approaching' | 'exceeded' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  currentStayDays: number;
  maxStayDays: number;
  daysRemaining: number;
  entryDate: string;
  expectedExitDate: string;
  visaExpiryDate?: string;
  message: string;
  recommendations: string[];
}

interface SchengenOverstayWarning extends OverstayWarning {
  schengenDaysUsed: number;
  schengenDaysRemaining: number;
  rollingPeriodEnd: string;
}

interface WarningData {
  warnings: OverstayWarning[];
  schengenWarnings: SchengenOverstayWarning[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function OverstayWarningDashboard() {
  const [loading, setLoading] = useState(true);
  const [warningData, setWarningData] = useState<WarningData | null>(null);
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set());
  const [expandedWarning, setExpandedWarning] = useState<string | null>(null);

  useEffect(() => {
    loadWarnings();
  }, []);

  const loadWarnings = async () => {
    try {
      const response = await fetch('/api/overstay-warnings');
      const result = await response.json();

      if (result.success) {
        setWarningData(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error loading warnings:', error);
      toast.error('체류 경고 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const dismissWarning = async (warningId: string) => {
    try {
      const response = await fetch(`/api/overstay-warnings/${warningId}/dismiss`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDismissedWarnings(prev => new Set([...prev, warningId]));
        toast.success('경고를 확인했습니다.');
      }
    } catch (error) {
      console.error('Error dismissing warning:', error);
      toast.error('경고 해제에 실패했습니다.');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-5 w-5" />;
      case 'high': return <AlertCircle className="h-5 w-5" />;
      case 'medium': return <Clock className="h-5 w-5" />;
      case 'low': return <Info className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">긴급</Badge>;
      case 'high': return <Badge className="bg-orange-100 text-orange-800 border-orange-200">높음</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">보통</Badge>;
      case 'low': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">낮음</Badge>;
      default: return <Badge variant="outline">알림</Badge>;
    }
  };

  const renderWarning = (warning: OverstayWarning | SchengenOverstayWarning, isSchengen = false) => {
    if (dismissedWarnings.has(warning.id)) return null;

    const isExpanded = expandedWarning === warning.id;
    const progressPercentage = (warning.currentStayDays / warning.maxStayDays) * 100;

    return (
      <div
        key={warning.id}
        className={`rounded-lg border-2 p-4 transition-all cursor-pointer ${getSeverityColor(warning.severity)}`}
        onClick={() => setExpandedWarning(isExpanded ? null : warning.id)}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`mt-1 ${warning.severity === 'critical' ? 'animate-pulse' : ''}`}>
              {getSeverityIcon(warning.severity)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">
                  {isSchengen ? '셰겐 지역' : warning.countryName}
                </h3>
                {getSeverityBadge(warning.severity)}
                {isSchengen && <Badge variant="outline">90/180 규칙</Badge>}
              </div>
              <p className="font-medium mb-2">{warning.message}</p>
              
              {/* 진행 상황 바 */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>체류 {warning.currentStayDays}일</span>
                  <span>최대 {warning.maxStayDays}일</span>
                </div>
                <Progress 
                  value={Math.min(progressPercentage, 100)} 
                  className={`h-2 ${progressPercentage > 100 ? 'bg-red-200' : ''}`}
                />
              </div>

              {/* 간단한 정보 */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>입국: {format(new Date(warning.entryDate), 'MM/dd', { locale: ko })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    {warning.daysRemaining < 0 
                      ? `${Math.abs(warning.daysRemaining)}일 초과`
                      : `${warning.daysRemaining}일 남음`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                dismissWarning(warning.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <ChevronRight 
              className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            />
          </div>
        </div>

        {/* 확장된 내용 */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-current/20">
            {/* 셰겐 추가 정보 */}
            {isSchengen && 'schengenDaysUsed' in warning && (
              <div className="mb-4 p-3 bg-white/50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  셰겐 지역 체류 현황
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">180일 중 사용:</span>
                    <span className="ml-2 font-medium">{warning.schengenDaysUsed}일</span>
                  </div>
                  <div>
                    <span className="text-gray-600">남은 일수:</span>
                    <span className="ml-2 font-medium">{warning.schengenDaysRemaining}일</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  기준 기간: ~{format(new Date(warning.rollingPeriodEnd), 'yyyy.MM.dd')}
                </div>
              </div>
            )}

            {/* 추천 사항 */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                권장 조치사항
              </h4>
              <ul className="space-y-2">
                {warning.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 상세 날짜 정보 */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm bg-white/50 rounded-lg p-3">
              <div>
                <span className="text-gray-600">입국일:</span>
                <span className="ml-2 font-medium">
                  {format(new Date(warning.entryDate), 'yyyy.MM.dd')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">권장 출국일:</span>
                <span className="ml-2 font-medium">
                  {format(new Date(warning.expectedExitDate), 'yyyy.MM.dd')}
                </span>
              </div>
              {warning.visaExpiryDate && (
                <div className="col-span-2">
                  <span className="text-gray-600">비자 만료일:</span>
                  <span className="ml-2 font-medium">
                    {format(new Date(warning.visaExpiryDate), 'yyyy.MM.dd')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            체류 경고 정보를 확인하는 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!warningData || warningData.summary.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            체류 기간 상태
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              현재 모든 비자의 체류 기간이 안전한 범위 내에 있습니다.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            체류 기간 경고
            <Badge variant="outline" className="ml-2">
              총 {warningData.summary.total}건
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {warningData.summary.critical > 0 && (
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {warningData.summary.critical}
                </div>
                <div className="text-sm text-red-700">긴급</div>
              </div>
            )}
            {warningData.summary.high > 0 && (
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">
                  {warningData.summary.high}
                </div>
                <div className="text-sm text-orange-700">높음</div>
              </div>
            )}
            {warningData.summary.medium > 0 && (
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {warningData.summary.medium}
                </div>
                <div className="text-sm text-yellow-700">보통</div>
              </div>
            )}
            {warningData.summary.low > 0 && (
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {warningData.summary.low}
                </div>
                <div className="text-sm text-blue-700">낮음</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 경고 목록 */}
      <div className="space-y-4">
        {/* 일반 비자 경고 */}
        {warningData.warnings
          .filter(w => !dismissedWarnings.has(w.id))
          .sort((a, b) => {
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
          })
          .map(warning => renderWarning(warning))}

        {/* 셰겐 경고 */}
        {warningData.schengenWarnings
          .filter(w => !dismissedWarnings.has(w.id))
          .map(warning => renderWarning(warning, true))}
      </div>
    </div>
  );
}
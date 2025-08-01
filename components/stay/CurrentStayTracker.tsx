'use client';

import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MapPin, Calendar, Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plane,
  TrendingUp,
  Bell,
  Plus,
  Edit,
  Loader2,
  RefreshCw } from 'lucide-react'
import { logger } from '@/lib/logger'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface CurrentStay {
  id: string;
  visaId: string;
  countryName: string;
  visaType: string;
  entryDate: string;
  daysInCountry: number;
  maxStayDays: number | null;
  remainingDays: number | null;
  visaExpiryDate: string;
  visaExpiresInDays: number;
  status: 'active' | 'warning' | 'critical' | 'exceeded';
  alerts: string[];
  recommendations: string[];
}

interface StayStats {
  totalCurrentStays: number;
  countriesStaying: string[];
  totalDaysThisYear: number;
  averageStayDuration: number;
  longestCurrentStay: number;
  criticalStays: number;
  warningStays: number;
}

interface CurrentStayTrackerProps {
  className?: string;
  onAddEntry?: () => void;
  onExitCountry?: (stayId: string) => void;
}

export function CurrentStayTracker({ 
  className, 
  onAddEntry, 
  onExitCountry 
}: CurrentStayTrackerProps) {
  const [currentStays, setCurrentStays] = useState<CurrentStay[]>([]);
  const [stats, setStats] = useState<StayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const loadStayData = async () => {
    if (!refreshing) setLoading(true);
    
    try {
      const response = await fetch('/api/stay-tracking');
      const result = await response.json();

      if (result.success) {
        setCurrentStays(result.data.currentStays);
        setStats(result.data.stats);
        setLastChecked(result.data.lastChecked);
      } else {
        throw new Error(result.error || 'Failed to load stay data');
      }
    } catch (error) {
      logger.error('Error loading stay data:', error);
      toast.error('체류 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStayData();
  };

  useEffect(() => {
    loadStayData();
    
    // 1시간마다 자동 새로고침
    const interval = setInterval(loadStayData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-red-600 bg-red-50 border-red-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning': return <Clock className="h-5 w-5 text-orange-600" />;
      default: return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'exceeded': return <Badge variant="destructive">초과</Badge>;
      case 'critical': return <Badge variant="destructive">긴급</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-orange-100 text-orange-800">주의</Badge>;
      default: return <Badge variant="outline" className="bg-green-50 text-green-800">안전</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>현재 체류 정보를 확인하는 중...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 및 통계 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              현재 체류 현황
              {stats && stats.criticalStays > 0 && (
                <Badge variant="destructive" className="ml-2">
                  긴급 {stats.criticalStays}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
              {onAddEntry && (
                <Button size="sm" onClick={onAddEntry}>
                  <Plus className="h-4 w-4 mr-1" />
                  입국 기록
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {stats && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalCurrentStays}</div>
                <div className="text-sm text-gray-600">현재 체류국</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalDaysThisYear}</div>
                <div className="text-sm text-gray-600">올해 총 체류일</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.averageStayDuration}</div>
                <div className="text-sm text-gray-600">평균 체류일</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.longestCurrentStay}</div>
                <div className="text-sm text-gray-600">최장 체류일</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 현재 체류 중인 국가들 */}
      {currentStays.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">현재 체류 중인 국가가 없습니다</h3>
            <p className="text-gray-600 mb-4">
              여행지에 도착하면 입국 기록을 추가하여 체류일을 추적하세요
            </p>
            {onAddEntry && (
              <Button onClick={onAddEntry}>
                <Plus className="h-4 w-4 mr-2" />
                첫 입국 기록 추가
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentStays.map((stay) => (
            <Card key={stay.id} className={`border-l-4 ${
              stay.status === 'exceeded' || stay.status === 'critical' 
                ? 'border-l-red-500' 
                : stay.status === 'warning'
                ? 'border-l-orange-500'
                : 'border-l-green-500'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(stay.status)}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {stay.countryName}
                        {getStatusBadge(stay.status)}
                      </h3>
                      <p className="text-sm text-gray-600">{stay.visaType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {stay.daysInCountry}일
                    </div>
                    <div className="text-xs text-gray-500">체류 중</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 진행률 바 */}
                {stay.maxStayDays && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>체류 진행률</span>
                      <span>
                        {stay.daysInCountry} / {stay.maxStayDays}일
                        {stay.remainingDays !== null && (
                          <span className={stay.remainingDays <= 7 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {' '}({stay.remainingDays >= 0 ? `${stay.remainingDays}일 남음` : `${Math.abs(stay.remainingDays)}일 초과`})
                          </span>
                        )}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((stay.daysInCountry / stay.maxStayDays) * 100, 100)}
                      className={`h-2 ${
                        stay.status === 'exceeded' || stay.status === 'critical'
                          ? '[&>div]:bg-red-500'
                          : stay.status === 'warning'
                          ? '[&>div]:bg-orange-500'
                          : '[&>div]:bg-green-500'
                      }`}
                    />
                  </div>
                )}

                {/* 상세 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">입국일</div>
                      <div className="text-gray-600">
                        {format(new Date(stay.entryDate), 'yyyy.MM.dd (E)', { locale: ko })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">비자 만료</div>
                      <div className={stay.visaExpiresInDays <= 7 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {format(new Date(stay.visaExpiryDate), 'yyyy.MM.dd')}
                        <span className="block">
                          ({stay.visaExpiresInDays >= 0 
                            ? `${stay.visaExpiresInDays}일 후` 
                            : `${Math.abs(stay.visaExpiresInDays)}일 전 만료`
                          })
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">상태</div>
                      <div className={
                        stay.status === 'exceeded' || stay.status === 'critical'
                          ? 'text-red-600 font-medium'
                          : stay.status === 'warning'
                          ? 'text-orange-600 font-medium'
                          : 'text-green-600'
                      }>
                        {stay.status === 'exceeded' ? '초과' : 
                         stay.status === 'critical' ? '긴급' :
                         stay.status === 'warning' ? '주의' : '안전'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 알림 및 권장사항 */}
                {stay.alerts.length > 0 && (
                  <div className="space-y-2">
                    {stay.alerts.map((alert, index) => (
                      <Alert 
                        key={index} 
                        variant={stay.status === 'exceeded' || stay.status === 'critical' ? "destructive" : "default"}
                        className="py-2"
                      >
                        <Bell className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {alert}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {stay.recommendations.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-800 mb-2">💡 권장사항</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      {stay.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onExitCountry?.(stay.id)}
                  >
                    <Plane className="h-4 w-4 mr-1" />
                    출국 기록
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    수정
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {lastChecked && (
        <div className="text-xs text-gray-500 text-center">
          마지막 업데이트: {format(new Date(lastChecked), 'yyyy.MM.dd HH:mm', { locale: ko })}
        </div>
      )}
    </div>
  );
}
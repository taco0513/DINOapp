'use client';

import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AlertTriangle, Clock, CheckCircle2,
  XCircle,
  Bell,
  BellRing,
  Loader2,
  RefreshCw,
  Calendar,
  MapPin } from 'lucide-react'
import { logger } from '@/lib/logger'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface VisaExpiryCheck {
  id: string;
  countryName: string;
  visaType: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: 'active' | 'expiring_soon' | 'expired';
  urgencyLevel: 'normal' | 'warning' | 'critical';
  alertMessage: string;
}

interface VisaExpiryStats {
  total: number;
  active: number;
  expiring_soon: number;
  expired: number;
  critical_alerts: number;
  warning_alerts: number;
}

interface VisaExpiryAlertsProps {
  className?: string;
  onVisaClick?: (visaId: string) => void;
}

export function VisaExpiryAlerts({ className, onVisaClick }: VisaExpiryAlertsProps) {
  const [visas, setVisas] = useState<VisaExpiryCheck[]>([]);
  const [stats, setStats] = useState<VisaExpiryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [sendingAlert, setSendingAlert] = useState<string | null>(null);

  const loadVisaExpiry = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/visas/check-expiry');
      const result = await response.json();

      if (result.success) {
        setVisas(result.data.visas);
        setStats(result.data.stats);
        setLastChecked(result.data.lastChecked);
      } else {
        throw new Error(result.error || 'Failed to load visa expiry data');
      }
    } catch (error) {
      logger.error('Error loading visa expiry:', error);
      toast.error('비자 만료 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const sendVisaAlert = async (visaId: string, force = false) => {
    setSendingAlert(visaId);
    try {
      const response = await fetch('/api/visas/check-expiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visaId,
          forceAlert: force
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.data.alertMessage);
        // 데이터 새로고침
        loadVisaExpiry();
      } else {
        toast.info(result.message || '알림 발송에 실패했습니다.');
      }
    } catch (error) {
      logger.error('Error sending visa alert:', error);
      toast.error('알림 발송 중 오류가 발생했습니다.');
    } finally {
      setSendingAlert(null);
    }
  };

  useEffect(() => {
    loadVisaExpiry();
    
    // 10분마다 자동 새로고침
    const interval = setInterval(loadVisaExpiry, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string, urgencyLevel: string) => {
    if (status === 'expired') {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    if (urgencyLevel === 'critical') {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
    if (urgencyLevel === 'warning') {
      return <Clock className="h-5 w-5 text-orange-600" />;
    }
    return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  };

  const getStatusBadge = (status: string, urgencyLevel: string) => {
    if (status === 'expired') {
      return <Badge variant="destructive">만료됨</Badge>;
    }
    if (urgencyLevel === 'critical') {
      return <Badge variant="destructive">긴급</Badge>;
    }
    if (urgencyLevel === 'warning') {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">주의</Badge>;
    }
    return <Badge variant="outline" className="bg-green-50 text-green-800">안전</Badge>;
  };

  const getAlertVariant = (urgencyLevel: string) => {
    if (urgencyLevel === 'critical') return 'destructive' as const;
    if (urgencyLevel === 'warning') return 'default' as const;
    return 'default' as const;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>비자 만료 정보를 확인하는 중...</span>
        </CardContent>
      </Card>
    );
  }

  if (!visas.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            비자 만료 알림
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">등록된 비자가 없습니다.</p>
            <p className="text-sm text-gray-500 mt-2">
              비자를 추가하면 만료 알림을 받을 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            비자 만료 알림
            {stats && stats.critical_alerts > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.critical_alerts}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadVisaExpiry}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">전체</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">안전</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.expiring_soon}</div>
              <div className="text-sm text-gray-600">만료예정</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-gray-600">만료됨</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 긴급 알림 */}
        {visas.filter(v => v.urgencyLevel === 'critical').map((visa) => (
          <Alert key={visa.id} variant={getAlertVariant(visa.urgencyLevel)}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{visa.alertMessage}</div>
                <div className="text-sm mt-1 opacity-90">
                  만료일: {format(new Date(visa.expiryDate), 'yyyy년 M월 d일', { locale: ko })}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendVisaAlert(visa.id)}
                disabled={sendingAlert === visa.id}
                className="ml-4"
              >
                {sendingAlert === visa.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </Button>
            </AlertDescription>
          </Alert>
        ))}

        {/* 일반 비자 목록 */}
        <div className="space-y-3">
          {visas.map((visa) => (
            <div
              key={visa.id}
              className={`p-4 rounded-lg border ${
                visa.urgencyLevel === 'critical' 
                  ? 'bg-red-50 border-red-200' 
                  : visa.urgencyLevel === 'warning'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-gray-50 border-gray-200'
              } cursor-pointer hover:shadow-sm transition-shadow`}
              onClick={() => onVisaClick?.(visa.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(visa.status, visa.urgencyLevel)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{visa.countryName}</span>
                      <span className="text-gray-600">- {visa.visaType}</span>
                      {getStatusBadge(visa.status, visa.urgencyLevel)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>만료: {format(new Date(visa.expiryDate), 'yyyy.MM.dd')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {visa.daysUntilExpiry >= 0 
                            ? `${visa.daysUntilExpiry}일 남음`
                            : `${Math.abs(visa.daysUntilExpiry)}일 전 만료됨`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      sendVisaAlert(visa.id);
                    }}
                    disabled={sendingAlert === visa.id}
                  >
                    {sendingAlert === visa.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {lastChecked && (
          <div className="text-xs text-gray-500 text-center pt-4 border-t">
            마지막 확인: {format(new Date(lastChecked), 'yyyy.MM.dd HH:mm', { locale: ko })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Smartphone, 
  Shield, 
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  Settings } from 'lucide-react'
import { logger } from '@/lib/logger'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { pushNotificationManager } from '@/lib/push-notifications';

interface NotificationPreferences {
  visaExpiry: boolean;
  overstayWarning: boolean;
  stayReminder: boolean;
  travelAlert: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
}

export function PushNotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    visaExpiry: true,
    overstayWarning: true,
    stayReminder: false,
    travelAlert: true,
    emailEnabled: true,
    pushEnabled: false
  });

  useEffect(() => {
    checkNotificationStatus();
    loadPreferences();
  }, []);

  const checkNotificationStatus = async () => {
    setLoading(true);
    try {
      // Check browser support
      const supported = pushNotificationManager.isSupported();
      setIsSupported(supported);

      if (supported) {
        // Check permission
        const perm = pushNotificationManager.getPermissionStatus();
        setPermission(perm);

        // Check subscription status
        const subscribed = await pushNotificationManager.isSubscribed();
        setIsSubscribed(subscribed);
      }
    } catch (error) {
      logger.error('Error checking notification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      const result = await response.json();
      
      if (result.success && result.data) {
        setPreferences({
          visaExpiry: result.data.visaExpiry !== false,
          overstayWarning: result.data.overstayWarning !== false,
          stayReminder: result.data.stayReminder === true,
          travelAlert: result.data.travelAlerts === true,
          emailEnabled: result.data.emailEnabled !== false,
          pushEnabled: result.data.pushEnabled === true
        });
      }
    } catch (error) {
      logger.error('Error loading preferences:', error);
    }
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const subscription = await pushNotificationManager.subscribe();
      
      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        setPreferences(prev => ({ ...prev, pushEnabled: true }));
        await savePreferences({ ...preferences, pushEnabled: true });
      }
    } catch (error) {
      logger.error('Error subscribing:', error);
      toast.error('푸시 알림 구독에 실패했습니다.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    setSubscribing(true);
    try {
      const success = await pushNotificationManager.unsubscribe();
      
      if (success) {
        setIsSubscribed(false);
        setPreferences(prev => ({ ...prev, pushEnabled: false }));
        await savePreferences({ ...preferences, pushEnabled: false });
      }
    } catch (error) {
      logger.error('Error unsubscribing:', error);
      toast.error('푸시 알림 해제에 실패했습니다.');
    } finally {
      setSubscribing(false);
    }
  };

  const savePreferences = async (prefs: NotificationPreferences) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          visaExpiry: prefs.visaExpiry,
          overstayWarning: prefs.overstayWarning,
          stayReminder: prefs.stayReminder,
          travelAlerts: prefs.travelAlert,
          emailEnabled: prefs.emailEnabled,
          pushEnabled: prefs.pushEnabled
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      toast.success('알림 설정이 저장되었습니다.');
    } catch (error) {
      logger.error('Error saving preferences:', error);
      toast.error('설정 저장에 실패했습니다.');
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  const testNotification = async () => {
    try {
      await pushNotificationManager.showLocalNotification(
        'DINO 테스트 알림', 
        {
          body: '푸시 알림이 정상적으로 작동합니다!',
          tag: 'test-notification',
          data: { type: 'test' }
        }
      );
    } catch (error) {
      logger.error('Error showing test notification:', error);
      toast.error('테스트 알림 표시에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 푸시 알림 상태 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            푸시 알림 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 브라우저 지원 상태 */}
          {!isSupported ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                이 브라우저는 푸시 알림을 지원하지 않습니다. 
                Chrome, Firefox, Safari 등 최신 브라우저를 사용해주세요.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* 현재 상태 표시 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Smartphone className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">브라우저 지원</p>
                  <Badge className="mt-1 bg-green-100 text-green-800">
                    지원됨
                  </Badge>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">권한 상태</p>
                  <Badge 
                    className={`mt-1 ${
                      permission === 'granted' 
                        ? 'bg-green-100 text-green-800' 
                        : permission === 'denied' 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {permission === 'granted' ? '허용됨' : 
                     permission === 'denied' ? '거부됨' : '대기중'}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bell className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">구독 상태</p>
                  <Badge 
                    className={`mt-1 ${
                      isSubscribed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {isSubscribed ? '구독중' : '미구독'}
                  </Badge>
                </div>
              </div>

              {/* 구독 버튼 */}
              <div className="flex flex-col items-center gap-4">
                {permission === 'denied' ? (
                  <Alert className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      브라우저 설정에서 이 사이트의 알림 권한을 허용해주세요.
                    </AlertDescription>
                  </Alert>
                ) : isSubscribed ? (
                  <>
                    <Button
                      onClick={handleUnsubscribe}
                      disabled={subscribing}
                      variant="outline"
                      className="w-full max-w-xs"
                    >
                      {subscribing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <BellOff className="h-4 w-4 mr-2" />
                      )}
                      푸시 알림 해제
                    </Button>
                    <Button
                      onClick={testNotification}
                      variant="outline"
                      size="sm"
                      className="w-full max-w-xs"
                    >
                      테스트 알림 보내기
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="w-full max-w-xs"
                  >
                    {subscribing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Bell className="h-4 w-4 mr-2" />
                    )}
                    푸시 알림 받기
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 알림 유형 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            알림 유형 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* 비자 만료 알림 */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="visa-expiry" className="text-base font-medium">
                  비자 만료 알림
                </Label>
                <p className="text-sm text-gray-500">
                  비자 만료일이 다가올 때 알림을 받습니다
                </p>
              </div>
              <Switch
                id="visa-expiry"
                checked={preferences.visaExpiry}
                onCheckedChange={(checked) => handlePreferenceChange('visaExpiry', checked)}
              />
            </div>

            {/* 체류 경고 알림 */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="overstay-warning" className="text-base font-medium">
                  체류 기간 경고
                </Label>
                <p className="text-sm text-gray-500">
                  체류 기간 초과 위험이 있을 때 알림을 받습니다
                </p>
              </div>
              <Switch
                id="overstay-warning"
                checked={preferences.overstayWarning}
                onCheckedChange={(checked) => handlePreferenceChange('overstayWarning', checked)}
              />
            </div>

            {/* 체류 기록 리마인더 */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="stay-reminder" className="text-base font-medium">
                  체류 기록 리마인더
                </Label>
                <p className="text-sm text-gray-500">
                  입출국 기록을 업데이트하도록 주기적으로 알림을 받습니다
                </p>
              </div>
              <Switch
                id="stay-reminder"
                checked={preferences.stayReminder}
                onCheckedChange={(checked) => handlePreferenceChange('stayReminder', checked)}
              />
            </div>

            {/* 여행 알림 */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="travel-alert" className="text-base font-medium">
                  여행 알림
                </Label>
                <p className="text-sm text-gray-500">
                  목적지 국가의 중요한 여행 정보를 받습니다
                </p>
              </div>
              <Switch
                id="travel-alert"
                checked={preferences.travelAlert}
                onCheckedChange={(checked) => handlePreferenceChange('travelAlert', checked)}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-enabled" className="text-base font-medium">
                  이메일 알림
                </Label>
                <p className="text-sm text-gray-500">
                  중요한 알림을 이메일로도 받습니다
                </p>
              </div>
              <Switch
                id="email-enabled"
                checked={preferences.emailEnabled}
                onCheckedChange={(checked) => handlePreferenceChange('emailEnabled', checked)}
              />
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              푸시 알림을 활성화하면 브라우저가 닫혀 있어도 중요한 알림을 받을 수 있습니다.
              알림 설정은 언제든지 변경할 수 있습니다.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
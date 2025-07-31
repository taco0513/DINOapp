'use client';

import { useState, useEffect } from 'react';
import {
  DEFAULT_PREFERENCES,
  requestNotificationPermission,
} from '@/lib/notifications';
import type { NotificationPreferences } from '@/types/notification';

interface NotificationSettingsProps {
  userId: string;
  onSave?: (preferences: NotificationPreferences) => void;
}

export default function NotificationSettings({
  userId,
  onSave,
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    userId,
    ...DEFAULT_PREFERENCES,
  });
  const [browserPermission, setBrowserPermission] =
    useState<NotificationPermission | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check browser notification permission
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }

    // Load saved preferences from localStorage
    const saved = localStorage.getItem(`notification-prefs-${userId}`);
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, [userId]);

  const _handleSave = async () => {
    setSaving(true);

    // Save to localStorage
    localStorage.setItem(
      `notification-prefs-${userId}`,
      JSON.stringify(preferences)
    );

    // Call onSave callback if provided
    if (onSave) {
      await onSave(preferences);
    }

    setSaving(false);
    // Settings saved successfully
  };

  const _handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setBrowserPermission(granted ? 'granted' : 'denied');
  };

  const _handleVisaExpiryDaysChange = (days: string) => {
    const daysArray = days
      .split(',')
      .map(d => parseInt(d.trim()))
      .filter(d => !isNaN(d));
    setPreferences(prev => ({
      ...prev,
      visaExpiryDays: daysArray,
    }));
  };

  const _handleTripReminderDaysChange = (days: string) => {
    const daysArray = days
      .split(',')
      .map(d => parseInt(d.trim()))
      .filter(d => !isNaN(d));
    setPreferences(prev => ({
      ...prev,
      tripReminderDays: daysArray,
    }));
  };

  return (
    <div className='space-y-6'>
      {/* 알림 채널 설정 */}
      <div className='card'>
        <h3 className='text-lg font-semibold mb-4'>알림 채널</h3>

        <div className='space-y-4'>
          <label className='flex items-center justify-between'>
            <div>
              <span className='font-medium'>이메일 알림</span>
              <p className='text-sm text-secondary'>
                중요한 알림을 이메일로 받습니다
              </p>
            </div>
            <input
              type='checkbox'
              checked={preferences.email}
              onChange={e =>
                setPreferences(prev => ({ ...prev, email: e.target.checked }))
              }
              className='w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary'
            />
          </label>

          <label className='flex items-center justify-between'>
            <div>
              <span className='font-medium'>브라우저 푸시 알림</span>
              <p className='text-sm text-secondary'>
                브라우저에서 실시간 알림을 받습니다
              </p>
            </div>
            <input
              type='checkbox'
              checked={preferences.push}
              onChange={e =>
                setPreferences(prev => ({ ...prev, push: e.target.checked }))
              }
              className='w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary'
            />
          </label>

          {preferences.push && browserPermission !== 'granted' && (
            <div className='alert alert-warning'>
              <p className='text-sm mb-2'>
                브라우저 알림을 받으려면 권한이 필요합니다.
              </p>
              <button
                onClick={handleRequestPermission}
                className='btn btn-primary text-sm'
              >
                알림 권한 요청
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 알림 타이밍 설정 */}
      <div className='card'>
        <h3 className='text-lg font-semibold mb-4'>알림 타이밍</h3>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>
              비자 만료 알림 (일 단위, 쉼표로 구분)
            </label>
            <input
              type='text'
              value={preferences.visaExpiryDays.join(', ')}
              onChange={e => handleVisaExpiryDaysChange(e.target.value)}
              placeholder='30, 7, 1'
              className='w-full px-3 py-2 border border-border-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
            />
            <p className='text-xs text-tertiary mt-1'>
              예: 30일 전, 7일 전, 1일 전
            </p>
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>
              셰겐 경고 기준 (일)
            </label>
            <input
              type='number'
              value={preferences.schengenWarningThreshold}
              onChange={e =>
                setPreferences(prev => ({
                  ...prev,
                  schengenWarningThreshold: parseInt(e.target.value) || 80,
                }))
              }
              min='1'
              max='90'
              className='w-full px-3 py-2 border border-border-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
            />
            <p className='text-xs text-tertiary mt-1'>
              셰겐 지역 체류일이 이 값을 넘으면 경고
            </p>
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>
              여행 알림 (일 단위, 쉼표로 구분)
            </label>
            <input
              type='text'
              value={preferences.tripReminderDays.join(', ')}
              onChange={e => handleTripReminderDaysChange(e.target.value)}
              placeholder='7, 1'
              className='w-full px-3 py-2 border border-border-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
            />
            <p className='text-xs text-tertiary mt-1'>예: 7일 전, 1일 전</p>
          </div>
        </div>
      </div>

      {/* 방해 금지 시간 설정 */}
      <div className='card'>
        <h3 className='text-lg font-semibold mb-4'>방해 금지 시간</h3>

        <div className='space-y-4'>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={preferences.quiet.enabled}
              onChange={e =>
                setPreferences(prev => ({
                  ...prev,
                  quiet: { ...prev.quiet, enabled: e.target.checked },
                }))
              }
              className='w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mr-3'
            />
            <span className='font-medium'>방해 금지 시간 사용</span>
          </label>

          {preferences.quiet.enabled && (
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  시작 시간
                </label>
                <input
                  type='time'
                  value={preferences.quiet.startTime}
                  onChange={e =>
                    setPreferences(prev => ({
                      ...prev,
                      quiet: { ...prev.quiet, startTime: e.target.value },
                    }))
                  }
                  className='w-full px-3 py-2 border border-border-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  종료 시간
                </label>
                <input
                  type='time'
                  value={preferences.quiet.endTime}
                  onChange={e =>
                    setPreferences(prev => ({
                      ...prev,
                      quiet: { ...prev.quiet, endTime: e.target.value },
                    }))
                  }
                  className='w-full px-3 py-2 border border-border-strong rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className='flex justify-end'>
        <button
          onClick={handleSave}
          disabled={saving}
          className='btn btn-primary'
        >
          {saving ? '저장 중...' : '설정 저장'}
        </button>
      </div>
    </div>
  );
}

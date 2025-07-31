'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader, PageIcons } from '@/components/common/PageHeader';
import {
  StandardPageLayout,
  StandardCard,
} from '@/components/layout/StandardPageLayout';

// 인라인 알림 목록 컴포넌트
function WireframeNotificationList({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const _loadNotifications = () => {
    setLoading(true);

    // Load from localStorage (in real app, this would be an API call)
    const stored = localStorage.getItem(`notifications-${userId}`);
    if (stored) {
      const allNotifications = JSON.parse(stored);
      setNotifications(
        allNotifications.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } else {
      // Demo notifications
      const demoNotifications = [
        {
          id: '1',
          userId,
          type: 'schengen_warning',
          title: '셰겐 체류 한도 접근',
          message: '현재 82/90일을 사용했습니다. 남은 일수: 8일',
          priority: 'high',
          read: false,
          actionUrl: '/schengen',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          id: '2',
          userId,
          type: 'visa_expiry',
          title: '비자 만료 7일 전',
          message: '프랑스 Tourist 비자가 2025-08-02에 만료됩니다.',
          priority: 'high',
          read: false,
          actionUrl: '/trips',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          id: '3',
          userId,
          type: 'trip_reminder',
          title: '여행 7일 전',
          message: '일본 여행이 2025-08-01에 시작됩니다.',
          priority: 'medium',
          read: true,
          actionUrl: '/trips',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
      ];
      setNotifications(demoNotifications);
      localStorage.setItem(
        `notifications-${userId}`,
        JSON.stringify(demoNotifications)
      );
    }

    setLoading(false);
  };

  const _markAsRead = (notificationId: string) => {
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(`notifications-${userId}`, JSON.stringify(updated));
  };

  const _markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(`notifications-${userId}`, JSON.stringify(updated));
  };

  const _deleteNotification = (notificationId: string) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    setNotifications(updated);
    localStorage.setItem(`notifications-${userId}`, JSON.stringify(updated));
  };

  const _filteredNotifications =
    filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const _getNotificationIcon = (type: string) => {
    switch (type) {
      case 'schengen_warning':
        return '⚠️';
      case 'visa_expiry':
        return '📄';
      case 'trip_reminder':
        return '✈️';
      default:
        return 'ℹ️';
    }
  };

  const _formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return '방금 전';
  };

  if (loading) {
    return (
      <div className='text-center py-10'>
        <p className='text-gray-600'>알림을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center gap-6'>
          <h3 className='text-lg font-bold text-gray-900'>
            알림
            {unreadCount > 0 && (
              <span className='ml-2 px-2 py-1 text-xs bg-red-600 text-white rounded-full'>
                {unreadCount}
              </span>
            )}
          </h3>

          {/* Filter */}
          <div className='flex gap-2'>
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size='sm'
            >
              전체
            </Button>
            <Button
              onClick={() => setFilter('unread')}
              variant={filter === 'unread' ? 'default' : 'outline'}
              size='sm'
            >
              읽지 않음
            </Button>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant='ghost' size='sm'>
            모두 읽음으로 표시
          </Button>
        )}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <div className='text-center py-10 text-gray-600'>
          {filter === 'unread'
            ? '읽지 않은 알림이 없습니다'
            : '알림이 없습니다'}
        </div>
      ) : (
        <div className='space-y-3'>
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`p-5 border border-gray-200 rounded-lg ${
                notification.read ? 'bg-white' : 'bg-blue-50'
              }`}
            >
              <div className='flex items-start gap-4'>
                <span className='text-2xl flex-shrink-0'>
                  {getNotificationIcon(notification.type)}
                </span>

                <div className='flex-1 min-w-0'>
                  <div className='flex justify-between items-start gap-3'>
                    <div className='flex-1'>
                      <h4
                        className={`font-medium mb-1 ${
                          notification.priority === 'high'
                            ? 'text-red-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <p className='text-sm text-gray-600 mb-1'>
                        {notification.message}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {formatTime(new Date(notification.createdAt))}
                      </p>
                    </div>

                    <Button
                      onClick={() => deleteNotification(notification.id)}
                      variant='ghost'
                      size='sm'
                      title='삭제'
                    >
                      ×
                    </Button>
                  </div>

                  <div className='flex items-center gap-4 mt-4'>
                    {notification.actionUrl && (
                      <Link
                        href={notification.actionUrl}
                        onClick={() => markAsRead(notification.id)}
                        className='text-sm text-blue-600 hover:text-blue-800 no-underline'
                      >
                        자세히 보기 →
                      </Link>
                    )}

                    {!notification.read && (
                      <Button
                        onClick={() => markAsRead(notification.id)}
                        variant='ghost'
                        size='sm'
                      >
                        읽음으로 표시
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 인라인 알림 설정 컴포넌트
function WireframeNotificationSettings({
  userId,
  onSave,
}: {
  userId: string;
  onSave?: (prefs: any) => void;
}) {
  const [preferences, setPreferences] = useState({
    userId,
    email: true,
    push: false,
    visaExpiryDays: [30, 7, 1],
    schengenWarningThreshold: 80,
    tripReminderDays: [7, 1],
    quiet: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  });
  const [browserPermission, setBrowserPermission] = useState<string | null>(
    null
  );
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
    alert('알림 설정이 저장되었습니다.');
  };

  const _handleRequestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* 알림 채널 설정 */}
      <div className='bg-white border border-gray-200 rounded-lg p-8'>
        <h3 className='text-lg font-bold mb-6 text-gray-900'>알림 채널</h3>

        <div className='space-y-6'>
          <label className='flex justify-between items-center'>
            <div>
              <span className='font-medium block mb-1'>이메일 알림</span>
              <p className='text-sm text-gray-600'>
                중요한 알림을 이메일로 받습니다
              </p>
            </div>
            <input
              type='checkbox'
              checked={preferences.email}
              onChange={e =>
                setPreferences(prev => ({ ...prev, email: e.target.checked }))
              }
              className='w-5 h-5'
            />
          </label>

          <label className='flex justify-between items-center'>
            <div>
              <span className='font-medium block mb-1'>브라우저 푸시 알림</span>
              <p className='text-sm text-gray-600'>
                브라우저에서 실시간 알림을 받습니다
              </p>
            </div>
            <input
              type='checkbox'
              checked={preferences.push}
              onChange={e =>
                setPreferences(prev => ({ ...prev, push: e.target.checked }))
              }
              className='w-5 h-5'
            />
          </label>

          {preferences.push && browserPermission !== 'granted' && (
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-5'>
              <p className='text-sm text-yellow-800 mb-3'>
                브라우저 알림을 받으려면 권한이 필요합니다.
              </p>
              <Button onClick={handleRequestPermission} size='sm'>
                알림 권한 요청
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 알림 타이밍 설정 */}
      <div className='bg-white border border-gray-200 rounded-lg p-8'>
        <h3 className='text-lg font-bold mb-6 text-gray-900'>알림 타이밍</h3>

        <div className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              비자 만료 알림 (일 단위, 쉼표로 구분)
            </label>
            <input
              type='text'
              value={preferences.visaExpiryDays.join(', ')}
              onChange={e => {
                const days = e.target.value
                  .split(',')
                  .map(d => parseInt(d.trim()))
                  .filter(d => !isNaN(d));
                setPreferences(prev => ({ ...prev, visaExpiryDays: days }));
              }}
              placeholder='30, 7, 1'
              className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            <p className='text-xs text-gray-500 mt-1'>
              예: 30일 전, 7일 전, 1일 전
            </p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
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
              className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            <p className='text-xs text-gray-500 mt-1'>
              셰겐 지역 체류일이 이 값을 넘으면 경고
            </p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              여행 알림 (일 단위, 쉼표로 구분)
            </label>
            <input
              type='text'
              value={preferences.tripReminderDays.join(', ')}
              onChange={e => {
                const days = e.target.value
                  .split(',')
                  .map(d => parseInt(d.trim()))
                  .filter(d => !isNaN(d));
                setPreferences(prev => ({ ...prev, tripReminderDays: days }));
              }}
              placeholder='7, 1'
              className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            <p className='text-xs text-gray-500 mt-1'>예: 7일 전, 1일 전</p>
          </div>
        </div>
      </div>

      {/* 방해 금지 시간 설정 */}
      <div className='bg-white border border-gray-200 rounded-lg p-8'>
        <h3 className='text-lg font-bold mb-6 text-gray-900'>방해 금지 시간</h3>

        <div className='space-y-6'>
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
              className='w-5 h-5 mr-3'
            />
            <span className='font-medium'>방해 금지 시간 사용</span>
          </label>

          {preferences.quiet.enabled && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className='flex justify-end'>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '설정 저장'}
        </Button>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  const _handleSaveSettings = async (preferences: any) => {
    // Saving notification preferences
    localStorage.setItem(
      `notification-prefs-${session?.user?.email}`,
      JSON.stringify(preferences)
    );
  };

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='text-sm text-gray-600'>로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <StandardPageLayout
      title='알림 센터'
      description='알림을 확인하고 설정을 관리하세요'
      icon={PageIcons.Bell}
      breadcrumbs={[
        { label: '대시보드', href: '/dashboard' },
        { label: '알림 센터' },
      ]}
    >
      {/* Tab Navigation */}
      <div className='flex gap-2 mb-8'>
        <Button
          onClick={() => setActiveTab('list')}
          variant={activeTab === 'list' ? 'default' : 'outline'}
        >
          알림 목록
        </Button>
        <Button
          onClick={() => setActiveTab('settings')}
          variant={activeTab === 'settings' ? 'default' : 'outline'}
        >
          알림 설정
        </Button>
      </div>

      {/* Tab Content */}
      <StandardCard>
        {activeTab === 'list' ? (
          <WireframeNotificationList userId={session.user?.email || ''} />
        ) : (
          <WireframeNotificationSettings
            userId={session.user?.email || ''}
            onSave={handleSaveSettings}
          />
        )}
      </StandardCard>

      {/* Help Section */}
      <StandardCard title='💡 알림 도움말' className='mt-8 bg-gray-50'>
        <div className='space-y-2 text-sm text-gray-600'>
          <p>
            • <strong>비자 만료 알림</strong>: 설정한 일수 전에 미리
            알려드립니다
          </p>
          <p>
            • <strong>셰겐 경고</strong>: 90/180일 규칙 위반 위험이 있을 때
            경고합니다
          </p>
          <p>
            • <strong>여행 알림</strong>: 예정된 여행 일정을 미리 알려드립니다
          </p>
          <p>
            • <strong>방해 금지 시간</strong>: 설정한 시간대에는 푸시 알림이
            전송되지 않습니다
          </p>
        </div>
      </StandardCard>
    </StandardPageLayout>
  );
}

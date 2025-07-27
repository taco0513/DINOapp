'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// 인라인 알림 목록 컴포넌트
function WireframeNotificationList({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    loadNotifications()
  }, [userId])

  const loadNotifications = () => {
    setLoading(true)
    
    // Load from localStorage (in real app, this would be an API call)
    const stored = localStorage.getItem(`notifications-${userId}`)
    if (stored) {
      const allNotifications = JSON.parse(stored)
      setNotifications(allNotifications.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
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
        }
      ]
      setNotifications(demoNotifications)
      localStorage.setItem(`notifications-${userId}`, JSON.stringify(demoNotifications))
    }
    
    setLoading(false)
  }

  const markAsRead = (notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
    setNotifications(updated)
    localStorage.setItem(`notifications-${userId}`, JSON.stringify(updated))
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem(`notifications-${userId}`, JSON.stringify(updated))
  }

  const deleteNotification = (notificationId: string) => {
    const updated = notifications.filter(n => n.id !== notificationId)
    setNotifications(updated)
    localStorage.setItem(`notifications-${userId}`, JSON.stringify(updated))
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'schengen_warning': return '⚠️'
      case 'visa_expiry': return '📄'
      case 'trip_reminder': return '✈️'
      default: return 'ℹ️'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}일 전`
    if (hours > 0) return `${hours}시간 전`
    return '방금 전'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#666' }}>알림을 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
            알림
            {unreadCount > 0 && (
              <span style={{ 
                marginLeft: '8px', 
                padding: '4px 8px', 
                fontSize: '11px', 
                backgroundColor: '#cc0000', 
                color: '#fff',
                borderRadius: '12px'
              }}>
                {unreadCount}
              </span>
            )}
          </h3>
          
          {/* Filter */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                backgroundColor: filter === 'all' ? '#0066cc' : '#f0f0f0',
                color: filter === 'all' ? '#fff' : '#666',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                backgroundColor: filter === 'unread' ? '#0066cc' : '#f0f0f0',
                color: filter === 'unread' ? '#fff' : '#666',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              읽지 않음
            </button>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              fontSize: '13px',
              color: '#0066cc',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            모두 읽음으로 표시
          </button>
        )}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {filter === 'unread' ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              style={{
                padding: '20px',
                border: '1px solid #e0e0e0',
                backgroundColor: notification.read ? '#fff' : '#f0f8ff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>
                  {getNotificationIcon(notification.type)}
                </span>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontWeight: '500', 
                        color: notification.priority === 'high' ? '#cc0000' : '#000',
                        marginBottom: '5px'
                      }}>
                        {notification.title}
                      </h4>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                        {notification.message}
                      </p>
                      <p style={{ fontSize: '12px', color: '#999' }}>
                        {formatTime(new Date(notification.createdAt))}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      style={{
                        color: '#999',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                      title="삭제"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
                    {notification.actionUrl && (
                      <Link
                        href={notification.actionUrl}
                        onClick={() => markAsRead(notification.id)}
                        style={{
                          fontSize: '13px',
                          color: '#0066cc',
                          textDecoration: 'none'
                        }}
                      >
                        자세히 보기 →
                      </Link>
                    )}
                    
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        style={{
                          fontSize: '13px',
                          color: '#666',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        읽음으로 표시
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 인라인 알림 설정 컴포넌트
function WireframeNotificationSettings({ userId, onSave }: { userId: string, onSave?: (prefs: any) => void }) {
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
      endTime: '08:00'
    }
  })
  const [browserPermission, setBrowserPermission] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Check browser notification permission
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission)
    }

    // Load saved preferences from localStorage
    const saved = localStorage.getItem(`notification-prefs-${userId}`)
    if (saved) {
      setPreferences(JSON.parse(saved))
    }
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    
    // Save to localStorage
    localStorage.setItem(`notification-prefs-${userId}`, JSON.stringify(preferences))
    
    // Call onSave callback if provided
    if (onSave) {
      await onSave(preferences)
    }
    
    setSaving(false)
    alert('알림 설정이 저장되었습니다.')
  }

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setBrowserPermission(permission)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* 알림 채널 설정 */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', padding: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>알림 채널</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>이메일 알림</span>
              <p style={{ fontSize: '14px', color: '#666' }}>중요한 알림을 이메일로 받습니다</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.email}
              onChange={(e) => setPreferences(prev => ({ ...prev, email: e.target.checked }))}
              style={{ width: '20px', height: '20px' }}
            />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>브라우저 푸시 알림</span>
              <p style={{ fontSize: '14px', color: '#666' }}>브라우저에서 실시간 알림을 받습니다</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.push}
              onChange={(e) => setPreferences(prev => ({ ...prev, push: e.target.checked }))}
              style={{ width: '20px', height: '20px' }}
            />
          </label>

          {preferences.push && browserPermission !== 'granted' && (
            <div style={{ backgroundColor: '#fffbf0', border: '1px solid #e0e0e0', padding: '20px' }}>
              <p style={{ fontSize: '14px', color: '#cc9900', marginBottom: '10px' }}>
                브라우저 알림을 받으려면 권한이 필요합니다.
              </p>
              <button
                onClick={handleRequestPermission}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#cc9900',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                알림 권한 요청
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 알림 타이밍 설정 */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', padding: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>알림 타이밍</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
              비자 만료 알림 (일 단위, 쉼표로 구분)
            </label>
            <input
              type="text"
              value={preferences.visaExpiryDays.join(', ')}
              onChange={(e) => {
                const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d))
                setPreferences(prev => ({ ...prev, visaExpiryDays: days }))
              }}
              placeholder="30, 7, 1"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e0e0e0',
                fontSize: '14px'
              }}
            />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>예: 30일 전, 7일 전, 1일 전</p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
              셰겐 경고 기준 (일)
            </label>
            <input
              type="number"
              value={preferences.schengenWarningThreshold}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                schengenWarningThreshold: parseInt(e.target.value) || 80 
              }))}
              min="1"
              max="90"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e0e0e0',
                fontSize: '14px'
              }}
            />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>셰겐 지역 체류일이 이 값을 넘으면 경고</p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
              여행 알림 (일 단위, 쉼표로 구분)
            </label>
            <input
              type="text"
              value={preferences.tripReminderDays.join(', ')}
              onChange={(e) => {
                const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d))
                setPreferences(prev => ({ ...prev, tripReminderDays: days }))
              }}
              placeholder="7, 1"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e0e0e0',
                fontSize: '14px'
              }}
            />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>예: 7일 전, 1일 전</p>
          </div>
        </div>
      </div>

      {/* 방해 금지 시간 설정 */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', padding: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>방해 금지 시간</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={preferences.quiet.enabled}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                quiet: { ...prev.quiet, enabled: e.target.checked }
              }))}
              style={{ width: '20px', height: '20px', marginRight: '12px' }}
            />
            <span style={{ fontWeight: '500' }}>방해 금지 시간 사용</span>
          </label>

          {preferences.quiet.enabled && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px' 
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
                  시작 시간
                </label>
                <input
                  type="time"
                  value={preferences.quiet.startTime}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    quiet: { ...prev.quiet, startTime: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
                  종료 시간
                </label>
                <input
                  type="time"
                  value={preferences.quiet.endTime}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    quiet: { ...prev.quiet, endTime: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 저장 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 24px',
            backgroundColor: '#0066cc',
            color: '#fff',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? '저장 중...' : '설정 저장'}
        </button>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  const handleSaveSettings = async (preferences: any) => {
    // Saving notification preferences
    localStorage.setItem(`notification-prefs-${session?.user?.email}`, JSON.stringify(preferences))
  }

  if (status === 'loading') {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>로딩 중...</div>
        </div>
      </main>
    )
  }

  if (!session) {
    return null
  }

  return (
    <main style={{ 
      minHeight: '100vh', 
      padding: '20px',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>
            알림 센터
          </h1>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
            알림을 확인하고 설정을 관리하세요
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '5px', marginBottom: '30px' }}>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: activeTab === 'list' ? '#0066cc' : '#f0f0f0',
              color: activeTab === 'list' ? '#fff' : '#666',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            알림 목록
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: activeTab === 'settings' ? '#0066cc' : '#f0f0f0',
              color: activeTab === 'settings' ? '#fff' : '#666',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            알림 설정
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', padding: '30px' }}>
          {activeTab === 'list' ? (
            <WireframeNotificationList userId={session.user?.email || ''} />
          ) : (
            <WireframeNotificationSettings 
              userId={session.user?.email || ''}
              onSave={handleSaveSettings}
            />
          )}
        </div>

        {/* Help Section */}
        <div style={{ marginTop: '40px', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', padding: '30px' }}>
          <h3 style={{ fontWeight: 'bold', color: '#000', marginBottom: '15px' }}>💡 알림 도움말</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#333' }}>
            <p>• <strong>비자 만료 알림</strong>: 설정한 일수 전에 미리 알려드립니다</p>
            <p>• <strong>셰겐 경고</strong>: 90/180일 규칙 위반 위험이 있을 때 경고합니다</p>
            <p>• <strong>여행 알림</strong>: 예정된 여행 일정을 미리 알려드립니다</p>
            <p>• <strong>방해 금지 시간</strong>: 설정한 시간대에는 푸시 알림이 전송되지 않습니다</p>
          </div>
        </div>
      </div>
    </main>
  )
}
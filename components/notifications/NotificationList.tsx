'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatNotification } from '@/lib/notifications'
import type { Notification } from '@/types/notification'

interface NotificationListProps {
  userId: string
  limit?: number
  showMarkAllRead?: boolean
}

export default function NotificationList({ 
  userId, 
  limit, 
  showMarkAllRead = true 
}: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
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
      const allNotifications = JSON.parse(stored) as Notification[]
      setNotifications(allNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } else {
      // Demo notifications
      const demoNotifications: Notification[] = [
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
          metadata: {
            usedDays: 82,
            remainingDays: 8
          }
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
          metadata: {
            country: 'France',
            visaType: 'Tourist',
            expiryDate: '2025-08-02'
          }
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
          metadata: {
            country: 'Japan',
            entryDate: '2025-08-01'
          }
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

  const displayNotifications = limit 
    ? filteredNotifications.slice(0, limit)
    : filteredNotifications

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-secondary">알림을 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">
            알림
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-error text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          
          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`btn btn-sm ${
                filter === 'all' 
                  ? 'btn-primary' 
                  : 'btn-ghost'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`btn btn-sm ${
                filter === 'unread' 
                  ? 'btn-primary' 
                  : 'btn-ghost'
              }`}
            >
              읽지 않음
            </button>
          </div>
        </div>

        {showMarkAllRead && unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary hover:opacity-70"
          >
            모두 읽음으로 표시
          </button>
        )}
      </div>

      {/* Notification List */}
      {displayNotifications.length === 0 ? (
        <div className="text-center py-8 text-secondary">
          {filter === 'unread' ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}
        </div>
      ) : (
        <div className="space-y-2">
          {displayNotifications.map(notification => {
            const { icon, color, formattedTime } = formatNotification(notification)
            
            return (
              <div
                key={notification.id}
                className={`card transition-colors ${
                  notification.read 
                    ? '' 
                    : 'alert'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={`font-medium ${color}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-secondary mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-tertiary mt-1">
                          {formattedTime}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-secondary hover:text-primary"
                        title="삭제"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-3">
                      {notification.actionUrl && (
                        <Link
                          href={notification.actionUrl as any}
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-primary hover:opacity-70"
                        >
                          자세히 보기 →
                        </Link>
                      )}
                      
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-secondary hover:text-primary"
                        >
                          읽음으로 표시
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* View All Link */}
      {limit && notifications.length > limit && (
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            모든 알림 보기 ({notifications.length})
          </Link>
        </div>
      )}
    </div>
  )
}
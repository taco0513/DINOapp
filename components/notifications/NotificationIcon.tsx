'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Notification } from '@/types/notification'
import { t } from '@/lib/i18n'

interface NotificationIconProps {
  userId: string
  className?: string
}

export default function NotificationIcon({ userId, className = '' }: NotificationIconProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    loadNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'same-origin'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const notifications = data.data.notifications as Notification[]
          const unread = notifications.filter(n => !n.read)
          setUnreadCount(unread.length)
          setRecentNotifications(unread.slice(0, 3)) // Show only 3 most recent
        }
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ notificationId })
      })
      
      if (response.ok) {
        // Reload notifications to update the count
        loadNotifications()
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-5 5v-5zM5 12V7a4 4 0 118 0v5l1 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4l1-1z" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{t('notifications.title')}</h3>
              <Link
                href="/"
                onClick={() => setShowDropdown(false)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('notifications.view_all')}
              </Link>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {t('notifications.empty')}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map(notification => {
                  const priorityColors = {
                    low: 'text-gray-600',
                    medium: 'text-blue-600',
                    high: 'text-orange-600',
                    critical: 'text-red-600'
                  }

                  const typeIcons = {
                    visa_expiry: '📅',
                    schengen_warning: '⚠️',
                    trip_reminder: '✈️',
                    system: '📢'
                  }

                  return (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        markAsRead(notification.id)
                        setShowDropdown(false)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">
                          {typeIcons[notification.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${priorityColors[notification.priority]}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {recentNotifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <Link
                href="/"
                onClick={() => setShowDropdown(false)}
                className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2"
              >
                {t('notifications.view_all')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
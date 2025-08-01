import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

// TODO: Remove unused logger import

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // 브라우저 알림 지원 확인
    setIsSupported('Notification' in window)
    
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // 알림 권한 요청
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('이 브라우저는 알림을 지원하지 않습니다')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        toast.success('알림이 활성화되었습니다!')
        return true
      } else {
        toast.error('알림 권한이 거부되었습니다')
        return false
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error)
      return false
    }
  }, [isSupported])

  // 알림 표시
  const showNotification = useCallback((options: NotificationOptions) => {
    if (permission !== 'granted') {
      toast(options.body, {
        description: options.title,
      })
      return
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192x192.png',
        badge: options.badge || '/icon-192x192.png',
        tag: options.tag,
        data: options.data,
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
        
        // 클릭 시 관련 페이지로 이동
        if (options.data?.tripId) {
          window.location.href = `/trips/${options.data.tripId}`
        }
      }

      return notification
    } catch (error) {
      // 폴백: toast 알림 사용
      toast(options.body, {
        description: options.title,
      })
      return null
    }
  }, [permission])

  // 비자 알림 스케줄러
  const scheduleVisaAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/visa-alerts')
      const alerts = await response.json()
      
      alerts.forEach((alert: any) => {
        showNotification({
          title: alert.title,
          body: alert.body,
          tag: `visa-alert-${alert.tripId}`,
          data: alert.data
        })
      })
    } catch (error) {
      console.error('비자 알림 확인 실패:', error)
    }
  }, [showNotification])

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    scheduleVisaAlerts
  }
}
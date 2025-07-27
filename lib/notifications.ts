import { addDays, differenceInDays, startOfDay } from 'date-fns'
import type { CountryVisit, SchengenStatus } from '@/types/global'
import type { Notification, NotificationPreferences } from '@/types/notification'

// Default notification preferences
export const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'userId'> = {
  email: true,
  push: true,
  visaExpiryDays: [30, 7, 1],
  schengenWarningThreshold: 80,
  tripReminderDays: [7, 1],
  timezone: 'Asia/Seoul',
  quiet: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00'
  }
}

// Check if current time is within quiet hours
export function isQuietHours(preferences: NotificationPreferences): boolean {
  if (!preferences.quiet.enabled) return false

  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  
  const { startTime, endTime } = preferences.quiet
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime
  }
  
  return currentTime >= startTime && currentTime <= endTime
}

// Generate notifications for visa expiry
export function checkVisaExpiry(
  visits: CountryVisit[],
  preferences: NotificationPreferences
): Partial<Notification>[] {
  const notifications: Partial<Notification>[] = []
  const today = startOfDay(new Date())

  for (const visit of visits) {
    if (!visit.exitDate) continue // Skip ongoing trips

    const exitDate = new Date(visit.exitDate)
    const entryDate = new Date(visit.entryDate)
    const visaExpiryDate = addDays(entryDate, visit.maxDays - 1) // maxDays includes entry day
    const daysUntilExpiry = differenceInDays(visaExpiryDate, today)

    // Check if we should notify for this expiry
    for (const notifyDays of preferences.visaExpiryDays) {
      if (daysUntilExpiry === notifyDays) {
        const priority = notifyDays <= 1 ? 'critical' : notifyDays <= 7 ? 'high' : 'medium'
        
        notifications.push({
          type: 'visa_expiry',
          title: `비자 만료 ${notifyDays}일 전`,
          message: `${visit.country} ${visit.visaType} 비자가 ${visaExpiryDate.toLocaleDateString('ko-KR')}에 만료됩니다.`,
          priority,
          actionUrl: `/trips/${visit.id}`,
          metadata: {
            tripId: visit.id,
            country: visit.country,
            visaType: visit.visaType,
            expiryDate: visaExpiryDate.toISOString()
          }
        })
      }
    }
  }

  return notifications
}

// Generate notifications for Schengen warnings
export function checkSchengenWarnings(
  schengenStatus: SchengenStatus,
  preferences: NotificationPreferences
): Partial<Notification>[] {
  const notifications: Partial<Notification>[] = []

  // Check if approaching Schengen limit
  if (schengenStatus.usedDays >= preferences.schengenWarningThreshold) {
    const priority = schengenStatus.usedDays >= 85 ? 'critical' : 'high'
    
    notifications.push({
      type: 'schengen_warning',
      title: '셰겐 체류 한도 접근',
      message: `현재 ${schengenStatus.usedDays}/90일을 사용했습니다. 남은 일수: ${schengenStatus.remainingDays}일`,
      priority,
      actionUrl: '/schengen',
      metadata: {
        usedDays: schengenStatus.usedDays,
        remainingDays: schengenStatus.remainingDays,
        nextResetDate: schengenStatus.nextResetDate
      }
    })
  }

  // Check for violations
  if (!schengenStatus.isCompliant) {
    notifications.push({
      type: 'schengen_warning',
      title: '⚠️ 셰겐 규정 위반',
      message: '90/180일 규칙을 초과했습니다. 즉시 확인이 필요합니다.',
      priority: 'critical',
      actionUrl: '/schengen',
      metadata: {
        violations: schengenStatus.violations
      }
    })
  }

  return notifications
}

// Generate notifications for upcoming trips
export function checkUpcomingTrips(
  visits: CountryVisit[],
  preferences: NotificationPreferences
): Partial<Notification>[] {
  const notifications: Partial<Notification>[] = []
  const today = startOfDay(new Date())

  for (const visit of visits) {
    const entryDate = new Date(visit.entryDate)
    const daysUntilTrip = differenceInDays(entryDate, today)

    // Only check future trips
    if (daysUntilTrip <= 0) continue

    // Check if we should notify for this trip
    for (const notifyDays of preferences.tripReminderDays) {
      if (daysUntilTrip === notifyDays) {
        notifications.push({
          type: 'trip_reminder',
          title: `여행 ${notifyDays}일 전`,
          message: `${visit.country} 여행이 ${entryDate.toLocaleDateString('ko-KR')}에 시작됩니다.`,
          priority: 'medium',
          actionUrl: `/trips/${visit.id}`,
          metadata: {
            tripId: visit.id,
            country: visit.country,
            entryDate: visit.entryDate
          }
        })
      }
    }
  }

  return notifications
}

// Format notification for display
export function formatNotification(notification: Notification): {
  icon: string
  color: string
  formattedTime: string
} {
  const icons = {
    visa_expiry: '📅',
    schengen_warning: '⚠️',
    trip_reminder: '✈️',
    system: '📢'
  }

  const colors = {
    low: 'text-gray-600',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    critical: 'text-red-600'
  }

  const now = new Date()
  const notificationDate = new Date(notification.createdAt)
  const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60))
  
  let formattedTime: string
  if (diffInMinutes < 1) {
    formattedTime = '방금 전'
  } else if (diffInMinutes < 60) {
    formattedTime = `${diffInMinutes}분 전`
  } else if (diffInMinutes < 1440) {
    formattedTime = `${Math.floor(diffInMinutes / 60)}시간 전`
  } else {
    formattedTime = notificationDate.toLocaleDateString('ko-KR')
  }

  return {
    icon: icons[notification.type],
    color: colors[notification.priority],
    formattedTime
  }
}

// Browser notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    // This browser does not support notifications
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// Show browser notification
export function showBrowserNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  new Notification(title, {
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    ...options
  })
}
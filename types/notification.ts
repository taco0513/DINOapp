export interface Notification {

  id: string
  userId: string
  type: 'visa_expiry' | 'schengen_warning' | 'trip_reminder' | 'system'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
  actionUrl?: string
  metadata?: Record<string, any>
  createdAt: Date
  scheduledFor?: Date
  sentAt?: Date
}

export interface NotificationPreferences {
  userId: string
  email: boolean
  push: boolean
  visaExpiryDays: number[] // e.g., [30, 7, 1]
  schengenWarningThreshold: number // e.g., 80 (days)
  tripReminderDays: number[] // e.g., [7, 1]
  emailAddress?: string
  timezone: string
  quiet: {
    enabled: boolean
    startTime: string // e.g., "22:00"
    endTime: string // e.g., "08:00"
  }
}

export interface NotificationSchedule {
  id: string
  userId: string
  notificationType: Notification['type']
  relatedId: string // tripId, visaId, etc.
  scheduledDate: Date
  processed: boolean
  processedAt?: Date
  error?: string
}
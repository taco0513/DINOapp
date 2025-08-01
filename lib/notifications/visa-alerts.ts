// Visa Alerts System
// 비자 만료 알림 시스템

import { prisma } from '@/lib/prisma'
import { alertManager, systemAlert } from '@/lib/notifications/alert-manager'
import { visaEmailService } from '@/lib/email/visa-email-service'
import { addDays, differenceInDays } from 'date-fns'

// Legacy interfaces for backward compatibility
export interface VisaAlert {
  id: string
  userId: string
  tripId: string
  countryCode: string
  expiryDate: Date
  alertDays: number[] // [30, 14, 7, 3, 1] 만료 전 알림 일수
  lastAlertSent?: Date
  alertType: 'VISA_EXPIRY' | 'SCHENGEN_LIMIT' | 'ENTRY_REMINDER'
}

// New interfaces for enhanced functionality
interface Visa {
  id: string
  userId: string
  countryName: string
  type?: string
  duration?: number
  expiryDate: Date
  status: string
  renewalEligible?: boolean
  renewalDeadline?: Date
  lastAlertSent?: Date
  user?: {
    id: string
    email: string
    name?: string
    preferences?: {
      language?: string
      timezone?: string
    }
  }
}

interface Trip {
  id: string
  userId: string
  destination: string
  departureDate: Date
}

class VisaAlertsService {
  private readonly ALERT_INTERVALS = {
    URGENT: 7,      // 7 days
    WARNING: 30,    // 30 days
    REMINDER: 60    // 60 days
  }

  private readonly COOLDOWN_HOURS = 24 // Don't send duplicate alerts within 24 hours

  /**
   * 만료 예정 비자 확인 및 알림 발송
   */
  async checkExpiringVisas(): Promise<void> {
    try {
      const today = new Date()
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() + this.ALERT_INTERVALS.REMINDER)

      // 실제 사용자 비자 조회 (활성 상태이고 60일 내 만료 예정)
      const expiringVisas = await prisma.userVisa.findMany({
        where: {
          status: {
            in: ['active', 'expiring_soon']
          },
          expiryDate: {
            lte: cutoffDate,
            gte: today // 이미 만료된 것은 제외
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      })

      console.log(`Found ${expiringVisas.length} visas expiring within ${this.ALERT_INTERVALS.REMINDER} days`)

      for (const userVisa of expiringVisas) {
        const visa: Visa = {
          id: userVisa.id,
          userId: userVisa.userId,
          countryName: userVisa.countryName,
          type: userVisa.visaType,
          duration: userVisa.maxStayDays || undefined,
          expiryDate: userVisa.expiryDate,
          status: userVisa.status,
          lastAlertSent: userVisa.lastAlertSent || undefined,
          user: userVisa.user
        }

        if (await this.shouldSendAlert(visa)) {
          await this.sendExpiryAlert(visa)
          
          // 이메일 알림도 발송
          await this.sendEmailAlert(userVisa)
          
          await this.updateLastAlertSent(visa.id)
        }
      }

      // 만료된 비자 상태 업데이트
      await this.updateExpiredVisas()

    } catch (error) {
      await systemAlert.error(
        `Failed to check expiring visas: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'visa-alerts'
      )
    }
  }

  /**
   * 알림 발송 여부 결정
   */
  async shouldSendAlert(visa: Visa): Promise<boolean> {
    if (!visa.lastAlertSent) {
      return true
    }

    const hoursSinceLastAlert = (Date.now() - visa.lastAlertSent.getTime()) / (1000 * 60 * 60)
    return hoursSinceLastAlert >= this.COOLDOWN_HOURS
  }

  /**
   * 비자 만료 알림 발송
   */
  private async sendExpiryAlert(visa: Visa): Promise<void> {
    const daysUntilExpiry = Math.ceil(
      (visa.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    let severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
    let urgencyLevel = 'reminder'
    let title = ''
    let message = ''

    if (daysUntilExpiry <= this.ALERT_INTERVALS.URGENT) {
      severity = 'critical'
      urgencyLevel = 'urgent'
      title = `🚨 긴급: ${visa.countryName} 비자 만료 임박!`
      message = `${visa.countryName} ${visa.type || '비자'}가 ${daysUntilExpiry}일 후인 ${visa.expiryDate.toLocaleDateString('ko-KR')}에 만료됩니다. 즉시 갱신하거나 출국 계획을 세우세요!`
    } else if (daysUntilExpiry <= this.ALERT_INTERVALS.WARNING) {
      severity = 'error'
      urgencyLevel = 'warning'
      title = `⚠️ 주의: ${visa.countryName} 비자 만료 예정`
      message = `${visa.countryName} ${visa.type || '비자'}가 ${daysUntilExpiry}일 후인 ${visa.expiryDate.toLocaleDateString('ko-KR')}에 만료됩니다. 갱신 또는 출국 준비를 시작하세요.`
    } else {
      title = `📅 알림: ${visa.countryName} 비자 만료 안내`
      message = `${visa.countryName} ${visa.type || '비자'}가 ${daysUntilExpiry}일 후인 ${visa.expiryDate.toLocaleDateString('ko-KR')}에 만료됩니다. 미리 갱신 계획을 세우세요.`
    }

    await alertManager.sendDirectAlert({
      title,
      message,
      severity,
      source: 'visa-alerts',
      metadata: {
        visaId: visa.id,
        userId: visa.userId,
        countryName: visa.countryName,
        visaType: visa.type,
        expiryDate: visa.expiryDate,
        daysUntilExpiry,
        urgencyLevel,
        userEmail: visa.user?.email,
        userName: visa.user?.name
      }
    })
  }

  /**
   * 비자별 맞춤 알림 생성
   */
  async createCustomAlert(visa: Visa): Promise<void> {
    const daysUntilExpiry = Math.ceil(
      (visa.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    await alertManager.sendDirectAlert({
      title: `${visa.countryName} Visa Status Update`,
      message: `Your ${visa.type || 'visa'} visa for ${visa.countryName} expires in ${daysUntilExpiry} days. Duration: ${visa.duration} days.`,
      severity: daysUntilExpiry <= 7 ? 'critical' : 'warning',
      source: 'visa-alerts',
      metadata: {
        visaId: visa.id,
        countryName: visa.countryName,
        visaType: visa.type,
        duration: visa.duration,
        expiryDate: visa.expiryDate,
        userPreferences: visa.user?.preferences
      }
    })
  }

  /**
   * 갱신 알림 생성
   */
  async createRenewalAlert(visa: Visa): Promise<void> {
    if (!visa.renewalEligible) return

    await alertManager.sendDirectAlert({
      title: `${visa.countryName} Visa Renewal Available`,
      message: `Your ${visa.type || 'visa'} for ${visa.countryName} is eligible for renewal. Deadline: ${visa.renewalDeadline?.toLocaleDateString()}`,
      severity: 'warning',
      source: 'visa-alerts',
      metadata: {
        visaId: visa.id,
        countryName: visa.countryName,
        renewalEligible: visa.renewalEligible,
        renewalDeadline: visa.renewalDeadline
      }
    })
  }

  /**
   * 비자 리마인더 일정 설정
   */
  async scheduleVisaReminders(visa: Visa): Promise<void> {
    const intervals = [60, 30, 14, 7, 3, 1] // Days before expiry
    
    for (const days of intervals) {
      const reminderDate = new Date(visa.expiryDate)
      reminderDate.setDate(reminderDate.getDate() - days)

      if (reminderDate > new Date()) {
        await alertManager.sendDirectAlert({
          title: `Upcoming: ${visa.countryName} Visa Expires in ${days} days`,
          message: `Reminder: Your visa for ${visa.countryName} expires on ${visa.expiryDate.toLocaleDateString()}`,
          severity: days <= 7 ? 'error' : 'warning',
          source: 'visa-alerts-scheduler',
          metadata: {
            visaId: visa.id,
            countryName: visa.countryName,
            daysUntilExpiry: days,
            reminderType: 'scheduled'
          }
        })
      }
    }
  }

  /**
   * 템플릿 기반 알림 발송
   */
  async sendTemplatedAlert(visa: Visa, templateType: string): Promise<void> {
    const templateMap: Record<string, string> = {
      'visa_urgent': 'visa_expiry_urgent',
      'visa_reminder': 'visa_expiry_reminder',
      'visa_renewal': 'visa_renewal_available'
    }

    const templateId = templateMap[templateType] || 'visa_expiry_reminder'

    await alertManager.sendAlert(templateId, {
      countryName: visa.countryName,
      visaType: visa.type || 'visa',
      expiryDate: visa.expiryDate.toLocaleDateString(),
      userEmail: visa.user?.email
    })
  }

  /**
   * 다국어 알림 발송
   */
  async sendLocalizedAlert(visa: Visa, language: string): Promise<void> {
    const templateId = `visa_expiry_${language}`

    await alertManager.sendAlert(templateId, {
      countryName: visa.countryName,
      visaType: visa.type || 'visa',
      expiryDate: visa.expiryDate.toLocaleDateString(),
      language
    })
  }

  /**
   * 여행 계획과 연계한 비자 확인
   */
  async checkVisaForTrip(visa: Visa, trip: Trip): Promise<void> {
    const tripDate = trip.departureDate
    const visaExpiry = visa.expiryDate

    // Check if visa expires before or during trip
    if (visaExpiry <= tripDate) {
      await alertManager.sendDirectAlert({
        title: '🚨 URGENT: Visa expires before your trip!',
        message: `Your ${visa.countryName} visa expires on ${visaExpiry.toLocaleDateString()}, but your trip to ${trip.destination} is scheduled for ${tripDate.toLocaleDateString()}. Immediate action required!`,
        severity: 'critical',
        source: 'visa-trip-conflict',
        metadata: {
          visaId: visa.id,
          tripId: trip.id,
          countryName: visa.countryName,
          destination: trip.destination,
          visaExpiryDate: visaExpiry,
          tripDepartureDate: tripDate,
          hasUpcomingTrip: true,
          conflictType: 'visa_expires_before_trip'
        }
      })
    }
  }

  /**
   * 만료된 비자 상태 업데이트
   */
  private async updateExpiredVisas(): Promise<void> {
    try {
      const today = new Date()
      
      const result = await prisma.userVisa.updateMany({
        where: {
          expiryDate: {
            lt: today
          },
          status: {
            in: ['active', 'expiring_soon']
          }
        },
        data: {
          status: 'expired'
        }
      })

      if (result.count > 0) {
        console.log(`Updated ${result.count} expired visas to 'expired' status`)
      }
    } catch (error) {
      await systemAlert.warning(
        `Failed to update expired visa status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'visa-alerts'
      )
    }
  }

  /**
   * 마지막 알림 발송 시간 업데이트
   */
  private async updateLastAlertSent(visaId: string): Promise<void> {
    try {
      await prisma.userVisa.update({
        where: { id: visaId },
        data: { lastAlertSent: new Date() }
      })
    } catch (error) {
      // Log error but don't throw to avoid breaking the main flow
      await systemAlert.warning(
        `Failed to update last alert sent for visa ${visaId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'visa-alerts'
      )
    }
  }

  /**
   * 이메일 알림 발송
   */
  private async sendEmailAlert(userVisa: any): Promise<void> {
    try {
      const visaEmailData = {
        id: userVisa.id,
        userId: userVisa.userId,
        countryName: userVisa.countryName,
        visaType: userVisa.visaType,
        expiryDate: userVisa.expiryDate,
        status: userVisa.status,
        user: userVisa.user
      }

      await visaEmailService.sendVisaExpiryAlert(visaEmailData)
    } catch (error) {
      // 이메일 발송 실패는 전체 프로세스를 중단하지 않음
      await systemAlert.warning(
        `Failed to send visa expiry email for visa ${userVisa.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'visa-email-alerts'
      )
    }
  }

  /**
   * 주간 요약 이메일 발송
   */
  async sendWeeklySummaryEmails(): Promise<{ success: number; failed: number }> {
    try {
      console.log('Starting weekly visa summary email sending...')
      const result = await visaEmailService.sendWeeklySummaryToAll()
      
      console.log(`Weekly summary emails completed: ${result.success} success, ${result.failed} failed`)
      
      if (result.failed > 0) {
        await systemAlert.warning(
          `Weekly visa summary emails partially failed: ${result.failed} failures out of ${result.success + result.failed} total`,
          'visa-weekly-summary'
        )
      }

      return result
    } catch (error) {
      await systemAlert.error(
        `Failed to send weekly visa summary emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'visa-weekly-summary'
      )
      return { success: 0, failed: 1 }
    }
  }
}

// Export new service instance
export const visaAlerts = new VisaAlertsService()

// Legacy functions for backward compatibility
export async function checkVisaAlerts(userId: string) {
  const trips = await prisma.countryVisit.findMany({
    where: {
      userId,
      exitDate: {
        gte: new Date() // 현재 진행 중이거나 미래 여행
      }
    }
    // Note: country field is a string, not a relation
  })

  const alerts: VisaAlert[] = []
  
  for (const trip of trips) {
    // 비자 만료일 계산 (임시 - 실제는 DB에서)
    const visaExpiryDate = addDays(trip.entryDate, 90) // 예시: 90일 비자
    const daysUntilExpiry = differenceInDays(visaExpiryDate, new Date())
    
    // 알림 필요 체크
    const alertDays = [30, 14, 7, 3, 1]
    if (alertDays.includes(daysUntilExpiry)) {
      alerts.push({
        id: `alert-${trip.id}-${daysUntilExpiry}`,
        userId: trip.userId,
        tripId: trip.id,
        countryCode: trip.country,
        expiryDate: visaExpiryDate,
        alertDays,
        alertType: 'VISA_EXPIRY'
      })
    }
  }
  
  return alerts
}

export async function sendVisaAlert(alert: VisaAlert) {
  const daysRemaining = differenceInDays(alert.expiryDate, new Date())
  
  const message = {
    title: '비자 만료 알림 ⚠️',
    body: `${alert.countryCode} 비자가 ${daysRemaining}일 후 만료됩니다.`,
    data: {
      type: alert.alertType,
      tripId: alert.tripId,
      countryCode: alert.countryCode
    }
  }
  
  // Use new alert system
  await alertManager.sendDirectAlert({
    title: message.title,
    message: message.body,
    severity: daysRemaining <= 7 ? 'critical' : 'warning',
    source: 'legacy-visa-alerts',
    metadata: message.data
  })
  
  return message
}

// Export types
export type { Visa, Trip }
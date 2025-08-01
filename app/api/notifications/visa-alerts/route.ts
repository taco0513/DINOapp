import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkVisaAlerts } from '@/lib/notifications/visa-alerts'
import { logger } from '@/lib/logger';

// TODO: Remove unused logger import

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alerts = await checkVisaAlerts(session.user.id)
    
    // 알림 메시지 포맷팅
    const formattedAlerts = alerts.map(alert => {
      const daysRemaining = Math.ceil(
        (alert.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      
      let urgency = '📅'
      if (daysRemaining <= 7) urgency = '🚨'
      else if (daysRemaining <= 14) urgency = '⚠️'
      
      return {
        title: `${urgency} 비자 만료 알림`,
        body: `${alert.countryCode} 비자가 ${daysRemaining}일 후 만료됩니다.`,
        data: {
          type: alert.alertType,
          tripId: alert.tripId,
          countryCode: alert.countryCode,
          daysRemaining
        }
      }
    })
    
    return NextResponse.json(formattedAlerts)
  } catch (error) {
    logger.error('비자 알림 확인 오류:', error)
    return NextResponse.json(
      { error: 'Failed to check visa alerts' },
      { status: 500 }
    )
  }
}
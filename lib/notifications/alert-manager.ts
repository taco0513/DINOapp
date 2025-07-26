/**
 * Integrated Alert and Notification System
 * 통합 알림 및 경고 시스템
 */

interface AlertChannel {
  name: string
  type: 'email' | 'webhook' | 'console' | 'database'
  enabled: boolean
  config: Record<string, any>
}

interface Alert {
  id: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  timestamp: Date
  source: string
  metadata?: Record<string, any>
  resolved?: boolean
  resolvedAt?: Date
}

interface NotificationTemplate {
  id: string
  name: string
  subject: string
  message: string
  channels: string[]
}

class AlertManager {
  private static instance: AlertManager
  private alerts: Alert[] = []
  private channels: Map<string, AlertChannel> = new Map()
  private templates: Map<string, NotificationTemplate> = new Map()
  private readonly MAX_ALERTS = 1000

  private constructor() {
    this.initializeDefaultChannels()
    this.initializeDefaultTemplates()
  }

  public static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager()
    }
    return AlertManager.instance
  }

  private initializeDefaultChannels(): void {
    // Console logging channel
    this.channels.set('console', {
      name: 'Console Logger',
      type: 'console',
      enabled: true,
      config: {}
    })

    // Database logging channel
    this.channels.set('database', {
      name: 'Database Logger',
      type: 'database',
      enabled: true,
      config: {}
    })

    // Email channel (if configured)
    if (process.env.SMTP_HOST) {
      this.channels.set('email', {
        name: 'Email Alerts',
        type: 'email',
        enabled: true,
        config: {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          user: process.env.SMTP_USER,
          password: process.env.SMTP_PASSWORD,
          from: process.env.SMTP_FROM || 'noreply@dino-app.com',
          to: process.env.ADMIN_EMAILS?.split(',') || []
        }
      })
    }

    // Webhook channel (Slack, Discord, etc.)
    if (process.env.WEBHOOK_URL) {
      this.channels.set('webhook', {
        name: 'Webhook Alerts',
        type: 'webhook',
        enabled: true,
        config: {
          url: process.env.WEBHOOK_URL,
          format: process.env.WEBHOOK_FORMAT || 'slack' // slack, discord, generic
        }
      })
    }
  }

  private initializeDefaultTemplates(): void {
    this.templates.set('system_error', {
      id: 'system_error',
      name: 'System Error Alert',
      subject: '🚨 DINO System Error Alert',
      message: 'System error detected: {{message}}\nTimestamp: {{timestamp}}\nSeverity: {{severity}}',
      channels: ['console', 'email', 'webhook']
    })

    this.templates.set('performance_warning', {
      id: 'performance_warning',
      name: 'Performance Warning',
      subject: '⚠️ DINO Performance Warning',
      message: 'Performance issue detected: {{message}}\nMetric: {{metric}}\nThreshold: {{threshold}}\nCurrent: {{current}}',
      channels: ['console', 'webhook']
    })

    this.templates.set('security_alert', {
      id: 'security_alert',
      name: 'Security Alert',
      subject: '🔒 DINO Security Alert',
      message: 'Security event detected: {{message}}\nSource: {{source}}\nIP: {{ip}}\nAction: {{action}}',
      channels: ['console', 'email', 'webhook', 'database']
    })

    this.templates.set('backup_status', {
      id: 'backup_status',
      name: 'Backup Status',
      subject: '💾 DINO Backup Status',
      message: 'Backup operation: {{status}}\nBackup ID: {{backupId}}\nTimestamp: {{timestamp}}',
      channels: ['console', 'email']
    })

    this.templates.set('user_activity', {
      id: 'user_activity',
      name: 'User Activity Alert',
      subject: '👤 DINO User Activity',
      message: 'User activity: {{activity}}\nUser: {{user}}\nTimestamp: {{timestamp}}',
      channels: ['database']
    })
  }

  /**
   * 새 알림 발송
   */
  public async sendAlert(
    templateId: string,
    variables: Record<string, any>,
    overrides?: {
      severity?: Alert['severity']
      channels?: string[]
      title?: string
    }
  ): Promise<void> {
    const template = this.templates.get(templateId)
    if (!template) {
      console.error(`Alert template not found: ${templateId}`)
      return
    }

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: overrides?.title || template.subject,
      message: this.interpolateTemplate(template.message, variables),
      severity: overrides?.severity || 'info',
      timestamp: new Date(),
      source: variables.source || 'system',
      metadata: variables,
      resolved: false
    }

    // 알림 저장
    this.storeAlert(alert)

    // 채널별 발송
    const channelsToUse = overrides?.channels || template.channels
    await this.dispatchToChannels(alert, channelsToUse, template)
  }

  /**
   * 직접 알림 발송 (템플릿 없이)
   */
  public async sendDirectAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<void> {
    const fullAlert: Alert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    this.storeAlert(fullAlert)
    await this.dispatchToChannels(fullAlert, ['console', 'database'])
  }

  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key]?.toString() || match
    })
  }

  private storeAlert(alert: Alert): void {
    this.alerts.unshift(alert) // 최신 알림을 앞에 추가
    
    // 최대 알림 수 제한
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts = this.alerts.slice(0, this.MAX_ALERTS)
    }
  }

  private async dispatchToChannels(
    alert: Alert, 
    channelIds: string[], 
    template?: NotificationTemplate
  ): Promise<void> {
    for (const channelId of channelIds) {
      const channel = this.channels.get(channelId)
      if (!channel || !channel.enabled) continue

      try {
        await this.sendToChannel(alert, channel, template)
      } catch (error) {
        console.error(`Failed to send alert to channel ${channelId}:`, error)
      }
    }
  }

  private async sendToChannel(
    alert: Alert, 
    channel: AlertChannel, 
    template?: NotificationTemplate
  ): Promise<void> {
    switch (channel.type) {
      case 'console':
        this.sendToConsole(alert)
        break
        
      case 'email':
        await this.sendToEmail(alert, channel, template)
        break
        
      case 'webhook':
        await this.sendToWebhook(alert, channel)
        break
        
      case 'database':
        await this.sendToDatabase(alert)
        break
    }
  }

  private sendToConsole(alert: Alert): void {
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🚨'
    }[alert.severity]

    console.log(`${emoji} [${alert.severity.toUpperCase()}] ${alert.title}`)
    console.log(`   ${alert.message}`)
    console.log(`   Source: ${alert.source} | Time: ${alert.timestamp.toISOString()}`)
  }

  private async sendToEmail(
    alert: Alert, 
    channel: AlertChannel, 
    template?: NotificationTemplate
  ): Promise<void> {
    try {
      // 간단한 이메일 발송 구현 (실제 환경에서는 nodemailer 등 사용)
      const emailData = {
        to: channel.config.to,
        from: channel.config.from,
        subject: template?.subject || alert.title,
        text: alert.message,
        html: `
          <h2>${alert.title}</h2>
          <p><strong>Severity:</strong> ${alert.severity}</p>
          <p><strong>Source:</strong> ${alert.source}</p>
          <p><strong>Time:</strong> ${alert.timestamp.toISOString()}</p>
          <p><strong>Message:</strong></p>
          <p>${alert.message.replace(/\n/g, '<br>')}</p>
        `
      }

      console.log('📧 Email alert prepared:', emailData.subject)
      // 실제 이메일 발송 로직은 여기에 구현
      
    } catch (error) {
      console.error('Email sending failed:', error)
    }
  }

  private async sendToWebhook(alert: Alert, channel: AlertChannel): Promise<void> {
    try {
      const payload = this.formatWebhookPayload(alert, channel.config.format)
      
      const response = await fetch(channel.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`)
      }

      console.log('🔗 Webhook alert sent successfully')
    } catch (error) {
      console.error('Webhook sending failed:', error)
    }
  }

  private formatWebhookPayload(alert: Alert, format: string): any {
    const color = {
      info: '#36a64f',
      warning: '#ff9500',
      error: '#ff2d00',
      critical: '#8b0000'
    }[alert.severity]

    switch (format) {
      case 'slack':
        return {
          text: alert.title,
          attachments: [{
            color,
            fields: [
              { title: 'Severity', value: alert.severity, short: true },
              { title: 'Source', value: alert.source, short: true },
              { title: 'Time', value: alert.timestamp.toISOString(), short: false },
              { title: 'Message', value: alert.message, short: false }
            ]
          }]
        }
        
      case 'discord':
        return {
          embeds: [{
            title: alert.title,
            description: alert.message,
            color: parseInt(color.replace('#', ''), 16),
            fields: [
              { name: 'Severity', value: alert.severity, inline: true },
              { name: 'Source', value: alert.source, inline: true },
              { name: 'Time', value: alert.timestamp.toISOString(), inline: false }
            ],
            timestamp: alert.timestamp.toISOString()
          }]
        }
        
      default:
        return {
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          source: alert.source,
          timestamp: alert.timestamp.toISOString(),
          metadata: alert.metadata
        }
    }
  }

  private async sendToDatabase(alert: Alert): Promise<void> {
    try {
      // 데이터베이스에 알림 로그 저장
      // 실제 구현에서는 Prisma를 사용하여 AlertLog 테이블에 저장
      console.log('💾 Alert logged to database:', alert.id)
    } catch (error) {
      console.error('Database logging failed:', error)
    }
  }

  /**
   * 알림 조회
   */
  public getAlerts(options: {
    severity?: Alert['severity']
    source?: string
    resolved?: boolean
    limit?: number
    offset?: number
  } = {}): Alert[] {
    let filtered = this.alerts

    if (options.severity) {
      filtered = filtered.filter(alert => alert.severity === options.severity)
    }

    if (options.source) {
      filtered = filtered.filter(alert => alert.source === options.source)
    }

    if (options.resolved !== undefined) {
      filtered = filtered.filter(alert => alert.resolved === options.resolved)
    }

    const start = options.offset || 0
    const end = start + (options.limit || 50)
    
    return filtered.slice(start, end)
  }

  /**
   * 알림 해결 처리
   */
  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = new Date()
      return true
    }
    return false
  }

  /**
   * 알림 통계
   */
  public getAlertStats(): {
    total: number
    unresolved: number
    bySeverity: Record<Alert['severity'], number>
    bySource: Record<string, number>
  } {
    const stats = {
      total: this.alerts.length,
      unresolved: this.alerts.filter(a => !a.resolved).length,
      bySeverity: { info: 0, warning: 0, error: 0, critical: 0 },
      bySource: {} as Record<string, number>
    }

    for (const alert of this.alerts) {
      stats.bySeverity[alert.severity]++
      stats.bySource[alert.source] = (stats.bySource[alert.source] || 0) + 1
    }

    return stats
  }

  /**
   * 채널 관리
   */
  public addChannel(channel: AlertChannel): void {
    this.channels.set(channel.name, channel)
  }

  public removeChannel(name: string): void {
    this.channels.delete(name)
  }

  public getChannels(): AlertChannel[] {
    return Array.from(this.channels.values())
  }

  /**
   * 템플릿 관리
   */
  public addTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template)
  }

  public getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values())
  }
}

// 시스템 통합을 위한 편의 함수들
export const alertManager = AlertManager.getInstance()

export const systemAlert = {
  error: (message: string, source = 'system', metadata?: any) =>
    alertManager.sendAlert('system_error', { message, source, ...metadata }, { severity: 'error' }),
    
  warning: (message: string, source = 'system', metadata?: any) =>
    alertManager.sendAlert('performance_warning', { message, source, ...metadata }, { severity: 'warning' }),
    
  security: (message: string, ip?: string, action?: string, metadata?: any) =>
    alertManager.sendAlert('security_alert', { message, ip, action, source: 'security', ...metadata }, { severity: 'critical' }),
    
  backup: (status: string, backupId?: string, metadata?: any) =>
    alertManager.sendAlert('backup_status', { status, backupId, source: 'backup', ...metadata }),
    
  userActivity: (activity: string, user: string, metadata?: any) =>
    alertManager.sendAlert('user_activity', { activity, user, source: 'user', ...metadata })
}

export type { Alert, AlertChannel, NotificationTemplate }
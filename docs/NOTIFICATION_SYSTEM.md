# Notification System Documentation

## Overview

The DINO Notification System provides comprehensive alert and reminder functionality for visa expiration, Schengen compliance, and travel planning. This enterprise-grade system supports multiple notification channels, intelligent scheduling, and customizable user preferences to ensure users never miss critical travel-related deadlines.

## System Architecture

```
Notification System
├── Frontend Components
│   ├── NotificationSettings - User preference configuration
│   ├── NotificationIcon - Real-time notification indicator
│   ├── NotificationList - Notification history and management
│   └── Toast/Banner - In-app notification display
├── Notification Engine
│   ├── SchedulerService - Automated notification scheduling
│   ├── TemplateEngine - Dynamic message generation
│   ├── ChannelManager - Multi-channel delivery coordination
│   └── PreferenceManager - User setting management
├── Delivery Channels
│   ├── EmailService - SMTP email delivery
│   ├── PushService - Browser push notifications
│   ├── InAppService - Real-time in-app alerts
│   └── WebhookService - External system integration
├── Alert Types
│   ├── VisaExpirationAlerts - Visa deadline warnings
│   ├── SchengenComplianceAlerts - 90/180-day rule monitoring
│   ├── TripReminderAlerts - Upcoming travel notifications
│   └── SystemAlerts - Application status updates
└── Storage Layer
    ├── NotificationHistory - Delivery tracking
    ├── UserPreferences - Personalized settings
    └── AlertSchedule - Pending notification queue
```

## Core Components

### NotificationSettings Component

**Location**: `/components/notifications/NotificationSettings.tsx`  
**Purpose**: Comprehensive user preference management interface

#### Features Overview

##### Multi-Channel Configuration

- **Email Notifications**: SMTP-based email alerts
- **Browser Push**: HTML5 push notification support
- **In-App Alerts**: Real-time interface notifications
- **Quiet Hours**: Do-not-disturb time period management

##### Advanced Timing Controls

- **Visa Expiry Alerts**: Customizable advance warning periods
- **Schengen Warnings**: Configurable compliance thresholds
- **Trip Reminders**: Flexible pre-departure notifications
- **Escalation Policies**: Progressive alert intensity

#### Data Models

##### NotificationPreferences Interface

```typescript
interface NotificationPreferences {
  userId: string; // User identifier
  email: boolean; // Email notifications enabled
  push: boolean; // Browser push enabled
  inApp: boolean; // In-app alerts enabled

  // Timing configurations
  visaExpiryDays: number[]; // Days before visa expiry [30, 7, 1]
  schengenWarningThreshold: number; // Schengen usage warning threshold (80)
  tripReminderDays: number[]; // Days before trip departure [7, 1]

  // Quiet hours configuration
  quiet: {
    enabled: boolean; // Quiet hours active
    startTime: string; // Start time (HH:MM format)
    endTime: string; // End time (HH:MM format)
    timezone: string; // User timezone
  };

  // Channel-specific settings
  emailSettings: {
    address: string; // Primary email address
    frequency: 'immediate' | 'daily' | 'weekly';
    format: 'text' | 'html';
  };

  pushSettings: {
    permission: NotificationPermission;
    enableSound: boolean;
    enableVibration: boolean;
  };
}
```

##### Default Preferences Configuration

```typescript
export const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'userId'> = {
  email: true,
  push: false,
  inApp: true,
  visaExpiryDays: [30, 7, 1],
  schengenWarningThreshold: 80,
  tripReminderDays: [7, 1],
  quiet: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  emailSettings: {
    address: '',
    frequency: 'immediate',
    format: 'html',
  },
  pushSettings: {
    permission: 'default',
    enableSound: true,
    enableVibration: true,
  },
};
```

#### UI Implementation

##### Channel Selection Interface

```typescript
// Multi-channel notification toggle controls
<div className="notification-channels">
  <ChannelToggle
    icon="📧"
    title="이메일 알림"
    description="중요한 알림을 이메일로 받습니다"
    enabled={preferences.email}
    onChange={(enabled) => updatePreference('email', enabled)}
  />

  <ChannelToggle
    icon="🔔"
    title="브라우저 푸시 알림"
    description="브라우저에서 실시간 알림을 받습니다"
    enabled={preferences.push}
    onChange={(enabled) => updatePreference('push', enabled)}
    requiresPermission={true}
  />

  <ChannelToggle
    icon="📱"
    title="앱 내 알림"
    description="애플리케이션 내에서 알림을 표시합니다"
    enabled={preferences.inApp}
    onChange={(enabled) => updatePreference('inApp', enabled)}
  />
</div>
```

##### Timing Configuration Panel

```typescript
// Flexible timing controls for different alert types
<div className="timing-controls">
  <TimingInput
    label="비자 만료 알림"
    description="비자 만료 전 알림을 받을 일수를 설정하세요"
    value={preferences.visaExpiryDays}
    onChange={(days) => updatePreference('visaExpiryDays', days)}
    placeholder="30, 7, 1"
    validation={(days) => days.every(d => d > 0 && d <= 365)}
  />

  <ThresholdInput
    label="셰겐 경고 기준"
    description="90일 중 사용량이 이 값을 넘으면 경고합니다"
    value={preferences.schengenWarningThreshold}
    onChange={(threshold) => updatePreference('schengenWarningThreshold', threshold)}
    min={50}
    max={90}
    unit="일"
  />

  <TimingInput
    label="여행 알림"
    description="여행 출발 전 알림을 받을 일수를 설정하세요"
    value={preferences.tripReminderDays}
    onChange={(days) => updatePreference('tripReminderDays', days)}
    placeholder="7, 1"
  />
</div>
```

##### Quiet Hours Configuration

```typescript
// Do-not-disturb time period management
<div className="quiet-hours-config">
  <label className="quiet-hours-toggle">
    <input
      type="checkbox"
      checked={preferences.quiet.enabled}
      onChange={(e) => updateQuietHours('enabled', e.target.checked)}
    />
    <span>방해 금지 시간 사용</span>
  </label>

  {preferences.quiet.enabled && (
    <div className="time-range-selector">
      <TimeInput
        label="시작 시간"
        value={preferences.quiet.startTime}
        onChange={(time) => updateQuietHours('startTime', time)}
      />
      <TimeInput
        label="종료 시간"
        value={preferences.quiet.endTime}
        onChange={(time) => updateQuietHours('endTime', time)}
      />
    </div>
  )}
</div>
```

### NotificationIcon Component

**Location**: `/components/notifications/NotificationIcon.tsx`  
**Purpose**: Real-time notification indicator with badge display

#### Features

- **Unread Count Badge**: Visual indicator of pending notifications
- **Real-time Updates**: WebSocket-based live notification reception
- **Priority Indicators**: Color-coded severity levels
- **Click-to-Open**: Direct access to notification panel

```typescript
// Real-time notification indicator implementation
export default function NotificationIcon() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasHighPriority, setHasHighPriority] = useState(false)

  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket('/api/notifications/ws')

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      setUnreadCount(prev => prev + 1)

      if (notification.priority === 'high' || notification.priority === 'critical') {
        setHasHighPriority(true)
      }
    }

    return () => ws.close()
  }, [])

  return (
    <div className="notification-icon" onClick={openNotificationPanel}>
      <BellIcon className={hasHighPriority ? 'urgent' : 'normal'} />
      {unreadCount > 0 && (
        <span className="unread-badge">{unreadCount}</span>
      )}
    </div>
  )
}
```

### NotificationList Component

**Location**: `/components/notifications/NotificationList.tsx`  
**Purpose**: Comprehensive notification history and management interface

#### Features

- **Chronological Display**: Time-ordered notification history
- **Categorization**: Grouped by notification type
- **Bulk Actions**: Mark all as read, bulk delete operations
- **Search and Filter**: Find specific notifications quickly

```typescript
// Notification history management
export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(n => filter === 'all' || n.type === filter)
      .filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [notifications, filter, searchQuery])

  return (
    <div className="notification-list">
      <div className="list-header">
        <SearchInput
          placeholder="알림 검색..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <FilterTabs
          options={['all', 'visa', 'schengen', 'trip', 'system']}
          selected={filter}
          onChange={setFilter}
        />
      </div>

      <div className="notification-items">
        {filteredNotifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkRead={() => markAsRead(notification.id)}
            onDelete={() => deleteNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  )
}
```

## Notification Engine

### SchedulerService

**Location**: `/lib/notifications/scheduler.ts`  
**Purpose**: Automated notification scheduling and delivery coordination

#### Core Scheduling Logic

```typescript
export class NotificationScheduler {
  private scheduleQueue: Map<string, ScheduledNotification> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;

  // Schedule notification based on user preferences and alert type
  public scheduleNotification(
    userId: string,
    type: NotificationType,
    triggerDate: Date,
    context: NotificationContext
  ): string {
    const preferences = this.getUserPreferences(userId);
    const notifications = this.generateNotificationSchedule(
      type,
      triggerDate,
      preferences,
      context
    );

    notifications.forEach(notification => {
      this.scheduleQueue.set(notification.id, notification);
    });

    return notifications[0].id;
  }

  // Generate multiple notifications based on user timing preferences
  private generateNotificationSchedule(
    type: NotificationType,
    triggerDate: Date,
    preferences: NotificationPreferences,
    context: NotificationContext
  ): ScheduledNotification[] {
    const schedule: ScheduledNotification[] = [];

    switch (type) {
      case 'visa_expiry':
        preferences.visaExpiryDays.forEach(days => {
          const scheduledTime = new Date(triggerDate);
          scheduledTime.setDate(scheduledTime.getDate() - days);

          schedule.push({
            id: generateNotificationId(),
            userId: preferences.userId,
            type,
            scheduledTime,
            context: { ...context, daysUntilExpiry: days },
            channels: this.getEnabledChannels(preferences),
            priority: this.calculatePriority(days, type),
          });
        });
        break;

      case 'schengen_warning':
        // Schedule immediate notification for Schengen compliance issues
        schedule.push({
          id: generateNotificationId(),
          userId: preferences.userId,
          type,
          scheduledTime: new Date(),
          context,
          channels: this.getEnabledChannels(preferences),
          priority: 'high',
        });
        break;

      case 'trip_reminder':
        preferences.tripReminderDays.forEach(days => {
          const scheduledTime = new Date(triggerDate);
          scheduledTime.setDate(scheduledTime.getDate() - days);

          schedule.push({
            id: generateNotificationId(),
            userId: preferences.userId,
            type,
            scheduledTime,
            context: { ...context, daysUntilTrip: days },
            channels: this.getEnabledChannels(preferences),
            priority: days <= 1 ? 'high' : 'medium',
          });
        });
        break;
    }

    return schedule.filter(n => this.isWithinQuietHours(n, preferences));
  }

  // Process scheduled notifications
  public startProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processScheduledNotifications();
    }, 60000); // Check every minute
  }

  private async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const dueNotifications = Array.from(this.scheduleQueue.values()).filter(
      n => n.scheduledTime <= now
    );

    for (const notification of dueNotifications) {
      await this.deliverNotification(notification);
      this.scheduleQueue.delete(notification.id);
    }
  }
}
```

### TemplateEngine

**Purpose**: Dynamic message generation with localization support

```typescript
export class NotificationTemplateEngine {
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.loadTemplates();
  }

  // Generate notification content based on type and context
  public generateNotification(
    type: NotificationType,
    context: NotificationContext,
    locale: string = 'ko'
  ): NotificationContent {
    const template = this.templates.get(`${type}_${locale}`);
    if (!template) {
      throw new Error(`Template not found: ${type}_${locale}`);
    }

    return {
      title: this.processTemplate(template.title, context),
      body: this.processTemplate(template.body, context),
      actions: template.actions?.map(action => ({
        ...action,
        title: this.processTemplate(action.title, context),
      })),
      icon: template.icon,
      badge: template.badge,
      tag: `${type}_${context.userId}`,
    };
  }

  private processTemplate(
    template: string,
    context: NotificationContext
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key]?.toString() || match;
    });
  }

  private loadTemplates(): void {
    // Visa expiry notification templates
    this.templates.set('visa_expiry_ko', {
      title: '비자 만료 알림',
      body: '{{country}} 비자가 {{daysUntilExpiry}}일 후 만료됩니다.',
      icon: '/icons/visa-warning.png',
      badge: '/icons/badge.png',
      actions: [
        { action: 'view', title: '자세히 보기' },
        { action: 'dismiss', title: '무시' },
      ],
    });

    // Schengen compliance warning templates
    this.templates.set('schengen_warning_ko', {
      title: '셰겐 체류 한도 경고',
      body: '현재 {{usedDays}}일 사용 중입니다. 90일 한도를 주의하세요.',
      icon: '/icons/schengen-warning.png',
      badge: '/icons/badge.png',
      actions: [
        { action: 'calculator', title: '계산기 열기' },
        { action: 'dismiss', title: '확인' },
      ],
    });

    // Trip reminder templates
    this.templates.set('trip_reminder_ko', {
      title: '여행 일정 알림',
      body: '{{country}} 여행이 {{daysUntilTrip}}일 후입니다.',
      icon: '/icons/trip-reminder.png',
      badge: '/icons/badge.png',
      actions: [
        { action: 'checklist', title: '준비사항 확인' },
        { action: 'dismiss', title: '확인' },
      ],
    });
  }
}
```

### ChannelManager

**Purpose**: Multi-channel delivery coordination and optimization

```typescript
export class NotificationChannelManager {
  private channels: Map<string, NotificationChannel> = new Map();

  constructor() {
    this.initializeChannels();
  }

  // Deliver notification through all enabled channels
  public async deliverNotification(
    notification: ScheduledNotification,
    content: NotificationContent
  ): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = [];

    for (const channelType of notification.channels) {
      const channel = this.channels.get(channelType);
      if (channel) {
        try {
          const result = await channel.send(notification, content);
          results.push(result);

          // Log successful delivery
          await this.logDelivery(
            notification.id,
            channelType,
            'success',
            result
          );
        } catch (error) {
          // Log failed delivery and attempt fallback
          await this.logDelivery(notification.id, channelType, 'failed', {
            error,
          });

          // Attempt fallback channel if available
          const fallbackResult = await this.attemptFallback(
            notification,
            content,
            channelType
          );
          if (fallbackResult) {
            results.push(fallbackResult);
          }
        }
      }
    }

    return results;
  }

  private initializeChannels(): void {
    // Email notification channel
    this.channels.set(
      'email',
      new EmailNotificationChannel({
        smtp: {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        },
      })
    );

    // Browser push notification channel
    this.channels.set(
      'push',
      new PushNotificationChannel({
        vapidKeys: {
          publicKey: process.env.VAPID_PUBLIC_KEY!,
          privateKey: process.env.VAPID_PRIVATE_KEY!,
        },
        contact: process.env.VAPID_CONTACT!,
      })
    );

    // In-app notification channel
    this.channels.set(
      'inApp',
      new InAppNotificationChannel({
        websocketServer: this.websocketServer,
      })
    );
  }
}
```

## Delivery Channels

### EmailNotificationChannel

**Purpose**: SMTP-based email notification delivery

```typescript
export class EmailNotificationChannel implements NotificationChannel {
  private transporter: nodemailer.Transporter;

  constructor(config: EmailChannelConfig) {
    this.transporter = nodemailer.createTransporter(config.smtp);
  }

  public async send(
    notification: ScheduledNotification,
    content: NotificationContent
  ): Promise<DeliveryResult> {
    const user = await this.getUserData(notification.userId);

    const emailContent = {
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: content.title,
      html: this.generateHTMLEmail(content, notification),
      text: this.generatePlainTextEmail(content, notification),
    };

    const result = await this.transporter.sendMail(emailContent);

    return {
      channel: 'email',
      status: 'delivered',
      messageId: result.messageId,
      timestamp: new Date(),
    };
  }

  private generateHTMLEmail(
    content: NotificationContent,
    notification: ScheduledNotification
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${content.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .actions { margin-top: 20px; }
            .button { 
              display: inline-block; 
              padding: 10px 20px; 
              background: #007bff; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${content.title}</h1>
          </div>
          <div class="content">
            <p>${content.body}</p>
            ${this.generateActionButtons(content.actions)}
          </div>
        </body>
      </html>
    `;
  }
}
```

### PushNotificationChannel

**Purpose**: Browser push notification delivery

```typescript
export class PushNotificationChannel implements NotificationChannel {
  private vapidKeys: VapidKeys;

  constructor(config: PushChannelConfig) {
    this.vapidKeys = config.vapidKeys;
    webpush.setVapidDetails(
      config.contact,
      config.vapidKeys.publicKey,
      config.vapidKeys.privateKey
    );
  }

  public async send(
    notification: ScheduledNotification,
    content: NotificationContent
  ): Promise<DeliveryResult> {
    const subscriptions = await this.getUserPushSubscriptions(
      notification.userId
    );
    const results: DeliveryResult[] = [];

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: content.title,
            body: content.body,
            icon: content.icon,
            badge: content.badge,
            tag: content.tag,
            actions: content.actions,
            data: {
              notificationId: notification.id,
              type: notification.type,
              url: this.generateNotificationUrl(notification),
            },
          })
        );

        results.push({
          channel: 'push',
          status: 'delivered',
          endpoint: subscription.endpoint,
          timestamp: new Date(),
        });
      } catch (error) {
        // Handle invalid subscriptions
        if (error.statusCode === 410) {
          await this.removeInvalidSubscription(subscription);
        }

        results.push({
          channel: 'push',
          status: 'failed',
          error: error.message,
          timestamp: new Date(),
        });
      }
    }

    return results[0]; // Return first result for simplicity
  }
}
```

## Alert Types

### VisaExpirationAlerts

**Purpose**: Automated visa expiration monitoring and alerting

```typescript
export class VisaExpirationAlertManager {
  private scheduler: NotificationScheduler;

  // Monitor all user visas and schedule alerts
  public async monitorVisaExpirations(): Promise<void> {
    const users = await this.getAllUsers();

    for (const user of users) {
      const visas = await this.getUserVisas(user.id);

      for (const visa of visas) {
        if (visa.expiryDate) {
          await this.scheduleVisaExpirationAlerts(user.id, visa);
        }
      }
    }
  }

  private async scheduleVisaExpirationAlerts(
    userId: string,
    visa: VisaRecord
  ): Promise<void> {
    const context: NotificationContext = {
      userId,
      country: visa.country,
      visaType: visa.type,
      expiryDate: visa.expiryDate.toISOString(),
      passportNumber: visa.passportNumber,
    };

    await this.scheduler.scheduleNotification(
      userId,
      'visa_expiry',
      visa.expiryDate,
      context
    );
  }
}
```

### SchengenComplianceAlerts

**Purpose**: Real-time Schengen 90/180-day rule monitoring

```typescript
export class SchengenComplianceAlertManager {
  private schengenCalculator: SchengenCalculator;

  // Check compliance for all users and trigger alerts
  public async checkSchengenCompliance(): Promise<void> {
    const users = await this.getAllUsers();

    for (const user of users) {
      const visits = await this.getUserSchengenVisits(user.id);
      const compliance = this.schengenCalculator.calculateCompliance(visits);

      await this.evaluateComplianceAlerts(user.id, compliance);
    }
  }

  private async evaluateComplianceAlerts(
    userId: string,
    compliance: SchengenComplianceResult
  ): Promise<void> {
    const preferences = await this.getUserPreferences(userId);

    // Check if user has exceeded warning threshold
    if (compliance.daysUsed >= preferences.schengenWarningThreshold) {
      const context: NotificationContext = {
        userId,
        usedDays: compliance.daysUsed,
        remainingDays: compliance.remainingDays,
        nextResetDate: compliance.nextResetDate.toISOString(),
        complianceStatus: compliance.status,
      };

      await this.scheduler.scheduleNotification(
        userId,
        'schengen_warning',
        new Date(),
        context
      );
    }
  }
}
```

## Performance and Optimization

### Batch Processing

```typescript
// Process notifications in batches for better performance
export class BatchNotificationProcessor {
  private batchSize = 100;
  private processingQueue: ScheduledNotification[] = [];

  public async processBatch(): Promise<void> {
    const batch = this.processingQueue.splice(0, this.batchSize);

    // Process notifications in parallel with concurrency limit
    await Promise.allSettled(
      batch.map(notification => this.processNotification(notification))
    );
  }
}
```

### Caching Strategy

```typescript
// Cache user preferences to reduce database queries
const preferenceCache = new Map<string, NotificationPreferences>();

export const getCachedPreferences = async (
  userId: string
): Promise<NotificationPreferences> => {
  if (preferenceCache.has(userId)) {
    return preferenceCache.get(userId)!;
  }

  const preferences = await loadUserPreferences(userId);
  preferenceCache.set(userId, preferences);

  // Cache for 10 minutes
  setTimeout(() => preferenceCache.delete(userId), 10 * 60 * 1000);

  return preferences;
};
```

### Rate Limiting

```typescript
// Prevent notification spam with intelligent rate limiting
export class NotificationRateLimiter {
  private limits = new Map<string, number>();

  public canSendNotification(userId: string, type: NotificationType): boolean {
    const key = `${userId}:${type}`;
    const now = Date.now();
    const lastSent = this.limits.get(key) || 0;

    // Minimum 1 hour between similar notifications
    if (now - lastSent < 60 * 60 * 1000) {
      return false;
    }

    this.limits.set(key, now);
    return true;
  }
}
```

## Security and Privacy

### Data Protection

- **Minimal Data Storage**: Only essential notification metadata stored
- **Encryption**: Sensitive notification content encrypted at rest
- **Access Control**: User-specific notification isolation
- **Audit Logging**: Comprehensive delivery tracking

### Privacy Controls

- **Opt-out Mechanisms**: Easy unsubscribe for all notification types
- **Data Retention**: Automatic cleanup of old notifications
- **Consent Management**: Explicit consent for push notifications
- **Anonymization**: Personal data anonymized in analytics

This comprehensive notification system ensures users stay informed about critical travel deadlines while respecting their preferences and maintaining high performance standards.

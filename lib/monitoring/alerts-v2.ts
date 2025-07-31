// Simplified alerts module for testing

export enum AlertLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  CRITICAL = 4,
}

export enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  level: AlertLevel;
  timestamp: Date;
  status: AlertStatus;
  channels?: string[];
  metadata?: Record<string, any>;
  groupKey?: string;
  deduplicationKey?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolution?: string;
  resolvedAt?: Date;
}

export interface AlertChannel {
  type: string;
  send(alert: Alert): Promise<boolean>;
}

export interface AlertRule {
  name: string;
  condition: (metrics: any) => boolean;
  level: AlertLevel;
  channels: string[];
  cooldown: number;
}

export interface AlertConfig {
  channels: Record<string, AlertChannel>;
  defaultChannel?: string;
  rules?: AlertRule[];
  minimumLevel?: AlertLevel;
  maxHistorySize?: number;
  groupingSimilarAlerts?: boolean;
  groupingWindow?: number;
  deduplication?: boolean;
  deduplicationWindow?: number;
  customHandlers?: Array<{
    name: string;
    handler: (alert: Alert) => void;
    filter: (alert: Alert) => boolean;
  }>;
  cleanupInterval?: number;
}

export class AlertManager {
  private config: AlertConfig;
  private history: Alert[] = [];
  private cooldowns: Map<string, number> = new Map();
  private groupedAlerts: Map<string, Alert[]> = new Map();
  private deduplicationCache: Map<string, number> = new Map();

  constructor(config: AlertConfig) {
    this.config = config;
  }

  async send(alert: Alert): Promise<void> {
    // Check minimum level
    if (
      this.config.minimumLevel !== undefined &&
      alert.level < this.config.minimumLevel
    ) {
      return;
    }

    // Check deduplication
    if (this.config.deduplication && alert.deduplicationKey) {
      const lastSent = this.deduplicationCache.get(alert.deduplicationKey);
      if (
        lastSent &&
        Date.now() - lastSent < (this.config.deduplicationWindow || 300000)
      ) {
        return;
      }
      this.deduplicationCache.set(alert.deduplicationKey, Date.now());
    }

    // Check grouping
    if (this.config.groupingSimilarAlerts && alert.groupKey) {
      const grouped = this.groupedAlerts.get(alert.groupKey) || [];
      grouped.push(alert);
      this.groupedAlerts.set(alert.groupKey, grouped);

      if (grouped.length === 1) {
        // First alert in group, send immediately
        setTimeout(() => {
          this.sendGroupedAlerts(alert.groupKey!);
        }, this.config.groupingWindow || 60000);
      } else {
        // Add to group, don't send yet
        return;
      }
    }

    // Add to history
    this.history.push(alert);
    if (
      this.config.maxHistorySize &&
      this.history.length > this.config.maxHistorySize
    ) {
      this.history = this.history.slice(-this.config.maxHistorySize);
    }

    // Send to channels
    const channelsToUse = alert.channels || [
      this.config.defaultChannel || 'email',
    ];
    const promises = channelsToUse.map(channelName => {
      const channel = this.config.channels[channelName];
      if (channel) {
        return channel.send(alert).catch(() => false);
      }
      return Promise.resolve(false);
    });

    await Promise.all(promises);

    // Call custom handlers
    if (this.config.customHandlers) {
      for (const handler of this.config.customHandlers) {
        if (handler.filter(alert)) {
          handler.handler(alert);
        }
      }
    }
  }

  private async sendGroupedAlerts(groupKey: string): Promise<void> {
    const alerts = this.groupedAlerts.get(groupKey);
    if (!alerts || alerts.length === 0) return;

    const groupedAlert: Alert = {
      ...alerts[0],
      message: `${alerts[0].message} (${alerts.length} occurrences)`,
      metadata: {
        ...alerts[0].metadata,
        count: alerts.length,
        firstOccurrence: alerts[0].timestamp,
        lastOccurrence: alerts[alerts.length - 1].timestamp,
      },
    };

    this.groupedAlerts.delete(groupKey);

    // Send without grouping to avoid recursion
    const savedGrouping = this.config.groupingSimilarAlerts;
    this.config.groupingSimilarAlerts = false;
    await this.send(groupedAlert);
    this.config.groupingSimilarAlerts = savedGrouping;
  }

  async evaluate(metrics: any): Promise<void> {
    if (!this.config.rules) return;

    for (const rule of this.config.rules) {
      // Check cooldown
      const lastTriggered = this.cooldowns.get(rule.name);
      if (lastTriggered && Date.now() - lastTriggered < rule.cooldown) {
        continue;
      }

      // Evaluate condition
      if (rule.condition(metrics)) {
        this.cooldowns.set(rule.name, Date.now());

        const alert: Alert = {
          id: `rule-${rule.name}-${Date.now()}`,
          title: rule.name,
          message: `Alert rule ${rule.name} triggered`,
          level: rule.level,
          timestamp: new Date(),
          status: AlertStatus.NEW,
          channels: rule.channels,
        };

        await this.send(alert);
      }
    }
  }

  getHistory(): Alert[] {
    return [...this.history];
  }

  getAlert(id: string): Alert | undefined {
    return this.history.find(alert => alert.id === id);
  }

  async acknowledge(id: string, userId: string): Promise<void> {
    const alert = this.history.find(a => a.id === id);
    if (alert) {
      alert.status = AlertStatus.ACKNOWLEDGED;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date();
    }
  }

  async resolve(id: string, resolution: string): Promise<void> {
    const alert = this.history.find(a => a.id === id);
    if (alert) {
      alert.status = AlertStatus.RESOLVED;
      alert.resolution = resolution;
      alert.resolvedAt = new Date();
    }
  }
}

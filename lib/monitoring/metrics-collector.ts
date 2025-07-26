/**
 * Real-time Metrics Collection System
 * 실시간 메트릭 수집 시스템
 */

interface SystemMetrics {
  timestamp: number
  cpu: {
    usage: number
    loadAverage: number[]
  }
  memory: {
    used: number
    total: number
    usage: number
  }
  database: {
    activeConnections: number
    queryLatency: number
    errorRate: number
  }
  api: {
    requestCount: number
    errorCount: number
    averageResponseTime: number
  }
  users: {
    activeUsers: number
    totalUsers: number
    newUsers: number
  }
}

interface AlertConfig {
  name: string
  metric: string
  threshold: number
  comparison: 'gt' | 'lt' | 'eq'
  enabled: boolean
}

class MetricsCollector {
  private static instance: MetricsCollector
  private metrics: SystemMetrics[] = []
  private alerts: AlertConfig[] = []
  private subscribers: ((metrics: SystemMetrics) => void)[] = []
  private collectionInterval?: NodeJS.Timeout
  private readonly MAX_METRICS = 1000 // 최대 1000개 메트릭 보관

  private constructor() {
    this.initializeDefaultAlerts()
  }

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }

  private initializeDefaultAlerts(): void {
    this.alerts = [
      {
        name: 'High CPU Usage',
        metric: 'cpu.usage',
        threshold: 80,
        comparison: 'gt',
        enabled: true
      },
      {
        name: 'High Memory Usage',
        metric: 'memory.usage',
        threshold: 85,
        comparison: 'gt',
        enabled: true
      },
      {
        name: 'High Database Latency',
        metric: 'database.queryLatency',
        threshold: 1000,
        comparison: 'gt',
        enabled: true
      },
      {
        name: 'High API Error Rate',
        metric: 'api.errorRate',
        threshold: 5,
        comparison: 'gt',
        enabled: true
      }
    ]
  }

  public startCollection(intervalMs: number = 30000): void {
    this.collectionInterval = setInterval(async () => {
      const metrics = await this.collectMetrics()
      this.storeMetrics(metrics)
      this.checkAlerts(metrics)
      this.notifySubscribers(metrics)
    }, intervalMs)

    console.log(`📊 Metrics collection started (interval: ${intervalMs}ms)`)
  }

  public stopCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval)
      this.collectionInterval = undefined
      console.log('📊 Metrics collection stopped')
    }
  }

  private async collectMetrics(): Promise<SystemMetrics> {
    const timestamp = Date.now()

    try {
      const [
        cpuMetrics,
        memoryMetrics,
        databaseMetrics,
        apiMetrics,
        userMetrics
      ] = await Promise.all([
        this.getCpuMetrics(),
        this.getMemoryMetrics(),
        this.getDatabaseMetrics(),
        this.getApiMetrics(),
        this.getUserMetrics()
      ])

      return {
        timestamp,
        cpu: cpuMetrics,
        memory: memoryMetrics,
        database: databaseMetrics,
        api: apiMetrics,
        users: userMetrics
      }
    } catch (error) {
      console.error('Failed to collect metrics:', error)
      return this.getDefaultMetrics(timestamp)
    }
  }

  private async getCpuMetrics(): Promise<SystemMetrics['cpu']> {
    if (typeof process === 'undefined') {
      return { usage: 0, loadAverage: [0, 0, 0] }
    }

    try {
      // Node.js 환경에서 CPU 사용률 계산
      const cpuUsage = process.cpuUsage()
      const usage = (cpuUsage.user + cpuUsage.system) / 1000000 // 마이크로초를 초로 변환
      
      return {
        usage: Math.min(usage * 100, 100), // 백분율로 변환, 최대 100%
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0]
      }
    } catch (error) {
      return { usage: 0, loadAverage: [0, 0, 0] }
    }
  }

  private async getMemoryMetrics(): Promise<SystemMetrics['memory']> {
    if (typeof process === 'undefined') {
      return { used: 0, total: 0, usage: 0 }
    }

    try {
      const memUsage = process.memoryUsage()
      const totalMemory = require('os').totalmem()
      const used = memUsage.heapUsed
      
      return {
        used,
        total: totalMemory,
        usage: (used / totalMemory) * 100
      }
    } catch (error) {
      return { used: 0, total: 0, usage: 0 }
    }
  }

  private async getDatabaseMetrics(): Promise<SystemMetrics['database']> {
    try {
      const { dbPool } = await import('../database/connection-pool')
      const { queryOptimizer } = await import('../database/query-optimizer')
      
      const [connectionInfo, healthCheck, queryStats] = await Promise.all([
        dbPool.getConnectionInfo(),
        dbPool.healthCheck(),
        queryOptimizer.getQueryStats()
      ])

      return {
        activeConnections: connectionInfo.activeConnections,
        queryLatency: healthCheck.latency,
        errorRate: queryStats.errorQueries.length / Math.max(queryStats.totalQueries, 1) * 100
      }
    } catch (error) {
      return {
        activeConnections: 0,
        queryLatency: 0,
        errorRate: 0
      }
    }
  }

  private async getApiMetrics(): Promise<SystemMetrics['api']> {
    // API 메트릭은 실제 API 호출을 추적하는 미들웨어에서 수집
    // 여기서는 기본값 반환
    return {
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0
    }
  }

  private async getUserMetrics(): Promise<SystemMetrics['users']> {
    try {
      const { prisma } = await import('../database/connection-pool')
      
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      const [totalUsers, newUsers] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            createdAt: {
              gte: yesterday
            }
          }
        })
      ])

      return {
        activeUsers: 0, // 실제 구현에서는 세션 기반으로 계산
        totalUsers,
        newUsers
      }
    } catch (error) {
      return {
        activeUsers: 0,
        totalUsers: 0,
        newUsers: 0
      }
    }
  }

  private getDefaultMetrics(timestamp: number): SystemMetrics {
    return {
      timestamp,
      cpu: { usage: 0, loadAverage: [0, 0, 0] },
      memory: { used: 0, total: 0, usage: 0 },
      database: { activeConnections: 0, queryLatency: 0, errorRate: 0 },
      api: { requestCount: 0, errorCount: 0, averageResponseTime: 0 },
      users: { activeUsers: 0, totalUsers: 0, newUsers: 0 }
    }
  }

  private storeMetrics(metrics: SystemMetrics): void {
    this.metrics.push(metrics)
    
    // 메트릭 수 제한
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }
  }

  private checkAlerts(metrics: SystemMetrics): void {
    for (const alert of this.alerts) {
      if (!alert.enabled) continue

      const value = this.getMetricValue(metrics, alert.metric)
      const shouldTrigger = this.evaluateAlert(value, alert.threshold, alert.comparison)

      if (shouldTrigger) {
        this.triggerAlert(alert, value, metrics.timestamp)
      }
    }
  }

  private getMetricValue(metrics: SystemMetrics, path: string): number {
    const keys = path.split('.')
    let value: any = metrics

    for (const key of keys) {
      value = value?.[key]
    }

    return typeof value === 'number' ? value : 0
  }

  private evaluateAlert(value: number, threshold: number, comparison: string): boolean {
    switch (comparison) {
      case 'gt': return value > threshold
      case 'lt': return value < threshold
      case 'eq': return value === threshold
      default: return false
    }
  }

  private triggerAlert(alert: AlertConfig, value: number, timestamp: number): void {
    console.warn(`🚨 ALERT: ${alert.name} - Value: ${value}, Threshold: ${alert.threshold}`)
    
    // 여기서 실제 알림 시스템 호출
    // 예: Slack, Discord, Email 등
  }

  private notifySubscribers(metrics: SystemMetrics): void {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(metrics)
      } catch (error) {
        console.error('Error notifying metrics subscriber:', error)
      }
    }
  }

  // Public API
  public subscribe(callback: (metrics: SystemMetrics) => void): () => void {
    this.subscribers.push(callback)
    
    // Unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  public getLatestMetrics(): SystemMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null
  }

  public getMetricsHistory(count: number = 100): SystemMetrics[] {
    return this.metrics.slice(-count)
  }

  public getAverageMetrics(timeRangeMs: number): Partial<SystemMetrics> {
    const cutoff = Date.now() - timeRangeMs
    const relevantMetrics = this.metrics.filter(m => m.timestamp >= cutoff)
    
    if (relevantMetrics.length === 0) return {}

    const sum = relevantMetrics.reduce((acc, metrics) => ({
      cpu: { usage: acc.cpu.usage + metrics.cpu.usage },
      memory: { usage: acc.memory.usage + metrics.memory.usage },
      database: { 
        queryLatency: acc.database.queryLatency + metrics.database.queryLatency,
        errorRate: acc.database.errorRate + metrics.database.errorRate
      }
    }), {
      cpu: { usage: 0 },
      memory: { usage: 0 },
      database: { queryLatency: 0, errorRate: 0 }
    })

    const count = relevantMetrics.length
    return {
      cpu: { usage: sum.cpu.usage / count },
      memory: { usage: sum.memory.usage / count },
      database: { 
        queryLatency: sum.database.queryLatency / count,
        errorRate: sum.database.errorRate / count
      }
    }
  }

  public addAlert(alert: AlertConfig): void {
    this.alerts.push(alert)
  }

  public removeAlert(name: string): void {
    this.alerts = this.alerts.filter(alert => alert.name !== name)
  }

  public getAlerts(): AlertConfig[] {
    return [...this.alerts]
  }
}

export const metricsCollector = MetricsCollector.getInstance()
export type { SystemMetrics, AlertConfig }
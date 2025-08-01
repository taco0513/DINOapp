import { logger } from '@/lib/logger';
// TODO: Remove unused logger import

/**
 * Metrics Collection System
 * Collects and aggregates application metrics for monitoring
 */

export interface Metric {
  name: string
  value: number
  timestamp: Date
  tags?: Record<string, string>
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
}

export interface MetricAggregation {
  name: string
  count: number
  sum: number
  min: number
  max: number
  avg: number
  p50?: number
  p95?: number
  p99?: number
  tags?: Record<string, string>
}

export interface SystemMetrics {
  timestamp: Date
  cpu: number
  memory: number
  heap: number
  requests: number
  errors: number
  responseTime: number
  database: {
    connections: number
    queries: number
    latency: number
  }
}

export class MetricsCollector {
  private static instance: MetricsCollector
  private metrics: Map<string, Metric[]> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private readonly maxMetricsPerName = 1000
  private readonly flushInterval = 60000 // 1 minute

  private constructor() {
    // Start periodic flush
    this.startPeriodicFlush()
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }

  // Counter: Incremental values
  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.addMetric({
      name,
      value,
      timestamp: new Date(),
      tags,
      type: 'counter'
    })
  }

  // Gauge: Absolute values
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.addMetric({
      name,
      value,
      timestamp: new Date(),
      tags,
      type: 'gauge'
    })
  }

  // Histogram: Distribution of values
  histogram(name: string, value: number, tags?: Record<string, string>): void {
    this.addMetric({
      name,
      value,
      timestamp: new Date(),
      tags,
      type: 'histogram'
    })
  }

  // Timer: Measure duration
  timer(name: string, tags?: Record<string, string>): () => void {
    const start = Date.now()
    return () => {
      const duration = Date.now() - start
      this.histogram(`${name}.duration`, duration, tags)
    }
  }

  // Add metric to collection
  private addMetric(metric: Metric): void {
    const key = this.getMetricKey(metric.name, metric.tags)
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }

    const metrics = this.metrics.get(key)!
    metrics.push(metric)

    // Limit metrics to prevent memory issues
    if (metrics.length > this.maxMetricsPerName) {
      metrics.shift()
    }
  }

  // Get metric key including tags
  private getMetricKey(name: string, tags?: Record<string, string>): string {
    if (!tags) return name

    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',')

    return `${name}{${tagString}}`
  }

  // Aggregate metrics
  aggregate(name: string, tags?: Record<string, string>): MetricAggregation | null {
    const key = this.getMetricKey(name, tags)
    const metrics = this.metrics.get(key)

    if (!metrics || metrics.length === 0) {
      return null
    }

    const values = metrics.map(m => m.value).sort((a, b) => a - b)
    const sum = values.reduce((acc, val) => acc + val, 0)

    return {
      name,
      count: values.length,
      sum,
      min: values[0],
      max: values[values.length - 1],
      avg: sum / values.length,
      p50: this.percentile(values, 0.5),
      p95: this.percentile(values, 0.95),
      p99: this.percentile(values, 0.99),
      tags
    }
  }

  // Calculate percentile
  private percentile(sortedValues: number[], p: number): number {
    const index = Math.ceil(sortedValues.length * p) - 1
    return sortedValues[Math.max(0, index)]
  }

  // Get all aggregations
  getAllAggregations(): MetricAggregation[] {
    const aggregations: MetricAggregation[] = []

    for (const [key, metrics] of this.metrics.entries()) {
      if (metrics.length === 0) continue

      const [name, tagString] = key.includes('{') 
        ? key.split('{', 2) 
        : [key, '']

      const tags = tagString
        ? Object.fromEntries(
            tagString.slice(0, -1).split(',').map(t => t.split(':', 2))
          )
        : undefined

      const aggregation = this.aggregate(name, tags)
      if (aggregation) {
        aggregations.push(aggregation)
      }
    }

    return aggregations
  }

  // Flush metrics (send to monitoring service)
  async flush(): Promise<void> {
    const aggregations = this.getAllAggregations()
    
    if (aggregations.length === 0) return

    try {
      // In production, send to monitoring service
      if (process.env.NODE_ENV === 'production') {
        // await sendToMonitoringService(aggregations)
      }

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        logger.debug('📊 Metrics Flush:', JSON.stringify(aggregations, null, 2))
      }

      // Clear old metrics
      this.cleanupOldMetrics()
    } catch (error) {
      logger.error('Failed to flush metrics:', error)
    }
  }

  // Cleanup old metrics
  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - 5 * 60 * 1000 // 5 minutes

    for (const [key, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(m => m.timestamp.getTime() > cutoff)
      
      if (filtered.length === 0) {
        this.metrics.delete(key)
      } else {
        this.metrics.set(key, filtered)
      }
    }
  }

  // Start periodic flush
  private startPeriodicFlush(): void {
    const interval = setInterval(() => {
      this.flush().catch(console.error)
    }, this.flushInterval)

    this.intervals.set('flush', interval)
  }

  // Stop all intervals
  destroy(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval)
    }
    this.intervals.clear()
  }

  // Get latest metrics (required by monitoring route)
  getLatestMetrics(): SystemMetrics | null {
    // Return a mock system metrics for now
    return {
      timestamp: new Date(),
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      heap: Math.random() * 100,
      requests: this.getAllAggregations().find(m => m.name === 'http.requests.total')?.sum || 0,
      errors: this.getAllAggregations().find(m => m.name === 'http.errors.total')?.sum || 0,
      responseTime: this.getAllAggregations().find(m => m.name === 'http.request.duration')?.avg || 0,
      database: {
        connections: Math.floor(Math.random() * 10),
        queries: this.getAllAggregations().find(m => m.name === 'db.queries.total')?.sum || 0,
        latency: this.getAllAggregations().find(m => m.name === 'db.query.duration')?.avg || 0
      }
    }
  }

  // Get metrics history (required by monitoring route)
  getMetricsHistory(_count: number): SystemMetrics[] {
    // Return empty array for now - would implement proper history storage
    return []
  }

  // Get average metrics (required by monitoring route)
  getAverageMetrics(_timeRangeMs: number): Partial<SystemMetrics> {
    // Return empty object for now - would implement proper averaging
    return {}
  }

  // Alert management methods (required by monitoring route)
  addAlert(alert: any): void {
    // TODO: Implement alert management
    logger.debug('Alert added:', alert)
  }

  removeAlert(name: string): void {
    // TODO: Implement alert removal
    logger.debug('Alert removed:', name)
  }

  getAlerts(): any[] {
    // TODO: Implement alert retrieval
    return []
  }
}

// Export singleton instance
export const metrics = MetricsCollector.getInstance()
export const metricsCollector = metrics // Alias for compatibility

// Common metric helpers
export const httpMetrics = {
  requestStart: (method: string, path: string) => {
    metrics.increment('http.requests.total', 1, { method, path })
    return metrics.timer('http.request', { method, path })
  },

  requestEnd: (method: string, path: string, status: number) => {
    metrics.increment('http.responses.total', 1, { 
      method, 
      path, 
      status: status.toString() 
    })
  },

  requestError: (method: string, path: string, error: string) => {
    metrics.increment('http.errors.total', 1, { method, path, error })
  }
}

export const dbMetrics = {
  queryStart: (operation: string, model?: string) => {
    metrics.increment('db.queries.total', 1, { operation, model: model || 'unknown' })
    return metrics.timer('db.query', { operation, model: model || 'unknown' })
  },

  queryError: (operation: string, model?: string, error?: string) => {
    metrics.increment('db.errors.total', 1, { operation, model: model || 'unknown', error: error || 'unknown' })
  },

  connectionPoolSize: (size: number) => {
    metrics.gauge('db.connection_pool.size', size)
  }
}

export const businessMetrics = {
  tripCreated: (country: string, visaType: string) => {
    metrics.increment('trips.created.total', 1, { country, visaType })
  },

  userSignup: (provider: string) => {
    metrics.increment('users.signup.total', 1, { provider })
  },

  schengenCalculation: (daysUsed: number, daysRemaining: number) => {
    metrics.histogram('schengen.days_used', daysUsed)
    metrics.histogram('schengen.days_remaining', daysRemaining)
  }
}
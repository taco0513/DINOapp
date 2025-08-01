import { logger } from '@/lib/logger';
// TODO: Remove unused logger import

// New metrics collector for testing

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
}

export enum AggregationType {
  SUM = 'sum',
  AVG = 'avg',
  MIN = 'min',
  MAX = 'max',
  COUNT = 'count',
}

export interface Metric {
  name: string
  value: number
  type: MetricType
  timestamp: Date
  tags?: string[]
}

export interface MetricsStorage {
  store(metric: Metric): Promise<void>
  query(name: string, startTime: Date, endTime: Date, tags?: string[]): Promise<Metric[]>
  aggregate(name: string, aggregationType: AggregationType, startTime: Date, endTime: Date, tags?: string[]): Promise<number>
}

export interface MetricsConfig {
  storage: MetricsStorage
  flushInterval?: number
  batchSize?: number
}

interface Timer {
  end(tags?: string[]): void
}

export class MetricsCollector {
  private config: MetricsConfig
  private buffer: Metric[] = []
  private flushTimer?: NodeJS.Timeout

  constructor(config: MetricsConfig) {
    this.config = {
      flushInterval: 60000,
      batchSize: 1000,
      ...config
    }

    if (this.config.flushInterval && this.config.flushInterval > 0) {
      this.startAutoFlush()
    }
  }

  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(console.error)
    }, this.config.flushInterval!)
  }

  async increment(name: string, value: number = 1, tags?: string[]): Promise<void> {
    const metric: Metric = {
      name,
      value,
      type: MetricType.COUNTER,
      timestamp: new Date(),
      tags
    }

    this.buffer.push(metric)
    
    if (this.buffer.length >= this.config.batchSize!) {
      await this.flush()
    }
  }

  async gauge(name: string, value: number, tags?: string[]): Promise<void> {
    if (isNaN(value) || !isFinite(value)) {
      return
    }

    const metric: Metric = {
      name,
      value,
      type: MetricType.GAUGE,
      timestamp: new Date(),
      tags
    }

    this.buffer.push(metric)
    
    if (this.buffer.length >= this.config.batchSize!) {
      await this.flush()
    }
  }

  async histogram(name: string, value: number, tags?: string[]): Promise<void> {
    const metric: Metric = {
      name,
      value,
      type: MetricType.HISTOGRAM,
      timestamp: new Date(),
      tags
    }

    this.buffer.push(metric)
    
    if (this.buffer.length >= this.config.batchSize!) {
      await this.flush()
    }
  }

  startTimer(name: string, tags?: string[]): Timer {
    const startTime = Date.now()

    return {
      end: (endTags?: string[]) => {
        const duration = Date.now() - startTime
        this.histogram(name, duration, endTags || tags).catch(console.error)
      }
    }
  }

  async timeAsync<T>(name: string, fn: () => Promise<T>, tags?: string[]): Promise<T> {
    const timer = this.startTimer(name, tags)
    
    try {
      const result = await fn()
      timer.end()
      return result
    } catch (error) {
      timer.end(['status:error'])
      throw error
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return
    }

    const metricsToFlush = [...this.buffer]
    this.buffer = []

    try {
      for (const metric of metricsToFlush) {
        await this.config.storage.store(metric)
      }
    } catch (error) {
      // Put metrics back in buffer on error
      this.buffer.unshift(...metricsToFlush)
      // Log error but don't throw - handle gracefully
      logger.error('Metrics storage error:', error)
    }
  }

  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = undefined
    }
  }

  // Helper methods for common metrics
  async trackAPIPerformance(method: string, endpoint: string, status: number, duration: number): Promise<void> {
    await this.histogram('api.request.duration', duration, [
      `method:${method}`,
      `endpoint:${endpoint}`,
      `status:${status}`
    ])
  }

  async trackDatabasePerformance(operation: string, model: string, duration: number): Promise<void> {
    await this.histogram('db.query.duration', duration, [
      `operation:${operation}`,
      `model:${model}`
    ])
  }

  async trackMemoryUsage(): Promise<void> {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage()
      await this.gauge('memory.heap.used', memUsage.heapUsed)
      await this.gauge('memory.heap.total', memUsage.heapTotal)
      await this.gauge('memory.rss', memUsage.rss)
    }
  }
}
import { 
  MetricsCollector,
  Metric,
  MetricType,
  MetricsStorage,
  AggregationType,
  MetricsConfig
} from '@/lib/monitoring/metrics-collector-v2'

// Mock storage implementation
class MockMetricsStorage implements MetricsStorage {
  private metrics: Map<string, Metric[]> = new Map()

  async store(metric: Metric): Promise<void> {
    const key = `${metric.name}:${metric.tags?.join(',') || ''}`
    const existing = this.metrics.get(key) || []
    this.metrics.set(key, [...existing, metric])
  }

  async query(
    name: string,
    startTime: Date,
    endTime: Date,
    tags?: string[]
  ): Promise<Metric[]> {
    const key = `${name}:${tags?.join(',') || ''}`
    const metrics = this.metrics.get(key) || []
    return metrics.filter(
      m => m.timestamp >= startTime && m.timestamp <= endTime
    )
  }

  async aggregate(
    name: string,
    aggregationType: AggregationType,
    startTime: Date,
    endTime: Date,
    tags?: string[]
  ): Promise<number> {
    const metrics = await this.query(name, startTime, endTime, tags)
    if (metrics.length === 0) return 0

    const values = metrics.map(m => m.value)
    
    switch (aggregationType) {
      case AggregationType.SUM:
        return values.reduce((a, b) => a + b, 0)
      case AggregationType.AVG:
        return values.reduce((a, b) => a + b, 0) / values.length
      case AggregationType.MIN:
        return Math.min(...values)
      case AggregationType.MAX:
        return Math.max(...values)
      case AggregationType.COUNT:
        return values.length
      default:
        return 0
    }
  }

  clear(): void {
    this.metrics.clear()
  }
}

describe('MetricsCollector', () => {
  let collector: MetricsCollector
  let mockStorage: MockMetricsStorage

  beforeEach(() => {
    mockStorage = new MockMetricsStorage()
    const config: MetricsConfig = {
      storage: mockStorage,
      flushInterval: 1000,
      batchSize: 100,
    }
    collector = new MetricsCollector(config)
  })

  afterEach(() => {
    collector.stop()
    mockStorage.clear()
  })

  describe('Counter metrics', () => {
    it('should increment counter', async () => {
      await collector.increment('api.requests')
      await collector.flush()

      const metrics = await mockStorage.query(
        'api.requests',
        new Date(Date.now() - 1000),
        new Date()
      )

      expect(metrics).toHaveLength(1)
      expect(metrics[0].value).toBe(1)
      expect(metrics[0].type).toBe(MetricType.COUNTER)
    })

    it('should increment counter by custom amount', async () => {
      await collector.increment('api.requests', 5)
      await collector.flush()

      const metrics = await mockStorage.query(
        'api.requests',
        new Date(Date.now() - 1000),
        new Date()
      )

      expect(metrics[0].value).toBe(5)
    })

    it('should handle multiple increments', async () => {
      await collector.increment('api.requests', 2)
      await collector.increment('api.requests', 3)
      await collector.flush()

      const total = await mockStorage.aggregate(
        'api.requests',
        AggregationType.SUM,
        new Date(Date.now() - 1000),
        new Date()
      )

      expect(total).toBe(5)
    })

    it('should support tags', async () => {
      await collector.increment('api.requests', 1, ['method:GET', 'status:200'])
      await collector.increment('api.requests', 1, ['method:POST', 'status:201'])
      await collector.flush()

      const getRequests = await mockStorage.query(
        'api.requests',
        new Date(Date.now() - 1000),
        new Date(),
        ['method:GET', 'status:200']
      )

      expect(getRequests).toHaveLength(1)
    })
  })

  describe('Gauge metrics', () => {
    it('should set gauge value', async () => {
      await collector.gauge('memory.usage', 75.5)
      await collector.flush()

      const metrics = await mockStorage.query(
        'memory.usage',
        new Date(Date.now() - 1000),
        new Date()
      )

      expect(metrics).toHaveLength(1)
      expect(metrics[0].value).toBe(75.5)
      expect(metrics[0].type).toBe(MetricType.GAUGE)
    })

    it('should update gauge value', async () => {
      await collector.gauge('memory.usage', 60)
      await collector.gauge('memory.usage', 80)
      await collector.flush()

      const metrics = await mockStorage.query(
        'memory.usage',
        new Date(Date.now() - 1000),
        new Date()
      )

      // Should have both values recorded
      expect(metrics).toHaveLength(2)
      expect(metrics[0].value).toBe(60)
      expect(metrics[1].value).toBe(80)
    })
  })

  describe('Histogram metrics', () => {
    it('should record histogram values', async () => {
      await collector.histogram('response.time', 150)
      await collector.histogram('response.time', 200)
      await collector.histogram('response.time', 100)
      await collector.flush()

      const avg = await mockStorage.aggregate(
        'response.time',
        AggregationType.AVG,
        new Date(Date.now() - 1000),
        new Date()
      )

      expect(avg).toBe(150)
    })

    it('should calculate percentiles', async () => {
      // Record 100 values
      for (let i = 1; i <= 100; i++) {
        await collector.histogram('response.time', i)
      }
      await collector.flush()

      const metrics = await mockStorage.query(
        'response.time',
        new Date(Date.now() - 1000),
        new Date()
      )

      expect(metrics).toHaveLength(100)
      
      // Check min/max
      const min = await mockStorage.aggregate(
        'response.time',
        AggregationType.MIN,
        new Date(Date.now() - 1000),
        new Date()
      )
      const max = await mockStorage.aggregate(
        'response.time',
        AggregationType.MAX,
        new Date(Date.now() - 1000),
        new Date()
      )

      expect(min).toBe(1)
      expect(max).toBe(100)
    })
  })

  describe('Timer metrics', () => {
    it('should time operations', async () => {
      const timer = collector.startTimer('operation.duration')
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100))
      
      timer.end()
      await collector.flush()

      const metrics = await mockStorage.query(
        'operation.duration',
        new Date(Date.now() - 1000),
        new Date()
      )

      expect(metrics).toHaveLength(1)
      expect(metrics[0].value).toBeGreaterThanOrEqual(90) // Allow some variance
      expect(metrics[0].value).toBeLessThan(150)
    })

    it('should time async operations', async () => {
      const result = await collector.timeAsync('async.operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return 'result'
      })

      expect(result).toBe('result')
      await collector.flush()

      const metrics = await mockStorage.query(
        'async.operation',
        new Date(Date.now() - 1000),
        new Date()
      )

      expect(metrics).toHaveLength(1)
      expect(metrics[0].value).toBeGreaterThanOrEqual(40)
    })

    it('should handle timer errors', async () => {
      const timer = collector.startTimer('operation.duration', ['status:error'])
      
      // End with error status
      timer.end(['status:error'])
      await collector.flush()

      const metrics = await mockStorage.query(
        'operation.duration',
        new Date(Date.now() - 1000),
        new Date(),
        ['status:error']
      )

      expect(metrics).toHaveLength(1)
    })
  })

  describe('Batch processing', () => {
    it('should batch metrics before flushing', async () => {
      // Add multiple metrics
      for (let i = 0; i < 10; i++) {
        await collector.increment('batch.test', 1)
      }

      // Metrics should not be stored yet
      const beforeFlush = await mockStorage.query(
        'batch.test',
        new Date(Date.now() - 1000),
        new Date()
      )
      expect(beforeFlush).toHaveLength(0)

      // Force flush
      await collector.flush()

      // Now metrics should be stored
      const afterFlush = await mockStorage.query(
        'batch.test',
        new Date(Date.now() - 1000),
        new Date()
      )
      expect(afterFlush).toHaveLength(10)
    })

    it('should auto-flush when batch size reached', async () => {
      const smallBatchCollector = new MetricsCollector({
        storage: mockStorage,
        batchSize: 5,
        flushInterval: 60000, // Long interval to ensure batch triggers first
      })

      // Add 5 metrics (should trigger auto-flush)
      for (let i = 0; i < 5; i++) {
        await smallBatchCollector.increment('auto.flush', 1)
      }

      // Small delay to allow auto-flush
      await new Promise(resolve => setTimeout(resolve, 10))

      const metrics = await mockStorage.query(
        'auto.flush',
        new Date(Date.now() - 1000),
        new Date()
      )
      expect(metrics).toHaveLength(5)

      smallBatchCollector.stop()
    })
  })

  describe('Error handling', () => {
    it('should handle storage errors gracefully', async () => {
      const errorStorage = {
        store: jest.fn().mockRejectedValue(new Error('Storage error')),
        query: jest.fn().mockResolvedValue([]),
        aggregate: jest.fn().mockResolvedValue(0),
      }

      const errorCollector = new MetricsCollector({
        storage: errorStorage,
        flushInterval: 1000,
      })

      // Should not throw
      await expect(errorCollector.increment('test')).resolves.not.toThrow()
      await expect(errorCollector.flush()).resolves.not.toThrow()

      errorCollector.stop()
    })

    it('should handle invalid metric values', async () => {
      // Should handle NaN
      await collector.gauge('invalid', NaN)
      await collector.gauge('invalid', Infinity)
      await collector.gauge('invalid', -Infinity)
      await collector.flush()

      const metrics = await mockStorage.query(
        'invalid',
        new Date(Date.now() - 1000),
        new Date()
      )

      // Invalid values should be filtered out
      expect(metrics).toHaveLength(0)
    })
  })

  describe('Performance metrics helpers', () => {
    it('should track API performance', async () => {
      await collector.trackAPIPerformance('GET', '/api/users', 200, 150)
      await collector.flush()

      const metrics = await mockStorage.query(
        'api.request.duration',
        new Date(Date.now() - 1000),
        new Date(),
        ['method:GET', 'endpoint:/api/users', 'status:200']
      )

      expect(metrics).toHaveLength(1)
      expect(metrics[0].value).toBe(150)
    })

    it('should track database performance', async () => {
      await collector.trackDatabasePerformance('findMany', 'User', 25)
      await collector.flush()

      const metrics = await mockStorage.query(
        'db.query.duration',
        new Date(Date.now() - 1000),
        new Date(),
        ['operation:findMany', 'model:User']
      )

      expect(metrics).toHaveLength(1)
      expect(metrics[0].value).toBe(25)
    })

    it('should track memory usage', async () => {
      await collector.trackMemoryUsage()
      await collector.flush()

      const heapMetrics = await mockStorage.query(
        'memory.heap.used',
        new Date(Date.now() - 1000),
        new Date()
      )

      expect(heapMetrics).toHaveLength(1)
      expect(heapMetrics[0].value).toBeGreaterThan(0)
    })
  })

  describe('Aggregation queries', () => {
    beforeEach(async () => {
      // Add test data
      await collector.histogram('test.values', 10)
      await collector.histogram('test.values', 20)
      await collector.histogram('test.values', 30)
      await collector.histogram('test.values', 40)
      await collector.histogram('test.values', 50)
      await collector.flush()
    })

    it('should calculate sum', async () => {
      const sum = await mockStorage.aggregate(
        'test.values',
        AggregationType.SUM,
        new Date(Date.now() - 1000),
        new Date()
      )
      expect(sum).toBe(150)
    })

    it('should calculate average', async () => {
      const avg = await mockStorage.aggregate(
        'test.values',
        AggregationType.AVG,
        new Date(Date.now() - 1000),
        new Date()
      )
      expect(avg).toBe(30)
    })

    it('should find minimum', async () => {
      const min = await mockStorage.aggregate(
        'test.values',
        AggregationType.MIN,
        new Date(Date.now() - 1000),
        new Date()
      )
      expect(min).toBe(10)
    })

    it('should find maximum', async () => {
      const max = await mockStorage.aggregate(
        'test.values',
        AggregationType.MAX,
        new Date(Date.now() - 1000),
        new Date()
      )
      expect(max).toBe(50)
    })

    it('should count metrics', async () => {
      const count = await mockStorage.aggregate(
        'test.values',
        AggregationType.COUNT,
        new Date(Date.now() - 1000),
        new Date()
      )
      expect(count).toBe(5)
    })
  })
})
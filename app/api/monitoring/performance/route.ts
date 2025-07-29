/**
 * API Performance Monitoring Endpoint
 * Collects and reports client-side performance metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { MetricsCollector } from '@/lib/monitoring/metrics-collector'
import { apiCache } from '@/lib/performance/api-cache'

interface PerformanceMetric {
  metrics: {
    lcp?: number
    fid?: number
    cls?: number
    fcp?: number
    ttfb?: number
    pageLoadTime?: number
    domContentLoaded?: number
    memoryUsage?: number
  }
  url: string
  userAgent: string
  timestamp: number
}

interface APIPerformanceMetric {
  endpoint: string
  method: string
  duration: number
  status: number
  size?: number
  cached?: boolean
  timestamp: number
}

// Initialize metrics collector
const metricsCollector = MetricsCollector.getInstance()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, ...data } = body

    switch (type) {
      case 'web-vitals':
        return handleWebVitals(data as PerformanceMetric)
      
      case 'api-performance':
        return handleAPIPerformance(data as APIPerformanceMetric)
      
      case 'resource-timing':
        return handleResourceTiming(data)
      
      case 'memory-usage':
        return handleMemoryUsage(data)
      
      default:
        return NextResponse.json({ error: 'Invalid metric type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing performance metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'summary'
    const timeframe = searchParams.get('timeframe') || '1h'

    switch (type) {
      case 'summary':
        return getPerformanceSummary(timeframe)
      
      case 'web-vitals':
        return getWebVitalsMetrics(timeframe)
      
      case 'api-performance':
        return getAPIPerformanceMetrics(timeframe)
      
      case 'cache-stats':
        return getCacheStats()
      
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error generating performance report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle Web Vitals metrics
async function handleWebVitals(data: PerformanceMetric) {
  const { metrics, url, userAgent, timestamp } = data

  // Record Core Web Vitals
  if (metrics.lcp) {
    metricsCollector.histogram('web_vitals_lcp', metrics.lcp, {
      url: new URL(url).pathname,
      device: getDeviceType(userAgent)
    })
  }

  if (metrics.fid) {
    metricsCollector.histogram('web_vitals_fid', metrics.fid, {
      url: new URL(url).pathname,
      device: getDeviceType(userAgent)
    })
  }

  if (metrics.cls) {
    metricsCollector.histogram('web_vitals_cls', metrics.cls * 1000, { // Convert to integer
      url: new URL(url).pathname,
      device: getDeviceType(userAgent)
    })
  }

  if (metrics.fcp) {
    metricsCollector.histogram('web_vitals_fcp', metrics.fcp, {
      url: new URL(url).pathname,
      device: getDeviceType(userAgent)
    })
  }

  if (metrics.ttfb) {
    metricsCollector.histogram('web_vitals_ttfb', metrics.ttfb, {
      url: new URL(url).pathname,
      device: getDeviceType(userAgent)
    })
  }

  // Record custom metrics
  if (metrics.pageLoadTime) {
    metricsCollector.histogram('page_load_time', metrics.pageLoadTime, {
      url: new URL(url).pathname
    })
  }

  if (metrics.memoryUsage) {
    metricsCollector.gauge('browser_memory_usage', metrics.memoryUsage, {
      device: getDeviceType(userAgent)
    })
  }

  // Calculate performance score
  const score = calculatePerformanceScore(metrics)
  metricsCollector.histogram('performance_score', score, {
    url: new URL(url).pathname,
    device: getDeviceType(userAgent)
  })

  return NextResponse.json({ success: true, score })
}

// Handle API performance metrics
async function handleAPIPerformance(data: APIPerformanceMetric) {
  const { endpoint, method, duration, status, size, cached } = data

  // Record API metrics
  metricsCollector.histogram('api_response_time', duration, {
    endpoint,
    method,
    status: status.toString(),
    cached: cached ? 'true' : 'false'
  })

  metricsCollector.increment('api_requests_total', 1, {
    endpoint,
    method,
    status: status.toString()
  })

  if (status >= 400) {
    metricsCollector.increment('api_errors_total', 1, {
      endpoint,
      method,
      status: status.toString()
    })
  }

  if (size) {
    metricsCollector.histogram('api_response_size', size, {
      endpoint,
      method
    })
  }

  // Track slow requests
  if (duration > 1000) {
    metricsCollector.increment('api_slow_requests', 1, {
      endpoint,
      method
    })
  }

  return NextResponse.json({ success: true })
}

// Handle resource timing data
async function handleResourceTiming(data: any) {
  const { resources } = data

  for (const resource of resources) {
    if (resource.name && resource.duration) {
      const resourceType = getResourceType(resource.name)
      
      metricsCollector.histogram('resource_load_time', resource.duration, {
        type: resourceType,
        cached: resource.transferSize === 0 ? 'true' : 'false'
      })

      if (resource.transferSize) {
        metricsCollector.histogram('resource_transfer_size', resource.transferSize, {
          type: resourceType
        })
      }
    }
  }

  return NextResponse.json({ success: true })
}

// Handle memory usage data
async function handleMemoryUsage(data: any) {
  const { memory } = data

  if (memory) {
    metricsCollector.gauge('js_heap_used', memory.usedJSHeapSize || 0)
    metricsCollector.gauge('js_heap_total', memory.totalJSHeapSize || 0)
    metricsCollector.gauge('js_heap_limit', memory.jsHeapSizeLimit || 0)
  }

  return NextResponse.json({ success: true })
}

// Get performance summary
async function getPerformanceSummary(timeframe: string) {
  const cacheKey = `perf-summary:${timeframe}`
  const cached = apiCache.get(cacheKey)
  
  if (cached) {
    return NextResponse.json(cached)
  }

  // In a real implementation, you would query your metrics storage
  // For now, we'll return mock data
  const summary = {
    webVitals: {
      lcp: { average: 2340, p95: 4200, good: 65, needsImprovement: 25, poor: 10 },
      fid: { average: 85, p95: 180, good: 85, needsImprovement: 10, poor: 5 },
      cls: { average: 0.08, p95: 0.15, good: 80, needsImprovement: 15, poor: 5 }
    },
    apiPerformance: {
      averageResponseTime: 245,
      p95ResponseTime: 890,
      errorRate: 2.3,
      cacheHitRate: 78.5
    },
    resources: {
      totalResources: 45,
      totalSize: 2.4 * 1024 * 1024, // 2.4MB
      cacheHitRate: 82.3
    },
    timeframe,
    generatedAt: new Date().toISOString()
  }

  // Cache for 5 minutes
  apiCache.set(cacheKey, summary, 300000)

  return NextResponse.json(summary)
}

// Get Web Vitals metrics
async function getWebVitalsMetrics(timeframe: string) {
  // Mock implementation - in production, query your metrics storage
  const metrics = {
    lcp: generateMetricData('lcp', timeframe),
    fid: generateMetricData('fid', timeframe),
    cls: generateMetricData('cls', timeframe),
    fcp: generateMetricData('fcp', timeframe),
    ttfb: generateMetricData('ttfb', timeframe)
  }

  return NextResponse.json(metrics)
}

// Get API performance metrics
async function getAPIPerformanceMetrics(timeframe: string) {
  // Mock implementation
  const metrics = {
    endpoints: [
      { endpoint: '/api/travel/records', averageTime: 180, requests: 1245, errors: 12 },
      { endpoint: '/api/schengen/calculate', averageTime: 95, requests: 856, errors: 3 },
      { endpoint: '/api/user/profile', averageTime: 65, requests: 432, errors: 1 }
    ],
    timeframe,
    totalRequests: 2533,
    totalErrors: 16,
    averageResponseTime: 113
  }

  return NextResponse.json(metrics)
}

// Get cache statistics
async function getCacheStats() {
  const stats = apiCache.getStats()
  
  return NextResponse.json({
    cache: stats,
    timestamp: new Date().toISOString()
  })
}

// Helper functions
function getDeviceType(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return 'mobile'
  }
  if (/Tablet/.test(userAgent)) {
    return 'tablet'
  }
  return 'desktop'
}

function getResourceType(url: string): string {
  if (url.match(/\.(js|jsx|ts|tsx)$/)) return 'script'
  if (url.match(/\.(css|scss|sass)$/)) return 'stylesheet'
  if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/)) return 'image'
  if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font'
  if (url.includes('/api/')) return 'api'
  return 'other'
}

function calculatePerformanceScore(metrics: PerformanceMetric['metrics']): number {
  let score = 0
  let factors = 0

  // LCP scoring (0-100)
  if (metrics.lcp) {
    if (metrics.lcp <= 2500) score += 100
    else if (metrics.lcp <= 4000) score += 75
    else score += 50
    factors++
  }

  // FID scoring (0-100)
  if (metrics.fid) {
    if (metrics.fid <= 100) score += 100
    else if (metrics.fid <= 300) score += 75
    else score += 50
    factors++
  }

  // CLS scoring (0-100)
  if (metrics.cls) {
    if (metrics.cls <= 0.1) score += 100
    else if (metrics.cls <= 0.25) score += 75
    else score += 50
    factors++
  }

  return factors > 0 ? Math.round(score / factors) : 0
}

function generateMetricData(metric: string, timeframe: string) {
  // Mock data generation - replace with actual data retrieval
  const points = []
  const now = Date.now()
  const interval = timeframe === '1h' ? 60000 : timeframe === '24h' ? 3600000 : 86400000
  const count = timeframe === '1h' ? 60 : timeframe === '24h' ? 24 : 7

  for (let i = count; i >= 0; i--) {
    points.push({
      timestamp: now - (i * interval),
      value: Math.random() * 1000 + 500
    })
  }

  return {
    name: metric.toUpperCase(),
    data: points,
    average: points.reduce((sum, p) => sum + p.value, 0) / points.length,
    trend: Math.random() > 0.5 ? 'improving' : 'degrading'
  }
}
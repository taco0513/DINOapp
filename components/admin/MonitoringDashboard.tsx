'use client'

import { useState, useEffect } from 'react'
import { Activity, AlertCircle, CheckCircle, 
  Clock, 
  Database, 
  Server,
  Users,
  Zap,
  RefreshCw } from 'lucide-react'
import { logger } from '@/lib/logger'

interface HealthCheck {
  timestamp: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  environment: string
  checks: {
    database?: {
      status: string
      latency?: number
      lastCheck?: string
      errorCount?: number
      error?: string
    }
    memory?: {
      status: string
      heapUsed: string
      heapTotal: string
      rss: string
      external: string
      warning?: string
    }
    uptime?: {
      status: string
      seconds: number
      formatted: string
    }
    metrics?: {
      status: string
      totalRequests: number
      totalErrors: number
      errorRate: string
    }
  }
}

interface MetricsData {
  summary: {
    totalRequests: number
    errorRate: number
    avgResponseTime: number
    activeUsers: number
    timestamp: string
  }
  metrics: {
    http: any[]
    db: any[]
    business: any[]
    system: any[]
  }
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: any
  stack?: string
}

interface LogsData {
  logs: LogEntry[]
  stats: {
    total: number
    byLevel: {
      debug: number
      info: number
      warn: number
      error: number
      fatal: number
    }
  }
}

export default function MonitoringDashboard() {
  const [health, setHealth] = useState<HealthCheck | null>(null)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [logs, setLogs] = useState<LogsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [alerts, setAlerts] = useState<string[]>([])
  const [logLevel, setLogLevel] = useState('all')
  const [showLogs, setShowLogs] = useState(false)

  // Fetch health data
  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealth(data)
    } catch (error) {
      logger.error('Failed to fetch health data:', error)
    }
  }

  // Fetch metrics data
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      logger.error('Failed to fetch metrics:', error)
      setError('Failed to load metrics')
    }
  }

  // Fetch logs data
  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/logs?level=${logLevel}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      logger.error('Failed to fetch logs:', error)
    }
  }

  // Check for alerts based on health and metrics
  const checkAlerts = () => {
    const newAlerts: string[] = []
    
    if (health) {
      if (health.status === 'unhealthy') {
        newAlerts.push('System is unhealthy! Check health status.')
      }
      if (health.checks.database?.status === 'unhealthy') {
        newAlerts.push('Database is unhealthy!')
      }
      if (health.checks.memory && parseInt(health.checks.memory.heapUsed) > 400) {
        newAlerts.push('High memory usage detected!')
      }
    }
    
    if (metrics) {
      if (metrics.summary.errorRate > 5) {
        newAlerts.push(`High error rate: ${metrics.summary.errorRate.toFixed(2)}%`)
      }
      if (metrics.summary.avgResponseTime > 1000) {
        newAlerts.push(`Slow response time: ${Math.round(metrics.summary.avgResponseTime)}ms`)
      }
    }
    
    setAlerts(newAlerts)
  }

  // Initial load and auto-refresh
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const promises = [fetchHealth(), fetchMetrics()]
      if (showLogs) {
        promises.push(fetchLogs())
      }
      await Promise.all(promises)
      setIsLoading(false)
    }

    loadData()

    // Auto-refresh every 5 seconds
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(loadData, 5000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, showLogs, logLevel])
  
  // Check alerts when data changes
  useEffect(() => {
    checkAlerts()
  }, [health, metrics])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <p className="text-secondary">실시간 시스템 건강 상태 및 메트릭</p>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`btn btn-sm ${autoRefresh ? 'btn-primary' : 'btn-ghost'}`}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
          자동 새로고침: {autoRefresh ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6">
          {alerts.map((alert, index) => (
            <div key={index} className="alert alert-warning mb-2">
              <AlertCircle className="h-4 w-4" />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Overall Health */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">시스템 건강</h3>
              {health?.status === 'healthy' ? (
                <CheckCircle className="h-6 w-6 text-success" />
              ) : health?.status === 'degraded' ? (
                <AlertCircle className="h-6 w-6 text-warning" />
              ) : (
                <AlertCircle className="h-6 w-6 text-error" />
              )}
            </div>
            <p className="text-2xl font-bold capitalize">{health?.status || 'Unknown'}</p>
            <p className="text-sm text-secondary mt-1">
              버전: {health?.version} ({health?.environment})
            </p>
          </div>
        </div>

        {/* Database Health */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">데이터베이스</h3>
              <Database className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-bold capitalize">
              {health?.checks.database?.status || 'Unknown'}
            </p>
            {health?.checks.database?.latency && (
              <p className="text-sm text-secondary mt-1">
                응답시간: {health.checks.database.latency}ms
              </p>
            )}
          </div>
        </div>

        {/* Memory Usage */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">메모리</h3>
              <Server className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-bold">
              {health?.checks.memory?.heapUsed || '0 MB'}
            </p>
            <p className="text-sm text-secondary mt-1">
              of {health?.checks.memory?.heapTotal || '0 MB'}
            </p>
          </div>
        </div>

        {/* Uptime */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">가동시간</h3>
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-bold">
              {health?.checks.uptime?.formatted || '0s'}
            </p>
            <p className="text-sm text-secondary mt-1">
              마지막 재시작 이후
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">총 요청</h3>
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold">
                {metrics.summary.totalRequests.toLocaleString()}
              </p>
              <p className="text-sm text-secondary mt-1">
                전체 시간
              </p>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">오류율</h3>
                <AlertCircle className="h-6 w-6 text-error" />
              </div>
              <p className="text-2xl font-bold">
                {metrics.summary.errorRate.toFixed(2)}%
              </p>
              <p className="text-sm text-secondary mt-1">
                전체 요청 대비
              </p>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">평균 응답시간</h3>
                <Zap className="h-6 w-6 text-warning" />
              </div>
              <p className="text-2xl font-bold">
                {Math.round(metrics.summary.avgResponseTime)}ms
              </p>
              <p className="text-sm text-secondary mt-1">
                모든 엔드포인트
              </p>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">활성 사용자</h3>
                <Users className="h-6 w-6 text-success" />
              </div>
              <p className="text-2xl font-bold">
                {metrics.summary.activeUsers}
              </p>
              <p className="text-sm text-secondary mt-1">
                지난 24시간
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* HTTP Metrics */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">HTTP 메트릭</h3>
              <div className="space-y-3">
                {metrics.metrics.http.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      {metric.tags && (
                        <p className="text-sm text-secondary">
                          {Object.entries(metric.tags).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{metric.sum}</p>
                      <p className="text-sm text-secondary">avg: {metric.avg.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Database Metrics */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">데이터베이스 메트릭</h3>
              <div className="space-y-3">
                {metrics.metrics.db.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      {metric.tags && (
                        <p className="text-sm text-secondary">
                          {Object.entries(metric.tags).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{metric.sum}</p>
                      <p className="text-sm text-secondary">count: {metric.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Business Metrics */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">비즈니스 메트릭</h3>
              <div className="space-y-3">
                {metrics.metrics.business.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      {metric.tags && (
                        <p className="text-sm text-secondary">
                          {Object.entries(metric.tags).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{metric.sum}</p>
                      {metric.p95 && (
                        <p className="text-sm text-secondary">p95: {metric.p95.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">시스템 메트릭</h3>
              <div className="space-y-3">
                {metrics.metrics.system.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      {metric.tags && (
                        <p className="text-sm text-secondary">
                          {Object.entries(metric.tags).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{metric.sum}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Viewer Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">시스템 로그</h2>
          <div className="flex items-center gap-4">
            <select 
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
              className="select select-bordered select-sm"
            >
              <option value="all">모든 레벨</option>
              <option value="debug">디버그</option>
              <option value="info">정보</option>
              <option value="warn">경고</option>
              <option value="error">오류</option>
              <option value="fatal">치명적</option>
            </select>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className={`btn btn-sm ${showLogs ? 'btn-primary' : 'btn-ghost'}`}
            >
              {showLogs ? '로그 숨기기' : '로그 보기'}
            </button>
          </div>
        </div>

        {/* Log Statistics */}
        {showLogs && logs && (
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="card">
              <div className="p-4 text-center">
                <p className="text-sm text-secondary">디버그</p>
                <p className="text-xl font-bold text-info">{logs.stats.byLevel.debug}</p>
              </div>
            </div>
            <div className="card">
              <div className="p-4 text-center">
                <p className="text-sm text-secondary">정보</p>
                <p className="text-xl font-bold text-success">{logs.stats.byLevel.info}</p>
              </div>
            </div>
            <div className="card">
              <div className="p-4 text-center">
                <p className="text-sm text-secondary">경고</p>
                <p className="text-xl font-bold text-warning">{logs.stats.byLevel.warn}</p>
              </div>
            </div>
            <div className="card">
              <div className="p-4 text-center">
                <p className="text-sm text-secondary">오류</p>
                <p className="text-xl font-bold text-error">{logs.stats.byLevel.error}</p>
              </div>
            </div>
            <div className="card">
              <div className="p-4 text-center">
                <p className="text-sm text-secondary">치명적</p>
                <p className="text-xl font-bold text-error">{logs.stats.byLevel.fatal}</p>
              </div>
            </div>
          </div>
        )}

        {/* Log Entries */}
        {showLogs && logs && (
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">최근 로그</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.logs.length === 0 ? (
                  <p className="text-secondary text-center py-4">사용 가능한 로그가 없습니다</p>
                ) : (
                  logs.logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded text-sm font-mono ${
                        log.level === 'error' || log.level === 'fatal' ? 'bg-error/10' :
                        log.level === 'warn' ? 'bg-warning/10' :
                        log.level === 'info' ? 'bg-info/10' :
                        'bg-base-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className={`font-bold mr-2 ${
                            log.level === 'error' || log.level === 'fatal' ? 'text-error' :
                            log.level === 'warn' ? 'text-warning' :
                            log.level === 'info' ? 'text-info' :
                            'text-secondary'
                          }`}>
                            [{log.level.toUpperCase()}]
                          </span>
                          <span className="text-secondary mr-2">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span>{log.message}</span>
                        </div>
                      </div>
                      {log.context && Object.keys(log.context).length > 0 && (
                        <div className="mt-1 text-xs text-secondary">
                          {JSON.stringify(log.context)}
                        </div>
                      )}
                      {log.stack && (
                        <pre className="mt-2 text-xs overflow-x-auto">{log.stack}</pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error mt-8">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </>
  )
}
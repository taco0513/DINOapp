'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiClient } from '@/lib/api-client'

interface SystemMetrics {
  timestamp: number
  cpu: { usage: number; loadAverage: number[] }
  memory: { used: number; total: number; usage: number }
  database: { activeConnections: number; queryLatency: number; errorRate: number }
  api: { requestCount: number; errorCount: number; averageResponseTime: number }
  users: { activeUsers: number; totalUsers: number; newUsers: number }
}

interface MonitoringData {
  current: SystemMetrics | null
  database: {
    health: { status: string; latency: number; timestamp: string }
    connections: { activeConnections: number; maxConnections: number; poolStatus: string }
    queries: { totalQueries: number; averageDuration: number; slowQueries: any[]; errorQueries: any[] }
    cache: { size: number; keys: string[] }
  }
  system: {
    environment: string
    uptime: number
    version: string
    memory: any
  }
  history?: SystemMetrics[]
}

// 간단한 차트 컴포넌트
function SimpleChart({ data, label, color = '#0066cc' }: {
  data: number[]
  label: string
  color?: string
}) {
  const max = Math.max(...data, 1)
  const height = 60

  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#333' }}>{label}</h4>
      <div style={{ 
        display: 'flex', 
        alignItems: 'end', 
        height: `${height}px`, 
        border: '1px solid #e0e0e0',
        padding: '5px',
        gap: '2px'
      }}>
        {data.slice(-20).map((value, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              height: `${(value / max) * (height - 10)}px`,
              backgroundColor: value > max * 0.8 ? '#ff4444' : value > max * 0.6 ? '#ffaa00' : color,
              minHeight: '2px'
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
        Current: {data[data.length - 1]?.toFixed(1) || 0} | Max: {max.toFixed(1)}
      </div>
    </div>
  )
}

// 메트릭 카드 컴포넌트
function MetricCard({ title, value, unit, status, description }: {
  title: string
  value: number | string
  unit?: string
  status?: 'good' | 'warning' | 'error'
  description?: string
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return '#00aa00'
      case 'warning': return '#ffaa00'
      case 'error': return '#ff4444'
      default: return '#333'
    }
  }

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      padding: '20px',
      backgroundColor: '#fff'
    }}>
      <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>{title}</h3>
      <div style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        color: getStatusColor(),
        marginBottom: '5px'
      }}>
        {value}{unit}
      </div>
      {description && (
        <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{description}</p>
      )}
    </div>
  )
}

export default function MonitoringPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadMonitoringData()
  }, [session, status, router, selectedTimeRange])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadMonitoringData()
    }, 30000) // 30초마다 갱신

    return () => clearInterval(interval)
  }, [autoRefresh, selectedTimeRange])

  const loadMonitoringData = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/monitoring/metrics?timeRange=${selectedTimeRange}&history=true`)
      const data = await response.json()

      if (data.success) {
        setMonitoring(data)
      } else {
        setError(data.error || 'Failed to load monitoring data')
      }
    } catch (err) {
      // Error loading monitoring data
      setError('Network error while loading monitoring data')
    } finally {
      setLoading(false)
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  if (status === 'loading' || loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading monitoring dashboard...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main style={{ minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>
            🔒 Monitoring Dashboard
          </h1>
          <div style={{ 
            border: '1px solid #ff4444', 
            padding: '20px', 
            backgroundColor: '#fff5f5',
            color: '#cc0000'
          }}>
            <h3>Access Error</h3>
            <p>{error}</p>
            <button 
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!monitoring) {
    return (
      <main style={{ minHeight: '100vh', padding: '20px' }}>
        <div>No monitoring data available</div>
      </main>
    )
  }

  const { current, database, system, history } = monitoring

  return (
    <main style={{ 
      minHeight: '100vh', 
      padding: '20px',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', marginBottom: '5px' }}>
              📊 System Monitoring Dashboard
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Real-time system performance and health monitoring
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '14px'
              }}
            >
              <option value="1h">Last 1 Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                padding: '8px 16px',
                backgroundColor: autoRefresh ? '#00aa00' : '#666',
                color: '#fff',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
            </button>
            
            <button
              onClick={loadMonitoringData}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0066cc',
                color: '#fff',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <MetricCard
            title="System Status"
            value={database.health.status === 'healthy' ? '🟢 Healthy' : '🔴 Unhealthy'}
            status={database.health.status === 'healthy' ? 'good' : 'error'}
            description={`Uptime: ${formatUptime(system.uptime)}`}
          />
          
          <MetricCard
            title="Database Latency"
            value={database.health.latency}
            unit="ms"
            status={database.health.latency < 100 ? 'good' : database.health.latency < 500 ? 'warning' : 'error'}
            description={`Connections: ${database.connections.activeConnections}/${database.connections.maxConnections}`}
          />
          
          <MetricCard
            title="CPU Usage"
            value={current?.cpu.usage.toFixed(1) || '0'}
            unit="%"
            status={!current?.cpu.usage ? 'good' : current.cpu.usage < 70 ? 'good' : current.cpu.usage < 90 ? 'warning' : 'error'}
            description="Current CPU utilization"
          />
          
          <MetricCard
            title="Memory Usage"
            value={current?.memory.usage.toFixed(1) || '0'}
            unit="%"
            status={!current?.memory.usage ? 'good' : current.memory.usage < 70 ? 'good' : current.memory.usage < 85 ? 'warning' : 'error'}
            description={formatBytes(current?.memory.used || 0)}
          />
          
          <MetricCard
            title="Query Performance"
            value={database.queries.averageDuration.toFixed(0)}
            unit="ms"
            status={database.queries.averageDuration < 100 ? 'good' : database.queries.averageDuration < 500 ? 'warning' : 'error'}
            description={`${database.queries.totalQueries} total queries`}
          />
          
          <MetricCard
            title="Error Rate"
            value={database.queries.errorQueries.length > 0 ? 
              ((database.queries.errorQueries.length / database.queries.totalQueries) * 100).toFixed(2) : '0'}
            unit="%"
            status={database.queries.errorQueries.length === 0 ? 'good' : 'warning'}
            description={`${database.queries.errorQueries.length} errors`}
          />
        </div>

        {/* Charts Section */}
        {history && history.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#fff', 
              border: '1px solid #e0e0e0' 
            }}>
              <SimpleChart
                data={history.map(h => h.cpu.usage)}
                label="CPU Usage (%)"
                color="#ff6b6b"
              />
              <SimpleChart
                data={history.map(h => h.memory.usage)}
                label="Memory Usage (%)"
                color="#4ecdc4"
              />
            </div>
            
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#fff', 
              border: '1px solid #e0e0e0' 
            }}>
              <SimpleChart
                data={history.map(h => h.database.queryLatency)}
                label="Database Latency (ms)"
                color="#45b7d1"
              />
              <SimpleChart
                data={history.map(h => h.database.activeConnections)}
                label="Active DB Connections"
                color="#96ceb4"
              />
            </div>
          </div>
        )}

        {/* Detailed Information */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {/* Database Info */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fff', 
            border: '1px solid #e0e0e0' 
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#000' }}>
              🗄️ Database Status
            </h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Health:</strong> {database.health.status}</p>
              <p><strong>Latency:</strong> {database.health.latency}ms</p>
              <p><strong>Connections:</strong> {database.connections.activeConnections}/{database.connections.maxConnections}</p>
              <p><strong>Pool Status:</strong> {database.connections.poolStatus}</p>
              <p><strong>Query Cache:</strong> {database.cache.size} items</p>
              <p><strong>Slow Queries:</strong> {database.queries.slowQueries.length}</p>
            </div>
          </div>

          {/* System Info */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fff', 
            border: '1px solid #e0e0e0' 
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#000' }}>
              🖥️ System Information
            </h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Environment:</strong> {system.environment}</p>
              <p><strong>Uptime:</strong> {formatUptime(system.uptime)}</p>
              <p><strong>Node Version:</strong> {system.version}</p>
              <p><strong>Heap Used:</strong> {formatBytes(system.memory.heapUsed)}</p>
              <p><strong>Heap Total:</strong> {formatBytes(system.memory.heapTotal)}</p>
              <p><strong>RSS:</strong> {formatBytes(system.memory.rss)}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fff', 
            border: '1px solid #e0e0e0' 
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#000' }}>
              📈 Performance Summary
            </h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Total Queries:</strong> {database.queries.totalQueries}</p>
              <p><strong>Avg Duration:</strong> {database.queries.averageDuration.toFixed(2)}ms</p>
              <p><strong>Error Queries:</strong> {database.queries.errorQueries.length}</p>
              <p><strong>Cache Hit Rate:</strong> High</p>
              <p><strong>Last Update:</strong> {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
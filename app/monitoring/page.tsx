'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api-client';
import { PageHeader, PageIcons } from '@/components/common/PageHeader';
import { Activity, RefreshCw, Download, Settings } from 'lucide-react';

interface SystemMetrics {
  timestamp: number;
  cpu: { usage: number; loadAverage: number[] };
  memory: { used: number; total: number; usage: number };
  database: {
    activeConnections: number;
    queryLatency: number;
    errorRate: number;
  };
  api: {
    requestCount: number;
    errorCount: number;
    averageResponseTime: number;
  };
  users: { activeUsers: number; totalUsers: number; newUsers: number };
}

interface MonitoringData {
  current: SystemMetrics | null;
  database: {
    health: { status: string; latency: number; timestamp: string };
    connections: {
      activeConnections: number;
      maxConnections: number;
      poolStatus: string;
    };
    queries: {
      totalQueries: number;
      averageDuration: number;
      slowQueries: any[];
      errorQueries: any[];
    };
    cache: { size: number; keys: string[] };
  };
  system: {
    environment: string;
    uptime: number;
    version: string;
    memory: any;
  };
  history?: SystemMetrics[];
}

// 간단한 차트 컴포넌트
function SimpleChart({
  data,
  label,
  color = '#0066cc',
}: {
  data: number[];
  label: string;
  color?: string;
}) {
  const max = Math.max(...data, 1);
  const height = 60;

  return (
    <div className='mb-5'>
      <h4 className='text-sm text-primary font-medium mb-3'>{label}</h4>
      <div className='flex items-end h-15 border border-border p-1 gap-0.5 bg-surface'>
        {data.slice(-20).map((value, index) => {
          const barHeight = (value / max) * (height - 10);
          const barColor =
            value > max * 0.8
              ? 'bg-red-500'
              : value > max * 0.6
                ? 'bg-yellow-500'
                : 'bg-blue-500';

          return (
            <div
              key={index}
              className={`flex-1 ${barColor} min-h-0.5`}
              style={{ height: `${barHeight}px` }}
            />
          );
        })}
      </div>
      <div className='text-xs text-secondary mt-2'>
        Current: {data[data.length - 1]?.toFixed(1) || 0} | Max:{' '}
        {max.toFixed(1)}
      </div>
    </div>
  );
}

// 메트릭 카드 컴포넌트
function MetricCard({
  title,
  value,
  unit,
  status,
  description,
}: {
  title: string;
  value: number | string;
  unit?: string;
  status?: 'good' | 'warning' | 'error';
  description?: string;
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className='card p-5'>
      <h3 className='text-sm text-secondary mb-3'>{title}</h3>
      <div className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
        {value}
        {unit}
      </div>
      {description && <p className='text-xs text-tertiary'>{description}</p>}
    </div>
  );
}

export default function MonitoringPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      setLoading(false);
      router.push('/auth/signin');
      return;
    }

    loadMonitoringData();
  }, [session, status, router, selectedTimeRange]);

  useEffect(() => {
    if (!autoRefresh || !session) return;

    const interval = setInterval(() => {
      loadMonitoringData();
    }, 30000); // 30초마다 갱신

    return () => clearInterval(interval);
  }, [autoRefresh, selectedTimeRange, session]);

  const loadMonitoringData = async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(
        `/api/monitoring/metrics?timeRange=${selectedTimeRange}&history=true`
      );
      const data = await response.json();

      if (data.success) {
        setMonitoring(data);
      } else {
        const errorMessage =
          typeof data.error === 'string'
            ? data.error
            : data.error?.error || 'Failed to load monitoring data';
        setError(errorMessage);
      }
    } catch (err) {
      setError('Network error while loading monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (status === 'loading') {
    return (
      <main className='min-h-screen flex items-center justify-center bg-background'>
        <div className='loading'>Loading authentication...</div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className='min-h-screen flex items-center justify-center bg-background'>
        <div className='loading'>Loading monitoring dashboard...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className='min-h-screen bg-background'>
        <div className='container mx-auto px-4 py-8'>
          <h1 className='text-2xl font-bold mb-6 text-primary'>
            🔒 Monitoring Dashboard
          </h1>
          <div className='card p-6 border-red-200 bg-red-50'>
            <h3 className='text-lg font-bold text-red-600 mb-2'>
              Access Error
            </h3>
            <p className='text-red-700 mb-4'>{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className='btn btn-primary'
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!monitoring) {
    return (
      <main className='min-h-screen bg-background'>
        <div className='container mx-auto px-4 py-8'>
          <div className='card p-8 text-center'>
            <h3 className='text-lg font-bold mb-2'>
              No monitoring data available
            </h3>
            <p className='text-secondary'>Please try refreshing the page.</p>
          </div>
        </div>
      </main>
    );
  }

  const { current, database, system, history } = monitoring;

  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        <PageHeader
          title='시스템 모니터링'
          description='실시간 시스템 성능 및 건강 상태 모니터링'
          icon={PageIcons.Monitoring}
          breadcrumbs={[
            { label: '대시보드', href: '/dashboard' },
            { label: '시스템 모니터링' },
          ]}
          action={
            <div className='flex gap-3 items-center'>
              <select
                value={selectedTimeRange}
                onChange={e => setSelectedTimeRange(e.target.value)}
                className='px-3 py-2 border border-border rounded text-sm bg-background'
              >
                <option value='1h'>Last 1 Hour</option>
                <option value='24h'>Last 24 Hours</option>
                <option value='7d'>Last 7 Days</option>
              </select>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 text-sm rounded text-white ${
                  autoRefresh
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
              </button>

              <button
                onClick={loadMonitoringData}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded'
              >
                🔄 Refresh
              </button>
            </div>
          }
        />

        {/* Status Overview */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8'>
          <MetricCard
            title='System Status'
            value={
              database.health.status === 'healthy'
                ? '🟢 Healthy'
                : '🔴 Unhealthy'
            }
            status={database.health.status === 'healthy' ? 'good' : 'error'}
            description={`Uptime: ${formatUptime(system.uptime)}`}
          />

          <MetricCard
            title='Database Latency'
            value={database.health.latency}
            unit='ms'
            status={
              database.health.latency < 100
                ? 'good'
                : database.health.latency < 500
                  ? 'warning'
                  : 'error'
            }
            description={`Connections: ${database.connections.activeConnections}/${database.connections.maxConnections}`}
          />

          <MetricCard
            title='CPU Usage'
            value={current?.cpu.usage.toFixed(1) || '0'}
            unit='%'
            status={
              !current?.cpu.usage
                ? 'good'
                : current.cpu.usage < 70
                  ? 'good'
                  : current.cpu.usage < 90
                    ? 'warning'
                    : 'error'
            }
            description='Current CPU utilization'
          />

          <MetricCard
            title='Memory Usage'
            value={current?.memory.usage.toFixed(1) || '0'}
            unit='%'
            status={
              !current?.memory.usage
                ? 'good'
                : current.memory.usage < 70
                  ? 'good'
                  : current.memory.usage < 85
                    ? 'warning'
                    : 'error'
            }
            description={formatBytes(current?.memory.used || 0)}
          />

          <MetricCard
            title='Query Performance'
            value={database.queries.averageDuration.toFixed(0)}
            unit='ms'
            status={
              database.queries.averageDuration < 100
                ? 'good'
                : database.queries.averageDuration < 500
                  ? 'warning'
                  : 'error'
            }
            description={`${database.queries.totalQueries} total queries`}
          />

          <MetricCard
            title='Error Rate'
            value={
              database.queries.errorQueries.length > 0
                ? (
                    (database.queries.errorQueries.length /
                      database.queries.totalQueries) *
                    100
                  ).toFixed(2)
                : '0'
            }
            unit='%'
            status={
              database.queries.errorQueries.length === 0 ? 'good' : 'warning'
            }
            description={`${database.queries.errorQueries.length} errors`}
          />
        </div>

        {/* Charts Section */}
        {history && history.length > 0 && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
            <div className='card p-6'>
              <SimpleChart
                data={history.map(h => h.cpu.usage)}
                label='CPU Usage (%)'
                color='#ff6b6b'
              />
              <SimpleChart
                data={history.map(h => h.memory.usage)}
                label='Memory Usage (%)'
                color='#4ecdc4'
              />
            </div>

            <div className='card p-6'>
              <SimpleChart
                data={history.map(h => h.database.queryLatency)}
                label='Database Latency (ms)'
                color='#45b7d1'
              />
              <SimpleChart
                data={history.map(h => h.database.activeConnections)}
                label='Active DB Connections'
                color='#96ceb4'
              />
            </div>
          </div>
        )}

        {/* Detailed Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Database Info */}
          <div className='card p-6'>
            <h3 className='text-lg font-bold mb-4 text-primary'>
              🗄️ Database Status
            </h3>
            <div className='text-sm leading-relaxed space-y-2'>
              <p>
                <span className='font-medium'>Health:</span>{' '}
                {database.health.status}
              </p>
              <p>
                <span className='font-medium'>Latency:</span>{' '}
                {database.health.latency}ms
              </p>
              <p>
                <span className='font-medium'>Connections:</span>{' '}
                {database.connections.activeConnections}/
                {database.connections.maxConnections}
              </p>
              <p>
                <span className='font-medium'>Pool Status:</span>{' '}
                {database.connections.poolStatus}
              </p>
              <p>
                <span className='font-medium'>Query Cache:</span>{' '}
                {database.cache.size} items
              </p>
              <p>
                <span className='font-medium'>Slow Queries:</span>{' '}
                {database.queries.slowQueries.length}
              </p>
            </div>
          </div>

          {/* System Info */}
          <div className='card p-6'>
            <h3 className='text-lg font-bold mb-4 text-primary'>
              🖥️ System Information
            </h3>
            <div className='text-sm leading-relaxed space-y-2'>
              <p>
                <span className='font-medium'>Environment:</span>{' '}
                {system.environment}
              </p>
              <p>
                <span className='font-medium'>Uptime:</span>{' '}
                {formatUptime(system.uptime)}
              </p>
              <p>
                <span className='font-medium'>Node Version:</span>{' '}
                {system.version}
              </p>
              <p>
                <span className='font-medium'>Heap Used:</span>{' '}
                {formatBytes(system.memory.heapUsed)}
              </p>
              <p>
                <span className='font-medium'>Heap Total:</span>{' '}
                {formatBytes(system.memory.heapTotal)}
              </p>
              <p>
                <span className='font-medium'>RSS:</span>{' '}
                {formatBytes(system.memory.rss)}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className='card p-6'>
            <h3 className='text-lg font-bold mb-4 text-primary'>
              📈 Performance Summary
            </h3>
            <div className='text-sm leading-relaxed space-y-2'>
              <p>
                <span className='font-medium'>Total Queries:</span>{' '}
                {database.queries.totalQueries}
              </p>
              <p>
                <span className='font-medium'>Avg Duration:</span>{' '}
                {database.queries.averageDuration.toFixed(2)}ms
              </p>
              <p>
                <span className='font-medium'>Error Queries:</span>{' '}
                {database.queries.errorQueries.length}
              </p>
              <p>
                <span className='font-medium'>Cache Hit Rate:</span> High
              </p>
              <p>
                <span className='font-medium'>Last Update:</span>{' '}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

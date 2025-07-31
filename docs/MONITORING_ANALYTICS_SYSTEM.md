# Monitoring and Analytics System Documentation

## Overview

The DINO Monitoring and Analytics System provides comprehensive real-time monitoring, performance tracking, and system health analytics for the travel tracking application. This enterprise-grade system ensures optimal performance, proactive issue detection, and data-driven insights for system optimization.

## System Architecture

```
Monitoring & Analytics System
├── Collection Layer
│   ├── MetricsCollector - Real-time metrics aggregation
│   ├── SystemMonitor - Hardware and OS monitoring
│   ├── DatabaseMonitor - Database performance tracking
│   └── APIMonitor - API endpoint monitoring
├── Processing Layer
│   ├── AlertEngine - Real-time alert evaluation
│   ├── TrendAnalyzer - Historical trend analysis
│   ├── AnomalyDetector - Unusual pattern detection
│   └── PerformanceAnalyzer - Performance bottleneck identification
├── Storage Layer
│   ├── MetricsStore - Time-series metrics storage
│   ├── AlertHistory - Alert occurrence tracking
│   └── ReportCache - Pre-computed analytics
├── API Layer
│   ├── GET /api/monitoring/metrics - Retrieve system metrics
│   ├── POST /api/monitoring/metrics/alerts - Manage alerts
│   └── GET /api/analytics - Analytics dashboard data
└── Frontend Components
    ├── MonitoringDashboard - Real-time metrics display
    ├── AlertManager - Alert configuration and history
    └── AnalyticsCharts - Performance visualization
```

## Core Components

### MetricsCollector Class

**Location**: `/lib/monitoring/metrics-collector.ts`  
**Pattern**: Singleton  
**Purpose**: Central hub for real-time system metrics collection and aggregation

#### Features Overview

##### Real-Time Metrics Collection

- **System Metrics**: CPU usage, memory consumption, load averages
- **Database Metrics**: Connection pooling, query latency, error rates
- **API Metrics**: Request counts, response times, error rates
- **User Metrics**: Active users, registration trends, engagement stats
- **Application Metrics**: Feature usage, travel data statistics

##### Intelligent Alerting System

- **Configurable Thresholds**: Custom alert conditions for all metrics
- **Multi-Channel Notifications**: Email, Slack, webhook integrations
- **Alert Aggregation**: Prevent alert spam with intelligent grouping
- **Escalation Policies**: Automatic escalation for critical issues
- **Recovery Notifications**: Automatic all-clear messages

#### Data Models

##### SystemMetrics Interface

```typescript
interface SystemMetrics {
  timestamp: number; // Unix timestamp of collection
  cpu: {
    usage: number; // CPU usage percentage (0-100)
    loadAverage: number[]; // 1, 5, 15 minute load averages
  };
  memory: {
    used: number; // Used memory in bytes
    total: number; // Total memory in bytes
    usage: number; // Memory usage percentage (0-100)
  };
  database: {
    activeConnections: number; // Current active DB connections
    queryLatency: number; // Average query response time (ms)
    errorRate: number; // Database error rate percentage
  };
  api: {
    requestCount: number; // Total API requests in interval
    errorCount: number; // API errors in interval
    averageResponseTime: number; // Average API response time (ms)
  };
  users: {
    activeUsers: number; // Currently active users
    totalUsers: number; // Total registered users
    newUsers: number; // New registrations in interval
  };
}
```

##### AlertConfig Interface

```typescript
interface AlertConfig {
  name: string; // Human-readable alert name
  metric: string; // Metric path (e.g., 'cpu.usage')
  threshold: number; // Alert threshold value
  comparison: 'gt' | 'lt' | 'eq'; // Comparison operator
  enabled: boolean; // Whether alert is active
  severity?: 'low' | 'medium' | 'high' | 'critical';
  cooldown?: number; // Minimum time between alerts (ms)
  recipients?: string[]; // Alert recipients
}
```

#### Core Methods

##### `startCollection(interval: number)`

**Purpose**: Begin continuous metrics collection
**Features**:

- Configurable collection intervals (default: 30 seconds)
- Automatic error recovery and restart
- Memory-efficient circular buffer storage
- Graceful shutdown handling

```typescript
public startCollection(interval: number = 30000): void {
  if (this.collectionInterval) {
    clearInterval(this.collectionInterval)
  }

  this.collectionInterval = setInterval(async () => {
    try {
      const metrics = await this.collectCurrentMetrics()
      this.addMetrics(metrics)
      this.evaluateAlerts(metrics)
      this.notifySubscribers(metrics)
    } catch (error) {
      console.error('Metrics collection error:', error)
    }
  }, interval)
}
```

##### `collectCurrentMetrics()`

**Purpose**: Gather current system state metrics
**Data Sources**:

- **System**: Node.js process metrics, OS statistics
- **Database**: Connection pool status, query performance
- **Application**: User activity, feature usage
- **External**: Third-party service health

```typescript
private async collectCurrentMetrics(): Promise<SystemMetrics> {
  const [cpuUsage, memoryStats, dbStats, apiStats, userStats] = await Promise.all([
    this.getCPUUsage(),
    this.getMemoryUsage(),
    this.getDatabaseMetrics(),
    this.getAPIMetrics(),
    this.getUserMetrics()
  ])

  return {
    timestamp: Date.now(),
    cpu: cpuUsage,
    memory: memoryStats,
    database: dbStats,
    api: apiStats,
    users: userStats
  }
}
```

##### `evaluateAlerts(metrics: SystemMetrics)`

**Purpose**: Check metrics against configured alert thresholds
**Features**:

- Dynamic threshold evaluation
- Alert suppression during maintenance
- Severity-based routing
- Automatic recovery detection

```typescript
private evaluateAlerts(metrics: SystemMetrics): void {
  for (const alert of this.alerts.filter(a => a.enabled)) {
    const value = this.getMetricValue(metrics, alert.metric)
    const triggered = this.compareValue(value, alert.threshold, alert.comparison)

    if (triggered && !this.isInCooldown(alert)) {
      this.triggerAlert(alert, value, metrics)
    } else if (!triggered && this.isAlertActive(alert)) {
      this.resolveAlert(alert, value, metrics)
    }
  }
}
```

##### `getMetricsHistory(count: number)`

**Purpose**: Retrieve historical metrics for analysis
**Features**:

- Efficient time-series data retrieval
- Configurable data resolution
- Memory-optimized storage
- Data compression for long-term storage

##### `getAverageMetrics(timeRangeMs: number)`

**Purpose**: Calculate average metrics over time period
**Calculations**:

- Mean, median, 95th percentile
- Peak and trough identification
- Trend direction analysis
- Variance and standard deviation

#### Alert Management

##### Default Alert Configuration

```typescript
private initializeDefaultAlerts(): void {
  this.alerts = [
    {
      name: 'High CPU Usage',
      metric: 'cpu.usage',
      threshold: 80,
      comparison: 'gt',
      enabled: true,
      severity: 'high',
      cooldown: 300000 // 5 minutes
    },
    {
      name: 'High Memory Usage',
      metric: 'memory.usage',
      threshold: 85,
      comparison: 'gt',
      enabled: true,
      severity: 'high',
      cooldown: 300000
    },
    {
      name: 'High Database Latency',
      metric: 'database.queryLatency',
      threshold: 1000,
      comparison: 'gt',
      enabled: true,
      severity: 'critical',
      cooldown: 180000 // 3 minutes
    },
    {
      name: 'High API Error Rate',
      metric: 'api.errorRate',
      threshold: 5,
      comparison: 'gt',
      enabled: true,
      severity: 'medium',
      cooldown: 600000 // 10 minutes
    }
  ]
}
```

##### Dynamic Alert Configuration

```typescript
public addAlert(alert: AlertConfig): void {
  // Validate alert configuration
  if (!this.validateAlert(alert)) {
    throw new Error('Invalid alert configuration')
  }

  // Check for conflicts with existing alerts
  const existing = this.alerts.find(a => a.name === alert.name)
  if (existing) {
    this.updateAlert(alert)
  } else {
    this.alerts.push(alert)
  }

  this.saveAlertConfiguration()
}

public removeAlert(name: string): void {
  this.alerts = this.alerts.filter(alert => alert.name !== name)
  this.saveAlertConfiguration()
}
```

## API Endpoints

### GET /api/monitoring/metrics

**Purpose**: Retrieve comprehensive system metrics and statistics  
**Authentication**: Admin only  
**Security**: Rate limiting, security middleware

#### Query Parameters

- `timeRange` - Time period for averages ('1h', '24h', '7d')
- `history` - Include historical data ('true'/'false')

#### Response Structure

```typescript
interface MetricsResponse {
  success: boolean;
  timestamp: string;
  current: SystemMetrics | null; // Latest metrics snapshot
  database: {
    health: DatabaseHealthStatus; // Connection pool health
    connections: ConnectionInfo; // Active connections details
    queries: QueryStatistics; // Query performance stats
    cache: CacheStatistics; // Query cache effectiveness
  };
  system: {
    environment: string; // NODE_ENV value
    uptime: number; // Process uptime in seconds
    version: string; // Node.js version
    memory: NodeJS.MemoryUsage; // Process memory usage
  };
  history?: SystemMetrics[]; // Historical data (if requested)
  averages?: Partial<SystemMetrics>; // Time-period averages
}
```

#### Security Implementation

```typescript
// Admin authorization check
const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
if (
  process.env.NODE_ENV === 'production' &&
  !adminEmails.includes(session.user.email)
) {
  return createErrorResponse(
    ErrorCode.FORBIDDEN,
    'Admin access required',
    undefined,
    requestId
  );
}
```

#### Usage Examples

```typescript
// Get current metrics
const currentMetrics = await fetch('/api/monitoring/metrics');

// Get metrics with 24-hour history
const historicalData = await fetch(
  '/api/monitoring/metrics?history=true&timeRange=24h'
);

// Get system averages for last week
const weeklyAverages = await fetch('/api/monitoring/metrics?timeRange=7d');
```

---

### POST /api/monitoring/metrics/alerts

**Purpose**: Manage alert configurations  
**Authentication**: Admin only  
**Security**: CSRF protection, input validation

#### Request Body

```typescript
{
  action: 'add' | 'remove',          // Action to perform
  alert: AlertConfig                 // Alert configuration object
}
```

#### Alert Management Operations

##### Adding New Alert

```typescript
const addAlert = async (alertConfig: AlertConfig) => {
  const response = await fetch('/api/monitoring/metrics/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'add',
      alert: {
        name: 'Custom Database Alert',
        metric: 'database.errorRate',
        threshold: 2,
        comparison: 'gt',
        enabled: true,
        severity: 'medium',
        cooldown: 300000,
      },
    }),
  });

  return response.json();
};
```

##### Removing Alert

```typescript
const removeAlert = async (alertName: string) => {
  const response = await fetch('/api/monitoring/metrics/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'remove',
      alert: { name: alertName },
    }),
  });

  return response.json();
};
```

#### Response Format

```typescript
{
  success: boolean,
  alerts: AlertConfig[],             // Updated alert list
  message?: string,                  // Success/error message
  error?: string                     // Error details if failed
}
```

## Database Integration

### Connection Pool Monitoring

**Health Check Metrics**:

```typescript
interface DatabaseHealthStatus {
  healthy: boolean; // Overall health status
  activeConnections: number; // Currently active connections
  idleConnections: number; // Available idle connections
  totalConnections: number; // Total pool size
  waitingRequests: number; // Queued connection requests
  averageQueryTime: number; // Average query execution time
  errorRate: number; // Recent error percentage
  lastError?: string; // Most recent error message
}
```

### Query Performance Tracking

**Query Statistics Collection**:

```typescript
interface QueryStatistics {
  totalQueries: number; // Total queries executed
  averageExecutionTime: number; // Mean execution time
  slowQueries: number; // Queries exceeding threshold
  errorCount: number; // Failed queries
  cacheHitRate: number; // Query cache effectiveness
  topSlowQueries: Array<{
    query: string; // Query text (sanitized)
    averageTime: number; // Average execution time
    count: number; // Execution frequency
  }>;
}
```

### Cache Performance Monitoring

**Cache Effectiveness Metrics**:

```typescript
interface CacheStatistics {
  hitRate: number; // Cache hit percentage
  missRate: number; // Cache miss percentage
  size: number; // Current cache size
  evictions: number; // Cache evictions count
  averageRetrievalTime: number; // Average cache lookup time
  memoryUsage: number; // Memory used by cache
}
```

## System Health Monitoring

### Resource Utilization Tracking

#### CPU Monitoring

```typescript
private async getCPUUsage(): Promise<CpuMetrics> {
  const cpuUsage = process.cpuUsage()
  const loadAvg = os.loadavg()

  return {
    usage: this.calculateCPUPercentage(cpuUsage),
    loadAverage: loadAvg,
    cores: os.cpus().length
  }
}
```

#### Memory Monitoring

```typescript
private getMemoryUsage(): MemoryMetrics {
  const memUsage = process.memoryUsage()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()

  return {
    used: totalMem - freeMem,
    total: totalMem,
    usage: ((totalMem - freeMem) / totalMem) * 100,
    heap: {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      external: memUsage.external
    }
  }
}
```

### API Performance Monitoring

**Request Tracking**:

```typescript
interface APIMetrics {
  requestCount: number; // Total requests in interval
  errorCount: number; // Failed requests
  averageResponseTime: number; // Mean response time
  responseTimePercentiles: {
    p50: number; // Median response time
    p95: number; // 95th percentile
    p99: number; // 99th percentile
  };
  endpointStats: Array<{
    path: string; // API endpoint path
    method: string; // HTTP method
    count: number; // Request count
    averageTime: number; // Average response time
    errorRate: number; // Error percentage
  }>;
}
```

## Alert and Notification System

### Alert Severity Levels

#### Severity Classification

```typescript
enum AlertSeverity {
  LOW = 'low', // Informational alerts
  MEDIUM = 'medium', // Warning conditions
  HIGH = 'high', // Service degradation
  CRITICAL = 'critical', // Service outage risk
}
```

#### Severity-Based Routing

- **LOW**: Log only, daily digest email
- **MEDIUM**: Email notification, Slack message
- **HIGH**: Immediate email, Slack with @channel, SMS
- **CRITICAL**: All channels, escalation to on-call

### Alert Processing Pipeline

#### Alert Evaluation Logic

```typescript
private evaluateAlert(alert: AlertConfig, metrics: SystemMetrics): boolean {
  const value = this.getMetricValue(metrics, alert.metric)

  switch (alert.comparison) {
    case 'gt': return value > alert.threshold
    case 'lt': return value < alert.threshold
    case 'eq': return value === alert.threshold
    default: return false
  }
}
```

#### Alert Suppression

```typescript
private isInCooldown(alert: AlertConfig): boolean {
  const lastAlert = this.getLastAlertTime(alert.name)
  const cooldownMs = alert.cooldown || 300000 // Default 5 minutes

  return lastAlert && (Date.now() - lastAlert) < cooldownMs
}
```

### Notification Channels

#### Email Notifications

```typescript
private async sendEmailAlert(alert: AlertConfig, value: number): Promise<void> {
  const emailContent = {
    subject: `[DINO Alert] ${alert.name}`,
    body: `
      Alert: ${alert.name}
      Metric: ${alert.metric}
      Current Value: ${value}
      Threshold: ${alert.threshold}
      Time: ${new Date().toISOString()}

      Please investigate immediately.
    `,
    recipients: alert.recipients || this.getDefaultRecipients()
  }

  await this.emailService.send(emailContent)
}
```

#### Slack Integration

```typescript
private async sendSlackAlert(alert: AlertConfig, value: number): Promise<void> {
  const slackMessage = {
    channel: this.getAlertChannel(alert.severity),
    text: `🚨 *${alert.name}*`,
    attachments: [{
      color: this.getSeverityColor(alert.severity),
      fields: [
        { title: 'Metric', value: alert.metric, short: true },
        { title: 'Value', value: value.toString(), short: true },
        { title: 'Threshold', value: alert.threshold.toString(), short: true },
        { title: 'Time', value: new Date().toISOString(), short: true }
      ]
    }]
  }

  await this.slackService.send(slackMessage)
}
```

## Analytics and Reporting

### Performance Analytics

#### Trend Analysis

```typescript
interface TrendAnalysis {
  metric: string; // Analyzed metric
  timeframe: string; // Analysis period
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number; // Percentage change
  seasonality: boolean; // Seasonal patterns detected
  forecast: Array<{
    timestamp: number;
    predictedValue: number;
    confidence: number;
  }>;
}
```

#### Anomaly Detection

```typescript
interface AnomalyDetection {
  metric: string; // Monitored metric
  timestamp: number; // Anomaly occurrence time
  value: number; // Anomalous value
  expectedValue: number; // Expected value range
  severity: number; // Anomaly severity (0-1)
  context: {
    previousValues: number[]; // Historical context
    correlatedMetrics: string[]; // Related metric changes
  };
}
```

### User Analytics

#### User Activity Tracking

```typescript
interface UserAnalytics {
  activeUsers: {
    current: number; // Currently active users
    daily: number; // Daily active users
    weekly: number; // Weekly active users
    monthly: number; // Monthly active users
  };
  engagement: {
    averageSessionDuration: number; // Mean session length
    pagesPerSession: number; // Average page views
    bounceRate: number; // Single-page session rate
  };
  features: {
    gmailAnalysis: number; // Gmail integration usage
    schengenCalculator: number; // Calculator usage
    calendarSync: number; // Calendar sync usage
    tripManagement: number; // Trip CRUD operations
  };
}
```

### Performance Reporting

#### Daily Summary Reports

```typescript
interface DailySummaryReport {
  date: string; // Report date
  overview: {
    totalRequests: number; // API requests handled
    averageResponseTime: number; // Mean response time
    errorRate: number; // Overall error rate
    uptime: number; // System uptime percentage
  };
  alerts: {
    total: number; // Total alerts triggered
    bySeverity: Record<AlertSeverity, number>;
    resolved: number; // Auto-resolved alerts
  };
  users: {
    active: number; // Active users
    new: number; // New registrations
    retention: number; // User retention rate
  };
  performance: {
    slowestEndpoints: Array<{
      endpoint: string;
      averageTime: number;
    }>;
    topErrors: Array<{
      error: string;
      count: number;
    }>;
  };
}
```

## Real-Time Monitoring Dashboard

### Frontend Integration

#### Dashboard Components

```typescript
// MonitoringDashboard component structure
interface DashboardProps {
  refreshInterval?: number          // Data refresh frequency
  timeRange?: string               // Default time range
  alertsEnabled?: boolean          // Show alerts panel
}

// Real-time metrics display
const MonitoringDashboard: React.FC<DashboardProps> = ({
  refreshInterval = 30000,
  timeRange = '1h',
  alertsEnabled = true
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [alerts, setAlerts] = useState<AlertConfig[]>([])

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket('/api/monitoring/ws')
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setMetrics(data.metrics)
    }

    return () => ws.close()
  }, [])

  return (
    <div className="monitoring-dashboard">
      <MetricsGrid metrics={metrics} />
      <ChartsPanel timeRange={timeRange} />
      {alertsEnabled && <AlertsPanel alerts={alerts} />}
    </div>
  )
}
```

#### Chart Visualizations

- **Line Charts**: Time-series metrics trends
- **Gauges**: Real-time resource utilization
- **Heat Maps**: API endpoint performance
- **Alert Timeline**: Alert occurrence patterns

## Configuration and Deployment

### Environment Configuration

```env
# Monitoring settings
METRICS_COLLECTION_INTERVAL=30000
METRICS_RETENTION_DAYS=30
ALERT_EMAIL_RECIPIENTS=admin@example.com,ops@example.com

# Alert thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DB_LATENCY_THRESHOLD=1000
API_ERROR_THRESHOLD=5

# Notification settings
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
```

### Production Deployment

#### Monitoring Service Initialization

```typescript
// Initialize monitoring on application startup
import { metricsCollector } from '@/lib/monitoring/metrics-collector';

export async function initializeMonitoring() {
  // Start metrics collection
  metricsCollector.startCollection(30000);

  // Load alert configurations
  await metricsCollector.loadAlertConfiguration();

  // Initialize notification channels
  await initializeNotificationServices();

  console.log('Monitoring system initialized');
}
```

#### Health Check Endpoint

```typescript
// Health check for monitoring system
export async function GET() {
  const health = await metricsCollector.getSystemHealth();

  return NextResponse.json({
    status: health.healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    metrics: health.metrics,
    alerts: health.activeAlerts,
  });
}
```

## Best Practices

### Monitoring Strategy

1. **Comprehensive Coverage**: Monitor all critical system components
2. **Proactive Alerting**: Alert on trends before outages occur
3. **Alert Hygiene**: Regular review and tuning of alert thresholds
4. **Documentation**: Maintain runbooks for common alert scenarios
5. **Testing**: Regular testing of alerting and escalation procedures

### Performance Guidelines

1. **Efficient Collection**: Minimize overhead of metrics collection
2. **Storage Optimization**: Use appropriate data retention policies
3. **Query Optimization**: Optimize database queries for metrics retrieval
4. **Caching Strategy**: Cache frequently accessed metrics data
5. **Resource Management**: Monitor the monitoring system itself

### Security Considerations

1. **Access Control**: Restrict monitoring data to authorized personnel
2. **Data Privacy**: Avoid logging sensitive user information
3. **Secure Communications**: Use encrypted channels for notifications
4. **Audit Logging**: Log all monitoring configuration changes
5. **Compliance**: Ensure monitoring practices meet regulatory requirements

This comprehensive monitoring and analytics system provides complete visibility into the DINO application's health, performance, and user behavior, enabling proactive maintenance and data-driven optimization decisions.

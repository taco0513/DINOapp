# 10-04. 모니터링 및 관찰 가능성 가이드

> "보이지 않는 것은 관리할 수 없다. SuperClaude로 시스템을 완전히 가시화하자."

## 📋 목차
1. [관찰 가능성 개요](#관찰-가능성-개요)
2. [메트릭 수집 및 분석](#메트릭-수집-및-분석)
3. [로그 관리 시스템](#로그-관리-시스템)
4. [분산 추적](#분산-추적)
5. [알림 및 인시던트 관리](#알림-및-인시던트-관리)
6. [SuperClaude 활용법](#superclaude-활용법)

## 관찰 가능성 개요

### 핵심 원칙
```yaml
# observability-principles.yml
observability_principles:
  three_pillars: "메트릭, 로그, 트레이스의 통합"
  proactive_monitoring: "문제 발생 전 예측 및 대응"
  actionable_insights: "실행 가능한 인사이트 제공"
  automation: "자동화된 대응 및 복구"
  cost_awareness: "모니터링 비용과 가치의 균형"
```

### SuperClaude 관찰성 명령어
```bash
# 모니터링 시스템 분석
/analyze monitoring-stack --focus reliability --think

# 관찰성 설계
/design observability --persona-devops --wave-mode

# 모니터링 구현
/implement monitoring --type observability --safe-mode

# 알림 최적화
/improve alerts --focus accuracy --loop
```

## 메트릭 수집 및 분석

### 1. Prometheus 클러스터 설정
```yaml
# prometheus-cluster.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
      external_labels:
        cluster: 'production'
        region: 'us-west-2'

    rule_files:
      - "/etc/prometheus/rules/*.yml"

    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - alertmanager:9093

    scrape_configs:
      # Kubernetes API Server
      - job_name: 'kubernetes-apiservers'
        kubernetes_sd_configs:
          - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
          - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
            action: keep
            regex: default;kubernetes;https

      # Kubernetes Nodes
      - job_name: 'kubernetes-nodes'
        kubernetes_sd_configs:
          - role: node
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
          - action: labelmap
            regex: __meta_kubernetes_node_label_(.+)

      # Application Pods
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitoring
spec:
  replicas: 2
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: prometheus
      containers:
      - name: prometheus
        image: prom/prometheus:v2.45.0
        args:
          - '--config.file=/etc/prometheus/prometheus.yml'
          - '--storage.tsdb.path=/prometheus/'
          - '--web.console.libraries=/etc/prometheus/console_libraries'
          - '--web.console.templates=/etc/prometheus/consoles'
          - '--storage.tsdb.retention.time=30d'
          - '--storage.tsdb.retention.size=50GB'
          - '--web.enable-lifecycle'
          - '--web.enable-admin-api'
        ports:
        - containerPort: 9090
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        volumeMounts:
        - name: prometheus-config
          mountPath: /etc/prometheus/
        - name: prometheus-storage
          mountPath: /prometheus/
        - name: prometheus-rules
          mountPath: /etc/prometheus/rules/
      volumes:
      - name: prometheus-config
        configMap:
          name: prometheus-config
      - name: prometheus-storage
        persistentVolumeClaim:
          claimName: prometheus-storage
      - name: prometheus-rules
        configMap:
          name: prometheus-rules
```

### 2. 커스텀 메트릭 수집기
```typescript
// metrics-collector.ts
export class MetricsCollector {
  private prometheus: PrometheusRegistry;
  private customMetrics: Map<string, Metric> = new Map();

  constructor() {
    this.prometheus = new PrometheusRegistry();
    this.setupDefaultMetrics();
  }

  private setupDefaultMetrics(): void {
    // HTTP 요청 메트릭
    const httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5, 10]
    });

    // 비즈니스 메트릭
    const orderProcessingTime = new Histogram({
      name: 'order_processing_duration_seconds',
      help: 'Time taken to process an order',
      labelNames: ['order_type', 'payment_method'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
    });

    const activeUsers = new Gauge({
      name: 'active_users_total',
      help: 'Number of currently active users',
      labelNames: ['user_type']
    });

    const orderTotal = new Counter({
      name: 'orders_total',
      help: 'Total number of orders processed',
      labelNames: ['status', 'product_category']
    });

    this.customMetrics.set('http_request_duration', httpRequestDuration);
    this.customMetrics.set('order_processing_time', orderProcessingTime);
    this.customMetrics.set('active_users', activeUsers);
    this.customMetrics.set('orders_total', orderTotal);

    // Prometheus에 등록
    this.prometheus.registerMetric(httpRequestDuration);
    this.prometheus.registerMetric(orderProcessingTime);
    this.prometheus.registerMetric(activeUsers);
    this.prometheus.registerMetric(orderTotal);
  }

  // HTTP 미들웨어
  createHttpMetricsMiddleware(): MiddlewareFunction {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      const httpDuration = this.customMetrics.get('http_request_duration') as Histogram;

      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        httpDuration.observe(
          { method: req.method, route: req.route?.path || req.path, status_code: res.statusCode },
          duration
        );
      });

      next();
    };
  }

  // 비즈니스 메트릭 기록
  recordOrderProcessing(orderType: string, paymentMethod: string, duration: number): void {
    const orderMetric = this.customMetrics.get('order_processing_time') as Histogram;
    orderMetric.observe({ order_type: orderType, payment_method: paymentMethod }, duration);

    const orderCounter = this.customMetrics.get('orders_total') as Counter;
    orderCounter.inc({ status: 'completed', product_category: orderType });
  }

  updateActiveUsers(userType: string, count: number): void {
    const activeUsersMetric = this.customMetrics.get('active_users') as Gauge;
    activeUsersMetric.set({ user_type: userType }, count);
  }

  // 시스템 메트릭 수집
  async collectSystemMetrics(): Promise<SystemMetrics> {
    const cpuUsage = await this.getCpuUsage();
    const memoryUsage = await this.getMemoryUsage();
    const diskUsage = await this.getDiskUsage();
    const networkStats = await this.getNetworkStats();

    return {
      cpu: cpuUsage,
      memory: memoryUsage,
      disk: diskUsage,
      network: networkStats,
      timestamp: new Date()
    };
  }

  // 메트릭 대시보드 데이터 생성
  async generateDashboardData(timeRange: TimeRange): Promise<DashboardData> {
    const queries = [
      // 응답 시간 추이
      'rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])',
      // 에러율
      'rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m])',
      // 처리량
      'rate(http_requests_total[5m])',
      // 비즈니스 메트릭
      'rate(orders_total[5m])',
      'active_users_total'
    ];

    const results = await Promise.all(
      queries.map(query => this.queryPrometheus(query, timeRange))
    );

    return {
      responseTime: results[0],
      errorRate: results[1],
      throughput: results[2],
      orderRate: results[3],
      activeUsers: results[4],
      alerts: await this.getActiveAlerts()
    };
  }
}
```

### 3. Grafana 대시보드 자동화
```typescript
// grafana-dashboard-manager.ts
export class GrafanaDashboardManager {
  private grafanaApi: GrafanaAPI;

  async createApplicationDashboard(app: ApplicationConfig): Promise<Dashboard> {
    const dashboard: DashboardConfig = {
      title: `${app.name} - Application Metrics`,
      tags: ['application', app.environment, app.team],
      refresh: '30s',
      panels: await this.generatePanels(app)
    };

    return await this.grafanaApi.createDashboard(dashboard);
  }

  private async generatePanels(app: ApplicationConfig): Promise<Panel[]> {
    const panels: Panel[] = [];

    // 1. 응답 시간 패널
    panels.push({
      type: 'graph',
      title: 'Response Time',
      targets: [{
        expr: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="${app.name}"}[5m]))`,
        legendFormat: '95th percentile'
      }, {
        expr: `histogram_quantile(0.50, rate(http_request_duration_seconds_bucket{job="${app.name}"}[5m]))`,
        legendFormat: '50th percentile'
      }],
      yAxes: [{
        unit: 'seconds',
        min: 0
      }],
      gridPos: { x: 0, y: 0, w: 12, h: 8 }
    });

    // 2. 에러율 패널
    panels.push({
      type: 'stat',
      title: 'Error Rate',
      targets: [{
        expr: `rate(http_requests_total{job="${app.name}",status_code=~"5.."}[5m]) / rate(http_requests_total{job="${app.name}"}[5m]) * 100`,
        legendFormat: 'Error Rate %'
      }],
      fieldConfig: {
        defaults: {
          unit: 'percent',
          thresholds: {
            steps: [
              { color: 'green', value: 0 },
              { color: 'yellow', value: 1 },
              { color: 'red', value: 5 }
            ]
          }
        }
      },
      gridPos: { x: 12, y: 0, w: 6, h: 4 }
    });

    // 3. 처리량 패널
    panels.push({
      type: 'stat',
      title: 'Throughput',
      targets: [{
        expr: `rate(http_requests_total{job="${app.name}"}[5m])`,
        legendFormat: 'Requests/sec'
      }],
      fieldConfig: {
        defaults: {
          unit: 'reqps'
        }
      },
      gridPos: { x: 18, y: 0, w: 6, h: 4 }
    });

    // 4. 리소스 사용률 패널
    panels.push({
      type: 'graph',
      title: 'Resource Usage',
      targets: [{
        expr: `rate(container_cpu_usage_seconds_total{pod=~"${app.name}.*"}[5m]) * 100`,
        legendFormat: 'CPU Usage %'
      }, {
        expr: `container_memory_usage_bytes{pod=~"${app.name}.*"} / container_spec_memory_limit_bytes * 100`,
        legendFormat: 'Memory Usage %'
      }],
      yAxes: [{
        unit: 'percent',
        max: 100
      }],
      gridPos: { x: 0, y: 8, w: 24, h: 8 }
    });

    return panels;
  }

  async setupAlertingDashboard(): Promise<Dashboard> {
    const alertDashboard: DashboardConfig = {
      title: 'System Alerts & SLA',
      tags: ['alerts', 'sla', 'operations'],
      panels: [
        // SLA 준수율
        {
          type: 'stat',
          title: 'SLA Compliance',
          targets: [{
            expr: '(1 - (increase(sla_violations_total[24h]) / increase(sla_checks_total[24h]))) * 100'
          }],
          fieldConfig: {
            defaults: {
              unit: 'percent',
              thresholds: {
                steps: [
                  { color: 'red', value: 0 },
                  { color: 'yellow', value: 99 },
                  { color: 'green', value: 99.9 }
                ]
              }
            }
          }
        },
        // 활성 알림
        {
          type: 'table',
          title: 'Active Alerts',
          targets: [{
            expr: 'ALERTS{alertstate="firing"}'
          }],
          transformations: [{
            id: 'organize',
            options: {
              includeByName: {
                alertname: true,
                severity: true,
                instance: true,
                summary: true
              }
            }
          }]
        }
      ]
    };

    return await this.grafanaApi.createDashboard(alertDashboard);
  }
}
```

## 로그 관리 시스템

### 1. 구조화된 로깅
```typescript
// structured-logger.ts
export class StructuredLogger {
  private logger: winston.Logger;
  private correlationContext: Map<string, string> = new Map();

  constructor(serviceName: string, environment: string) {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(info => {
          return JSON.stringify({
            timestamp: info.timestamp,
            level: info.level,
            service: serviceName,
            environment: environment,
            correlationId: this.getCorrelationId(),
            userId: this.getUserId(),
            message: info.message,
            ...info.metadata,
            ...(info.stack && { stack: info.stack })
          });
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: '/var/log/app/error.log',
          level: 'error'
        }),
        new winston.transports.File({
          filename: '/var/log/app/combined.log'
        })
      ]
    });
  }

  // 비즈니스 이벤트 로깅
  logBusinessEvent(event: BusinessEvent): void {
    this.logger.info('Business event occurred', {
      eventType: event.type,
      eventId: event.id,
      userId: event.userId,
      entityId: event.entityId,
      entityType: event.entityType,
      metadata: event.metadata,
      businessContext: {
        domain: event.domain,
        aggregate: event.aggregate,
        version: event.version
      }
    });
  }

  // 성능 로깅
  logPerformanceMetrics(operation: string, duration: number, metadata?: any): void {
    this.logger.info('Performance metrics', {
      operation,
      duration,
      durationMs: Math.round(duration * 1000),
      performanceCategory: this.categorizePerformance(duration),
      metadata
    });
  }

  // 보안 이벤트 로깅
  logSecurityEvent(event: SecurityEvent): void {
    this.logger.warn('Security event detected', {
      securityEventType: event.type,
      severity: event.severity,
      sourceIp: event.sourceIp,
      userAgent: event.userAgent,
      userId: event.userId,
      resource: event.resource,
      action: event.action,
      result: event.result,
      riskScore: event.riskScore
    });
  }

  // 에러 로깅 (컨텍스트 포함)
  logError(error: Error, context?: LogContext): void {
    this.logger.error('Application error occurred', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      errorCode: (error as any).code,
      httpStatus: (error as any).statusCode,
      context: {
        operation: context?.operation,
        inputData: this.sanitizeData(context?.inputData),
        userId: context?.userId,
        sessionId: context?.sessionId,
        requestId: context?.requestId
      }
    });
  }

  // 트랜잭션 로깅
  startTransaction(transactionId: string, type: string): TransactionLogger {
    const startTime = Date.now();

    this.logger.info('Transaction started', {
      transactionId,
      transactionType: type,
      startTime: new Date(startTime).toISOString()
    });

    return {
      log: (message: string, data?: any) => {
        this.logger.info('Transaction log', {
          transactionId,
          message,
          data,
          elapsed: Date.now() - startTime
        });
      },

      complete: (result?: any) => {
        const duration = Date.now() - startTime;
        this.logger.info('Transaction completed', {
          transactionId,
          transactionType: type,
          duration,
          result: this.sanitizeData(result),
          status: 'success'
        });
      },

      fail: (error: Error) => {
        const duration = Date.now() - startTime;
        this.logger.error('Transaction failed', {
          transactionId,
          transactionType: type,
          duration,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          },
          status: 'failed'
        });
      }
    };
  }

  private sanitizeData(data: any): any {
    if (!data) return data;

    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    const sanitized = JSON.parse(JSON.stringify(data));

    const sanitizeObject = (obj: any): void => {
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    sanitizeObject(sanitized);
    return sanitized;
  }
}
```

### 2. ELK 스택 설정
```yaml
# elasticsearch.yml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
  namespace: logging
spec:
  serviceName: elasticsearch
  replicas: 3
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
    spec:
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch:8.9.0
        env:
        - name: cluster.name
          value: "logging-cluster"
        - name: node.name
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: discovery.seed_hosts
          value: "elasticsearch-0.elasticsearch,elasticsearch-1.elasticsearch,elasticsearch-2.elasticsearch"
        - name: cluster.initial_master_nodes
          value: "elasticsearch-0,elasticsearch-1,elasticsearch-2"
        - name: ES_JAVA_OPTS
          value: "-Xms2g -Xmx2g"
        - name: xpack.security.enabled
          value: "true"
        - name: xpack.security.transport.ssl.enabled
          value: "true"
        resources:
          requests:
            memory: "4Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        ports:
        - containerPort: 9200
          name: rest
        - containerPort: 9300
          name: inter-node
        volumeMounts:
        - name: data
          mountPath: /usr/share/elasticsearch/data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
---
# logstash.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: logstash-config
  namespace: logging
data:
  logstash.yml: |
    http.host: "0.0.0.0"
    path.config: /usr/share/logstash/pipeline
    pipeline.ecs_compatibility: v8

  pipeline.yml: |
    - pipeline.id: main
      path.config: "/usr/share/logstash/pipeline/logstash.conf"

  logstash.conf: |
    input {
      beats {
        port => 5044
      }
    }

    filter {
      # JSON 파싱
      if [message] =~ /^\{.*\}$/ {
        json {
          source => "message"
        }
      }

      # 타임스탬프 파싱
      if [timestamp] {
        date {
          match => [ "timestamp", "ISO8601" ]
          target => "@timestamp"
        }
      }

      # 로그 레벨 정규화
      if [level] {
        mutate {
          uppercase => [ "level" ]
        }
      }

      # 지리적 정보 추가
      if [sourceIp] {
        geoip {
          source => "sourceIp"
          target => "geoip"
        }
      }

      # 사용자 에이전트 파싱
      if [userAgent] {
        useragent {
          source => "userAgent"
        }
      }
    }

    output {
      elasticsearch {
        hosts => ["elasticsearch:9200"]
        index => "logs-%{[service]}-%{+YYYY.MM.dd}"
        template_name => "logs"
        template => "/usr/share/logstash/templates/logs-template.json"
        template_overwrite => true
      }
    }
```

### 3. 로그 분석 및 알림
```typescript
// log-analyzer.ts
export class LogAnalyzer {
  private elasticsearchClient: ElasticsearchClient;
  private alertManager: AlertManager;

  async analyzeErrorPatterns(timeRange: TimeRange): Promise<ErrorAnalysis> {
    const query = {
      index: 'logs-*',
      body: {
        query: {
          bool: {
            must: [
              { term: { level: 'ERROR' } },
              { range: { '@timestamp': { gte: timeRange.start, lte: timeRange.end } } }
            ]
          }
        },
        aggs: {
          error_patterns: {
            terms: {
              field: 'errorName.keyword',
              size: 20
            },
            aggs: {
              services: {
                terms: {
                  field: 'service.keyword'
                }
              },
              timeline: {
                date_histogram: {
                  field: '@timestamp',
                  interval: '1h'
                }
              }
            }
          }
        }
      }
    };

    const result = await this.elasticsearchClient.search(query);

    return {
      totalErrors: result.body.hits.total.value,
      patterns: result.body.aggregations.error_patterns.buckets.map(bucket => ({
        errorType: bucket.key,
        count: bucket.doc_count,
        affectedServices: bucket.services.buckets.map(s => s.key),
        timeline: bucket.timeline.buckets
      })),
      trends: await this.analyzeErrorTrends(result.body.aggregations.error_patterns.buckets)
    };
  }

  async detectAnomalies(service: string, timeRange: TimeRange): Promise<Anomaly[]> {
    // 1. 기준선 메트릭 계산
    const baseline = await this.calculateBaseline(service, timeRange);

    // 2. 현재 메트릭 수집
    const current = await this.getCurrentMetrics(service);

    const anomalies: Anomaly[] = [];

    // 에러율 이상 감지
    if (current.errorRate > baseline.errorRate * 2) {
      anomalies.push({
        type: 'error_rate_spike',
        severity: 'high',
        current: current.errorRate,
        baseline: baseline.errorRate,
        threshold: baseline.errorRate * 2,
        description: `${service} 에러율이 기준선의 2배를 초과했습니다`
      });
    }

    // 응답 시간 이상 감지
    if (current.responseTime > baseline.responseTime * 1.5) {
      anomalies.push({
        type: 'response_time_increase',
        severity: 'medium',
        current: current.responseTime,
        baseline: baseline.responseTime,
        threshold: baseline.responseTime * 1.5,
        description: `${service} 응답 시간이 기준선의 1.5배를 초과했습니다`
      });
    }

    // 트래픽 패턴 이상 감지
    const trafficAnomaly = await this.detectTrafficAnomaly(service, timeRange);
    if (trafficAnomaly) {
      anomalies.push(trafficAnomaly);
    }

    return anomalies;
  }

  async setupLogBasedAlerts(): Promise<void> {
    const alertRules: LogAlertRule[] = [
      {
        name: 'high_error_rate',
        query: 'level:ERROR',
        threshold: 10,
        timeWindow: '5m',
        severity: 'critical',
        action: 'notify_oncall'
      },
      {
        name: 'security_events',
        query: 'securityEventType:* AND severity:(high OR critical)',
        threshold: 1,
        timeWindow: '1m',
        severity: 'critical',
        action: 'notify_security_team'
      },
      {
        name: 'payment_failures',
        query: 'eventType:payment_failed',
        threshold: 5,
        timeWindow: '10m',
        severity: 'high',
        action: 'notify_business_team'
      }
    ];

    for (const rule of alertRules) {
      await this.createLogAlert(rule);
    }
  }
}
```

## 분산 추적

### 1. Jaeger 분산 추적 시스템
```typescript
// distributed-tracing.ts
export class DistributedTracing {
  private tracer: Tracer;
  private jaegerExporter: JaegerExporter;

  constructor(serviceName: string) {
    this.jaegerExporter = new JaegerExporter({
      endpoint: 'http://jaeger-collector:14268/api/traces'
    });

    this.tracer = new NodeTracer({
      serviceName,
      plugins: {
        http: {
          requestHook: this.httpRequestHook,
          responseHook: this.httpResponseHook
        },
        express: true,
        mysql: true,
        redis: true
      }
    });

    this.tracer.addSpanProcessor(
      new BatchSpanProcessor(this.jaegerExporter)
    );
  }

  // HTTP 요청 추적
  private httpRequestHook = (span: Span, request: IncomingMessage): void => {
    span.setAttributes({
      'http.method': request.method,
      'http.url': request.url,
      'http.user_agent': request.headers['user-agent'],
      'user.id': this.extractUserId(request),
      'request.id': this.extractRequestId(request)
    });
  };

  private httpResponseHook = (span: Span, response: ServerResponse): void => {
    span.setAttributes({
      'http.status_code': response.statusCode,
      'http.status_text': response.statusMessage
    });

    if (response.statusCode >= 400) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: `HTTP ${response.statusCode}`
      });
    }
  };

  // 비즈니스 프로세스 추적
  async traceBusinessProcess<T>(
    processName: string,
    operation: (span: Span) => Promise<T>,
    attributes?: Record<string, any>
  ): Promise<T> {
    return this.tracer.startActiveSpan(processName, async (span) => {
      try {
        if (attributes) {
          span.setAttributes(attributes);
        }

        const result = await operation(span);

        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  // 데이터베이스 쿼리 추적
  async traceDbQuery<T>(
    query: string,
    operation: () => Promise<T>,
    dbType: string = 'postgresql'
  ): Promise<T> {
    return this.tracer.startActiveSpan(`db.${dbType}.query`, async (span) => {
      span.setAttributes({
        'db.system': dbType,
        'db.statement': this.sanitizeQuery(query),
        'db.operation': this.extractOperation(query)
      });

      const start = Date.now();

      try {
        const result = await operation();
        const duration = Date.now() - start;

        span.setAttributes({
          'db.duration_ms': duration
        });

        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  // 외부 서비스 호출 추적
  async traceExternalCall<T>(
    serviceName: string,
    operation: string,
    call: () => Promise<T>
  ): Promise<T> {
    return this.tracer.startActiveSpan(`external.${serviceName}.${operation}`, async (span) => {
      span.setAttributes({
        'service.name': serviceName,
        'service.operation': operation,
        'span.kind': 'client'
      });

      try {
        const result = await call();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
```

### 2. 성능 분석 및 최적화
```typescript
// performance-analyzer.ts
export class PerformanceAnalyzer {
  private jaegerClient: JaegerClient;

  async analyzeServicePerformance(
    service: string,
    timeRange: TimeRange
  ): Promise<ServicePerformanceAnalysis> {
    // 1. 트레이스 데이터 수집
    const traces = await this.jaegerClient.getTraces({
      service,
      start: timeRange.start,
      end: timeRange.end,
      limit: 1000
    });

    // 2. 성능 메트릭 계산
    const metrics = this.calculatePerformanceMetrics(traces);

    // 3. 병목 지점 분석
    const bottlenecks = await this.identifyBottlenecks(traces);

    // 4. 최적화 기회 식별
    const optimizations = await this.identifyOptimizations(traces, metrics);

    return {
      service,
      timeRange,
      metrics,
      bottlenecks,
      optimizations,
      recommendations: await this.generateRecommendations(metrics, bottlenecks)
    };
  }

  private calculatePerformanceMetrics(traces: Trace[]): PerformanceMetrics {
    const durations = traces.map(trace => trace.duration);
    const errors = traces.filter(trace =>
      trace.spans.some(span => span.tags.some(tag =>
        tag.key === 'error' && tag.value === true
      ))
    );

    return {
      totalRequests: traces.length,
      errorRate: errors.length / traces.length,
      p50: this.percentile(durations, 0.5),
      p95: this.percentile(durations, 0.95),
      p99: this.percentile(durations, 0.99),
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations)
    };
  }

  private async identifyBottlenecks(traces: Trace[]): Promise<Bottleneck[]> {
    const spanDurations: Map<string, number[]> = new Map();

    // 스팬별 실행 시간 수집
    for (const trace of traces) {
      for (const span of trace.spans) {
        const key = `${span.process.serviceName}.${span.operationName}`;
        if (!spanDurations.has(key)) {
          spanDurations.set(key, []);
        }
        spanDurations.get(key)!.push(span.duration);
      }
    }

    const bottlenecks: Bottleneck[] = [];

    // 평균 실행 시간이 긴 스팬 식별
    for (const [operation, durations] of spanDurations) {
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const p95Duration = this.percentile(durations, 0.95);

      if (avgDuration > 1000000) { // 1초 이상
        bottlenecks.push({
          operation,
          avgDuration,
          p95Duration,
          occurrences: durations.length,
          severity: avgDuration > 5000000 ? 'high' : 'medium'
        });
      }
    }

    return bottlenecks.sort((a, b) => b.avgDuration - a.avgDuration);
  }
}
```

## 알림 및 인시던트 관리

### 1. 스마트 알림 시스템
```typescript
// smart-alerting.ts
export class SmartAlertingSystem {
  private alertManager: AlertManager;
  private mlPredictor: MLPredictor;
  private escalationManager: EscalationManager;

  async setupSmartAlerts(): Promise<void> {
    const alertRules: SmartAlertRule[] = [
      {
        name: 'sla_violation_prediction',
        type: 'predictive',
        query: 'response_time_trend_5m',
        predictor: 'sla_violation_model',
        threshold: 0.8, // 80% 확률
        action: 'preemptive_scale'
      },
      {
        name: 'cascading_failure_detection',
        type: 'correlation',
        correlations: [
          'high_error_rate',
          'increased_response_time',
          'connection_pool_exhaustion'
        ],
        threshold: 2, // 2개 이상 상관관계
        action: 'incident_creation'
      },
      {
        name: 'business_impact_alert',
        type: 'business',
        businessMetrics: ['conversion_rate', 'revenue_per_minute'],
        threshold: -10, // 10% 감소
        priority: 'critical',
        action: 'executive_notification'
      }
    ];

    for (const rule of alertRules) {
      await this.createSmartAlert(rule);
    }
  }

  async evaluateAlert(alert: Alert): Promise<AlertEvaluation> {
    // 1. 컨텍스트 수집
    const context = await this.gatherAlertContext(alert);

    // 2. 중복 제거
    const isDuplicate = await this.checkDuplicate(alert, context);
    if (isDuplicate) {
      return { action: 'suppress', reason: 'duplicate' };
    }

    // 3. 비즈니스 영향 평가
    const businessImpact = await this.assessBusinessImpact(alert, context);

    // 4. 우선순위 계산
    const priority = this.calculatePriority(alert, businessImpact, context);

    // 5. 에스컬레이션 경로 결정
    const escalationPath = await this.determineEscalationPath(priority, alert.service);

    return {
      action: 'notify',
      priority,
      escalationPath,
      businessImpact,
      context
    };
  }

  private async gatherAlertContext(alert: Alert): Promise<AlertContext> {
    const timeRange = {
      start: new Date(Date.now() - 30 * 60 * 1000), // 30분 전
      end: new Date()
    };

    return {
      recentAlerts: await this.getRecentAlerts(alert.service, timeRange),
      systemMetrics: await this.getSystemMetrics(alert.service, timeRange),
      deploymentHistory: await this.getRecentDeployments(alert.service, timeRange),
      userReports: await this.getUserReports(alert.service, timeRange),
      dependencies: await this.getDependencyStatus(alert.service)
    };
  }

  private calculatePriority(
    alert: Alert,
    businessImpact: BusinessImpact,
    context: AlertContext
  ): AlertPriority {
    let score = 0;

    // 기본 알림 심각도
    const severityScores = { critical: 100, high: 70, medium: 40, low: 20 };
    score += severityScores[alert.severity];

    // 비즈니스 영향
    score += businessImpact.revenueImpact * 10;
    score += businessImpact.userImpact * 5;

    // 시스템 영향
    if (context.dependencies.some(dep => dep.status === 'down')) {
      score += 50; // 의존성 장애
    }

    // 최근 알림 빈도
    if (context.recentAlerts.length > 5) {
      score += 30; // 알림 폭증
    }

    // 사용자 신고
    score += context.userReports.length * 20;

    if (score >= 150) return 'critical';
    if (score >= 100) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }
}
```

### 2. 인시던트 자동 대응
```typescript
// incident-automation.ts
export class IncidentAutomation {
  private runbookEngine: RunbookEngine;
  private recoveryOrchestrator: RecoveryOrchestrator;

  async handleIncident(incident: Incident): Promise<IncidentResponse> {
    // 1. 인시던트 분류
    const classification = await this.classifyIncident(incident);

    // 2. 자동 대응 가능성 평가
    const automationLevel = await this.assessAutomationLevel(classification);

    // 3. 런북 실행
    if (automationLevel >= AutomationLevel.PARTIAL) {
      const runbookResult = await this.executeRunbook(classification.runbook, incident);

      if (runbookResult.success && automationLevel === AutomationLevel.FULL) {
        return {
          status: 'resolved',
          resolution: runbookResult.actions,
          timeToResolution: runbookResult.duration
        };
      }
    }

    // 4. 수동 개입 필요시 에스컬레이션
    return await this.escalateToHuman(incident, classification);
  }

  private async executeRunbook(
    runbook: Runbook,
    incident: Incident
  ): Promise<RunbookResult> {
    const executedActions: RunbookAction[] = [];

    for (const step of runbook.steps) {
      try {
        const action = await this.executeRunbookStep(step, incident);
        executedActions.push(action);

        // 각 단계 후 상황 재평가
        const reevaluation = await this.reevaluateIncident(incident);
        if (reevaluation.status === 'resolved') {
          return {
            success: true,
            actions: executedActions,
            resolution: 'automated',
            duration: Date.now() - incident.startTime
          };
        }
      } catch (error) {
        return {
          success: false,
          actions: executedActions,
          error: error.message,
          duration: Date.now() - incident.startTime
        };
      }
    }

    return {
      success: false,
      actions: executedActions,
      error: 'Runbook completed but incident not resolved',
      duration: Date.now() - incident.startTime
    };
  }

  private async executeRunbookStep(
    step: RunbookStep,
    incident: Incident
  ): Promise<RunbookAction> {
    switch (step.type) {
      case 'restart_service':
        return await this.restartService(step.target, incident);

      case 'scale_service':
        return await this.scaleService(step.target, step.parameters);

      case 'clear_cache':
        return await this.clearCache(step.target);

      case 'failover':
        return await this.performFailover(step.target, step.parameters);

      case 'run_script':
        return await this.runScript(step.script, step.parameters);

      default:
        throw new Error(`Unknown runbook step type: ${step.type}`);
    }
  }

  private async restartService(
    service: string,
    incident: Incident
  ): Promise<RunbookAction> {
    const k8sApi = new KubernetesAPI();

    // 1. 현재 상태 확인
    const deployment = await k8sApi.getDeployment(service);

    // 2. 롤링 재시작 수행
    await k8sApi.restartDeployment(service);

    // 3. 재시작 완료 대기
    await k8sApi.waitForDeploymentReady(service, 300000); // 5분 타임아웃

    return {
      type: 'restart_service',
      target: service,
      success: true,
      timestamp: new Date(),
      details: {
        previousReplicas: deployment.spec.replicas,
        restartedReplicas: deployment.spec.replicas
      }
    };
  }
}
```

## SuperClaude 활용법

### 1. 모니터링 시스템 설계
```bash
# 관찰성 아키텍처 설계
/design observability-stack --persona-devops --think-hard
- 메트릭 수집 전략
- 로그 관리 아키텍처
- 분산 추적 설계
- 알림 및 대시보드 계획

# 모니터링 구현
/implement monitoring-system --type observability --wave-mode
- Prometheus 클러스터 설정
- Grafana 대시보드
- Alertmanager 구성
- Jaeger 분산 추적
```

### 2. 알림 최적화
```bash
# 알림 시스템 분석
/analyze alert-fatigue --focus accuracy --think
- 알림 빈도 분석
- 거짓 양성 식별
- 비즈니스 영향 평가
- 에스컬레이션 경로 검토

# 스마트 알림 구현
/improve alerting --focus intelligence --loop
- 알림 중복 제거
- 컨텍스트 기반 우선순위
- 예측적 알림
- 자동 대응 규칙
```

### 3. 성능 분석
```bash
# 성능 병목 분석
/analyze performance-bottlenecks --focus efficiency --seq
- 분산 추적 분석
- 메트릭 상관관계
- 리소스 사용 패턴
- 최적화 기회 식별

# 관찰성 개선
/improve observability --focus completeness --validate
- 메트릭 커버리지 확장
- 로그 구조화 개선
- 트레이스 샘플링 최적화
- 대시보드 가시성 향상
```

### 4. 인시던트 대응 자동화
```bash
# 런북 자동화 설계
/design incident-automation --persona-devops --magic
- 인시던트 분류 시스템
- 자동 대응 워크플로우
- 에스컬레이션 룰
- 복구 검증 프로세스

# 인시던트 대응 개선
/improve incident-response --focus reliability --loop
- 대응 시간 단축
- 자동화 범위 확대
- 예방적 조치 강화
- 포스트모템 자동화
```

## 마무리

관찰 가능성은 현대 시스템 운영의 필수 요소입니다. SuperClaude의 DevOps 페르소나와 분석 능력을 활용하여 완전히 관찰 가능한 시스템을 구축하고, 문제 발생 전에 예방하며, 발생한 문제는 신속하게 해결하는 체계를 만드세요.

다음 단계에서는 보안 및 컴플라이언스에 대해 알아보겠습니다.
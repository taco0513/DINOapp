# 10-02. 컨테이너 오케스트레이션 가이드

> "컨테이너는 배송 상자, 오케스트레이션은 물류 시스템이다. SuperClaude로 완벽한 물류를 구축하자."

## 📋 목차
1. [컨테이너 오케스트레이션 개요](#컨테이너-오케스트레이션-개요)
2. [Docker 컨테이너 최적화](#docker-컨테이너-최적화)
3. [Kubernetes 클러스터 관리](#kubernetes-클러스터-관리)
4. [서비스 메시 구현](#서비스-메시-구현)
5. [리소스 관리 및 최적화](#리소스-관리-및-최적화)
6. [SuperClaude 활용법](#superclaude-활용법)

## 컨테이너 오케스트레이션 개요

### 핵심 개념
```yaml
# container-orchestration-principles.yml
orchestration_principles:
  scalability: "자동 스케일링으로 탄력적 운영"
  resilience: "장애 복구 및 자가 치유"
  efficiency: "리소스 최적화 및 비용 절감"
  observability: "완전한 가시성과 모니터링"
  security: "컨테이너 및 클러스터 보안"
```

### SuperClaude 오케스트레이션 명령어
```bash
# 컨테이너 분석
/analyze containers --focus performance --think

# Kubernetes 설계
/design k8s-cluster --persona-devops --wave-mode

# 컨테이너 최적화
/improve containers --focus efficiency --loop

# 오케스트레이션 구현
/implement k8s-deployment --type infrastructure --safe-mode
```

## Docker 컨테이너 최적화

### 1. 멀티스테이지 빌드 최적화
```dockerfile
# Dockerfile.optimized
# 1단계: 의존성 설치 및 빌드
FROM node:18-alpine AS builder

WORKDIR /app

# package.json 먼저 복사 (Docker 레이어 캐싱 최적화)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 2단계: 프로덕션 이미지
FROM node:18-alpine AS production

# 보안: non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# 필요한 파일만 복사
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 건강 체크 스크립트 추가
COPY --chown=nextjs:nodejs healthcheck.js ./

USER nextjs

EXPOSE 3000

# 건강 체크 설정
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "server.js"]
```

### 2. 컨테이너 최적화 도구
```typescript
// container-optimizer.ts
export class ContainerOptimizer {
  async optimizeImage(dockerfile: string): Promise<OptimizationResult> {
    const analysis = await this.analyzeDockerfile(dockerfile);
    const recommendations: Recommendation[] = [];
    
    // 베이스 이미지 최적화
    if (analysis.baseImage.includes('ubuntu') || analysis.baseImage.includes('centos')) {
      recommendations.push({
        type: 'base_image',
        severity: 'medium',
        message: 'Alpine 기반 이미지 사용을 권장합니다',
        suggestion: 'node:18-alpine 사용'
      });
    }
    
    // 레이어 최적화
    if (analysis.layers > 20) {
      recommendations.push({
        type: 'layer_count',
        severity: 'high',
        message: '레이어 수가 너무 많습니다',
        suggestion: 'RUN 명령어를 결합하여 레이어 수 감소'
      });
    }
    
    // 보안 최적화
    if (analysis.runAsRoot) {
      recommendations.push({
        type: 'security',
        severity: 'high',
        message: 'root 사용자로 실행됩니다',
        suggestion: 'non-root 사용자 생성 및 사용'
      });
    }
    
    return {
      originalSize: analysis.estimatedSize,
      optimizedSize: this.calculateOptimizedSize(analysis, recommendations),
      recommendations
    };
  }
  
  async generateOptimizedDockerfile(
    original: string, 
    recommendations: Recommendation[]
  ): Promise<string> {
    let optimized = original;
    
    for (const rec of recommendations) {
      optimized = await this.applyRecommendation(optimized, rec);
    }
    
    return optimized;
  }
}
```

### 3. 컨테이너 리소스 관리
```yaml
# deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app
        image: web-app:latest
        ports:
        - containerPort: 3000
        # 리소스 제한 설정
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        # 라이브니스 프로브
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        # 레디니스 프로브
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        # 환경 변수
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

## Kubernetes 클러스터 관리

### 1. 클러스터 자동 스케일링
```typescript
// cluster-autoscaler.ts
export class ClusterAutoscaler {
  private k8sApi: k8s.CoreV1Api;
  private metricsApi: k8s.MetricsV1beta1Api;
  
  async monitorAndScale(): Promise<void> {
    while (true) {
      const metrics = await this.getClusterMetrics();
      const decision = await this.makeScalingDecision(metrics);
      
      if (decision.action !== 'none') {
        await this.executeScaling(decision);
      }
      
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30초 간격
    }
  }
  
  private async getClusterMetrics(): Promise<ClusterMetrics> {
    const nodes = await this.k8sApi.listNode();
    const pods = await this.k8sApi.listPodForAllNamespaces();
    
    let totalCpuRequest = 0;
    let totalMemoryRequest = 0;
    let totalCpuLimit = 0;
    let totalMemoryLimit = 0;
    
    for (const pod of pods.body.items) {
      if (pod.spec?.containers) {
        for (const container of pod.spec.containers) {
          const resources = container.resources;
          if (resources?.requests) {
            totalCpuRequest += this.parseCpu(resources.requests.cpu);
            totalMemoryRequest += this.parseMemory(resources.requests.memory);
          }
          if (resources?.limits) {
            totalCpuLimit += this.parseCpu(resources.limits.cpu);
            totalMemoryLimit += this.parseMemory(resources.limits.memory);
          }
        }
      }
    }
    
    return {
      nodeCount: nodes.body.items.length,
      totalCpuRequest,
      totalMemoryRequest,
      totalCpuLimit,
      totalMemoryLimit,
      pendingPods: pods.body.items.filter(pod => 
        pod.status?.phase === 'Pending'
      ).length
    };
  }
  
  private async makeScalingDecision(metrics: ClusterMetrics): Promise<ScalingDecision> {
    // 리소스 사용률 계산
    const cpuUtilization = metrics.totalCpuRequest / (metrics.nodeCount * 2); // 노드당 2 CPU 가정
    const memoryUtilization = metrics.totalMemoryRequest / (metrics.nodeCount * 8 * 1024 * 1024 * 1024); // 노드당 8GB 가정
    
    // 스케일 아웃 조건
    if (cpuUtilization > 0.8 || memoryUtilization > 0.8 || metrics.pendingPods > 0) {
      return {
        action: 'scale_out',
        targetNodeCount: metrics.nodeCount + 1,
        reason: `CPU: ${cpuUtilization.toFixed(2)}, Memory: ${memoryUtilization.toFixed(2)}, Pending: ${metrics.pendingPods}`
      };
    }
    
    // 스케일 인 조건
    if (cpuUtilization < 0.3 && memoryUtilization < 0.3 && metrics.nodeCount > 1) {
      return {
        action: 'scale_in',
        targetNodeCount: metrics.nodeCount - 1,
        reason: 'Low resource utilization'
      };
    }
    
    return { action: 'none' };
  }
}
```

### 2. Pod 자동 스케일링 (HPA)
```yaml
# hpa.yml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: custom_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

### 3. 수직 Pod 자동 스케일링 (VPA)
```yaml
# vpa.yml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: web-app-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  updatePolicy:
    updateMode: "Auto"  # Off, Initial, Auto
  resourcePolicy:
    containerPolicies:
    - containerName: web-app
      maxAllowed:
        cpu: 1
        memory: 2Gi
      minAllowed:
        cpu: 100m
        memory: 128Mi
      controlledResources: ["cpu", "memory"]
```

## 서비스 메시 구현

### 1. Istio 서비스 메시
```typescript
// istio-service-mesh.ts
export class IstioServiceMesh {
  async setupServiceMesh(namespace: string): Promise<void> {
    // 1. Istio 사이드카 주입 활성화
    await this.enableSidecarInjection(namespace);
    
    // 2. 게이트웨이 설정
    await this.createGateway(namespace);
    
    // 3. 가상 서비스 설정
    await this.createVirtualService(namespace);
    
    // 4. 대상 규칙 설정
    await this.createDestinationRule(namespace);
    
    // 5. 보안 정책 설정
    await this.createSecurityPolicies(namespace);
  }
  
  private async createVirtualService(namespace: string): Promise<void> {
    const virtualService = {
      apiVersion: 'networking.istio.io/v1beta1',
      kind: 'VirtualService',
      metadata: {
        name: 'web-app-vs',
        namespace
      },
      spec: {
        http: [{
          match: [{
            uri: { prefix: '/api' }
          }],
          route: [{
            destination: {
              host: 'api-service',
              subset: 'v1'
            },
            weight: 90
          }, {
            destination: {
              host: 'api-service',
              subset: 'v2'
            },
            weight: 10
          }],
          timeout: '10s',
          retries: {
            attempts: 3,
            perTryTimeout: '3s'
          }
        }]
      }
    };
    
    await this.k8sApi.createNamespacedCustomObject(
      'networking.istio.io',
      'v1beta1',
      namespace,
      'virtualservices',
      virtualService
    );
  }
  
  private async createDestinationRule(namespace: string): Promise<void> {
    const destinationRule = {
      apiVersion: 'networking.istio.io/v1beta1',
      kind: 'DestinationRule',
      metadata: {
        name: 'api-service-dr',
        namespace
      },
      spec: {
        host: 'api-service',
        trafficPolicy: {
          connectionPool: {
            tcp: {
              maxConnections: 100
            },
            http: {
              http1MaxPendingRequests: 50,
              maxRequestsPerConnection: 10
            }
          },
          circuitBreaker: {
            consecutiveErrors: 5,
            interval: '30s',
            baseEjectionTime: '30s',
            maxEjectionPercent: 50
          }
        },
        subsets: [{
          name: 'v1',
          labels: { version: 'v1' }
        }, {
          name: 'v2',
          labels: { version: 'v2' }
        }]
      }
    };
    
    await this.k8sApi.createNamespacedCustomObject(
      'networking.istio.io',
      'v1beta1',
      namespace,
      'destinationrules',
      destinationRule
    );
  }
}
```

### 2. 트래픽 관리
```yaml
# traffic-management.yml
# A/B 테스트를 위한 트래픽 분할
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: ab-test-vs
spec:
  http:
  - match:
    - headers:
        user-type:
          exact: "premium"
    route:
    - destination:
        host: web-app-service
        subset: premium
  - route:
    - destination:
        host: web-app-service
        subset: standard
      weight: 80
    - destination:
        host: web-app-service
        subset: beta
      weight: 20
---
# 카나리 배포를 위한 트래픽 분할
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: canary-vs
spec:
  http:
  - match:
    - headers:
        canary:
          exact: "true"
    route:
    - destination:
        host: web-app-service
        subset: canary
  - route:
    - destination:
        host: web-app-service
        subset: stable
      weight: 95
    - destination:
        host: web-app-service
        subset: canary
      weight: 5
```

### 3. 서비스 메시 모니터링
```typescript
// mesh-monitoring.ts
export class ServiceMeshMonitor {
  private prometheusApi: PrometheusApi;
  private jaegerApi: JaegerApi;
  
  async getServiceMetrics(service: string, timeRange: string): Promise<ServiceMetrics> {
    const queries = {
      requestRate: `rate(istio_requests_total{destination_service_name="${service}"}[${timeRange}])`,
      errorRate: `rate(istio_requests_total{destination_service_name="${service}",response_code!~"2.."}[${timeRange}])`,
      p99Latency: `histogram_quantile(0.99, rate(istio_request_duration_milliseconds_bucket{destination_service_name="${service}"}[${timeRange}]))`,
      p95Latency: `histogram_quantile(0.95, rate(istio_request_duration_milliseconds_bucket{destination_service_name="${service}"}[${timeRange}]))`,
      p50Latency: `histogram_quantile(0.50, rate(istio_request_duration_milliseconds_bucket{destination_service_name="${service}"}[${timeRange}]))`
    };
    
    const results = await Promise.all(
      Object.entries(queries).map(async ([metric, query]) => {
        const result = await this.prometheusApi.query(query);
        return { metric, value: result.data.result[0]?.value[1] || 0 };
      })
    );
    
    return results.reduce((acc, { metric, value }) => {
      acc[metric] = parseFloat(value);
      return acc;
    }, {} as ServiceMetrics);
  }
  
  async getDistributedTraces(service: string, operation?: string): Promise<Trace[]> {
    const traces = await this.jaegerApi.getTraces({
      service,
      operation,
      limit: 100,
      lookback: '1h'
    });
    
    return traces.map(trace => ({
      traceId: trace.traceID,
      spans: trace.spans.map(span => ({
        spanId: span.spanID,
        operation: span.operationName,
        service: span.process.serviceName,
        duration: span.duration,
        tags: span.tags
      }))
    }));
  }
}
```

## 리소스 관리 및 최적화

### 1. 리소스 할당량 관리
```yaml
# resource-quota.yml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-team-quota
  namespace: development
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    persistentvolumeclaims: "10"
    pods: "20"
    services: "10"
    secrets: "20"
    configmaps: "20"
---
apiVersion: v1
kind: LimitRange
metadata:
  name: dev-team-limits
  namespace: development
spec:
  limits:
  - default:
      cpu: "500m"
      memory: "1Gi"
    defaultRequest:
      cpu: "100m"
      memory: "128Mi"
    type: Container
  - max:
      cpu: "2"
      memory: "4Gi"
    min:
      cpu: "50m"
      memory: "64Mi"
    type: Container
```

### 2. 네트워크 정책
```yaml
# network-policy.yml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-app-netpol
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: web-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    - podSelector:
        matchLabels:
          app: nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
  - to: []
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 80
    - protocol: UDP
      port: 53
```

### 3. 스토리지 최적화
```typescript
// storage-optimizer.ts
export class StorageOptimizer {
  async optimizePersistentVolumes(): Promise<OptimizationResult> {
    const pvs = await this.k8sApi.listPersistentVolume();
    const recommendations: StorageRecommendation[] = [];
    
    for (const pv of pvs.body.items) {
      const usage = await this.getPVUsage(pv.metadata.name);
      
      // 사용률이 낮은 볼륨 감지
      if (usage.utilizationPercent < 20) {
        recommendations.push({
          type: 'downsize',
          pv: pv.metadata.name,
          currentSize: pv.spec.capacity.storage,
          recommendedSize: this.calculateOptimalSize(usage),
          potentialSavings: this.calculateSavings(pv.spec.capacity.storage, usage)
        });
      }
      
      // 사용률이 높은 볼륨 감지
      if (usage.utilizationPercent > 80) {
        recommendations.push({
          type: 'upsize',
          pv: pv.metadata.name,
          currentSize: pv.spec.capacity.storage,
          recommendedSize: this.calculateExpandedSize(usage),
          urgency: usage.utilizationPercent > 90 ? 'high' : 'medium'
        });
      }
    }
    
    return {
      totalPVs: pvs.body.items.length,
      recommendations,
      potentialMonthlySavings: recommendations
        .filter(r => r.type === 'downsize')
        .reduce((sum, r) => sum + (r.potentialSavings || 0), 0)
    };
  }
  
  async implementStorageClass(name: string, config: StorageClassConfig): Promise<void> {
    const storageClass = {
      apiVersion: 'storage.k8s.io/v1',
      kind: 'StorageClass',
      metadata: { name },
      provisioner: config.provisioner,
      parameters: config.parameters,
      reclaimPolicy: config.reclaimPolicy,
      allowVolumeExpansion: true,
      volumeBindingMode: 'WaitForFirstConsumer'
    };
    
    await this.k8sApi.createStorageClass(storageClass);
  }
}
```

## SuperClaude 활용법

### 1. 컨테이너 최적화
```bash
# Docker 이미지 분석 및 최적화
/analyze dockerfile --focus efficiency --think
- 이미지 크기 분석
- 레이어 최적화 기회
- 보안 취약점 검사
- 멀티스테이지 빌드 제안

# 컨테이너 리소스 최적화
/improve containers --focus performance --loop
- CPU/메모리 사용량 최적화
- 헬스 체크 개선
- 시작 시간 단축
- 리소스 제한 조정
```

### 2. Kubernetes 클러스터 관리
```bash
# 클러스터 설계 및 구성
/design k8s-cluster --persona-devops --wave-mode
- 클러스터 아키텍처 설계
- 네임스페이스 전략
- 리소스 할당 계획
- 보안 정책 설계

# 클러스터 최적화
/improve k8s-cluster --focus cost-efficiency --validate
- 리소스 사용률 최적화
- 노드 오토스케일링 조정
- 스토리지 최적화
- 네트워크 정책 개선
```

### 3. 오케스트레이션 문제 해결
```bash
# 클러스터 이슈 진단
/troubleshoot k8s-cluster --think-hard --seq
- 리소스 부족 문제
- 네트워킹 이슈
- 스케줄링 문제
- 성능 병목 지점

# 서비스 메시 분석
/analyze service-mesh --focus observability
- 트래픽 패턴 분석
- 레이턴시 병목 식별
- 에러율 분석
- 보안 정책 검토
```

### 4. 자동화 구현
```bash
# CI/CD 파이프라인 구축
/build k8s-cicd --type automation --magic
- 이미지 빌드 자동화
- 배포 파이프라인
- 롤백 메커니즘
- 모니터링 통합

# 모니터링 시스템 구축
/implement k8s-monitoring --type observability
- Prometheus 설정
- Grafana 대시보드
- 알림 규칙
- 로그 수집
```

## 마무리

컨테이너 오케스트레이션은 현대 애플리케이션 운영의 핵심입니다. SuperClaude의 DevOps 페르소나와 분석 능력을 활용하여 효율적이고 안정적인 컨테이너 환경을 구축하세요.

다음 단계에서는 클라우드 인프라 관리에 대해 알아보겠습니다.
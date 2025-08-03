# 10-05. 보안 및 컴플라이언스 가이드

> "보안은 선택이 아닌 필수다. SuperClaude로 철벽 같은 보안을 구축하자."

## 📋 목차
1. [보안 아키텍처 개요](#보안-아키텍처-개요)
2. [컨테이너 보안](#컨테이너-보안)
3. [네트워크 보안](#네트워크-보안)
4. [데이터 보안](#데이터-보안)
5. [컴플라이언스 관리](#컴플라이언스-관리)
6. [SuperClaude 활용법](#superclaude-활용법)

## 보안 아키텍처 개요

### 핵심 원칙
```yaml
# security-principles.yml
security_principles:
  zero_trust: "모든 것을 검증하고 아무것도 신뢰하지 않는다"
  defense_in_depth: "다층 보안으로 공격 벡터 최소화"
  least_privilege: "최소 권한 원칙으로 접근 제어"
  secure_by_default: "기본값이 가장 안전한 설정"
  continuous_monitoring: "지속적인 보안 모니터링"
```

### SuperClaude 보안 명령어
```bash
# 보안 취약점 분석
/analyze security-vulnerabilities --focus security --think-hard

# 보안 아키텍처 설계
/design security-architecture --persona-security --wave-mode

# 보안 구현
/implement security-controls --type security --safe-mode

# 보안 강화
/improve security-posture --focus compliance --loop
```

## 컨테이너 보안

### 1. 보안 이미지 빌드
```dockerfile
# Dockerfile.secure
FROM node:18-alpine AS builder

# 보안 업데이트 설치
RUN apk update && apk upgrade && \
    apk add --no-cache \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# non-root 사용자 생성
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# 의존성 설치 (보안 스캔 포함)
COPY package*.json ./
RUN npm ci --only=production && \
    npm audit fix && \
    npm cache clean --force

# 소스 코드 복사 및 빌드
COPY --chown=appuser:appgroup . .
RUN npm run build

# 프로덕션 스테이지
FROM node:18-alpine AS production

# 보안 업데이트
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# non-root 사용자 생성
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# 최소 권한으로 파일 복사
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup package*.json ./

# 보안 설정
USER appuser
EXPOSE 3000

# dumb-init 사용으로 시그널 처리 개선
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]

# 보안 메타데이터
LABEL security.scan="enabled" \
      security.user="non-root" \
      security.updates="latest"
```

### 2. 컨테이너 보안 스캐너
```typescript
// container-security-scanner.ts
export class ContainerSecurityScanner {
  private trivyScanner: TrivyScanner;
  private synkScanner: SynkScanner;
  private cosignVerifier: CosignVerifier;

  async scanContainerImage(image: string): Promise<SecurityScanResult> {
    // 1. 취약점 스캔
    const vulnerabilities = await this.scanVulnerabilities(image);

    // 2. 설정 검사
    const configIssues = await this.scanConfiguration(image);

    // 3. 시크릿 스캔
    const secrets = await this.scanSecrets(image);

    // 4. 서명 검증
    const signatureVerification = await this.verifySignature(image);

    const riskScore = this.calculateRiskScore(vulnerabilities, configIssues, secrets);

    return {
      image,
      timestamp: new Date(),
      riskScore,
      vulnerabilities,
      configIssues,
      secrets,
      signatureVerification,
      recommendation: this.generateRecommendation(riskScore)
    };
  }

  private async scanVulnerabilities(image: string): Promise<Vulnerability[]> {
    const trivyResult = await this.trivyScanner.scan(image);
    const synkResult = await this.synkScanner.scan(image);

    // 결과 통합 및 중복 제거
    const vulnerabilities = this.mergeVulnerabilities(trivyResult, synkResult);

    return vulnerabilities.map(vuln => ({
      id: vuln.id,
      severity: vuln.severity,
      package: vuln.package,
      version: vuln.version,
      fixedVersion: vuln.fixedVersion,
      description: vuln.description,
      cvssScore: vuln.cvssScore,
      exploitAvailable: vuln.exploitAvailable
    }));
  }

  private async scanConfiguration(image: string): Promise<ConfigIssue[]> {
    const dockerfile = await this.extractDockerfile(image);
    const issues: ConfigIssue[] = [];

    // Dockerfile 보안 검사
    if (dockerfile.includes('FROM scratch')) {
      // 허용 - 최소 이미지
    } else if (!dockerfile.includes('USER ')) {
      issues.push({
        type: 'configuration',
        severity: 'high',
        issue: 'Running as root user',
        description: 'Container runs as root, violating least privilege principle',
        remediation: 'Add USER instruction to run as non-root user'
      });
    }

    if (dockerfile.includes('ADD ')) {
      issues.push({
        type: 'configuration',
        severity: 'medium',
        issue: 'Using ADD instead of COPY',
        description: 'ADD has additional features that can be security risks',
        remediation: 'Use COPY instead of ADD when possible'
      });
    }

    // 이미지 메타데이터 검사
    const metadata = await this.getImageMetadata(image);
    if (!metadata.healthcheck) {
      issues.push({
        type: 'configuration',
        severity: 'low',
        issue: 'No health check defined',
        description: 'Container lacks health check for monitoring',
        remediation: 'Add HEALTHCHECK instruction'
      });
    }

    return issues;
  }

  private calculateRiskScore(
    vulnerabilities: Vulnerability[],
    configIssues: ConfigIssue[],
    secrets: Secret[]
  ): RiskScore {
    let score = 0;

    // 취약점 점수
    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical': score += 10; break;
        case 'high': score += 7; break;
        case 'medium': score += 4; break;
        case 'low': score += 1; break;
      }

      if (vuln.exploitAvailable) score += 3;
    });

    // 설정 이슈 점수
    configIssues.forEach(issue => {
      switch (issue.severity) {
        case 'high': score += 5; break;
        case 'medium': score += 3; break;
        case 'low': score += 1; break;
      }
    });

    // 시크릿 점수
    score += secrets.length * 8;

    return {
      total: Math.min(score, 100),
      level: score >= 80 ? 'critical' :
             score >= 60 ? 'high' :
             score >= 30 ? 'medium' : 'low'
    };
  }
}
```

### 3. 런타임 보안 모니터링
```typescript
// runtime-security-monitor.ts
export class RuntimeSecurityMonitor {
  private falcoClient: FalcoClient;
  private auditLogger: AuditLogger;
  private alertManager: AlertManager;

  async startMonitoring(): Promise<void> {
    // 1. Falco 규칙 설정
    await this.setupFalcoRules();

    // 2. 이벤트 스트림 시작
    this.falcoClient.onSecurityEvent(this.handleSecurityEvent.bind(this));

    // 3. 네트워크 트래픽 모니터링
    await this.setupNetworkMonitoring();

    // 4. 파일 시스템 모니터링
    await this.setupFileSystemMonitoring();
  }

  private async setupFalcoRules(): Promise<void> {
    const rules = [
      // 권한 상승 감지
      {
        rule: 'Privilege Escalation Detected',
        condition: 'syscall.type=setuid or syscall.type=setgid',
        output: 'Privilege escalation attempt (user=%user.name command=%proc.cmdline)',
        priority: 'critical'
      },
      // 의심스러운 네트워크 연결
      {
        rule: 'Suspicious Network Connection',
        condition: 'fd.type=ipv4 and fd.net=external and not proc.name in (known_processes)',
        output: 'Suspicious external connection (process=%proc.name dest=%fd.rip)',
        priority: 'high'
      },
      // 파일 시스템 변경
      {
        rule: 'Sensitive File Access',
        condition: 'open_write and fd.filename in (/etc/passwd, /etc/shadow)',
        output: 'Sensitive file modified (file=%fd.name process=%proc.name)',
        priority: 'high'
      },
      // 컨테이너 이스케이프 시도
      {
        rule: 'Container Escape Attempt',
        condition: 'spawned_process and proc.name in (docker, runc, containerd)',
        output: 'Container escape attempt detected (process=%proc.name)',
        priority: 'critical'
      }
    ];

    for (const rule of rules) {
      await this.falcoClient.addRule(rule);
    }
  }

  private async handleSecurityEvent(event: SecurityEvent): Promise<void> {
    // 1. 이벤트 로깅
    await this.auditLogger.logSecurityEvent(event);

    // 2. 위험도 평가
    const riskAssessment = await this.assessEventRisk(event);

    // 3. 자동 대응
    if (riskAssessment.level === 'critical') {
      await this.executeEmergencyResponse(event);
    }

    // 4. 알림 발송
    await this.sendSecurityAlert(event, riskAssessment);

    // 5. 상관관계 분석
    await this.analyzeEventCorrelation(event);
  }

  private async executeEmergencyResponse(event: SecurityEvent): Promise<void> {
    switch (event.type) {
      case 'privilege_escalation':
        // 컨테이너 격리
        await this.isolateContainer(event.containerId);
        break;

      case 'container_escape':
        // 노드 격리
        await this.isolateNode(event.nodeId);
        break;

      case 'malware_detected':
        // 네트워크 차단
        await this.blockNetworkAccess(event.containerId);
        break;

      case 'data_exfiltration':
        // 즉시 알림 및 연결 차단
        await this.blockExternalConnections(event.containerId);
        await this.notifySecurityTeam(event);
        break;
    }
  }
}
```

## 네트워크 보안

### 1. 제로 트러스트 네트워크
```yaml
# zero-trust-network-policies.yml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: zero-trust-default-deny
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  # 기본적으로 모든 트래픽 차단
---
# 웹 앱 네트워크 정책
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-app-policy
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
    # Ingress Controller에서만 허용
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  # 데이터베이스 접근 허용
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
  # 외부 API 접근 허용 (HTTPS만)
  - to: []
    ports:
    - protocol: TCP
      port: 443
  # DNS 해상도 허용
  - to: []
    ports:
    - protocol: UDP
      port: 53
---
# 데이터베이스 네트워크 정책
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: database-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: database
  policyTypes:
  - Ingress
  - Egress
  ingress:
  # 웹 앱에서만 접근 허용
  - from:
    - podSelector:
        matchLabels:
          app: web-app
    ports:
    - protocol: TCP
      port: 5432
  egress:
  # DNS만 허용 (외부 연결 차단)
  - to: []
    ports:
    - protocol: UDP
      port: 53
```

### 2. 서비스 메시 보안
```typescript
// service-mesh-security.ts
export class ServiceMeshSecurity {
  private istioApi: IstioAPI;
  private certManager: CertManager;

  async setupMutualTLS(): Promise<void> {
    // 1. 전역 mTLS 정책
    const globalMTLS = {
      apiVersion: 'security.istio.io/v1beta1',
      kind: 'PeerAuthentication',
      metadata: {
        name: 'default',
        namespace: 'istio-system'
      },
      spec: {
        mtls: {
          mode: 'STRICT' // 모든 통신에 mTLS 강제
        }
      }
    };

    await this.istioApi.apply(globalMTLS);

    // 2. 네임스페이스별 정책
    const namespacePolicies = [
      'production',
      'staging',
      'development'
    ];

    for (const namespace of namespacePolicies) {
      await this.createNamespaceMTLSPolicy(namespace);
    }
  }

  async setupAuthorizationPolicies(): Promise<void> {
    const policies: AuthorizationPolicy[] = [
      // 웹 앱 접근 제어
      {
        metadata: {
          name: 'web-app-authz',
          namespace: 'production'
        },
        spec: {
          selector: {
            matchLabels: { app: 'web-app' }
          },
          rules: [{
            from: [{
              source: {
                principals: ['cluster.local/ns/ingress-nginx/sa/nginx-ingress']
              }
            }],
            to: [{
              operation: {
                methods: ['GET', 'POST']
              }
            }]
          }]
        }
      },
      // API 접근 제어 (JWT 기반)
      {
        metadata: {
          name: 'api-authz',
          namespace: 'production'
        },
        spec: {
          selector: {
            matchLabels: { app: 'api' }
          },
          rules: [{
            from: [{
              source: {
                requestPrincipals: ['*']
              }
            }],
            to: [{
              operation: {
                methods: ['GET', 'POST', 'PUT', 'DELETE']
              }
            }],
            when: [{
              key: 'custom.auth_token',
              values: ['*']
            }]
          }]
        }
      },
      // 관리자 접근 제어
      {
        metadata: {
          name: 'admin-authz',
          namespace: 'production'
        },
        spec: {
          selector: {
            matchLabels: { app: 'admin' }
          },
          rules: [{
            from: [{
              source: {
                requestPrincipals: ['https://accounts.company.com/admin']
              }
            }],
            to: [{
              operation: {
                methods: ['*']
              }
            }],
            when: [{
              key: 'custom.role',
              values: ['admin', 'super-admin']
            }]
          }]
        }
      }
    ];

    for (const policy of policies) {
      await this.istioApi.apply(policy);
    }
  }

  async setupSecurityMonitoring(): Promise<void> {
    // 1. 보안 이벤트 수집
    const telemetryConfig = {
      apiVersion: 'telemetry.istio.io/v1alpha1',
      kind: 'Telemetry',
      metadata: {
        name: 'security-telemetry',
        namespace: 'istio-system'
      },
      spec: {
        metrics: [{
          providers: [{
            name: 'prometheus'
          }],
          overrides: [{
            match: {
              metric: 'requests_total'
            },
            tagOverrides: {
              source_app: {
                value: '%{source_app}'
              },
              dest_app: {
                value: '%{destination_app}'
              },
              response_code: {
                value: '%{response_code}'
              }
            }
          }]
        }],
        accessLogging: [{
          providers: [{
            name: 'otel'
          }]
        }]
      }
    };

    await this.istioApi.apply(telemetryConfig);

    // 2. 보안 알림 규칙
    await this.setupSecurityAlerts();
  }

  private async setupSecurityAlerts(): Promise<void> {
    const alertRules = [
      // mTLS 실패 감지
      {
        alert: 'MTLSHandshakeFailure',
        expr: 'rate(istio_request_total{response_code="000"}[5m]) > 0.1',
        for: '1m',
        labels: {
          severity: 'critical'
        },
        annotations: {
          summary: 'High rate of mTLS handshake failures detected'
        }
      },
      // 인증 실패 급증
      {
        alert: 'AuthenticationFailureSpike',
        expr: 'rate(istio_request_total{response_code="401"}[5m]) > 1',
        for: '2m',
        labels: {
          severity: 'high'
        },
        annotations: {
          summary: 'Authentication failure rate is elevated'
        }
      },
      // 인가 실패 감지
      {
        alert: 'AuthorizationViolation',
        expr: 'rate(istio_request_total{response_code="403"}[5m]) > 0.5',
        for: '1m',
        labels: {
          severity: 'high'
        },
        annotations: {
          summary: 'Authorization violations detected'
        }
      }
    ];

    for (const rule of alertRules) {
      await this.alertManager.addRule(rule);
    }
  }
}
```

## 데이터 보안

### 1. 암호화 관리
```typescript
// encryption-manager.ts
export class EncryptionManager {
  private kmsClient: KMSClient;
  private vaultClient: VaultClient;

  async setupEncryptionAtRest(): Promise<void> {
    // 1. 데이터베이스 암호화
    await this.setupDatabaseEncryption();

    // 2. 파일 시스템 암호화
    await this.setupStorageEncryption();

    // 3. 애플리케이션 수준 암호화
    await this.setupApplicationEncryption();
  }

  private async setupDatabaseEncryption(): Promise<void> {
    const encryptionConfigs = [
      {
        database: 'postgresql',
        config: {
          ssl: 'require',
          sslmode: 'require',
          encryption: {
            algorithm: 'AES-256-GCM',
            keyRotation: '90d',
            transparentDataEncryption: true
          }
        }
      },
      {
        database: 'redis',
        config: {
          tls: {
            enabled: true,
            certFile: '/etc/ssl/certs/redis.crt',
            keyFile: '/etc/ssl/private/redis.key'
          },
          encryption: {
            atRest: true,
            algorithm: 'AES-256'
          }
        }
      }
    ];

    for (const config of encryptionConfigs) {
      await this.configureDatabaseEncryption(config);
    }
  }

  async setupSecretsManagement(): Promise<void> {
    // 1. Vault 정책 설정
    const policies: VaultPolicy[] = [
      {
        name: 'web-app-policy',
        policy: `
          path "secret/data/web-app/*" {
            capabilities = ["read"]
          }
          path "database/creds/web-app-role" {
            capabilities = ["read"]
          }
        `
      },
      {
        name: 'admin-policy',
        policy: `
          path "secret/*" {
            capabilities = ["create", "read", "update", "delete", "list"]
          }
          path "auth/*" {
            capabilities = ["create", "read", "update", "delete", "list"]
          }
        `
      }
    ];

    for (const policy of policies) {
      await this.vaultClient.createPolicy(policy);
    }

    // 2. 동적 시크릿 설정
    await this.setupDynamicSecrets();

    // 3. 시크릿 자동 순환
    await this.setupSecretRotation();
  }

  private async setupDynamicSecrets(): Promise<void> {
    // 데이터베이스 동적 자격 증명
    const dbConfig = {
      plugin_name: 'postgresql-database-plugin',
      connection_url: 'postgresql://vault:{{password}}@postgres:5432/mydb?sslmode=require',
      allowed_roles: 'web-app-role',
      username: 'vault',
      password: '{{.RandomPassword}}'
    };

    await this.vaultClient.configureDatabaseEngine(dbConfig);

    // 역할 정의
    const role = {
      name: 'web-app-role',
      db_name: 'postgresql',
      creation_statements: [
        'CREATE ROLE "{{name}}" WITH LOGIN PASSWORD \'{{password}}\' VALID UNTIL \'{{expiration}}\';',
        'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "{{name}}";'
      ],
      default_ttl: '1h',
      max_ttl: '24h'
    };

    await this.vaultClient.createDatabaseRole(role);
  }

  async implementFieldLevelEncryption(): Promise<void> {
    // 애플리케이션 수준 암호화
    const encryptionService = new FieldEncryptionService({
      keyManagement: 'vault',
      algorithms: {
        deterministic: 'AES-256-SIV',
        randomized: 'AES-256-GCM'
      },
      keyRotation: {
        enabled: true,
        interval: '30d',
        retainOldKeys: 3
      }
    });

    // 민감한 필드 암호화 설정
    const sensitiveFields = [
      { field: 'email', type: 'deterministic' },
      { field: 'ssn', type: 'randomized' },
      { field: 'creditCard', type: 'randomized' },
      { field: 'phoneNumber', type: 'deterministic' }
    ];

    for (const field of sensitiveFields) {
      await encryptionService.configureFieldEncryption(field);
    }
  }
}
```

### 2. 데이터 분류 및 보호
```typescript
// data-classification.ts
export class DataClassificationService {
  private classificationRules: ClassificationRule[];
  private dlpScanner: DLPScanner;

  async classifyData(data: any): Promise<DataClassification> {
    const classification: DataClassification = {
      confidentialityLevel: 'public',
      sensitiveFields: [],
      complianceRequirements: [],
      retentionPeriod: '7y'
    };

    // 1. 자동 분류
    for (const rule of this.classificationRules) {
      const matches = await this.evaluateRule(rule, data);
      if (matches) {
        classification.confidentialityLevel = this.upgradeClassification(
          classification.confidentialityLevel,
          rule.classification
        );
        classification.sensitiveFields.push(...rule.sensitiveFields);
        classification.complianceRequirements.push(...rule.complianceRequirements);
      }
    }

    // 2. DLP 스캔
    const dlpResults = await this.dlpScanner.scan(data);
    for (const result of dlpResults) {
      if (result.confidence > 0.8) {
        classification.sensitiveFields.push({
          field: result.field,
          type: result.dataType,
          confidence: result.confidence
        });
      }
    }

    // 3. 보호 정책 적용
    const protectionPolicy = await this.determineProtectionPolicy(classification);

    return {
      ...classification,
      protectionPolicy
    };
  }

  private async determineProtectionPolicy(
    classification: DataClassification
  ): Promise<ProtectionPolicy> {
    const policy: ProtectionPolicy = {
      encryption: {
        required: false,
        algorithm: 'AES-256-GCM'
      },
      access: {
        requiresAuthentication: true,
        requiredRoles: ['user']
      },
      storage: {
        region: 'any',
        retentionPeriod: classification.retentionPeriod
      },
      transmission: {
        requiresEncryption: true,
        allowedProtocols: ['HTTPS', 'TLS']
      }
    };

    switch (classification.confidentialityLevel) {
      case 'highly_confidential':
        policy.encryption.required = true;
        policy.access.requiredRoles = ['admin', 'data-steward'];
        policy.storage.region = 'specific';
        policy.transmission.allowedProtocols = ['TLS'];
        break;

      case 'confidential':
        policy.encryption.required = true;
        policy.access.requiredRoles = ['user', 'manager'];
        policy.storage.region = 'regional';
        break;

      case 'internal':
        policy.access.requiredRoles = ['employee'];
        break;

      case 'public':
        policy.access.requiresAuthentication = false;
        policy.access.requiredRoles = [];
        break;
    }

    // 컴플라이언스 요구사항 적용
    if (classification.complianceRequirements.includes('GDPR')) {
      policy.privacy = {
        rightToErasure: true,
        dataPortability: true,
        consentRequired: true
      };
    }

    if (classification.complianceRequirements.includes('HIPAA')) {
      policy.encryption.required = true;
      policy.audit = {
        accessLogging: true,
        changeTracking: true
      };
    }

    return policy;
  }
}
```

## 컴플라이언스 관리

### 1. 자동화된 컴플라이언스 검사
```typescript
// compliance-checker.ts
export class ComplianceChecker {
  private regulations: ComplianceRegulation[];
  private auditLogger: AuditLogger;

  async performComplianceAudit(scope: AuditScope): Promise<ComplianceReport> {
    const findings: ComplianceFinding[] = [];

    // 1. 시스템 설정 검사
    const systemFindings = await this.auditSystemConfiguration(scope);
    findings.push(...systemFindings);

    // 2. 데이터 보호 검사
    const dataFindings = await this.auditDataProtection(scope);
    findings.push(...dataFindings);

    // 3. 접근 제어 검사
    const accessFindings = await this.auditAccessControls(scope);
    findings.push(...accessFindings);

    // 4. 로깅 및 모니터링 검사
    const loggingFindings = await this.auditLoggingCompliance(scope);
    findings.push(...loggingFindings);

    const report = this.generateComplianceReport(findings);
    await this.auditLogger.logComplianceAudit(report);

    return report;
  }

  private async auditSystemConfiguration(scope: AuditScope): Promise<ComplianceFinding[]> {
    const findings: ComplianceFinding[] = [];

    // PCI DSS 요구사항 검사
    if (scope.regulations.includes('PCI_DSS')) {
      // 네트워크 분할 검사
      const networkPolicies = await this.getNetworkPolicies();
      if (!networkPolicies.some(policy => policy.defaultDeny)) {
        findings.push({
          regulation: 'PCI_DSS',
          requirement: '1.2.1',
          severity: 'high',
          description: 'Default deny network policy not implemented',
          remediation: 'Implement default deny network policies',
          evidence: 'Network policies configuration'
        });
      }

      // 암호화 검사
      const encryptionStatus = await this.checkEncryption();
      if (!encryptionStatus.databaseEncrypted) {
        findings.push({
          regulation: 'PCI_DSS',
          requirement: '3.4',
          severity: 'critical',
          description: 'Cardholder data not encrypted at rest',
          remediation: 'Enable database encryption for cardholder data',
          evidence: 'Database configuration analysis'
        });
      }
    }

    // SOC 2 Type II 검사
    if (scope.regulations.includes('SOC2')) {
      // 접근 로깅 검사
      const auditLogging = await this.checkAuditLogging();
      if (!auditLogging.enabled) {
        findings.push({
          regulation: 'SOC2',
          requirement: 'CC6.1',
          severity: 'medium',
          description: 'Comprehensive audit logging not enabled',
          remediation: 'Enable audit logging for all system access',
          evidence: 'Logging configuration review'
        });
      }
    }

    return findings;
  }

  private async auditDataProtection(scope: AuditScope): Promise<ComplianceFinding[]> {
    const findings: ComplianceFinding[] = [];

    // GDPR 검사
    if (scope.regulations.includes('GDPR')) {
      // 개인 데이터 식별
      const personalData = await this.identifyPersonalData();

      for (const data of personalData) {
        // 법적 근거 확인
        if (!data.legalBasis) {
          findings.push({
            regulation: 'GDPR',
            requirement: 'Art. 6',
            severity: 'high',
            description: `No legal basis documented for processing ${data.type}`,
            remediation: 'Document legal basis for personal data processing',
            evidence: `Data classification for ${data.location}`
          });
        }

        // 보존 기간 확인
        if (!data.retentionPeriod) {
          findings.push({
            regulation: 'GDPR',
            requirement: 'Art. 5(1)(e)',
            severity: 'medium',
            description: `No retention period defined for ${data.type}`,
            remediation: 'Define and implement data retention policies',
            evidence: `Data retention configuration`
          });
        }

        // 삭제 권리 구현 확인
        if (!data.deletionCapability) {
          findings.push({
            regulation: 'GDPR',
            requirement: 'Art. 17',
            severity: 'high',
            description: `Right to erasure not implemented for ${data.type}`,
            remediation: 'Implement data deletion capabilities',
            evidence: `Technical analysis of ${data.location}`
          });
        }
      }
    }

    return findings;
  }

  async generateComplianceReport(findings: ComplianceFinding[]): Promise<ComplianceReport> {
    const summary = this.summarizeFindings(findings);

    return {
      timestamp: new Date(),
      scope: 'production',
      regulations: ['PCI_DSS', 'GDPR', 'SOC2'],
      summary,
      findings,
      recommendations: await this.generateRecommendations(findings),
      nextAuditDate: this.calculateNextAuditDate(summary.riskLevel)
    };
  }

  private generateRecommendations(findings: ComplianceFinding[]): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];

    // 우선순위별 그룹화
    const criticalFindings = findings.filter(f => f.severity === 'critical');
    const highFindings = findings.filter(f => f.severity === 'high');

    if (criticalFindings.length > 0) {
      recommendations.push({
        priority: 'immediate',
        action: 'Address critical compliance violations',
        timeline: '24 hours',
        findings: criticalFindings.map(f => f.requirement)
      });
    }

    if (highFindings.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Remediate high-severity compliance gaps',
        timeline: '1 week',
        findings: highFindings.map(f => f.requirement)
      });
    }

    // 자동화 기회 식별
    const automationOpportunities = this.identifyAutomationOpportunities(findings);
    if (automationOpportunities.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: 'Implement automated compliance controls',
        timeline: '1 month',
        details: automationOpportunities
      });
    }

    return recommendations;
  }
}
```

### 2. 규제 준수 자동화
```typescript
// regulatory-automation.ts
export class RegulatoryAutomation {
  private policyEngine: PolicyEngine;
  private workflowEngine: WorkflowEngine;

  async implementGDPRCompliance(): Promise<void> {
    // 1. 데이터 주체 권리 자동화
    await this.setupDataSubjectRights();

    // 2. 동의 관리 자동화
    await this.setupConsentManagement();

    // 3. 데이터 보호 영향 평가 자동화
    await this.setupDPIAWorkflow();

    // 4. 위반 알림 자동화
    await this.setupBreachNotification();
  }

  private async setupDataSubjectRights(): Promise<void> {
    const workflows = [
      // 접근 권리 (Art. 15)
      {
        name: 'data_access_request',
        trigger: 'api_request',
        steps: [
          {
            action: 'verify_identity',
            timeout: '24h'
          },
          {
            action: 'collect_personal_data',
            sources: ['database', 'logs', 'backups']
          },
          {
            action: 'generate_report',
            format: 'structured_data'
          },
          {
            action: 'deliver_securely',
            method: 'encrypted_email'
          }
        ]
      },
      // 삭제 권리 (Art. 17)
      {
        name: 'data_erasure_request',
        trigger: 'api_request',
        steps: [
          {
            action: 'verify_identity',
            timeout: '24h'
          },
          {
            action: 'check_legal_grounds',
            requirements: ['no_legal_obligation', 'consent_withdrawn']
          },
          {
            action: 'delete_personal_data',
            sources: ['database', 'backups', 'logs'],
            verification: 'cryptographic_proof'
          },
          {
            action: 'notify_controllers',
            recipients: 'third_party_processors'
          }
        ]
      },
      // 이동권 (Art. 20)
      {
        name: 'data_portability_request',
        trigger: 'api_request',
        steps: [
          {
            action: 'verify_identity',
            timeout: '24h'
          },
          {
            action: 'extract_portable_data',
            format: 'machine_readable'
          },
          {
            action: 'generate_export',
            formats: ['json', 'csv', 'xml']
          },
          {
            action: 'secure_transfer',
            method: 'api_or_download'
          }
        ]
      }
    ];

    for (const workflow of workflows) {
      await this.workflowEngine.createWorkflow(workflow);
    }
  }

  private async setupBreachNotification(): Promise<void> {
    const breachDetectionRules = [
      {
        name: 'unauthorized_access_detected',
        condition: 'failed_login_attempts > 10 AND time_window < 5m',
        severity: 'high',
        action: 'investigate_breach'
      },
      {
        name: 'data_exfiltration_detected',
        condition: 'data_transfer_volume > baseline * 5 AND destination = external',
        severity: 'critical',
        action: 'immediate_breach_response'
      },
      {
        name: 'system_compromise_detected',
        condition: 'privilege_escalation = true AND source = unknown',
        severity: 'critical',
        action: 'immediate_breach_response'
      }
    ];

    const breachWorkflow = {
      name: 'gdpr_breach_notification',
      steps: [
        {
          action: 'assess_breach',
          timeline: '1h',
          criteria: ['personal_data_involved', 'risk_to_individuals']
        },
        {
          action: 'notify_dpa',
          timeline: '72h',
          condition: 'high_risk_to_individuals',
          recipients: ['data_protection_authority']
        },
        {
          action: 'notify_individuals',
          timeline: '1 week',
          condition: 'high_risk_confirmed',
          method: 'direct_communication'
        },
        {
          action: 'document_breach',
          requirements: ['incident_details', 'remediation_actions', 'lessons_learned']
        }
      ]
    };

    await this.workflowEngine.createWorkflow(breachWorkflow);

    for (const rule of breachDetectionRules) {
      await this.policyEngine.addRule(rule);
    }
  }
}
```

## SuperClaude 활용법

### 1. 보안 아키텍처 설계
```bash
# 보안 아키텍처 분석 및 설계
/design security-architecture --persona-security --think-hard
- 위협 모델링
- 보안 제어 설계
- 제로 트러스트 구현
- 방어 심층 전략

# 취약점 분석
/analyze security-vulnerabilities --focus security --seq
- 코드 취약점 스캔
- 인프라 보안 평가
- 설정 오류 검사
- 의존성 취약점 검토
```

### 2. 컴플라이언스 자동화
```bash
# 컴플라이언스 요구사항 분석
/analyze compliance-requirements --focus compliance --think
- 규제 요구사항 매핑
- 갭 분석
- 리스크 평가
- 우선순위 지정

# 컴플라이언스 시스템 구현
/implement compliance-automation --type governance --safe-mode
- 자동화된 검사
- 정책 엔진 구현
- 감사 추적
- 보고서 생성
```

### 3. 보안 모니터링
```bash
# 보안 모니터링 설계
/design security-monitoring --persona-security --wave-mode
- 위협 탐지 시스템
- 보안 이벤트 상관관계
- 인시던트 대응 자동화
- 포렌식 준비

# 보안 운영 개선
/improve security-operations --focus automation --loop
- 탐지 정확도 향상
- 대응 시간 단축
- 거짓 양성 감소
- 자동화 확대
```

### 4. 데이터 보호 구현
```bash
# 데이터 보호 전략 설계
/design data-protection --persona-security --validate
- 데이터 분류 체계
- 암호화 전략
- 접근 제어 모델
- 생명주기 관리

# 개인정보 보호 자동화
/implement privacy-automation --type compliance --magic
- GDPR 자동화
- 동의 관리
- 데이터 주체 권리
- 위반 알림 시스템
```

## 마무리

보안과 컴플라이언스는 현대 애플리케이션의 필수 요소입니다. SuperClaude의 Security 페르소나와 분석 능력을 활용하여 견고한 보안 체계를 구축하고, 규제 요구사항을 자동화하여 지속적인 컴플라이언스를 달성하세요.

다음 단계에서는 성능 최적화에 대해 알아보겠습니다.
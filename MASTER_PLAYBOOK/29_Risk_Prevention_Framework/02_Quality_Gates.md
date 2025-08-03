# 🚪 Quality Gates - 품질 검증 자동화 시스템

## 📋 개요

코드가 프로덕션에 배포되기 전에 반드시 통과해야 하는 품질 검증 단계를 자동화합니다. 각 단계마다 명확한 통과 기준을 설정하고, 하나라도 실패하면 다음 단계로 진행할 수 없도록 합니다.

## 🎯 핵심 목표

1. **Automated Validation**: 모든 검증 프로세스 자동화
2. **Early Detection**: 문제를 최대한 빠르게 발견
3. **Consistent Quality**: 일관된 품질 기준 적용
4. **Fast Feedback**: 개발자에게 즉각적인 피드백
5. **Zero Defects**: 결함 없는 코드만 배포

## 🏗️ Quality Gate 아키텍처

```typescript
interface QualityGateSystem {
  // 검증 단계
  stages: {
    preCommit: PreCommitGate;
    preBuild: PreBuildGate;
    postBuild: PostBuildGate;
    preDeployment: PreDeploymentGate;
    postDeployment: PostDeploymentGate;
  };
  
  // 검증 도구
  validators: {
    syntax: SyntaxValidator;
    type: TypeValidator;
    lint: LintValidator;
    test: TestValidator;
    security: SecurityValidator;
    performance: PerformanceValidator;
  };
  
  // 결과 관리
  reporting: {
    dashboard: QualityDashboard;
    notifications: NotificationSystem;
    metrics: MetricsCollector;
    history: HistoryTracker;
  };
}
```

## 🔐 Pre-commit Quality Gates

### 1. 코드 품질 검사
```yaml
# .pre-commit-config.yaml
repos:
  # TypeScript 타입 검사
  - repo: local
    hooks:
      - id: typescript
        name: TypeScript Check
        entry: bash -c 'tsc --noEmit'
        language: system
        files: \.tsx?$
        pass_filenames: false
        
  # ESLint 검사
  - repo: local
    hooks:
      - id: eslint
        name: ESLint Check
        entry: bash -c 'eslint . --ext .ts,.tsx --max-warnings 0'
        language: system
        files: \.tsx?$
        
  # i18n 하드코딩 검사
  - repo: local
    hooks:
      - id: i18n-check
        name: i18n Hardcoding Check
        entry: python scripts/check-hardcoding.py
        language: python
        files: \.tsx?$
        
  # 테스트 커버리지 검사
  - repo: local
    hooks:
      - id: test-coverage
        name: Test Coverage Check
        entry: bash -c 'npm test -- --coverage --watchAll=false'
        language: system
        pass_filenames: false
```

### 2. 하드코딩 검사 스크립트
```python
# scripts/check-hardcoding.py
import re
import sys
import json
from pathlib import Path

class HardcodingChecker:
    def __init__(self):
        self.patterns = [
            # UI 텍스트
            (r'(?<!\w)["\']([A-Z][a-zA-Z\s]{2,})["\']', 'UI text'),
            (r'placeholder=["\']([^"\'
]+)["\']', 'placeholder'),
            (r'title=["\']([^"\'
]+)["\']', 'title'),
            (r'alt=["\']([^"\'
]+)["\']', 'alt text'),
            
            # 에러 메시지
            (r'throw new Error\(["\']([^"\'
]+)["\']\)', 'error message'),
            (r'console\.(log|error|warn)\(["\']([^"\'
]+)["\']', 'console message'),
            
            # 한글 텍스트
            (r'["\'][\uac00-\ud7a3]+["\']', 'Korean text')
        ]
        
        self.whitelist = [
            r'^[A-Z_]+$',  # 상수
            r'^\w+$',      # 단일 단어 변수명
            r'^https?://',  # URL
            r'^[\w-]+\.[\w]+$',  # 파일명
        ]
    
    def check_file(self, filepath):
        violations = []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        for line_num, line in enumerate(content.split('\n'), 1):
            for pattern, desc in self.patterns:
                matches = re.finditer(pattern, line)
                
                for match in matches:
                    text = match.group(1)
                    
                    # 화이트리스트 확인
                    if any(re.match(wl, text) for wl in self.whitelist):
                        continue
                    
                    violations.append({
                        'file': filepath,
                        'line': line_num,
                        'type': desc,
                        'text': text,
                        'suggestion': f't(\'{self.suggest_key(text)}\')',
                    })
        
        return violations
    
    def suggest_key(self, text):
        # i18n 키 제안
        key = text.lower()
        key = re.sub(r'[^a-z0-9]+', '_', key)
        key = key.strip('_')
        return f'common.{key}'

if __name__ == '__main__':
    checker = HardcodingChecker()
    violations = []
    
    for filepath in sys.argv[1:]:
        if Path(filepath).suffix in ['.ts', '.tsx', '.js', '.jsx']:
            violations.extend(checker.check_file(filepath))
    
    if violations:
        print('\n❌ Hardcoded strings found:\n')
        for v in violations:
            print(f"{v['file']}:{v['line']} - {v['type']}: \"{v['text']}\"")
            print(f"  → Suggestion: {v['suggestion']}\n")
        
        sys.exit(1)
    else:
        print('✅ No hardcoded strings found')
```

## 🏗️ CI/CD Quality Gates

### 1. GitHub Actions 파이프라인
```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    # Gate 1: 타입 검사
    - name: TypeScript Check
      run: |
        echo "::group::TypeScript Validation"
        npm run type-check
        echo "::endgroup::"
      
    # Gate 2: Lint 검사
    - name: ESLint Check
      run: |
        echo "::group::ESLint Validation"
        npm run lint -- --max-warnings 0
        echo "::endgroup::"
    
    # Gate 3: i18n 검사
    - name: i18n Check
      run: |
        echo "::group::i18n Validation"
        npm run i18n:check
        echo "::endgroup::"
    
    # Gate 4: 단위 테스트
    - name: Unit Tests
      run: |
        echo "::group::Unit Tests"
        npm run test:unit -- --coverage
        echo "::endgroup::"
    
    # Gate 5: 통합 테스트
    - name: Integration Tests
      run: |
        echo "::group::Integration Tests"
        npm run test:integration
        echo "::endgroup::"
    
    # Gate 6: 보안 검사
    - name: Security Audit
      run: |
        echo "::group::Security Audit"
        npm audit --production --audit-level=moderate
        echo "::endgroup::"
    
    # Gate 7: 번들 크기 검사
    - name: Bundle Size Check
      run: |
        echo "::group::Bundle Size Check"
        npm run build
        npm run analyze:bundle
        echo "::endgroup::"
    
    # 결과 리포트
    - name: Upload Test Results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: |
          coverage/
          test-results/
          bundle-stats.json
```

### 2. 품질 임계값 설정
```typescript
// quality-thresholds.ts
export const QUALITY_THRESHOLDS = {
  // 코드 커버리지
  coverage: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80
  },
  
  // 코드 품질
  codeQuality: {
    duplicateLines: 5,     // %
    complexityWarning: 10,
    complexityError: 20,
    maxFileLength: 300,
    maxFunctionLength: 50
  },
  
  // 성능
  performance: {
    bundleSize: {
      max: 500 * 1024,      // 500KB
      warning: 400 * 1024   // 400KB
    },
    lighthouse: {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 90
    }
  },
  
  // 보안
  security: {
    critical: 0,
    high: 0,
    moderate: 3,
    low: 10
  }
};
```

## 📊 Quality Dashboard

### 1. 실시간 품질 대시보드
```typescript
interface QualityMetrics {
  // 현재 상태
  current: {
    coverage: CoverageMetrics;
    codeQuality: CodeQualityMetrics;
    performance: PerformanceMetrics;
    security: SecurityMetrics;
  };
  
  // 트렌드
  trends: {
    daily: TrendData[];
    weekly: TrendData[];
    monthly: TrendData[];
  };
  
  // 경고
  alerts: {
    critical: Alert[];
    warning: Alert[];
    info: Alert[];
  };
}

class QualityDashboard {
  async generateReport(): Promise<QualityReport> {
    const metrics = await this.collectMetrics();
    
    return {
      summary: this.generateSummary(metrics),
      details: this.generateDetails(metrics),
      recommendations: this.generateRecommendations(metrics),
      score: this.calculateQualityScore(metrics)
    };
  }
  
  private calculateQualityScore(metrics: QualityMetrics): number {
    const weights = {
      coverage: 0.3,
      codeQuality: 0.25,
      performance: 0.25,
      security: 0.2
    };
    
    return Object.entries(weights).reduce((score, [key, weight]) => {
      const metricScore = this.normalizeScore(metrics.current[key]);
      return score + (metricScore * weight);
    }, 0);
  }
}
```

### 2. 자동 알림 시스템
```typescript
class QualityNotifier {
  async notifyQualityIssues(report: QualityReport): Promise<void> {
    // Slack 알림
    if (report.score < 70) {
      await this.sendSlackAlert({
        channel: '#dev-alerts',
        severity: 'critical',
        message: `🚨 Quality Score: ${report.score}/100`,
        details: report.summary,
        actions: report.recommendations
      });
    }
    
    // 이메일 알림
    if (report.alerts.critical.length > 0) {
      await this.sendEmailAlert({
        to: ['tech-lead@company.com'],
        subject: 'Critical Quality Issues Detected',
        body: this.formatEmailBody(report)
      });
    }
    
    // PR 코멘트
    if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
      await this.postPRComment({
        body: this.formatPRComment(report),
        status: report.score >= 80 ? 'success' : 'failure'
      });
    }
  }
}
```

## 🔧 커스텀 Quality Gates

### 1. 프로젝트별 규칙
```typescript
// project-quality-rules.ts
export const PROJECT_QUALITY_RULES: QualityRule[] = [
  {
    name: 'No Console Logs',
    severity: 'error',
    validator: (file: string) => {
      const content = fs.readFileSync(file, 'utf-8');
      return !content.includes('console.log');
    },
    message: 'Remove all console.log statements'
  },
  
  {
    name: 'Component Naming',
    severity: 'error',
    validator: (file: string) => {
      if (!file.endsWith('.tsx')) return true;
      const basename = path.basename(file, '.tsx');
      return /^[A-Z][a-zA-Z]*$/.test(basename);
    },
    message: 'Component files must use PascalCase'
  },
  
  {
    name: 'Import Order',
    severity: 'warning',
    validator: (file: string) => {
      const content = fs.readFileSync(file, 'utf-8');
      const imports = content.match(/^import .* from .*;$/gm) || [];
      
      // 검증: React > 외부 라이브러리 > 내부 모듈
      const sorted = [...imports].sort((a, b) => {
        const scoreA = getImportScore(a);
        const scoreB = getImportScore(b);
        return scoreA - scoreB;
      });
      
      return imports.join('\n') === sorted.join('\n');
    },
    message: 'Imports must be sorted: React, external, internal'
  }
];
```

### 2. AI 코드 품질 검사
```typescript
class AICodeQualityGate {
  async validateAIGeneratedCode(code: string): Promise<ValidationResult> {
    const checks = [
      this.checkNoHardcoding(code),
      this.checkTypeAnnotations(code),
      this.checkErrorHandling(code),
      this.checkTestability(code),
      this.checkDocumentation(code)
    ];
    
    const results = await Promise.all(checks);
    const failed = results.filter(r => !r.passed);
    
    return {
      passed: failed.length === 0,
      score: ((results.length - failed.length) / results.length) * 100,
      failures: failed,
      suggestions: this.generateSuggestions(failed)
    };
  }
  
  private async checkTestability(code: string): Promise<CheckResult> {
    // 테스트 가능성 검사
    const issues = [];
    
    // 전역 변수 사용 검사
    if (/^(?!import|export).*let\s+\w+\s*=/gm.test(code)) {
      issues.push('Avoid global variables for better testability');
    }
    
    // 순수 함수 검사
    const functionCount = (code.match(/function|=>/g) || []).length;
    const pureCount = (code.match(/\/\*\s*@pure\s*\*\//g) || []).length;
    
    if (functionCount > 0 && pureCount / functionCount < 0.7) {
      issues.push('Prefer pure functions for easier testing');
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }
}
```

## 📈 품질 향상 추적

```typescript
class QualityImprovement {
  async trackProgress(): Promise<ImprovementReport> {
    const history = await this.getQualityHistory();
    
    return {
      // 개선된 영역
      improvements: {
        coverage: this.calculateImprovement(history, 'coverage'),
        codeQuality: this.calculateImprovement(history, 'codeQuality'),
        performance: this.calculateImprovement(history, 'performance')
      },
      
      // 악화된 영역
      degradations: {
        bundleSize: this.calculateDegradation(history, 'bundleSize'),
        complexity: this.calculateDegradation(history, 'complexity')
      },
      
      // 추천 사항
      recommendations: this.generateRecommendations(history),
      
      // 다음 목표
      nextTargets: this.calculateNextTargets(history)
    };
  }
}
```

## 🎯 Best Practices

### 1. 점진적 강화
```typescript
const PROGRESSIVE_THRESHOLDS = {
  week1: { coverage: 60, complexity: 15 },
  week2: { coverage: 70, complexity: 12 },
  week3: { coverage: 80, complexity: 10 },
  final: { coverage: 85, complexity: 8 }
};
```

### 2. 팀별 예외 규칙
```typescript
// .quality-exceptions.json
{
  "exceptions": [
    {
      "rule": "coverage",
      "path": "src/legacy/**",
      "threshold": 50,
      "reason": "Legacy code - gradual improvement",
      "expires": "2024-12-31"
    },
    {
      "rule": "complexity",
      "path": "src/utils/parser.ts",
      "threshold": 25,
      "reason": "Complex parsing logic required",
      "approvedBy": "tech-lead"
    }
  ]
}
```

### 3. 성공 메트릭
```typescript
const SUCCESS_METRICS = {
  deploymentFailureRate: 0,      // 0%
  meanTimeToRecovery: 30,        // 30분 이내
  changeFailureRate: 5,          // 5% 이하
  releaseFrequency: 'daily',     // 매일 배포
  customerSatisfaction: 4.5      // 5점 만점
};
```

---

*Quality Gates: 결함은 게이트를 통과할 수 없다*
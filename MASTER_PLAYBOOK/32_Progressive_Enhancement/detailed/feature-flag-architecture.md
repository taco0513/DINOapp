# Feature Flag 아키텍처 가이드

## 🚩 Feature Flag의 핵심 가치

Feature Flag는 코드 배포와 기능 출시를 분리하여 위험을 최소화하고 점진적 개선을 가능하게 하는 핵심 도구입니다.

## 🏗️ Feature Flag 시스템 설계

### 기본 아키텍처
```typescript
// types/feature-flags.ts
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
  conditions?: FeatureCondition[];
  metadata?: {
    description: string;
    owner: string;
    createdAt: Date;
    expiresAt?: Date;
  };
}

export interface FeatureCondition {
  type: 'user_segment' | 'device_type' | 'location' | 'custom';
  operator: 'equals' | 'contains' | 'greater_than' | 'in';
  value: any;
}
```

### Feature Flag Manager
```typescript
// lib/feature-flags.ts
class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private userContext: UserContext;

  constructor(userContext: UserContext) {
    this.userContext = userContext;
    this.loadFlags();
  }

  // 기본 플래그 확인
  isEnabled(flagKey: string): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) return false;

    // 기본 활성화 체크
    if (!flag.enabled) return false;

    // 롤아웃 비율 체크
    if (!this.checkRolloutPercentage(flag)) return false;

    // 조건 체크
    return this.checkConditions(flag);
  }

  // 고급: 변형(variant) 반환
  getVariant(flagKey: string): string {
    if (!this.isEnabled(flagKey)) return 'control';
    
    const flag = this.flags.get(flagKey);
    const hash = this.getUserHash(this.userContext.userId, flagKey);
    
    // A/B 테스트 지원
    if (hash < 0.5) return 'variant_a';
    return 'variant_b';
  }

  private checkRolloutPercentage(flag: FeatureFlag): boolean {
    if (flag.rolloutPercentage >= 100) return true;
    
    const hash = this.getUserHash(this.userContext.userId, flag.key);
    return hash * 100 < flag.rolloutPercentage;
  }

  private checkConditions(flag: FeatureFlag): boolean {
    if (!flag.conditions || flag.conditions.length === 0) return true;
    
    return flag.conditions.every(condition => {
      switch (condition.type) {
        case 'user_segment':
          return this.userContext.segments.includes(condition.value);
        case 'device_type':
          return this.userContext.deviceType === condition.value;
        case 'location':
          return this.userContext.location === condition.value;
        default:
          return true;
      }
    });
  }

  private getUserHash(userId: string, flagKey: string): number {
    // 일관된 해시 생성 (사용자별로 항상 같은 결과)
    const combined = `${userId}_${flagKey}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32비트 정수로 변환
    }
    return Math.abs(hash) / Math.pow(2, 31);
  }
}
```

## 🎯 실전 활용 패턴

### 1. 안전한 기능 출시
```tsx
// components/UserProfile.tsx
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export function UserProfile() {
  const newDesignEnabled = useFeatureFlag('user-profile-redesign');
  
  if (newDesignEnabled) {
    return (
      <ErrorBoundary fallback={<LegacyUserProfile />}>
        <NewUserProfile />
      </ErrorBoundary>
    );
  }
  
  return <LegacyUserProfile />;
}
```

### 2. A/B 테스트 구현
```tsx
// components/PricingPage.tsx  
export function PricingPage() {
  const pricingVariant = useFeatureVariant('pricing-test');
  
  switch (pricingVariant) {
    case 'high_price':
      return <PricingTable prices={HIGH_PRICES} />;
    case 'low_price':
      return <PricingTable prices={LOW_PRICES} />;
    case 'freemium':
      return <FreemiumPricing />;
    default:
      return <StandardPricing />;
  }
}
```

### 3. 점진적 롤아웃
```typescript
// config/feature-flags.ts
export const FEATURE_FLAGS: FeatureFlag[] = [
  {
    key: 'new-search-algorithm',
    enabled: true,
    rolloutPercentage: 10, // 10%부터 시작
    conditions: [
      {
        type: 'user_segment',
        operator: 'in',
        value: ['beta_users', 'premium_users']
      }
    ],
    metadata: {
      description: 'New AI-powered search algorithm',
      owner: 'search-team',
      createdAt: new Date('2024-01-15'),
      expiresAt: new Date('2024-03-15') // 2개월 후 자동 제거
    }
  }
];
```

## 🔧 Feature Flag 관리 도구

### CLI 도구
```bash
#!/bin/bash
# scripts/feature-flag.sh

case "$1" in
  "enable")
    echo "Enabling feature flag: $2"
    node scripts/update-flag.js --flag=$2 --enabled=true
    ;;
  "disable")
    echo "Disabling feature flag: $2"
    node scripts/update-flag.js --flag=$2 --enabled=false
    ;;
  "rollout")
    echo "Setting rollout percentage for $2 to $3%"
    node scripts/update-flag.js --flag=$2 --percentage=$3
    ;;
  "status")
    echo "Feature flag status:"
    node scripts/list-flags.js
    ;;
  *)
    echo "Usage: ./feature-flag.sh {enable|disable|rollout|status} [flag-name] [percentage]"
    ;;
esac
```

### 관리 스크립트
```javascript
// scripts/update-flag.js
const fs = require('fs');
const path = require('path');

function updateFeatureFlag(flagKey, updates) {
  const configPath = path.join(__dirname, '../config/feature-flags.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  const flagIndex = config.flags.findIndex(f => f.key === flagKey);
  
  if (flagIndex === -1) {
    // 새 플래그 생성
    config.flags.push({
      key: flagKey,
      enabled: false,
      rolloutPercentage: 0,
      conditions: [],
      metadata: {
        description: `Auto-generated flag: ${flagKey}`,
        owner: 'system',
        createdAt: new Date().toISOString()
      },
      ...updates
    });
  } else {
    // 기존 플래그 업데이트
    config.flags[flagIndex] = {
      ...config.flags[flagIndex],
      ...updates
    };
  }
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Feature flag "${flagKey}" updated successfully`);
}

// CLI 인자 파싱
const args = process.argv.slice(2);
const flagKey = args.find(arg => arg.startsWith('--flag='))?.split('=')[1];
const enabled = args.find(arg => arg.startsWith('--enabled='))?.split('=')[1];
const percentage = args.find(arg => arg.startsWith('--percentage='))?.split('=')[1];

if (!flagKey) {
  console.error('Flag key is required');
  process.exit(1);
}

const updates = {};
if (enabled !== undefined) updates.enabled = enabled === 'true';
if (percentage !== undefined) updates.rolloutPercentage = parseInt(percentage);

updateFeatureFlag(flagKey, updates);
```

## 📊 Feature Flag 모니터링

### 메트릭 수집
```typescript
// lib/feature-flag-analytics.ts
export class FeatureFlagAnalytics {
  private analytics: AnalyticsService;

  constructor(analytics: AnalyticsService) {
    this.analytics = analytics;
  }

  trackFlagExposure(flagKey: string, variant: string, userContext: UserContext) {
    this.analytics.track('feature_flag_exposure', {
      flag_key: flagKey,
      variant: variant,
      user_id: userContext.userId,
      user_segment: userContext.segments,
      timestamp: new Date().toISOString()
    });
  }

  trackFlagConversion(flagKey: string, variant: string, conversionEvent: string) {
    this.analytics.track('feature_flag_conversion', {
      flag_key: flagKey,
      variant: variant,
      conversion_event: conversionEvent,
      timestamp: new Date().toISOString()
    });
  }

  async generateReport(flagKey: string, dateRange: DateRange): Promise<FlagReport> {
    const exposures = await this.analytics.query('feature_flag_exposure', {
      flag_key: flagKey,
      date_range: dateRange
    });

    const conversions = await this.analytics.query('feature_flag_conversion', {
      flag_key: flagKey,
      date_range: dateRange
    });

    return {
      flagKey,
      totalExposures: exposures.length,
      variantBreakdown: this.calculateVariantBreakdown(exposures),
      conversionRates: this.calculateConversionRates(exposures, conversions),
      recommendations: this.generateRecommendations(exposures, conversions)
    };
  }
}
```

### 대시보드 컴포넌트
```tsx
// components/FeatureFlagDashboard.tsx
export function FeatureFlagDashboard() {
  const { flags, loading } = useFeatureFlags();
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="feature-flag-dashboard">
      <div className="flag-list">
        {flags.map(flag => (
          <FlagCard 
            key={flag.key}
            flag={flag}
            onClick={() => setSelectedFlag(flag.key)}
            className={selectedFlag === flag.key ? 'selected' : ''}
          />
        ))}
      </div>
      
      {selectedFlag && (
        <FlagDetails 
          flagKey={selectedFlag}
          onUpdate={updateFlag}
          onDelete={deleteFlag}
        />
      )}
    </div>
  );
}

function FlagCard({ flag, onClick, className }: FlagCardProps) {
  const statusColor = flag.enabled ? 'green' : 'gray';
  const rolloutColor = flag.rolloutPercentage === 100 ? 'blue' : 'orange';

  return (
    <div className={`flag-card ${className}`} onClick={onClick}>
      <div className="flag-header">
        <h3>{flag.key}</h3>
        <div className={`status-badge ${statusColor}`}>
          {flag.enabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>
      
      <div className="flag-metrics">
        <div className={`rollout-percentage ${rolloutColor}`}>
          {flag.rolloutPercentage}% rollout
        </div>
        <div className="conditions">
          {flag.conditions?.length || 0} conditions
        </div>
      </div>
      
      {flag.metadata?.expiresAt && (
        <div className="expiry-warning">
          Expires: {new Date(flag.metadata.expiresAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
```

## 🚀 실전 배포 시나리오

### 시나리오 1: 새 기능 점진적 출시 (14일 계획)
```yaml
Day_1-3: "내부 테스트"
  rollout: 0%
  conditions: [team_members]
  focus: 기능 동작 확인, 기본 버그 수정

Day_4-7: "베타 사용자"
  rollout: 5%
  conditions: [beta_users, early_adopters]
  focus: 사용성 피드백, 성능 모니터링

Day_8-10: "점진적 확장"
  rollout: 25%
  conditions: [active_users]
  focus: 서버 부하 테스트, 전환율 측정

Day_11-14: "전체 출시"
  rollout: 100%
  conditions: []
  focus: 전체 사용자 모니터링, 최종 안정화
```

### 시나리오 2: A/B 테스트 실행
```typescript
// 가설: 새로운 버튼 색상이 클릭률을 높일 것이다
const BUTTON_COLOR_TEST: FeatureFlag = {
  key: 'button-color-test',
  enabled: true,
  rolloutPercentage: 50, // 50%만 테스트 참여
  conditions: [
    {
      type: 'user_segment',
      operator: 'in',
      value: ['active_users', 'new_users']
    }
  ]
};

// 컴포넌트에서 사용
function CallToActionButton() {
  const variant = useFeatureVariant('button-color-test');
  const buttonColor = variant === 'variant_a' ? 'blue' : 'green';
  
  return (
    <button 
      className={`cta-button ${buttonColor}`}
      onClick={() => trackButtonClick(variant)}
    >
      Get Started
    </button>
  );
}
```

## 💡 베스트 프랙티스

### DO ✅
- **명확한 이름 사용**: `new-search-v2` > `search-improvement`
- **만료일 설정**: 플래그가 영구히 남지 않도록
- **조건 활용**: 특정 사용자 그룹에만 우선 적용
- **메트릭 추적**: 플래그별 성능과 전환율 모니터링
- **점진적 롤아웃**: 0% → 5% → 25% → 100%

### DON'T ❌  
- **중첩 플래그**: 플래그가 다른 플래그에 의존하지 않게
- **복잡한 로직**: 플래그 확인 로직을 단순하게 유지
- **과도한 플래그**: 너무 많은 플래그는 관리 부담 증가
- **영구 플래그**: 실험 완료 후 플래그 제거하지 않음

## 🎯 성공 지표

- **배포 위험 감소**: 롤백률 70% 감소
- **실험 속도 향상**: A/B 테스트 설정 시간 80% 단축  
- **사용자 만족도**: 점진적 출시로 품질 이슈 90% 감소
- **개발 생산성**: 기능 개발과 배포 분리로 25% 향상

---

*"Feature Flag는 단순한 if문이 아니라, 위험을 통제하고 학습을 가속화하는 전략적 도구다"*
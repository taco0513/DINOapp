# 점진적 마이그레이션 패턴

## 🔄 마이그레이션의 현실

> "Big Bang 마이그레이션은 Big Bang 장애로 이어진다"

CupNote 프로젝트에서 LocalStorage에서 Supabase로 마이그레이션할 때 겪은 실제 경험을 바탕으로 안전한 점진적 마이그레이션 패턴을 정리했습니다.

## 🎯 점진적 마이그레이션 원칙

### 핵심 원칙
1. **무중단 서비스**: 사용자가 마이그레이션을 인지하지 못하게
2. **데이터 안전성**: 어떤 상황에서도 데이터 손실 없음
3. **단계적 진행**: 한 번에 하나씩, 검증 후 다음 단계
4. **롤백 가능성**: 각 단계에서 이전 상태로 복구 가능
5. **성능 유지**: 마이그레이션이 성능에 미치는 영향 최소화

## 🏗️ 듀얼 시스템 아키텍처

### Strangler Fig 패턴
```typescript
// 기존 시스템과 새 시스템을 동시에 운영하는 패턴
interface DataManager {
  save(data: any): Promise<void>;
  load(id: string): Promise<any>;
  delete(id: string): Promise<void>;
}

class DualDataManager implements DataManager {
  constructor(
    private legacySystem: LegacyDataManager,
    private newSystem: NewDataManager,
    private migrationState: MigrationState
  ) {}

  async save(data: any): Promise<void> {
    // 1단계: 기존 시스템에 항상 저장 (안전망)
    await this.legacySystem.save(data);
    
    // 2단계: 새 시스템에도 저장 시도 (실패해도 OK)
    if (this.migrationState.shouldWriteToNew(data)) {
      try {
        await this.newSystem.save(data);
        this.migrationState.markSuccessfulWrite(data.id);
      } catch (error) {
        // 실패해도 기존 시스템은 작동하므로 데이터 손실 없음
        this.migrationState.markFailedWrite(data.id, error);
      }
    }
  }

  async load(id: string): Promise<any> {
    // 새 시스템에 데이터가 있으면 우선 사용
    if (this.migrationState.isMigrated(id)) {
      try {
        return await this.newSystem.load(id);
      } catch (error) {
        // 새 시스템 실패 시 기존 시스템으로 폴백
        console.warn(`New system failed for ${id}, falling back to legacy`);
      }
    }
    
    // 기존 시스템에서 로드
    return await this.legacySystem.load(id);
  }
}
```

### 마이그레이션 상태 관리
```typescript
// CupNote에서 실제 사용한 마이그레이션 상태 추적
class MigrationState {
  private migratedItems = new Set<string>();
  private failedItems = new Map<string, FailureInfo>();
  private migrationProgress = {
    total: 0,
    migrated: 0,
    failed: 0,
    inProgress: false
  };

  shouldWriteToNew(data: any): boolean {
    // 마이그레이션 정책 결정
    return this.migrationProgress.inProgress || 
           data.isNew || 
           this.isRetryCandidate(data.id);
  }

  isMigrated(id: string): boolean {
    return this.migratedItems.has(id);
  }

  markSuccessfulWrite(id: string): void {
    this.migratedItems.add(id);
    this.failedItems.delete(id);
    this.updateProgress();
  }

  markFailedWrite(id: string, error: Error): void {
    this.failedItems.set(id, {
      error: error.message,
      attempts: (this.failedItems.get(id)?.attempts || 0) + 1,
      lastAttempt: new Date()
    });
  }

  private isRetryCandidate(id: string): boolean {
    const failure = this.failedItems.get(id);
    if (!failure) return false;
    
    // 실패한 지 1시간 이상 지났고, 재시도 횟수가 3회 미만이면 재시도
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return failure.attempts < 3 && failure.lastAttempt.getTime() < oneHourAgo;
  }
}
```

## 🔄 단계별 마이그레이션 전략

### Phase 1: 읽기 경로 검증 (2-3일)
```typescript
// 새 시스템의 읽기 성능과 정확성 검증
class ReadVerificationManager {
  async verifyReadPath(ids: string[]): Promise<VerificationResult> {
    const results = {
      total: ids.length,
      matches: 0,
      mismatches: 0,
      errors: 0,
      performanceComparison: {}
    };

    for (const id of ids) {
      try {
        // 병렬로 두 시스템에서 데이터 읽기
        const [legacyData, newData] = await Promise.all([
          this.legacySystem.load(id),
          this.newSystem.load(id)
        ]);

        // 데이터 일치성 검증
        if (this.deepEqual(legacyData, newData)) {
          results.matches++;
        } else {
          results.mismatches++;
          this.logMismatch(id, legacyData, newData);
        }
      } catch (error) {
        results.errors++;
        this.logError(id, error);
      }
    }

    return results;
  }

  private deepEqual(obj1: any, obj2: any): boolean {
    // 중요한 필드만 비교 (타임스탬프 등은 제외)
    const normalize = (obj: any) => {
      const { createdAt, updatedAt, ...rest } = obj;
      return rest;
    };
    
    return JSON.stringify(normalize(obj1)) === JSON.stringify(normalize(obj2));
  }
}
```

### Phase 2: 쓰기 경로 점진적 활성화 (1주)
```typescript
// 사용자 그룹별 점진적 쓰기 활성화
class GradualWriteRollout {
  private rolloutPercentage = 0;
  private whitelistedUsers = new Set<string>();

  shouldWriteToNewSystem(userId: string, itemType: string): boolean {
    // 1. 화이트리스트 사용자는 항상 새 시스템 사용
    if (this.whitelistedUsers.has(userId)) {
      return true;
    }

    // 2. 특정 타입의 데이터부터 시작 (위험도 낮은 것부터)
    const safeTypes = ['settings', 'preferences'];
    if (safeTypes.includes(itemType) && this.rolloutPercentage >= 25) {
      return true;
    }

    // 3. 전체 롤아웃 비율 적용
    const userHash = this.getUserHash(userId);
    return userHash < this.rolloutPercentage / 100;
  }

  // CupNote에서 사용한 실제 롤아웃 스케줄
  async executeRolloutSchedule(): Promise<void> {
    const schedule = [
      { day: 1, percentage: 5, userGroup: 'team_members' },
      { day: 3, percentage: 10, userGroup: 'beta_users' },
      { day: 5, percentage: 25, userGroup: 'active_users' },
      { day: 7, percentage: 50, userGroup: 'all_users' },
      { day: 10, percentage: 100, userGroup: 'all_users' }
    ];

    for (const step of schedule) {
      console.log(`Day ${step.day}: Rolling out to ${step.percentage}% of ${step.userGroup}`);
      
      this.rolloutPercentage = step.percentage;
      this.updateUserWhitelist(step.userGroup);
      
      // 각 단계에서 결과 모니터링
      await this.monitorStepResults(step);
      
      // 문제 발생 시 롤아웃 중단
      if (await this.detectIssues()) {
        console.warn(`Issues detected at ${step.percentage}%, halting rollout`);
        await this.rollback();
        break;
      }
    }
  }
}
```

### Phase 3: 백그라운드 마이그레이션 (2-3주)
```typescript
// 기존 데이터를 새 시스템으로 점진적 이동
class BackgroundMigration {
  private readonly BATCH_SIZE = 50;
  private readonly CONCURRENT_BATCHES = 3;

  async migrateExistingData(): Promise<MigrationResult> {
    const totalItems = await this.legacySystem.count();
    const batches = Math.ceil(totalItems / this.BATCH_SIZE);
    
    console.log(`Starting migration of ${totalItems} items in ${batches} batches`);

    const results = {
      total: totalItems,
      migrated: 0,
      failed: 0,
      skipped: 0
    };

    // 배치별 병렬 처리
    for (let i = 0; i < batches; i += this.CONCURRENT_BATCHES) {
      const batchPromises = [];
      
      for (let j = 0; j < this.CONCURRENT_BATCHES && (i + j) < batches; j++) {
        const batchIndex = i + j;
        batchPromises.push(this.migrateBatch(batchIndex));
      }
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(result => {
        results.migrated += result.migrated;
        results.failed += result.failed;
        results.skipped += result.skipped;
      });

      // 진행률 업데이트
      const progress = Math.round((results.migrated + results.failed + results.skipped) / totalItems * 100);
      console.log(`Migration progress: ${progress}%`);

      // 시스템 부하 방지를 위한 휴식
      await this.waitForIdleTime();
    }

    return results;
  }

  private async migrateBatch(batchIndex: number): Promise<BatchResult> {
    const offset = batchIndex * this.BATCH_SIZE;
    const items = await this.legacySystem.getBatch(offset, this.BATCH_SIZE);
    
    const result = { migrated: 0, failed: 0, skipped: 0 };

    for (const item of items) {
      try {
        // 이미 마이그레이션된 항목은 건너뛰기
        if (await this.newSystem.exists(item.id)) {
          result.skipped++;
          continue;
        }

        // 데이터 변환 및 검증
        const transformedItem = await this.transformData(item);
        await this.validateData(transformedItem);

        // 새 시스템에 저장
        await this.newSystem.save(transformedItem);
        
        // 마이그레이션 상태 업데이트
        this.migrationState.markSuccessfulWrite(item.id);
        result.migrated++;
        
      } catch (error) {
        console.error(`Failed to migrate item ${item.id}:`, error);
        this.migrationState.markFailedWrite(item.id, error);
        result.failed++;
      }
    }

    return result;
  }

  private async transformData(legacyItem: any): Promise<any> {
    // CupNote 실제 데이터 변환 예시
    return {
      // ID 형식 변환
      id: legacyItem.id.toString(),
      
      // 날짜 형식 변환
      created_at: new Date(legacyItem.createdAt).toISOString(),
      updated_at: new Date(legacyItem.updatedAt || legacyItem.createdAt).toISOString(),
      
      // 중첩 객체 평면화
      title: legacyItem.coffee?.name || legacyItem.title,
      roaster: legacyItem.coffee?.roaster?.name || null,
      
      // 배열 데이터 JSON 변환
      tasting_notes: JSON.stringify(legacyItem.coffee?.tastingNotes || []),
      
      // 새로운 필드 기본값
      user_id: legacyItem.userId || 'legacy-user',
      version: 1
    };
  }

  private async waitForIdleTime(): Promise<void> {
    // 시스템 부하가 낮을 때까지 대기
    return new Promise(resolve => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => resolve());
      } else {
        setTimeout(resolve, 100);
      }
    });
  }
}
```

### Phase 4: 검증 및 정리 (1주)
```typescript
// 마이그레이션 완료 후 데이터 정합성 검증
class MigrationValidator {
  async validateMigrationComplete(): Promise<ValidationReport> {
    const report = {
      totalItems: 0,
      migratedItems: 0,
      failedItems: 0,
      dataConsistency: 0,
      performanceComparison: {},
      recommendations: []
    };

    // 1. 전체 항목 수 비교
    const legacyCount = await this.legacySystem.count();
    const newCount = await this.newSystem.count();
    
    report.totalItems = legacyCount;
    report.migratedItems = newCount;
    report.failedItems = legacyCount - newCount;

    // 2. 랜덤 샘플링으로 데이터 일치성 검증
    const sampleSize = Math.min(100, Math.ceil(legacyCount * 0.1));
    const sampleIds = await this.getRandomSample(sampleSize);
    
    let consistentItems = 0;
    for (const id of sampleIds) {
      if (await this.verifyDataConsistency(id)) {
        consistentItems++;
      }
    }
    
    report.dataConsistency = consistentItems / sampleSize;

    // 3. 성능 비교
    report.performanceComparison = await this.comparePerformance();

    // 4. 권장사항 생성
    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  private generateRecommendations(report: ValidationReport): string[] {
    const recommendations = [];

    if (report.dataConsistency < 0.99) {
      recommendations.push('Data consistency below 99% - investigate failed migrations');
    }

    if (report.failedItems > 0) {
      recommendations.push(`${report.failedItems} items failed to migrate - retry or manual intervention needed`);
    }

    if (report.performanceComparison.readLatency > 1.5) {
      recommendations.push('New system read latency 50% higher - optimize queries or add caching');
    }

    if (report.migratedItems / report.totalItems > 0.95) {
      recommendations.push('Migration >95% complete - consider legacy system deprecation timeline');
    }

    return recommendations;
  }
}
```

## 🎯 CupNote 실제 마이그레이션 사례

### 타임라인 및 결과
```yaml
PreMigration:
  duration: "3 months planning"
  data_volume: "15,000 coffee records"
  user_base: "500 active users"
  downtime_budget: "0 minutes"

Week_1: "Read Path Verification"
  - Legacy vs New system comparison
  - 99.8% data consistency achieved
  - Performance baseline established

Week_2: "Write Path Rollout"
  - Day 1-2: Team members (5 users)
  - Day 3-4: Beta users (25 users)  
  - Day 5-7: 10% of active users (50 users)
  - Result: 0 data loss, minor performance issues

Week_3-4: "Gradual Write Expansion"
  - 25% rollout, then 50%, then 100%
  - Background migration started
  - Real-time monitoring implemented

Week_5-6: "Background Migration" 
  - 15,000 records migrated in batches
  - 99.2% success rate on first attempt
  - Failed items retried successfully

Week_7: "Validation & Cleanup"
  - Final data consistency check: 99.97%
  - Performance optimization completed
  - Legacy system switched to read-only

Results:
  total_duration: "7 weeks"
  data_loss: "0 records"
  downtime: "0 minutes"
  user_complaints: "2 minor performance issues"
  team_satisfaction: "9/10"
```

## 💡 핵심 교훈

### 성공 요인
1. **충분한 준비**: 3개월 계획 수립이 7주 실행을 가능하게 함
2. **듀얼 시스템**: 기존 시스템 유지로 위험 제거
3. **점진적 확장**: 작은 단위로 시작하여 점차 확대
4. **지속적 모니터링**: 각 단계에서 문제 조기 발견
5. **롤백 준비**: 언제든 이전 단계로 복구 가능

### 실패 패턴
- ❌ **Big Bang 접근**: 한 번에 모든 것을 바꾸려 함
- ❌ **백업 부족**: 롤백 계획 없이 진행
- ❌ **성능 간과**: 새 시스템의 성능 최적화 부족
- ❌ **사용자 무시**: 사용자 영향도 고려하지 않음
- ❌ **모니터링 부족**: 문제 발생을 늦게 발견

### 권장 타임라인
```
Small Project (< 1000 records): 2-3 weeks
Medium Project (< 10,000 records): 4-6 weeks  
Large Project (< 100,000 records): 8-12 weeks
Enterprise Project (> 100,000 records): 12-24 weeks
```

---

*"마이그레이션은 마라톤이다. 빠르게 달리기보다는 꾸준히 완주하는 것이 중요하다."*
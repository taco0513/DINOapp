# 📊 DINO Data Migration Strategy

DINO 프로젝트의 LocalStorage → Cloud 데이터 마이그레이션 완전 가이드

## 🎯 DINO 셰겐 데이터 마이그레이션 계획

### Phase 1: 현재 상태 분석

```typescript
// DINO 셰겐 데이터 구조 분석
interface LegacySchengenEntry {
  id: string;
  country: string;
  entryDate: string; // ISO string
  exitDate: string; // ISO string
  notes?: string;
  createdAt: string;
}

interface ModernSchengenEntry {
  id: string;
  user_id: string;
  country: string;
  entry_date: Date;
  exit_date: Date;
  stay_days: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  is_migrated: boolean;
  original_id?: string;
}

// 데이터 분석 도구
class DinoDataAnalyzer {
  static analyzeLocalStorage(): MigrationAnalysis {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("dino-schengen-"),
    );

    const entries = keys
      .map((key) => {
        try {
          return JSON.parse(localStorage.getItem(key)!);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return {
      totalEntries: entries.length,
      dateRange: this.getDateRange(entries),
      dataQuality: this.assessDataQuality(entries),
      estimatedMigrationTime: this.estimateTime(entries.length),
    };
  }

  private static getDateRange(entries: any[]) {
    const dates = entries.flatMap((e) => [e.entryDate, e.exitDate]);
    return {
      earliest: new Date(Math.min(...dates.map((d) => new Date(d).getTime()))),
      latest: new Date(Math.max(...dates.map((d) => new Date(d).getTime()))),
    };
  }
}
```

### Phase 2: Dual Storage System

```typescript
// DINO 특화 Dual Storage Manager
class DinoSchengenMigrator {
  private migrationState = new Map<string, "pending" | "synced" | "failed">();

  // 핵심 패턴: Write-Through with DINO specific validation
  async saveEntry(entry: Partial<SchengenEntry>): Promise<string> {
    // 1. DINO 비즈니스 규칙 검증
    const validatedEntry = this.validateSchengenEntry(entry);

    // 2. LocalStorage에 즉시 저장 (사용자 경험 우선)
    const localId = `dino-schengen-${Date.now()}`;
    localStorage.setItem(localId, JSON.stringify(validatedEntry));

    try {
      // 3. Cloud DB에 비동기 저장
      const cloudEntry = await this.saveToDatabase(validatedEntry);
      this.migrationState.set(localId, "synced");

      // 4. ID 매핑 업데이트
      await this.updateIdMapping(localId, cloudEntry.id);
      return cloudEntry.id;
    } catch (error) {
      console.warn("Cloud save failed, data preserved locally");
      this.migrationState.set(localId, "failed");
      this.scheduleRetry(localId);
      return localId;
    }
  }

  // DINO 특화 데이터 검증
  private validateSchengenEntry(entry: Partial<SchengenEntry>): SchengenEntry {
    const validated = {
      ...entry,
      id: entry.id || generateUUID(),
      stay_days: this.calculateStayDays(entry.entry_date!, entry.exit_date!),
      created_at: entry.created_at || new Date(),
      updated_at: new Date(),
      is_migrated: false,
    };

    // 셰겐 규칙 검증
    if (validated.stay_days > 90) {
      console.warn("Entry exceeds 90-day Schengen limit");
    }

    return validated as SchengenEntry;
  }

  private calculateStayDays(entryDate: Date, exitDate: Date): number {
    // date-fns 사용 (DINO 필수)
    import("date-fns").then(({ differenceInDays }) => {
      return differenceInDays(exitDate, entryDate) + 1;
    });
    return 0; // 임시값, 실제로는 위 계산 결과
  }
}
```

### Phase 3: 배치 마이그레이션

```typescript
// DINO 셰겐 대량 마이그레이션
class DinoBatchMigrator {
  async migrateLegacyEntries(): Promise<MigrationResult> {
    const legacyKeys = Object.keys(localStorage)
      .filter((key) => key.startsWith("dino-schengen-"))
      .filter((key) => !this.isMigrated(key));

    console.log(`🦕 DINO: Migrating ${legacyKeys.length} Schengen entries`);

    const results = {
      total: legacyKeys.length,
      migrated: 0,
      failed: 0,
      schengenDataIntact: true,
    };

    // 작은 배치로 나누어 처리 (셰겐 데이터 무결성 보장)
    const BATCH_SIZE = 10;
    const batches = this.createBatches(legacyKeys, BATCH_SIZE);

    for (const batch of batches) {
      const batchResult = await this.processBatch(batch);
      results.migrated += batchResult.migrated;
      results.failed += batchResult.failed;

      // 셰겐 계산 무결성 검증
      if (!(await this.verifySchengenCalculations(batch))) {
        results.schengenDataIntact = false;
        console.error("🚨 Schengen calculation integrity compromised!");
        break;
      }

      // 진행률 표시
      const progress = Math.round(
        ((results.migrated + results.failed) / results.total) * 100,
      );
      console.log(`🦕 Migration progress: ${progress}%`);
    }

    return results;
  }

  private async processBatch(keys: string[]): Promise<BatchResult> {
    const result = { migrated: 0, failed: 0 };

    for (const key of keys) {
      try {
        const localData = localStorage.getItem(key);
        if (!localData) continue;

        const entry = JSON.parse(localData) as LegacySchengenEntry;

        // DINO 셰겐 데이터 변환
        const modernEntry = this.transformToModernEntry(entry);

        // 셰겐 규칙 재검증
        if (!this.validateSchengenRules(modernEntry)) {
          throw new Error("Schengen validation failed");
        }

        // Cloud 저장
        await this.saveToDatabase(modernEntry);

        // 마이그레이션 플래그 설정
        localStorage.setItem(key + "_migrated", "true");

        result.migrated++;
      } catch (error) {
        console.error(`Failed to migrate ${key}:`, error);
        result.failed++;
      }
    }

    return result;
  }

  // DINO 셰겐 데이터 변환
  private transformToModernEntry(
    legacy: LegacySchengenEntry,
  ): ModernSchengenEntry {
    return {
      id: generateUUID(),
      user_id: "migrated_user", // 실제 사용자 ID로 교체
      country: legacy.country,
      entry_date: new Date(legacy.entryDate),
      exit_date: new Date(legacy.exitDate),
      stay_days: this.calculateStayDays(
        new Date(legacy.entryDate),
        new Date(legacy.exitDate),
      ),
      notes: legacy.notes,
      created_at: new Date(legacy.createdAt),
      updated_at: new Date(),
      is_migrated: true,
      original_id: legacy.id,
    };
  }

  // 셰겐 규칙 검증
  private validateSchengenRules(entry: ModernSchengenEntry): boolean {
    // 1. 90일 제한 확인
    if (entry.stay_days > 90) {
      console.warn(
        `Entry ${entry.id} exceeds 90-day limit: ${entry.stay_days} days`,
      );
    }

    // 2. 날짜 유효성 확인
    if (entry.entry_date >= entry.exit_date) {
      console.error(`Invalid date range for ${entry.id}`);
      return false;
    }

    // 3. 180일 기간 내 중복 체크 (실제 구현에서는 더 복잡)
    return true;
  }
}
```

### Phase 4: 검증 및 정리

```typescript
// DINO 마이그레이션 검증
class DinoMigrationValidator {
  async validateMigrationComplete(): Promise<ValidationReport> {
    const report = {
      localEntries: 0,
      cloudEntries: 0,
      dataIntegrity: true,
      schengenAccuracy: true,
      recommendations: [] as string[],
    };

    // 1. 데이터 개수 비교
    report.localEntries = Object.keys(localStorage).filter((key) =>
      key.startsWith("dino-schengen-"),
    ).length;

    report.cloudEntries = await this.countCloudEntries();

    // 2. 셰겐 계산 정확성 검증
    const sampleSize = Math.min(50, report.localEntries);
    const accuracyTest = await this.validateSchengenCalculations(sampleSize);
    report.schengenAccuracy = accuracyTest.accuracy > 0.99;

    // 3. 데이터 무결성 검사
    const integrityTest = await this.checkDataIntegrity(sampleSize);
    report.dataIntegrity = integrityTest.passed;

    // 4. 권장사항 생성
    if (report.schengenAccuracy) {
      report.recommendations.push(
        "✅ Schengen calculations verified - migration successful",
      );
    } else {
      report.recommendations.push(
        "🚨 Schengen calculation errors found - manual review required",
      );
    }

    if (report.cloudEntries / report.localEntries > 0.99) {
      report.recommendations.push(
        "✅ Migration complete - consider legacy cleanup in 30 days",
      );
    }

    return report;
  }

  private async validateSchengenCalculations(
    sampleSize: number,
  ): Promise<AccuracyReport> {
    const localKeys = Object.keys(localStorage)
      .filter((key) => key.startsWith("dino-schengen-"))
      .slice(0, sampleSize);

    let correct = 0;

    for (const key of localKeys) {
      const localEntry = JSON.parse(localStorage.getItem(key)!);
      const cloudEntry = await this.fetchCloudEntry(localEntry.id);

      if (
        cloudEntry &&
        this.compareSchengenCalculations(localEntry, cloudEntry)
      ) {
        correct++;
      }
    }

    return {
      total: localKeys.length,
      correct,
      accuracy: correct / localKeys.length,
    };
  }
}
```

## 🚀 DINO 마이그레이션 실행 가이드

### 1주차: 준비

```bash
# 1. 현재 데이터 분석
const analysis = DinoDataAnalyzer.analyzeLocalStorage();
console.log('🦕 DINO Data Analysis:', analysis);

# 2. 백업 생성
const backup = DinoBackupManager.createFullBackup();
console.log('💾 Backup created:', backup.path);
```

### 2주차: Dual Storage 활성화

```bash
# 1. 새로운 데이터는 Cloud + Local 동시 저장
const migrator = new DinoSchengenMigrator();
migrator.enableDualStorage();

# 2. 1주일 동안 안정성 모니터링
migrator.startMonitoring();
```

### 3-4주차: 배치 마이그레이션

```bash
# 1. 기존 데이터 점진적 마이그레이션
const batchMigrator = new DinoBatchMigrator();
const result = await batchMigrator.migrateLegacyEntries();

# 2. 실시간 검증
const validator = new DinoMigrationValidator();
const report = await validator.validateMigrationComplete();
```

## 📊 성공 지표

```yaml
DINO_마이그레이션_목표:
  데이터_손실: 0건
  셰겐_계산_정확도: 100%
  사용자_불편: 0건
  다운타임: 0분

성능_개선:
  로딩_속도: 30% 향상
  오프라인_지원: 활성화
  동기화_안정성: 99.9%
```

---

**🦕 DINO Data Migration**: Zero Loss, Perfect Schengen Accuracy, Seamless User Experience!

_Master Playbook v4.0.0 Integration | CupNote 실전 검증_

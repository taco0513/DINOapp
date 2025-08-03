# 데이터 마이그레이션 완전 가이드 (LocalStorage → Cloud DB)

## 🎯 개요: "단순해 보이는" 마이그레이션의 실체

CupNote 프로젝트에서 LocalStorage에서 Supabase로 전환하는 "간단한" 작업이 2주간의 고난으로 변한 실제 경험을 공유합니다.

## 🚨 실전에서 마주친 7가지 함정

### 1. ID 시스템 충돌
```typescript
// ❌ 문제: LocalStorage는 timestamp, Supabase는 UUID
// LocalStorage 데이터
{
  id: "1698765432100", // Date.now()
  title: "Ethiopia Yirgacheffe",
  createdAt: 1698765432100
}

// Supabase 스키마
{
  id: "550e8400-e29b-41d4-a716-446655440000", // UUID
  title: "Ethiopia Yirgacheffe",
  created_at: "2023-10-31T10:30:32.100Z" // ISO string
}

// ✅ 해결: 마이그레이션 매핑 테이블
interface MigrationMap {
  oldId: string;
  newId: string;
  migratedAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

// migration-map.json 생성
const migrationMap = new Map<string, MigrationMap>();

async function migrateRecord(oldRecord: LocalRecord): Promise<void> {
  try {
    // 새 ID로 레코드 생성
    const { data, error } = await supabase
      .from('coffee_records')
      .insert({
        title: oldRecord.title,
        // ID는 Supabase가 자동 생성
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // 매핑 저장
    migrationMap.set(oldRecord.id, {
      oldId: oldRecord.id,
      newId: data.id,
      migratedAt: new Date(),
      status: 'completed'
    });
    
    // 관련 데이터도 함께 업데이트
    await updateRelatedData(oldRecord.id, data.id);
  } catch (error) {
    migrationMap.set(oldRecord.id, {
      oldId: oldRecord.id,
      newId: '',
      migratedAt: new Date(),
      status: 'failed'
    });
  }
}
```

### 2. 데이터 구조 불일치
```typescript
// ❌ 문제: 중첩된 객체 vs 정규화된 테이블
// LocalStorage (중첩 구조)
{
  id: "123",
  coffee: {
    name: "Kenya AA",
    roaster: {
      name: "Blue Bottle",
      location: "Oakland, CA"
    },
    tastingNotes: ["blackcurrant", "wine", "syrupy"]
  }
}

// ✅ 해결: 정규화 및 관계 설정
// 1. 스키마 설계
// coffees 테이블
{
  id: "uuid",
  name: "Kenya AA",
  roaster_id: "uuid"
}

// roasters 테이블
{
  id: "uuid",
  name: "Blue Bottle",
  location: "Oakland, CA"
}

// tasting_notes 테이블
{
  id: "uuid",
  coffee_id: "uuid",
  note: "blackcurrant"
}

// 2. 변환 함수
async function normalizeAndMigrate(localData: LocalCoffee) {
  // 트랜잭션으로 묶어서 처리
  const { data: roaster } = await supabase
    .from('roasters')
    .upsert({
      name: localData.coffee.roaster.name,
      location: localData.coffee.roaster.location
    })
    .select()
    .single();
  
  const { data: coffee } = await supabase
    .from('coffees')
    .insert({
      name: localData.coffee.name,
      roaster_id: roaster.id
    })
    .select()
    .single();
  
  // 배치 삽입으로 성능 최적화
  const tastingNotes = localData.coffee.tastingNotes.map(note => ({
    coffee_id: coffee.id,
    note
  }));
  
  await supabase
    .from('tasting_notes')
    .insert(tastingNotes);
}
```

### 3. 오프라인 데이터 동기화
```typescript
// ❌ 문제: 마이그레이션 중 생성된 오프라인 데이터 손실
// ✅ 해결: 이중 저장 + 동기화 큐

class DualStorageManager {
  private syncQueue: SyncOperation[] = [];
  private isSyncing = false;
  
  async save(record: CoffeeRecord) {
    // 1. 항상 LocalStorage에 먼저 저장 (즉시 사용 가능)
    const tempId = `temp_${Date.now()}`;
    localStorage.setItem(tempId, JSON.stringify(record));
    
    // 2. 동기화 큐에 추가
    this.syncQueue.push({
      tempId,
      operation: 'create',
      data: record,
      timestamp: Date.now(),
      retryCount: 0
    });
    
    // 3. 백그라운드 동기화 시도
    this.processSyncQueue();
    
    return tempId;
  }
  
  async processSyncQueue() {
    if (this.isSyncing || !navigator.onLine) return;
    
    this.isSyncing = true;
    const queue = [...this.syncQueue];
    
    for (const operation of queue) {
      try {
        const { data, error } = await supabase
          .from('coffee_records')
          .insert(operation.data)
          .select()
          .single();
        
        if (!error) {
          // 성공: LocalStorage 업데이트 및 큐에서 제거
          localStorage.removeItem(operation.tempId);
          localStorage.setItem(data.id, JSON.stringify(data));
          
          this.syncQueue = this.syncQueue.filter(
            op => op.tempId !== operation.tempId
          );
          
          // ID 매핑 업데이트
          this.updateIdMapping(operation.tempId, data.id);
        }
      } catch (error) {
        operation.retryCount++;
        if (operation.retryCount > 3) {
          // 실패 처리
          this.handleSyncFailure(operation);
        }
      }
    }
    
    this.isSyncing = false;
  }
}
```

### 4. 대용량 데이터 처리
```typescript
// ❌ 문제: 수천 개 레코드 일괄 처리 시 타임아웃
// ✅ 해결: 청크 단위 처리 + 진행률 표시

async function migrateLargeDataset(
  records: LocalRecord[],
  onProgress?: (progress: number) => void
) {
  const CHUNK_SIZE = 50; // Supabase 권장 배치 크기
  const chunks = [];
  
  // 데이터 청크로 분할
  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    chunks.push(records.slice(i, i + CHUNK_SIZE));
  }
  
  let completed = 0;
  const results = {
    success: 0,
    failed: 0,
    errors: [] as any[]
  };
  
  for (const [index, chunk] of chunks.entries()) {
    try {
      // 각 청크를 변환
      const transformed = await Promise.all(
        chunk.map(record => transformRecord(record))
      );
      
      // 배치 삽입
      const { data, error } = await supabase
        .from('coffee_records')
        .insert(transformed);
      
      if (error) throw error;
      
      results.success += chunk.length;
    } catch (error) {
      results.failed += chunk.length;
      results.errors.push({
        chunk: index,
        error: error.message,
        records: chunk.map(r => r.id)
      });
      
      // 실패한 청크는 개별 처리
      for (const record of chunk) {
        await migrateSingleRecord(record);
      }
    }
    
    completed += chunk.length;
    onProgress?.(completed / records.length);
    
    // Rate limiting 방지
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}
```

### 5. 데이터 검증 및 정합성
```typescript
// ✅ 해결: 3단계 검증 시스템

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

class MigrationValidator {
  // 1단계: 마이그레이션 전 검증
  async validateBeforeMigration(records: LocalRecord[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    
    // 중복 ID 체크
    const ids = new Set<string>();
    records.forEach(record => {
      if (ids.has(record.id)) {
        errors.push({
          type: 'duplicate_id',
          recordId: record.id,
          message: `Duplicate ID found: ${record.id}`
        });
      }
      ids.add(record.id);
    });
    
    // 필수 필드 체크
    records.forEach(record => {
      if (!record.title || !record.createdAt) {
        errors.push({
          type: 'missing_required_field',
          recordId: record.id,
          message: 'Missing required fields'
        });
      }
    });
    
    // 데이터 타입 체크
    records.forEach(record => {
      if (typeof record.createdAt !== 'number') {
        warnings.push(`Invalid timestamp format for record ${record.id}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  // 2단계: 마이그레이션 중 검증
  async validateDuringMigration(
    localRecord: LocalRecord,
    supabaseRecord: SupabaseRecord
  ): Promise<boolean> {
    // 핵심 데이터 일치 확인
    return (
      localRecord.title === supabaseRecord.title &&
      localRecord.brewMethod === supabaseRecord.brew_method &&
      // 날짜는 변환 후 비교
      new Date(localRecord.createdAt).toISOString() === supabaseRecord.created_at
    );
  }
  
  // 3단계: 마이그레이션 후 검증
  async validateAfterMigration(): Promise<ValidationResult> {
    const localCount = Object.keys(localStorage).filter(
      key => key.startsWith('coffee_')
    ).length;
    
    const { count: supabaseCount } = await supabase
      .from('coffee_records')
      .select('*', { count: 'exact', head: true });
    
    const errors: ValidationError[] = [];
    
    if (localCount !== supabaseCount) {
      errors.push({
        type: 'count_mismatch',
        message: `Local: ${localCount}, Supabase: ${supabaseCount}`
      });
    }
    
    // 샘플링 검증 (전체의 10%)
    const sampleSize = Math.ceil(localCount * 0.1);
    const randomKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('coffee_'))
      .sort(() => Math.random() - 0.5)
      .slice(0, sampleSize);
    
    for (const key of randomKeys) {
      const localData = JSON.parse(localStorage.getItem(key)!);
      const migrationMapping = await getMigrationMapping(localData.id);
      
      if (!migrationMapping) {
        errors.push({
          type: 'missing_mapping',
          recordId: localData.id
        });
        continue;
      }
      
      const { data: supabaseData } = await supabase
        .from('coffee_records')
        .select('*')
        .eq('id', migrationMapping.newId)
        .single();
      
      if (!supabaseData) {
        errors.push({
          type: 'missing_in_supabase',
          recordId: localData.id
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}
```

### 6. 롤백 전략
```typescript
// ✅ 해결: 체크포인트 기반 롤백 시스템

class MigrationCheckpoint {
  private checkpoints: Map<string, CheckpointData> = new Map();
  
  async createCheckpoint(name: string) {
    const checkpoint: CheckpointData = {
      name,
      timestamp: Date.now(),
      localStorageSnapshot: this.createLocalStorageSnapshot(),
      supabaseRecordIds: await this.getSupabaseRecordIds(),
      migrationMapSnapshot: this.createMigrationMapSnapshot()
    };
    
    this.checkpoints.set(name, checkpoint);
    
    // 백업 파일로도 저장
    const blob = new Blob([JSON.stringify(checkpoint)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkpoint_${name}_${Date.now()}.json`;
    a.click();
  }
  
  async rollbackToCheckpoint(name: string) {
    const checkpoint = this.checkpoints.get(name);
    if (!checkpoint) throw new Error('Checkpoint not found');
    
    // 1. Supabase 데이터 정리
    const currentIds = await this.getSupabaseRecordIds();
    const idsToDelete = currentIds.filter(
      id => !checkpoint.supabaseRecordIds.includes(id)
    );
    
    if (idsToDelete.length > 0) {
      await supabase
        .from('coffee_records')
        .delete()
        .in('id', idsToDelete);
    }
    
    // 2. LocalStorage 복원
    localStorage.clear();
    Object.entries(checkpoint.localStorageSnapshot).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    // 3. Migration Map 복원
    this.restoreMigrationMap(checkpoint.migrationMapSnapshot);
    
    console.log(`✅ Rolled back to checkpoint: ${name}`);
  }
}
```

### 7. 사용자 경험 유지
```typescript
// ✅ 해결: 무중단 마이그레이션

class SeamlessMigration {
  private migrationStatus: 'idle' | 'running' | 'completed' = 'idle';
  
  // 읽기: 둘 다 체크
  async getRecords(): Promise<CoffeeRecord[]> {
    if (this.migrationStatus === 'completed') {
      // 마이그레이션 완료: Supabase만 사용
      const { data } = await supabase
        .from('coffee_records')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    }
    
    // 마이그레이션 중: 병합된 데이터 반환
    const localRecords = this.getLocalRecords();
    const supabaseRecords = await this.getSupabaseRecords();
    
    // 중복 제거 및 병합
    const merged = new Map<string, CoffeeRecord>();
    
    // Supabase 우선
    supabaseRecords.forEach(record => {
      merged.set(record.id, record);
    });
    
    // 아직 마이그레이션 안 된 로컬 레코드 추가
    localRecords.forEach(record => {
      const mapping = this.getMigrationMapping(record.id);
      if (!mapping || mapping.status !== 'completed') {
        merged.set(record.id, record);
      }
    });
    
    return Array.from(merged.values());
  }
  
  // 쓰기: 둘 다 저장
  async saveRecord(record: CoffeeRecord) {
    // 1. LocalStorage에 즉시 저장 (빠른 응답)
    const tempId = this.saveToLocal(record);
    
    // 2. 백그라운드로 Supabase 저장
    this.saveToSupabase(record, tempId).catch(error => {
      // 실패해도 LocalStorage에 있으므로 데이터 손실 없음
      console.error('Supabase save failed:', error);
      this.addToRetryQueue(record, tempId);
    });
    
    return tempId;
  }
  
  // 백그라운드 마이그레이션
  async startBackgroundMigration() {
    this.migrationStatus = 'running';
    
    const records = this.getLocalRecords();
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      
      // 사용자가 앱을 사용 중이 아닐 때만 처리
      await this.waitForIdleTime();
      
      await this.migrateBatch(batch);
      
      // 진행률 업데이트 (UI에 표시)
      this.updateProgress(i + batch.length, records.length);
    }
    
    this.migrationStatus = 'completed';
  }
  
  private async waitForIdleTime() {
    return new Promise(resolve => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => resolve(undefined));
      } else {
        setTimeout(resolve, 100);
      }
    });
  }
}
```

## 📋 마이그레이션 체크리스트

### 사전 준비
- [ ] 전체 데이터 백업 (JSON 파일로 내보내기)
- [ ] 마이그레이션 맵 테이블 설계
- [ ] 롤백 계획 수립
- [ ] 테스트 환경에서 전체 프로세스 검증
- [ ] 사용자 공지 준비

### 실행 단계
- [ ] 체크포인트 생성
- [ ] 이중 저장 모드 활성화
- [ ] 백그라운드 마이그레이션 시작
- [ ] 실시간 모니터링
- [ ] 검증 및 정합성 체크

### 사후 관리
- [ ] 마이그레이션 완료 확인
- [ ] LocalStorage 데이터 정리 (30일 후)
- [ ] 성능 모니터링
- [ ] 사용자 피드백 수집

## 💡 핵심 교훈

1. **"간단한" 마이그레이션은 없다**: 항상 복잡도를 과소평가하지 마라
2. **이중 저장은 필수**: 데이터 손실 방지의 핵심
3. **체크포인트와 롤백**: 언제든 되돌릴 수 있어야 한다
4. **사용자 경험 우선**: 마이그레이션이 사용자에게 보이면 안 된다
5. **검증, 검증, 또 검증**: 데이터 정합성은 신뢰의 기반

---

_이 가이드는 CupNote 프로젝트에서 LocalStorage에서 Supabase로 마이그레이션하며 겪은 2주간의 실전 경험을 바탕으로 작성되었습니다._
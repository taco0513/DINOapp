# 🚨 DINO NextJS Production Reality Guide

DINO 프로젝트에서 실제 프로덕션 환경에서 발생하는 문제들과 해결책을 제공합니다.

## ⚡ DINO 특화 Hydration 에러 해결법

### 🦕 Schengen Calculator Hydration Fix

```typescript
// ❌ DINO에서 흔한 에러: 셰겐 데이터 로딩 시 Hydration 불일치
function SchengenCalculator() {
  const [entries, setEntries] = useState(() => {
    // SSR에서는 localStorage 접근 불가
    const stored = localStorage.getItem('dino-schengen-entries');
    return stored ? JSON.parse(stored) : [];
  });

  return <div>{entries.length} entries found</div>;
}

// ✅ DINO v4.0 올바른 패턴
function SchengenCalculator() {
  const [entries, setEntries] = useState<SchengenEntry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const stored = localStorage.getItem('dino-schengen-entries');
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to parse Schengen entries:', error);
      }
    }
  }, []);

  // SSR과 클라이언트 첫 렌더링에서 동일한 UI
  return (
    <div suppressHydrationWarning>
      {isHydrated ? (
        <div>{entries.length} Schengen entries found</div>
      ) : (
        <div>Loading Schengen data...</div>
      )}
    </div>
  );
}
```

### 🌍 Date/Time Zone Handling

```typescript
// ❌ 타임존 불일치로 인한 Hydration 에러
function SchengenDateDisplay({ entry }: { entry: SchengenEntry }) {
  const displayDate = new Date(entry.entryDate).toLocaleDateString(); // 서버/클라이언트 다름
  return <span>{displayDate}</span>;
}

// ✅ DINO 타임존 안전 패턴
function SchengenDateDisplay({ entry }: { entry: SchengenEntry }) {
  const [displayDate, setDisplayDate] = useState<string>('');

  useEffect(() => {
    // date-fns 사용 (DINO 필수 라이브러리)
    import('date-fns').then(({ format }) => {
      const formatted = format(new Date(entry.entryDate), 'MMM dd, yyyy');
      setDisplayDate(formatted);
    });
  }, [entry.entryDate]);

  return <span>{displayDate || 'Loading date...'}</span>;
}
```

## 📱 DINO 모바일 터치 최적화

### Touch-Friendly Schengen Controls

```typescript
// ✅ DINO 터치 최적화 컴포넌트
interface SchengenControlsProps {
  onAddEntry: () => void;
  onCalculate: () => void;
}

function SchengenControls({ onAddEntry, onCalculate }: SchengenControlsProps) {
  return (
    <div className="flex gap-4 p-4">
      <button
        onClick={onAddEntry}
        className="
          min-h-[44px] min-w-[44px]
          touch-manipulation
          flex items-center justify-center
          bg-blue-500 text-white rounded-lg
          active:bg-blue-600 transition-colors
        "
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        Add Entry
      </button>

      <button
        onClick={onCalculate}
        className="
          min-h-[44px] min-w-[44px]
          touch-manipulation
          flex items-center justify-center
          bg-green-500 text-white rounded-lg
          active:bg-green-600 transition-colors
        "
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        Calculate
      </button>
    </div>
  );
}
```

### 🎯 Performance Optimized Components

```typescript
// ✅ DINO 성능 최적화된 셰겐 목록
import { memo, useMemo, useCallback } from 'react';

interface SchengenListProps {
  entries: SchengenEntry[];
  onEntryClick: (entry: SchengenEntry) => void;
}

const SchengenList = memo<SchengenListProps>(({ entries, onEntryClick }) => {
  // 계산 결과 메모이제이션
  const totalDays = useMemo(() => {
    return entries.reduce((sum, entry) => sum + entry.stayDays, 0);
  }, [entries]);

  // 이벤트 핸들러 메모이제이션
  const handleEntryClick = useCallback((entry: SchengenEntry) => {
    onEntryClick(entry);
  }, [onEntryClick]);

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600">
        Total: {totalDays} days
      </div>
      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => handleEntryClick(entry)}
          className="
            p-3 border rounded cursor-pointer
            min-h-[44px] touch-manipulation
            hover:bg-gray-50 active:bg-gray-100
          "
        >
          {entry.country} - {entry.stayDays} days
        </div>
      ))}
    </div>
  );
});

SchengenList.displayName = 'SchengenList';
```

## 🔧 DINO 프로덕션 체크리스트

### 배포 전 필수 확인사항

```yaml
hydration_safety:
  - [ ] localStorage 접근을 useEffect로 이동
  - [ ] Date/Time 계산을 클라이언트에서만 수행
  - [ ] suppressHydrationWarning 적절히 사용
  - [ ] 서버/클라이언트 첫 렌더링 일치 확인

mobile_optimization:
  - [ ] 모든 버튼 최소 44px 터치 영역
  - [ ] touch-manipulation CSS 속성 적용
  - [ ] iOS 터치 하이라이트 제거
  - [ ] 반응형 디자인 테스트 완료

performance_validation:
  - [ ] 번들 크기 300KB 미만 확인
  - [ ] React.memo 적절히 적용
  - [ ] useMemo/useCallback 최적화
  - [ ] Core Web Vitals 목표 달성

schengen_accuracy:
  - [ ] date-fns 라이브러리 사용 확인
  - [ ] 90/180일 규칙 정확성 검증
  - [ ] 타임존 처리 테스트
  - [ ] 엣지 케이스 커버리지 확인
```

## 🚀 DINO 배포 최적화

### Next.js 설정 최적화

```javascript
// next.config.js - DINO 프로덕션 설정
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 번들 크기 최적화
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },

  // Schengen 계산에 필요한 정확한 날짜 처리
  timezone: "UTC",

  // PWA 준비
  compress: true,

  // 성능 최적화
  images: {
    optimization: true,
    formats: ["image/webp", "image/avif"],
  },

  // DINO 특화 환경 변수
  env: {
    DINO_VERSION: "4.0.0",
    SCHENGEN_CALCULATION_MODE: "strict",
  },
};

module.exports = nextConfig;
```

### TypeScript 설정 최적화

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,

    // DINO 특화 설정
    "paths": {
      "@/lib/schengen/*": ["./lib/schengen/*"],
      "@/components/schengen/*": ["./components/schengen/*"],
      "@/types/schengen": ["./types/schengen"]
    }
  },
  "include": [
    "types/schengen.ts",
    "lib/schengen/**/*",
    "components/schengen/**/*"
  ]
}
```

---

**🦕 DINO Production Reality**: Zero Hydration Errors, Perfect Mobile UX, Optimal Performance!

_Master Playbook v4.0.0 Integration | Production-Tested Patterns_

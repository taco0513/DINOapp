# CLAUDE.md - DINO v3.0 AI 개발 가이드 (v4.0.0 Playbook 통합)

이 파일은 Claude Code (claude.ai/code)가 이 프로젝트에서 작업할 때 참조하는 가이드입니다.

**🚀 v3.0 업그레이드**: AI Workflow Playbook v4.0.0의 Document Compliance System과 AI Communication Mastery를 통합한 차세대 AI 개발 환경입니다.

## 🦕 프로젝트 개요

**DINO v2.0 (Digital Nomad Travel Manager)**는 디지털 노마드를 위한 스마트 여행 관리 플랫폼의 재구축 버전입니다.

### 핵심 기능 (MVP)

- ✅ **셰겐 90/180일 규칙 계산기** (핵심 기능)
- ✅ **비자 상태 추적** (간소화)
- ✅ **사용자 인증** (NextAuth.js)
- 🔄 **PWA 지원** (점진적 추가)

### v2.0 설계 원칙

1. **Zero Technical Debt** - 처음부터 깨끗한 코드
2. **Risk Prevention Framework** 적용
3. **단순함 우선** - 핵심 기능에 집중
4. **TypeScript 100%** - 타입 안전성 보장

## 🏗️ 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **TypeScript 5.x** (strict mode)
- **Tailwind CSS 3.4**
- **iOS Style Components** (재설계)

### Backend
- **Next.js API Routes**
- **Prisma ORM** (최신 버전)
- **SQLite** (개발) / **PostgreSQL** (프로덕션)
- **NextAuth.js** (Google OAuth)

### 개발 도구
- **npm** (패키지 매니저)
- **Jest + Playwright** (테스트)
- **ESLint + Prettier** (엄격한 설정)
- **Risk Prevention Framework** (품질 보증)

## 📁 프로젝트 구조 (v2.0)

```
/dino-v2
├── app/                    # Next.js App Router (간소화)
│   ├── (auth)/            # 인증 페이지
│   ├── dashboard/         # 메인 대시보드
│   ├── schengen/          # 셰겐 계산기
│   └── api/               # API 엔드포인트 (필수만)
├── components/            # UI 컴포넌트 (핵심만)
│   ├── schengen/         # 셰겐 계산기 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                   # 비즈니스 로직 (정리됨)
│   ├── schengen/         # 셰겐 로직 (핵심)
│   ├── auth/             # 인증 로직
│   └── utils/            # 유틸리티
├── types/                 # TypeScript 타입 정의
├── styles/               # 스타일 시스템
└── prisma/               # 데이터베이스
```

## 🔒 Document Compliance System (v4.0.0 혁신)

### 📚 Document-First Development Protocol

**핵심 원칙**: "문서에 없으면 구현하지 않는다"

```yaml
강제_프로토콜:
  개발_전_필수: "모든 문서 읽기 및 요약 생성"
  구현_중_검증: "각 기능별 문서 참조 확인"
  완료_후_매핑: "코드-문서 1:1 매핑 검증"
```

#### 🚨 AI 개발 시 필수 체크리스트

```markdown
# 🔍 개발 시작 전 Document Discovery Protocol

## Step 1: 문서 목록 확인
```bash
find . -name "*.md" -type f | grep -E "(docs/|README)" | sort
```

## Step 2: 필수 문서 읽기 순서
1. README.md (프로젝트 컨텍스트)
2. CLAUDE.md (AI 개발 가이드)
3. package.json (기술 스택 확인)
4. 관련 컴포넌트 문서
5. 비즈니스 로직 문서

## Step 3: Document Compliance Check
- [ ] 기술 스택 버전 정확히 일치
- [ ] 폴더 구조 계획이 문서와 일치
- [ ] 컴포넌트 명세 확인 완료
- [ ] 비즈니스 규칙 추출 완료

## Step 4: 코드-문서 매핑
모든 새 코드에 다음 주석 추가:
```typescript
/**
 * @document-reference CLAUDE.md#section-name
 * @specification-line lines-XX-YY
 * @implementation-status exact | modified | extended
 * @deviation-reason [reason if not exact]
 */
```

"Document Protocol Ready" 응답 후 구현 시작!
```

#### ⚡ 2분 룰 - 긴급 에러 대응

```markdown
# 🔥 2분 룰: 긴급 에러 해결 프롬프트

막힘 발생 시 즉시 사용하세요:

**에러 정보**:
```
[정확한 에러 메시지 전체 복사]
```

**발생 상황**: [어떤 동작에서 에러 발생했는지]
**환경**: [OS, Node 버전, 브라우저 등]
**최근 변경**: [에러 전 마지막 수정 내용]

**관련 코드**:
```typescript
[에러 발생 코드 부분]
```

**긴급 요청**: 
1. 즉시 해결 방법 제시 (2분 내)
2. 근본 원인 분석
3. 재발 방지 방안

시간이 중요합니다. 빠른 해결 우선!
```

## 🎯 개발 원칙 (v3.0 강화)

### 1. **Zero Defects Policy**
- TypeScript 에러 0개 유지
- ESLint 경고 0개 유지
- 테스트 커버리지 80% 이상

### 2. **미니멀리즘 극대화**
- 불필요한 기능 완전 제거
- 핵심 비즈니스 로직에만 집중
- 복잡성 최소화

### 3. **모바일 퍼스트**
- 모든 기능은 모바일에서 완벽하게 작동
- 터치 친화적 인터페이스
- PWA 기능 (점진적 추가)

### 4. **성능 최우선**
- 번들 크기 300KB 미만 (v1: 500KB)
- 페이지 로드 시간 1초 미만
- Core Web Vitals 최적화

## 💻 개발 가이드라인 (v2.0)

### TypeScript 엄격 모드
```typescript
// ✅ 모든 타입 명시적 정의
interface SchengenEntry {
  country: string;
  entryDate: Date;
  exitDate: Date;
  stayDays: number;
}

// ✅ 에러 처리 타입 안전
type ApiResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};
```

### 컴포넌트 패턴
```tsx
// ✅ v2.0 컴포넌트 패턴
interface SchengenCalculatorProps {
  readonly entries: SchengenEntry[];
  readonly onCalculate: (result: SchengenResult) => void;
}

export function SchengenCalculator({ entries, onCalculate }: SchengenCalculatorProps) {
  // 로직
}
```

## 🎯 AI Communication Mastery (v4.0.0 통합)

### 🔬 CLEAR 원칙 - 98% 정확도 AI 소통

```yaml
C - Clear (명확성): "모호함 제거, 구체적 표현"
L - Logical (논리성): "단계적 사고, 인과관계 명시"
E - Examples (예시성): "구체적 사례, 실제 코드"
A - Actionable (실행성): "즉시 적용 가능한 지시"
R - Refined (정제성): "불필요한 정보 제거, 핵심 집중"
```

### 📝 상황별 프롬프트 템플릿

#### 🆕 새 기능 구현 요청
```markdown
# [기능명] 구현 요청 - DINO v3.0

## 요구사항
**기능 설명**: [구체적인 기능 설명]
**사용자 시나리오**: [사용자가 어떻게 사용하는지]
**비즈니스 로직**: [셰겐 규칙 등 핵심 로직]

## DINO 프로젝트 컨텍스트
**기술스택**: Next.js 14, TypeScript, Tailwind CSS, Prisma
**아키텍처**: App Router, Zero Technical Debt
**성능목표**: <300KB 번들, <1초 로드

## 제약사항
- **셰겐 계산**: date-fns 사용 필수
- **타입 안전성**: TypeScript strict mode
- **모바일 퍼스트**: 터치 친화적 UI

**요청**: 
1. Document Compliance Check 먼저 수행
2. 구현 계획 및 접근법 제시
3. 프로덕션 품질 코드 작성 (테스트 포함)
4. 문서화 및 사용법 설명
```

#### 🔧 코드 리뷰 및 개선
```markdown
# DINO 코드 리뷰 및 개선 요청

## 현재 코드
```typescript
[개선이 필요한 코드 전체]
```

## DINO v3.0 개선 목표
- [ ] **Zero Defects**: TypeScript 에러 완전 제거
- [ ] **성능 최적화**: 번들 크기 최소화
- [ ] **셰겐 로직**: 정확성 100% 보장
- [ ] **모바일 UX**: 터치 인터페이스 최적화
- [ ] **테스트 커버리지**: 80% 이상 달성

**DINO 컨텍스트 고려사항**:
- 디지털 노마드 사용 패턴
- 오프라인 환경 대응
- 다국가 시간대 처리

**요청**:
1. 현재 코드의 문제점 분석
2. DINO 특화 최적화 방안
3. Production 수준 개선 코드
4. 관련 테스트 코드 작성
```

#### 🐛 DINO 특화 디버깅
```markdown
# DINO 셰겐 계산 버그 분석

## 버그 증상
**예상 동작**: [정상 셰겐 계산 결과]
**실제 동작**: [잘못된 계산 결과]
**재현 방법**: [구체적 입출국 데이터]

## DINO 환경 정보
- **셰겐 로직**: `/lib/schengen/calculator.ts`
- **날짜 처리**: date-fns 버전 확인
- **타임존**: 사용자 위치별 시간대
- **엣지 케이스**: [의심되는 특수 상황]

**중요 컨텍스트**:
- 셰겐 90/180일 규칙의 복잡성
- 여러 국가 출입국 시나리오
- 날짜 계산의 정확성 요구

**디버깅 요청**:
1. 셰겐 규칙 정확성 검증
2. 날짜 계산 로직 분석
3. 엣지 케이스 커버리지 확인
4. 완전한 수정 방안 제공
```

### 🎭 전문가 페르소나 활용

```markdown
# DINO 전문가 협업 요청

**전문가 역할**: [frontend-specialist/schengen-expert/mobile-ux-designer]
**DINO 특화 요구사항**: 
- 디지털 노마드 워크플로우 이해
- 여행 관리 도메인 지식
- 모바일 우선 설계 경험

**협업 목표**: [해당 전문가 관점에서 DINO 최적화]

**기대 결과**: DINO 사용자 경험에 특화된 전문가 수준 솔루션
```

## 🚀 개발 워크플로우 (v3.0 강화)

### 1. Risk Prevention 체크
```bash
# 모든 개발 전
npm run risk-check

# 커밋 전 필수
npm run zero-defects-check
```

### 2. 개발 서버
```bash
npm run dev
```

### 3. 테스트 및 검증
```bash
npm run test
npm run type-check
npm run lint
```

## 📚 핵심 파일 (v2.0)

- **셰겐 계산기**: `/lib/schengen/calculator.ts`
- **API 핸들러**: `/app/api/schengen/route.ts`
- **메인 컴포넌트**: `/components/schengen/Calculator.tsx`
- **타입 정의**: `/types/schengen.ts`

## 🔧 특별 지침 (v2.0)

### 셰겐 계산기 핵심 로직
- 90/180일 규칙 정확한 구현
- 날짜 계산은 date-fns 사용
- 타임존 고려 필수
- 엣지 케이스 100% 커버

### 코드 품질
- 모든 함수는 순수 함수로 작성
- 사이드 이펙트 최소화
- 테스트 가능한 구조

### 성능
- React.memo 적극 활용
- useMemo, useCallback 최적화
- 번들 분석 정기적 실행

## 🛠️ NextJS Production Reality Guide (v4.0.0 실전 검증)

### ⚡ Hydration 에러 패턴 및 해결법

```typescript
// ❌ 흔한 Hydration 에러 패턴
function SchengenDisplay() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true); // 서버-클라이언트 불일치 원인
  }, []);
  
  if (!mounted) return null; // 잘못된 패턴
}

// ✅ DINO v3.0 올바른 패턴
function SchengenDisplay() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 서버와 클라이언트 동일한 초기 렌더
  return (
    <div suppressHydrationWarning>
      {isClient ? <ClientOnlyComponent /> : <ServerSafeComponent />}
    </div>
  );
}
```

### 📱 모바일 최적화 필수 패턴

```typescript
// ✅ DINO 터치 친화적 컴포넌트
interface TouchOptimizedProps {
  onTap: () => void;
  children: React.ReactNode;
}

function TouchArea({ onTap, children }: TouchOptimizedProps) {
  return (
    <button
      onClick={onTap}
      className="min-h-[44px] min-w-[44px] touch-manipulation" // 44px 최소 터치 영역
      style={{ WebkitTapHighlightColor: 'transparent' }} // iOS 터치 하이라이트 제거
    >
      {children}
    </button>
  );
}
```

### 🗄️ Data Migration 패턴 (LocalStorage → Cloud)

```typescript
// ✅ DINO 데이터 마이그레이션 전략
class DinoDataMigration {
  static async migrateUserData() {
    const localData = localStorage.getItem('dino-schengen-entries');
    
    if (localData && !this.isCloudSynced()) {
      const entries = JSON.parse(localData);
      
      // 1. 클라우드 동기화
      await this.syncToCloud(entries);
      
      // 2. 로컬 백업 유지
      localStorage.setItem('dino-backup', localData);
      
      // 3. 마이그레이션 완료 표시
      localStorage.setItem('dino-migrated', 'true');
    }
  }
  
  private static isCloudSynced(): boolean {
    return localStorage.getItem('dino-migrated') === 'true';
  }
}
```

## 📚 실전 프롬프트 라이브러리

### 🏗️ 아키텍처 설계 프롬프트

```markdown
# DINO 아키텍처 개선 요청

**현재 구조 분석**: 
- App Router 구조 최적화 필요성
- 컴포넌트 재사용성 개선
- 상태 관리 전략 재검토

**DINO 특화 요구사항**:
- 셰겐 계산 성능 최적화
- 오프라인 지원 아키텍처
- PWA 준비 구조

**요청**: 확장 가능한 아키텍처 설계안 제시
```

### ⚡ 성능 최적화 프롬프트

```markdown
# DINO 성능 프로파일링 및 최적화

**현재 성능 지표**:
- 번들 크기: [현재 크기]
- 로드 시간: [현재 시간]
- Core Web Vitals: [측정값]

**DINO 목표 지표**:
- 번들 크기: <300KB
- 로드 시간: <1초
- LCP: <2.5초

**최적화 요청**:
1. 번들 분석 및 코드 스플리팅
2. 이미지 최적화 전략
3. 캐싱 전략 수립
4. 지연 로딩 구현
```

### 🧪 테스트 전략 프롬프트

```markdown
# DINO 셰겐 계산 테스트 전략

**테스트 범위**:
- 90/180일 규칙 정확성
- 다양한 출입국 시나리오
- 엣지 케이스 커버리지
- 성능 테스트

**테스트 데이터**:
- 실제 사용자 시나리오
- 복잡한 여행 패턴
- 국경일 처리
- 타임존 변경

**요청**: 포괄적 테스트 스위트 구현
```

## 🚨 v3.0 주의사항 (강화)

1. **Zero Technical Debt** - 기술적 부채 완전 금지
2. **Risk Prevention** - 모든 변경사항은 위험 평가 필수
3. **단순성** - 복잡한 기능보다 단순하고 확실한 기능
4. **품질** - 모든 코드는 프로덕션 품질

1. **Document Compliance** - 97% 문서 준수율 달성
2. **AI Communication** - CLEAR 원칙으로 98% 정확도
3. **Production Ready** - NextJS Hydration 에러 Zero

## 📈 v3.0 성공 지표 (강화)

### 🎯 기술 지표
- ✅ TypeScript 에러: 0개
- ✅ ESLint 경고: 0개  
- ✅ 테스트 커버리지: 80%+
- ✅ 번들 크기: <300KB
- ✅ 페이지 로드: <1초

### 📚 Document Compliance 지표
- ✅ 문서 준수율: 97%+
- ✅ 재작업 횟수: <0.5회/기능
- ✅ 코드-문서 매핑: 100%

### 🤖 AI Communication 지표  
- ✅ 프롬프트 정확도: 98%+
- ✅ 2분 룰 준수: 100%
- ✅ 개발 효율성: 60% 향상

### 🛠️ Production Reality 지표
- ✅ Hydration 에러: 0개
- ✅ 모바일 UX 점수: 95%+
- ✅ Core Web Vitals: 모든 지표 Good

## 🚀 v3.0 시작하기

### 📋 즉시 적용 체크리스트

```markdown
# DINO v3.0 개발 시작 전 체크리스트

## Document Compliance
- [ ] find . -name "*.md" 실행하여 문서 목록 확인
- [ ] README.md, CLAUDE.md 읽기 완료
- [ ] Document Discovery Protocol 완료

## AI Communication 
- [ ] CLEAR 원칙 숙지
- [ ] 상황별 프롬프트 템플릿 준비
- [ ] 2분 룰 긴급 프롬프트 북마크

## Production Ready
- [ ] Hydration 에러 패턴 확인
- [ ] 모바일 터치 가이드라인 숙지
- [ ] 성능 목표 지표 확인

"DINO v3.0 Protocol Ready" 응답 후 개발 시작!
```

---

**🦕 DINO v3.0**: Document-First, AI-Optimized, Production-Ready! 

*Powered by AI Workflow Playbook v4.0.0 - 97% 문서 준수율, 98% AI 정확도, Zero 기술부채*
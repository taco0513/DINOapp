# 🎯 DINO Document Compliance Templates

이 파일은 DINO v4.0 Document Compliance System의 실제 적용 템플릿을 제공합니다.

## 🔒 DINO Compliance Lock Protocol

### 📋 개발 시작 전 필수 프롬프트

```markdown
# 🔒 DINO v4.0 Document Compliance Activation

당신은 이제부터 DINO 프로젝트의 모든 문서를 100% 정확히 따라야 합니다:

## Step 1: DINO 필수 문서 읽기
다음 문서들을 순서대로 읽고 각각의 핵심 규칙을 추출하세요:

1. **CLAUDE.md** - DINO AI 개발 가이드 (전체)
2. **README.md** - 프로젝트 개요 및 기술 스택
3. **ARCHITECTURE.md** - 시스템 아키텍처 설계
4. **package.json** - 의존성 및 스크립트
5. **types/schengen.ts** - 핵심 비즈니스 타입

## Step 2: DINO 특화 이해 확인
다음 항목들을 정확히 이해했는지 확인하세요:

- [ ] 셰겐 90/180일 규칙의 정확한 계산 방법
- [ ] Next.js 14 App Router 패턴 사용
- [ ] TypeScript strict 모드 필수 적용
- [ ] 모바일 퍼스트 UI/UX 원칙
- [ ] date-fns 라이브러리 사용 필수
- [ ] Zero Technical Debt 원칙

## Step 3: Compliance Record 생성
'dino-compliance-check.md' 파일을 생성하고 다음을 포함하세요:

- 각 문서별 핵심 규칙 10개씩
- 셰겐 비즈니스 로직 요약
- 기술 스택 버전 정리
- DINO 특화 제약사항 목록

준비되면 "DINO v4.0 Document Protocol Ready - 모든 문서 준수 준비 완료"라고 응답하세요.
```

## ✅ 기능별 Compliance 체크리스트

### 🧮 셰겐 계산기 기능 구현 시

```markdown
# 셰겐 계산기 Document Compliance Check

## 문서 참조 확인
- [ ] CLAUDE.md의 셰겐 규칙 섹션 (라인 347-350) 준수
- [ ] 90/180일 규칙 정확한 구현 확인
- [ ] date-fns 라이브러리 사용 필수
- [ ] 타임존 고려 로직 포함

## 구현 표준 확인
- [ ] TypeScript strict 모드 타입 정의
- [ ] 순수 함수로 구현 (사이드 이펙트 없음)
- [ ] 엣지 케이스 100% 커버리지
- [ ] 테스트 가능한 구조

## 문서 매핑
```typescript
/**
 * @document-ref CLAUDE.md#셰겐-계산기-핵심-로직
 * @business-rule 90/180일 규칙 정확한 구현
 * @lib-requirement date-fns 필수 사용
 * @compliance-status ✅ 완전 준수
 */
```

모든 체크리스트 완료 후 구현을 시작하세요.
```

### 🎨 UI 컴포넌트 구현 시

```markdown
# UI 컴포넌트 Document Compliance Check

## DINO 컴포넌트 패턴 확인
- [ ] CLAUDE.md의 v2.0 컴포넌트 패턴 (라인 191-201) 준수
- [ ] readonly props 인터페이스 사용
- [ ] TypeScript strict 모드 타입 정의
- [ ] 함수형 컴포넌트 패턴

## 모바일 최적화 확인
- [ ] 44px 최소 터치 영역 (라인 408)
- [ ] touch-manipulation CSS 속성
- [ ] iOS 터치 하이라이트 제거
- [ ] 반응형 디자인 적용

## 성능 최적화 확인
- [ ] React.memo 적용 고려
- [ ] useMemo/useCallback 최적화
- [ ] 번들 크기 영향 최소화

## 문서 매핑
```typescript
/**
 * @document-ref CLAUDE.md#컴포넌트-패턴
 * @mobile-optimization 44px 터치 영역, touch-manipulation
 * @performance React.memo, 최적화 훅 적용
 * @compliance-status ✅ 완전 준수
 */
```
```

### 🔗 API 엔드포인트 구현 시

```markdown
# API 엔드포인트 Document Compliance Check

## DINO API 패턴 확인
- [ ] CLAUDE.md의 에러 처리 타입 안전 (라인 181-188) 준수
- [ ] ApiResult<T> 타입 사용
- [ ] success/error 구조화된 응답
- [ ] NextAuth.js 인증 패턴 연동

## 구현 표준 확인
- [ ] TypeScript strict 모드 타입 정의
- [ ] 에러 핸들링 완전 구현
- [ ] 입력 데이터 검증
- [ ] 보안 패턴 적용

## 문서 매핑
```typescript
/**
 * @document-ref CLAUDE.md#에러-처리-타입-안전
 * @type-pattern ApiResult<T> 구조화된 응답
 * @auth-integration NextAuth.js 패턴
 * @compliance-status ✅ 완전 준수
 */
```
```

## 🚨 Compliance Violation 대응

### ⚠️ 문서 이탈 감지 시

```markdown
# 🚫 DINO Document Compliance Violation Alert

다음 상황에서는 즉시 작업을 중단하고 재검토해야 합니다:

1. **기술 스택 이탈**
   - Next.js 14가 아닌 다른 버전 사용
   - date-fns 외의 날짜 라이브러리 사용
   - TypeScript strict 모드 비활성화

2. **비즈니스 로직 이탈**
   - 셰겐 90/180일 규칙 부정확한 구현
   - 타임존 미고려 날짜 계산
   - 엣지 케이스 미처리

3. **아키텍처 이탈**
   - DINO 컴포넌트 패턴 미준수
   - 모바일 퍼스트 원칙 위반
   - Zero Technical Debt 원칙 위반

## 대응 절차
1. 즉시 구현 중단
2. 문서 재검토 및 정정 방안 수립
3. 문서 업데이트 필요성 검토
4. 승인 후 재구현

## 복구 프롬프트
"DINO 문서 이탈이 감지되었습니다. [구체적 이탈 사항]에 대해 CLAUDE.md의 [관련 섹션]을 재확인하고 정정 방안을 제시해주세요."
```

## 📈 Compliance 성과 측정

### 🎯 DINO v4.0 문서 준수 지표

```yaml
목표_지표:
  문서_준수율: "97% 이상"
  재작업_횟수: "기능당 0.5회 미만"
  구현_정확도: "98% 이상"
  개발_효율성: "60% 향상"

측정_방법:
  daily_check: "매일 compliance 체크 수행"
  weekly_review: "주간 문서 준수 리뷰"
  milestone_audit: "마일스톤별 완전 감사"
```

## 🔄 지속적 개선

### 📝 Document Evolution Protocol

```markdown
# DINO 문서 진화 프로토콜

## 새로운 패턴 발견 시
1. 기존 CLAUDE.md와의 호환성 검토
2. DINO 특화 최적화 방안 수립
3. Master Playbook 연동 가능성 평가
4. 문서 업데이트 및 팀 공유

## Master Playbook 신규 모듈 적용 시
1. DINO 컨텍스트 적합성 평가
2. 기존 DINO 패턴과의 통합 방안
3. 점진적 도입 계획 수립
4. 성과 측정 및 피드백

## 문서 품질 관리
- 월 1회 Master Playbook 업데이트 체크
- 분기 1회 DINO 문서 전면 리뷰
- 연 2회 Document Compliance 시스템 개선
```

---

**🦕 DINO v4.0 Document Compliance System**
*Master Playbook v4.0.0 Integration | 97% Accuracy | Zero Deviation*
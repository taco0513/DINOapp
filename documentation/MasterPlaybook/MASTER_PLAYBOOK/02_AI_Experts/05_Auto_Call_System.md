# 🎯 자동 호출 시스템

## 🚀 개요

AI가 당신의 요청을 분석해서 **적절한 전문가를 자동으로 호출**하는 혁신적인 시스템입니다. 전문가 이름을 몰라도 전혀 문제없습니다!

## 🧠 작동 원리

### 1단계: 요청 분석

```
You: "로그인 시스템 만들어줘"
    ↓
AI가 분석:
- 키워드: 로그인, 시스템
- 필요 기능: 인증, 보안, UI
- 복잡도: 중간
```

### 2단계: 전문가 매칭

```
자동 선택된 전문가들:
✅ backend-architect (인증 시스템)
✅ security-auditor (보안 검증)
✅ frontend-developer (로그인 UI)
✅ database-architect (사용자 DB)
```

### 3단계: 협업 실행

```
1. backend-architect: API 설계
2. database-architect: DB 스키마
3. frontend-developer: UI 구현
4. security-auditor: 보안 검사
```

## 🎮 호출 패턴

### 🔑 키워드 기반 호출

#### 개발 관련

| 키워드                  | 호출되는 전문가                    |
| ----------------------- | ---------------------------------- |
| "만들어줘", "구현해줘"  | 해당 도메인 개발자                 |
| "디자인해줘", "예쁘게"  | frontend-developer, ui-ux-designer |
| "서버", "API", "백엔드" | backend-architect                  |
| "데이터베이스", "저장"  | database-architect                 |
| "모바일", "앱"          | mobile-developer                   |

#### 문제 해결

| 키워드                  | 호출되는 전문가         |
| ----------------------- | ----------------------- |
| "에러", "안 돼", "오류" | debugger                |
| "느려", "최적화"        | performance-engineer    |
| "해킹", "보안"          | security-auditor        |
| "버그", "문제"          | debugger, test-engineer |

#### 품질 관련

| 키워드           | 호출되는 전문가              |
| ---------------- | ---------------------------- |
| "테스트", "검증" | test-engineer, qa-specialist |
| "검토", "리뷰"   | code-reviewer                |
| "품질", "개선"   | qa-specialist, code-reviewer |
| "접근성"         | accessibility-expert         |

#### 운영 관련

| 키워드             | 호출되는 전문가       |
| ------------------ | --------------------- |
| "배포", "온라인"   | deployment-specialist |
| "모니터링", "추적" | monitoring-engineer   |
| "백업", "복구"     | backup-specialist     |
| "CI/CD", "자동화"  | devops-engineer       |

### 🎭 상황별 자동 호출

#### 신규 기능 개발

```
You: "사용자가 사진을 올릴 수 있게 해줘"

자동 호출:
- frontend-developer (업로드 UI)
- backend-architect (파일 처리 API)
- cloud-architect (스토리지 설정)
- security-auditor (파일 검증)
```

#### 성능 이슈

```
You: "페이지 로딩이 너무 오래 걸려"

자동 호출:
- performance-engineer (성능 분석)
- frontend-developer (최적화)
- cdn-optimizer (캐싱 전략)
- monitoring-engineer (지표 추적)
```

#### 보안 강화

```
You: "결제 시스템 안전하게 만들어줘"

자동 호출:
- security-auditor (보안 설계)
- backend-architect (안전한 API)
- payment-specialist (PCI 준수)
- test-engineer (보안 테스트)
```

## 🤝 전문가 협업 패턴

### 순차적 협업

```
1. ui-ux-designer → 디자인
2. frontend-developer → 구현
3. backend-architect → API 연동
4. test-engineer → 테스트
```

### 병렬 협업

```
동시 진행:
├─ frontend-developer (UI)
├─ backend-architect (서버)
└─ database-architect (DB)
```

### 검증 협업

```
개발 완료 후:
├─ code-reviewer (코드 검토)
├─ security-auditor (보안 검사)
├─ performance-engineer (성능 체크)
└─ qa-specialist (품질 보증)
```

## 📊 자동 호출 통계

### 가장 많이 호출되는 전문가 TOP 5

1. 🥇 **debugger** - 에러 해결
2. 🥈 **frontend-developer** - UI 개발
3. 🥉 **backend-architect** - 서버 설계
4. 🏅 **security-auditor** - 보안 검사
5. 🏅 **deployment-specialist** - 배포

### 자주 함께 일하는 팀

- 🤝 frontend + backend + database
- 🤝 debugger + test-engineer
- 🤝 security + backend + database
- 🤝 performance + monitoring + devops

## 🎯 최적화 팁

### 효과적인 요청 방법

#### 명확한 목표 제시

```
❌ "뭔가 만들어줘"
✅ "할 일 목록 앱 만들어줘"
```

#### 구체적인 요구사항

```
❌ "예쁘게 해줘"
✅ "모던하고 미니멀한 디자인으로"
```

#### 단계별 접근

```
✅ Step 1: "기본 구조 만들어줘"
✅ Step 2: "로그인 기능 추가해줘"
✅ Step 3: "디자인 개선해줘"
```

## 🔧 고급 기능

### 수동 호출 (선택사항)

특정 전문가를 직접 부르고 싶을 때:

```
You: "@frontend-developer 이 버튼 수정해줘"
You: "security-auditor한테 검사 요청"
```

### 팀 호출

여러 전문가를 한번에:

```
You: "프론트엔드팀 전체 호출"
You: "보안 검사 전문가들 모두"
```

### 전문가 제외

특정 전문가 제외하고 싶을 때:

```
You: "디자인은 건드리지 말고 기능만"
You: "보안 검사는 나중에"
```

## 📈 학습하는 시스템

### AI가 학습하는 것들

1. **선호도**: 자주 사용하는 기술 스택
2. **패턴**: 작업 순서와 방식
3. **스타일**: 디자인 취향
4. **수준**: 기술 이해도

### 개선되는 부분

- ✅ 더 정확한 전문가 매칭
- ✅ 빠른 문제 해결
- ✅ 맞춤형 솔루션
- ✅ 효율적인 협업

## ❓ FAQ

**Q: 전문가가 잘못 호출되면?**
A: "다른 전문가 불러줘" 또는 특정 전문가를 지정하세요.

**Q: 너무 많은 전문가가 나타나면?**
A: AI가 자동으로 필요한 전문가만 선별합니다.

**Q: 전문가끼리 의견이 다르면?**
A: AI가 최적의 솔루션으로 조율합니다.

**Q: 특정 전문가를 선호하면?**
A: 자주 사용할수록 AI가 학습해서 우선 호출합니다.

---

> 💡 **Tip**: 전문가 이름을 몰라도 괜찮아요! 그냥 하고 싶은 일을 말하세요.

## 🚀 실전 예시

### 쇼핑몰 만들기

```
You: "온라인 쇼핑몰 만들어줘"

[자동 호출 및 작업 순서]
1. ecommerce-specialist: 전체 구조 설계
2. ui-ux-designer: 사용자 경험 설계
3. frontend-developer: 상품 페이지 구현
4. backend-architect: 주문 시스템 구축
5. database-architect: 상품/주문 DB 설계
6. payment-specialist: 결제 시스템 통합
7. security-auditor: 보안 검증
8. deployment-specialist: 서비스 배포
```

### 모바일 앱 개발

```
You: "날씨 알려주는 앱 만들어줘"

[자동 호출]
1. mobile-developer: 앱 기본 구조
2. api-designer: 날씨 API 연동
3. ui-ux-designer: 직관적인 UI
4. test-engineer: 디바이스 테스트
```

---

> 🎯 **자동 호출 시스템으로 전문가 이름을 몰라도 완벽한 개발이 가능합니다!**

다음: [전문가 조합 패턴](06_Expert_Patterns.md) →

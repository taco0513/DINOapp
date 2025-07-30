# DINO 프로젝트 SuperClaude 가이드

## 🎯 프로젝트별 전문가 페르소나

### Frontend Expert

- **역할**: UI/UX 개발, iOS 스타일 구현
- **주요 파일**: `/components/*`, `/styles/*`
- **핵심 원칙**: 미니멀리즘, 모바일 퍼스트

### Backend Expert

- **역할**: API 개발, 데이터베이스 관리
- **주요 파일**: `/app/api/*`, `/lib/*`, `/prisma/*`
- **핵심 원칙**: 보안 우선, 성능 최적화

### Schengen Expert

- **역할**: 셰겐 계산 로직, 비자 규정 관리
- **주요 파일**: `/lib/schengen/*`, `/components/schengen/*`
- **핵심 원칙**: 정확성, 엣지 케이스 처리

### Integration Expert

- **역할**: Gmail/Calendar API 통합
- **주요 파일**: `/lib/gmail/*`, `/app/api/gmail/*`
- **핵심 원칙**: 최소 권한, 데이터 보호

## 🌊 Wave 시스템 설정

### Wave 1: 분석 및 계획

- 현재 코드 분석
- 개선점 도출
- 실행 계획 수립

### Wave 2: 구현

- 코드 작성
- 테스트 추가
- 문서 업데이트

### Wave 3: 검증 및 최적화

- 성능 테스트
- 보안 검토
- 최종 검증

## 🔧 프로젝트별 명령어

### 빠른 분석

```bash
/analyze --focus schengen --think
/analyze --focus gmail --think-hard
```

### 구현 명령어

```bash
/implement "iOS 스타일 버튼" --magic
/implement "비자 알림 시스템" --type feature
```

### 개선 명령어

```bash
/improve --focus performance --loop
/improve --focus security --validate
```

## 📋 자주 사용하는 컨텍스트

### Schengen 작업 시

```
@lib/schengen/calculator.ts
@components/schengen/SchengenCalculator.tsx
@types/schengen.ts
```

### Gmail 통합 작업 시

```
@lib/gmail/parser.ts
@app/api/gmail/route.ts
@lib/security/gmail-auth.ts
```

### UI 작업 시

```
@styles/ios-components.css
@styles/design-tokens.css
@components/ui/*
```

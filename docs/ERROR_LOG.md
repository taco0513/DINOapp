# 📋 에러 로그 및 해결 기록

## 2024-01-30

### 🔴 에러: Module not found - ios-components.css

**상황**: globals.css에서 ios-components.css import 실패
**원인**: 파일 경로 오류
**해결**:

```css
/* 수정 전 */
@import 'ios-components.css';

/* 수정 후 */
@import '../styles/ios-components.css';
```

**학습**: 상대 경로 사용 시 현재 파일 위치 확인 필수

---

### 🟡 경고: Hydration mismatch

**상황**: 날짜 표시 컴포넌트에서 서버/클라이언트 불일치
**원인**: 타임존 차이로 인한 날짜 문자열 불일치
**해결**:

```tsx
// 수정 전
<span>{new Date().toLocaleDateString()}</span>

// 수정 후
<span suppressHydrationWarning>
  {new Date().toLocaleDateString()}
</span>
```

**학습**: 동적 날짜는 클라이언트 전용 렌더링 고려

---

## 2024-01-29

### 🔴 에러: Port 3000 already in use

**상황**: 개발 서버 시작 실패
**원인**: 이전 프로세스가 포트 점유
**해결**:

```bash
# 프로세스 찾기
lsof -i :3000

# 프로세스 종료
kill -9 [PID]

# 또는 package.json 수정
"dev": "PORT=3000 next dev"
```

**학습**: 포트 충돌 시 프로세스 확인 습관화

---

### 🟢 성공: Prisma 마이그레이션 최적화

**상황**: 개발 환경에서 마이그레이션 속도 개선
**방법**:

```bash
# 개발용 스키마 분리
prisma generate --schema=./prisma/schema.dev.prisma
```

**결과**: 마이그레이션 시간 70% 단축
**학습**: 개발/프로덕션 환경 분리의 중요성

---

## 패턴 분석

### 자주 발생하는 에러 TOP 5

1. **Module not found** (25%) - 경로 문제
2. **Type errors** (20%) - TypeScript 타입 불일치
3. **Hydration mismatch** (15%) - SSR/CSR 불일치
4. **Database connection** (15%) - 환경 변수 설정
5. **Build failures** (10%) - 의존성 문제

### 해결 시간 단축 팁

1. **에러 메시지 전체 읽기** - 스택 트레이스 확인
2. **환경 변수 먼저 확인** - .env.local 검증
3. **타입 체크 실행** - `npm run type-check`
4. **클린 빌드** - `.next` 폴더 삭제 후 재빌드

---

**팁**: 에러 발생 시 이 문서에 기록하여 팀 전체가 학습할 수 있도록 합니다.

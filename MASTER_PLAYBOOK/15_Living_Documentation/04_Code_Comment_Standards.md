# 코드 주석 표준

## 개요

코드와 문서가 하나가 되는 주석 작성 표준을 정의합니다. AI가 코드의 의도와 맥락을 정확히 이해할 수 있도록 구조화된 주석 체계를 사용합니다.

## 주석 레벨 구조

### 파일 레벨 주석

```typescript
/**
 * @file user.service.ts
 * @purpose 사용자 관리 핵심 비즈니스 로직
 * @layer Service Layer
 * @dependencies
 *   - user.repository.ts: 데이터 액세스
 *   - auth.util.ts: 인증 유틸리티
 *   - notification.service.ts: 알림 발송
 * @exports
 *   - UserService: 메인 서비스 클래스
 *   - UserDTO: 데이터 전송 객체
 * @decisions
 *   - 패스워드는 bcrypt로 해싱 (보안팀 요구사항)
 *   - 삭제는 소프트 삭제만 지원 (복구 가능성)
 * @gotchas
 *   - 이메일 변경시 재인증 필요
 *   - 관리자 권한 체크 필수
 */
```

### 클래스/모듈 레벨 주석

```typescript
/**
 * 사용자 관리 서비스
 *
 * @class UserService
 * @implements IUserService
 *
 * @description
 * 사용자 생성, 수정, 삭제 등 핵심 비즈니스 로직을 담당합니다.
 * Repository 패턴을 사용하여 데이터 액세스와 분리되어 있습니다.
 *
 * @example
 * const userService = new UserService(userRepo, authUtil);
 * const user = await userService.createUser(userData);
 *
 * @patterns
 * - Repository Pattern: 데이터 액세스 추상화
 * - Strategy Pattern: 인증 방식 선택
 * - Observer Pattern: 사용자 이벤트 발행
 *
 * @events
 * - user.created: 사용자 생성 완료
 * - user.updated: 사용자 정보 수정
 * - user.deleted: 사용자 삭제 (소프트)
 */
class UserService implements IUserService {
  // ...
}
```

## 의도 기반 주석

### WHY 주석 패턴

```typescript
// WHY: 사용자가 비활성화된 경우에도 로그인 시도 기록은 남겨야 함
// CONTEXT: 보안팀 요구사항 - 모든 인증 시도는 추적되어야 함
// RELATED: auth-logger.service.ts, security-audit.md
if (user.isDisabled) {
  await this.authLogger.logFailedAttempt(email, 'USER_DISABLED');
  throw new UnauthorizedException('Account is disabled');
}

// WHY: 3번 연속 실패시 계정 잠금 (브루트포스 방지)
// TRIED: IP 기반 차단 → 공유 네트워크 문제로 폐기
// CONTEXT: 5분 후 자동 해제, 관리자는 즉시 해제 가능
if (failedAttempts >= 3) {
  await this.lockAccount(user.id, LOCK_DURATION);
  // GOTCHA: 잠금 상태도 별도로 로깅해야 함
  await this.securityLogger.logAccountLocked(user.id);
}
```

### 결정사항 문서화

```typescript
// DECISION: 2024-01-15 - JWT 토큰 유효기간 15분으로 단축
// REASON: 보안 감사 결과 권장사항
// IMPACT: 리프레시 토큰 로직 필수
// ALTERNATIVES_CONSIDERED:
//   - 세션 기반: 확장성 문제
//   - 30분 유지: 보안 위험
// REVIEW_DATE: 2024-07-15
const ACCESS_TOKEN_EXPIRY = '15m';

// ARCHITECTURE: 이벤트 기반 알림 시스템
// PATTERN: Pub/Sub를 통한 느슨한 결합
// BENEFITS:
//   - 알림 로직 변경시 서비스 코드 수정 불필요
//   - 새로운 알림 채널 추가 용이
// TRADEOFFS:
//   - 이벤트 순서 보장 안됨
//   - 디버깅 복잡도 증가
this.eventBus.publish('user.registered', {
  userId: user.id,
  email: user.email,
  timestamp: new Date()
});
```

## 코드 컨텍스트 주석

### 복잡한 로직 설명

```typescript
/**
 * 사용자 권한 계산 로직
 *
 * ALGORITHM:
 * 1. 기본 역할 권한 로드
 * 2. 사용자별 추가 권한 병합
 * 3. 임시 권한 적용 (시간 제한)
 * 4. 차단된 권한 제거
 *
 * COMPLEXITY: O(n*m) - n:권한수, m:역할수
 *
 * CACHE: 5분간 메모리 캐시, Redis 백업
 *
 * @param userId 사용자 ID
 * @returns 최종 권한 세트
 */
async calculatePermissions(userId: string): Promise<Permission[]> {
  // STEP 1: 캐시 확인
  const cached = await this.cache.get(`permissions:${userId}`);
  if (cached) return cached;

  // STEP 2: 기본 권한 계산
  // NOTE: 역할은 상속 관계를 가질 수 있음
  const roles = await this.getUserRoles(userId);
  const basePermissions = await this.getPermissionsForRoles(roles);

  // STEP 3: 사용자 특정 권한 추가
  // GOTCHA: 추가 권한은 역할 권한을 오버라이드할 수 있음
  const userPermissions = await this.getUserSpecificPermissions(userId);

  // STEP 4: 시간 제한 권한 필터링
  // WHY: 임시 승급된 권한은 만료 시간 체크 필요
  const activePermissions = this.filterExpiredPermissions([
    ...basePermissions,
    ...userPermissions
  ]);

  // STEP 5: 차단 목록 적용
  // SECURITY: 명시적으로 차단된 권한은 모든 것에 우선
  const finalPermissions = this.applyBlocklist(activePermissions, userId);

  // STEP 6: 캐시 저장
  await this.cache.set(`permissions:${userId}`, finalPermissions, 300);

  return finalPermissions;
}
```

### 에러 처리 컨텍스트

```typescript
try {
  const result = await this.externalAPI.call(data);
  return result;
} catch (error) {
  // ERROR_HANDLING: 외부 API 에러 처리 전략
  // CATEGORIES:
  //   - 4xx: 클라이언트 에러 → 사용자에게 전달
  //   - 5xx: 서버 에러 → 재시도
  //   - Network: 연결 에러 → 폴백 처리

  if (error.response?.status >= 400 && error.response?.status < 500) {
    // CLIENT_ERROR: 입력 데이터 문제
    // ACTION: 사용자에게 구체적 에러 메시지 제공
    throw new ValidationError(
      `External API error: ${error.response.data.message}`
    );
  } else if (error.response?.status >= 500) {
    // SERVER_ERROR: 외부 서비스 문제
    // ACTION: 3회까지 지수 백오프로 재시도
    // FALLBACK: 캐시된 데이터 사용
    return this.retryWithFallback(data, error);
  } else {
    // NETWORK_ERROR: 연결 실패
    // ACTION: 큐에 저장 후 나중에 처리
    // MONITORING: 알림 발송
    await this.queueForLater(data);
    await this.alertOps('External API unreachable', error);
    throw new ServiceUnavailableError('Service temporarily unavailable');
  }
}
```

## 성능 관련 주석

### 최적화 설명

```typescript
// PERFORMANCE: 대량 데이터 처리를 위한 스트리밍 구현
// BENCHMARK: 10만건 기준 메모리 사용량 90% 감소
// TRADEOFF: 코드 복잡도 증가
async function* streamLargeDataset(query: Query) {
  // OPTIMIZATION: 커서 기반 페이지네이션
  // WHY: Offset 방식은 대량 데이터에서 O(n) 성능 저하
  let cursor = null;
  const batchSize = 1000; // TUNED: 메모리/속도 최적 균형점

  while (true) {
    // QUERY_OPTIMIZATION: 인덱스 활용
    // INDEX: idx_created_at_status (created_at DESC, status)
    const batch = await db.query({
      ...query,
      cursor,
      limit: batchSize
    });

    if (batch.length === 0) break;

    // MEMORY_OPTIMIZATION: 즉시 처리 후 해제
    for (const item of batch) {
      yield processItem(item);
    }

    cursor = batch[batch.length - 1].id;
  }
}

// CACHING_STRATEGY: 다층 캐싱
// L1: 메모리 (LRU, 100 항목, 1분)
// L2: Redis (10분)
// L3: 데이터베이스
// INVALIDATION: 이벤트 기반 즉시 무효화
const cachedData = await this.multiLevelCache.get(key, async () => {
  // EXPENSIVE_OPERATION: 평균 500ms
  return await this.calculateComplexData(params);
});
```

## AI 친화적 주석 패턴

### 구조화된 메타데이터

```typescript
/**
 * @ai-context
 * PURPOSE: 실시간 알림 전송 시스템
 * TECHNOLOGIES: WebSocket, Redis Pub/Sub
 * SCALABILITY: 10K 동시 연결 지원
 * RELIABILITY: 메시지 전달 보장 (at-least-once)
 *
 * @ai-patterns
 * - Circuit Breaker: 외부 서비스 장애 대응
 * - Retry with Backoff: 일시적 실패 처리
 * - Message Queue: 비동기 처리 및 부하 분산
 *
 * @ai-dependencies
 * - notification.queue.ts: 메시지 큐 관리
 * - websocket.manager.ts: 연결 관리
 * - redis.pubsub.ts: 이벤트 버스
 *
 * @ai-gotchas
 * - WebSocket 재연결시 미전달 메시지 처리 필요
 * - Redis 연결 끊김시 로컬 큐 사용
 * - 메시지 순서 보장 안됨
 */
```

### 변경 이력 추적

```typescript
// CHANGE_HISTORY:
// 2024-01-15: 초기 구현 (basic CRUD)
// 2024-01-20: 권한 시스템 추가 (RBAC)
// 2024-02-01: 캐싱 레이어 추가 (성능 개선)
// 2024-02-15: 이벤트 시스템 통합 (느슨한 결합)
// NEXT_PLANNED: 2024-03-01 - GraphQL 지원

// VERSION: 2.3.0
// BREAKING_CHANGES:
//   - 2.0.0: API 응답 형식 변경
//   - 2.2.0: 인증 토큰 형식 변경
// DEPRECATIONS:
//   - updateUserLegacy(): 2.4.0에서 제거 예정
```

## 주석 품질 체크리스트

### 좋은 주석의 기준

```yaml
필수 요소:
  - [ ] WHY: 코드가 존재하는 이유
  - [ ] CONTEXT: 관련 배경 정보
  - [ ] GOTCHAS: 주의사항
  - [ ] EXAMPLES: 사용 예시

품질 지표:
  - [ ] 코드 없이도 의도 파악 가능
  - [ ] 미래의 나/동료가 이해 가능
  - [ ] AI가 맥락 이해 가능
  - [ ] 변경시 함께 업데이트됨

피해야 할 것:
  - [ ] 코드를 그대로 설명하는 주석
  - [ ] 오래된/틀린 정보
  - [ ] 모호한 설명
  - [ ] TODO without deadline
```

## SuperClaude 주석 명령어

```bash
# 파일 레벨 주석 생성
/generate file-comment --comprehensive --ai-friendly

# 복잡한 함수 주석 추가
/document function --algorithm --complexity --examples

# WHY 주석 자동 생성
/add-why-comments --based-on-git-history

# 결정사항 문서화
/document-decision --adr-format --link-code

# 성능 주석 추가
/add-performance-notes --with-benchmarks

# AI 컨텍스트 생성
/generate ai-context --patterns --dependencies

# 주석 품질 검사
/check-comment-quality --fix-outdated

# 변경 이력 업데이트
/update-change-history --from-commits
```

이러한 체계적인 주석 표준을 통해 코드 자체가 살아있는 문서가 되고, AI가 프로젝트를 깊이 이해할 수 있게 됩니다.
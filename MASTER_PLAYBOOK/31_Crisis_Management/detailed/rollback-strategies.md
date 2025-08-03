# 안전한 롤백 전략

## 🔄 롤백의 핵심 원칙

> "롤백은 실패가 아니라 현명한 선택이다"

### 언제 롤백해야 하는가?
- ✅ 새로운 에러가 기존 에러보다 많을 때
- ✅ 핵심 기능이 완전히 작동 불가할 때  
- ✅ 데이터 손실 위험이 있을 때
- ✅ 수정 시간이 예상보다 3배 이상 걸릴 때
- ✅ 팀 전체가 블로킹된 상황일 때

## 🛡️ 안전한 롤백 체크리스트

### 롤백 전 필수 확인사항
```bash
# 1. 현재 상태 백업
git stash push -m "BEFORE_ROLLBACK_$(date +%Y%m%d_%H%M%S)"

# 2. 롤백 대상 확인
git log --oneline -10
git show --stat HEAD~1  # 이전 커밋 내용 확인

# 3. 데이터베이스 마이그레이션 확인
# 스키마 변경이 있었다면 별도 처리 필요
npm run db:migrations:status
```

### 단계별 롤백 프로세스

#### 1단계: 코드 롤백
```bash
# 방법 1: 단순 이전 커밋으로
git reset --hard HEAD~1

# 방법 2: 특정 커밋으로 (더 안전)
git reset --hard <commit-hash>

# 방법 3: 새 커밋으로 롤백 (이력 보존)
git revert HEAD
```

#### 2단계: 의존성 롤백
```bash
# package.json 변경사항이 있다면
npm ci  # package-lock.json 기준으로 재설치

# 또는 특정 시점의 node_modules 복원
rm -rf node_modules
git checkout HEAD~1 -- package-lock.json
npm ci
```

#### 3단계: 환경 설정 롤백
```bash
# 환경 변수 변경사항 확인
git show HEAD~1 -- .env.example
git show HEAD~1 -- next.config.js

# 필요시 설정 파일 복원
git checkout HEAD~1 -- next.config.js
```

#### 4단계: 데이터베이스 롤백
```bash
# 마이그레이션 롤백 (Prisma 예시)
npx prisma migrate reset

# 또는 특정 마이그레이션으로 롤백
npx prisma migrate resolve --rolled-back <migration-name>

# 백업에서 복원 (최후의 수단)
psql mydb < backup_20231201_1430.sql
```

## 🎯 롤백 시나리오별 가이드

### 시나리오 1: TypeScript 에러 폭발
```bash
# 상황: 1000+ 에러 발생, 빌드 불가
# 판단: 30분 내 해결 불가능

# 즉시 롤백
git log --oneline -5
git reset --hard HEAD~2  # 안전한 지점으로

# 확인
npm run build
# 성공하면 롤백 완료

# 별도 브랜치에서 수정 작업
git checkout -b hotfix/typescript-errors
```

### 시나리오 2: 배포 실패 연속
```bash
# 상황: Vercel/Netlify 배포 연속 실패
# 판단: 프로덕션 영향 심각

# 1. 로컬에서 프로덕션 빌드 테스트
npm run build
npm run start

# 실패하면 즉시 롤백
git reset --hard <last-working-commit>

# 2. 배포 플랫폼에서도 롤백
vercel rollback  # 또는 대시보드에서 수동 롤백
```

### 시나리오 3: 데이터 마이그레이션 실패
```bash
# 상황: 데이터 변환 중 오류 발생
# 판단: 데이터 손실 위험

# ⚠️ 매우 신중하게 진행
# 1. 즉시 쓰기 작업 중단
# 2. 백업 확인
ls -la backups/ | head -5

# 3. 안전한 복원
# 먼저 테스트 환경에서 검증
mongorestore --db test_db backups/latest/

# 검증 후 프로덕션 복원
mongorestore --db prod_db backups/latest/
```

### 시나리오 4: 성능 급격 저하
```bash
# 상황: 응답시간 10배 증가
# 판단: 사용자 경험 심각 훼손

# 1. 성능 영향 커밋 찾기
git log --oneline --since="1 day ago"

# 2. 의심 커밋 제거
git revert <performance-degrading-commit>

# 3. 즉시 배포
npm run build && npm run deploy
```

## 🔍 스마트 롤백 도구

### 자동 롤백 판단 스크립트
```bash
#!/bin/bash
# smart-rollback-check.sh

# 현재 에러 수 확인
CURRENT_ERRORS=$(npm run build 2>&1 | grep -c "Error")
LAST_KNOWN_ERRORS=$(cat .last-error-count 2>/dev/null || echo "0")

echo "Current errors: $CURRENT_ERRORS"
echo "Previous errors: $LAST_KNOWN_ERRORS"

# 에러가 3배 이상 증가하면 롤백 권장
if [ $CURRENT_ERRORS -gt $((LAST_KNOWN_ERRORS * 3)) ]; then
  echo "🚨 ROLLBACK RECOMMENDED: Error count increased significantly"
  echo "Run 'git reset --hard HEAD~1' to rollback"
  exit 1
fi

# 성공하면 현재 에러 수 저장
echo $CURRENT_ERRORS > .last-error-count
```

### 롤백 영향 분석기
```typescript
// scripts/rollback-impact-analyzer.ts
import * as fs from 'fs';
import { execSync } from 'child_process';

interface RollbackImpact {
  filesChanged: string[];
  linesChanged: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

function analyzeRollbackImpact(targetCommit: string): RollbackImpact {
  // Git diff 분석
  const diffOutput = execSync(`git diff ${targetCommit}..HEAD --stat`, { encoding: 'utf8' });
  const files = diffOutput.split('\n').filter(line => line.includes('|'));
  
  // 변경된 파일들 분석
  const criticalFiles = files.filter(file => 
    file.includes('package.json') || 
    file.includes('migration') ||
    file.includes('config')
  );
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  const recommendations: string[] = [];
  
  if (criticalFiles.length > 0) {
    riskLevel = 'high';
    recommendations.push('Check database migrations');
    recommendations.push('Verify dependency changes');
  }
  
  if (files.length > 10) {
    riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    recommendations.push('Consider partial rollback');
  }
  
  return {
    filesChanged: files.map(f => f.split('|')[0].trim()),
    linesChanged: files.length,
    riskLevel,
    recommendations
  };
}

// 사용 예시
const impact = analyzeRollbackImpact('HEAD~3');
console.log('Rollback Impact Analysis:', impact);
```

## 📋 롤백 후 체크리스트

### 즉시 확인 (5분 내)
- [ ] 애플리케이션 정상 시작
- [ ] 핵심 기능 동작 확인
- [ ] 데이터베이스 연결 확인
- [ ] API 엔드포인트 응답 확인

### 기능 검증 (30분 내)
- [ ] 사용자 인증/로그인
- [ ] 주요 CRUD 기능
- [ ] 외부 API 연동
- [ ] 이메일/알림 발송

### 데이터 정합성 (1시간 내)
- [ ] 중요 데이터 손실 없음
- [ ] 관계형 데이터 일관성
- [ ] 캐시 동기화 상태
- [ ] 백업 데이터와 비교

## 🎓 롤백 베스트 프랙티스

### 예방적 롤백 지점 생성
```bash
# 중요한 작업 전 체크포인트 생성
git tag -a checkpoint-$(date +%Y%m%d_%H%M%S) -m "Safe rollback point"

# 주요 마일스톤마다 태그 생성
git tag -a v1.2.3-stable -m "Production ready version"
```

### 자동 롤백 트리거
```yaml
# .github/workflows/auto-rollback.yml
name: Auto Rollback on Critical Failure
on:
  deployment_status:
jobs:
  check-and-rollback:
    if: github.event.deployment_status.state == 'failure'
    runs-on: ubuntu-latest
    steps:
      - name: Rollback on critical failure
        run: |
          # 자동 롤백 로직
          gh api repos/:owner/:repo/deployments/:deployment_id/statuses \
            --method POST \
            --field state=error \
            --field description="Auto-rollback triggered"
```

### 팀 커뮤니케이션 템플릿
```
🔄 롤백 완료 보고

시간: [MM/DD HH:MM]
롤백 대상: [커밋 해시/버전]
원인: [간단한 설명]
영향 범위: [기능/데이터]
현재 상태: [정상/부분복구]

후속 조치:
- [ ] 원인 분석
- [ ] 별도 브랜치에서 수정
- [ ] 테스트 강화

롤백 시점: [커밋 해시]
복구 시간: [X분]
```

## 💡 롤백 철학

### 언제 롤백하지 말아야 하는가?
- 단순히 어려워서 (학습 기회 상실)
- 자존심 때문에 (팀워크 저해)
- 시간이 아까워서 (더 큰 손실 가능)

### 롤백의 가치
1. **시간 절약**: 2시간 고민 < 10분 롤백 + 30분 재작업
2. **리스크 감소**: 확실하지 않은 수정보다 확실한 롤백
3. **팀 보호**: 개인의 실수가 팀 전체를 블로킹하지 않게
4. **학습 기회**: 안전한 환경에서 다시 시도 가능

---

*"롤백은 패배가 아니라 전략적 후퇴다. 한 발 뒤로 물러서서 두 발 앞으로 나아가는 것이다."*
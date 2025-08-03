# 긴급 대응 프로토콜

## 🚨 위기 발생 시 5분 체크리스트

### Phase 1: 상황 파악 (1분)
```bash
# 즉시 실행
git status
npm run build 2>&1 | head -20  # 주요 에러만 확인
ps aux | grep node              # 실행 중인 프로세스
```

**질문 체크리스트**:
- [ ] 언제부터 문제가 시작되었나?
- [ ] 마지막 성공한 상태는 언제인가?
- [ ] 최근 변경사항은 무엇인가?
- [ ] 영향 범위는 어디까지인가?

### Phase 2: 즉시 대응 (2분)

#### 🔴 Critical 레벨 대응
```bash
# 1. 즉시 이전 상태로 복구
git log --oneline -5
git checkout HEAD~1  # 또는 마지막 성공 커밋

# 2. 서비스 재시작
pm2 restart all
# 또는
vercel --prod  # 이전 배포로 rollback
```

#### 🟠 High 레벨 대응
```bash
# 1. 에러 로그 수집
npm run build 2> error.log
tail -100 error.log

# 2. 임시 우회 방법
# 예시: 문제 컴포넌트 비활성화
sed -i 's/import.*ProblematicComponent.*//g' src/pages/*.tsx
```

### Phase 3: 통신 및 백업 (2분)

#### 팀 통신 템플릿
```
🚨 긴급 상황 보고

레벨: [Critical/High/Medium]
발생 시간: [MM/DD HH:MM]
영향 범위: [전체/부분/기능명]
추정 원인: [간단히]
임시 조치: [완료/진행중]
예상 복구: [시간]

상세 로그: [첨부 또는 링크]
```

#### 데이터 백업
```bash
# 1. 현재 상태 백업
git stash push -m "CRISIS_BACKUP_$(date +%Y%m%d_%H%M%S)"

# 2. 데이터베이스 백업 (해당 시)
mongodump --db mydb --out backup_$(date +%Y%m%d_%H%M%S)
# 또는
pg_dump mydb > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🔥 위기 유형별 즉시 대응

### TypeScript 폭발 (1000+ 에러)
```bash
# 1. 즉시 완화
echo '{ "compilerOptions": { "noEmit": true, "skipLibCheck": true } }' > tsconfig.temp.json
mv tsconfig.json tsconfig.backup.json
mv tsconfig.temp.json tsconfig.json

# 2. 빌드 확인
npm run build

# 3. 주요 에러만 집중
npm run build 2>&1 | grep -E "(error|Error)" | head -10
```

### 배포 실패 연속 발생
```bash
# 1. 로컬에서 프로덕션 빌드 테스트
npm run build
npm run start

# 2. 환경 변수 확인
printenv | grep -E "(NODE_ENV|API_URL|DATABASE)"

# 3. 의존성 문제 확인
npm ci  # package-lock.json 기준으로 재설치
```

### 데이터 손실 위험
```bash
# 1. 즉시 쓰기 차단 (가능한 경우)
# API 레벨에서 read-only 모드 활성화

# 2. 최근 백업 확인
ls -la backups/ | head -5

# 3. 문제 범위 파악
# 데이터베이스 쿼리로 영향받은 레코드 확인
```

### 성능 급격한 저하
```bash
# 1. 리소스 사용량 확인
top
df -h  # 디스크 공간
free -m  # 메모리

# 2. 느린 쿼리 확인 (DB에 따라)
# MySQL: SHOW PROCESSLIST;
# PostgreSQL: SELECT * FROM pg_stat_activity;

# 3. 최근 배포 롤백
git log --oneline --since="1 day ago"
```

## 🛡️ 재발 방지 프로토콜

### 즉시 구현할 모니터링
```javascript
// 1. 에러 트래킹 추가
try {
  // 위험한 코드
} catch (error) {
  console.error('CRISIS_LOG:', error);
  // 알림 서비스로 전송
}

// 2. 성능 모니터링
console.time('critical_operation');
// 작업 실행
console.timeEnd('critical_operation');
```

### 자동 백업 스크립트
```bash
#!/bin/bash
# auto-backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
git stash push -m "AUTO_BACKUP_$DATE"
npm run build > build_log_$DATE.txt 2>&1
echo "Backup completed: $DATE"
```

### 알림 설정
```bash
# GitHub Actions에서 실패 시 즉시 알림
- name: Notify on failure
  if: failure()
  run: |
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚨 Build failed in production!"}' \
    $SLACK_WEBHOOK_URL
```

## 📊 위기 대응 체크리스트

### ✅ 즉시 확인 (5분 내)
- [ ] 에러 메시지 스크린샷 저장
- [ ] 마지막 성공 상태 시점 파악
- [ ] 영향 범위 확인 (전체/부분)
- [ ] 팀에 상황 공유

### ✅ 임시 조치 (30분 내)
- [ ] 이전 버전으로 롤백
- [ ] 문제 컴포넌트 비활성화
- [ ] 데이터 백업 완료
- [ ] 서비스 안정성 확인

### ✅ 근본 해결 (24시간 내)
- [ ] 원인 분석 완료
- [ ] 테스트 케이스 추가
- [ ] 모니터링 강화
- [ ] 문서화 및 공유

## 🎯 성공 지표

- **대응 속도**: 5분 내 임시 조치
- **복구 시간**: 30분 내 서비스 정상화
- **재발 방지**: 동일 위기 재발률 < 5%
- **팀 스트레스**: 체계적 대응으로 panic 방지

---

*"위기 대응은 속도가 아니라 정확성이다. 5분의 체계적 대응이 1시간의 무분별한 시도보다 낫다."*
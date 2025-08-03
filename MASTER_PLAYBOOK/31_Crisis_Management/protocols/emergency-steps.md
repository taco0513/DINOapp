# Emergency Protocol (150토큰)

## 🔴 5분 내 실행

### 1. 상황 고정 (1분)
```bash
# 현재 상태 캡처
git stash
git branch emergency-$(date +%s)
screenshot errors
```

### 2. 서비스 유지 (2분)
```bash
# 이전 버전 롤백
git checkout last-working-commit
npm run deploy:emergency

# 또는 기능 비활성화
export FEATURE_FLAGS=safe-mode
```

### 3. 원인 격리 (2분)
```bash
# 최근 변경사항 확인
git log --oneline -10
git diff HEAD~1

# 에러 패턴 분석
@tools/error-analyzer
```

## 🟠 추가 조치 (필요시)
- [ ] 사용자 공지
- [ ] 모니터링 강화
- [ ] 로그 보존

## 🔄 복구 시작
안정화 확인 → @detailed/recovery-plan
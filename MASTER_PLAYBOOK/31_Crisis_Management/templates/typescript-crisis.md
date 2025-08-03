# TypeScript Crisis Template (100토큰)

## 상황
- 에러 수: [1000+]
- 영향: [빌드 불가]
- 시도: [수동 수정 실패]

## 즉시 실행
```bash
# 1. 에러 분석
npx tsc --noEmit > errors.log
cat errors.log | grep "error TS" | cut -d: -f1 | sort | uniq -c

# 2. 자동 수정
@tools/fix-typescript --batch

# 3. 임시 우회
echo '{"strict": false}' > tsconfig.override.json
```

## 단계별 해결
1. [ ] Import 에러 → esModuleInterop
2. [ ] Type 에러 → any 임시 허용
3. [ ] Property 에러 → interface 확장

30분 내 미해결시 → @protocols/rollback
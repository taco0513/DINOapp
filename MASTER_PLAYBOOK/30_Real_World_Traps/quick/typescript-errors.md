# TypeScript Errors Fix (200토큰)

## 대량 에러 분류 (1분)
```bash
# 에러 타입별 분류
npx tsc --noEmit | grep error | sort | uniq -c

# Top 3 확인
1. Cannot find module → @fix/imports
2. Type 'X' is not assignable → @fix/types  
3. Property does not exist → @fix/properties
```

## Import 에러 (80% 경우)
```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

## 빠른 수정
```bash
# 자동 수정 시도
@scripts/fix-types --auto

# 일시적 억제
// @ts-ignore (긴급시만)
// @ts-expect-error (더 나음)
```

## 점진적 해결
1. any 허용 → strict: false
2. 파일별 수정 → // @ts-check
3. 완료 후 → strict: true

대량 에러시 → @detailed/typescript-migration
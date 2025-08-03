# Testing/QA Quick Reference (250토큰)

## 핵심 개념 (50토큰)
- 테스트 피라미드: Unit(70%) > Integration(20%) > E2E(10%)
- 목표: 빠른 피드백, 안정적 실행, 높은 커버리지

## 즉시 사용 (100토큰)
```bash
# Jest 기본 설정
npm i -D jest @types/jest ts-jest
npx ts-jest config:init

# 첫 테스트
test('adds 1 + 2', () => {
  expect(1 + 2).toBe(3)
})

# 실행
npm test
```

## 주의사항 (50토큰)
⚠️ Mock 과도 사용 금지
⚠️ 비동기 테스트 await 필수
⚠️ 테스트 격리 유지

## 더 필요하면 (50토큰)
- Mock 설계 → @09_Testing/07_Mock_Architecture
- SSR 테스트 → @09_Testing/09_SSR_Testing
- E2E 전략 → @09_Testing/04_E2E_Testing
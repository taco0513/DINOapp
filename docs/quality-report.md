# 📊 문서 품질 보고서

> 🤖 자동 생성된 보고서 - 2025. 7. 29. 오후 8:37:12

## 🎯 종합 평가

**전체 점수: 58%** ❌

| 항목           | 점수 | 가중치 | 상태 |
| -------------- | ---- | ------ | ---- |
| JSDoc 커버리지 | 12%  | 30%    | ❌   |
| 문서 완성도    | 69%  | 30%    | ❌   |
| 링크 유효성    | 86%  | 20%    | ❌   |
| 코드 예제      | 83%  | 20%    | ✅   |

## 📝 JSDoc 커버리지

- **함수:** 88/601개 문서화
- **클래스:** 4/56개 문서화
- **인터페이스:** 15/222개 문서화

## 📚 문서 완성도

- **완성된 문서:** 44/64개
- **주요 이슈:** 127개

### 개선 필요 항목

- 참조 링크가 없음: 38건
- 긴 문서에 목차가 없음: 40건
- 마지막 업데이트 날짜가 없음: 44건
- 코드 예제가 없음: 1건
- 주제목(H1)이 없음: 1건
- 내용이 너무 짧음 (< 200자): 1건
- 충분한 섹션 구조가 없음: 2건

## 🔗 링크 유효성

- **유효한 링크:** 287/332개

### 유효하지 않은 링크

- [`
/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/gi,
/(UNION|OR|AND)\s+\d+\s*=\s*\d+/gi,
/['";`](\s\*) in docs/SECURITY_AUTHENTICATION.md
- [`WireframeTripCard.tsx`](./auto-components.md#wireframetripcardtsx) in docs/code/index.md
- [`WireframeTripForm.tsx`](./auto-components.md#wireframetripformtsx) in docs/code/index.md
- [`AIAssistant.tsx`](./auto-components.md#aiassistanttsx) in docs/code/index.md
- [`AIPairProgramming.tsx`](./auto-components.md#aipairprogrammingtsx) in docs/code/index.md
- [`CodeGenerator.tsx`](./auto-components.md#codegeneratortsx) in docs/code/index.md
- [`route.ts`](./auto-apis.md#routets) in docs/code/index.md
- [`route.ts`](./auto-apis.md#routets-1) in docs/code/index.md
- [`route.ts`](./auto-apis.md#routets-2) in docs/code/index.md
- [`route.ts`](./auto-apis.md#routets-3) in docs/code/index.md
- ... 및 35개 추가

## 💻 코드 예제

- **예제 포함 문서:** 53/64개
- **총 예제 수:** 794개

## 🔧 개선 권장사항

### JSDoc 커버리지 개선

- 문서화되지 않은 함수들에 JSDoc 주석 추가
- 매개변수와 반환값에 대한 설명 보완
- 예제 코드 포함 고려

### 문서 완성도 개선

- 짧은 문서들의 내용 보완
- 적절한 섹션 구조 추가
- 긴 문서에 목차 추가

### 링크 유효성 개선

- 깨진 링크 수정
- 상대 경로 링크 정확성 확인
- 외부 링크 정기 점검

---

📅 **생성일:** 2025. 7. 29. 오후 8:37:12
🔧 **생성 스크립트:** `scripts/docs/doc-quality-check.js`

# 🌍 국가 데이터 중앙 관리 시스템

## 개요

DINO 프로젝트의 모든 국가 관련 데이터는 `/constants/countries.ts`에서 중앙 관리됩니다. 하드코딩된 국가 목록을 방지하고 일관성 있는 데이터 사용을 보장합니다.

## 핵심 구성 요소

### 1. Country 인터페이스

```typescript
interface Country {
  code: string; // ISO 3166-1 alpha-2 코드 (예: 'KR', 'DE')
  name: string; // 한국어 국가명
  flag: string; // 국기 이모지
  schengen?: boolean; // 셰겐 지역 가입 여부
  continent?: string; // 대륙 분류
  englishName?: string; // 영어 국가명
}
```

### 2. 데이터 배열

```typescript
// 전체 국가 목록 (80개국+)
export const COUNTRIES: Country[];

// 셰겐 국가만 필터링 (26개국)
export const SCHENGEN_COUNTRIES: Country[];
```

### 3. 유틸리티 함수

```typescript
export const CountryUtils = {
  // 기본 검색
  getCountryByCode(code: string): Country | undefined
  getCountryByName(name: string): Country | undefined

  // 셰겐 관련
  isSchengenCountry(countryCode: string): boolean
  getSchengenCountryOptions(): SelectOption[]
  getSchengenCountryNames(): string
  getSchengenCountryCount(): number

  // UI 옵션
  getAllCountryOptions(): SelectOption[]
  getCountriesByContinent(continent: string): Country[]
}
```

## 사용법

### 1. 셰겐 국가 드롭다운 만들기

```typescript
import { CountryUtils } from '@/constants/countries'

// 기존 (하드코딩) - ❌ 사용 금지
<option value="France">🇫🇷 프랑스</option>
<option value="Germany">🇩🇪 독일</option>

// 새로운 방식 (중앙 관리) - ✅ 권장
{CountryUtils.getSchengenCountryOptions().map(option => (
  <option key={option.code} value={option.value}>
    {option.label}
  </option>
))}
```

### 2. 국가 정보 검증

```typescript
import { CountryUtils } from '@/constants/countries';

// 셰겐 국가 여부 확인
if (CountryUtils.isSchengenCountry('DE')) {
  // 독일은 셰겐 국가입니다
}

// 국가 정보 조회
const country = CountryUtils.getCountryByCode('FR');
console.log(country?.name); // "프랑스"
```

### 3. 문서에서 국가 목록 표시

```typescript
// 셰겐 국가 이름 문자열 생성
const schengenNames = CountryUtils.getSchengenCountryNames();
// "그리스, 네덜란드, 노르웨이, 독일, ..."
```

## 실제 적용 사례

### 1. 셰겐 계산기 (`/app/schengen/page.tsx`)

```typescript
// Before: 하드코딩된 10개 옵션
<option value="France">🇫🇷 프랑스</option>
// ...

// After: 동적으로 생성된 26개 옵션
{CountryUtils.getSchengenCountryOptions().map(option => (
  <option key={option.code} value={option.value}>
    {option.label}
  </option>
))}
```

### 2. 문서화 (`/docs/pages/schengen.md`)

```markdown
<!-- Before: 수동으로 관리하는 목록 -->

### 셰겐 지역 국가 (26개국)

오스트리아, 벨기에, 체코, ...

<!-- After: 중앙 관리 참조 -->

📋 **데이터 관리**: 모든 셰겐 국가 정보는 `/constants/countries.ts`에서 중앙 관리됩니다.

- `CountryUtils.getSchengenCountryNames()`: 모든 셰겐 국가명 반환
```

## 확장 가능성

### 1. 새로운 국가 추가

```typescript
// COUNTRIES 배열에 추가
{
  code: 'IS',
  name: '아이슬란드',
  flag: '🇮🇸',
  schengen: true,
  continent: 'Europe',
  englishName: 'Iceland'
}
```

### 2. 새로운 필드 추가

```typescript
interface Country {
  // 기존 필드들...
  visaFree?: boolean; // 무비자 입국 가능 여부
  timeZone?: string; // 시간대
  currency?: string; // 통화 코드
}
```

### 3. 새로운 유틸리티 함수

```typescript
export const CountryUtils = {
  // 기존 함수들...

  // 무비자 국가 목록
  getVisaFreeCountries: () => {
    return COUNTRIES.filter(country => country.visaFree === true);
  },

  // 통화별 국가 분류
  getCountriesByCurrency: (currency: string) => {
    return COUNTRIES.filter(country => country.currency === currency);
  },
};
```

## 마이그레이션 체크리스트

기존 하드코딩된 국가 목록을 발견했을 때:

- [ ] 해당 파일에 `import { CountryUtils } from '@/constants/countries'` 추가
- [ ] 하드코딩된 옵션들을 `CountryUtils.getSchengenCountryOptions()` 등으로 교체
- [ ] 국가 검증 로직을 `CountryUtils.isSchengenCountry()` 등으로 교체
- [ ] 테스트 실행하여 기능 정상 작동 확인
- [ ] 문서 업데이트 (중앙 관리 참조 추가)

## 성능 고려사항

### 1. 메모이제이션

```typescript
// 자주 사용되는 옵션들은 메모이제이션 적용
const schengenOptions = useMemo(
  () => CountryUtils.getSchengenCountryOptions(),
  []
);
```

### 2. 트리 쉐이킹

```typescript
// 필요한 함수만 import
import { CountryUtils } from '@/constants/countries';

// 전체 배열 import는 피하기 (번들 크기 증가)
// import { COUNTRIES } from '@/constants/countries' // ❌
```

## 품질 보증

### 1. 데이터 검증

- 모든 셰겐 국가가 정확히 26개인지 확인
- ISO 3166-1 alpha-2 코드 표준 준수
- 중복된 국가 코드 없음

### 2. 테스트

```typescript
// 예시 테스트
describe('CountryUtils', () => {
  test('셰겐 국가 개수는 26개', () => {
    expect(CountryUtils.getSchengenCountryCount()).toBe(26);
  });

  test('독일은 셰겐 국가', () => {
    expect(CountryUtils.isSchengenCountry('DE')).toBe(true);
  });
});
```

### 3. 문서 일관성

- 모든 문서의 셰겐 국가 목록이 동일
- 새로운 국가 추가 시 관련 문서 자동 업데이트

## 관련 파일

### 핵심 파일

- `/constants/countries.ts` - 중앙 관리 시스템
- `/types/global.ts` - Country 타입 정의

### 사용 파일들

- `/app/schengen/page.tsx` - 셰겐 계산기
- `/components/visa/QuickVisaCheck.tsx` - 비자 조회
- `/docs/pages/schengen.md` - 셰겐 문서
- `/docs/user/troubleshooting.md` - 문제 해결 가이드

### 문서 파일들

- `/docs/developer/country-data-management.md` - 이 문서
- `/docs/pages/index.md` - 페이지 인덱스

이 중앙 관리 시스템을 통해 데이터 일관성을 보장하고 유지보수 비용을 크게 줄일 수 있습니다.

# 🛡️ Zero Hardcoding - 하드코딩 완전 방지 전략

## 📋 개요

하드코딩된 문자열을 원천적으로 차단하는 다층 방어 시스템입니다. TypeScript, ESLint, Git Hooks, Runtime Detection을 통합하여 하드코딩이 불가능한 개발 환경을 구축합니다.

## 🎯 핵심 원칙

1. **Prevention First**: 하드코딩이 발생하기 전에 차단
2. **Developer Friendly**: 개발자 경험을 해치지 않으면서 강제
3. **Automated Detection**: 수동 검사 없이 자동으로 감지
4. **Continuous Monitoring**: 개발부터 프로덕션까지 지속적 감시

## 🔧 1. TypeScript 타입 시스템 방어

### 기본 타입 가드

```typescript
// types/i18n.ts
type NoHardcodedString<T> = T extends string
  ? T extends `t('${string}')`
    ? T
    : never
  : T;

// 컴포넌트 Props에 적용
interface ButtonProps {
  label: NoHardcodedString<string>;
  tooltip?: NoHardcodedString<string>;
}

// ❌ 컴파일 에러
<Button label="저장" />

// ✅ 정상 작동
<Button label={t('common.save')} />
```

### 고급 타입 시스템

```typescript
// 번역 키 자동 완성을 위한 타입 생성
type TranslationKeys =
  | 'common.save'
  | 'common.cancel'
  | 'user.profile.title'
  | 'user.profile.edit';

// 타입 안전한 t 함수
export function t<K extends TranslationKeys>(
  key: K,
  params?: Record<string, string | number>
): string {
  // 구현
}

// IDE에서 자동 완성 지원
t('common.'); // → save, cancel 자동 완성
```

## 🚨 2. ESLint 플러그인 설정

### 커스텀 ESLint 룰

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['@ai-workflow/i18n'],
  rules: {
    // 사용자에게 보이는 문자열 검사
    '@ai-workflow/i18n/no-literal-string': [
      'error',
      {
        markupOnly: true,
        ignoreAttribute: ['data-testid', 'className', 'id', 'name', 'type'],
        message: 'Use t() function for user-facing strings',
        // 한글, 영어, 일본어, 중국어 등 감지
        pattern:
          /[\u3131-\uD79D\u0041-\u005A\u0061-\u007A\u3040-\u309F\u4E00-\u9FAF]/,
      },
    ],

    // t() 함수 사용했지만 키가 없는 경우
    '@ai-workflow/i18n/no-missing-keys': 'error',

    // 중복된 번역 키 방지
    '@ai-workflow/i18n/no-duplicate-keys': 'error',
  },
};
```

### 실시간 피드백

```typescript
// VSCode에서 실시간 경고 표시
function MyComponent() {
  return (
    <div>
      {/* 빨간 밑줄과 함께 경고 표시 */}
      <h1>Welcome</h1>

      {/* 정상 */}
      <h1>{t('home.welcome')}</h1>
    </div>
  );
}
```

## 🔄 3. Git Hooks 자동화

### Pre-commit Hook 설정

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "npm run check:i18n",
      "npm run extract:i18n"
    ]
  }
}
```

### 자동 i18n 키 추출

```javascript
// scripts/extract-i18n.js
const scanner = require('i18n-scanner');
const fs = require('fs');

// 코드에서 t() 함수 사용 추출
const results = scanner.scan({
  input: ['src/**/*.{ts,tsx}'],
  func: {
    list: ['t', 'i18n.t'],
  },
});

// 누락된 키 감지
const missingKeys = findMissingKeys(results);
if (missingKeys.length > 0) {
  console.error('Missing translation keys:', missingKeys);
  process.exit(1);
}
```

## 👁️ 4. Runtime Detection

### 개발 환경 실시간 감지

```typescript
// lib/i18n-detector.ts
if (process.env.NODE_ENV === 'development') {
  // React createElement 후킹
  const originalCreateElement = React.createElement;

  React.createElement = function (...args: any[]) {
    const [type, props, ...children] = args;

    // 텍스트 노드 검사
    children.forEach(child => {
      if (typeof child === 'string' && isUserFacingText(child)) {
        console.error(
          `🚨 Hardcoded text detected: "${child}"\n` +
            `Component: ${type.name || type}\n` +
            `Use t() function instead`
        );

        // 개발자 도구에 하이라이트
        if (typeof window !== 'undefined') {
          window.__HARDCODED_TEXTS__ = [
            ...(window.__HARDCODED_TEXTS__ || []),
            { text: child, component: type.name },
          ];
        }
      }
    });

    return originalCreateElement.apply(React, args);
  };
}

// 사용자에게 보이는 텍스트인지 판단
function isUserFacingText(text: string): boolean {
  // 공백만 있는 경우 제외
  if (!text.trim()) return false;

  // 숫자만 있는 경우 제외
  if (/^\d+$/.test(text)) return false;

  // URL, 이메일 제외
  if (/^https?:\/\/|@/.test(text)) return false;

  // 실제 단어가 포함된 경우
  return /[a-zA-Z가-힣ぁ-ゔァ-ヴー一-龯]/.test(text);
}
```

### Visual Highlighting

```typescript
// Chrome Extension 또는 개발 도구 통합
function highlightHardcodedTexts() {
  const elements = document.querySelectorAll('*');

  elements.forEach(el => {
    if (
      el.childNodes.length === 1 &&
      el.childNodes[0].nodeType === Node.TEXT_NODE
    ) {
      const text = el.textContent || '';

      if (isUserFacingText(text)) {
        // 빨간 테두리로 표시
        el.style.outline = '2px solid red';
        el.style.outlineOffset = '2px';

        // 호버 시 경고 메시지
        el.title = `⚠️ Hardcoded text: Use t('${generateKey(text)}')`;

        // 클릭 시 자동 수정 제안
        el.addEventListener('click', () => {
          console.log(`Suggested: t('${generateKey(text)}')`);
          navigator.clipboard.writeText(`t('${generateKey(text)}')`);
        });
      }
    }
  });
}

// 텍스트에서 i18n 키 자동 생성
function generateKey(text: string): string {
  // "Save Document" → "common.saveDocument"
  return (
    'common.' +
    text
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '')
  );
}
```

## 🏭 5. CI/CD 파이프라인 통합

### GitHub Actions 설정

```yaml
# .github/workflows/i18n-check.yml
name: i18n Hardcoding Check

on: [pull_request]

jobs:
  check-hardcoding:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint i18n checks
        run: npm run lint:i18n

      - name: Check for hardcoded strings
        run: |
          # 정규식으로 하드코딩 검사
          ! grep -r --include="*.tsx" --include="*.ts" \
            -E '(>|=")[가-힣a-zA-Z\s]+("|<)' \
            src/

      - name: Validate translation coverage
        run: npm run i18n:coverage

      - name: Generate i18n report
        if: failure()
        run: |
          npm run i18n:report > i18n-report.txt
          echo "::error::Hardcoded strings detected. See i18n-report.txt"
```

## 📊 6. 모니터링 & 리포팅

### Sentry 통합

```typescript
// lib/i18n-monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function monitorHardcoding() {
  if (typeof window === 'undefined') return;

  // 주기적으로 DOM 검사
  setInterval(() => {
    const hardcodedElements = findHardcodedElements();

    if (hardcodedElements.length > 0) {
      Sentry.captureMessage('Hardcoded strings detected', {
        level: 'warning',
        extra: {
          count: hardcodedElements.length,
          samples: hardcodedElements.slice(0, 5).map(el => ({
            text: el.textContent,
            path: getElementPath(el),
          })),
        },
      });
    }
  }, 60000); // 1분마다 체크
}
```

### 대시보드 리포팅

```typescript
// i18n 커버리지 대시보드
interface I18nMetrics {
  totalStrings: number;
  translatedStrings: number;
  hardcodedStrings: number;
  coverage: number;
  untranslatedKeys: string[];
}

export async function generateI18nReport(): Promise<I18nMetrics> {
  const allStrings = await scanAllStrings();
  const translated = await getTranslatedStrings();
  const hardcoded = await detectHardcodedStrings();

  return {
    totalStrings: allStrings.length,
    translatedStrings: translated.length,
    hardcodedStrings: hardcoded.length,
    coverage: (translated.length / allStrings.length) * 100,
    untranslatedKeys: findUntranslatedKeys(),
  };
}
```

## 🎯 Best Practices

### 1. 컴포넌트 템플릿

```typescript
// 새 컴포넌트 생성 시 자동 적용
// npx create-component MyComponent

import { useTranslation } from '@/lib/i18n';

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('myComponent.title')}</h1>
      <p>{t('myComponent.description')}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}

// 자동 생성되는 번역 파일
// locales/en/myComponent.json
{
  "myComponent": {
    "title": "My Component",
    "description": "This is my component"
  }
}
```

### 2. 동적 텍스트 처리

```typescript
// 변수가 포함된 번역
t('user.welcome', { name: userName });
// → "Welcome, {name}!"

// 복수형 처리
t('items.count', { count: itemCount });
// → "1 item" or "5 items"

// 조건부 번역
t(isLoggedIn ? 'nav.logout' : 'nav.login');
```

## 🚀 구현 체크리스트

- [ ] TypeScript 타입 가드 설정
- [ ] ESLint 플러그인 설치 및 설정
- [ ] Pre-commit hooks 구성
- [ ] Runtime detection 스크립트 추가
- [ ] CI/CD 파이프라인 통합
- [ ] 모니터링 시스템 구축
- [ ] 팀 교육 및 문서화

---

_Zero Hardcoding: 하드코딩은 버그의 시작입니다. 처음부터 올바르게 시작하세요._

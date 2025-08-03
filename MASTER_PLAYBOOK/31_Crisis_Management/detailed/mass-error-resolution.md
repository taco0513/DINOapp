# 대량 에러 해결 전략

## 🌊 에러 쓰나미 생존 가이드

### 실전 사례: DINO 프로젝트
- **초기 상황**: 1,813개 TypeScript 에러
- **해결 결과**: 14일 후 0개 에러
- **핵심 전략**: 분류 → 우선순위 → 자동화

## 📊 에러 분류 시스템

### 1단계: 에러 수집 및 분류
```bash
# 전체 에러 로그 수집
npx tsc --noEmit > errors.log 2>&1
npm run lint >> errors.log 2>&1
npm run test >> errors.log 2>&1

# 에러 타입별 분류
cat errors.log | grep "error TS" | cut -d: -f4 | sort | uniq -c | sort -nr
```

**DINO 프로젝트 실제 분류 결과**:
```
812 Cannot find module
423 Type 'X' is not assignable to type 'Y'  
234 Property 'X' does not exist on type 'Y'
189 Expected X arguments, but got Y
155 Object is possibly 'undefined'
```

### 2단계: 영향도 매트릭스

| 에러 타입 | 개수 | 자동 수정 | 우선순위 | 해결 전략 |
|-----------|------|-----------|----------|-----------|
| Import/Module | 800+ | ✅ 가능 | 🔴 Critical | 스크립트 자동화 |
| Type 불일치 | 400+ | ⚠️ 부분 | 🟠 High | 템플릿 + 수동 |
| Property 누락 | 200+ | ✅ 가능 | 🟡 Medium | 인터페이스 생성 |
| Null/Undefined | 100+ | ✅ 가능 | 🟡 Medium | Optional chaining |

### 3단계: 우선순위 결정 알고리즘
```javascript
function calculatePriority(error) {
  let score = 0;
  
  // 빈도 점수 (40%)
  score += (error.count / totalErrors) * 40;
  
  // 자동 수정 가능성 (30%)
  score += error.autoFixable ? 30 : 0;
  
  // 블로킹 정도 (20%)
  score += error.blocking ? 20 : 0;
  
  // 확산 위험 (10%)
  score += error.cascading ? 10 : 0;
  
  return score;
}
```

## 🔧 단계별 해결 전략

### Phase 1: Critical 에러 일괄 해결 (1-3일)

#### Import/Module 에러 자동 수정
```typescript
// scripts/fix-imports.ts
import * as fs from 'fs';
import * as glob from 'glob';

const fixes = [
  // .js 확장자 누락
  {
    pattern: /from ['"](.+?)(?<!\.js)['"];?$/gm,
    replacement: (match: string, path: string) => {
      if (path.startsWith('.') && !path.includes('node_modules')) {
        return match.replace(path, `${path}.js`);
      }
      return match;
    }
  },
  
  // 상대 경로 → 절대 경로
  {
    pattern: /from ['"]\.\.\/(\.\.\/)+(.*?)['"];?/g,
    replacement: `from '@/$2';`
  },
  
  // CommonJS → ESM
  {
    pattern: /const (.+?) = require\(['"](.+?)['"]\);?/g,
    replacement: 'import $1 from "$2";'
  }
];

async function fixFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  fixes.forEach(fix => {
    const newContent = content.replace(fix.pattern, fix.replacement as any);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    // 백업 생성
    fs.writeFileSync(`${filePath}.backup`, fs.readFileSync(filePath));
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  }
}

// 실행
glob.sync('src/**/*.{ts,tsx}').forEach(fixFile);
```

#### 실행 결과 추적
```bash
# 수정 전 에러 수
echo "Before: $(npx tsc --noEmit 2>&1 | grep -c 'error TS')"

# 스크립트 실행
node scripts/fix-imports.js

# 수정 후 에러 수
echo "After: $(npx tsc --noEmit 2>&1 | grep -c 'error TS')"
```

### Phase 2: High Priority 에러 해결 (4-7일)

#### 타입 불일치 해결 전략
```typescript
// 1. 임시 타입 허용 (빠른 진행)
const data = apiResponse as any; // TODO: proper typing

// 2. 점진적 타입 정의
interface ApiResponse {
  status: 'success' | 'error';
  data?: any; // 일단 any로 시작
  error?: string;
}

// 3. 유틸리티 타입 활용
type PartialUser = Partial<User>;
type RequiredFields = Required<Pick<User, 'id' | 'name'>>;
```

#### 배치 타입 정의 생성기
```typescript
// scripts/generate-types.ts
async function generateTypesFromAPI() {
  const endpoints = ['/api/users', '/api/posts', '/api/settings'];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`);
      const data = await response.json();
      
      const typeName = endpoint.split('/').pop()!;
      const typeDefinition = generateTypeFromObject(data, typeName);
      
      fs.writeFileSync(`src/types/${typeName}.ts`, typeDefinition);
      console.log(`✅ Generated type for ${typeName}`);
    } catch (error) {
      console.log(`⚠️ Failed to generate type for ${endpoint}`);
    }
  }
}

function generateTypeFromObject(obj: any, name: string): string {
  const lines = [`export interface ${capitalize(name)} {`];
  
  for (const [key, value] of Object.entries(obj)) {
    const type = getTypeOfValue(value);
    lines.push(`  ${key}: ${type};`);
  }
  
  lines.push('}');
  return lines.join('\n');
}
```

### Phase 3: Medium Priority 일괄 해결 (8-12일)

#### Property 에러 해결 자동화
```typescript
// scripts/add-properties.ts
import * as ts from 'typescript';

function addMissingProperties(sourceFile: ts.SourceFile) {
  const missingProps = new Set<string>();
  
  // AST 순회하며 누락 속성 찾기
  function visit(node: ts.Node) {
    if (ts.isPropertyAccessExpression(node)) {
      // 속성 접근 체크
      const propertyName = node.name.text;
      missingProps.add(propertyName);
    }
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  
  // 인터페이스에 추가
  return Array.from(missingProps).map(prop => `  ${prop}?: any;`).join('\n');
}
```

### Phase 4: 마무리 및 검증 (13-14일)

#### 자동 테스트 추가
```typescript
// scripts/add-type-tests.ts
function generateTypeTests(interfaceName: string) {
  return `
import { ${interfaceName} } from '../types/${interfaceName.toLowerCase()}';

describe('${interfaceName} Type', () => {
  it('should have required properties', () => {
    const sample: ${interfaceName} = {
      // 필수 속성들...
    };
    expect(sample).toBeDefined();
  });
});
`;
}
```

## 📈 진행률 추적 시스템

### 자동 진행률 리포터
```bash
#!/bin/bash
# progress-tracker.sh

DATE=$(date +%Y-%m-%d)
ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS")
WARNINGS=$(npx tsc --noEmit 2>&1 | grep -c "warning TS")

echo "$DATE,$ERRORS,$WARNINGS" >> error-progress.csv

echo "📊 Progress Report"
echo "=================="
echo "Date: $DATE"
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo "Reduction: $(($INITIAL_ERRORS - $ERRORS)) errors fixed"
```

### 일일 목표 설정
```yaml
# error-resolution-plan.yml
week1:
  target_reduction: 60%  # 1813 → 726
  focus: "Import/Module errors"
  
week2:
  target_reduction: 85%  # 726 → 272
  focus: "Type assignments"

# 실제 DINO 프로젝트 결과
actual_results:
  day3: 892 errors (51% 감소)
  day7: 234 errors (87% 감소)
  day10: 89 errors (95% 감소)
  day14: 0 errors (100% 해결)
```

## 🚀 대량 수정 도구 모음

### 1. 통합 에러 수정기
```bash
#!/bin/bash
# master-fixer.sh

echo "🔧 Starting mass error resolution..."

# Phase 1: Import fixes
node scripts/fix-imports.js
echo "✅ Import fixes completed"

# Phase 2: Type generation
node scripts/generate-types.js
echo "✅ Type generation completed"

# Phase 3: Property additions
node scripts/add-properties.js
echo "✅ Property fixes completed"

# Validation
npm run type-check
echo "📊 Final error count: $(npx tsc --noEmit 2>&1 | grep -c 'error TS')"
```

### 2. 백업 및 복구 시스템
```bash
# 작업 전 전체 백업
git stash push -m "BEFORE_MASS_FIX_$(date +%Y%m%d_%H%M%S)"

# 단계별 백업
git add -A
git commit -m "checkpoint: phase 1 import fixes completed"
```

## 💡 핵심 교훈

### 성공 요인
1. **분류가 해결의 시작**: 1,813개를 5개 그룹으로 나누니 해결 가능해짐
2. **자동화가 핵심**: 80%는 스크립트로 해결 가능
3. **점진적 접근**: 한 번에 모든 것을 완벽하게 하려 하지 않음
4. **백업 필수**: 각 단계마다 롤백 지점 확보

### 실패 패턴
- ❌ 모든 에러를 수동으로 해결하려 함
- ❌ 우선순위 없이 무작정 시작
- ❌ 백업 없이 대량 수정
- ❌ 도구 개발 시간 부족 추정

### 시간 분배 권장
- 30% - 분석 및 도구 개발
- 50% - 자동화 스크립트 실행
- 20% - 수동 수정 및 검증

---

*"1,813개 에러는 문제가 아니라 해결할 수 있는 작업 목록이다. 분류하고, 자동화하고, 차근차근 진행하면 반드시 0에 도달한다."*
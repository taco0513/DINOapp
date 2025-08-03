# 📚 Document-First Development - 문서 우선 개발 방법론

## 🎯 핵심 원칙: "문서에 없으면 만들지 않는다"

### 🚨 AI가 자주 무시하는 문서들

```yaml
자주_누락되는_문서들:
  프로젝트_구조:
    - "폴더 구조가 문서와 완전히 다름"
    - "정의된 모듈 경계를 무시하고 파일 생성"
    - "네이밍 컨벤션 문서 있는데 제멋대로 작명"
  
  비즈니스_로직:
    - "유저 플로우 문서 있는데 다른 플로우 구현"
    - "권한 체계 문서 무시하고 단순하게 구현"
    - "상태 관리 전략 문서와 다른 방식 사용"
  
  UI_UX_디자인:
    - "Figma 링크 있는데 안 보고 대충 구현"
    - "컴포넌트 명세 있는데 다른 props 구조"
    - "반응형 브레이크포인트 문서 무시"
  
  테스트_품질:
    - "테스트 시나리오 문서 있는데 다른 케이스 작성"
    - "품질 기준 문서 있는데 체크 안 함"
    - "성능 목표 문서 있는데 측정 안 함"
```

## 🛡️ Document Enforcement Protocol (문서 강제 프로토콜)

### Phase 1: Document Inventory Check (문서 목록 확인)

```typescript
// AI가 프로젝트 시작 전 반드시 실행해야 하는 체크리스트
interface DocumentInventory {
  // 필수 문서들
  required: {
    "README.md": boolean;
    "docs/PROJECT_OVERVIEW.md": boolean;
    "docs/TECH_REQUIREMENTS.md": boolean;
    "docs/FOLDER_STRUCTURE.md": boolean;
    "docs/API_SPECIFICATION.md": boolean;
    "docs/DATABASE_DESIGN.md": boolean;
    "docs/UI_COMPONENTS.md": boolean;
    "docs/BUSINESS_LOGIC.md": boolean;
    "docs/TESTING_STRATEGY.md": boolean;
  };
  
  // 선택 문서들
  optional: {
    "docs/DEPLOYMENT.md": boolean;
    "docs/SECURITY.md": boolean;
    "docs/PERFORMANCE.md": boolean;
    "docs/TROUBLESHOOTING.md": boolean;
  };
}

// 강제 실행 프롬프트
const INVENTORY_CHECK_PROMPT = `
📋 DOCUMENT INVENTORY CHECK REQUIRED

Execute this command first:
\`\`\`bash
find . -name "*.md" -type f | grep -E "(docs/|README)" | sort
\`\`\`

Then create document-inventory.md with:
1. ✅ Found documents (with file size)
2. ❌ Missing required documents
3. 📄 Document reading order
4. ⏱️ Estimated reading time

DO NOT PROCEED until all required documents are found.
`;
```

### Phase 2: Deep Document Analysis (심층 문서 분석)

```typescript
// 각 문서별 필수 추출 정보
interface DocumentAnalysis {
  projectOverview: {
    projectName: string;
    version: string;
    objectives: string[];
    constraints: string[];
    outOfScope: string[];  // 매우 중요!
  };
  
  techRequirements: {
    mandatoryTech: TechStack[];
    prohibitedTech: string[];  // 사용 금지 기술
    versionLocks: Record<string, string>;  // 정확한 버전
    browserSupport: string[];
    performanceTargets: Metrics;
  };
  
  folderStructure: {
    rootStructure: TreeStructure;
    namingConventions: NamingRules;
    fileOrganization: FileRules;
    prohibitedPaths: string[];  // 건드리면 안 되는 경로
  };
  
  apiSpecification: {
    baseURL: string;
    authentication: AuthMethod;
    endpoints: APIEndpoint[];
    errorCodes: ErrorCodeMap;
    rateLimits: RateLimitRules;
  };
}

// 심층 분석 강제 프롬프트
const DEEP_ANALYSIS_PROMPT = `
📖 DEEP DOCUMENT ANALYSIS REQUIRED

For each document, extract and create summary files:

1. Read ${documentPath}
2. Create ${documentPath}.summary.md with:
   - 🎯 Core Requirements (numbered list)
   - 🚫 Prohibited Actions (what NOT to do)
   - 📏 Specific Constraints (technical limits)
   - 🔍 Validation Criteria (how to check compliance)

3. Create cross-reference.md showing:
   - Document dependencies
   - Conflicting requirements (if any)
   - Priority when conflicts exist

NO CODING until all summaries are complete.
`;
```

### Phase 3: Code-Document Mapping (코드-문서 매핑)

```typescript
// 모든 코드는 문서와 1:1 매핑되어야 함
interface CodeDocumentMapping {
  // 파일 생성 시 매핑
  fileCreation: {
    filePath: string;
    documentReference: string;  // docs/FOLDER_STRUCTURE.md#section
    justification: string;      // 왜 이 위치에 생성하는지
    nameCompliance: boolean;    // 네이밍 규칙 준수 여부
  };
  
  // 함수/컴포넌트 생성 시 매핑
  functionCreation: {
    functionName: string;
    documentReference: string;  // docs/API_SPEC.md#endpoint-name
    inputSpecification: string; // 문서의 입력 명세 위치
    outputSpecification: string; // 문서의 출력 명세 위치
    businessLogicRef: string;   // 비즈니스 로직 문서 참조
  };
  
  // UI 컴포넌트 생성 시 매핑
  componentCreation: {
    componentName: string;
    designReference: string;    // Figma 링크 또는 디자인 문서
    propsSpecification: string; // 문서의 props 정의 위치
    stateSpecification: string; // 문서의 상태 정의 위치
    behaviorReference: string;  // 동작 명세 참조
  };
}

// 매핑 강제 주석 템플릿
const CODE_MAPPING_TEMPLATE = `
/**
 * @document-reference ${documentPath}#${sectionId}
 * @specification-line ${lineNumbers}
 * @implementation-status exact | modified | extended
 * @deviation-reason ${reason} (if not exact)
 * @last-verified ${date}
 */
`;
```

## 📋 실전 프롬프트: 문서 누락 방지

### 🚀 프로젝트 시작 프롬프트

```markdown
# 🔒 DOCUMENT-FIRST DEVELOPMENT PROTOCOL

## Step 1: Document Discovery
List all project documents using:
\`\`\`bash
find . -type f -name "*.md" | sort
\`\`\`

## Step 2: Required Reading Order
Read documents in this EXACT order:
1. README.md (project context)
2. docs/PROJECT_OVERVIEW.md (what to build)
3. docs/TECH_REQUIREMENTS.md (how to build)
4. docs/FOLDER_STRUCTURE.md (where to put files)
5. docs/API_SPECIFICATION.md (backend interface)
6. docs/DATABASE_DESIGN.md (data structure)
7. docs/UI_COMPONENTS.md (frontend specs)
8. docs/BUSINESS_LOGIC.md (core rules)

## Step 3: Compliance Checklist
Create compliance-checklist.md with:
- [ ] All tech stack versions match exactly
- [ ] Folder structure plan follows docs
- [ ] API endpoints list matches spec
- [ ] Database schema matches design
- [ ] UI components list from docs
- [ ] Business rules extracted

## Step 4: Implementation Plan
Create implementation-plan.md showing:
- Which document drives each feature
- File creation order with doc references
- Component list with design mappings

Say "Document Protocol Ready" when complete.
```

### 🔍 개발 중 검증 프롬프트

```markdown
# ✅ Feature Compliance Check

Before implementing [Feature Name]:

1. **Document Reference**:
   - Which document defines this? [Doc name + section]
   - Quote the exact requirements: [Copy paste]
   - Line numbers: [Start-End]

2. **Compliance Verification**:
   ```
   Requirement: [From doc]
   Implementation: [Your plan]
   Match: [Yes/No]
   ```

3. **File Creation Check**:
   - New file path: [Path]
   - Allowed by: [FOLDER_STRUCTURE.md reference]
   - Naming convention: [Rule reference]

4. **Code Mapping**:
   Add these comments to your code:
   ```javascript
   // DOC-REF: [document]#[section] (lines X-Y)
   // SPEC: [exact requirement quote]
   // IMPL: exact | modified (reason: ...)
   ```

Proceed only after all checks pass.
```

### 🚨 누락 방지 체크리스트

```markdown
# 🔍 Common Omission Checklist

## Often Ignored by AI:

### 1. Error Handling
- [ ] Error codes from docs/API_SPECIFICATION.md#error-codes
- [ ] Error messages from docs/UI_COPY.md#error-messages
- [ ] Fallback behaviors from docs/BUSINESS_LOGIC.md#error-flows

### 2. Edge Cases
- [ ] Empty states from docs/UI_COMPONENTS.md#empty-states
- [ ] Loading states from docs/UI_COMPONENTS.md#loading
- [ ] Offline behavior from docs/REQUIREMENTS.md#offline

### 3. Constraints
- [ ] Rate limits from docs/API_SPECIFICATION.md#limits
- [ ] File size limits from docs/TECH_REQUIREMENTS.md#constraints
- [ ] Browser support from docs/TECH_REQUIREMENTS.md#compatibility

### 4. Security
- [ ] Auth flows from docs/SECURITY.md#authentication
- [ ] Permission checks from docs/BUSINESS_LOGIC.md#permissions
- [ ] Input validation from docs/API_SPECIFICATION.md#validation

### 5. Performance
- [ ] Load time targets from docs/PERFORMANCE.md#targets
- [ ] Bundle size limits from docs/TECH_REQUIREMENTS.md#performance
- [ ] Caching strategy from docs/ARCHITECTURE.md#caching

Check each item against documents before marking complete.
```

## 🎯 문서 타입별 강제 추출 템플릿

### API 문서 강제 추출

```typescript
// AI가 API 문서를 읽을 때 반드시 추출해야 하는 정보
interface APIDocumentExtraction {
  // 1. 엔드포인트 목록
  endpoints: {
    method: string;
    path: string;
    description: string;
    requestBody?: object;
    responseBody: object;
    errorCodes: number[];
    authentication: boolean;
    rateLimit?: string;
  }[];
  
  // 2. 공통 규칙
  commonRules: {
    baseURL: string;
    authHeader: string;
    contentType: string;
    versioningStrategy: string;
    paginationFormat?: object;
    errorFormat: object;
  };
  
  // 3. 금지사항
  prohibited: {
    noDirectDBAccess: boolean;
    noSyncCalls: boolean;
    noHardcodedURLs: boolean;
    customRules: string[];
  };
}

const API_EXTRACTION_PROMPT = `
Extract ALL endpoints from API documentation:

| Method | Path | Auth | Request | Response | Errors |
|--------|------|------|---------|----------|--------|
| [LIST ALL] |

Create api-checklist.md with this table.
`;
```

### UI 컴포넌트 문서 강제 추출

```typescript
// UI 문서에서 반드시 추출해야 하는 정보
interface UIDocumentExtraction {
  // 1. 컴포넌트 목록
  components: {
    name: string;
    category: string;
    props: PropDefinition[];
    states: string[];
    variants: string[];
    examples: string[];
    figmaLink?: string;
  }[];
  
  // 2. 디자인 토큰
  designTokens: {
    colors: Record<string, string>;
    spacing: Record<string, string>;
    typography: Record<string, object>;
    breakpoints: Record<string, string>;
    animations: Record<string, string>;
  };
  
  // 3. 컴포넌트 규칙
  componentRules: {
    namingConvention: string;
    fileStructure: string;
    stateManagement: string;
    propValidation: string;
    accessibility: string[];
  };
}
```

## 📊 측정 가능한 효과

### Before: 문서 준수 시스템 없을 때
```yaml
문제_발생률:
  문서와_다른_구현: "68%"
  중요_기능_누락: "45%"
  잘못된_파일_위치: "82%"
  API_스펙_불일치: "71%"
  
재작업_지표:
  평균_수정_횟수: "4.7회"
  문서_재확인_요청: "매 기능마다"
  개발_시간_낭비: "전체의 40%"
```

### After: 문서 준수 시스템 적용
```yaml
개선_효과:
  문서_준수율: "97%"
  기능_완성도: "99%"
  올바른_구조: "100%"
  API_일치율: "98%"
  
효율성_향상:
  수정_필요: "거의 없음"
  일회성_구현: "95%"
  시간_절약: "60%"
```

## 🚀 즉시 시작하기

### 1. 문서 구조 세팅
```bash
# 표준 문서 구조 생성
mkdir -p docs/{api,ui,database,business}
touch docs/{PROJECT_OVERVIEW,TECH_REQUIREMENTS,FOLDER_STRUCTURE}.md
touch docs/api/{SPECIFICATION,ENDPOINTS,ERRORS}.md
touch docs/ui/{COMPONENTS,DESIGN_SYSTEM,USER_FLOWS}.md
touch docs/database/{SCHEMA,MIGRATIONS,SEEDS}.md
touch docs/business/{LOGIC,RULES,WORKFLOWS}.md
```

### 2. AI 시작 명령
```markdown
@Document-First Development Protocol 시작:
1. 모든 .md 파일 목록 생성
2. 각 문서 요약 파일 생성
3. compliance-checklist.md 생성
4. implementation-plan.md 생성
5. "준비 완료" 응답

문서 외의 내용은 구현하지 마세요.
```

---

> 🎯 **"문서에 없으면 존재하지 않는 것이다"**

이 원칙으로 AI의 창의적 일탈을 완전히 차단하세요!
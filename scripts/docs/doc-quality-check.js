#!/usr/bin/env node

/**
 * 문서 품질 검증 스크립트
 * JSDoc 커버리지, 문서 완성도, 링크 유효성 등을 검사합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 설정
const CONFIG = {
  // 검사할 디렉토리들
  sourceDirs: ['app', 'components', 'lib', 'types'],
  docsDirs: ['docs'],
  // 품질 기준
  qualityThresholds: {
    jsdocCoverage: 70, // JSDoc 커버리지 70% 이상
    documentCompleteness: 80, // 문서 완성도 80% 이상
    linkValidation: 95, // 링크 유효성 95% 이상
    codeExamples: 60, // 코드 예제 포함률 60% 이상
  },
  // 제외할 파일 패턴
  excludePatterns: [
    'node_modules',
    '.next',
    '__tests__',
    '*.test.*',
    '*.spec.*',
  ],
};

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🔍 DINO 문서 품질 검증 시작...\n');

  try {
    // 1. JSDoc 커버리지 검사
    const jsdocResults = await checkJSDocCoverage();

    // 2. 문서 완성도 검사
    const completenessResults = await checkDocumentCompleteness();

    // 3. 링크 유효성 검사
    const linkResults = await checkLinkValidation();

    // 4. 코드 예제 검사
    const exampleResults = await checkCodeExamples();

    // 5. 종합 평가
    const overallScore = calculateOverallScore({
      jsdoc: jsdocResults,
      completeness: completenessResults,
      links: linkResults,
      examples: exampleResults,
    });

    // 6. 보고서 생성
    await generateQualityReport({
      jsdoc: jsdocResults,
      completeness: completenessResults,
      links: linkResults,
      examples: exampleResults,
      overall: overallScore,
    });

    console.log('\n✅ 문서 품질 검증 완료!');
    console.log(`📊 종합 점수: ${overallScore.score}% (목표: 70%)`);

    if (overallScore.score >= 70) {
      console.log('🎉 품질 목표 달성!');
      process.exit(0);
    } else {
      console.log('⚠️  품질 개선이 필요합니다.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 품질 검증 실패:', error.message);
    process.exit(1);
  }
}

/**
 * JSDoc 커버리지 검사
 */
async function checkJSDocCoverage() {
  console.log('📝 JSDoc 커버리지 검사...');

  const results = {
    totalFunctions: 0,
    documentedFunctions: 0,
    totalClasses: 0,
    documentedClasses: 0,
    totalInterfaces: 0,
    documentedInterfaces: 0,
    files: [],
  };

  for (const dir of CONFIG.sourceDirs) {
    if (fs.existsSync(dir)) {
      const files = getSourceFiles(dir);

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const analysis = analyzeJSDocCoverage(file, content);

        results.totalFunctions += analysis.functions.total;
        results.documentedFunctions += analysis.functions.documented;
        results.totalClasses += analysis.classes.total;
        results.documentedClasses += analysis.classes.documented;
        results.totalInterfaces += analysis.interfaces.total;
        results.documentedInterfaces += analysis.interfaces.documented;

        results.files.push({
          file: path.relative(process.cwd(), file),
          ...analysis,
        });
      }
    }
  }

  // 커버리지 계산
  const totalItems =
    results.totalFunctions + results.totalClasses + results.totalInterfaces;
  const documentedItems =
    results.documentedFunctions +
    results.documentedClasses +
    results.documentedInterfaces;
  const coverage =
    totalItems > 0 ? Math.round((documentedItems / totalItems) * 100) : 0;

  results.coverage = coverage;
  results.passed = coverage >= CONFIG.qualityThresholds.jsdocCoverage;

  console.log(
    `  📊 JSDoc 커버리지: ${coverage}% (${documentedItems}/${totalItems})`
  );
  console.log(
    `  🎯 목표: ${CONFIG.qualityThresholds.jsdocCoverage}% - ${results.passed ? '✅' : '❌'}`
  );

  return results;
}

/**
 * 개별 파일 JSDoc 분석
 */
function analyzeJSDocCoverage(filePath, content) {
  const functions = extractFunctionsWithDocs(content);
  const classes = extractClassesWithDocs(content);
  const interfaces = extractInterfacesWithDocs(content);

  return {
    functions: {
      total: functions.length,
      documented: functions.filter(f => f.hasDoc).length,
      items: functions,
    },
    classes: {
      total: classes.length,
      documented: classes.filter(c => c.hasDoc).length,
      items: classes,
    },
    interfaces: {
      total: interfaces.length,
      documented: interfaces.filter(i => i.hasDoc).length,
      items: interfaces,
    },
  };
}

/**
 * 함수와 문서 추출
 */
function extractFunctionsWithDocs(content) {
  const functionRegex =
    /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g;
  const functions = [];
  let match;

  while ((match = functionRegex.exec(content)) !== null) {
    const name = match[1] || match[2];
    if (name && !name.startsWith('_')) {
      // private 함수 제외
      const functionStart = match.index;
      const beforeFunction = content.substring(0, functionStart);
      const hasDoc = /\/\*\*([\s\S]*?)\*\/\s*$/.test(beforeFunction);

      functions.push({
        name,
        hasDoc,
        isExported: match[0].includes('export'),
      });
    }
  }

  return functions;
}

/**
 * 클래스와 문서 추출
 */
function extractClassesWithDocs(content) {
  const classRegex = /(?:export\s+)?class\s+(\w+)/g;
  const classes = [];
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    const name = match[1];
    const classStart = match.index;
    const beforeClass = content.substring(0, classStart);
    const hasDoc = /\/\*\*([\s\S]*?)\*\/\s*$/.test(beforeClass);

    classes.push({
      name,
      hasDoc,
      isExported: match[0].includes('export'),
    });
  }

  return classes;
}

/**
 * 인터페이스와 문서 추출
 */
function extractInterfacesWithDocs(content) {
  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
  const interfaces = [];
  let match;

  while ((match = interfaceRegex.exec(content)) !== null) {
    const name = match[1];
    const interfaceStart = match.index;
    const beforeInterface = content.substring(0, interfaceStart);
    const hasDoc = /\/\*\*([\s\S]*?)\*\/\s*$/.test(beforeInterface);

    interfaces.push({
      name,
      hasDoc,
      isExported: match[0].includes('export'),
    });
  }

  return interfaces;
}

/**
 * 문서 완성도 검사
 */
async function checkDocumentCompleteness() {
  console.log('📚 문서 완성도 검사...');

  const results = {
    totalDocs: 0,
    completeDocs: 0,
    issues: [],
    files: [],
  };

  for (const dir of CONFIG.docsDirs) {
    if (fs.existsSync(dir)) {
      const docFiles = getDocumentFiles(dir);

      for (const file of docFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const analysis = analyzeDocumentCompleteness(file, content);

        results.totalDocs++;
        if (analysis.completeness >= 80) {
          results.completeDocs++;
        }

        results.issues.push(...analysis.issues);
        results.files.push({
          file: path.relative(process.cwd(), file),
          ...analysis,
        });
      }
    }
  }

  const completeness =
    results.totalDocs > 0
      ? Math.round((results.completeDocs / results.totalDocs) * 100)
      : 0;

  results.completeness = completeness;
  results.passed =
    completeness >= CONFIG.qualityThresholds.documentCompleteness;

  console.log(
    `  📊 문서 완성도: ${completeness}% (${results.completeDocs}/${results.totalDocs})`
  );
  console.log(
    `  🎯 목표: ${CONFIG.qualityThresholds.documentCompleteness}% - ${results.passed ? '✅' : '❌'}`
  );

  return results;
}

/**
 * 개별 문서 완성도 분석
 */
function analyzeDocumentCompleteness(filePath, content) {
  const issues = [];
  let score = 100;

  // 제목 체크
  if (!/^#\s+.+/m.test(content)) {
    issues.push('주제목(H1)이 없음');
    score -= 20;
  }

  // 설명 체크
  if (content.length < 200) {
    issues.push('내용이 너무 짧음 (< 200자)');
    score -= 15;
  }

  // 섹션 구조 체크
  const sections = content.match(/^#{2,6}\s+.+/gm) || [];
  if (sections.length < 2) {
    issues.push('충분한 섹션 구조가 없음');
    score -= 15;
  }

  // 코드 예제 체크
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  if (codeBlocks.length === 0 && filePath.includes('api')) {
    issues.push('코드 예제가 없음');
    score -= 10;
  }

  // 링크 체크
  const links = content.match(/\[.*?\]\(.*?\)/g) || [];
  if (links.length === 0 && content.length > 1000) {
    issues.push('참조 링크가 없음');
    score -= 10;
  }

  // 목차 체크 (긴 문서의 경우)
  if (content.length > 2000 && !/목차|table of contents|toc/i.test(content)) {
    issues.push('긴 문서에 목차가 없음');
    score -= 10;
  }

  // 마지막 수정일 체크
  if (!/\d{4}-\d{2}-\d{2}/.test(content)) {
    issues.push('마지막 업데이트 날짜가 없음');
    score -= 5;
  }

  return {
    completeness: Math.max(0, score),
    issues,
    wordCount: content.split(/\s+/).length,
    codeBlocks: codeBlocks.length,
    links: links.length,
    sections: sections.length,
  };
}

/**
 * 링크 유효성 검사
 */
async function checkLinkValidation() {
  console.log('🔗 링크 유효성 검사...');

  const results = {
    totalLinks: 0,
    validLinks: 0,
    invalidLinks: [],
    files: [],
  };

  for (const dir of CONFIG.docsDirs) {
    if (fs.existsSync(dir)) {
      const docFiles = getDocumentFiles(dir);

      for (const file of docFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const analysis = await validateLinksInDocument(file, content);

        results.totalLinks += analysis.links.length;
        results.validLinks += analysis.validLinks;
        results.invalidLinks.push(...analysis.invalidLinks);

        results.files.push({
          file: path.relative(process.cwd(), file),
          ...analysis,
        });
      }
    }
  }

  const validationRate =
    results.totalLinks > 0
      ? Math.round((results.validLinks / results.totalLinks) * 100)
      : 100;

  results.validationRate = validationRate;
  results.passed = validationRate >= CONFIG.qualityThresholds.linkValidation;

  console.log(
    `  📊 링크 유효성: ${validationRate}% (${results.validLinks}/${results.totalLinks})`
  );
  console.log(
    `  🎯 목표: ${CONFIG.qualityThresholds.linkValidation}% - ${results.passed ? '✅' : '❌'}`
  );

  return results;
}

/**
 * 문서의 링크 검증
 */
async function validateLinksInDocument(filePath, content) {
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  const links = [];
  const invalidLinks = [];
  let validLinks = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const linkText = match[1];
    const linkUrl = match[2];

    links.push({ text: linkText, url: linkUrl });

    // 링크 유효성 검사
    const isValid = await validateLink(linkUrl, filePath);
    if (isValid) {
      validLinks++;
    } else {
      invalidLinks.push({
        text: linkText,
        url: linkUrl,
        file: path.relative(process.cwd(), filePath),
      });
    }
  }

  return {
    links,
    validLinks,
    invalidLinks,
  };
}

/**
 * 개별 링크 검증
 */
async function validateLink(url, basePath) {
  try {
    // 내부 링크 검사
    if (url.startsWith('#')) {
      return true; // 앵커 링크는 일단 유효한 것으로 처리
    }

    // 상대 경로 링크 검사
    if (!url.startsWith('http')) {
      const fullPath = path.resolve(path.dirname(basePath), url);
      return fs.existsSync(fullPath);
    }

    // 외부 링크는 간단한 형식 검사만
    return /^https?:\/\/.+/.test(url);
  } catch (error) {
    return false;
  }
}

/**
 * 코드 예제 검사
 */
async function checkCodeExamples() {
  console.log('💻 코드 예제 검사...');

  const results = {
    totalDocs: 0,
    docsWithExamples: 0,
    totalExamples: 0,
    files: [],
  };

  for (const dir of CONFIG.docsDirs) {
    if (fs.existsSync(dir)) {
      const docFiles = getDocumentFiles(dir);

      for (const file of docFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const analysis = analyzeCodeExamples(file, content);

        results.totalDocs++;
        if (analysis.examples.length > 0) {
          results.docsWithExamples++;
        }
        results.totalExamples += analysis.examples.length;

        results.files.push({
          file: path.relative(process.cwd(), file),
          ...analysis,
        });
      }
    }
  }

  const exampleRate =
    results.totalDocs > 0
      ? Math.round((results.docsWithExamples / results.totalDocs) * 100)
      : 0;

  results.exampleRate = exampleRate;
  results.passed = exampleRate >= CONFIG.qualityThresholds.codeExamples;

  console.log(
    `  📊 코드 예제 포함률: ${exampleRate}% (${results.docsWithExamples}/${results.totalDocs})`
  );
  console.log(
    `  🎯 목표: ${CONFIG.qualityThresholds.codeExamples}% - ${results.passed ? '✅' : '❌'}`
  );

  return results;
}

/**
 * 코드 예제 분석
 */
function analyzeCodeExamples(filePath, content) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const examples = [];
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || 'text';
    const code = match[2].trim();

    examples.push({
      language,
      code,
      lines: code.split('\n').length,
    });
  }

  return {
    examples,
    hasExamples: examples.length > 0,
    totalLines: examples.reduce((sum, ex) => sum + ex.lines, 0),
  };
}

/**
 * 종합 점수 계산
 */
function calculateOverallScore(results) {
  const weights = {
    jsdoc: 0.3,
    completeness: 0.3,
    links: 0.2,
    examples: 0.2,
  };

  const scores = {
    jsdoc: results.jsdoc.coverage,
    completeness: results.completeness.completeness,
    links: results.links.validationRate,
    examples: results.examples.exampleRate,
  };

  const weightedScore = Object.keys(weights).reduce((sum, key) => {
    return sum + scores[key] * weights[key];
  }, 0);

  const passed = Object.keys(CONFIG.qualityThresholds).every(key => {
    const mapping = {
      jsdocCoverage: 'jsdoc',
      documentCompleteness: 'completeness',
      linkValidation: 'links',
      codeExamples: 'examples',
    };
    const resultKey = mapping[key] || key;
    return results[resultKey].passed;
  });

  return {
    score: Math.round(weightedScore),
    passed,
    breakdown: scores,
    weights,
  };
}

/**
 * 품질 보고서 생성
 */
async function generateQualityReport(results) {
  console.log('📊 품질 보고서 생성...');

  const reportPath = 'docs/quality-report.md';

  let report = `# 📊 문서 품질 보고서\n\n`;
  report += `> 🤖 자동 생성된 보고서 - ${new Date().toLocaleString('ko-KR')}\n\n`;

  // 종합 점수
  report += `## 🎯 종합 평가\n\n`;
  report += `**전체 점수: ${results.overall.score}%** ${results.overall.passed ? '✅' : '❌'}\n\n`;
  report += `| 항목 | 점수 | 가중치 | 상태 |\n`;
  report += `|------|------|--------|------|\n`;
  report += `| JSDoc 커버리지 | ${results.jsdoc.coverage}% | ${Math.round(results.overall.weights.jsdoc * 100)}% | ${results.jsdoc.passed ? '✅' : '❌'} |\n`;
  report += `| 문서 완성도 | ${results.completeness.completeness}% | ${Math.round(results.overall.weights.completeness * 100)}% | ${results.completeness.passed ? '✅' : '❌'} |\n`;
  report += `| 링크 유효성 | ${results.links.validationRate}% | ${Math.round(results.overall.weights.links * 100)}% | ${results.links.passed ? '✅' : '❌'} |\n`;
  report += `| 코드 예제 | ${results.examples.exampleRate}% | ${Math.round(results.overall.weights.examples * 100)}% | ${results.examples.passed ? '✅' : '❌'} |\n\n`;

  // JSDoc 상세
  report += `## 📝 JSDoc 커버리지\n\n`;
  report += `- **함수:** ${results.jsdoc.documentedFunctions}/${results.jsdoc.totalFunctions}개 문서화\n`;
  report += `- **클래스:** ${results.jsdoc.documentedClasses}/${results.jsdoc.totalClasses}개 문서화\n`;
  report += `- **인터페이스:** ${results.jsdoc.documentedInterfaces}/${results.jsdoc.totalInterfaces}개 문서화\n\n`;

  // 문서 완성도 상세
  report += `## 📚 문서 완성도\n\n`;
  report += `- **완성된 문서:** ${results.completeness.completeDocs}/${results.completeness.totalDocs}개\n`;
  report += `- **주요 이슈:** ${results.completeness.issues.length}개\n\n`;

  if (results.completeness.issues.length > 0) {
    report += `### 개선 필요 항목\n\n`;
    const issueGroups = {};
    results.completeness.issues.forEach(issue => {
      if (!issueGroups[issue]) issueGroups[issue] = 0;
      issueGroups[issue]++;
    });

    Object.entries(issueGroups).forEach(([issue, count]) => {
      report += `- ${issue}: ${count}건\n`;
    });
    report += '\n';
  }

  // 링크 유효성 상세
  report += `## 🔗 링크 유효성\n\n`;
  report += `- **유효한 링크:** ${results.links.validLinks}/${results.links.totalLinks}개\n`;
  if (results.links.invalidLinks.length > 0) {
    report += `\n### 유효하지 않은 링크\n\n`;
    results.links.invalidLinks.slice(0, 10).forEach(link => {
      report += `- [\`${link.text}\`](${link.url}) in ${link.file}\n`;
    });
    if (results.links.invalidLinks.length > 10) {
      report += `- ... 및 ${results.links.invalidLinks.length - 10}개 추가\n`;
    }
    report += '\n';
  }

  // 코드 예제 상세
  report += `## 💻 코드 예제\n\n`;
  report += `- **예제 포함 문서:** ${results.examples.docsWithExamples}/${results.examples.totalDocs}개\n`;
  report += `- **총 예제 수:** ${results.examples.totalExamples}개\n\n`;

  // 개선 권장사항
  report += `## 🔧 개선 권장사항\n\n`;

  if (!results.jsdoc.passed) {
    report += `### JSDoc 커버리지 개선\n`;
    report += `- 문서화되지 않은 함수들에 JSDoc 주석 추가\n`;
    report += `- 매개변수와 반환값에 대한 설명 보완\n`;
    report += `- 예제 코드 포함 고려\n\n`;
  }

  if (!results.completeness.passed) {
    report += `### 문서 완성도 개선\n`;
    report += `- 짧은 문서들의 내용 보완\n`;
    report += `- 적절한 섹션 구조 추가\n`;
    report += `- 긴 문서에 목차 추가\n\n`;
  }

  if (!results.links.passed) {
    report += `### 링크 유효성 개선\n`;
    report += `- 깨진 링크 수정\n`;
    report += `- 상대 경로 링크 정확성 확인\n`;
    report += `- 외부 링크 정기 점검\n\n`;
  }

  if (!results.examples.passed) {
    report += `### 코드 예제 보완\n`;
    report += `- API 문서에 사용 예제 추가\n`;
    report += `- 복잡한 기능에 대한 예제 코드 제공\n`;
    report += `- 실제 동작하는 예제 작성\n\n`;
  }

  report += `---\n\n`;
  report += `📅 **생성일:** ${new Date().toLocaleString('ko-KR')}\n`;
  report += `🔧 **생성 스크립트:** \`scripts/docs/doc-quality-check.js\`\n`;

  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`  ✅ 품질 보고서 생성: ${reportPath}`);
}

/**
 * 소스 파일 목록 가져오기
 */
function getSourceFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !CONFIG.excludePatterns.some(p => item.includes(p))
    ) {
      files.push(...getSourceFiles(fullPath));
    } else if (
      stat.isFile() &&
      /\.(ts|tsx|js|jsx)$/.test(item) &&
      !CONFIG.excludePatterns.some(p => item.includes(p))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 문서 파일 목록 가져오기
 */
function getDocumentFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getDocumentFiles(fullPath));
    } else if (stat.isFile() && item.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

// 스크립트 실행
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'report-only') {
    // 품질 보고서만 생성 (검증 실패해도 종료하지 않음)
    main().catch(error => {
      console.error('❌ 품질 검증 실패:', error.message);
    });
  } else {
    main();
  }
}

module.exports = {
  main,
  CONFIG,
};

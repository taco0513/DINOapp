const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

class DocumentReviewer {
  constructor(autoDocsGenerator) {
    this.autoDocsGenerator = autoDocsGenerator;
    this.projectRoot = autoDocsGenerator.projectRoot;
    this.config = autoDocsGenerator.config;
    
    // 리뷰 결과 저장 경로
    this.reviewPath = path.join(this.projectRoot, 'docs', 'review-reports');
    
    // 한국어 맞춤법 패턴
    this.koreanSpellCheck = this.initKoreanSpellCheck();
    
    // 마크다운 문법 패턴
    this.markdownPatterns = this.initMarkdownPatterns();
    
    // 일관성 검사 패턴
    this.consistencyPatterns = this.initConsistencyPatterns();
  }

  async init() {
    await fs.ensureDir(this.reviewPath);
    console.log(chalk.blue('🔍 문서 리뷰 시스템 초기화 완료'));
  }

  // 메인 리뷰 함수
  async reviewAllDocuments() {
    console.log(chalk.blue('📝 전체 문서 품질 검사 시작...'));
    
    const results = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: 0,
        totalIssues: 0,
        criticalIssues: 0,
        warnings: 0,
        suggestions: 0
      },
      files: [],
      overallScore: 0
    };

    try {
      // 문서 파일 찾기
      const docFiles = await this.findDocumentFiles();
      results.summary.totalFiles = docFiles.length;

      // 각 파일 리뷰
      for (const filePath of docFiles) {
        const fileReview = await this.reviewSingleFile(filePath);
        results.files.push(fileReview);
        
        results.summary.totalIssues += fileReview.issues.length;
        results.summary.criticalIssues += fileReview.issues.filter(i => i.severity === 'critical').length;
        results.summary.warnings += fileReview.issues.filter(i => i.severity === 'warning').length;
        results.summary.suggestions += fileReview.issues.filter(i => i.severity === 'suggestion').length;
      }

      // 프로젝트 수준 일관성 검사
      const consistencyIssues = await this.checkProjectConsistency(docFiles);
      if (consistencyIssues.length > 0) {
        results.files.push({
          path: 'PROJECT_CONSISTENCY',
          issues: consistencyIssues,
          score: this.calculateConsistencyScore(consistencyIssues)
        });
      }

      // 전체 점수 계산
      results.overallScore = this.calculateOverallScore(results);

      // 리뷰 리포트 생성
      await this.generateReviewReport(results);
      
      console.log(chalk.green(`✅ 문서 리뷰 완료: ${docFiles.length}개 파일, ${results.summary.totalIssues}개 이슈 발견`));
      console.log(chalk.blue(`📊 전체 품질 점수: ${results.overallScore}/100`));

      return results;

    } catch (error) {
      console.error(chalk.red(`문서 리뷰 중 오류: ${error.message}`));
      return null;
    }
  }

  async findDocumentFiles() {
    const glob = require('fast-glob');
    const patterns = [
      '**/*.md',
      '**/*.txt',
      '**/README*',
      '**/CHANGELOG*',
      '**/PROGRESS*'
    ];
    
    return await glob(patterns, {
      cwd: this.projectRoot,
      ignore: [
        'node_modules/**',
        '.git/**',
        'auto-docs/node_modules/**',
        'docs/review-reports/**'
      ]
    });
  }

  async reviewSingleFile(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    const content = await fs.readFile(fullPath, 'utf8');
    
    const review = {
      path: filePath,
      size: content.length,
      lines: content.split('\n').length,
      issues: [],
      score: 100,
      lastModified: (await fs.stat(fullPath)).mtime
    };

    try {
      // 1. 기본 품질 검사
      const basicIssues = this.checkBasicQuality(content, filePath);
      review.issues.push(...basicIssues);

      // 2. 마크다운 문법 검사 (마크다운 파일인 경우)
      if (filePath.endsWith('.md')) {
        const markdownIssues = this.checkMarkdownSyntax(content, filePath);
        review.issues.push(...markdownIssues);
      }

      // 3. 한국어 맞춤법 검사 (한국어 내용이 있는 경우)
      if (this.hasKoreanContent(content)) {
        const spellIssues = await this.checkKoreanSpelling(content, filePath);
        review.issues.push(...spellIssues);
      }

      // 4. 링크 유효성 검사
      const linkIssues = await this.checkLinks(content, filePath);
      review.issues.push(...linkIssues);

      // 5. 코드 블록 검증
      const codeIssues = this.checkCodeBlocks(content, filePath);
      review.issues.push(...codeIssues);

      // 점수 계산
      review.score = this.calculateFileScore(review.issues);

    } catch (error) {
      review.issues.push({
        type: 'system_error',
        severity: 'critical',
        line: 0,
        message: `파일 검사 중 오류: ${error.message}`,
        suggestion: '파일 인코딩이나 권한을 확인하세요.'
      });
    }

    return review;
  }

  checkBasicQuality(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // 1. 빈 줄 과다
      if (line.trim() === '' && lines[index + 1] && lines[index + 1].trim() === '' && 
          lines[index + 2] && lines[index + 2].trim() === '') {
        issues.push({
          type: 'formatting',
          severity: 'suggestion',
          line: lineNum,
          message: '연속된 빈 줄이 3개 이상 있습니다',
          suggestion: '빈 줄을 1-2개로 줄이는 것이 좋습니다'
        });
      }

      // 2. 줄 길이 과다 (200자 초과)
      if (line.length > 200) {
        issues.push({
          type: 'formatting',
          severity: 'warning',
          line: lineNum,
          message: `줄이 너무 깁니다 (${line.length}자)`,
          suggestion: '읽기 쉽도록 줄을 나누는 것이 좋습니다'
        });
      }

      // 3. 탭과 스페이스 혼용
      if (line.includes('\t') && line.includes('  ')) {
        issues.push({
          type: 'formatting',
          severity: 'warning',
          line: lineNum,
          message: '탭과 스페이스가 혼용되었습니다',
          suggestion: '일관된 들여쓰기를 사용하세요'
        });
      }

      // 4. 줄 끝 공백
      if (line.endsWith(' ') || line.endsWith('\t')) {
        issues.push({
          type: 'formatting',
          severity: 'suggestion',
          line: lineNum,
          message: '줄 끝에 불필요한 공백이 있습니다',
          suggestion: '줄 끝 공백을 제거하세요'
        });
      }
    });

    // 5. 파일 끝 빈 줄 확인
    if (!content.endsWith('\n')) {
      issues.push({
        type: 'formatting',
        severity: 'suggestion',
        line: lines.length,
        message: '파일 끝에 빈 줄이 없습니다',
        suggestion: '파일 끝에 빈 줄을 추가하는 것이 좋습니다'
      });
    }

    return issues;
  }

  checkMarkdownSyntax(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // 1. 헤더 형식 검사
      const headerMatch = line.match(/^(#+)\s*(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2];

        // 헤더 레벨 순서 검사 (간단한 버전)
        if (level > 6) {
          issues.push({
            type: 'markdown_syntax',
            severity: 'warning',
            line: lineNum,
            message: `헤더 레벨이 너무 깊습니다 (H${level})`,
            suggestion: 'H1-H6까지만 사용하세요'
          });
        }

        // 헤더 제목 확인
        if (!title.trim()) {
          issues.push({
            type: 'markdown_syntax',
            severity: 'warning',
            line: lineNum,
            message: '헤더에 제목이 없습니다',
            suggestion: '헤더에 적절한 제목을 추가하세요'
          });
        }
      }

      // 2. 링크 형식 검사
      const linkMatches = line.match(/\[([^\]]*)\]\(([^)]*)\)/g);
      if (linkMatches) {
        linkMatches.forEach(link => {
          const linkMatch = link.match(/\[([^\]]*)\]\(([^)]*)\)/);
          if (linkMatch) {
            const linkText = linkMatch[1];
            const linkUrl = linkMatch[2];

            if (!linkText.trim()) {
              issues.push({
                type: 'markdown_syntax',
                severity: 'warning',
                line: lineNum,
                message: '링크 텍스트가 비어있습니다',
                suggestion: '링크에 설명적인 텍스트를 추가하세요'
              });
            }

            if (!linkUrl.trim()) {
              issues.push({
                type: 'markdown_syntax',
                severity: 'critical',
                line: lineNum,
                message: '링크 URL이 비어있습니다',
                suggestion: '유효한 URL을 입력하세요'
              });
            }
          }
        });
      }

      // 3. 코드 블록 검사
      if (line.startsWith('```')) {
        const language = line.replace('```', '').trim();
        if (language && !this.isValidCodeLanguage(language)) {
          issues.push({
            type: 'markdown_syntax',
            severity: 'suggestion',
            line: lineNum,
            message: `알 수 없는 코드 언어: ${language}`,
            suggestion: '표준 언어 식별자를 사용하세요 (js, python, bash 등)'
          });
        }
      }

      // 4. 이미지 형식 검사
      const imageMatches = line.match(/!\[([^\]]*)\]\(([^)]*)\)/g);
      if (imageMatches) {
        imageMatches.forEach(image => {
          const imageMatch = image.match(/!\[([^\]]*)\]\(([^)]*)\)/);
          if (imageMatch) {
            const altText = imageMatch[1];
            const imagePath = imageMatch[2];

            if (!altText.trim()) {
              issues.push({
                type: 'accessibility',
                severity: 'warning',
                line: lineNum,
                message: '이미지에 대체 텍스트가 없습니다',
                suggestion: '접근성을 위해 이미지 설명을 추가하세요'
              });
            }
          }
        });
      }
    });

    return issues;
  }

  async checkKoreanSpelling(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // 간단한 한국어 맞춤법 검사 (기본적인 오타만)
    const commonMistakes = {
      '되요': '돼요',
      '안되': '안 돼',
      '할수있': '할 수 있',
      '그럼에도불구하고': '그럼에도 불구하고',
      '어떻게든지': '어떻게든',
      '좀더': '좀 더',
      '좀처럼': '좀처럼',
      '그런데도': '그런데도',
      '웬지': '왠지',
      '금새': '금세'
    };

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      Object.entries(commonMistakes).forEach(([wrong, correct]) => {
        if (line.includes(wrong)) {
          issues.push({
            type: 'spelling',
            severity: 'suggestion',
            line: lineNum,
            message: `맞춤법 오류: '${wrong}' → '${correct}'`,
            suggestion: `'${wrong}'을(를) '${correct}'으로 수정하세요`
          });
        }
      });

      // 띄어쓰기 검사 (기본적인 패턴만)
      const spacingPatterns = [
        { pattern: /(\w+)에서(\w+)/, message: '조사 앞에 띄어쓰기가 필요합니다' },
        { pattern: /(\w+)과(\w+)/, message: '조사 앞에 띄어쓰기가 필요합니다' },
        { pattern: /할수있/, message: "'할 수 있'으로 띄어써야 합니다" }
      ];

      spacingPatterns.forEach(({ pattern, message }) => {
        if (pattern.test(line)) {
          issues.push({
            type: 'spacing',
            severity: 'suggestion',
            line: lineNum,
            message: message,
            suggestion: '올바른 띄어쓰기를 확인하세요'
          });
        }
      });
    });

    return issues;
  }

  async checkLinks(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    const linkPattern = /\[([^\]]*)\]\(([^)]*)\)/g;
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      let match;

      while ((match = linkPattern.exec(line)) !== null) {
        const linkText = match[1];
        const linkUrl = match[2];

        // 내부 링크 검사
        if (linkUrl.startsWith('./') || linkUrl.startsWith('../') || 
            (!linkUrl.startsWith('http') && !linkUrl.startsWith('#'))) {
          
          const targetPath = path.resolve(path.dirname(path.join(this.projectRoot, filePath)), linkUrl);
          
          if (!fs.existsSync(targetPath)) {
            issues.push({
              type: 'broken_link',
              severity: 'critical',
              line: lineNum,
              message: `깨진 내부 링크: ${linkUrl}`,
              suggestion: '링크 경로를 확인하거나 파일을 생성하세요'
            });
          }
        }

        // 앵커 링크 검사
        if (linkUrl.startsWith('#')) {
          const anchor = linkUrl.substring(1);
          if (!this.findAnchorInContent(content, anchor)) {
            issues.push({
              type: 'broken_anchor',
              severity: 'warning',
              line: lineNum,
              message: `존재하지 않는 앵커: ${linkUrl}`,
              suggestion: '해당 헤더나 앵커가 문서에 있는지 확인하세요'
            });
          }
        }
      }
    });

    return issues;
  }

  checkCodeBlocks(content, filePath) {
    const issues = [];
    const lines = content.split('\n');
    let inCodeBlock = false;
    let codeBlockStart = 0;

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockStart = lineNum;
        } else {
          inCodeBlock = false;
        }
      }
    });

    // 닫히지 않은 코드 블록 검사
    if (inCodeBlock) {
      issues.push({
        type: 'markdown_syntax',
        severity: 'critical',
        line: codeBlockStart,
        message: '코드 블록이 닫히지 않았습니다',
        suggestion: '코드 블록 끝에 ```를 추가하세요'
      });
    }

    return issues;
  }

  async checkProjectConsistency(docFiles) {
    const issues = [];

    try {
      // package.json 정보 읽기
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      let projectInfo = {};
      
      if (fs.existsSync(packageJsonPath)) {
        projectInfo = await fs.readJson(packageJsonPath);
      }

      // 모든 문서에서 프로젝트명 일관성 확인
      const projectNames = new Set();
      const versions = new Set();

      for (const docFile of docFiles) {
        const content = await fs.readFile(path.join(this.projectRoot, docFile), 'utf8');
        
        // 프로젝트명 추출
        const nameMatches = content.match(/# (.+)/);
        if (nameMatches) {
          projectNames.add(nameMatches[1].trim());
        }

        // 버전 정보 추출
        const versionMatches = content.match(/버전[:\s]*([0-9]+\.[0-9]+\.[0-9]+)/g) ||
                              content.match(/version[:\s]*([0-9]+\.[0-9]+\.[0-9]+)/gi);
        if (versionMatches) {
          versionMatches.forEach(match => {
            const version = match.match(/([0-9]+\.[0-9]+\.[0-9]+)/);
            if (version) versions.add(version[1]);
          });
        }
      }

      // 프로젝트명 불일치 확인
      if (projectNames.size > 1) {
        issues.push({
          type: 'consistency',
          severity: 'warning',
          line: 0,
          message: `문서마다 프로젝트명이 다릅니다: ${Array.from(projectNames).join(', ')}`,
          suggestion: '모든 문서에서 일관된 프로젝트명을 사용하세요'
        });
      }

      // 버전 불일치 확인
      if (versions.size > 1 && projectInfo.version) {
        const packageVersion = projectInfo.version;
        if (!versions.has(packageVersion)) {
          issues.push({
            type: 'consistency',
            severity: 'warning',
            line: 0,
            message: `문서의 버전 정보가 package.json과 일치하지 않습니다`,
            suggestion: `모든 문서의 버전을 ${packageVersion}으로 업데이트하세요`
          });
        }
      }

    } catch (error) {
      console.warn(chalk.yellow(`일관성 검사 중 오류: ${error.message}`));
    }

    return issues;
  }

  // 유틸리티 함수들
  hasKoreanContent(content) {
    return /[가-힣]/.test(content);
  }

  isValidCodeLanguage(language) {
    const validLanguages = [
      'javascript', 'js', 'typescript', 'ts', 'python', 'py', 'java', 'c', 'cpp', 'c++',
      'csharp', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
      'scss', 'sass', 'json', 'xml', 'yaml', 'yml', 'bash', 'sh', 'sql', 'r', 'matlab'
    ];
    return validLanguages.includes(language.toLowerCase());
  }

  findAnchorInContent(content, anchor) {
    // 헤더를 앵커로 변환하는 규칙 (GitHub 스타일)
    const headers = content.match(/^#+\s+(.+)$/gm);
    if (headers) {
      return headers.some(header => {
        const headerText = header.replace(/^#+\s+/, '');
        const headerAnchor = headerText.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        return headerAnchor === anchor;
      });
    }
    return false;
  }

  calculateFileScore(issues) {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 10;
          break;
        case 'warning':
          score -= 5;
          break;
        case 'suggestion':
          score -= 2;
          break;
      }
    });

    return Math.max(0, score);
  }

  calculateOverallScore(results) {
    if (results.files.length === 0) return 100;
    
    const totalScore = results.files.reduce((sum, file) => sum + (file.score || 0), 0);
    return Math.round(totalScore / results.files.length);
  }

  calculateConsistencyScore(issues) {
    return Math.max(0, 100 - (issues.length * 15));
  }

  async generateReviewReport(results) {
    const reportPath = path.join(this.reviewPath, `review-${Date.now()}.md`);
    
    const report = this.generateReportMarkdown(results);
    await fs.writeFile(reportPath, report);
    
    // 최신 리포트 링크 생성
    const latestPath = path.join(this.reviewPath, 'latest.md');
    await fs.writeFile(latestPath, report);
    
    console.log(chalk.green(`📋 리뷰 리포트 생성: ${reportPath}`));
    
    return reportPath;
  }

  generateReportMarkdown(results) {
    const timestamp = new Date(results.timestamp).toLocaleString('ko-KR');
    
    let report = `# 📝 문서 품질 리뷰 리포트

**생성 시간**: ${timestamp}
**전체 품질 점수**: ${results.overallScore}/100

## 📊 요약

- **검사된 파일**: ${results.summary.totalFiles}개
- **총 이슈**: ${results.summary.totalIssues}개
- **심각한 문제**: ${results.summary.criticalIssues}개
- **경고**: ${results.summary.warnings}개  
- **제안사항**: ${results.summary.suggestions}개

`;

    // 점수별 등급
    const grade = this.getQualityGrade(results.overallScore);
    report += `## 🏆 품질 등급: ${grade.emoji} ${grade.label}\n\n${grade.description}\n\n`;

    // 파일별 상세 리포트
    report += `## 📋 파일별 상세 리포트\n\n`;
    
    results.files.forEach(file => {
      if (file.issues.length > 0) {
        report += `### 📄 ${file.path}\n\n`;
        report += `- **점수**: ${file.score}/100\n`;
        report += `- **이슈 수**: ${file.issues.length}개\n\n`;
        
        file.issues.forEach(issue => {
          const icon = this.getIssueIcon(issue.severity);
          report += `${icon} **${issue.type}** (라인 ${issue.line}): ${issue.message}\n`;
          if (issue.suggestion) {
            report += `   💡 *제안: ${issue.suggestion}*\n`;
          }
          report += `\n`;
        });
        
        report += `---\n\n`;
      }
    });

    // 개선 제안
    report += `## 🚀 개선 제안\n\n`;
    
    if (results.summary.criticalIssues > 0) {
      report += `### 🚨 우선 해결 필요\n\n`;
      report += `심각한 문제 ${results.summary.criticalIssues}개를 먼저 해결하세요:\n`;
      report += `- 깨진 링크 수정\n`;
      report += `- 코드 블록 문법 오류 수정\n`;
      report += `- 필수 내용 누락 보완\n\n`;
    }

    if (results.summary.warnings > 0) {
      report += `### ⚠️ 권장 개선사항\n\n`;
      report += `경고 ${results.summary.warnings}개에 대한 개선을 권장합니다:\n`;
      report += `- 마크다운 문법 정리\n`;
      report += `- 접근성 개선 (이미지 alt 텍스트 등)\n`;
      report += `- 프로젝트 정보 일관성 확보\n\n`;
    }

    report += `### 💡 추가 제안\n\n`;
    report += `- 정기적인 문서 리뷰 (주 1회 권장)\n`;
    report += `- 자동 맞춤법 검사 도구 활용\n`;
    report += `- 문서 작성 가이드라인 수립\n\n`;

    report += `---\n`;
    report += `*이 리포트는 Auto-Docs 시스템에 의해 자동으로 생성되었습니다.*\n`;

    return report;
  }

  getQualityGrade(score) {
    if (score >= 90) {
      return {
        emoji: '🏆',
        label: '최우수 (A+)',
        description: '문서 품질이 매우 우수합니다. 현재 수준을 유지하세요.'
      };
    } else if (score >= 80) {
      return {
        emoji: '🥇',
        label: '우수 (A)',
        description: '문서 품질이 좋습니다. 몇 가지 소소한 개선으로 완벽해질 수 있습니다.'
      };
    } else if (score >= 70) {
      return {
        emoji: '🥈',
        label: '양호 (B)',
        description: '문서 품질이 양호합니다. 주요 이슈들을 해결하면 더 나아질 것입니다.'
      };
    } else if (score >= 60) {
      return {
        emoji: '🥉',
        label: '보통 (C)',
        description: '문서 품질이 평균적입니다. 개선이 필요한 부분들이 있습니다.'
      };
    } else {
      return {
        emoji: '⚠️',
        label: '개선 필요 (D)',
        description: '문서 품질 개선이 시급합니다. 주요 이슈들을 우선적으로 해결하세요.'
      };
    }
  }

  getIssueIcon(severity) {
    const icons = {
      'critical': '🚨',
      'warning': '⚠️',
      'suggestion': '💡'
    };
    return icons[severity] || '📝';
  }

  // 초기화 함수들
  initKoreanSpellCheck() {
    // 한국어 맞춤법 패턴 초기화
    return {
      commonMistakes: new Map([
        ['되요', '돼요'],
        ['안되', '안 돼'],
        ['할수있', '할 수 있'],
        // 더 많은 패턴들...
      ])
    };
  }

  initMarkdownPatterns() {
    // 마크다운 패턴 초기화
    return {
      header: /^(#+)\s*(.*)$/,
      link: /\[([^\]]*)\]\(([^)]*)\)/g,
      image: /!\[([^\]]*)\]\(([^)]*)\)/g,
      codeBlock: /^```(\w*)/
    };
  }

  initConsistencyPatterns() {
    // 일관성 검사 패턴 초기화
    return {
      projectName: /^#\s+(.+)$/m,
      version: /(?:버전|version)[:\s]*([0-9]+\.[0-9]+\.[0-9]+)/gi
    };
  }
}

module.exports = DocumentReviewer;
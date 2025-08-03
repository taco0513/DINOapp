#!/usr/bin/env node

const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const YAML = require('yaml');
const DocumentTemplates = require('./templates');
const SuperClaudeIntegration = require('./superclaud-integration');
const DocumentReviewer = require('./document-reviewer');
const AIReviewer = require('./ai-reviewer');

class AutoDocsGenerator {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.docsPath = path.join(this.projectRoot, 'docs');
    this.configPath = path.join(this.projectRoot, '.auto-docs.yml');
    this.changeLogPath = path.join(this.projectRoot, 'CHANGELOG.md');
    this.progressPath = path.join(this.projectRoot, 'PROGRESS.md');
    
    this.config = this.loadConfig();
    this.fileChanges = new Map();
    this.debounceTimer = null;
    
    // 템플릿 시스템 초기화
    this.templates = new DocumentTemplates(this.config.docs.language);
    
    // SuperClaude 연동 초기화
    this.superClaudeIntegration = new SuperClaudeIntegration(this);
    
    // 문서 리뷰 시스템 초기화
    this.documentReviewer = new DocumentReviewer(this);
    this.aiReviewer = new AIReviewer(this);
    
    // 기본 제외 패턴
    this.defaultIgnore = [
      'node_modules/**',
      '.git/**',
      '*.log',
      '.DS_Store',
      'dist/**',
      'build/**',
      '.next/**',
      '.nuxt/**',
      'coverage/**'
    ];
  }

  loadConfig() {
    const defaultConfig = {
      watch: {
        paths: ['**/*'],
        ignore: this.defaultIgnore,
        debounceMs: 1000
      },
      docs: {
        autoGenerate: true,
        templates: {
          readme: true,
          api: true,
          changelog: true,
          progress: true
        },
        outputFormats: ['md'],
        language: 'ko'
      },
      git: {
        autoCommit: false,
        commitPrefix: '📝 docs:'
      },
      notifications: {
        enabled: true,
        missingDocs: true,
        changes: true
      }
    };

    try {
      if (fs.existsSync(this.configPath)) {
        const configFile = fs.readFileSync(this.configPath, 'utf8');
        const userConfig = YAML.parse(configFile);
        return { ...defaultConfig, ...userConfig };
      }
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  설정 파일 로드 실패: ${error.message}`));
    }

    return defaultConfig;
  }

  async init() {
    console.log(chalk.blue('🚀 Auto-Docs 시스템 초기화 중...'));
    
    // 필요한 디렉토리 생성
    await fs.ensureDir(this.docsPath);
    await fs.ensureDir(path.join(this.projectRoot, 'auto-docs', 'logs'));
    
    // 기본 설정 파일 생성
    if (!fs.existsSync(this.configPath)) {
      await this.createConfigFile();
    }

    // 초기 문서 생성
    await this.generateInitialDocs();
    
    // SuperClaude 연동 설정
    await this.superClaudeIntegration.integrateWithCheckpoint();
    
    // 리뷰 시스템 초기화
    await this.documentReviewer.init();
    await this.aiReviewer.init();
    
    console.log(chalk.green('✅ Auto-Docs 시스템 초기화 완료'));
  }

  async createConfigFile() {
    const configContent = YAML.stringify(this.config, { 
      indent: 2,
      quotingType: '"',
      forceQuotes: false 
    });
    
    await fs.writeFile(this.configPath, configContent);
    console.log(chalk.green(`✅ 설정 파일 생성: ${this.configPath}`));
  }

  async startWatching() {
    console.log(chalk.blue('👀 파일 변경 모니터링 시작...'));
    
    const watchPaths = this.config.watch.paths.map(p => 
      path.join(this.projectRoot, p)
    );
    
    const watcher = chokidar.watch(watchPaths, {
      ignored: this.config.watch.ignore,
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('add', (filePath) => this.handleFileChange('added', filePath))
      .on('change', (filePath) => this.handleFileChange('modified', filePath))
      .on('unlink', (filePath) => this.handleFileChange('deleted', filePath))
      .on('addDir', (dirPath) => this.handleFileChange('dir_added', dirPath))
      .on('unlinkDir', (dirPath) => this.handleFileChange('dir_deleted', dirPath))
      .on('error', (error) => console.error(chalk.red(`파일 모니터링 오류: ${error}`)));

    console.log(chalk.green('✅ 파일 모니터링 활성화'));
    
    // 프로세스 종료 시 정리
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 Auto-Docs 시스템 종료 중...'));
      watcher.close();
      process.exit(0);
    });
  }

  handleFileChange(action, filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);
    const timestamp = new Date().toISOString();
    
    // 변경 사항 기록
    if (!this.fileChanges.has(relativePath)) {
      this.fileChanges.set(relativePath, []);
    }
    
    this.fileChanges.get(relativePath).push({
      action,
      timestamp,
      path: relativePath
    });

    if (this.config.notifications.changes) {
      console.log(chalk.cyan(`📝 ${action}: ${relativePath}`));
    }

    // 디바운스된 문서 업데이트
    this.scheduleDocUpdate();
  }

  scheduleDocUpdate() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.updateDocumentation();
    }, this.config.watch.debounceMs);
  }

  async updateDocumentation() {
    try {
      console.log(chalk.blue('📚 문서 업데이트 중...'));
      
      // 변경 로그 업데이트
      await this.updateChangeLog();
      
      // README 업데이트 (필요시)
      await this.updateReadme();
      
      // API 문서 업데이트 (필요시)
      await this.updateApiDocs();
      
      // 프로그레스 업데이트
      await this.updateProgress();
      
      // 누락된 문서 확인
      await this.checkMissingDocs();
      
      // 문서 품질 리뷰 (설정된 경우)
      if (this.config.docs.autoReview !== false) {
        await this.performDocumentReview();
      }
      
      // Git 커밋 (설정된 경우)
      if (this.config.git.autoCommit) {
        await this.commitChanges();
      }
      
      // 변경 사항 초기화
      this.fileChanges.clear();
      
      console.log(chalk.green('✅ 문서 업데이트 완료'));
      
    } catch (error) {
      console.error(chalk.red(`문서 업데이트 오류: ${error.message}`));
    }
  }

  async updateChangeLog() {
    const changes = Array.from(this.fileChanges.entries());
    if (changes.length === 0) return;

    const timestamp = new Date().toLocaleString('ko-KR');
    const changeEntries = changes.map(([filePath, fileChanges]) => {
      const latestChange = fileChanges[fileChanges.length - 1];
      const actionEmoji = this.getActionEmoji(latestChange.action);
      return `- ${actionEmoji} \`${filePath}\` (${latestChange.action})`;
    }).join('\n');

    const newEntry = `\n## ${timestamp}\n\n${changeEntries}\n`;
    
    let existingContent = '';
    if (fs.existsSync(this.changeLogPath)) {
      existingContent = await fs.readFile(this.changeLogPath, 'utf8');
    } else {
      existingContent = '# 변경 로그\n\n이 파일은 프로젝트의 파일 변경 사항을 자동으로 추적합니다.\n';
    }

    const updatedContent = existingContent + newEntry;
    await fs.writeFile(this.changeLogPath, updatedContent);
  }

  getActionEmoji(action) {
    const emojiMap = {
      'added': '➕',
      'modified': '✏️',
      'deleted': '🗑️',
      'dir_added': '📁',
      'dir_deleted': '🗂️'
    };
    return emojiMap[action] || '📝';
  }

  async updateReadme() {
    const readmePath = path.join(this.projectRoot, 'README.md');
    
    // README가 없거나 자동 생성이 활성화된 경우에만 업데이트
    if (!fs.existsSync(readmePath) || this.config.docs.templates.readme) {
      await this.generateReadme();
    }
  }

  async generateReadme() {
    // 스마트 변수 생성
    const smartVariables = await this.templates.generateSmartVariables(this.projectRoot);
    
    // 최근 변경 사항 추가
    smartVariables.recentChanges = await this.getRecentChanges();
    
    // 템플릿을 사용하여 README 생성
    const readmeContent = this.templates.renderTemplate('readme', smartVariables);
    
    await fs.writeFile(path.join(this.projectRoot, 'README.md'), readmeContent);
  }

  async generateProjectStructure() {
    // 간단한 프로젝트 구조 생성 로직
    try {
      const structure = execSync('find . -type f -name "*.js" -o -name "*.ts" -o -name "*.md" | head -20', 
        { cwd: this.projectRoot, encoding: 'utf8' });
      return structure.trim().split('\n').map(line => line.replace('./', '')).join('\n');
    } catch {
      return '프로젝트 구조를 가져올 수 없습니다.';
    }
  }

  async getRecentChanges() {
    const changes = Array.from(this.fileChanges.entries()).slice(0, 5);
    if (changes.length === 0) return '최근 변경 사항이 없습니다.';
    
    return changes.map(([filePath, fileChanges]) => {
      const latestChange = fileChanges[fileChanges.length - 1];
      const actionEmoji = this.getActionEmoji(latestChange.action);
      return `- ${actionEmoji} \`${filePath}\``;
    }).join('\n');
  }

  async updateApiDocs() {
    // API 문서 자동 생성 로직 (향후 확장)
    const apiFiles = await this.findApiFiles();
    if (apiFiles.length > 0 && this.config.docs.templates.api) {
      console.log(chalk.yellow('📄 API 문서 생성 기능은 개발 중입니다.'));
    }
  }

  async findApiFiles() {
    // API 파일 검색 로직
    try {
      const apiPatterns = ['**/api/**/*.js', '**/routes/**/*.js', '**/controllers/**/*.js'];
      const glob = require('fast-glob');
      return await glob(apiPatterns, { cwd: this.projectRoot });
    } catch {
      return [];
    }
  }

  async updateProgress() {
    // PROGRESS.md 업데이트 로직
    if (!this.config.docs.templates.progress) return;
    
    const progressContent = `# 프로젝트 진행 상황

## 📊 파일 변경 통계

- 총 추적된 파일: ${this.fileChanges.size}개
- 마지막 업데이트: ${new Date().toLocaleString('ko-KR')}

## 🔄 최근 활동

${await this.getRecentChanges()}

## 📋 할 일

- [ ] 자동 생성된 문서 검토
- [ ] 누락된 문서 확인
- [ ] 테스트 커버리지 확인

---
*이 문서는 Auto-Docs 시스템에 의해 자동으로 업데이트됩니다.*
`;

    await fs.writeFile(this.progressPath, progressContent);
  }

  async checkMissingDocs() {
    if (!this.config.notifications.missingDocs) return;
    
    const missingDocs = [];
    
    // 기본적으로 있어야 할 문서들 확인
    const requiredDocs = ['README.md', 'package.json'];
    
    for (const doc of requiredDocs) {
      if (!fs.existsSync(path.join(this.projectRoot, doc))) {
        missingDocs.push(doc);
      }
    }
    
    // 폴더별 README 확인
    const directories = await this.getDirectories();
    for (const dir of directories) {
      const readmePath = path.join(dir, 'README.md');
      if (!fs.existsSync(readmePath)) {
        missingDocs.push(`${path.relative(this.projectRoot, readmePath)}`);
      }
    }
    
    if (missingDocs.length > 0) {
      console.log(chalk.yellow(`⚠️  누락된 문서 발견: ${missingDocs.join(', ')}`));
      
      // 누락 문서 리포트 생성
      await this.generateMissingDocsReport(missingDocs);
    }
  }

  async getDirectories() {
    const glob = require('fast-glob');
    const dirs = await glob(['**/'], { 
      cwd: this.projectRoot, 
      onlyDirectories: true,
      ignore: this.defaultIgnore 
    });
    return dirs.map(dir => path.join(this.projectRoot, dir));
  }

  async generateMissingDocsReport(missingDocs) {
    const reportPath = path.join(this.docsPath, 'missing-docs-report.md');
    const reportContent = `# 누락된 문서 리포트

생성 시간: ${new Date().toLocaleString('ko-KR')}

## 📋 누락된 문서 목록

${missingDocs.map(doc => `- [ ] \`${doc}\``).join('\n')}

## 🤖 자동 생성 제안

다음 명령어로 누락된 문서를 자동 생성할 수 있습니다:

\`\`\`bash
npx auto-docs generate --missing
\`\`\`

---
*이 리포트는 Auto-Docs 시스템에 의해 자동으로 생성됩니다.*
`;

    await fs.writeFile(reportPath, reportContent);
    console.log(chalk.blue(`📋 누락 문서 리포트 생성: ${reportPath}`));
  }

  async commitChanges() {
    try {
      execSync('git add .', { cwd: this.projectRoot });
      const commitMessage = `${this.config.git.commitPrefix} 자동 문서 업데이트`;
      execSync(`git commit -m "${commitMessage}"`, { cwd: this.projectRoot });
      console.log(chalk.green(`✅ Git 자동 커밋: ${commitMessage}`));
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Git 커밋 실패: ${error.message}`));
    }
  }

  async generateInitialDocs() {
    console.log(chalk.blue('📚 초기 문서 생성 중...'));
    
    await this.generateReadme();
    await this.updateProgress();
    
    console.log(chalk.green('✅ 초기 문서 생성 완료'));
  }

  async performDocumentReview() {
    try {
      console.log(chalk.blue('🔍 문서 품질 리뷰 시작...'));
      
      // 기본 품질 검사
      const reviewResults = await this.documentReviewer.reviewAllDocuments();
      
      if (reviewResults && reviewResults.overallScore < 80) {
        console.log(chalk.yellow(`⚠️ 문서 품질 개선이 필요합니다 (점수: ${reviewResults.overallScore}/100)`));
        
        // AI 리뷰 수행 (점수가 낮은 경우)
        if (this.config.docs.aiReview !== false) {
          await this.performAIReview(reviewResults);
        }
      } else if (reviewResults) {
        console.log(chalk.green(`✅ 문서 품질이 양호합니다 (점수: ${reviewResults.overallScore}/100)`));
      }
      
    } catch (error) {
      console.error(chalk.red(`문서 리뷰 중 오류: ${error.message}`));
    }
  }

  async performAIReview(basicReviewResults) {
    try {
      console.log(chalk.blue('🤖 AI 기반 심화 리뷰 시작...'));
      
      // 품질이 낮은 파일들에 대해 AI 리뷰 수행
      const lowQualityFiles = basicReviewResults.files.filter(file => file.score < 70);
      
      for (const file of lowQualityFiles.slice(0, 3)) { // 최대 3개 파일만
        const filePath = path.join(this.projectRoot, file.path);
        if (fs.existsSync(filePath)) {
          const content = await fs.readFile(filePath, 'utf8');
          const aiAnalysis = await this.aiReviewer.performAIReview(file.path, content);
          
          if (aiAnalysis && aiAnalysis.recommendations.length > 0) {
            console.log(chalk.cyan(`💡 ${file.path}: ${aiAnalysis.recommendations.length}개 AI 추천사항 생성`));
          }
        }
      }
      
    } catch (error) {
      console.error(chalk.red(`AI 리뷰 중 오류: ${error.message}`));
    }
  }

  // 리뷰 결과 요약 생성
  async generateReviewSummary() {
    try {
      const reviewResults = await this.documentReviewer.reviewAllDocuments();
      if (!reviewResults) return null;

      const summary = {
        timestamp: new Date().toISOString(),
        overallScore: reviewResults.overallScore,
        totalFiles: reviewResults.summary.totalFiles,
        totalIssues: reviewResults.summary.totalIssues,
        criticalIssues: reviewResults.summary.criticalIssues,
        topIssues: this.extractTopIssues(reviewResults),
        recommendations: this.extractTopRecommendations(reviewResults)
      };

      // 요약을 README나 PROGRESS에 포함할 수 있도록 반환
      return summary;

    } catch (error) {
      console.error(chalk.red(`리뷰 요약 생성 중 오류: ${error.message}`));
      return null;
    }
  }

  extractTopIssues(reviewResults) {
    const allIssues = [];
    
    reviewResults.files.forEach(file => {
      file.issues.forEach(issue => {
        allIssues.push({
          file: file.path,
          ...issue
        });
      });
    });

    // 심각도별로 정렬하고 상위 5개 반환
    return allIssues
      .sort((a, b) => {
        const severityOrder = { critical: 3, warning: 2, suggestion: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 5);
  }

  extractTopRecommendations(reviewResults) {
    const recommendations = [];
    
    reviewResults.files.forEach(file => {
      if (file.score < 80) {
        recommendations.push(`${file.path}: 품질 개선 필요 (${file.score}/100점)`);
      }
    });

    return recommendations.slice(0, 3);
  }

  async stop() {
    console.log(chalk.yellow('🛑 Auto-Docs 시스템 중지'));
  }
}

// CLI에서 직접 실행되는 경우
if (require.main === module) {
  const autoDocsGenerator = new AutoDocsGenerator();
  
  autoDocsGenerator.init()
    .then(() => autoDocsGenerator.startWatching())
    .catch(error => {
      console.error(chalk.red(`시스템 시작 오류: ${error.message}`));
      process.exit(1);
    });
}

module.exports = AutoDocsGenerator;
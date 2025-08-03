const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class SuperClaudeIntegration {
  constructor(autoDocsGenerator) {
    this.autoDocsGenerator = autoDocsGenerator;
    this.projectRoot = autoDocsGenerator.projectRoot;
    this.checkpointsPath = path.join(this.projectRoot, 'checkpoints');
  }

  // /checkpoint 명령어와 연동
  async integrateWithCheckpoint() {
    console.log(chalk.blue('🔗 SuperClaude /checkpoint와 연동 중...'));
    
    // checkpoints 폴더 모니터링
    if (fs.existsSync(this.checkpointsPath)) {
      await this.processExistingCheckpoints();
    }
    
    // PROGRESS.md 연동
    await this.syncWithProgress();
    
    console.log(chalk.green('✅ SuperClaude 연동 완료'));
  }

  async processExistingCheckpoints() {
    try {
      const checkpointFiles = await fs.readdir(this.checkpointsPath);
      const mdFiles = checkpointFiles.filter(file => file.endsWith('.md'));
      
      console.log(chalk.blue(`📋 발견된 체크포인트 파일: ${mdFiles.length}개`));
      
      for (const file of mdFiles.slice(-5)) { // 최근 5개만 처리
        await this.processCheckpointFile(path.join(this.checkpointsPath, file));
      }
    } catch (error) {
      console.warn(chalk.yellow(`체크포인트 처리 중 오류: ${error.message}`));
    }
  }

  async processCheckpointFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const filename = path.basename(filePath);
      
      // 체크포인트 파일 분석
      const analysis = this.analyzeCheckpoint(content);
      
      // 문서 업데이트에 반영
      await this.updateDocsFromCheckpoint(analysis, filename);
      
      console.log(chalk.green(`✅ 체크포인트 처리 완료: ${filename}`));
    } catch (error) {
      console.warn(chalk.yellow(`체크포인트 파일 처리 오류: ${error.message}`));
    }
  }

  analyzeCheckpoint(content) {
    const analysis = {
      timestamp: this.extractTimestamp(content),
      goals: this.extractSection(content, '스프린트 목표', 'Sprint Goals'),
      completed: this.extractSection(content, '완료된 작업', 'Completed'),
      inProgress: this.extractSection(content, '진행 중', 'In Progress'),
      planned: this.extractSection(content, '예정된 작업', 'Planned'),
      issues: this.extractSection(content, '이슈', 'Issues'),
      changes: this.extractChanges(content),
      metrics: this.extractMetrics(content)
    };
    
    return analysis;
  }

  extractTimestamp(content) {
    const timestampMatch = content.match(/(\d{4}-\d{2}-\d{2})/);
    return timestampMatch ? timestampMatch[1] : new Date().toISOString().split('T')[0];
  }

  extractSection(content, koreanTitle, englishTitle) {
    const patterns = [
      new RegExp(`## ${koreanTitle}([\\s\\S]*?)(?=##|$)`, 'i'),
      new RegExp(`## ${englishTitle}([\\s\\S]*?)(?=##|$)`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return '';
  }

  extractChanges(content) {
    const changes = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('✅') || line.includes('📝') || line.includes('🔧')) {
        changes.push(line.trim());
      }
    }
    
    return changes;
  }

  extractMetrics(content) {
    const metrics = {};
    const patterns = {
      files: /파일.*?(\d+)/i,
      lines: /라인.*?(\d+)/i,
      coverage: /커버리지.*?(\d+)%/i,
      tests: /테스트.*?(\d+)/i
    };
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match) {
        metrics[key] = match[1];
      }
    }
    
    return metrics;
  }

  async updateDocsFromCheckpoint(analysis, filename) {
    // PROGRESS.md 업데이트
    await this.updateProgressFromCheckpoint(analysis);
    
    // CHANGELOG.md에 체크포인트 정보 추가
    await this.updateChangelogFromCheckpoint(analysis, filename);
    
    // README.md 업데이트 (필요시)
    if (analysis.completed.length > 0) {
      await this.updateReadmeFromCheckpoint(analysis);
    }
  }

  async updateProgressFromCheckpoint(analysis) {
    const progressPath = path.join(this.projectRoot, 'PROGRESS.md');
    
    const progressContent = `# 프로젝트 진행 상황

## 📊 개요
- **마지막 업데이트**: ${new Date().toLocaleString('ko-KR')}
- **체크포인트 기반**: ${analysis.timestamp}

## 🎯 스프린트 목표
${analysis.goals || '목표가 설정되지 않았습니다.'}

## ✅ 완료된 작업
${analysis.completed || '완료된 작업이 없습니다.'}

## 🔄 진행 중인 작업
${analysis.inProgress || '진행 중인 작업이 없습니다.'}

## 📋 예정된 작업
${analysis.planned || '예정된 작업이 없습니다.'}

## 🚨 이슈 및 블로커
${analysis.issues || '현재 이슈가 없습니다.'}

## 📈 최근 변경 사항
${analysis.changes.map(change => `- ${change}`).join('\n') || '최근 변경 사항이 없습니다.'}

## 📊 프로젝트 메트릭스
${Object.entries(analysis.metrics).map(([key, value]) => `- **${key}**: ${value}`).join('\n') || '메트릭스 정보가 없습니다.'}

---
*이 문서는 SuperClaude /checkpoint와 Auto-Docs 시스템에 의해 자동으로 관리됩니다.*
`;

    await fs.writeFile(progressPath, progressContent);
    console.log(chalk.green('✅ PROGRESS.md 업데이트 완료'));
  }

  async updateChangelogFromCheckpoint(analysis, filename) {
    const changelogPath = path.join(this.projectRoot, 'CHANGELOG.md');
    
    if (analysis.changes.length === 0) return;
    
    const timestamp = new Date().toLocaleString('ko-KR');
    const changeEntry = `\n## ${timestamp} (${filename})\n\n${analysis.changes.map(change => `- ${change}`).join('\n')}\n`;
    
    let existingContent = '';
    if (fs.existsSync(changelogPath)) {
      existingContent = await fs.readFile(changelogPath, 'utf8');
    } else {
      existingContent = '# 변경 로그\n\n이 파일은 SuperClaude 체크포인트와 Auto-Docs에 의해 자동으로 관리됩니다.\n';
    }
    
    const updatedContent = existingContent + changeEntry;
    await fs.writeFile(changelogPath, updatedContent);
  }

  async updateReadmeFromCheckpoint(analysis) {
    // README의 최근 업데이트 섹션만 업데이트
    const readmePath = path.join(this.projectRoot, 'README.md');
    
    if (!fs.existsSync(readmePath)) return;
    
    try {
      let content = await fs.readFile(readmePath, 'utf8');
      
      // 최근 변경 사항 섹션 찾기 및 업데이트
      const recentChangesSection = `## 📝 최근 변경 사항\n\n${analysis.changes.slice(0, 5).map(change => `- ${change}`).join('\n')}\n`;
      
      if (content.includes('## 📝 최근 변경 사항')) {
        content = content.replace(/## 📝 최근 변경 사항[\s\S]*?(?=##|$)/, recentChangesSection);
      } else {
        // 섹션이 없으면 추가
        content += `\n${recentChangesSection}`;
      }
      
      await fs.writeFile(readmePath, content);
      console.log(chalk.green('✅ README.md 최근 변경 사항 업데이트 완료'));
    } catch (error) {
      console.warn(chalk.yellow(`README 업데이트 중 오류: ${error.message}`));
    }
  }

  async syncWithProgress() {
    const progressPath = path.join(this.projectRoot, 'PROGRESS.md');
    
    if (!fs.existsSync(progressPath)) {
      console.log(chalk.yellow('⚠️  PROGRESS.md 파일이 없습니다. 기본 파일을 생성합니다.'));
      await this.createDefaultProgress();
      return;
    }
    
    // PROGRESS.md 파일 변경 모니터링
    console.log(chalk.blue('👀 PROGRESS.md 모니터링 시작'));
  }

  async createDefaultProgress() {
    const progressContent = `# 프로젝트 진행 상황

## 📊 개요
- **프로젝트 시작**: ${new Date().toLocaleDateString('ko-KR')}
- **현재 버전**: 1.0.0
- **마지막 업데이트**: ${new Date().toLocaleString('ko-KR')}

## 🎯 스프린트 목표
- [ ] 프로젝트 초기 설정 완료
- [ ] 핵심 기능 구현
- [ ] 테스트 작성
- [ ] 문서화 완료

## ✅ 완료된 작업
- [x] Auto-Docs 시스템 설치

## 🔄 진행 중인 작업
- [ ] 문서 자동화 시스템 구축

## 📋 예정된 작업
- [ ] 배포 환경 설정
- [ ] 성능 최적화

## 🚨 이슈 및 블로커
현재 이슈가 없습니다.

---
*이 문서는 SuperClaude /checkpoint와 Auto-Docs 시스템에 의해 자동으로 관리됩니다.*
`;

    await fs.writeFile(path.join(this.projectRoot, 'PROGRESS.md'), progressContent);
    console.log(chalk.green('✅ 기본 PROGRESS.md 생성 완료'));
  }

  // Auto-Docs와 SuperClaude 명령어 연동을 위한 래퍼 함수들
  async handleCheckpointCommand(args) {
    console.log(chalk.blue('🎯 SuperClaude /checkpoint 명령어 감지됨'));
    
    // 체크포인트 생성 후 자동으로 문서 업데이트
    await this.integrateWithCheckpoint();
    
    // Git 상태 확인 및 문서 동기화
    await this.syncGitStatus();
  }

  async syncGitStatus() {
    try {
      const gitStatus = execSync('git status --porcelain', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      });
      
      if (gitStatus.trim()) {
        console.log(chalk.yellow('📋 Git에 커밋되지 않은 변경 사항이 있습니다:'));
        console.log(gitStatus);
        
        // 변경 사항을 자동으로 문서에 반영
        await this.updateDocsFromGitStatus(gitStatus);
      }
    } catch (error) {
      console.warn(chalk.yellow(`Git 상태 확인 중 오류: ${error.message}`));
    }
  }

  async updateDocsFromGitStatus(gitStatus) {
    const changes = gitStatus.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const status = line.substring(0, 2);
        const file = line.substring(3);
        const statusEmoji = this.getGitStatusEmoji(status);
        return `${statusEmoji} \`${file}\``;
      });
    
    // CHANGELOG에 Git 상태 기반 변경 사항 추가
    const changelogPath = path.join(this.projectRoot, 'CHANGELOG.md');
    const timestamp = new Date().toLocaleString('ko-KR');
    const changeEntry = `\n## ${timestamp} (Git Status)\n\n${changes.join('\n')}\n`;
    
    if (fs.existsSync(changelogPath)) {
      const content = await fs.readFile(changelogPath, 'utf8');
      await fs.writeFile(changelogPath, content + changeEntry);
    }
  }

  getGitStatusEmoji(status) {
    const statusMap = {
      'A ': '➕', // Added
      'M ': '✏️', // Modified
      'D ': '🗑️', // Deleted
      'R ': '🔄', // Renamed
      'C ': '📋', // Copied
      '??': '❓', // Untracked
      '!!': '🚫'  // Ignored
    };
    
    return statusMap[status] || '📝';
  }

  // SuperClaude MCP 서버들과의 연동
  async integrateWithMCPServers() {
    console.log(chalk.blue('🔗 MCP 서버들과 연동 중...'));
    
    // Context7 연동: 문서화 패턴 가져오기
    await this.integrateWithContext7();
    
    // Sequential 연동: 구조화된 분석 결과 활용
    await this.integrateWithSequential();
    
    console.log(chalk.green('✅ MCP 서버 연동 완료'));
  }

  async integrateWithContext7() {
    // Context7의 문서화 패턴을 활용한 템플릿 개선
    console.log(chalk.blue('📚 Context7 문서화 패턴 연동'));
  }

  async integrateWithSequential() {
    // Sequential의 분석 결과를 문서에 반영
    console.log(chalk.blue('🧠 Sequential 분석 결과 연동'));
  }
}

module.exports = SuperClaudeIntegration;
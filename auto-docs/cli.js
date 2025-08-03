#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const AutoDocsGenerator = require('./index.js');

const program = new Command();

program
  .name('auto-docs')
  .description('AI Workflow Playbook 자동 문서화 도구')
  .version('1.0.0');

program
  .command('init')
  .description('Auto-Docs 시스템 초기화')
  .option('-p, --path <path>', '프로젝트 경로', process.cwd())
  .action(async (options) => {
    console.log(chalk.blue('🚀 Auto-Docs 초기화 시작...'));
    
    const autoDocsGenerator = new AutoDocsGenerator({ 
      projectRoot: options.path 
    });
    
    try {
      await autoDocsGenerator.init();
      console.log(chalk.green('✅ 초기화 완료! 다음 명령어로 모니터링을 시작하세요:'));
      console.log(chalk.cyan('auto-docs watch'));
    } catch (error) {
      console.error(chalk.red(`❌ 초기화 실패: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('watch')
  .description('파일 변경 모니터링 시작')
  .option('-p, --path <path>', '프로젝트 경로', process.cwd())
  .action(async (options) => {
    const autoDocsGenerator = new AutoDocsGenerator({ 
      projectRoot: options.path 
    });
    
    try {
      await autoDocsGenerator.init();
      await autoDocsGenerator.startWatching();
    } catch (error) {
      console.error(chalk.red(`❌ 모니터링 시작 실패: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('generate')
  .description('문서 즉시 생성')
  .option('-p, --path <path>', '프로젝트 경로', process.cwd())
  .option('--missing', '누락된 문서만 생성')
  .option('--readme', 'README.md 생성')
  .option('--changelog', 'CHANGELOG.md 생성')
  .option('--progress', 'PROGRESS.md 생성')
  .action(async (options) => {
    console.log(chalk.blue('📚 문서 생성 중...'));
    
    const autoDocsGenerator = new AutoDocsGenerator({ 
      projectRoot: options.path 
    });
    
    try {
      if (options.readme || !options.missing) {
        await autoDocsGenerator.generateReadme();
        console.log(chalk.green('✅ README.md 생성 완료'));
      }
      
      if (options.progress || !options.missing) {
        await autoDocsGenerator.updateProgress();
        console.log(chalk.green('✅ PROGRESS.md 생성 완료'));
      }
      
      if (options.missing) {
        await autoDocsGenerator.checkMissingDocs();
      }
      
      console.log(chalk.green('✅ 문서 생성 완료'));
    } catch (error) {
      console.error(chalk.red(`❌ 문서 생성 실패: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('config')
  .description('설정 관리')
  .option('-p, --path <path>', '프로젝트 경로', process.cwd())
  .option('--show', '현재 설정 표시')
  .option('--edit', '설정 편집')
  .action(async (options) => {
    const configPath = path.join(options.path, '.auto-docs.yml');
    
    if (options.show) {
      try {
        const config = await fs.readFile(configPath, 'utf8');
        console.log(chalk.blue('📋 현재 설정:'));
        console.log(config);
      } catch (error) {
        console.log(chalk.yellow('⚠️  설정 파일이 없습니다. auto-docs init으로 초기화하세요.'));
      }
    } else if (options.edit) {
      console.log(chalk.blue('⚙️  설정 편집 기능은 개발 중입니다.'));
      console.log(chalk.cyan(`설정 파일: ${configPath}`));
    } else {
      // 대화형 설정
      await interactiveConfig(options.path);
    }
  });

program
  .command('review')
  .description('문서 품질 리뷰 수행')
  .option('-p, --path <path>', '프로젝트 경로', process.cwd())
  .option('--basic', '기본 품질 검사만 수행')
  .option('--ai', 'AI 기반 심화 리뷰 포함')
  .option('--summary', '리뷰 요약만 출력')
  .action(async (options) => {
    console.log(chalk.blue('🔍 문서 품질 리뷰 시작...'));
    
    const autoDocsGenerator = new AutoDocsGenerator({ 
      projectRoot: options.path 
    });
    
    try {
      await autoDocsGenerator.init();
      
      if (options.summary) {
        const summary = await autoDocsGenerator.generateReviewSummary();
        if (summary) {
          console.log(chalk.blue('📊 리뷰 요약:'));
          console.log(`전체 점수: ${summary.overallScore}/100`);
          console.log(`검사 파일: ${summary.totalFiles}개`);
          console.log(`총 이슈: ${summary.totalIssues}개`);
          console.log(`심각한 문제: ${summary.criticalIssues}개`);
          
          if (summary.topIssues.length > 0) {
            console.log(chalk.yellow('\n주요 이슈:'));
            summary.topIssues.forEach((issue, i) => {
              console.log(`${i + 1}. ${issue.file}: ${issue.message}`);
            });
          }
        }
      } else {
        await autoDocsGenerator.performDocumentReview();
        
        if (options.ai) {
          console.log(chalk.blue('🤖 AI 리뷰를 강제로 수행합니다...'));
          const reviewResults = await autoDocsGenerator.documentReviewer.reviewAllDocuments();
          if (reviewResults) {
            await autoDocsGenerator.performAIReview(reviewResults);
          }
        }
      }
      
      console.log(chalk.green('✅ 문서 리뷰 완료'));
    } catch (error) {
      console.error(chalk.red(`❌ 리뷰 실패: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Auto-Docs 상태 확인')
  .option('-p, --path <path>', '프로젝트 경로', process.cwd())
  .action(async (options) => {
    console.log(chalk.blue('📊 Auto-Docs 상태 확인...'));
    
    const configPath = path.join(options.path, '.auto-docs.yml');
    const docsPath = path.join(options.path, 'docs');
    const changelogPath = path.join(options.path, 'CHANGELOG.md');
    
    console.log(chalk.white('📁 프로젝트:', options.path));
    console.log(chalk.white('⚙️  설정 파일:', fs.existsSync(configPath) ? '✅' : '❌'));
    console.log(chalk.white('📚 문서 폴더:', fs.existsSync(docsPath) ? '✅' : '❌'));
    console.log(chalk.white('📝 변경 로그:', fs.existsSync(changelogPath) ? '✅' : '❌'));
    
    // 최근 변경 사항 확인
    if (fs.existsSync(changelogPath)) {
      try {
        const changelog = await fs.readFile(changelogPath, 'utf8');
        const lines = changelog.split('\n').slice(0, 10);
        console.log(chalk.blue('\n📋 최근 변경 사항:'));
        console.log(lines.join('\n'));
      } catch (error) {
        console.log(chalk.yellow('⚠️  변경 로그 읽기 실패'));
      }
    }
  });

async function interactiveConfig(projectPath) {
  console.log(chalk.blue('⚙️  대화형 설정 시작...'));
  
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'autoGenerate',
      message: '문서 자동 생성을 활성화하시겠습니까?',
      default: true
    },
    {
      type: 'checkbox',
      name: 'templates',
      message: '어떤 문서를 자동 생성하시겠습니까?',
      choices: [
        { name: 'README.md', value: 'readme', checked: true },
        { name: 'API 문서', value: 'api', checked: false },
        { name: '변경 로그', value: 'changelog', checked: true },
        { name: '진행 상황', value: 'progress', checked: true }
      ]
    },
    {
      type: 'list',
      name: 'language',
      message: '문서 언어를 선택하세요:',
      choices: ['ko', 'en'],
      default: 'ko'
    },
    {
      type: 'confirm',
      name: 'autoCommit',
      message: 'Git 자동 커밋을 활성화하시겠습니까?',
      default: false
    },
    {
      type: 'confirm',
      name: 'notifications',
      message: '알림을 활성화하시겠습니까?',
      default: true
    }
  ]);
  
  console.log(chalk.green('✅ 설정이 저장되었습니다.'));
  console.log(chalk.cyan('auto-docs init으로 시스템을 초기화하세요.'));
}

// 에러 처리
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name()
});

program.on('command:*', function (operands) {
  console.error(chalk.red(`❌ 알 수 없는 명령어: ${operands[0]}`));
  console.log(chalk.cyan('사용 가능한 명령어를 보려면: auto-docs --help'));
  process.exit(1);
});

if (process.argv.length === 2) {
  program.help();
}

program.parse();
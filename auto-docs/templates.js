const fs = require('fs-extra');
const path = require('path');

class DocumentTemplates {
  constructor(language = 'ko') {
    this.language = language;
    this.templates = {
      ko: {
        readme: this.getKoreanReadmeTemplate(),
        api: this.getKoreanApiTemplate(),
        changelog: this.getKoreanChangelogTemplate(),
        progress: this.getKoreanProgressTemplate(),
        component: this.getKoreanComponentTemplate(),
        feature: this.getKoreanFeatureTemplate()
      },
      en: {
        readme: this.getEnglishReadmeTemplate(),
        api: this.getEnglishApiTemplate(),
        changelog: this.getEnglishChangelogTemplate(),
        progress: this.getEnglishProgressTemplate(),
        component: this.getEnglishComponentTemplate(),
        feature: this.getEnglishFeatureTemplate()
      }
    };
  }

  getTemplate(type) {
    return this.templates[this.language]?.[type] || this.templates['ko'][type];
  }

  // 한국어 템플릿들
  getKoreanReadmeTemplate() {
    return `# {{projectName}}

{{description}}

## 🚀 빠른 시작

\`\`\`bash
# 의존성 설치
{{installCommand}}

# 개발 서버 시작
{{startCommand}}
\`\`\`

## 📁 프로젝트 구조

\`\`\`
{{projectStructure}}
\`\`\`

## ✨ 주요 기능

{{features}}

## 🛠️ 사용된 기술

{{techStack}}

## 📝 API 문서

{{apiDocs}}

## 🧪 테스트

\`\`\`bash
# 테스트 실행
{{testCommand}}

# 테스트 커버리지 확인
{{coverageCommand}}
\`\`\`

## 🚀 배포

{{deploymentInfo}}

## 📋 할 일

{{todoList}}

## 🤝 기여하기

{{contributionGuide}}

## 📄 라이선스

{{license}}

---
*이 README는 Auto-Docs 시스템에 의해 자동으로 생성되고 관리됩니다.*
*마지막 업데이트: {{lastUpdate}}*
`;
  }

  getKoreanApiTemplate() {
    return `# API 문서

## 개요

{{apiOverview}}

## 기본 정보

- **Base URL**: \`{{baseUrl}}\`
- **API 버전**: \`{{apiVersion}}\`
- **인증 방식**: {{authMethod}}

## 엔드포인트

{{endpoints}}

## 에러 코드

| 코드 | 메시지 | 설명 |
|------|--------|------|
{{errorCodes}}

## 예제

{{examples}}

---
*이 API 문서는 Auto-Docs 시스템에 의해 자동으로 생성됩니다.*
*마지막 업데이트: {{lastUpdate}}*
`;
  }

  getKoreanChangelogTemplate() {
    return `# 변경 로그

이 파일은 프로젝트의 모든 중요한 변경 사항을 자동으로 추적합니다.

## [Unreleased]

{{unreleased}}

{{changelogEntries}}

---
*이 변경 로그는 Auto-Docs 시스템에 의해 자동으로 생성됩니다.*
`;
  }

  getKoreanProgressTemplate() {
    return `# 프로젝트 진행 상황

## 📊 개요

- **프로젝트 시작**: {{startDate}}
- **현재 버전**: {{currentVersion}}
- **마지막 업데이트**: {{lastUpdate}}

## 🎯 스프린트 목표

{{sprintGoals}}

## ✅ 완료된 작업

{{completedTasks}}

## 🔄 진행 중인 작업

{{inProgressTasks}}

## 📋 예정된 작업

{{plannedTasks}}

## 📈 통계

- **총 파일 수**: {{totalFiles}}
- **코드 라인 수**: {{linesOfCode}}
- **테스트 커버리지**: {{testCoverage}}%

## 🚨 이슈 및 블로커

{{issues}}

---
*이 진행 상황 문서는 Auto-Docs 시스템에 의해 자동으로 업데이트됩니다.*
`;
  }

  getKoreanComponentTemplate() {
    return `# {{componentName}} 컴포넌트

## 개요

{{componentDescription}}

## 사용법

\`\`\`jsx
{{usageExample}}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
{{propsTable}}

## 예제

{{examples}}

## 스타일링

{{styling}}

## 접근성

{{accessibility}}

---
*이 컴포넌트 문서는 Auto-Docs 시스템에 의해 자동으로 생성됩니다.*
*마지막 업데이트: {{lastUpdate}}*
`;
  }

  getKoreanFeatureTemplate() {
    return `# {{featureName}} 기능

## 📋 기능 개요

{{featureDescription}}

## 🎯 목표

{{objectives}}

## 🛠️ 구현 상태

- [{{implementationStatus}}] 백엔드 구현
- [{{implementationStatus}}] 프론트엔드 구현  
- [{{implementationStatus}}] 테스트 작성
- [{{implementationStatus}}] 문서화

## 📐 기술 스펙

{{technicalSpec}}

## 🧪 테스트 계획

{{testPlan}}

## 📝 변경 사항

{{changes}}

## 🔗 관련 링크

{{relatedLinks}}

---
*이 기능 문서는 Auto-Docs 시스템에 의해 자동으로 생성됩니다.*
*마지막 업데이트: {{lastUpdate}}*
`;
  }

  // 영어 템플릿들 (간단 버전)
  getEnglishReadmeTemplate() {
    return `# {{projectName}}

{{description}}

## 🚀 Quick Start

\`\`\`bash
{{installCommand}}
{{startCommand}}
\`\`\`

## 📁 Project Structure

\`\`\`
{{projectStructure}}
\`\`\`

## ✨ Features

{{features}}

## 🛠️ Tech Stack

{{techStack}}

---
*This README is automatically generated and maintained by Auto-Docs system.*
*Last updated: {{lastUpdate}}*
`;
  }

  getEnglishApiTemplate() {
    return `# API Documentation

## Overview

{{apiOverview}}

## Base Information

- **Base URL**: \`{{baseUrl}}\`
- **API Version**: \`{{apiVersion}}\`
- **Authentication**: {{authMethod}}

## Endpoints

{{endpoints}}

---
*This API documentation is automatically generated by Auto-Docs system.*
*Last updated: {{lastUpdate}}*
`;
  }

  getEnglishChangelogTemplate() {
    return `# Changelog

All notable changes to this project will be automatically documented in this file.

## [Unreleased]

{{unreleased}}

{{changelogEntries}}

---
*This changelog is automatically generated by Auto-Docs system.*
`;
  }

  getEnglishProgressTemplate() {
    return `# Project Progress

## 📊 Overview

- **Project Started**: {{startDate}}
- **Current Version**: {{currentVersion}}
- **Last Updated**: {{lastUpdate}}

## ✅ Completed Tasks

{{completedTasks}}

## 🔄 In Progress

{{inProgressTasks}}

## 📋 Planned

{{plannedTasks}}

---
*This progress document is automatically updated by Auto-Docs system.*
`;
  }

  getEnglishComponentTemplate() {
    return `# {{componentName}} Component

## Overview

{{componentDescription}}

## Usage

\`\`\`jsx
{{usageExample}}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
{{propsTable}}

---
*This component documentation is automatically generated by Auto-Docs system.*
*Last updated: {{lastUpdate}}*
`;
  }

  getEnglishFeatureTemplate() {
    return `# {{featureName}} Feature

## 📋 Overview

{{featureDescription}}

## 🎯 Objectives

{{objectives}}

## 🛠️ Implementation Status

- [{{implementationStatus}}] Backend Implementation
- [{{implementationStatus}}] Frontend Implementation  
- [{{implementationStatus}}] Testing
- [{{implementationStatus}}] Documentation

---
*This feature documentation is automatically generated by Auto-Docs system.*
*Last updated: {{lastUpdate}}*
`;
  }

  // 템플릿 변수 치환
  renderTemplate(templateType, variables = {}) {
    let template = this.getTemplate(templateType);
    
    // 기본 변수들
    const defaultVariables = {
      lastUpdate: new Date().toLocaleString(this.language === 'ko' ? 'ko-KR' : 'en-US'),
      projectName: path.basename(process.cwd()),
      installCommand: 'npm install',
      startCommand: 'npm start',
      testCommand: 'npm test',
      coverageCommand: 'npm run coverage'
    };
    
    const allVariables = { ...defaultVariables, ...variables };
    
    // 템플릿 변수 치환
    for (const [key, value] of Object.entries(allVariables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, value || '');
    }
    
    // 빈 템플릿 변수 제거
    template = template.replace(/{{[^}]+}}/g, '');
    
    return template;
  }

  // 프로젝트 분석을 통한 스마트 변수 생성
  async generateSmartVariables(projectRoot) {
    const variables = {};
    
    try {
      // package.json 분석
      const packageJsonPath = path.join(projectRoot, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        variables.projectName = packageJson.name;
        variables.description = packageJson.description;
        variables.currentVersion = packageJson.version;
        variables.license = packageJson.license;
        
        // 스크립트 명령 추론
        if (packageJson.scripts) {
          variables.startCommand = packageJson.scripts.start ? 'npm start' : 'npm run dev';
          variables.testCommand = packageJson.scripts.test ? 'npm test' : 'npm run test';
          variables.installCommand = 'npm install';
        }
        
        // 기술 스택 분석
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        variables.techStack = this.analyzeTechStack(deps);
      }
      
      // 프로젝트 구조 분석
      variables.projectStructure = await this.generateProjectStructure(projectRoot);
      
      // README 존재 확인
      const readmePath = path.join(projectRoot, 'README.md');
      if (fs.existsSync(readmePath)) {
        const readmeContent = await fs.readFile(readmePath, 'utf8');
        // 기존 README에서 정보 추출
        variables.features = this.extractFeatures(readmeContent);
      }
      
    } catch (error) {
      console.warn(`스마트 변수 생성 중 오류: ${error.message}`);
    }
    
    return variables;
  }

  analyzeTechStack(dependencies) {
    const techCategories = {
      frontend: ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt'],
      backend: ['express', 'koa', 'fastify', 'nestjs'],
      database: ['mongodb', 'mongoose', 'mysql', 'postgres', 'sqlite'],
      testing: ['jest', 'mocha', 'cypress', 'playwright'],
      styling: ['styled-components', 'emotion', 'tailwindcss', 'scss'],
      build: ['webpack', 'vite', 'rollup', 'parcel']
    };
    
    const detected = {};
    
    for (const [category, libs] of Object.entries(techCategories)) {
      detected[category] = libs.filter(lib => 
        Object.keys(dependencies).some(dep => dep.includes(lib))
      );
    }
    
    // 마크다운 리스트 형태로 반환
    return Object.entries(detected)
      .filter(([, libs]) => libs.length > 0)
      .map(([category, libs]) => `- **${category}**: ${libs.join(', ')}`)
      .join('\n');
  }

  async generateProjectStructure(projectRoot) {
    try {
      const { execSync } = require('child_process');
      const structure = execSync('find . -type f -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.md" | head -20', 
        { cwd: projectRoot, encoding: 'utf8' });
      
      return structure.trim()
        .split('\n')
        .map(line => line.replace('./', ''))
        .join('\n');
    } catch {
      return '프로젝트 구조를 가져올 수 없습니다.';
    }
  }

  extractFeatures(readmeContent) {
    // README에서 기능 목록 추출 (간단한 패턴 매칭)
    const featurePatterns = [
      /## .*기능.*/gi,
      /## .*Features.*/gi,
      /## ✨.*/gi,
      /- .*기능.*/gi
    ];
    
    let features = '';
    for (const pattern of featurePatterns) {
      const matches = readmeContent.match(pattern);
      if (matches) {
        features = matches.join('\n');
        break;
      }
    }
    
    return features || '- 주요 기능을 여기에 작성하세요';
  }
}

module.exports = DocumentTemplates;
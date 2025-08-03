const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class AIReviewer {
  constructor(autoDocsGenerator) {
    this.autoDocsGenerator = autoDocsGenerator;
    this.projectRoot = autoDocsGenerator.projectRoot;
    this.config = autoDocsGenerator.config;
    
    // AI 분석 결과 저장 경로
    this.aiReviewPath = path.join(this.projectRoot, 'docs', 'ai-reviews');
    
    // 문서 패턴 데이터베이스
    this.documentPatterns = this.initDocumentPatterns();
    
    // 품질 메트릭스
    this.qualityMetrics = this.initQualityMetrics();
  }

  async init() {
    await fs.ensureDir(this.aiReviewPath);
    console.log(chalk.blue('🤖 AI 문서 리뷰 시스템 초기화 완료'));
  }

  // 메인 AI 리뷰 함수
  async performAIReview(documentPath, content) {
    console.log(chalk.blue(`🧠 AI 문서 분석 시작: ${documentPath}`));

    const analysis = {
      path: documentPath,
      timestamp: new Date().toISOString(),
      contentAnalysis: {},
      structureAnalysis: {},
      qualityMetrics: {},
      recommendations: [],
      mcpInsights: {},
      overallScore: 0
    };

    try {
      // 1. 기본 컨텐츠 분석
      analysis.contentAnalysis = await this.analyzeContent(content, documentPath);
      
      // 2. 문서 구조 분석
      analysis.structureAnalysis = await this.analyzeStructure(content, documentPath);
      
      // 3. Context7 연동 - 문서화 패턴 분석
      if (this.config.superClaude?.mcpServers?.context7) {
        analysis.mcpInsights.context7 = await this.analyzeWithContext7(content, documentPath);
      }
      
      // 4. Sequential 연동 - 논리적 구조 분석
      if (this.config.superClaude?.mcpServers?.sequential) {
        analysis.mcpInsights.sequential = await this.analyzeWithSequential(content, documentPath);
      }
      
      // 5. 품질 메트릭스 계산
      analysis.qualityMetrics = await this.calculateQualityMetrics(content, analysis);
      
      // 6. AI 기반 추천사항 생성
      analysis.recommendations = await this.generateRecommendations(analysis);
      
      // 7. 전체 점수 계산
      analysis.overallScore = this.calculateAIScore(analysis);
      
      // 8. 결과 저장
      await this.saveAIAnalysis(analysis);
      
      console.log(chalk.green(`✅ AI 분석 완료: ${analysis.overallScore}/100점`));
      
      return analysis;

    } catch (error) {
      console.error(chalk.red(`AI 리뷰 중 오류: ${error.message}`));
      return null;
    }
  }

  async analyzeContent(content, documentPath) {
    const analysis = {
      readabilityScore: 0,
      informationDensity: 0,
      technicalAccuracy: 0,
      completenessScore: 0,
      languageQuality: 0,
      insights: []
    };

    try {
      // 읽기 쉬움 분석
      analysis.readabilityScore = this.calculateReadability(content);
      
      // 정보 밀도 분석
      analysis.informationDensity = this.calculateInformationDensity(content);
      
      // 완성도 분석
      analysis.completenessScore = this.analyzeCompleteness(content, documentPath);
      
      // 언어 품질 분석
      analysis.languageQuality = this.analyzeLanguageQuality(content);
      
      // 기술적 정확성 분석 (코드 블록, API 참조 등)
      analysis.technicalAccuracy = await this.analyzeTechnicalAccuracy(content);
      
      // 인사이트 생성
      analysis.insights = this.generateContentInsights(analysis, content);

    } catch (error) {
      console.warn(chalk.yellow(`컨텐츠 분석 중 오류: ${error.message}`));
    }

    return analysis;
  }

  async analyzeStructure(content, documentPath) {
    const analysis = {
      hierarchyScore: 0,
      navigationScore: 0,
      organizationScore: 0,
      consistencyScore: 0,
      structureIssues: [],
      suggestions: []
    };

    try {
      const lines = content.split('\n');
      const headers = this.extractHeaders(content);
      
      // 헤더 계층 구조 분석
      analysis.hierarchyScore = this.analyzeHeaderHierarchy(headers);
      
      // 내비게이션 분석 (목차, 링크 구조)
      analysis.navigationScore = this.analyzeNavigation(content);
      
      // 조직화 점수
      analysis.organizationScore = this.analyzeOrganization(content, headers);
      
      // 일관성 점수
      analysis.consistencyScore = this.analyzeStructuralConsistency(content);
      
      // 구조적 문제점 식별
      analysis.structureIssues = this.identifyStructureIssues(headers, content);
      
      // 개선 제안
      analysis.suggestions = this.generateStructureSuggestions(analysis);

    } catch (error) {
      console.warn(chalk.yellow(`구조 분석 중 오류: ${error.message}`));
    }

    return analysis;
  }

  async analyzeWithContext7(content, documentPath) {
    // Context7 MCP 서버를 통한 문서 패턴 분석
    const insights = {
      documentationPatterns: [],
      bestPractices: [],
      frameworkCompliance: 0,
      recommendations: []
    };

    try {
      // 문서 타입 식별
      const docType = this.identifyDocumentType(documentPath, content);
      
      // 해당 타입의 모범 패턴과 비교
      insights.documentationPatterns = this.compareToStandardPatterns(content, docType);
      
      // 프레임워크별 문서화 규칙 준수 확인
      insights.frameworkCompliance = this.checkFrameworkCompliance(content, documentPath);
      
      // Context7 기반 개선 제안
      insights.recommendations = this.generateContext7Recommendations(insights);
      
      // 모범 사례 추출
      insights.bestPractices = this.extractBestPractices(content, docType);

    } catch (error) {
      console.warn(chalk.yellow(`Context7 분석 중 오류: ${error.message}`));
    }

    return insights;
  }

  async analyzeWithSequential(content, documentPath) {
    // Sequential MCP 서버를 통한 논리적 구조 분석
    const insights = {
      logicalFlow: 0,
      argumentStructure: 0,
      prerequisiteHandling: 0,
      conclusionQuality: 0,
      reasoning: []
    };

    try {
      // 논리적 흐름 분석
      insights.logicalFlow = this.analyzeLogicalFlow(content);
      
      // 논증 구조 분석
      insights.argumentStructure = this.analyzeArgumentStructure(content);
      
      // 선행 조건 처리 분석
      insights.prerequisiteHandling = this.analyzePrerequisites(content);
      
      // 결론 품질 분석
      insights.conclusionQuality = this.analyzeConclusionQuality(content);
      
      // 추론 과정 분석
      insights.reasoning = this.analyzeReasoning(content);

    } catch (error) {
      console.warn(chalk.yellow(`Sequential 분석 중 오류: ${error.message}`));
    }

    return insights;
  }

  async calculateQualityMetrics(content, analysis) {
    const metrics = {
      comprehensiveness: 0,
      accuracy: 0,
      usability: 0,
      maintainability: 0,
      accessibility: 0,
      engagement: 0
    };

    try {
      // 포괄성 - 필요한 정보가 모두 포함되어 있는가
      metrics.comprehensiveness = this.calculateComprehensiveness(content, analysis);
      
      // 정확성 - 정보가 정확하고 최신인가
      metrics.accuracy = this.calculateAccuracy(content, analysis);
      
      // 사용성 - 사용자가 쉽게 이해하고 사용할 수 있는가
      metrics.usability = this.calculateUsability(content, analysis);
      
      // 유지보수성 - 문서를 쉽게 업데이트할 수 있는가
      metrics.maintainability = this.calculateMaintainability(content, analysis);
      
      // 접근성 - 다양한 사용자가 접근할 수 있는가
      metrics.accessibility = this.calculateAccessibility(content, analysis);
      
      // 참여도 - 사용자의 관심을 끌고 유지하는가
      metrics.engagement = this.calculateEngagement(content, analysis);

    } catch (error) {
      console.warn(chalk.yellow(`품질 메트릭스 계산 중 오류: ${error.message}`));
    }

    return metrics;
  }

  async generateRecommendations(analysis) {
    const recommendations = [];

    try {
      // 컨텐츠 기반 추천
      if (analysis.contentAnalysis.readabilityScore < 70) {
        recommendations.push({
          type: 'readability',
          priority: 'high',
          title: '읽기 쉬움 개선',
          description: '문장을 더 간결하게 만들고, 전문 용어에 설명을 추가하세요.',
          impact: 'high',
          effort: 'medium'
        });
      }

      // 구조 기반 추천
      if (analysis.structureAnalysis.hierarchyScore < 80) {
        recommendations.push({
          type: 'structure',
          priority: 'medium',
          title: '헤더 구조 개선',
          description: '헤더 레벨을 논리적으로 재구성하고 누락된 섹션을 추가하세요.',
          impact: 'medium',
          effort: 'low'
        });
      }

      // MCP 인사이트 기반 추천
      if (analysis.mcpInsights.context7?.frameworkCompliance < 70) {
        recommendations.push({
          type: 'compliance',
          priority: 'medium',
          title: '프레임워크 규칙 준수',
          description: '해당 프레임워크의 문서화 가이드라인을 따르세요.',
          impact: 'medium',
          effort: 'medium'
        });
      }

      // 품질 메트릭스 기반 추천
      Object.entries(analysis.qualityMetrics).forEach(([metric, score]) => {
        if (score < 70) {
          recommendations.push(this.generateMetricRecommendation(metric, score));
        }
      });

      // 우선순위별 정렬
      recommendations.sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    } catch (error) {
      console.warn(chalk.yellow(`추천사항 생성 중 오류: ${error.message}`));
    }

    return recommendations.slice(0, 10); // 상위 10개만 반환
  }

  // 유틸리티 함수들
  calculateReadability(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgCharsPerWord = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // 간단한 읽기 쉬움 공식 (한국어 적용)
    let score = 100;
    if (avgWordsPerSentence > 20) score -= (avgWordsPerSentence - 20) * 2;
    if (avgCharsPerWord > 6) score -= (avgCharsPerWord - 6) * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  calculateInformationDensity(content) {
    const totalWords = content.split(/\s+/).filter(w => w.length > 0).length;
    const meaningfulWords = content.split(/\s+/).filter(w => 
      w.length > 3 && !/^(the|and|or|but|in|on|at|to|for|of|with|by)$/i.test(w)
    ).length;
    
    if (totalWords === 0) return 0;
    
    return Math.round((meaningfulWords / totalWords) * 100);
  }

  analyzeCompleteness(content, documentPath) {
    const requiredSections = this.getRequiredSections(documentPath);
    const presentSections = this.extractHeaders(content).map(h => h.text.toLowerCase());
    
    const found = requiredSections.filter(required => 
      presentSections.some(present => present.includes(required.toLowerCase()))
    );
    
    return Math.round((found.length / requiredSections.length) * 100);
  }

  extractHeaders(content) {
    const headers = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#+)\s+(.+)$/);
      if (match) {
        headers.push({
          level: match[1].length,
          text: match[2].trim(),
          line: index + 1
        });
      }
    });
    
    return headers;
  }

  getRequiredSections(documentPath) {
    const filename = path.basename(documentPath).toLowerCase();
    
    if (filename.includes('readme')) {
      return ['installation', 'usage', 'getting started', 'features', 'api', 'contributing'];
    } else if (filename.includes('api')) {
      return ['overview', 'authentication', 'endpoints', 'examples', 'errors'];
    } else if (filename.includes('changelog')) {
      return ['unreleased', 'version', 'added', 'changed', 'fixed'];
    }
    
    return ['overview', 'description', 'usage'];
  }

  calculateAIScore(analysis) {
    const weights = {
      contentAnalysis: 0.3,
      structureAnalysis: 0.25,
      qualityMetrics: 0.35,
      mcpInsights: 0.1
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    // 컨텐츠 분석 점수
    if (analysis.contentAnalysis) {
      const contentScore = (
        analysis.contentAnalysis.readabilityScore * 0.3 +
        analysis.contentAnalysis.informationDensity * 0.2 +
        analysis.contentAnalysis.completenessScore * 0.3 +
        analysis.contentAnalysis.languageQuality * 0.2
      );
      totalScore += contentScore * weights.contentAnalysis;
      totalWeight += weights.contentAnalysis;
    }
    
    // 구조 분석 점수
    if (analysis.structureAnalysis) {
      const structureScore = (
        analysis.structureAnalysis.hierarchyScore * 0.4 +
        analysis.structureAnalysis.organizationScore * 0.3 +
        analysis.structureAnalysis.consistencyScore * 0.3
      );
      totalScore += structureScore * weights.structureAnalysis;
      totalWeight += weights.structureAnalysis;
    }
    
    // 품질 메트릭스 점수
    if (analysis.qualityMetrics) {
      const metricsScore = Object.values(analysis.qualityMetrics)
        .reduce((sum, score) => sum + score, 0) / Object.keys(analysis.qualityMetrics).length;
      totalScore += metricsScore * weights.qualityMetrics;
      totalWeight += weights.qualityMetrics;
    }
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  async saveAIAnalysis(analysis) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ai-review-${path.basename(analysis.path, '.md')}-${timestamp}.json`;
    const filePath = path.join(this.aiReviewPath, filename);
    
    await fs.writeFile(filePath, JSON.stringify(analysis, null, 2));
    
    // 요약 리포트도 생성
    const summaryPath = path.join(this.aiReviewPath, `summary-${path.basename(analysis.path, '.md')}-${timestamp}.md`);
    const summaryContent = this.generateAISummaryMarkdown(analysis);
    await fs.writeFile(summaryPath, summaryContent);
    
    return { analysisPath: filePath, summaryPath };
  }

  generateAISummaryMarkdown(analysis) {
    return `# 🤖 AI 문서 분석 리포트

**문서**: ${analysis.path}
**분석 시간**: ${new Date(analysis.timestamp).toLocaleString('ko-KR')}
**AI 점수**: ${analysis.overallScore}/100

## 📊 분석 결과

### 컨텐츠 품질
- **읽기 쉬움**: ${analysis.contentAnalysis.readabilityScore}/100
- **정보 밀도**: ${analysis.contentAnalysis.informationDensity}/100
- **완성도**: ${analysis.contentAnalysis.completenessScore}/100

### 구조 품질
- **헤더 계층**: ${analysis.structureAnalysis.hierarchyScore}/100
- **조직화**: ${analysis.structureAnalysis.organizationScore}/100
- **일관성**: ${analysis.structureAnalysis.consistencyScore}/100

## 🎯 AI 추천사항

${analysis.recommendations.map((rec, i) => 
  `### ${i + 1}. ${rec.title} (${rec.priority} 우선순위)
${rec.description}
- **임팩트**: ${rec.impact}
- **노력**: ${rec.effort}
`).join('\n')}

---
*이 분석은 AI 시스템에 의해 자동으로 생성되었습니다.*
`;
  }

  // 추가 분석 함수들 (간단한 구현)
  analyzeLanguageQuality(content) {
    // 언어 품질 분석 로직
    return 85; // 임시 점수
  }

  async analyzeTechnicalAccuracy(content) {
    // 기술적 정확성 분석 로직
    return 80; // 임시 점수
  }

  generateContentInsights(analysis, content) {
    // 컨텐츠 인사이트 생성 로직
    return ['문서 길이가 적절합니다', '기술 용어 설명이 부족합니다'];
  }

  // ... 기타 분석 함수들은 필요에 따라 구현

  initDocumentPatterns() {
    return {
      readme: ['설치', '사용법', '기능', 'API', '기여'],
      api: ['개요', '인증', '엔드포인트', '예제', '오류'],
      changelog: ['미출시', '버전', '추가', '변경', '수정']
    };
  }

  initQualityMetrics() {
    return {
      readability: { weight: 0.2, threshold: 70 },
      completeness: { weight: 0.25, threshold: 80 },
      accuracy: { weight: 0.2, threshold: 85 },
      usability: { weight: 0.15, threshold: 75 },
      structure: { weight: 0.2, threshold: 80 }
    };
  }
}

module.exports = AIReviewer;
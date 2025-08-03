#!/usr/bin/env node
/**
 * Token Usage Dashboard
 * 토큰 사용량 모니터링 및 최적화 제안
 */

interface TokenMetrics {
  timestamp: number;
  module: string;
  tokens: number;
  queryType: string;
}

interface DashboardReport {
  summary: {
    totalSaved: string;
    avgTokensPerQuery: number;
    mostUsedModules: string[];
    recommendations: string[];
  };
  details: {
    byModule: Record<string, number>;
    byTimeOfDay: Record<string, number>;
    byQueryType: Record<string, number>;
  };
  optimization: {
    potential: string;
    actions: string[];
  };
}

export class TokenDashboard {
  private metrics: TokenMetrics[] = [];
  
  constructor() {
    // 실제로는 파일이나 DB에서 로드
    this.loadMockData();
  }

  private loadMockData() {
    // 실제 사용 패턴을 시뮬레이션
    const modules = [
      '31_Crisis', '30_Traps', '24_Interview', 
      '09_Testing', '25_Templates'
    ];
    const queryTypes = ['error', 'new-project', 'feature', 'optimization'];
    
    // 100개의 샘플 데이터 생성
    for (let i = 0; i < 100; i++) {
      this.metrics.push({
        timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        module: modules[Math.floor(Math.random() * modules.length)],
        tokens: Math.floor(Math.random() * 500) + 100,
        queryType: queryTypes[Math.floor(Math.random() * queryTypes.length)]
      });
    }
  }

  recordUsage(module: string, tokens: number, queryType: string) {
    this.metrics.push({
      timestamp: Date.now(),
      module,
      tokens,
      queryType
    });
  }

  async generateReport(): Promise<DashboardReport> {
    // 기본 통계 계산
    const totalTokens = this.metrics.reduce((sum, m) => sum + m.tokens, 0);
    const avgTokens = Math.round(totalTokens / this.metrics.length);
    
    // 예상 토큰 (최적화 없이)
    const expectedTokens = this.metrics.length * 5000;
    const savedTokens = expectedTokens - totalTokens;
    const savedPercentage = Math.round((savedTokens / expectedTokens) * 100);

    // 모듈별 사용량
    const byModule: Record<string, number> = {};
    this.metrics.forEach(m => {
      byModule[m.module] = (byModule[m.module] || 0) + m.tokens;
    });

    // 시간대별 사용량
    const byTimeOfDay: Record<string, number> = {};
    this.metrics.forEach(m => {
      const hour = new Date(m.timestamp).getHours();
      const timeSlot = `${hour}:00-${hour + 1}:00`;
      byTimeOfDay[timeSlot] = (byTimeOfDay[timeSlot] || 0) + 1;
    });

    // 쿼리 타입별 사용량
    const byQueryType: Record<string, number> = {};
    this.metrics.forEach(m => {
      byQueryType[m.queryType] = (byQueryType[m.queryType] || 0) + m.tokens;
    });

    // 가장 많이 사용된 모듈
    const sortedModules = Object.entries(byModule)
      .sort((a, b) => b[1] - a[1])
      .map(([module]) => module);

    // 최적화 제안 생성
    const recommendations = this.generateRecommendations(byModule, byQueryType);
    const optimizationActions = this.generateOptimizationActions(avgTokens, sortedModules);

    return {
      summary: {
        totalSaved: `${savedPercentage}%`,
        avgTokensPerQuery: avgTokens,
        mostUsedModules: sortedModules.slice(0, 3),
        recommendations
      },
      details: {
        byModule,
        byTimeOfDay,
        byQueryType
      },
      optimization: {
        potential: `${Math.min(savedPercentage + 7, 92)}% efficiency possible`,
        actions: optimizationActions
      }
    };
  }

  private generateRecommendations(
    byModule: Record<string, number>,
    byQueryType: Record<string, number>
  ): string[] {
    const recommendations: string[] = [];

    // 모듈별 추천
    const heavyModules = Object.entries(byModule)
      .filter(([_, tokens]) => tokens > 10000)
      .map(([module]) => module);

    if (heavyModules.length > 0) {
      recommendations.push(
        `Enable quick reference for ${heavyModules.join(', ')}`
      );
    }

    // 반복 사용 모듈 캐싱
    const frequentModules = Object.entries(byModule)
      .filter(([_, tokens]) => tokens > 5000)
      .map(([module]) => module);

    if (frequentModules.length > 0) {
      recommendations.push(
        `Cache ${frequentModules[0]} for faster access`
      );
    }

    // 쿼리 타입별 추천
    if (byQueryType['error'] > 20000) {
      recommendations.push(
        'Create error-specific quick templates'
      );
    }

    return recommendations;
  }

  private generateOptimizationActions(
    avgTokens: number,
    topModules: string[]
  ): string[] {
    const actions: string[] = [];

    if (avgTokens > 500) {
      actions.push('Enable aggressive compression mode');
    }

    if (avgTokens > 300) {
      actions.push('Implement smart caching for frequent queries');
    }

    actions.push('Enable progressive loading for all modules');
    
    if (topModules.includes('31_Crisis')) {
      actions.push('Preload crisis templates for faster response');
    }

    return actions;
  }

  printReport(report: DashboardReport) {
    console.log('📊 Token Usage Dashboard');
    console.log('========================\n');

    console.log('📈 Summary');
    console.log(`Total Saved: ${report.summary.totalSaved}`);
    console.log(`Avg Tokens/Query: ${report.summary.avgTokensPerQuery}`);
    console.log(`Top Modules: ${report.summary.mostUsedModules.join(', ')}\n`);

    console.log('💡 Recommendations');
    report.summary.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });

    console.log('\n🎯 Optimization Potential');
    console.log(`Efficiency: ${report.optimization.potential}`);
    console.log('Actions:');
    report.optimization.actions.forEach((action, i) => {
      console.log(`${i + 1}. ${action}`);
    });

    console.log('\n📊 Module Usage');
    Object.entries(report.details.byModule)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([module, tokens]) => {
        console.log(`${module}: ${tokens} tokens`);
      });
  }
}

// CLI 사용
if (require.main === module) {
  const dashboard = new TokenDashboard();
  
  // 샘플 사용 기록
  dashboard.recordUsage('30_Traps/quick/hydration', 150, 'error');
  dashboard.recordUsage('31_Crisis/emergency', 200, 'error');
  dashboard.recordUsage('24_Interview/quick', 250, 'new-project');
  
  dashboard.generateReport().then(report => {
    dashboard.printReport(report);
  });
}
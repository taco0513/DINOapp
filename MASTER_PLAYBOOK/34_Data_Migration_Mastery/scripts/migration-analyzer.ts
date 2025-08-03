#!/usr/bin/env node
/**
 * Migration Analyzer - 마이그레이션 복잡도 및 위험 분석 도구
 * CupNote 프로젝트에서 실제 사용된 분석 도구를 기반으로 개발
 */

import * as fs from 'fs';
import * as path from 'path';

interface DataAnalysis {
  totalRecords: number;
  schemaComplexity: SchemaComplexity;
  migrationRisk: MigrationRisk;
  estimatedTime: TimeEstimate;
  recommendations: string[];
}

interface SchemaComplexity {
  level: 'simple' | 'moderate' | 'complex' | 'enterprise';
  factors: {
    nestedObjects: number;
    arrayFields: number;
    inconsistentTypes: number;
    foreignKeys: number;
    jsonData: number;
  };
  score: number;
}

interface MigrationRisk {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    dataVolume: number;
    schemaConflicts: number;
    concurrencyIssues: number;
    rollbackComplexity: number;
  };
  score: number;
}

interface TimeEstimate {
  minimum: string;
  realistic: string;
  pessimistic: string;
  phases: Record<string, string>;
}

class MigrationAnalyzer {
  private sampleData: any[] = [];
  private schemaMap = new Map<string, Set<string>>();

  constructor(private dataSource: 'localStorage' | 'file', private sourcePath?: string) {}

  async analyze(): Promise<DataAnalysis> {
    console.log('🔍 Starting migration analysis...\n');

    // 데이터 수집
    await this.collectData();
    
    // 스키마 분석
    const schemaComplexity = this.analyzeSchema();
    
    // 위험도 평가
    const migrationRisk = this.assessRisk(schemaComplexity);
    
    // 시간 추정
    const estimatedTime = this.estimateTime(schemaComplexity, migrationRisk);
    
    // 권장사항 생성
    const recommendations = this.generateRecommendations(schemaComplexity, migrationRisk);

    return {
      totalRecords: this.sampleData.length,
      schemaComplexity,
      migrationRisk,
      estimatedTime,
      recommendations
    };
  }

  private async collectData(): Promise<void> {
    if (this.dataSource === 'localStorage') {
      await this.collectFromLocalStorage();
    } else if (this.sourcePath) {
      await this.collectFromFile(this.sourcePath);
    }

    console.log(`📊 Collected ${this.sampleData.length} records for analysis`);
  }

  private async collectFromLocalStorage(): Promise<void> {
    // 브라우저 환경에서는 직접 접근, Node.js에서는 시뮬레이션
    if (typeof window !== 'undefined' && window.localStorage) {
      // 실제 브라우저 환경
      const keys = Object.keys(localStorage);
      const relevantKeys = keys.filter(key => 
        key.startsWith('coffee_') || 
        key.startsWith('record_') ||
        key.startsWith('data_')
      );

      this.sampleData = relevantKeys
        .map(key => {
          try {
            return JSON.parse(localStorage.getItem(key)!);
          } catch (error) {
            return null;
          }
        })
        .filter(Boolean);
    } else {
      // Node.js 환경에서는 예시 데이터로 시뮬레이션
      console.log('🔧 Simulating localStorage data for analysis...');
      this.sampleData = this.generateSampleData();
    }
  }

  private async collectFromFile(filePath: string): Promise<void> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      
      if (Array.isArray(jsonData)) {
        this.sampleData = jsonData;
      } else {
        this.sampleData = [jsonData];
      }
    } catch (error) {
      throw new Error(`Failed to read data from file: ${error.message}`);
    }
  }

  private generateSampleData(): any[] {
    // CupNote 스타일의 복잡한 중첩 데이터 시뮬레이션
    return Array.from({ length: 1500 }, (_, i) => ({
      id: `coffee_${i}`,
      createdAt: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
      coffee: {
        name: `Coffee ${i}`,
        roaster: {
          name: `Roaster ${i % 50}`,
          location: `City ${i % 20}`,
          website: `https://roaster${i % 50}.com`
        },
        origin: {
          country: ['Ethiopia', 'Colombia', 'Kenya', 'Brazil'][i % 4],
          region: `Region ${i % 10}`,
          farm: i % 3 === 0 ? `Farm ${i}` : null
        },
        tastingNotes: [
          'fruity', 'chocolate', 'nutty', 'floral', 'wine'
        ].slice(0, Math.ceil(Math.random() * 3)),
        processingMethod: ['washed', 'natural', 'honey'][i % 3]
      },
      brewing: {
        methods: [
          { name: 'V60', ratio: '1:16', grindSize: 'medium-fine' },
          { name: 'French Press', ratio: '1:12', grindSize: 'coarse' }
        ].slice(0, Math.ceil(Math.random() * 2)),
        waterTemp: 90 + Math.random() * 10,
        brewTime: 180 + Math.random() * 120
      },
      rating: Math.ceil(Math.random() * 5),
      notes: i % 5 === 0 ? `Personal notes for coffee ${i}` : null,
      tags: ['morning', 'afternoon', 'special'].slice(0, Math.ceil(Math.random() * 2)),
      // 불일치하는 데이터 타입들 (실제 문제 시뮬레이션)
      updatedAt: i % 10 === 0 ? new Date().toISOString() : Date.now(),
      price: i % 3 === 0 ? `$${(10 + Math.random() * 20).toFixed(2)}` : null
    }));
  }

  private analyzeSchema(): SchemaComplexity {
    console.log('🔬 Analyzing schema complexity...');

    const factors = {
      nestedObjects: 0,
      arrayFields: 0,
      inconsistentTypes: 0,
      foreignKeys: 0,
      jsonData: 0
    };

    // 스키마 복잡도 분석
    this.sampleData.forEach(record => {
      this.analyzeRecord(record, '', factors);
    });

    // 타입 불일치 검사
    factors.inconsistentTypes = this.detectTypeInconsistencies();

    // 복잡도 점수 계산
    const score = this.calculateComplexityScore(factors);
    const level = this.determineComplexityLevel(score);

    return { level, factors, score };
  }

  private analyzeRecord(obj: any, path: string, factors: any): void {
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (Array.isArray(value)) {
        factors.arrayFields++;
        if (value.length > 0 && typeof value[0] === 'object') {
          factors.nestedObjects++;
        }
      } else if (value && typeof value === 'object') {
        factors.nestedObjects++;
        this.analyzeRecord(value, currentPath, factors);
      }

      // 외래키 패턴 감지
      if (key.endsWith('Id') || key.endsWith('_id')) {
        factors.foreignKeys++;
      }

      // JSON 문자열 데이터 감지
      if (typeof value === 'string' && this.isJsonString(value)) {
        factors.jsonData++;
      }

      // 스키마 맵 업데이트
      if (!this.schemaMap.has(currentPath)) {
        this.schemaMap.set(currentPath, new Set());
      }
      this.schemaMap.get(currentPath)!.add(typeof value);
    });
  }

  private detectTypeInconsistencies(): number {
    let inconsistencies = 0;
    
    this.schemaMap.forEach((types, path) => {
      if (types.size > 1) {
        // null과 다른 타입의 조합은 허용 (optional fields)
        const typesArray = Array.from(types);
        const nonNullTypes = typesArray.filter(type => type !== 'object' || type !== null);
        
        if (nonNullTypes.length > 1) {
          inconsistencies++;
          console.log(`⚠️  Type inconsistency detected at ${path}: ${typesArray.join(', ')}`);
        }
      }
    });

    return inconsistencies;
  }

  private calculateComplexityScore(factors: any): number {
    const weights = {
      nestedObjects: 2.0,
      arrayFields: 1.5,
      inconsistentTypes: 3.0,
      foreignKeys: 1.2,
      jsonData: 2.5
    };

    return Object.entries(factors).reduce((score, [key, value]) => {
      return score + (value as number) * weights[key as keyof typeof weights];
    }, 0);
  }

  private determineComplexityLevel(score: number): SchemaComplexity['level'] {
    if (score < 10) return 'simple';
    if (score < 50) return 'moderate';
    if (score < 200) return 'complex';
    return 'enterprise';
  }

  private assessRisk(schemaComplexity: SchemaComplexity): MigrationRisk {
    console.log('⚠️  Assessing migration risks...');

    const factors = {
      dataVolume: this.calculateVolumeRisk(),
      schemaConflicts: schemaComplexity.factors.inconsistentTypes * 10,
      concurrencyIssues: this.assessConcurrencyRisk(),
      rollbackComplexity: schemaComplexity.score * 0.5
    };

    const score = Object.values(factors).reduce((sum, risk) => sum + risk, 0);
    const level = this.determineRiskLevel(score);

    return { level, factors, score };
  }

  private calculateVolumeRisk(): number {
    const count = this.sampleData.length;
    if (count < 1000) return 5;
    if (count < 10000) return 15;
    if (count < 100000) return 30;
    return 50;
  }

  private assessConcurrencyRisk(): number {
    // 동시 접근 패턴 분석 (창업된 lastModified 분포)
    const recentModifications = this.sampleData.filter(record => {
      const updatedAt = record.updatedAt || record.createdAt;
      const timestamp = typeof updatedAt === 'string' ? new Date(updatedAt).getTime() : updatedAt;
      return Date.now() - timestamp < 24 * 60 * 60 * 1000; // 최근 24시간
    }).length;

    const activeRatio = recentModifications / this.sampleData.length;
    return activeRatio * 20; // 활성도가 높을수록 동시성 위험 증가
  }

  private determineRiskLevel(score: number): MigrationRisk['level'] {
    if (score < 25) return 'low';
    if (score < 50) return 'medium';
    if (score < 100) return 'high';
    return 'critical';
  }

  private estimateTime(schemaComplexity: SchemaComplexity, migrationRisk: MigrationRisk): TimeEstimate {
    console.log('⏱️  Estimating migration timeline...');

    // 기본 시간 (일 단위)
    let baseDays = 7; // 1 week baseline

    // 복잡도 영향
    const complexityMultipliers = {
      simple: 0.7,
      moderate: 1.0,
      complex: 1.8,
      enterprise: 3.0
    };

    // 위험도 영향
    const riskMultipliers = {
      low: 1.0,
      medium: 1.3,
      high: 1.8,
      critical: 2.5
    };

    const adjustedDays = baseDays * 
      complexityMultipliers[schemaComplexity.level] * 
      riskMultipliers[migrationRisk.level];

    const minimum = Math.ceil(adjustedDays * 0.7);
    const realistic = Math.ceil(adjustedDays);
    const pessimistic = Math.ceil(adjustedDays * 1.5);

    return {
      minimum: `${minimum} days`,
      realistic: `${realistic} days`,
      pessimistic: `${pessimistic} days`,
      phases: {
        preparation: `${Math.ceil(realistic * 0.2)} days`,
        implementation: `${Math.ceil(realistic * 0.6)} days`,
        validation: `${Math.ceil(realistic * 0.2)} days`
      }
    };
  }

  private generateRecommendations(
    schemaComplexity: SchemaComplexity, 
    migrationRisk: MigrationRisk
  ): string[] {
    const recommendations: string[] = [];

    // 복잡도 기반 권장사항
    if (schemaComplexity.level === 'enterprise') {
      recommendations.push('🏢 Enterprise complexity detected - consider professional migration service');
      recommendations.push('📋 Develop comprehensive test suite before starting');
    }

    if (schemaComplexity.factors.inconsistentTypes > 5) {
      recommendations.push('🔧 High type inconsistency - implement data normalization scripts');
    }

    if (schemaComplexity.factors.nestedObjects > 20) {
      recommendations.push('🗂️ Complex nested structure - consider gradual denormalization');
    }

    // 위험도 기반 권장사항
    if (migrationRisk.level === 'critical') {
      recommendations.push('🚨 CRITICAL RISK - Mandatory pilot testing with subset of data');
      recommendations.push('⏸️ Consider postponing until risk factors are addressed');
    }

    if (migrationRisk.level === 'high') {
      recommendations.push('⚠️ High risk detected - implement robust rollback mechanisms');
      recommendations.push('📊 Set up comprehensive monitoring during migration');
    }

    if (migrationRisk.factors.dataVolume > 30) {
      recommendations.push('📦 Large dataset - use batch processing with rate limiting');
    }

    // 일반적 권장사항
    recommendations.push('💾 Always create complete backup before starting');
    recommendations.push('🔄 Implement dual-write pattern for zero-downtime migration');
    recommendations.push('✅ Validate data integrity at each phase');

    if (recommendations.length === 3) {
      recommendations.unshift('✨ Low complexity migration - follow standard best practices');
    }

    return recommendations;
  }

  private isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  printAnalysis(analysis: DataAnalysis): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION ANALYSIS REPORT');
    console.log('='.repeat(60));

    // 개요
    console.log('\n📈 Overview:');
    console.log(`Total Records: ${analysis.totalRecords.toLocaleString()}`);
    console.log(`Schema Complexity: ${analysis.schemaComplexity.level.toUpperCase()} (Score: ${analysis.schemaComplexity.score})`);
    console.log(`Migration Risk: ${analysis.migrationRisk.level.toUpperCase()} (Score: ${analysis.migrationRisk.score})`);

    // 시간 추정
    console.log('\n⏱️ Time Estimates:');
    console.log(`Minimum: ${analysis.estimatedTime.minimum}`);
    console.log(`Realistic: ${analysis.estimatedTime.realistic}`);
    console.log(`Pessimistic: ${analysis.estimatedTime.pessimistic}`);

    // 상세 분석
    console.log('\n🔬 Schema Complexity Factors:');
    Object.entries(analysis.schemaComplexity.factors).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    console.log('\n⚠️ Risk Factors:');
    Object.entries(analysis.migrationRisk.factors).forEach(([key, value]) => {
      console.log(`  ${key}: ${value.toFixed(1)}`);
    });

    // 권장사항
    console.log('\n💡 Recommendations:');
    analysis.recommendations.forEach(rec => {
      console.log(`  ${rec}`);
    });

    console.log('\n' + '='.repeat(60));
  }
}

// CLI 실행
if (require.main === module) {
  const args = process.argv.slice(2);
  const dataSource = args.includes('--file') ? 'file' : 'localStorage';
  const filePath = args.find(arg => arg.startsWith('--file='))?.split('=')[1];

  const analyzer = new MigrationAnalyzer(dataSource, filePath);

  analyzer.analyze()
    .then(analysis => {
      analyzer.printAnalysis(analysis);

      // 위험도에 따른 종료 코드
      const exitCodes = {
        low: 0,
        medium: 1,
        high: 2,
        critical: 3
      };

      process.exit(exitCodes[analysis.migrationRisk.level]);
    })
    .catch(error => {
      console.error('Analysis failed:', error.message);
      process.exit(4);
    });
}

export { MigrationAnalyzer };
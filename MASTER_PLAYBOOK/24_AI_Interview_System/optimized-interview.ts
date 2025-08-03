#!/usr/bin/env node
/**
 * Optimized AI Interview System
 * 토큰 효율적인 인터뷰 시스템
 */

interface InterviewContext {
  projectType?: string;
  urgency?: 'critical' | 'high' | 'medium' | 'low';
  problemType?: string;
  constraints?: string[];
}

interface InterviewResult {
  solution: string;
  modules: string[];
  tokensUsed: number;
  needsMoreDetail: boolean;
}

export class OptimizedInterview {
  private tokenBudget = {
    initial: 50,      // 문제 파악
    analysis: 200,    // 분석
    solution: 300,    // 해결책
    detailed: 1000    // 상세 (필요시)
  };

  private quickTemplates = {
    newProject: {
      questions: [
        "프로젝트 타입? (웹앱/API/모바일)",
        "MVP 기한?",
        "핵심 기능 3개?"
      ],
      modules: ["QUICK_START.md", "25_Templates/QUICK.md"]
    },
    
    bugFix: {
      questions: [
        "정확한 에러 메시지?",
        "언제부터 발생?",
        "이미 시도한 것?"
      ],
      modules: ["CRISIS_INDEX.md", "30_Traps/quick/*"]
    },
    
    performance: {
      questions: [
        "어느 부분이 느린가?",
        "측정한 메트릭?",
        "목표 성능?"
      ],
      modules: ["31_Crisis/performance", "10_Deployment/QUICK.md"]
    }
  };

  async identifyProblem(userInput: string): Promise<InterviewContext> {
    const input = userInput.toLowerCase();
    const context: InterviewContext = {};

    // 긴급도 판단 (20토큰)
    if (input.includes('긴급') || input.includes('다운') || input.includes('critical')) {
      context.urgency = 'critical';
    } else if (input.includes('에러') || input.includes('실패')) {
      context.urgency = 'high';
    } else {
      context.urgency = 'medium';
    }

    // 프로젝트 타입 (20토큰)
    if (input.includes('새') || input.includes('new') || input.includes('시작')) {
      context.projectType = 'new';
    } else if (input.includes('버그') || input.includes('에러') || input.includes('고치')) {
      context.projectType = 'bug';
    } else if (input.includes('느림') || input.includes('성능')) {
      context.projectType = 'performance';
    }

    // 제약사항 추출 (10토큰)
    context.constraints = [];
    if (input.includes('2주') || input.includes('two weeks')) {
      context.constraints.push('2주 기한');
    }
    if (input.includes('혼자') || input.includes('alone')) {
      context.constraints.push('1인 개발');
    }

    return context;
  }

  async loadEssentialContext(context: InterviewContext): Promise<string> {
    let modules: string[] = [];
    
    // 컨텍스트 기반 모듈 선택 (100토큰)
    switch (context.projectType) {
      case 'new':
        modules = this.quickTemplates.newProject.modules;
        break;
      case 'bug':
        modules = this.quickTemplates.bugFix.modules;
        break;
      case 'performance':
        modules = this.quickTemplates.performance.modules;
        break;
      default:
        modules = ["MASTER_INDEX.md"];
    }

    // 긴급도에 따른 추가 모듈 (50토큰)
    if (context.urgency === 'critical') {
      modules.unshift("CRISIS_INDEX.md");
    }

    // 간단한 컨텍스트 생성 (50토큰)
    return modules.map(m => `@${m}`).join('\n');
  }

  async proposeSolution(
    context: InterviewContext, 
    loadedContext: string
  ): Promise<InterviewResult> {
    let solution = '';
    let tokensUsed = 250; // 기본 사용량
    
    // 프로젝트 타입별 즉시 해결책 (200토큰)
    switch (context.projectType) {
      case 'new':
        solution = `
## 즉시 시작 (${context.constraints?.join(', ') || '제약 없음'})

1. 템플릿 선택
   \`\`\`bash
   @template/webapp  # 추천
   \`\`\`

2. 설치 및 실행
   \`\`\`bash
   git clone [template]
   bun install
   bun dev
   \`\`\`

3. AI Interview 시작
   → "웹앱 만들기" 입력시 자동 시작

다음 단계: @24_Interview/full-interview
`;
        break;

      case 'bug':
        solution = `
## 버그 해결 프로세스

1. 에러 타입 확인
   → ${context.urgency === 'critical' ? '@crisis/emergency' : '@30_Traps/quick'}

2. 빠른 수정 시도
   \`\`\`bash
   @tools/error-analyzer
   @tools/auto-fix
   \`\`\`

3. 해결 안되면
   → @detailed/debugging

임시 조치: @protocols/workaround
`;
        break;

      case 'performance':
        solution = `
## 성능 개선 작업

1. 현재 측정
   → @tools/performance-measure

2. 병목 지점 찾기
   → @31_Crisis/performance#analyze

3. 최적화 적용
   - 번들 크기 → @optimization/bundle
   - 렌더링 → @optimization/render
   - API → @optimization/api

목표 미달성시: @detailed/performance
`;
        break;

      default:
        solution = `
## 추가 정보 필요

어떤 도움이 필요하신가요?
- 새 프로젝트 → "새 프로젝트 시작"
- 문제 해결 → "에러: [메시지]"
- 기능 추가 → "기능: [설명]"

@MASTER_INDEX 참조
`;
        tokensUsed = 100;
    }

    return {
      solution,
      modules: loadedContext.split('\n'),
      tokensUsed,
      needsMoreDetail: context.urgency === 'critical' || !context.projectType
    };
  }

  async provideDetailedGuide(
    basicSolution: InterviewResult
  ): Promise<InterviewResult> {
    // 추가 1000토큰으로 상세 가이드
    const detailedGuide = `
${basicSolution.solution}

## 상세 단계별 가이드

### 준비 사항 체크리스트
- [ ] Node.js 18+ 설치
- [ ] Git 설정 완료
- [ ] 에디터 준비 (VS Code 추천)

### 일반적인 문제 해결
1. 설치 실패 → @troubleshoot/install
2. 타입 에러 → @30_Traps/typescript
3. 빌드 실패 → @30_Traps/build

### 추가 리소스
- 동영상 가이드: @resources/video
- 커뮤니티 지원: @community/discord
- 1:1 도움: @support/ticket
`;

    return {
      solution: detailedGuide,
      modules: [...basicSolution.modules, "@detailed/*"],
      tokensUsed: basicSolution.tokensUsed + 1000,
      needsMoreDetail: false
    };
  }

  async start(userInput: string): Promise<InterviewResult> {
    console.log('🎤 AI Interview 시작 (토큰 효율 모드)');
    
    // 1단계: 최소 토큰으로 문제 파악 (50토큰)
    const context = await this.identifyProblem(userInput);
    console.log(`✅ 문제 파악 완료: ${context.projectType || 'unknown'}`);
    
    // 2단계: 필수 컨텍스트만 로드 (200토큰)
    const loadedContext = await this.loadEssentialContext(context);
    console.log(`✅ 컨텍스트 로드: ${loadedContext.split('\n').length}개 모듈`);
    
    // 3단계: 핵심 해결책 제시 (300토큰)
    const solution = await this.proposeSolution(context, loadedContext);
    console.log(`✅ 해결책 생성: ${solution.tokensUsed} 토큰 사용`);
    
    // 4단계: 필요시만 상세 가이드 (+1000토큰)
    if (solution.needsMoreDetail && context.urgency !== 'low') {
      console.log('📚 상세 가이드 추가 중...');
      return this.provideDetailedGuide(solution);
    }
    
    return solution;
  }
}

// CLI 사용
if (require.main === module) {
  const interview = new OptimizedInterview();
  const input = process.argv.slice(2).join(' ') || "새 프로젝트를 시작하고 싶어요";
  
  interview.start(input).then(result => {
    console.log('\n=== Interview Result ===');
    console.log(result.solution);
    console.log(`\n📊 토큰 사용량: ${result.tokensUsed}`);
    console.log(`💾 토큰 절약: ${5000 - result.tokensUsed} (${Math.round((1 - result.tokensUsed/5000) * 100)}%)`);
  });
}
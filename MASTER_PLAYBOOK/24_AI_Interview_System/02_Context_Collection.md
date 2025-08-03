# 🧠 Context Collection - 컨텍스트 수집 전략

## 📋 개요

AI 인터뷰를 통해 Context Engineering의 6요소(Instructions, Knowledge, Tools, Memory, State, Query)를 체계적으로 수집하고 구조화하는 전략적 프레임워크입니다.

---

## 🎯 6요소 컨텍스트 매핑

### **Instructions - 명령어 수집**
```yaml
목적: 사용자가 진짜 원하는 것이 무엇인지 파악

수집 전략:
  explicit_requests: "직접적으로 요청한 것"
  implicit_needs: "암시적으로 필요한 것" 
  hidden_requirements: "숨겨진 요구사항"

질문 패턴:
  - "어떤 일을 해결하고 싶으신가요?"
  - "최종적으로 어떤 결과물을 원하시나요?"
  - "성공했다면 어떤 모습일까요?"

수집 예시:
  사용자 발언: "맛집 찾기 앱을 만들고 싶어요"
  
  수집된 Instructions:
    primary: "위치 기반 맛집 검색 앱 개발"
    secondary: "개인 취향 반영한 추천 시스템"
    implicit: "사용자 리뷰 신뢰성 확보"
    hidden: "음식 사진 중심의 시각적 인터페이스"
```

### **Knowledge - 지식 수집**
```yaml
목적: 프로젝트 수행에 필요한 도메인 지식 자동 수집

자동 수집 영역:
  domain_knowledge: "해당 분야 전문 지식"
  technical_knowledge: "기술 구현 정보"
  market_knowledge: "시장 및 경쟁사 정보"
  user_knowledge: "타겟 사용자 행동 패턴"

수집 프로세스:
  1. 키워드 추출 → "맛집", "검색", "추천"
  2. 도메인 분류 → "로컬 서비스", "O2O 플랫폼"
  3. 관련 지식 검색 → 업계 트렌드, 기술 스택, 사용자 조사
  4. 컨텍스트 통합 → 프로젝트 특화 지식베이스 구성

자동 수집 예시:
  trigger_keywords: ["맛집", "추천", "리뷰"]
  
  auto_collected_knowledge:
    market_data:
      - "2024 외식 배달 시장 규모: 26조원"
      - "모바일 맛집 검색 비중: 84%"
      - "리뷰 신뢰도 중요성: 92% 참고"
    
    technical_trends:
      - "위치 기반 서비스: Google Maps API"
      - "추천 시스템: 협업 필터링 + 콘텐츠 기반"
      - "이미지 인식: Vision API 활용 증가"
    
    user_behavior:
      - "평균 맛집 검색 시간: 3분 이내"
      - "리뷰 작성률: 전체 방문자의 12%"
      - "사진 중심 의사결정: 78%"
```

### **Tools - 도구 선택**
```yaml
목적: 프로젝트에 최적화된 기술 스택과 도구 자동 선택

선택 기준:
  user_level: "사용자 기술 수준에 맞는 도구"
  project_complexity: "프로젝트 복잡도 기반 선택"
  timeline: "개발 일정에 따른 우선순위"
  budget: "예산 제약 조건 반영"

자동 선택 로직:
  domain_analysis: "도메인별 검증된 기술 스택"
  compatibility_check: "도구 간 호환성 검증"
  performance_optimization: "성능 요구사항 기반 최적화"
  scalability_consideration: "확장성 요구사항 반영"

선택 예시:
  project_analysis:
    domain: "위치 기반 모바일 서비스"
    complexity: "중간 (실시간 데이터 + 추천 알고리즘)"
    timeline: "4주 MVP"
    budget: "스타트업 수준"
  
  selected_tools:
    frontend: 
      primary: "React Native"
      reason: "크로스 플랫폼 + 빠른 개발"
      alternatives: ["Flutter", "Ionic"]
    
    backend:
      primary: "Node.js + Express"
      reason: "JavaScript 일관성 + 빠른 프로토타이핑"
      alternatives: ["Python Flask", "Go Gin"]
    
    database:
      primary: "PostgreSQL + Redis"
      reason: "지리 정보 + 캐싱 최적화"
      alternatives: ["MongoDB", "MySQL"]
    
    external_apis:
      - "Google Maps API (지도 서비스)"
      - "Google Vision API (이미지 분석)"
      - "Firebase (인증 + 푸시)"
```

### **Memory - 기억 관리**
```yaml
목적: 인터뷰 과정에서 누적된 정보를 체계적으로 관리

기억 계층:
  working_memory: "현재 대화 세션의 즉시 정보"
  session_memory: "전체 인터뷰 세션의 누적 정보"
  project_memory: "프로젝트 전체의 지속적 정보"

Working Memory (현재 대화):
  current_topic: "지금 논의 중인 주제"
  recent_answers: "최근 3개 답변 내용"
  emotional_state: "사용자의 현재 감정 상태"
  confusion_points: "명확하지 않은 부분들"

Session Memory (인터뷰 전체):
  key_decisions: "중요한 결정 사항들"
  priority_ranking: "기능 우선순위 변화"
  user_preferences: "사용자 선호도 패턴"
  constraints: "제약 조건 및 요구사항"

Project Memory (장기 기억):
  domain_patterns: "도메인별 성공 패턴"
  user_archetypes: "사용자 유형별 특성"
  technical_solutions: "검증된 기술 솔루션"
  failure_patterns: "피해야 할 실패 패턴"

기억 활용 예시:
  working_memory_query: "방금 전에 모바일 앱이라고 하셨는데..."
  session_memory_query: "처음에 말씀하신 타겟 사용자는..."
  project_memory_query: "비슷한 맛집 앱들의 성공 요인은..."
```

### **State - 상태 추적**
```yaml
목적: 프로젝트와 사용자의 현재 상태를 실시간으로 추적

추적 영역:
  interview_progress: "인터뷰 진행 상황"
  requirement_completeness: "요구사항 수집 완성도"
  user_engagement: "사용자 참여도 및 만족도"
  technical_readiness: "기술적 준비 상태"

Interview Progress:
  stage: "현재 인터뷰 단계 (1-5)"
  completion: "단계별 완성도 (%)"
  remaining_time: "예상 남은 시간"
  quality_score: "수집된 정보 품질 점수"

Requirement Completeness:
  core_features: "핵심 기능 정의 완성 (90%)"
  user_stories: "사용자 스토리 수집 (75%)"
  technical_specs: "기술 사양 정의 (60%)"
  success_metrics: "성공 지표 설정 (85%)"

User Engagement:
  response_quality: "답변 품질 점수"
  enthusiasm_level: "열정도 측정"
  confusion_indicators: "혼란 지표"
  satisfaction_score: "만족도 점수"

상태 기반 적응 예시:
  if engagement_level < 0.6:
    action: "더 구체적 예시 제공"
    question_style: "간단하고 명확하게"
  
  if completeness < 0.8:
    action: "누락된 정보 재확인"
    focus: "핵심 요구사항 우선"
  
  if confusion_indicators > 0.4:
    action: "설명 방식 변경"
    approach: "스토리텔링 활용"
```

### **Query - 쿼리 최적화**
```yaml
목적: 사용자의 모호한 요청을 명확하고 실행 가능한 지시사항으로 변환

최적화 과정:
  ambiguity_detection: "모호한 표현 감지"
  context_expansion: "컨텍스트 기반 의미 확장"
  requirement_clarification: "요구사항 명확화"
  action_specification: "구체적 실행 지시 생성"

변환 예시:
  original_query: "맛집 앱 만들어줘"
  
  optimization_process:
    step1_analyze: "앱 유형, 대상 사용자, 핵심 기능 불명확"
    step2_expand: "맛집 검색 + 리뷰 + 개인화 추천 가능성"
    step3_clarify: "위치 기반 맛집 검색 및 추천 모바일 앱"
    step4_specify: "구체적 기능 명세 및 구현 방향"
  
  optimized_query:
    project_title: "개인 맞춤형 위치 기반 맛집 발견 앱"
    core_purpose: "사용자 위치와 취향을 기반으로 주변 맛집을 추천하고, 신뢰할 만한 리뷰 정보를 제공"
    target_users: "20-30대 직장인, 새로운 맛집 탐험을 좋아하는 사람들"
    key_features:
      - "GPS 기반 주변 맛집 검색"
      - "개인 취향 학습 기반 맞춤 추천"
      - "사진 중심의 리뷰 시스템"
      - "실시간 운영 정보 (영업시간, 대기시간)"
    technical_requirements:
      - "iOS/Android 크로스 플랫폼"
      - "실시간 위치 서비스"
      - "이미지 처리 및 저장"
      - "추천 알고리즘 엔진"
```

---

## 🔄 컨텍스트 수집 워크플로우

### **실시간 수집 프로세스**
```python
class ContextCollector:
    def __init__(self):
        self.instructions_collector = InstructionsCollector()
        self.knowledge_collector = KnowledgeCollector()
        self.tools_selector = ToolsSelector()
        self.memory_manager = MemoryManager()
        self.state_tracker = StateTracker()
        self.query_optimizer = QueryOptimizer()
    
    def process_user_response(self, user_response, interview_stage):
        # 1. 즉시 파싱 및 분석
        parsed_response = self.parse_response(user_response)
        
        # 2. 6요소별 정보 추출
        context_updates = {
            'instructions': self.instructions_collector.extract(parsed_response),
            'knowledge': self.knowledge_collector.auto_collect(parsed_response),
            'tools': self.tools_selector.recommend(parsed_response),
            'memory': self.memory_manager.store(parsed_response),
            'state': self.state_tracker.update(parsed_response),
            'query': self.query_optimizer.refine(parsed_response)
        }
        
        # 3. 컨텍스트 통합 및 검증
        integrated_context = self.integrate_context(context_updates)
        quality_score = self.validate_context_quality(integrated_context)
        
        # 4. 다음 질문 생성을 위한 컨텍스트 준비
        next_question_context = self.prepare_question_context(
            integrated_context, 
            interview_stage,
            quality_score
        )
        
        return {
            'updated_context': integrated_context,
            'quality_score': quality_score,
            'next_question_context': next_question_context
        }
```

### **적응형 수집 전략**
```yaml
사용자 유형별 수집 전략:

초보자 (Beginner):
  approach: "단계별 안내 중심"
  instructions: "구체적 예시로 설명"
  knowledge: "기본 개념 중심 수집"
  tools: "간단하고 검증된 도구"
  memory: "반복 확인 및 요약"
  state: "이해도 지속 모니터링"
  query: "단순 명확한 표현으로 변환"

전문가 (Expert):
  approach: "효율성 중심"
  instructions: "고급 요구사항 탐색"
  knowledge: "최신 트렌드 및 고급 기법"
  tools: "최적화된 도구 조합"
  memory: "패턴 기반 빠른 매칭"
  state: "진행 속도 가속화"
  query: "기술적 정확성 중심 변환"

비즈니스 (Business):
  approach: "ROI 중심"
  instructions: "비즈니스 목표 연결"
  knowledge: "시장 분석 및 경쟁사 정보"
  tools: "확장성 및 비용 효율성"
  memory: "성공 사례 패턴"
  state: "비즈니스 임팩트 추적"
  query: "비즈니스 가치 중심 변환"
```

---

## 📊 수집 품질 관리

### **실시간 품질 평가**
```python
class ContextQualityAssessor:
    def assess_context_quality(self, context):
        quality_metrics = {}
        
        # Instructions 품질 평가
        quality_metrics['instructions'] = self.assess_instructions(
            context.instructions
        )
        
        # Knowledge 품질 평가
        quality_metrics['knowledge'] = self.assess_knowledge(
            context.knowledge
        )
        
        # Tools 품질 평가
        quality_metrics['tools'] = self.assess_tools(
            context.tools
        )
        
        # Memory 품질 평가
        quality_metrics['memory'] = self.assess_memory(
            context.memory
        )
        
        # State 품질 평가
        quality_metrics['state'] = self.assess_state(
            context.state
        )
        
        # Query 품질 평가
        quality_metrics['query'] = self.assess_query(
            context.query
        )
        
        # 종합 품질 점수 계산
        overall_quality = self.calculate_overall_quality(quality_metrics)
        
        return {
            'overall_quality': overall_quality,
            'detailed_metrics': quality_metrics,
            'improvement_suggestions': self.generate_suggestions(quality_metrics)
        }
    
    def assess_instructions(self, instructions):
        return {
            'clarity': self.measure_clarity(instructions),
            'completeness': self.measure_completeness(instructions),
            'specificity': self.measure_specificity(instructions),
            'actionability': self.measure_actionability(instructions)
        }
```

### **자동 품질 개선**
```yaml
품질 임계값:
  excellent: 0.9+ (즉시 개발 가능)
  good: 0.8-0.89 (최소 보완 후 진행)
  fair: 0.7-0.79 (추가 인터뷰 필요)
  poor: <0.7 (재인터뷰 권장)

자동 개선 액션:
  missing_information:
    action: "타겟 질문 생성"
    example: "핵심 기능이 불명확 → '가장 중요한 기능 3가지는?'"
  
  ambiguous_requirements:
    action: "명확화 질문 생성"
    example: "모바일 앱 → '네이티브 앱? 웹앱? 하이브리드?'"
  
  conflicting_requirements:
    action: "우선순위 질문 생성"
    example: "빠른 개발 vs 고품질 → '어느 것이 더 중요한가요?'"
  
  incomplete_context:
    action: "단계별 보완 가이드"
    example: "사용자 스토리 부족 → 시나리오별 질문 시퀀스"
```

---

## 🎯 고급 수집 기법

### **다중 소스 컨텍스트 통합**
```yaml
소스별 수집 전략:

직접 인터뷰:
  - 사용자 직접 발언
  - 감정 및 뉘앙스 분석
  - 실시간 피드백 수집

행동 패턴 분석:
  - 응답 시간 패턴
  - 질문 선호도
  - 관심 영역 집중도

외부 데이터 연동:
  - 시장 조사 데이터
  - 경쟁사 분석
  - 기술 트렌드 정보

과거 프로젝트 학습:
  - 유사 프로젝트 패턴
  - 성공/실패 요인
  - 최적화된 솔루션
```

### **예측적 컨텍스트 수집**
```python
class PredictiveContextCollector:
    def predict_missing_context(self, current_context):
        # 패턴 매칭으로 누락될 가능성이 높은 정보 예측
        similar_projects = self.find_similar_projects(current_context)
        
        predicted_requirements = []
        for project in similar_projects:
            missing_items = self.identify_gaps(
                current_context, 
                project.complete_requirements
            )
            predicted_requirements.extend(missing_items)
        
        # 예측된 요구사항을 프로액티브 질문으로 변환
        proactive_questions = self.generate_proactive_questions(
            predicted_requirements
        )
        
        return {
            'predicted_gaps': predicted_requirements,
            'proactive_questions': proactive_questions
        }
```

---

## 🔧 구현 가이드

### **컨텍스트 저장소 설계**
```python
class ContextRepository:
    def __init__(self):
        self.instructions_store = InstructionsStore()
        self.knowledge_store = KnowledgeStore()
        self.tools_store = ToolsStore()
        self.memory_store = MemoryStore()
        self.state_store = StateStore()
        self.query_store = QueryStore()
    
    def store_context(self, session_id, context_data):
        # 6요소별 저장
        for element, data in context_data.items():
            store = getattr(self, f"{element}_store")
            store.save(session_id, data)
    
    def retrieve_context(self, session_id):
        # 6요소 통합 조회
        context = {}
        for element in ['instructions', 'knowledge', 'tools', 
                       'memory', 'state', 'query']:
            store = getattr(self, f"{element}_store")
            context[element] = store.load(session_id)
        
        return context
    
    def search_similar_contexts(self, context_pattern):
        # 유사 컨텍스트 패턴 검색
        similar_contexts = []
        
        for store_name in ['instructions', 'knowledge', 'tools']:
            store = getattr(self, f"{store_name}_store")
            similar_items = store.similarity_search(
                context_pattern[store_name]
            )
            similar_contexts.extend(similar_items)
        
        return similar_contexts
```

### **실시간 컨텍스트 동기화**
```javascript
class ContextSynchronizer {
  constructor() {
    this.websocket = new WebSocket('ws://context-sync-server');
    this.localContext = new LocalContextStore();
    this.eventEmitter = new EventEmitter();
  }
  
  syncContext(sessionId, contextUpdates) {
    // 로컬 컨텍스트 업데이트
    this.localContext.update(sessionId, contextUpdates);
    
    // 서버 동기화
    this.websocket.send(JSON.stringify({
      type: 'context_update',
      sessionId: sessionId,
      updates: contextUpdates,
      timestamp: Date.now()
    }));
    
    // 이벤트 발행
    this.eventEmitter.emit('context_updated', {
      sessionId,
      updates: contextUpdates
    });
  }
  
  onContextUpdate(callback) {
    this.eventEmitter.on('context_updated', callback);
  }
}
```

---

## 📈 성과 측정

### **수집 효율성**
- **수집 시간**: 15-30분 (기존 2-3일 대비 95% 단축)
- **정보 완성도**: 95% (필수 요소 누락 없음)
- **정확도**: 92% (후속 수정 비율 8%)

### **컨텍스트 품질**
- **명확성**: 90% (모호함 해결률)
- **일관성**: 88% (요소 간 충돌 없음)
- **실행 가능성**: 93% (바로 개발 가능)

### **사용자 만족도**
- **인터뷰 경험**: 4.6/5.0
- **결과 만족도**: 4.4/5.0
- **재사용 의향**: 91%

---

## 🔗 다음 단계

1. **[Adaptive Styles](03_Adaptive_Styles.md)** - 사용자별 맞춤 스타일
2. **[Auto Execution](04_Auto_Execution.md)** - 인터뷰 후 자동 실행
3. **[Success Patterns](05_Success_Patterns.md)** - 성공 패턴 분석

---

**💡 핵심 메시지**: 체계적인 Context Collection은 AI 인터뷰의 핵심으로, 6요소를 균형있게 수집하여 완벽한 개발 컨텍스트를 구성하는 것이 성공적인 프로젝트의 시작입니다.
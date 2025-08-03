# 첫 스프린트 계획

## 개요

프로젝트의 첫 스프린트를 효과적으로 계획하고 실행하는 방법을 다룹니다. 실현 가능한 목표 설정부터 진행 상황 추적까지 모든 과정을 안내합니다.

## 스프린트 기본 구조

### 스프린트 플래닝 프레임워크

```typescript
// 스프린트 계획 관리자
class SprintPlanningManager {
  async planFirstSprint(
    project: Project,
    team: Team,
    duration: number = 14 // days
  ): Promise<SprintPlan> {

    // 1. MVP 범위 정의
    const mvpScope = await this.defineMVPScope(project);

    // 2. 사용자 스토리 작성
    const userStories = await this.createUserStories(mvpScope);

    // 3. 태스크 분해
    const tasks = await this.breakdownIntoTasks(userStories);

    // 4. 예상 시간 산정
    const estimatedTasks = await this.estimateTasks(tasks, team);

    // 5. 스프린트 백로그 구성
    const sprintBacklog = await this.createSprintBacklog(
      estimatedTasks,
      team.velocity,
      duration
    );

    // 6. 스프린트 목표 설정
    const sprintGoal = await this.defineSprintGoal(sprintBacklog);

    return {
      goal: sprintGoal,
      backlog: sprintBacklog,
      duration,
      startDate: new Date(),
      endDate: this.calculateEndDate(duration),
      team,
      metrics: await this.defineSuccessMetrics(sprintGoal)
    };
  }
}
```

### MVP 범위 정의

```typescript
// MVP 스코프 정의
interface MVPScope {
  coreFeatures: Feature[];
  userFlows: UserFlow[];
  successCriteria: Criteria[];
  outOfScope: string[];
}

class MVPScopeDefiner {
  async defineMVPScope(project: Project): Promise<MVPScope> {
    // 핵심 기능 정의
    const coreFeatures = [
      {
        name: '사용자 인증',
        priority: 'Critical',
        components: [
          '회원가입',
          '로그인/로그아웃',
          '비밀번호 재설정'
        ],
        estimatedDays: 3
      },
      {
        name: '핵심 비즈니스 기능',
        priority: 'Critical',
        components: [
          '데이터 CRUD',
          '기본 검색',
          '결과 표시'
        ],
        estimatedDays: 5
      },
      {
        name: '기본 UI/UX',
        priority: 'High',
        components: [
          '반응형 레이아웃',
          '기본 내비게이션',
          '에러 처리'
        ],
        estimatedDays: 4
      }
    ];

    // 사용자 플로우 정의
    const userFlows = [
      {
        name: '신규 사용자 온보딩',
        steps: [
          '홈페이지 방문',
          '회원가입 클릭',
          '정보 입력',
          '이메일 인증',
          '첫 로그인'
        ],
        priority: 'Critical'
      },
      {
        name: '핵심 기능 사용',
        steps: [
          '로그인',
          '대시보드 확인',
          '데이터 생성',
          '결과 확인'
        ],
        priority: 'Critical'
      }
    ];

    // 성공 기준
    const successCriteria = [
      {
        metric: '사용자 등록 성공률',
        target: '> 80%',
        measurement: '회원가입 시작 vs 완료'
      },
      {
        metric: '핵심 기능 작동',
        target: '100%',
        measurement: 'E2E 테스트 통과'
      },
      {
        metric: '페이지 로드 시간',
        target: '< 3초',
        measurement: 'Lighthouse 측정'
      }
    ];

    // 범위 외 항목
    const outOfScope = [
      '고급 분석 기능',
      '소셜 로그인',
      '모바일 앱',
      '다국어 지원',
      'API 공개'
    ];

    return {
      coreFeatures,
      userFlows,
      successCriteria,
      outOfScope
    };
  }
}
```

## 사용자 스토리 작성

### 사용자 스토리 템플릿

```typescript
// 사용자 스토리 생성기
class UserStoryGenerator {
  generateUserStory(
    persona: UserPersona,
    need: string,
    value: string
  ): UserStory {
    return {
      id: this.generateId(),
      title: `${persona.role}로서 ${need}`,
      story: `${persona.role}로서
              나는 ${need}를 원한다
              왜냐하면 ${value}기 때문이다`,
      acceptanceCriteria: [],
      priority: 'Medium',
      estimation: null,
      dependencies: []
    };
  }

  // 첫 스프린트 핵심 스토리
  getFirstSprintStories(): UserStory[] {
    return [
      {
        id: 'US001',
        title: '신규 사용자 등록',
        story: `신규 방문자로서
                나는 이메일로 회원가입을 하고 싶다
                왜냐하면 서비스를 사용하고 싶기 때문이다`,
        acceptanceCriteria: [
          '이메일 주소와 비밀번호로 가입 가능',
          '이메일 중복 체크',
          '비밀번호 규칙 검증',
          '인증 이메일 발송',
          '회원가입 후 자동 로그인'
        ],
        priority: 'Critical',
        estimation: 5,
        dependencies: []
      },
      {
        id: 'US002',
        title: '로그인 및 세션 관리',
        story: `등록된 사용자로서
                나는 안전하게 로그인하고 세션을 유지하고 싶다
                왜냐하면 내 데이터를 보호하고 싶기 때문이다`,
        acceptanceCriteria: [
          '이메일/비밀번호 로그인',
          'JWT 토큰 발급',
          '세션 만료 처리',
          '로그아웃 기능',
          '비밀번호 5회 실패 시 잠금'
        ],
        priority: 'Critical',
        estimation: 3,
        dependencies: ['US001']
      },
      {
        id: 'US003',
        title: '핵심 데이터 CRUD',
        story: `로그인한 사용자로서
                나는 데이터를 생성, 조회, 수정, 삭제하고 싶다
                왜냐하면 서비스의 핵심 기능이기 때문이다`,
        acceptanceCriteria: [
          '데이터 생성 폼 및 검증',
          '목록 조회 및 페이지네이션',
          '상세 조회',
          '수정 기능',
          '삭제 기능 (소프트 삭제)',
          '권한 검증'
        ],
        priority: 'Critical',
        estimation: 8,
        dependencies: ['US002']
      }
    ];
  }
}
```

### 인수 조건 정의

```typescript
// 인수 조건 체크리스트
class AcceptanceCriteriaBuilder {
  buildCriteria(
    userStory: UserStory,
    type: 'functional' | 'performance' | 'security'
  ): AcceptanceCriteria[] {

    const criteriaTemplates = {
      functional: [
        {
          given: '사용자가 폼에 데이터를 입력했을 때',
          when: '제출 버튼을 클릭하면',
          then: '데이터가 저장되고 성공 메시지가 표시된다'
        },
        {
          given: '필수 필드가 비어있을 때',
          when: '제출을 시도하면',
          then: '오류 메시지가 표시되고 포커스가 이동한다'
        }
      ],
      performance: [
        {
          given: '페이지가 로드될 때',
          when: '3G 네트워크 환경에서',
          then: '3초 이내에 사용 가능한 상태가 된다'
        },
        {
          given: 'API 요청을 보냈을 때',
          when: '서버가 정상 작동 중일 때',
          then: '500ms 이내에 응답을 받는다'
        }
      ],
      security: [
        {
          given: '인증되지 않은 사용자가',
          when: '보호된 리소스에 접근하면',
          then: '401 오류와 함께 로그인 페이지로 리다이렉트된다'
        },
        {
          given: 'SQL 인젝션 시도가 있을 때',
          when: '입력 필드에 악성 코드를 입력하면',
          then: '입력이 산화되고 에러 없이 처리된다'
        }
      ]
    };

    return criteriaTemplates[type].map(template => ({
      ...template,
      testable: true,
      automated: true
    }));
  }
}
```

## 태스크 분해 및 예상

### 태스크 분해 전략

```typescript
// 태스크 분해기
class TaskBreakdownService {
  async breakdownUserStory(
    userStory: UserStory
  ): Promise<Task[]> {
    const tasks: Task[] = [];

    // 프론트엔드 태스크
    if (this.requiresFrontend(userStory)) {
      tasks.push(...this.createFrontendTasks(userStory));
    }

    // 백엔드 태스크
    if (this.requiresBackend(userStory)) {
      tasks.push(...this.createBackendTasks(userStory));
    }

    // 데이터베이스 태스크
    if (this.requiresDatabase(userStory)) {
      tasks.push(...this.createDatabaseTasks(userStory));
    }

    // 테스트 태스크
    tasks.push(...this.createTestTasks(userStory));

    // 문서화 태스크
    tasks.push(...this.createDocumentationTasks(userStory));

    return tasks;
  }

  private createFrontendTasks(story: UserStory): Task[] {
    return [
      {
        id: `${story.id}-FE-01`,
        title: `${story.title} - UI 컴포넌트 개발`,
        type: 'frontend',
        description: 'React 컴포넌트 및 스타일링',
        estimation: 4,
        assignee: null,
        status: 'TODO',
        dependencies: []
      },
      {
        id: `${story.id}-FE-02`,
        title: `${story.title} - 상태 관리`,
        type: 'frontend',
        description: 'Redux/Zustand 상태 관리',
        estimation: 2,
        assignee: null,
        status: 'TODO',
        dependencies: [`${story.id}-FE-01`]
      },
      {
        id: `${story.id}-FE-03`,
        title: `${story.title} - API 통합`,
        type: 'frontend',
        description: 'API 호출 및 에러 처리',
        estimation: 3,
        assignee: null,
        status: 'TODO',
        dependencies: [`${story.id}-BE-01`]
      }
    ];
  }
}
```

### 시간 예상 기법

```typescript
// 플래닝 포커 예상
class PlanningPokerEstimator {
  private readonly fibonacciSequence = [1, 2, 3, 5, 8, 13, 21];

  async estimateTask(
    task: Task,
    team: TeamMember[]
  ): Promise<TaskEstimation> {
    // 각 팀원의 예상
    const estimates = await Promise.all(
      team.map(member => this.getMemberEstimate(member, task))
    );

    // 평균과 표준편차 계산
    const average = this.calculateAverage(estimates);
    const stdDev = this.calculateStandardDeviation(estimates);

    // 합의 필요 여부 판단
    if (stdDev > 5) {
      // 큰 차이가 있으면 토론 필요
      return {
        needsDiscussion: true,
        estimates,
        suggestedEstimate: null,
        confidence: 'Low'
      };
    }

    // 가장 가까운 피보나치 수로 반올림
    const finalEstimate = this.roundToFibonacci(average);

    return {
      needsDiscussion: false,
      estimates,
      suggestedEstimate: finalEstimate,
      confidence: this.calculateConfidence(stdDev)
    };
  }

  // 벨로시티 계산
  calculateTeamVelocity(
    completedSprints: Sprint[]
  ): VelocityMetrics {
    const velocities = completedSprints.map(sprint =>
      sprint.completedPoints
    );

    return {
      average: this.calculateAverage(velocities),
      recent: velocities.slice(-3), // 최근 3개 스프린트
      trend: this.calculateTrend(velocities),
      confidence: this.calculateVelocityConfidence(velocities)
    };
  }
}
```

## 스프린트 백로그 관리

### 백로그 구성

```typescript
// 스프린트 백로그 관리자
class SprintBacklogManager {
  async createSprintBacklog(
    estimatedTasks: EstimatedTask[],
    velocity: number,
    sprintDuration: number
  ): Promise<SprintBacklog> {

    // 우선순위 기반 정렬
    const prioritizedTasks = this.prioritizeTasks(estimatedTasks);

    // 벨로시티에 맞춰 태스크 선택
    const selectedTasks: EstimatedTask[] = [];
    let totalPoints = 0;

    for (const task of prioritizedTasks) {
      if (totalPoints + task.estimation <= velocity) {
        selectedTasks.push(task);
        totalPoints += task.estimation;
      }
    }

    // 백로그 구성
    return {
      tasks: selectedTasks,
      totalPoints,
      velocity,
      utilizationRate: (totalPoints / velocity) * 100,
      buffer: velocity - totalPoints,
      risks: this.identifyRisks(selectedTasks)
    };
  }

  // 우선순위 결정 알고리즘
  private prioritizeTasks(tasks: EstimatedTask[]): EstimatedTask[] {
    return tasks.sort((a, b) => {
      // 1. 비즈니스 가치
      const valueScore = b.businessValue - a.businessValue;
      if (valueScore !== 0) return valueScore;

      // 2. 의존성
      const depScore = a.dependencies.length - b.dependencies.length;
      if (depScore !== 0) return depScore;

      // 3. 리스크
      const riskScore = b.risk - a.risk;
      if (riskScore !== 0) return riskScore;

      // 4. 크기 (작은 것 우선)
      return a.estimation - b.estimation;
    });
  }
}
```

## 진행 상황 추적

### 번다운 차트

```typescript
// 번다운 차트 생성기
class BurndownChartGenerator {
  generateBurndownData(
    sprint: Sprint,
    dailyProgress: DailyProgress[]
  ): BurndownChartData {
    const idealLine = this.calculateIdealLine(
      sprint.totalPoints,
      sprint.duration
    );

    const actualLine = dailyProgress.map(day => ({
      date: day.date,
      remainingPoints: day.remainingPoints,
      completedPoints: sprint.totalPoints - day.remainingPoints
    }));

    const forecast = this.forecastCompletion(
      actualLine,
      sprint.endDate
    );

    return {
      ideal: idealLine,
      actual: actualLine,
      forecast,
      metrics: {
        onTrack: this.isOnTrack(idealLine, actualLine),
        estimatedCompletion: forecast.completionDate,
        velocity: this.calculateCurrentVelocity(actualLine),
        risk: this.assessCompletionRisk(actualLine, idealLine)
      }
    };
  }
}
```

### 일일 스크럼

```typescript
// 일일 스크럼 템플릿
class DailyScrumTemplate {
  generateDailyScrumQuestions(): DailyScrumQuestions {
    return {
      yesterday: '어제 무엇을 완료했나요?',
      today: '오늘 무엇을 할 계획인가요?',
      blockers: '진행을 방해하는 요소가 있나요?'
    };
  }

  async recordDailyScrum(
    team: TeamMember[],
    date: Date
  ): Promise<DailyScrumRecord> {
    const updates = await Promise.all(
      team.map(member => this.getMemberUpdate(member))
    );

    const blockers = updates
      .filter(update => update.blockers.length > 0)
      .flatMap(update => update.blockers);

    return {
      date,
      attendees: team,
      updates,
      blockers,
      actionItems: this.generateActionItems(blockers),
      teamMood: this.assessTeamMood(updates)
    };
  }
}
```

## 스프린트 리뷰 및 회고

### 스프린트 리뷰 프레임워크

```typescript
// 스프린트 리뷰 및 회고
class SprintRetrospective {
  async conductRetrospective(
    sprint: CompletedSprint
  ): Promise<RetrospectiveResults> {

    // 정량적 분석
    const metrics = {
      plannedPoints: sprint.plannedPoints,
      completedPoints: sprint.completedPoints,
      completionRate: (sprint.completedPoints / sprint.plannedPoints) * 100,
      velocity: sprint.completedPoints / sprint.duration,
      qualityMetrics: await this.analyzeQuality(sprint)
    };

    // 정성적 피드백
    const feedback = {
      whatWentWell: [],
      whatCouldBeImproved: [],
      actionItems: []
    };

    // 개선 사항
    const improvements = [
      {
        area: '예상 정확도',
        current: metrics.completionRate,
        target: 90,
        action: '플래닝 포커 세션 개선'
      },
      {
        area: '커뮤니케이션',
        current: 7,
        target: 9,
        action: '일일 스크럼 참여율 향상'
      }
    ];

    return {
      sprint: sprint.id,
      metrics,
      feedback,
      improvements,
      nextSprintRecommendations: this.generateRecommendations(
        metrics,
        feedback,
        improvements
      )
    };
  }
}
```

## SuperClaude 스프린트 명령어

```bash
# 스프린트 계획
/sprint plan --duration 2weeks --team-size 5

# MVP 범위 정의
/define mvp --features core --timeline 2weeks

# 사용자 스토리 생성
/create user-stories --from-mvp --with-criteria

# 태스크 분해
/breakdown stories --into-tasks --estimate

# 플래닝 포커
/planning-poker --team @all --tasks unestimated

# 백로그 구성
/create backlog --velocity 40 --priority-based

# 진행 상황 확인
/sprint status --burndown --forecast

# 일일 스크럼
/daily-scrum --record --identify-blockers

# 스프린트 리뷰
/sprint review --demo --stakeholder-feedback

# 회고
/retrospective --metrics --improvements --action-items
```

이 첫 스프린트 계획 가이드를 통해 프로젝트를 체계적으로 시작하고 지속적으로 개선해 나갈 수 있습니다.
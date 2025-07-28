# 팀 온보딩

## 개요

새로운 팀원이 빠르게 프로젝트에 적응하고 생산성을 발휘할 수 있도록 돕는 체계적인 온보딩 프로세스를 설계합니다.

## 첫날 체크리스트

### Day 1 온보딩 플래니

```typescript
// 첫날 온보딩 관리 시스템
class FirstDayOnboarding {
  async executeDay1Plan(
    newMember: TeamMember
  ): Promise<OnboardingResult> {
    const tasks: OnboardingTask[] = [
      // 오전 (9:00 - 12:00)
      {
        time: '09:00',
        task: '환영 및 팀 소개',
        duration: 30,
        responsible: 'Team Lead',
        checklist: [
          '팀원 소개',
          '자리 배치',
          '팀 문화 설명'
        ]
      },
      {
        time: '09:30',
        task: '계정 및 접근 권한 설정',
        duration: 60,
        responsible: 'IT Admin',
        checklist: [
          'Email 계정',
          'Slack/Discord 초대',
          'GitHub 접근 권한',
          'AWS/Cloud 계정',
          '2FA 설정'
        ]
      },
      {
        time: '10:30',
        task: '개발 환경 설정',
        duration: 90,
        responsible: 'Tech Lead',
        checklist: [
          '노트북 세팅',
          '개발 도구 설치',
          '프로젝트 클론',
          '로컬 환경 구축',
          '테스트 실행'
        ]
      },
      
      // 오후 (13:00 - 18:00)
      {
        time: '13:00',
        task: '프로젝트 오버뷰',
        duration: 120,
        responsible: 'Project Manager',
        checklist: [
          '비즈니스 배경',
          '프로젝트 목표',
          '기술 스택',
          '아키텍처 설명',
          '현재 진행 상황'
        ]
      },
      {
        time: '15:00',
        task: '코드베이스 투어',
        duration: 90,
        responsible: 'Senior Developer',
        checklist: [
          '프로젝트 구조',
          '핵심 컴포넌트',
          '코딩 컨벤션',
          '테스트 전략',
          '배포 프로세스'
        ]
      },
      {
        time: '16:30',
        task: '첫 태스크 할당',
        duration: 60,
        responsible: 'Tech Lead',
        checklist: [
          '스타터 태스크 선정',
          '지마 배정',
          '목표 설정',
          '리뷰 프로세스 안내'
        ]
      }
    ];
    
    // 실행 및 추적
    const results = await this.executeTasks(tasks, newMember);
    
    return {
      member: newMember,
      completedTasks: results.filter(r => r.completed),
      pendingTasks: results.filter(r => !r.completed),
      nextSteps: this.generateNextSteps(results)
    };
  }
}
```

### 필수 설정 자동화

```bash
#!/bin/bash
# onboard-new-member.sh
# 새 팀원 온보딩 자동화 스크립트

set -e

echo "🎉 새로운 팀원 온보딩을 시작합니다!"

# 사용자 정보 입력
read -p "이름: " NAME
read -p "이메일: " EMAIL
read -p "GitHub 사용자명: " GITHUB_USERNAME
read -p "역할 (developer/designer/pm): " ROLE

# 1. 개발 환경 체크
echo "
🔍 개발 환경 확인 중..."
check_requirements() {
  local tools=("git" "node" "docker" "code")
  for tool in "${tools[@]}"; do
    if command -v $tool &> /dev/null; then
      echo "✅ $tool 설치 확인"
    else
      echo "❌ $tool이 설치되어 있지 않습니다"
      echo "   설치 방법: https://docs.company.com/setup/$tool"
    fi
  done
}

check_requirements

# 2. 프로젝트 클론
echo "
📦 프로젝트 클론 중..."
mkdir -p ~/workspace
cd ~/workspace

for repo in "main-app" "shared-components" "documentation"; do
  if [ ! -d "$repo" ]; then
    git clone git@github.com:company/$repo.git
    echo "✅ $repo 클론 완료"
  else
    echo "ℹ️  $repo가 이미 존재합니다"
  fi
done

# 3. 환경 변수 설정
echo "
🔐 환경 변수 설정 중..."
for repo in "main-app" "shared-components"; do
  if [ -f "$repo/.env.example" ]; then
    cp $repo/.env.example $repo/.env.local
    echo "⚠️  $repo/.env.local 파일을 업데이트하세요"
  fi
done

# 4. 의존성 설치
echo "
📚 의존성 설치 중..."
for repo in "main-app" "shared-components"; do
  cd ~/workspace/$repo
  if [ -f "package.json" ]; then
    npm install
    echo "✅ $repo 의존성 설치 완료"
  fi
done

# 5. 접근 권한 요청
echo "
🔑 접근 권한 요청 중..."
curl -X POST https://api.company.com/onboarding/access \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'$NAME'",
    "email": "'$EMAIL'",
    "github": "'$GITHUB_USERNAME'",
    "role": "'$ROLE'"
  }'

# 6. 온보딩 가이드 생성
echo "
📝 개인화된 온보딩 가이드 생성 중..."
cat > ~/workspace/onboarding-guide-$NAME.md << EOF
# $NAME님의 온보딩 가이드

## 환영합니다! 🎉

### 확인해야 할 사항
- [ ] 이메일 계정 확인
- [ ] Slack 참여
- [ ] GitHub 접근 권한 확인
- [ ] 개발 환경 테스트

### 프로젝트 위치
- Main App: ~/workspace/main-app
- Components: ~/workspace/shared-components
- Docs: ~/workspace/documentation

### 다음 단계
1. 환경 변수 설정 완료
2. 로컬에서 앱 실행 테스트
3. 첫 태스크 시작

### 도움이 필요하면
- Tech Lead: @tech-lead
- Project Manager: @pm
- IT Support: @it-support
EOF

echo "
✅ 온보딩 기본 설정 완료!"
echo "📚 가이드 파일: ~/workspace/onboarding-guide-$NAME.md"
```

## 프로젝트 이해

### 비즈니스 컨텍스트 공유

```typescript
// 프로젝트 컨텍스트 문서 생성
class ProjectContextBuilder {
  async buildContextDocument(
    project: Project
  ): Promise<ContextDocument> {
    return {
      overview: {
        name: project.name,
        mission: project.mission,
        vision: project.vision,
        startDate: project.startDate,
        currentPhase: project.currentPhase
      },
      
      businessContext: {
        problem: '해결하려는 문제',
        solution: '우리의 해결책',
        targetUsers: [
          {
            persona: 'Primary User',
            needs: ['Need 1', 'Need 2'],
            painPoints: ['Pain 1', 'Pain 2']
          }
        ],
        competitors: [
          {
            name: 'Competitor A',
            strengths: ['Strength 1'],
            weaknesses: ['Weakness 1'],
            ourDifferentiation: 'How we differ'
          }
        ],
        successMetrics: [
          {
            metric: 'Monthly Active Users',
            current: 1000,
            target: 10000,
            timeline: '6 months'
          }
        ]
      },
      
      technicalContext: {
        architecture: {
          type: 'Microservices',
          mainComponents: [
            {
              name: 'API Gateway',
              purpose: '요청 라우팅 및 인증',
              technology: 'Kong'
            },
            {
              name: 'User Service',
              purpose: '사용자 관리',
              technology: 'Node.js + PostgreSQL'
            }
          ],
          infrastructure: {
            cloud: 'AWS',
            regions: ['us-east-1', 'ap-northeast-2'],
            services: ['ECS', 'RDS', 'ElastiCache', 'S3']
          }
        },
        
        techStack: {
          frontend: ['React', 'Next.js', 'TypeScript'],
          backend: ['Node.js', 'Express', 'GraphQL'],
          database: ['PostgreSQL', 'Redis'],
          devOps: ['Docker', 'Kubernetes', 'GitHub Actions']
        },
        
        integrations: [
          {
            service: 'Stripe',
            purpose: '결제 처리',
            status: 'Production'
          },
          {
            service: 'SendGrid',
            purpose: '이메일 발송',
            status: 'Production'
          }
        ]
      },
      
      teamStructure: {
        teams: [
          {
            name: 'Frontend Team',
            lead: 'John Doe',
            members: 4,
            responsibilities: ['UI/UX', 'Client-side logic']
          },
          {
            name: 'Backend Team',
            lead: 'Jane Smith',
            members: 5,
            responsibilities: ['API', 'Business logic', 'Database']
          }
        ],
        
        communicationChannels: [
          {
            channel: 'Slack #general',
            purpose: '일반 소통'
          },
          {
            channel: 'Slack #dev',
            purpose: '개발 관련 논의'
          }
        ],
        
        meetings: [
          {
            name: 'Daily Standup',
            frequency: '매일 10:00',
            participants: '전체 개발팀'
          },
          {
            name: 'Sprint Planning',
            frequency: '격주 월요일',
            participants: '팀 리드 + PM'
          }
        ]
      }
    };
  }
}
```

### 기술 스택 학습 가이드

```typescript
// 기술 학습 경로 생성
class TechStackLearningPath {
  generateLearningPath(
    role: DeveloperRole,
    currentSkills: Skill[],
    projectStack: TechStack
  ): LearningPath {
    const requiredSkills = this.identifyRequiredSkills(role, projectStack);
    const skillGaps = this.findSkillGaps(currentSkills, requiredSkills);
    
    return {
      overview: {
        role,
        estimatedTime: this.estimateLearningTime(skillGaps),
        priority: this.prioritizeSkills(skillGaps)
      },
      
      learningModules: skillGaps.map(skill => ({
        skill: skill.name,
        importance: skill.importance,
        currentLevel: skill.currentLevel || 'Beginner',
        targetLevel: skill.targetLevel,
        
        resources: [
          {
            type: 'documentation',
            title: `Official ${skill.name} Documentation`,
            url: skill.officialDocs,
            estimatedTime: '2-4 hours'
          },
          {
            type: 'tutorial',
            title: `${skill.name} Crash Course`,
            url: skill.tutorialUrl,
            estimatedTime: '4-6 hours'
          },
          {
            type: 'project',
            title: `Build a mini project with ${skill.name}`,
            description: skill.projectIdea,
            estimatedTime: '8-16 hours'
          }
        ],
        
        practiceExercises: [
          {
            title: `Basic ${skill.name} Exercise`,
            difficulty: 'Easy',
            description: skill.basicExercise,
            solution: skill.basicSolution
          },
          {
            title: `Intermediate ${skill.name} Challenge`,
            difficulty: 'Medium',
            description: skill.intermediateExercise
          }
        ],
        
        realProjectExamples: [
          {
            file: skill.exampleFile,
            description: `See how we use ${skill.name} in production`,
            keyConcepts: skill.keyConceptsInCode
          }
        ]
      }))
    };
  }
}
```

## 멘토링 시스템

### 버디 프로그램 설계

```typescript
// 버디 시스템 관리
class BuddySystem {
  async assignBuddy(
    newMember: TeamMember,
    team: Team
  ): Promise<BuddyAssignment> {
    // 최적의 버디 선택
    const availableBuddies = team.members.filter(member => 
      member.canBeBuddy && 
      member.currentBuddyCount < 2
    );
    
    const buddy = this.selectBestBuddy(newMember, availableBuddies);
    
    // 버디 가이드 생성
    const buddyGuide = {
      forBuddy: {
        responsibilities: [
          '매일 체크인 (1주일간)',
          '질문에 대한 빠른 응답',
          '코드 리뷰 도움',
          '팀 문화 안내',
          '점심 함께 하기 (첫 주)'
        ],
        
        checkpoints: [
          {
            day: 1,
            tasks: [
              '개발 환경 확인',
              '첫 태스크 설명',
              '팀 채널 소개'
            ]
          },
          {
            day: 3,
            tasks: [
              '첫 코드 리뷰',
              '개발 프로세스 확인',
              '어려움 해결'
            ]
          },
          {
            day: 7,
            tasks: [
              '주간 회고',
              '다음 단계 계획',
              '피드백 수집'
            ]
          }
        ]
      },
      
      forNewMember: {
        buddyInfo: {
          name: buddy.name,
          role: buddy.role,
          expertise: buddy.expertise,
          contactInfo: buddy.contactInfo,
          availability: buddy.workingHours
        },
        
        expectations: [
          '부담 없이 질문하기',
          '매일 진행 상황 공유',
          '어려움 즉시 알리기',
          '피드백 수용하기'
        ]
      }
    };
    
    return {
      newMember,
      buddy,
      guide: buddyGuide,
      startDate: new Date(),
      endDate: this.addDays(new Date(), 14)
    };
  }
}
```

### 지식 공유 세션

```typescript
// 온보딩 세션 관리
class OnboardingSessionManager {
  scheduleKnowledgeSessions(
    newMember: TeamMember,
    week: number
  ): SessionSchedule[] {
    const sessions = [
      // Week 1: 기초 세션
      {
        week: 1,
        sessions: [
          {
            title: '프로젝트 아키텍처 오버뷰',
            presenter: 'Tech Lead',
            duration: 90,
            topics: [
              '전체 시스템 구조',
              '핵심 컴포넌트',
              '데이터 흐름',
              '보안 고려사항'
            ],
            materials: [
              'architecture-diagram.pdf',
              'component-guide.md'
            ]
          },
          {
            title: '개발 프로세스 및 도구',
            presenter: 'Senior Developer',
            duration: 60,
            topics: [
              'Git 워크플로우',
              'CI/CD 파이프라인',
              '코드 리뷰 프로세스',
              '테스트 전략'
            ]
          }
        ]
      },
      
      // Week 2: 심화 세션
      {
        week: 2,
        sessions: [
          {
            title: '비즈니스 로직 심화',
            presenter: 'Product Manager',
            duration: 120,
            topics: [
              '핵심 기능 상세',
              '사용자 스토리',
              '로드맵',
              'KPI 및 메트릭'
            ]
          },
          {
            title: '디버깅 및 모니터링',
            presenter: 'DevOps Engineer',
            duration: 90,
            topics: [
              '로그 분석',
              '성능 모니터링',
              '에러 추적',
              '사고 대응'
            ]
          }
        ]
      }
    ];
    
    return sessions.find(s => s.week === week)?.sessions || [];
  }
}
```

## 첫 태스크 할당

### 스타터 태스크 선정

```typescript
// 스타터 태스크 관리
class StarterTaskManager {
  selectStarterTask(
    member: TeamMember,
    availableTasks: Task[]
  ): StarterTask {
    // 적합한 태스크 필터링
    const suitableTasks = availableTasks.filter(task => 
      task.difficulty <= 'Medium' &&
      task.estimatedHours <= 16 &&
      task.dependencies.length === 0 &&
      !task.requiresProductionAccess
    );
    
    // 역할별 추천 태스크
    const roleBasedTasks = {
      frontend: [
        {
          title: 'UI 컴포넌트 개선',
          description: '기존 버튼 컴포넌트에 로딩 상태 추가',
          skills: ['React', 'CSS', 'TypeScript'],
          learningGoals: [
            '컴포넌트 구조 이해',
            '상태 관리 패턴',
            '테스트 작성'
          ]
        }
      ],
      
      backend: [
        {
          title: 'API 엔드포인트 추가',
          description: '사용자 프로필 조회 API 구현',
          skills: ['Node.js', 'Express', 'PostgreSQL'],
          learningGoals: [
            'RESTful API 설계',
            '데이터베이스 연동',
            '에러 처리'
          ]
        }
      ],
      
      fullstack: [
        {
          title: '기능 버그 수정',
          description: '사용자 목록 페이지네이션 버그 수정',
          skills: ['React', 'Node.js', 'Debugging'],
          learningGoals: [
            '버그 추적 방법',
            '프론트-백 연동',
            '테스트 케이스 작성'
          ]
        }
      ]
    };
    
    const recommendedTask = roleBasedTasks[member.role]?.[0] || suitableTasks[0];
    
    return {
      task: recommendedTask,
      
      setupGuide: {
        steps: [
          '저장소에서 새 브랜치 생성',
          '관련 파일 분석',
          '로컬 환경에서 테스트',
          '변경 사항 구현',
          '테스트 작성',
          'PR 생성'
        ],
        
        resources: [
          {
            type: 'documentation',
            url: '/docs/getting-started'
          },
          {
            type: 'example',
            url: '/examples/similar-tasks'
          }
        ]
      },
      
      successCriteria: [
        '기능이 정상 작동함',
        '테스트가 통과함',
        '코드 리뷰 통과',
        '문서화 완료'
      ],
      
      estimatedTime: '2-3 days',
      buddy: member.buddy
    };
  }
}
```

### 진행 상황 추적

```typescript
// 온보딩 진행 상황 추적
class OnboardingProgressTracker {
  async trackProgress(
    member: TeamMember,
    day: number
  ): Promise<ProgressReport> {
    const checkpoints = [
      // Day 1
      {
        day: 1,
        milestones: [
          { task: '개발 환경 설정', required: true },
          { task: '프로젝트 클론', required: true },
          { task: '첫 빌드 성공', required: true },
          { task: '팀 미팅 참석', required: false }
        ]
      },
      
      // Day 3
      {
        day: 3,
        milestones: [
          { task: '첫 커밋', required: true },
          { task: '코드 리뷰 참여', required: true },
          { task: '문서 읽기', required: true },
          { task: '스타터 태스크 진행', required: true }
        ]
      },
      
      // Week 1
      {
        day: 7,
        milestones: [
          { task: '첫 PR 머지', required: true },
          { task: '팀 프로세스 이해', required: true },
          { task: '기본 워크플로우 숙달', required: true },
          { task: '두 번째 태스크 시작', required: false }
        ]
      },
      
      // Week 2
      {
        day: 14,
        milestones: [
          { task: '독립적 태스크 수행', required: true },
          { task: '프로덕션 코드 기여', required: true },
          { task: '코드 리뷰 수행', required: false },
          { task: '팀 문화 적응', required: true }
        ]
      }
    ];
    
    const currentCheckpoint = checkpoints.find(cp => cp.day === day);
    const completed = await this.getCompletedTasks(member);
    
    return {
      member,
      day,
      
      progress: {
        completed: completed.length,
        total: currentCheckpoint?.milestones.length || 0,
        percentage: this.calculateProgress(completed, currentCheckpoint)
      },
      
      status: {
        onTrack: this.isOnTrack(completed, currentCheckpoint),
        blockers: await this.identifyBlockers(member),
        achievements: this.identifyAchievements(completed)
      },
      
      feedback: {
        fromBuddy: await this.getBuddyFeedback(member),
        fromManager: await this.getManagerFeedback(member),
        selfAssessment: await this.getSelfAssessment(member)
      },
      
      nextSteps: this.generateNextSteps(member, completed)
    };
  }
}
```

## 문화 적응

### 팀 문화 가이드

```typescript
// 팀 문화 문서
class TeamCultureGuide {
  generateCultureDocument(): CultureDocument {
    return {
      values: [
        {
          value: '투명한 소통',
          description: '모든 정보는 공개적으로 공유',
          examples: [
            '진행 상황 매일 업데이트',
            '의사결정 과정 문서화',
            '실패 공유와 학습'
          ]
        },
        {
          value: '지속적 개선',
          description: '항상 더 나은 방법 찾기',
          examples: [
            '주간 회고 미팅',
            '코드 리팩토링',
            '프로세스 개선 제안'
          ]
        },
        {
          value: '상호 존중',
          description: '모든 의견을 존중하고 경청',
          examples: [
            '코드 리뷰 에티켓',
            '건설적인 피드백',
            '다양성 존중'
          ]
        }
      ],
      
      practices: [
        {
          practice: 'Daily Standup',
          when: '매일 오전 10:00',
          how: '각자 3분 이내 공유',
          why: '일일 동기화 및 블로커 해결'
        },
        {
          practice: 'Code Review',
          when: 'PR 생성 즉시',
          how: '24시간 이내 피드백',
          why: '코드 품질 향상 및 지식 공유'
        },
        {
          practice: 'Pair Programming',
          when: '복잡한 작업 시',
          how: '두 명이 함께 코딩',
          why: '지식 전달 및 품질 향상'
        }
      ],
      
      communication: {
        channels: [
          {
            tool: 'Slack',
            usage: '비동기 커뮤니케이션',
            etiquette: [
              '스레드 사용하기',
              '멘션 최소화',
              '중요 정보는 고정'
            ]
          },
          {
            tool: 'Zoom',
            usage: '회의 및 페어 프로그래밍',
            etiquette: [
              '카메라 켜기 권장',
              '배경 소음 최소화',
              '회의 녹화는 사전 동의'
            ]
          }
        ],
        
        responseTime: {
          urgent: '1시간 이내',
          normal: '24시간 이내',
          lowPriority: '48시간 이내'
        }
      },
      
      workLifeBalance: [
        '유연 근무 시간',
        '원격 근무 가능',
        '개인 학습 시간 지원',
        '건강 및 운동 지원'
      ]
    };
  }
}
```

## SuperClaude 온보딩 명령어

```bash
# 새 팀원 온보딩 시작
/onboard new-member --name "John Doe" --role developer

# 자동 환경 설정
/setup dev-env --complete --test

# 프로젝트 컨텍스트 생성
/generate project-context --comprehensive --ai-friendly

# 버디 할당
/assign buddy --best-match --generate-guide

# 학습 경로 생성
/create learning-path --role developer --current-skills assess

# 스타터 태스크 추천
/recommend starter-task --difficulty easy --learning-optimized

# 진행 상황 추적
/track onboarding-progress --member @john --report

# 지식 공유 세션 스케줄
/schedule knowledge-sessions --week 1 --mandatory

# 팀 문화 가이드
/generate culture-guide --format markdown --examples

# 온보딩 체크리스트 확인
/check onboarding-checklist --day 1 --validate
```

이 온보딩 시스템을 통해 새로운 팀원이 빠르게 적응하고 생산적인 기여를 할 수 있도록 도움을 줄 수 있습니다.
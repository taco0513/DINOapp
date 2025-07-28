# AI 디자인 패턴

## 개요

AI가 이해하고 생성하기 쉬운 디자인 패턴을 정의합니다. Claude Code가 일관된 UI를 자동 생성할 수 있도록 예측 가능한 패턴과 명명 규칙을 제공합니다.

## AI 친화적 패턴 원칙

### 예측 가능한 구조

```typescript
// AI가 이해하기 쉬운 컴포넌트 구조 패턴
interface PredictableComponentStructure {
  // 1. 명확한 네이밍
  componentName: string; // PascalCase로 명명
  
  // 2. 표준화된 Props
  props: {
    variant?: string;      // 시각적 변형
    size?: string;         // 크기 변형  
    state?: string;        // 상태 (disabled, loading, active)
    children?: ReactNode;  // 컨텐츠
    className?: string;    // 추가 스타일링
  };
  
  // 3. 일관된 CSS 클래스 구조
  cssPattern: {
    base: string;          // 기본 클래스
    variant: string;       // 변형별 클래스
    size: string;          // 크기별 클래스
    state: string;         // 상태별 클래스
  };
  
  // 4. 표준화된 이벤트 핸들러
  events: {
    onClick?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
  };
}
```

### 컨텍스트 기반 패턴 인식

```typescript
// AI가 컨텍스트를 통해 적절한 패턴을 선택하는 시스템
class AIPatternMatcher {
  recognizePattern(context: UIContext): DesignPattern {
    const patterns = {
      // 폼 관련 패턴
      form: {
        triggers: ['input', 'form', 'submit', 'validation'],
        components: ['Input', 'Button', 'FormGroup', 'ErrorMessage'],
        layout: 'vertical-stack',
        spacing: 'form-spacing'
      },
      
      // 카드 그리드 패턴
      cardGrid: {
        triggers: ['grid', 'cards', 'list', 'gallery'],
        components: ['Card', 'Grid', 'Container'],
        layout: 'responsive-grid',
        spacing: 'grid-gap'
      },
      
      // 네비게이션 패턴
      navigation: {
        triggers: ['nav', 'menu', 'header', 'sidebar'],
        components: ['NavItem', 'Logo', 'Menu', 'Toggle'],
        layout: 'horizontal-flex',
        spacing: 'nav-spacing'
      },
      
      // 대시보드 패턴
      dashboard: {
        triggers: ['dashboard', 'metrics', 'stats', 'charts'],
        components: ['MetricCard', 'Chart', 'Table', 'Header'],
        layout: 'dashboard-grid',
        spacing: 'dashboard-gap'
      }
    };
    
    return this.matchBestPattern(context, patterns);
  }
  
  private matchBestPattern(context: UIContext, patterns: PatternMap): DesignPattern {
    const scores = Object.entries(patterns).map(([name, pattern]) => ({
      name,
      pattern,
      score: this.calculatePatternScore(context, pattern)
    }));
    
    return scores.sort((a, b) => b.score - a.score)[0].pattern;
  }
}
```

## 상황별 디자인 패턴

### 폼 패턴

```typescript
// 폼 디자인 패턴 - AI가 자동으로 생성할 수 있는 구조
const FormPatterns = {
  // 기본 폼 패턴
  basicForm: {
    structure: `
      <Form>
        <FormGroup>
          <Label />
          <Input />
          <ErrorMessage />
        </FormGroup>
        <FormActions>
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Submit</Button>
        </FormActions>
      </Form>
    `,
    
    cssClasses: {
      form: 'space-y-6',
      formGroup: 'space-y-2',
      label: 'block text-sm font-medium text-gray-700',
      input: 'mt-1 block w-full rounded-md border-gray-300',
      error: 'mt-1 text-sm text-red-600',
      actions: 'flex justify-end space-x-3 pt-6'
    },
    
    aiPromptPattern: `
      Create a form with the following fields: {fieldList}
      Use consistent spacing and validation states
      Include submit and cancel buttons
      Apply form design tokens
    `
  },
  
  // 인라인 폼 패턴 (검색, 뉴스레터 등)
  inlineForm: {
    structure: `
      <Form direction="horizontal">
        <Input placeholder="Enter email" />
        <Button variant="primary">Subscribe</Button>
      </Form>
    `,
    
    cssClasses: {
      form: 'flex space-x-3',
      input: 'flex-1 min-w-0',
      button: 'flex-shrink-0'
    }
  },
  
  // 다단계 폼 패턴
  multiStepForm: {
    structure: `
      <Form>
        <StepIndicator currentStep={2} totalSteps={4} />
        <FormContent>
          <FormStep />
        </FormContent>
        <FormNavigation>
          <Button variant="secondary">Back</Button>
          <Button variant="primary">Next</Button>
        </FormNavigation>
      </Form>
    `,
    
    cssClasses: {
      stepIndicator: 'mb-8',
      formContent: 'min-h-[300px] space-y-6',
      navigation: 'flex justify-between pt-6 border-t'
    }
  }
};
```

### 카드 레이아웃 패턴

```typescript
// 카드 기반 레이아웃 패턴
const CardPatterns = {
  // 제품 카드 그리드
  productGrid: {
    structure: `
      <Grid cols={3} gap="lg" responsive={{sm: 1, md: 2, lg: 3}}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Grid>
    `,
    
    cardStructure: `
      <Card>
        <CardImage src={product.image} alt={product.name} />
        <CardBody>
          <CardTitle>{product.name}</CardTitle>
          <CardPrice>{product.price}</CardPrice>
          <CardDescription>{product.description}</CardDescription>
        </CardBody>
        <CardFooter>
          <Button variant="primary" fullWidth>Add to Cart</Button>
        </CardFooter>
      </Card>
    `,
    
    aiPromptPattern: `
      Create a product grid with {columns} columns
      Each card should include: {cardElements}
      Use responsive breakpoints
      Apply consistent spacing and shadows
    `
  },
  
  // 대시보드 메트릭 카드
  metricsGrid: {
    structure: `
      <Grid cols={4} gap="md" responsive={{sm: 1, md: 2, lg: 4}}>
        {metrics.map(metric => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </Grid>
    `,
    
    cardStructure: `
      <Card variant="elevated">
        <CardBody>
          <Stack direction="row" justify="between" align="center">
            <div>
              <CardTitle size="sm">{metric.label}</CardTitle>
              <CardValue size="xl">{metric.value}</CardValue>
            </div>
            <MetricIcon name={metric.icon} color={metric.trend} />
          </Stack>
          <MetricTrend value={metric.change} />
        </CardBody>
      </Card>
    `
  },
  
  // 블로그/아티클 카드
  articleGrid: {
    structure: `
      <Grid cols={2} gap="xl" responsive={{sm: 1, lg: 2}}>
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </Grid>
    `,
    
    cardStructure: `
      <Card variant="outlined">
        <CardImage src={article.coverImage} aspectRatio="16:9" />
        <CardBody>
          <CardMeta>
            <Badge variant="secondary">{article.category}</Badge>
            <Text size="sm" color="muted">{article.publishedAt}</Text>
          </CardMeta>
          <CardTitle>{article.title}</CardTitle>
          <CardExcerpt>{article.excerpt}</CardExcerpt>
        </CardBody>
        <CardFooter>
          <AuthorInfo author={article.author} />
          <Button variant="ghost" size="sm">Read More</Button>
        </CardFooter>
      </Card>
    `
  }
};
```

### 네비게이션 패턴

```typescript
// 네비게이션 디자인 패턴
const NavigationPatterns = {
  // 상단 네비게이션 바
  topNavBar: {
    structure: `
      <Header>
        <Container>
          <Stack direction="row" justify="between" align="center">
            <Logo />
            <Navigation>
              <NavItem href="/">Home</NavItem>
              <NavItem href="/about">About</NavItem>
              <NavItem href="/contact">Contact</NavItem>
            </Navigation>
            <UserMenu />
          </Stack>
        </Container>
      </Header>
    `,
    
    cssClasses: {
      header: 'bg-white shadow-sm border-b',
      container: 'px-4 sm:px-6 lg:px-8',
      stack: 'h-16',
      navigation: 'hidden md:flex space-x-8',
      navItem: 'text-gray-700 hover:text-gray-900 px-3 py-2'
    },
    
    mobilePattern: `
      <MobileMenu isOpen={isMenuOpen}>
        <Stack direction="column" gap="none">
          <NavItem mobile href="/">Home</NavItem>
          <NavItem mobile href="/about">About</NavItem>
          <NavItem mobile href="/contact">Contact</NavItem>
        </Stack>
      </MobileMenu>
    `
  },
  
  // 사이드바 네비게이션
  sidebarNav: {
    structure: `
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <NavSection title="Main">
            <NavItem icon="home" href="/">Dashboard</NavItem>
            <NavItem icon="users" href="/users">Users</NavItem>
            <NavItem icon="settings" href="/settings">Settings</NavItem>
          </NavSection>
        </SidebarContent>
        <SidebarFooter>
          <UserProfile />
        </SidebarFooter>
      </Sidebar>
    `,
    
    cssClasses: {
      sidebar: 'w-64 h-screen bg-gray-900 text-white flex flex-col',
      header: 'p-4 border-b border-gray-800',
      content: 'flex-1 overflow-y-auto',
      section: 'py-4',
      navItem: 'flex items-center px-4 py-2 hover:bg-gray-800',
      footer: 'p-4 border-t border-gray-800'
    }
  },
  
  // 탭 네비게이션
  tabNavigation: {
    structure: `
      <TabContainer>
        <TabList>
          <Tab active={activeTab === 'tab1'}>Tab 1</Tab>
          <Tab active={activeTab === 'tab2'}>Tab 2</Tab>
          <Tab active={activeTab === 'tab3'}>Tab 3</Tab>
        </TabList>
        <TabContent>
          <TabPanel show={activeTab === 'tab1'}>Content 1</TabPanel>
          <TabPanel show={activeTab === 'tab2'}>Content 2</TabPanel>
          <TabPanel show={activeTab === 'tab3'}>Content 3</TabPanel>
        </TabContent>
      </TabContainer>
    `,
    
    cssClasses: {
      tabList: 'flex border-b border-gray-200',
      tab: 'px-4 py-2 font-medium text-sm border-b-2 border-transparent',
      tabActive: 'border-blue-500 text-blue-600',
      tabContent: 'p-4'
    }
  }
};
```

### 대시보드 패턴

```typescript
// 대시보드 레이아웃 패턴
const DashboardPatterns = {
  // 어드민 대시보드
  adminDashboard: {
    structure: `
      <DashboardLayout>
        <DashboardHeader>
          <PageTitle>Dashboard</PageTitle>
          <DateRangePicker />
        </DashboardHeader>
        
        <MetricsRow>
          <MetricCard title="Total Users" value="12,345" trend="+5.2%" />
          <MetricCard title="Revenue" value="$45,678" trend="+12.3%" />
          <MetricCard title="Orders" value="1,234" trend="-2.1%" />
          <MetricCard title="Conversion" value="3.4%" trend="+0.8%" />
        </MetricsRow>
        
        <ChartsRow>
          <ChartCard title="Revenue Over Time" type="line" />
          <ChartCard title="Top Products" type="bar" />
        </ChartsRow>
        
        <TablesRow>
          <TableCard title="Recent Orders" />
        </TablesRow>
      </DashboardLayout>
    `,
    
    gridLayout: `
      .dashboard-grid {
        display: grid;
        grid-template-areas:
          "header header header header"
          "metrics metrics metrics metrics"
          "chart1 chart1 chart2 chart2"
          "table table table table";
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
      }
    `,
    
    aiPromptPattern: `
      Create an admin dashboard with:
      - 4 metric cards showing {metricNames}
      - 2 charts for {chartTypes}
      - 1 data table for {tableData}
      - Responsive grid layout
      - Consistent card styling
    `
  },
  
  // 애널리틱스 대시보드
  analyticsDashboard: {
    structure: `
      <DashboardLayout variant="analytics">
        <DashboardSidebar>
          <FilterPanel />
          <DateRangePicker />
          <MetricSelector />
        </DashboardSidebar>
        
        <DashboardMain>
          <KPIRow>
            <KPICard primary title="Sessions" value="23,456" />
            <KPICard title="Page Views" value="89,123" />
            <KPICard title="Bounce Rate" value="34.2%" />
            <KPICard title="Avg. Duration" value="2:34" />
          </KPIRow>
          
          <ChartSection>
            <TimeSeriesChart title="Traffic Over Time" />
          </ChartSection>
          
          <InsightsGrid>
            <TopPagesCard />
            <TrafficSourcesCard />
            <UserFlowCard />
            <ConversionsCard />
          </InsightsGrid>
        </DashboardMain>
      </DashboardLayout>
    `
  }
};
```

## 상태 관리 패턴

### 로딩 상태 패턴

```typescript
// 로딩 상태를 일관되게 처리하는 패턴
const LoadingPatterns = {
  // 스켈레톤 로딩
  skeletonLoading: {
    pattern: `
      {loading ? (
        <SkeletonLoader>
          <SkeletonText lines={3} />
          <SkeletonImage height="200px" />
          <SkeletonButton />
        </SkeletonLoader>
      ) : (
        <ActualContent />
      )}
    `,
    
    implementation: `
      const SkeletonLoader = ({ children }) => (
        <div className="animate-pulse space-y-4">
          {children}
        </div>
      );
      
      const SkeletonText = ({ lines = 1 }) => (
        <div className="space-y-2">
          {Array(lines).fill(0).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-3/4" />
          ))}
        </div>
      );
    `
  },
  
  // 인라인 로딩 (버튼, 폼 등)
  inlineLoading: {
    pattern: `
      <Button loading={isSubmitting} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    `,
    
    implementation: `
      const Button = ({ loading, children, ...props }) => (
        <button {...props}>
          {loading && <Spinner size="sm" className="mr-2" />}
          {children}
        </button>
      );
    `
  },
  
  // 페이지 레벨 로딩
  pageLoading: {
    pattern: `
      {loading ? (
        <PageLoader>
          <Spinner size="lg" />
          <Text>Loading...</Text>
        </PageLoader>
      ) : (
        <PageContent />
      )}
    `,
    
    implementation: `
      const PageLoader = ({ children }) => (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            {children}
          </div>
        </div>
      );
    `
  }
};
```

### 에러 상태 패턴

```typescript
// 에러 처리를 위한 일관된 패턴
const ErrorPatterns = {
  // 인라인 에러 (폼 필드)
  inlineError: {
    pattern: `
      <FormField>
        <Input error={fieldError} />
        {fieldError && (
          <ErrorMessage>{fieldError}</ErrorMessage>
        )}
      </FormField>
    `,
    
    implementation: `
      const ErrorMessage = ({ children }) => (
        <div className="mt-1 flex items-center text-sm text-red-600">
          <Icon name="exclamation-circle" size="sm" className="mr-1" />
          {children}
        </div>
      );
    `
  },
  
  // 페이지 레벨 에러
  pageError: {
    pattern: `
      <ErrorBoundary>
        <ErrorState
          title="Something went wrong"
          description="We're sorry, but something unexpected happened."
          action={
            <Button onClick={handleRetry}>Try Again</Button>
          }
        />
      </ErrorBoundary>
    `,
    
    implementation: `
      const ErrorState = ({ title, description, action, illustration }) => (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md space-y-6">
            {illustration && <div className="mx-auto">{illustration}</div>}
            <div>
              <Text variant="heading-lg" color="primary">{title}</Text>
              <Text color="secondary" className="mt-2">{description}</Text>
            </div>
            {action && <div>{action}</div>}
          </div>
        </div>
      );
    `
  },
  
  // 네트워크 에러
  networkError: {
    pattern: `
      <ErrorBanner
        type="network"
        message="Network connection lost. Some features may not work properly."
        action={<Button size="sm" onClick={handleRetry}>Retry</Button>}
        dismissible
      />
    `
  }
};
```

### 빈 상태 패턴

```typescript
// 데이터가 없을 때의 상태 패턴
const EmptyStatePatterns = {
  // 데이터 없음
  noData: {
    pattern: `
      <EmptyState
        illustration={<EmptyIllustration name="no-data" />}
        title="No data available"
        description="Get started by adding your first item."
        action={
          <Button variant="primary" onClick={handleCreate}>
            Add Item
          </Button>
        }
      />
    `
  },
  
  // 검색 결과 없음
  noSearchResults: {
    pattern: `
      <EmptyState
        illustration={<EmptyIllustration name="search" />}
        title="No results found"
        description={`No results for "${searchQuery}". Try different keywords.`}
        action={
          <Button variant="ghost" onClick={handleClearSearch}>
            Clear Search
          </Button>
        }
      />
    `
  },
  
  // 권한 없음
  noPermission: {
    pattern: `
      <EmptyState
        illustration={<EmptyIllustration name="locked" />}
        title="Access Denied"
        description="You don't have permission to view this content."
        action={
          <Button variant="secondary" onClick={handleContactAdmin}>
            Contact Administrator
          </Button>
        }
      />
    `
  }
};
```

## Claude 명령어 최적화

### 패턴 기반 생성 명령어

```bash
# 폼 패턴 생성
/create form-pattern --type "contact" --fields "name,email,message" --validation --submit-action

# 카드 그리드 생성
/create card-grid --pattern "product" --columns 3 --responsive --items "image,title,price,button"

# 대시보드 생성
/create dashboard --pattern "admin" --metrics 4 --charts 2 --tables 1 --responsive

# 네비게이션 생성
/create navigation --pattern "top-nav" --items "home,about,services,contact" --mobile-menu --logo

# 로딩 상태 추가
/add loading-states --pattern "skeleton" --components "Card,Table,Form"

# 에러 처리 추가
/add error-handling --pattern "inline+page" --components "Form,DataTable"

# 빈 상태 추가
/add empty-states --pattern "no-data" --components "Table,Grid,List" --with-actions
```

### 패턴 조합 명령어

```bash
# 복합 패턴 생성
/create page-pattern --layout "dashboard" --navigation "sidebar" --content "metrics+charts" --states "loading,error,empty"

# 반응형 패턴 적용
/apply responsive-pattern --breakpoints "mobile,tablet,desktop" --components @components/

# 접근성 패턴 적용
/apply accessibility-pattern --wcag-level "AA" --components @components/ --auto-fix

# 다크모드 패턴 적용
/apply dark-mode-pattern --components @components/ --preserve-contrast --smooth-transition
```

### 패턴 검증 및 최적화

```bash
# 패턴 일관성 검증
/validate patterns --consistency --naming-conventions --components @components/

# 패턴 사용량 분석
/analyze pattern-usage --frequency --recommendations --unused-patterns

# 패턴 최적화 제안
/optimize patterns --bundle-size --performance --maintainability

# 패턴 문서 생성
/generate pattern-docs --storybook --examples --usage-guidelines
```

이러한 AI 디자인 패턴을 통해 Claude가 일관되고 예측 가능한 UI를 자동으로 생성할 수 있습니다.
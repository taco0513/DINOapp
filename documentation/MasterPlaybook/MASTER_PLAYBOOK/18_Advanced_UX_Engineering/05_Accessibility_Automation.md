# ♿ Accessibility Automation - 모두를 위한 자동 접근성 최적화

## 📋 개요

AI가 웹 접근성을 자동으로 분석하고 개선하여, 장애가 있는 사용자도 동등하게 서비스를 이용할 수 있도록 합니다. WCAG 2.1 AA 기준을 자동으로 충족하며, 더 나아가 AAA 수준을 목표로 합니다.

## 🎯 핵심 목표

1. **WCAG Compliance**: WCAG 2.1 AA/AAA 자동 준수
2. **Auto Detection**: 접근성 문제 자동 감지
3. **Smart Fixes**: AI 기반 자동 수정
4. **Real Testing**: 실제 스크린리더 테스트
5. **Inclusive Design**: 포용적 디자인 구현

## 🏗️ 접근성 자동화 아키텍처

```typescript
interface AccessibilityAutomationSystem {
  // 분석 엔진
  analysis: {
    scanner: AccessibilityScanner;
    validator: WCAGValidator;
    auditor: A11yAuditor;
    reporter: ComplianceReporter;
  };

  // 자동 수정
  automation: {
    fixer: AutoFixer;
    enhancer: A11yEnhancer;
    generator: ARIAGenerator;
    optimizer: FocusOptimizer;
  };

  // 테스트 시스템
  testing: {
    screenReader: ScreenReaderTest;
    keyboard: KeyboardTest;
    contrast: ContrastTest;
    motion: MotionTest;
  };
}
```

## 🔍 자동 접근성 스캐닝

### 1. 실시간 접근성 분석

```typescript
class AccessibilityScanner {
  private issues: AccessibilityIssue[] = [];

  async scanComponent(component: HTMLElement): Promise<ScanResult> {
    const checks = [
      this.checkSemanticStructure(component),
      this.checkColorContrast(component),
      this.checkKeyboardAccess(component),
      this.checkARIALabels(component),
      this.checkFocusManagement(component),
      this.checkAnimationSafety(component),
    ];

    const results = await Promise.all(checks);

    return {
      issues: results.flat(),
      score: this.calculateA11yScore(results),
      wcagLevel: this.determineWCAGLevel(results),
    };
  }

  // 시맨틱 구조 검사
  private async checkSemanticStructure(element: HTMLElement): Promise<Issue[]> {
    const issues: Issue[] = [];

    // 헤딩 계층 구조
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);

      if (level - previousLevel > 1) {
        issues.push({
          type: 'heading-skip',
          element: heading,
          message: `Heading level skipped from h${previousLevel} to h${level}`,
          severity: 'error',
          wcag: '1.3.1',
        });
      }
      previousLevel = level;
    });

    // 랜드마크 검사
    const main = element.querySelector('main');
    if (!main) {
      issues.push({
        type: 'missing-landmark',
        message: 'Missing <main> landmark',
        severity: 'error',
        wcag: '1.3.1',
      });
    }

    return issues;
  }

  // 색상 대비 검사
  private async checkColorContrast(element: HTMLElement): Promise<Issue[]> {
    const issues: Issue[] = [];
    const textElements = element.querySelectorAll('*');

    for (const el of textElements) {
      if (el.textContent?.trim()) {
        const styles = window.getComputedStyle(el);
        const fgColor = styles.color;
        const bgColor = this.getBackgroundColor(el);

        const contrast = this.calculateContrast(fgColor, bgColor);
        const fontSize = parseFloat(styles.fontSize);
        const isLarge =
          fontSize >= 18 || (fontSize >= 14 && styles.fontWeight === 'bold');

        const requiredContrast = isLarge ? 3 : 4.5;

        if (contrast < requiredContrast) {
          issues.push({
            type: 'low-contrast',
            element: el,
            message: `Contrast ratio ${contrast.toFixed(2)} is below required ${requiredContrast}`,
            severity: 'error',
            wcag: '1.4.3',
            suggestion: this.suggestColors(fgColor, bgColor, requiredContrast),
          });
        }
      }
    }

    return issues;
  }
}
```

### 2. AI 기반 자동 수정

```typescript
class AccessibilityAutoFixer {
  // 이미지 대체 텍스트 생성
  async generateAltText(image: HTMLImageElement): Promise<string> {
    // 1. 이미지 분석
    const analysis = await this.analyzeImage(image.src);

    // 2. 컨텍스트 고려
    const context = this.getImageContext(image);

    // 3. AI 생성
    const altText = await this.ai.generateDescription({
      image: analysis,
      context,
      purpose: context.isDecorative ? 'decorative' : 'informative',
      maxLength: 125,
    });

    // 4. 검증
    if (this.validateAltText(altText)) {
      image.alt = altText;
      return altText;
    }

    return '';
  }

  // ARIA 레이블 자동 생성
  async generateARIALabels(element: HTMLElement): Promise<void> {
    // 버튼 레이블
    const buttons = element.querySelectorAll('button:not([aria-label])');
    for (const button of buttons) {
      if (!button.textContent?.trim()) {
        const purpose = await this.inferButtonPurpose(button);
        button.setAttribute('aria-label', purpose);
      }
    }

    // 폼 레이블
    const inputs = element.querySelectorAll('input:not([aria-label])');
    for (const input of inputs) {
      const label =
        this.findAssociatedLabel(input) ||
        (await this.generateInputLabel(input));
      input.setAttribute('aria-label', label);
    }

    // 복잡한 위젯
    const widgets = element.querySelectorAll('[role]:not([aria-label])');
    for (const widget of widgets) {
      const label = await this.generateWidgetLabel(widget);
      widget.setAttribute('aria-label', label);
    }
  }

  // 키보드 네비게이션 개선
  enhanceKeyboardNavigation(element: HTMLElement): void {
    // 포커스 가능 요소 식별
    const focusables = element.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]'
    );

    // 논리적 탭 순서 설정
    const logicalOrder = this.calculateLogicalTabOrder(focusables);
    logicalOrder.forEach((el, index) => {
      if (el.getAttribute('tabindex') === '-1') return;
      el.setAttribute('tabindex', String(index));
    });

    // 포커스 트랩 방지
    this.preventFocusTraps(element);

    // 스킵 링크 추가
    this.addSkipLinks(element);
  }
}
```

## 🎨 시각 접근성

### 1. 색맹 친화적 디자인

```typescript
class ColorBlindnessSupport {
  // 색맹 시뮬레이션
  simulateColorBlindness(
    type: 'protanopia' | 'deuteranopia' | 'tritanopia'
  ): void {
    const filter = this.getColorBlindnessFilter(type);
    document.documentElement.style.filter = filter;
  }

  // 색상 팔레트 최적화
  optimizeColorPalette(colors: Color[]): OptimizedPalette {
    return {
      primary: this.ensureDistinguishable(colors),
      patterns: this.addPatterns(colors),
      labels: this.addColorLabels(colors),
    };
  }

  // 색상 대체 패턴
  private addPatterns(elements: HTMLElement[]): void {
    elements.forEach((el, index) => {
      const pattern = this.patterns[index % this.patterns.length];
      el.style.backgroundImage = pattern;
      el.style.backgroundSize = '10px 10px';
    });
  }
}
```

### 2. 고대비 모드

```typescript
class HighContrastMode {
  private originalStyles = new Map<Element, CSSStyleDeclaration>();

  enable(): void {
    // 모든 요소의 원본 스타일 저장
    document.querySelectorAll('*').forEach(el => {
      this.originalStyles.set(el, { ...window.getComputedStyle(el) });
    });

    // 고대비 스타일 적용
    const style = document.createElement('style');
    style.id = 'high-contrast-mode';
    style.textContent = `
      * {
        color: #000 !important;
        background-color: #fff !important;
        border-color: #000 !important;
      }
      
      a { color: #00f !important; text-decoration: underline !important; }
      a:visited { color: #551a8b !important; }
      
      button, input[type="submit"] {
        background-color: #000 !important;
        color: #fff !important;
        border: 2px solid #000 !important;
      }
      
      :focus {
        outline: 3px solid #ff0 !important;
        outline-offset: 2px !important;
      }
    `;

    document.head.appendChild(style);
  }
}
```

## 🎯 스크린리더 최적화

### 1. 라이브 리전 관리

```typescript
class LiveRegionManager {
  private liveRegions = new Map<string, HTMLElement>();

  // 동적 콘텐츠 알림
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const region = this.getOrCreateLiveRegion(priority);

    // 스크린리더가 인식할 수 있도록 잠시 비우기
    region.textContent = '';

    setTimeout(() => {
      region.textContent = message;
    }, 100);

    // 일정 시간 후 제거
    setTimeout(() => {
      region.textContent = '';
    }, 5000);
  }

  // 상태 변경 알림
  announceStateChange(
    element: HTMLElement,
    state: string,
    value: string
  ): void {
    const message = `${this.getElementLabel(element)} ${state} ${value}`;
    this.announce(message);
  }

  private getOrCreateLiveRegion(priority: 'polite' | 'assertive'): HTMLElement {
    const key = `live-region-${priority}`;

    if (!this.liveRegions.has(key)) {
      const region = document.createElement('div');
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', priority);
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only'; // 시각적으로 숨김

      document.body.appendChild(region);
      this.liveRegions.set(key, region);
    }

    return this.liveRegions.get(key)!;
  }
}
```

### 2. 복잡한 위젯 접근성

```typescript
class ComplexWidgetA11y {
  // 데이터 테이블 접근성
  enhanceDataTable(table: HTMLTableElement): void {
    // 캡션 추가
    if (!table.caption) {
      const caption = document.createElement('caption');
      caption.textContent = this.generateTableCaption(table);
      table.prepend(caption);
    }

    // 헤더 연결
    const headers = table.querySelectorAll('th');
    headers.forEach((th, index) => {
      if (!th.id) {
        th.id = `th-${index}`;
      }
    });

    // 데이터 셀에 헤더 연결
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('td');
      cells.forEach((td, colIndex) => {
        const headerId = `th-${colIndex}`;
        td.setAttribute('headers', headerId);
      });
    });

    // 정렬 가능 컬럼 표시
    this.addSortableIndicators(table);
  }

  // 모달 접근성
  enhanceModal(modal: HTMLElement): void {
    // ARIA 속성
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    // 제목 연결
    const heading = modal.querySelector('h1, h2, h3');
    if (heading) {
      heading.id = heading.id || 'modal-title';
      modal.setAttribute('aria-labelledby', heading.id);
    }

    // 포커스 관리
    this.manageFocus(modal);

    // ESC 키 닫기
    this.addEscapeHandler(modal);
  }
}
```

## 🔧 접근성 테스트 자동화

### 1. 자동화된 테스트 스위트

```typescript
class A11yTestSuite {
  async runFullTest(): Promise<TestReport> {
    const tests = [
      this.axeTest(),
      this.paletteTest(),
      this.keyboardTest(),
      this.screenReaderTest(),
      this.performanceTest(),
    ];

    const results = await Promise.all(tests);

    return {
      passed: results.every(r => r.passed),
      wcagLevel: this.determineOverallLevel(results),
      details: results,
      recommendations: this.generateRecommendations(results),
    };
  }

  // Axe-core 통합
  private async axeTest(): Promise<TestResult> {
    const results = await axe.run();

    return {
      name: 'Axe Accessibility Test',
      passed: results.violations.length === 0,
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
    };
  }

  // 키보드 네비게이션 테스트
  private async keyboardTest(): Promise<TestResult> {
    const focusables = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]'
    );

    let allReachable = true;
    const unreachable: Element[] = [];

    // 시뮬레이션
    for (const element of focusables) {
      const reachable = await this.simulateTabNavigation(element);
      if (!reachable) {
        allReachable = false;
        unreachable.push(element);
      }
    }

    return {
      name: 'Keyboard Navigation Test',
      passed: allReachable,
      unreachable,
    };
  }
}
```

### 2. 실시간 접근성 모니터링

```typescript
class A11yMonitor {
  private observer: MutationObserver;

  startMonitoring(): void {
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
              this.checkNewElement(node);
            }
          });
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-*', 'role', 'tabindex'],
    });
  }

  private async checkNewElement(element: HTMLElement): Promise<void> {
    const issues = await this.scanner.scanComponent(element);

    if (issues.length > 0) {
      // 개발 모드에서 경고
      if (process.env.NODE_ENV === 'development') {
        console.warn('Accessibility issues detected:', issues);
        this.highlightIssues(element, issues);
      }

      // 자동 수정 시도
      const fixed = await this.autoFixer.fix(element, issues);

      // 리포트
      this.reporter.log({
        element,
        issues,
        fixed,
        timestamp: Date.now(),
      });
    }
  }
}
```

## 📊 접근성 대시보드

```typescript
interface AccessibilityDashboard {
  // 현재 상태
  currentStatus: {
    wcagLevel: 'A' | 'AA' | 'AAA';
    score: number;
    criticalIssues: number;
    warnings: number;
  };

  // 개선 추이
  trends: {
    daily: TrendData[];
    weekly: TrendData[];
    monthly: TrendData[];
  };

  // 사용자 피드백
  userFeedback: {
    screenReaderUsers: FeedbackData;
    keyboardUsers: FeedbackData;
    lowVisionUsers: FeedbackData;
  };
}
```

## 🎯 Best Practices

### 1. 포용적 디자인 원칙

```typescript
const INCLUSIVE_DESIGN_PRINCIPLES = {
  // 다양한 사용 방법 제공
  multipleWays: {
    input: ['mouse', 'keyboard', 'touch', 'voice'],
    output: ['visual', 'audio', 'haptic'],
  },

  // 명확한 피드백
  feedback: {
    visual: true,
    audio: true,
    haptic: true,
  },

  // 실수 방지 및 복구
  errorPrevention: {
    confirmation: true,
    undo: true,
    clear: true,
  },
};
```

### 2. 성공 지표

```typescript
const A11Y_SUCCESS_METRICS = {
  // 기술적 지표
  technical: {
    wcagCompliance: 'AA',
    automatedTestPass: 100,
    manualTestPass: 95,
  },

  // 사용자 지표
  user: {
    taskCompletion: 95,
    errorRate: 5,
    satisfaction: 4.5,
  },

  // 비즈니스 영향
  business: {
    userbaseIncrease: 20,
    legalCompliance: 100,
    brandReputation: 'positive',
  },
};
```

---

_Accessibility Automation: 모든 사람이 동등하게 사용할 수 있는 웹_

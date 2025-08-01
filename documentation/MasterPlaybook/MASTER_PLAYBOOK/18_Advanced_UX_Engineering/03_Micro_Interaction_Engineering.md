# ✨ Micro Interaction Engineering - 디테일이 만드는 완벽한 경험

## 📋 개요

작은 인터랙션이 큰 차이를 만듭니다. 클릭, 호버, 스크롤 등 모든 마이크로 인터랙션을 정교하게 엔지니어링하여 사용자에게 즐거운 경험을 제공합니다. AI가 사용자 행동을 분석하여 최적의 인터랙션을 자동으로 디자인합니다.

## 🎯 핵심 목표

1. **Delightful Details**: 사용자를 즐겁게 하는 세심한 디테일
2. **Responsive Feedback**: 즉각적이고 직관적인 피드백
3. **Natural Motion**: 자연스러운 움직임과 전환
4. **Accessible Interactions**: 모든 사용자를 위한 접근성
5. **Performance First**: 성능을 해치지 않는 애니메이션

## 🏗️ 마이크로 인터랙션 아키텍처

```typescript
interface MicroInteractionSystem {
  // 인터랙션 유형
  interactions: {
    clicks: ClickInteraction[];
    hovers: HoverInteraction[];
    scrolls: ScrollInteraction[];
    gestures: GestureInteraction[];
    keyboards: KeyboardInteraction[];
  };

  // 피드백 시스템
  feedback: {
    visual: VisualFeedback;
    audio: AudioFeedback;
    haptic: HapticFeedback;
    semantic: SemanticFeedback;
  };

  // 애니메이션 엔진
  animation: {
    timing: TimingEngine;
    easing: EasingLibrary;
    orchestration: AnimationOrchestrator;
    performance: PerformanceOptimizer;
  };
}
```

## 🎨 인터랙션 패턴 라이브러리

### 1. 버튼 인터랙션

```typescript
class ButtonInteractions {
  // 클릭 리플 효과
  createRippleEffect(): InteractionConfig {
    return {
      trigger: 'mousedown',
      animation: {
        keyframes: [
          { transform: 'scale(0)', opacity: 0.4 },
          { transform: 'scale(4)', opacity: 0 },
        ],
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      accessibility: {
        ariaLive: 'polite',
        announcement: 'Button pressed',
      },
    };
  }

  // 호버 상태 전환
  createHoverTransition(): InteractionConfig {
    return {
      trigger: 'mouseenter',
      animation: {
        properties: [
          { property: 'transform', from: 'scale(1)', to: 'scale(1.05)' },
          {
            property: 'box-shadow',
            from: '0 2px 4px rgba(0,0,0,0.1)',
            to: '0 8px 16px rgba(0,0,0,0.15)',
          },
        ],
        duration: 200,
        easing: 'ease-out',
      },
      reduceMotion: {
        animation: {
          properties: [{ property: 'opacity', from: '0.8', to: '1' }],
          duration: 150,
        },
      },
    };
  }

  // 로딩 상태
  createLoadingState(): InteractionConfig {
    return {
      trigger: 'loading-start',
      animation: {
        keyframes: [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(360deg)' },
        ],
        duration: 1000,
        iterations: Infinity,
        easing: 'linear',
      },
      semantic: {
        ariaLive: 'assertive',
        ariaBusy: true,
        announcement: 'Loading, please wait',
      },
    };
  }
}
```

### 2. 폼 인터랙션

```typescript
class FormInteractions {
  // 입력 필드 포커스
  createFocusInteraction(): InteractionConfig {
    return {
      trigger: 'focus',
      animation: {
        properties: [
          { property: 'border-color', from: '#ddd', to: '#0066cc' },
          {
            property: 'box-shadow',
            from: 'none',
            to: '0 0 0 3px rgba(0,102,204,0.1)',
          },
        ],
        duration: 150,
        easing: 'ease-out',
      },
      feedback: {
        visual: {
          label: {
            transform: 'translateY(-20px) scale(0.8)',
            color: '#0066cc',
          },
        },
      },
    };
  }

  // 유효성 검사 피드백
  createValidationFeedback(isValid: boolean): InteractionConfig {
    return {
      trigger: 'validation',
      animation: {
        properties: [
          {
            property: 'border-color',
            to: isValid ? '#28a745' : '#dc3545',
          },
        ],
        duration: 200,
      },
      feedback: {
        visual: {
          icon: isValid ? '✓' : '✗',
          color: isValid ? '#28a745' : '#dc3545',
        },
        semantic: {
          ariaLive: 'polite',
          announcement: isValid ? 'Input valid' : 'Input invalid',
        },
      },
    };
  }

  // 자동완성 제안
  createAutocompleteSuggestion(): InteractionConfig {
    return {
      trigger: 'input',
      animation: {
        stagger: 50,
        properties: [
          { property: 'opacity', from: 0, to: 1 },
          {
            property: 'transform',
            from: 'translateY(-10px)',
            to: 'translateY(0)',
          },
        ],
        duration: 200,
        easing: 'ease-out',
      },
    };
  }
}
```

### 3. 스크롤 인터랙션

```typescript
class ScrollInteractions {
  // 패럴랙스 효과
  createParallaxEffect(): ScrollInteractionConfig {
    return {
      trigger: 'scroll',
      elements: [
        { selector: '.hero-bg', speed: 0.5 },
        { selector: '.hero-content', speed: 0.8 },
        { selector: '.hero-foreground', speed: 1.2 },
      ],
      performance: {
        throttle: 16, // 60fps
        useTransform: true,
        willChange: 'transform',
      },
    };
  }

  // 스크롤 트리거 애니메이션
  createScrollTrigger(): ScrollInteractionConfig {
    return {
      trigger: 'intersection',
      threshold: 0.3,
      animation: {
        from: { opacity: 0, transform: 'translateY(50px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
        duration: 600,
        easing: 'ease-out',
        stagger: 100,
      },
      once: true, // 한 번만 실행
    };
  }

  // 스크롤 진행 표시
  createScrollProgress(): ScrollInteractionConfig {
    return {
      trigger: 'scroll',
      indicator: {
        type: 'linear',
        position: 'top',
        height: '4px',
        color: 'var(--primary-color)',
        smooth: true,
      },
    };
  }
}
```

### 4. 제스처 인터랙션

```typescript
class GestureInteractions {
  // 스와이프 제스처
  createSwipeGesture(): GestureConfig {
    return {
      type: 'swipe',
      threshold: 50, // 최소 이동 거리
      velocity: 0.3, // 최소 속도
      handlers: {
        onSwipeLeft: () => this.navigateNext(),
        onSwipeRight: () => this.navigatePrevious(),
        onSwipeUp: () => this.showDetails(),
        onSwipeDown: () => this.hideDetails(),
      },
      feedback: {
        haptic: { pattern: 'light' },
        visual: { indicator: 'slide' },
      },
    };
  }

  // 핀치 줌
  createPinchZoom(): GestureConfig {
    return {
      type: 'pinch',
      minScale: 1,
      maxScale: 3,
      animation: {
        duration: 0, // 실시간
        easing: 'linear',
      },
      boundaries: {
        bounce: true,
        bounceDamping: 0.8,
      },
    };
  }

  // 길게 누르기
  createLongPress(): GestureConfig {
    return {
      type: 'longpress',
      duration: 500,
      feedback: {
        haptic: {
          start: { pattern: 'light' },
          success: { pattern: 'medium' },
        },
        visual: {
          scale: 0.95,
          overlay: 'context-menu',
        },
      },
    };
  }
}
```

## 🎭 고급 애니메이션 기법

### 1. 스프링 물리학

```typescript
class SpringAnimation {
  private stiffness = 100;
  private damping = 10;
  private mass = 1;

  animate(from: number, to: number, onUpdate: (value: number) => void): void {
    let velocity = 0;
    let current = from;

    const step = () => {
      const force = -this.stiffness * (current - to);
      const damping = -this.damping * velocity;
      const acceleration = (force + damping) / this.mass;

      velocity += acceleration * 0.016; // 60fps
      current += velocity * 0.016;

      onUpdate(current);

      if (Math.abs(to - current) > 0.01 || Math.abs(velocity) > 0.01) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }
}
```

### 2. 모프 애니메이션

```typescript
class MorphAnimation {
  morphPath(fromPath: string, toPath: string, progress: number): string {
    const from = this.parsePath(fromPath);
    const to = this.parsePath(toPath);

    return from
      .map((point, i) => {
        const targetPoint = to[i] || point;
        return {
          x: this.interpolate(point.x, targetPoint.x, progress),
          y: this.interpolate(point.y, targetPoint.y, progress),
        };
      })
      .map(p => `${p.x},${p.y}`)
      .join(' ');
  }

  private interpolate(from: number, to: number, progress: number): number {
    return from + (to - from) * this.easeInOutCubic(progress);
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
```

## 📊 성능 최적화

### 1. GPU 가속

```typescript
class PerformanceOptimizer {
  // transform과 opacity만 사용하여 GPU 가속
  optimizeAnimation(element: HTMLElement, animation: Animation): void {
    // will-change 힌트
    element.style.willChange = 'transform, opacity';

    // 3D 변환으로 레이어 생성
    element.style.transform = 'translateZ(0)';

    // 애니메이션 완료 후 정리
    animation.finished.then(() => {
      element.style.willChange = 'auto';
    });
  }

  // 애니메이션 일괄 처리
  batchAnimations(animations: Animation[]): void {
    requestAnimationFrame(() => {
      animations.forEach(anim => anim.play());
    });
  }
}
```

### 2. 조건부 애니메이션

```typescript
// prefers-reduced-motion 존중
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
);

if (!prefersReducedMotion.matches) {
  // 전체 애니메이션
  element.animate(fullAnimation, { duration: 300 });
} else {
  // 간소화된 애니메이션
  element.animate(reducedAnimation, { duration: 150 });
}
```

## 🎯 Best Practices

### 1. 타이밍과 이징

```typescript
const timingPresets = {
  // 빠른 응답
  instant: { duration: 100, easing: 'ease-out' },

  // 일반 전환
  normal: { duration: 200, easing: 'ease-in-out' },

  // 부드러운 전환
  smooth: { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },

  // 강조 효과
  emphasis: { duration: 400, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
};
```

### 2. 피드백 계층

```typescript
interface FeedbackHierarchy {
  immediate: VisualFeedback; // 0-100ms
  primary: AnimatedFeedback; // 100-300ms
  secondary: DelayedFeedback; // 300-1000ms
  ambient: BackgroundFeedback; // continuous
}
```

### 3. 접근성 우선

```typescript
// 모든 인터랙션에 키보드 지원
const keyboardSupport = {
  Enter: 'click',
  Space: 'click',
  Escape: 'close',
  Tab: 'navigate',
  ArrowKeys: 'directionalNavigation',
};

// 스크린 리더 안내
const announcements = {
  loading: 'Loading content',
  loaded: 'Content loaded',
  error: 'An error occurred',
  success: 'Action completed successfully',
};
```

---

_Micro Interaction Engineering: 작은 디테일이 만드는 큰 차이_

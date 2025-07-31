import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  memoryUsage?: number;
  connectionType?: string;
}

interface PerformanceMonitorOptions {
  enableLogging?: boolean;
  reportToAnalytics?: boolean;
  thresholds?: {
    lcp?: number; // Largest Contentful Paint threshold (ms)
    fid?: number; // First Input Delay threshold (ms)
    cls?: number; // Cumulative Layout Shift threshold
  };
}

export function usePerformanceMonitor(options: PerformanceMonitorOptions = {}) {
  const {
    enableLogging = true,
    reportToAnalytics = false,
    thresholds = {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
    },
  } = options;

  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isSupported, setIsSupported] = useState(false);
  const metricsRef = useRef<Partial<PerformanceMetrics>>({});

  useEffect(() => {
    // Performance API 지원 확인
    const supported =
      'performance' in window && 'PerformanceObserver' in window;
    setIsSupported(supported);

    if (!supported) {
      console.warn('Performance monitoring not supported in this browser');
      return;
    }

    const updateMetrics = (newMetrics: Partial<PerformanceMetrics>) => {
      metricsRef.current = { ...metricsRef.current, ...newMetrics };
      setMetrics({ ...metricsRef.current });

      if (enableLogging) {
        console.log('Performance metrics updated:', newMetrics);
      }
    };

    // Page Load Time 측정
    const _measurePageLoadTime = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        updateMetrics({ pageLoadTime });
      }
    };

    // Core Web Vitals 측정
    const _measureWebVitals = () => {
      // First Contentful Paint (FCP)
      const measureFCP = () => {
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(
            entry => entry.name === 'first-contentful-paint'
          );
          if (fcpEntry) {
            updateMetrics({ firstContentfulPaint: fcpEntry.startTime });
            observer.disconnect();
          }
        });
        observer.observe({ type: 'paint', buffered: true });
      };

      // Largest Contentful Paint (LCP)
      const _measureLCP = () => {
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcp = lastEntry.startTime;

          updateMetrics({ largestContentfulPaint: lcp });

          // LCP 임계값 체크
          if (thresholds.lcp && lcp > thresholds.lcp) {
            console.warn(
              `LCP threshold exceeded: ${lcp}ms > ${thresholds.lcp}ms`
            );
          }
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      };

      // First Input Delay (FID)
      const _measureFID = () => {
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const fid = entry.processingStart - entry.startTime;
            updateMetrics({ firstInputDelay: fid });

            // FID 임계값 체크
            if (thresholds.fid && fid > thresholds.fid) {
              console.warn(
                `FID threshold exceeded: ${fid}ms > ${thresholds.fid}ms`
              );
            }
          });
        });
        observer.observe({ type: 'first-input', buffered: true });
      };

      // Cumulative Layout Shift (CLS)
      const measureCLS = () => {
        let clsValue = 0;
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              updateMetrics({ cumulativeLayoutShift: clsValue });

              // CLS 임계값 체크
              if (thresholds.cls && clsValue > thresholds.cls) {
                console.warn(
                  `CLS threshold exceeded: ${clsValue} > ${thresholds.cls}`
                );
              }
            }
          });
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      };

      measureFCP();
      measureLCP();
      measureFID();
      measureCLS();
    };

    // 메모리 사용량 측정 (지원되는 브라우저에서만)
    const measureMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        updateMetrics({
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB 단위
        });
      }
    };

    // 네트워크 정보 수집
    const measureNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        updateMetrics({
          connectionType: connection.effectiveType || connection.type,
        });
      }
    };

    // 측정 시작
    setTimeout(() => {
      measurePageLoadTime();
      measureWebVitals();
      measureMemoryUsage();
      measureNetworkInfo();
    }, 0);

    // 주기적 메모리 측정
    const memoryInterval = setInterval(measureMemoryUsage, 30000); // 30초마다

    // 페이지 언로드 시 최종 메트릭 보고
    const handleBeforeUnload = () => {
      if (reportToAnalytics) {
        // 분석 도구로 메트릭 전송
        reportMetricsToAnalytics(metricsRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(memoryInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enableLogging, reportToAnalytics, thresholds]);

  // 분석 도구로 메트릭 전송
  const _reportMetricsToAnalytics = (metrics: Partial<PerformanceMetrics>) => {
    // 실제 구현에서는 Google Analytics, Sentry 등으로 전송
    console.log('Reporting metrics to analytics:', metrics);

    // 예시: Google Analytics 4 이벤트
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metrics', {
        page_load_time: metrics.pageLoadTime,
        first_contentful_paint: metrics.firstContentfulPaint,
        largest_contentful_paint: metrics.largestContentfulPaint,
        first_input_delay: metrics.firstInputDelay,
        cumulative_layout_shift: metrics.cumulativeLayoutShift,
      });
    }
  };

  // 성능 점수 계산 (0-100)
  const _calculatePerformanceScore = (): number => {
    const { largestContentfulPaint, firstInputDelay, cumulativeLayoutShift } =
      metrics;

    if (
      !largestContentfulPaint ||
      !firstInputDelay ||
      cumulativeLayoutShift === undefined
    ) {
      return 0;
    }

    // 각 메트릭에 대한 점수 계산 (Lighthouse 기준 참고)
    const lcpScore =
      largestContentfulPaint <= 2500
        ? 100
        : largestContentfulPaint <= 4000
          ? 50
          : 0;

    const fidScore =
      firstInputDelay <= 100 ? 100 : firstInputDelay <= 300 ? 50 : 0;

    const clsScore =
      cumulativeLayoutShift <= 0.1
        ? 100
        : cumulativeLayoutShift <= 0.25
          ? 50
          : 0;

    return Math.round((lcpScore + fidScore + clsScore) / 3);
  };

  // 성능 개선 제안
  const getPerformanceRecommendations = (): string[] => {
    const recommendations: string[] = [];
    const {
      largestContentfulPaint,
      firstInputDelay,
      cumulativeLayoutShift,
      memoryUsage,
    } = metrics;

    if (largestContentfulPaint && largestContentfulPaint > 2500) {
      recommendations.push('이미지 최적화 및 레이지 로딩 적용');
      recommendations.push('중요한 리소스의 우선순위 지정');
    }

    if (firstInputDelay && firstInputDelay > 100) {
      recommendations.push('JavaScript 번들 크기 줄이기');
      recommendations.push('코드 스플리팅 적용');
    }

    if (cumulativeLayoutShift && cumulativeLayoutShift > 0.1) {
      recommendations.push('이미지와 임베드 요소에 크기 속성 추가');
      recommendations.push('동적 콘텐츠 삽입 최소화');
    }

    if (memoryUsage && memoryUsage > 100) {
      recommendations.push('메모리 누수 확인 및 최적화');
      recommendations.push('불필요한 DOM 요소 정리');
    }

    return recommendations;
  };

  return {
    metrics,
    isSupported,
    performanceScore: calculatePerformanceScore(),
    recommendations: getPerformanceRecommendations(),
    reportMetrics: () => reportMetricsToAnalytics(metrics),
  };
}

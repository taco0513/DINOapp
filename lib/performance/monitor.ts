export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  tti?: number; // Time to Interactive
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private reportCallback?: (metrics: PerformanceMetrics) => void;

  constructor() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Web Vitals observer
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = Math.round(entry.startTime);
            }
          } else if (entry.entryType === 'largest-contentful-paint') {
            this.metrics.lcp = Math.round(entry.startTime);
          } else if (entry.entryType === 'first-input') {
            const firstInput = entry as PerformanceEventTiming;
            this.metrics.fid = Math.round(
              firstInput.processingStart - firstInput.startTime
            );
          } else if (entry.entryType === 'layout-shift') {
            const layoutShift = entry as any;
            if (!layoutShift.hadRecentInput) {
              this.metrics.cls = (this.metrics.cls || 0) + layoutShift.value;
            }
          }
        }
        this.reportMetrics();
      });

      // Observe different entry types
      observer.observe({
        entryTypes: [
          'paint',
          'largest-contentful-paint',
          'first-input',
          'layout-shift',
        ],
      });
    } catch (e) {
      console.warn('Performance monitoring not supported:', e);
    }

    // Time to First Byte
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      if (timing.responseStart && timing.requestStart) {
        this.metrics.ttfb = timing.responseStart - timing.requestStart;
      }
    }

    // Time to Interactive (simplified)
    if (
      'PerformanceObserver' in window &&
      'PerformanceLongTaskTiming' in window
    ) {
      let lastLongTaskTime = 0;
      const longTaskObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          lastLongTaskTime = entry.startTime + entry.duration;
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });

        // Check TTI after 5 seconds
        setTimeout(() => {
          const now = performance.now();
          if (now - lastLongTaskTime > 5000) {
            this.metrics.tti = Math.round(lastLongTaskTime);
            this.reportMetrics();
          }
        }, 5000);
      } catch (__e) {
        // Long task timing not supported
      }
    }
  }

  private reportMetrics() {
    if (this.reportCallback) {
      this.reportCallback(this.metrics);
    }
  }

  public onReport(callback: (metrics: PerformanceMetrics) => void) {
    this.reportCallback = callback;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public markCustomMetric(name: string, value: number) {
    if (
      typeof window !== 'undefined' &&
      'performance' in window &&
      'mark' in window.performance
    ) {
      try {
        window.performance.mark(`${name}-${value}`);
      } catch (__e) {
        // Performance mark not supported
      }
    }
  }

  public measureCustomMetric(
    name: string,
    startMark: string,
    endMark: string
  ): number | null {
    if (
      typeof window !== 'undefined' &&
      'performance' in window &&
      'measure' in window.performance
    ) {
      try {
        window.performance.measure(name, startMark, endMark);
        const entries = window.performance.getEntriesByName(name, 'measure');
        if (entries.length > 0) {
          return entries[entries.length - 1].duration;
        }
      } catch (__e) {
        // Performance measure not supported
      }
    }
    return null;
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor && typeof window !== 'undefined') {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor || new PerformanceMonitor();
}

// Utility to report Web Vitals to analytics
export function reportWebVitals(metric: any) {
  const monitor = getPerformanceMonitor();

  switch (metric.name) {
    case 'FCP':
      monitor.markCustomMetric('web-vitals-fcp', metric.value);
      break;
    case 'LCP':
      monitor.markCustomMetric('web-vitals-lcp', metric.value);
      break;
    case 'CLS':
      monitor.markCustomMetric('web-vitals-cls', metric.value);
      break;
    case 'FID':
      monitor.markCustomMetric('web-vitals-fid', metric.value);
      break;
    case 'TTFB':
      monitor.markCustomMetric('web-vitals-ttfb', metric.value);
      break;
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${metric.name}:`, metric.value);
  }
}

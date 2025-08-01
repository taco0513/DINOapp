'use client';

import { useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/logger'

// import { useRouter } from 'next/navigation';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte

  // Custom metrics
  pageLoadTime?: number;
  domContentLoaded?: number;
  resourcesLoaded?: number;
  memoryUsage?: number;
  bundleSize?: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  reportInterval?: number;
  debug?: boolean;
}

export default function PerformanceMonitor({
  enabled = process.env.NODE_ENV === 'development',
  reportInterval = 30000, // 30 seconds
  debug = false,
}: PerformanceMonitorProps) {
  // const _router = useRouter();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isSupported, setIsSupported] = useState(false);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const metricsRef = useRef<PerformanceMetrics>({});

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Check browser support
    const supported =
      'PerformanceObserver' in window && 'performance' in window;
    setIsSupported(supported);

    if (!supported) {
      logger.warn('Performance monitoring not supported in this browser');
      return;
    }

    // Initialize performance observer
    const initializeObserver = () => {
      try {
        observerRef.current = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            handlePerformanceEntry(entry);
          }
        });

        // Observe Core Web Vitals and other metrics
        observerRef.current.observe({
          entryTypes: [
            'largest-contentful-paint',
            'first-input',
            'layout-shift',
            'paint',
            'navigation',
            'resource',
          ],
        });
      } catch (error) {
        logger.error('Failed to initialize performance observer:', error);
      }
    };

    // Handle performance entries
    const handlePerformanceEntry = (entry: PerformanceEntry) => {
      const newMetrics = { ...metricsRef.current };

      switch (entry.entryType) {
        case 'largest-contentful-paint':
          newMetrics.lcp = entry.startTime;
          break;

        case 'first-input':
          const fidEntry = entry as PerformanceEventTiming;
          newMetrics.fid = fidEntry.processingStart - fidEntry.startTime;
          break;

        case 'layout-shift':
          const clsEntry = entry as any; // LayoutShift not in TS types yet
          if (!clsEntry.hadRecentInput) {
            newMetrics.cls = (newMetrics.cls || 0) + clsEntry.value;
          }
          break;

        case 'paint':
          if (entry.name === 'first-contentful-paint') {
            newMetrics.fcp = entry.startTime;
          }
          break;

        case 'navigation':
          const navEntry = entry as PerformanceNavigationTiming;
          newMetrics.ttfb = navEntry.responseStart - navEntry.requestStart;
          newMetrics.pageLoadTime = navEntry.loadEventEnd - navEntry.fetchStart;
          newMetrics.domContentLoaded =
            navEntry.domContentLoadedEventEnd - navEntry.fetchStart;
          break;

        case 'resource':
          // Track resource loading performance
          break;
      }

      metricsRef.current = newMetrics;
      setMetrics(newMetrics);

      if (debug) {
        logger.debug('Performance metric updated:', entry.entryType, newMetrics);
      }
    };

    initializeObserver();

    // Memory usage monitoring
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metricsRef.current.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
        setMetrics({ ...metricsRef.current });
      }
    };

    // Bundle size estimation
    const estimateBundleSize = () => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      let totalSize = 0;

      scripts.forEach(script => {
        const src = (script as HTMLScriptElement).src;
        if (src.includes('/_next/static/')) {
          // Estimate based on typical Next.js bundle sizes
          totalSize += 50; // Rough estimate in KB
        }
      });

      metricsRef.current.bundleSize = totalSize;
      setMetrics({ ...metricsRef.current });
    };

    // Initial measurements
    updateMemoryUsage();
    estimateBundleSize();

    // Periodic reporting
    const reportInterval = setInterval(() => {
      updateMemoryUsage();
      reportMetrics(metricsRef.current);
    }, 30000); // 30 seconds

    // Page visibility change handling
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        reportMetrics(metricsRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observerRef.current?.disconnect();
      clearInterval(reportInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, reportInterval, debug]);

  // Report metrics to analytics/monitoring service
  const reportMetrics = async (metrics: PerformanceMetrics) => {
    if (!enabled || Object.keys(metrics).length === 0) return;

    try {
      // Send to internal monitoring API
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          url: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      });

      // Send to metrics collector
      if (typeof window !== 'undefined' && (window as any).metricsCollector) {
        const collector = (window as any).metricsCollector;

        // Core Web Vitals
        if (metrics.lcp) collector.histogram('web_vitals_lcp', metrics.lcp);
        if (metrics.fid) collector.histogram('web_vitals_fid', metrics.fid);
        if (metrics.cls)
          collector.histogram('web_vitals_cls', metrics.cls * 1000); // Convert to integer
        if (metrics.fcp) collector.histogram('web_vitals_fcp', metrics.fcp);
        if (metrics.ttfb) collector.histogram('web_vitals_ttfb', metrics.ttfb);

        // Custom metrics
        if (metrics.pageLoadTime)
          collector.histogram('page_load_time', metrics.pageLoadTime);
        if (metrics.memoryUsage)
          collector.gauge('memory_usage_mb', metrics.memoryUsage);
      }

      if (debug) {
        logger.debug('Performance metrics reported:', metrics);
      }
    } catch (error) {
      logger.error('Failed to report performance metrics:', error);
    }
  };

  // Web Vitals scoring
  const getWebVitalsScore = (metrics: PerformanceMetrics) => {
    let score = 0;
    let total = 0;

    // LCP: Good < 2.5s, Needs Improvement < 4s, Poor >= 4s
    if (metrics.lcp !== undefined) {
      score += metrics.lcp < 2500 ? 100 : metrics.lcp < 4000 ? 75 : 50;
      total += 100;
    }

    // FID: Good < 100ms, Needs Improvement < 300ms, Poor >= 300ms
    if (metrics.fid !== undefined) {
      score += metrics.fid < 100 ? 100 : metrics.fid < 300 ? 75 : 50;
      total += 100;
    }

    // CLS: Good < 0.1, Needs Improvement < 0.25, Poor >= 0.25
    if (metrics.cls !== undefined) {
      score += metrics.cls < 0.1 ? 100 : metrics.cls < 0.25 ? 75 : 50;
      total += 100;
    }

    return total > 0 ? Math.round(score / total) : 0;
  };

  // Performance warnings
  const getPerformanceWarnings = (metrics: PerformanceMetrics) => {
    const warnings: string[] = [];

    if (metrics.lcp && metrics.lcp > 4000) {
      warnings.push('Largest Contentful Paint is poor (> 4s)');
    }
    if (metrics.fid && metrics.fid > 300) {
      warnings.push('First Input Delay is poor (> 300ms)');
    }
    if (metrics.cls && metrics.cls > 0.25) {
      warnings.push('Cumulative Layout Shift is poor (> 0.25)');
    }
    if (metrics.memoryUsage && metrics.memoryUsage > 100) {
      warnings.push('High memory usage detected (> 100MB)');
    }

    return warnings;
  };

  // Only render in development or when debug is enabled
  if (!enabled && !debug) return null;
  if (!isSupported) return null;

  const score = getWebVitalsScore(metrics);
  const warnings = getPerformanceWarnings(metrics);

  return debug ? (
    <div className='fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50'>
      <div className='flex items-center justify-between mb-2'>
        <h3 className='font-semibold'>Performance Monitor</h3>
        <div
          className={`px-2 py-1 rounded text-xs ${
            score >= 90
              ? 'bg-green-600'
              : score >= 75
                ? 'bg-yellow-600'
                : 'bg-red-600'
          }`}
        >
          Score: {score}
        </div>
      </div>

      <div className='space-y-1'>
        {metrics.lcp && <div>LCP: {Math.round(metrics.lcp)}ms</div>}
        {metrics.fid && <div>FID: {Math.round(metrics.fid)}ms</div>}
        {metrics.cls && <div>CLS: {metrics.cls.toFixed(3)}</div>}
        {metrics.fcp && <div>FCP: {Math.round(metrics.fcp)}ms</div>}
        {metrics.ttfb && <div>TTFB: {Math.round(metrics.ttfb)}ms</div>}
        {metrics.memoryUsage && (
          <div>Memory: {Math.round(metrics.memoryUsage)}MB</div>
        )}
      </div>

      {warnings.length > 0 && (
        <div className='mt-2 pt-2 border-t border-gray-600'>
          <div className='text-red-400 text-xs'>Warnings:</div>
          {warnings.map((warning, i) => (
            <div key={i} className='text-red-300 text-xs'>
              • {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  ) : null;
}

// Hook for using performance metrics
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver(list => {
      const newMetrics: PerformanceMetrics = {};

      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            newMetrics.lcp = entry.startTime;
            break;
          case 'first-input':
            const fidEntry = entry as PerformanceEventTiming;
            newMetrics.fid = fidEntry.processingStart - fidEntry.startTime;
            break;
        }
      }

      setMetrics(prev => ({ ...prev, ...newMetrics }));
    });

    observer.observe({
      entryTypes: ['largest-contentful-paint', 'first-input'],
    });

    return () => observer.disconnect();
  }, []);

  return metrics;
}

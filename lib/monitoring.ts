/**
 * Production Performance Monitoring System
 * Tracks Core Web Vitals, API performance, and user interactions
 */

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
  url: string
  userAgent?: string
}

interface APIMetric {
  endpoint: string
  method: string
  duration: number
  status: number
  timestamp: number
  userId?: string
}

interface ErrorMetric {
  message: string
  stack?: string
  url: string
  timestamp: number
  userId?: string
  userAgent?: string
}

class PerformanceMonitor {
  private isProduction = process.env.NODE_ENV === 'production'
  private enableLogging = process.env.ENABLE_PERFORMANCE_LOGGING === 'true'
  
  /**
   * Initialize Core Web Vitals monitoring
   */
  initWebVitals() {
    if (typeof window === 'undefined' || !this.isProduction) return

    // CLS (Cumulative Layout Shift)
    this.observeLayoutShift()
    
    // LCP (Largest Contentful Paint)
    this.observeLCP()
    
    // FID (First Input Delay)
    this.observeFID()
    
    // Custom metrics
    this.observeNavigationTiming()
  }

  private observeLayoutShift() {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          this.reportMetric({
            name: 'CLS',
            value: (entry as any).value,
            rating: this.getCLSRating((entry as any).value),
            timestamp: Date.now(),
            url: window.location.pathname
          })
        }
      }
    })

    observer.observe({ entryTypes: ['layout-shift'] })
  }

  private observeLCP() {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      
      this.reportMetric({
        name: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime,
        rating: this.getLCPRating(lastEntry.renderTime || lastEntry.loadTime),
        timestamp: Date.now(),
        url: window.location.pathname
      })
    })

    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  }

  private observeFID() {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.reportMetric({
          name: 'FID',
          value: (entry as any).processingStart - (entry as any).startTime,
          rating: this.getFIDRating((entry as any).processingStart - (entry as any).startTime),
          timestamp: Date.now(),
          url: window.location.pathname
        })
      }
    })

    observer.observe({ entryTypes: ['first-input'] })
  }

  private observeNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        // Time to First Byte
        const ttfb = navigation.responseStart - navigation.requestStart
        this.reportMetric({
          name: 'TTFB',
          value: ttfb,
          rating: this.getTTFBRating(ttfb),
          timestamp: Date.now(),
          url: window.location.pathname
        })

        // Dom Content Loaded
        const dcl = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        this.reportMetric({
          name: 'DCL',
          value: dcl,
          rating: this.getDCLRating(dcl),
          timestamp: Date.now(),
          url: window.location.pathname
        })
      }, 0)
    })
  }

  /**
   * Track API performance
   */
  trackAPICall(metric: APIMetric) {
    if (!this.enableLogging) return

    const rating = this.getAPIRating(metric.duration)
    
    if (this.isProduction) {
      // Send to analytics service
      this.sendToAnalytics('api_performance', {
        ...metric,
        rating
      })
    } else {
      // API Performance logged
    }
  }

  /**
   * Track errors
   */
  trackError(error: ErrorMetric) {
    if (this.isProduction) {
      // Send to error tracking service (Sentry)
      this.sendToErrorTracking(error)
    } else {
      // Error tracked
    }
  }

  /**
   * Track user interactions
   */
  trackUserAction(action: string, properties?: Record<string, any>) {
    if (!this.enableLogging) return

    const event = {
      action,
      properties,
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent
    }

    if (this.isProduction) {
      this.sendToAnalytics('user_action', event)
    } else {
      // User action tracked
    }
  }

  private reportMetric(metric: PerformanceMetric) {
    if (!this.enableLogging) return

    if (this.isProduction) {
      this.sendToAnalytics('web_vitals', metric)
    } else {
      // Web vitals metric reported
    }
  }

  private sendToAnalytics(event: string, data: any) {
    // Send to Vercel Analytics or custom analytics service
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', event, data)
    }
    
    // Also send to custom endpoint for detailed tracking
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data })
    }).catch(() => {
      // Silently fail to not impact user experience
    })
  }

  private sendToErrorTracking(error: ErrorMetric) {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error)
    }).catch(() => {
      // Silently fail
    })
  }

  // Rating functions based on Core Web Vitals thresholds
  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
  }

  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
  }

  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor'
  }

  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor'
  }

  private getDCLRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 1600 ? 'good' : value <= 2400 ? 'needs-improvement' : 'poor'
  }

  private getAPIRating(duration: number): 'good' | 'needs-improvement' | 'poor' {
    return duration <= 200 ? 'good' : duration <= 1000 ? 'needs-improvement' : 'poor'
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for tracking user interactions
export function usePerformanceTracking() {
  const trackAction = (action: string, properties?: Record<string, any>) => {
    performanceMonitor.trackUserAction(action, properties)
  }

  const trackAPICall = (endpoint: string, method: string, duration: number, status: number) => {
    performanceMonitor.trackAPICall({
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now()
    })
  }

  const trackError = (error: Error, additionalInfo?: Record<string, any>) => {
    performanceMonitor.trackError({
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      timestamp: Date.now(),
      ...additionalInfo
    })
  }

  return { trackAction, trackAPICall, trackError }
}

// API performance middleware
export function createAPIPerformanceMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now()
    
    res.on('finish', () => {
      const duration = Date.now() - startTime
      
      performanceMonitor.trackAPICall({
        endpoint: req.url,
        method: req.method,
        duration,
        status: res.statusCode,
        timestamp: Date.now(),
        userId: req.user?.id
      })
    })
    
    next()
  }
}

// Error boundary for React components
export class ErrorBoundary extends Error {
  constructor(message: string, public componentStack?: string) {
    super(message)
    this.name = 'ErrorBoundary'
  }
}

// Initialize monitoring on app start
export function initializeMonitoring() {
  if (typeof window !== 'undefined') {
    performanceMonitor.initWebVitals()
    
    // Track page views
    const originalPushState = history.pushState
    history.pushState = function(...args) {
      originalPushState.apply(history, args)
      performanceMonitor.trackUserAction('page_view', {
        path: window.location.pathname
      })
    }

    // Track unhandled errors
    window.addEventListener('error', (event) => {
      performanceMonitor.trackError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        timestamp: Date.now()
      })
    })

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      performanceMonitor.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        url: window.location.href,
        timestamp: Date.now()
      })
    })
  }
}

export type { PerformanceMetric, APIMetric, ErrorMetric }
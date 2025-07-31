'use client'

import { useEffect } from 'react'
import { initializeMonitoring, performanceMonitor } from '@/lib/monitoring'

export default function MonitoringProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize performance monitoring
    initializeMonitoring()

    // Track page load performance
    if (typeof window !== 'undefined') {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        performanceMonitor.trackAPICall({
          endpoint: window.location.pathname,
          method: 'GET',
          duration: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
          status: 200,
          timestamp: Date.now()
        })
      }

      // Track initial user engagement
      performanceMonitor.trackUserAction('page_view', {
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink
        } : null
      })

      // Track performance every 30 seconds
      const performanceInterval = setInterval(() => {
        const memory = (performance as any).memory
        if (memory) {
          performanceMonitor.trackUserAction('performance_snapshot', {
            memory: {
              used: memory.usedJSHeapSize,
              total: memory.totalJSHeapSize,
              limit: memory.jsHeapSizeLimit
            },
            timing: performance.now(),
            connectionType: (navigator as any).connection?.effectiveType || 'unknown'
          })
        }
      }, 30000)

      // Cleanup function
      return () => {
        clearInterval(performanceInterval)
      }
    }
    
    // Return empty cleanup function for server-side
    return () => {}
  }, [])

  return <>{children}</>
}
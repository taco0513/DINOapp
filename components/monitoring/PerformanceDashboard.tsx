'use client'

import { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'

// UI Components removed - using minimal design system
import { performanceThresholds } from '@/lib/analytics/vercel'

interface WebVital {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

export function PerformanceDashboard() {
  const [vitals, setVitals] = useState<WebVital[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Web Vitals 수집
    if ('PerformanceObserver' in window) {
      try {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { value?: number }
          if (lastEntry?.value) {
            updateVital('LCP', lastEntry.value)
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              const fid = entry.processingStart - entry.startTime
              updateVital('FID', fid)
            }
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // CLS (Cumulative Layout Shift)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
              updateVital('CLS', clsValue)
            }
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // FCP (First Contentful Paint)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            updateVital('FCP', fcpEntry.startTime)
          }
        })
        fcpObserver.observe({ entryTypes: ['paint'] })

        // TTFB (Time to First Byte)
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
        if (navigationEntries.length > 0) {
          const ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart
          updateVital('TTFB', ttfb)
        }

        // 5초 후 로딩 상태 해제
        setTimeout(() => {
          setIsLoading(false)
        }, 5000)

      } catch (error) {
        logger.error('Performance monitoring error:', error)
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const updateVital = (name: string, value: number) => {
    const rating = getRating(name, value)
    
    setVitals(prevVitals => {
      const existingIndex = prevVitals.findIndex(vital => vital.name === name)
      const newVital = { name, value, rating }
      
      if (existingIndex >= 0) {
        const updated = [...prevVitals]
        updated[existingIndex] = newVital
        return updated
      } else {
        return [...prevVitals, newVital]
      }
    })
  }

  const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const threshold = performanceThresholds[name as keyof typeof performanceThresholds]
    if (!threshold) return 'good'
    
    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  const getColorByRating = (rating: string) => {
    switch (rating) {
      case 'good': return 'badge-success'
      case 'needs-improvement': return 'badge-warning'  
      case 'poor': return 'badge-error'
      default: return 'badge'
    }
  }

  const getProgressValue = (name: string, value: number) => {
    const threshold = performanceThresholds[name as keyof typeof performanceThresholds]
    if (!threshold) return 0
    
    const maxValue = threshold.needsImprovement * 1.5
    return Math.min((value / maxValue) * 100, 100)
  }

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">성능 모니터링</h3>
        <div className="space-y-4">
            {['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].map(name => (
              <div key={name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{name}</span>
                  <span>측정 중...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{width: '0%'}} />
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">성능 모니터링</h3>
      <div className="space-y-4">
          {vitals.map(vital => (
            <div key={vital.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{vital.name}</span>
                <span className={`badge ${getColorByRating(vital.rating)}`}>
                  {vital.value.toFixed(vital.name === 'CLS' ? 3 : 0)}
                  {vital.name === 'CLS' ? '' : 'ms'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{width: `${getProgressValue(vital.name, vital.value)}%`}} />
              </div>
            </div>
          ))}
      </div>
      
      <div className="mt-6 space-y-2 text-xs text-secondary">
        <div className="flex items-center gap-2">
          <span className="badge badge-success">Good</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-warning">Needs Improvement</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-error">Poor</span>
        </div>
      </div>
    </div>
  )
}
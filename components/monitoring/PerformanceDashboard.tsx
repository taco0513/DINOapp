'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
          const lastEntry = entries[entries.length - 1] as any
          updateVital('LCP', lastEntry.startTime)
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (entry.name === 'first-input') {
              updateVital('FID', entry.processingStart - entry.startTime)
            }
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // CLS (Cumulative Layout Shift)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
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
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              updateVital('FCP', entry.startTime)
            }
          })
        })
        fcpObserver.observe({ entryTypes: ['paint'] })

        // TTFB (Time to First Byte)
        const navigationEntry = performance.getEntriesByType('navigation')[0] as any
        if (navigationEntry) {
          updateVital('TTFB', navigationEntry.responseStart - navigationEntry.requestStart)
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error setting up performance observers:', error)
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const updateVital = (name: string, value: number) => {
    const threshold = performanceThresholds[name as keyof typeof performanceThresholds]
    let rating: 'good' | 'needs-improvement' | 'poor' = 'good'
    
    if (threshold) {
      if (value <= threshold.good) {
        rating = 'good'
      } else if (value <= threshold.needsImprovement) {
        rating = 'needs-improvement'
      } else {
        rating = 'poor'
      }
    }

    setVitals(prev => {
      const existing = prev.find(v => v.name === name)
      if (existing) {
        return prev.map(v => v.name === name ? { name, value, rating } : v)
      }
      return [...prev, { name, value, rating }]
    })
  }

  const getColorByRating = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-500'
      case 'needs-improvement':
        return 'bg-yellow-500'
      case 'poor':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
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
      <Card>
        <CardHeader>
          <CardTitle>성능 모니터링</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].map(name => (
              <div key={name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{name}</span>
                  <span>측정 중...</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>성능 모니터링</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vitals.map(vital => (
            <div key={vital.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{vital.name}</span>
                <span className={`px-2 py-1 rounded text-xs text-white ${getColorByRating(vital.rating)}`}>
                  {vital.value.toFixed(vital.name === 'CLS' ? 3 : 0)}
                  {vital.name === 'CLS' ? '' : 'ms'}
                </span>
              </div>
              <Progress 
                value={getProgressValue(vital.name, vital.value)} 
                className="h-2"
              />
            </div>
          ))}
        </div>
        
        <div className="mt-6 space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Needs Improvement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Poor</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
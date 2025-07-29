/**
 * Dynamic imports for code splitting and performance optimization
 * Lazy loading components to reduce initial bundle size
 */

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Loading component for better UX during lazy loading
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)

// Dashboard components (heavy, load on demand)
export const DynamicSchengenCalculator = dynamic(
  () => import('@/components/schengen/SchengenCalculator'),
  {
    loading: LoadingSpinner,
    ssr: false // Client-side only for complex calculations
  }
)

export const DynamicTravelRecordsTable = dynamic(
  () => import('@/components/trips/TravelRecordsTable'),
  {
    loading: LoadingSpinner,
    ssr: true // SEO-friendly
  }
)

export const DynamicGmailAnalyzer = dynamic(
  () => import('@/components/gmail/GmailAnalyzer'),
  {
    loading: LoadingSpinner,
    ssr: false // Requires browser APIs
  }
)

export const DynamicCalendarSync = dynamic(
  () => import('@/components/calendar/CalendarSync'),
  {
    loading: LoadingSpinner,
    ssr: false // Google Calendar APIs
  }
)

// Admin components (rarely used, heavy lazy loading)
export const DynamicMonitoringDashboard = dynamic(
  () => import('@/app/admin/monitoring/page').then(mod => ({ default: mod.default })),
  {
    loading: LoadingSpinner,
    ssr: false
  }
)

// Charts and visualization (heavy libraries)
export const DynamicChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })),
  {
    loading: LoadingSpinner,
    ssr: false
  }
)

export const DynamicLineChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  {
    loading: LoadingSpinner,
    ssr: false
  }
)

export const DynamicBarChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.BarChart })),
  {
    loading: LoadingSpinner,
    ssr: false
  }
)

// Date picker (heavy component)
export const DynamicDatePicker = dynamic(
  () => import('@/components/ui/date-picker'),
  {
    loading: () => <div className="h-10 bg-gray-100 rounded animate-pulse" />,
    ssr: false
  }
)

// Rich text editor (if needed in future)
export const DynamicRichTextEditor = dynamic(
  () => import('@/components/ui/rich-text-editor'),
  {
    loading: LoadingSpinner,
    ssr: false
  }
)

// Performance monitoring utilities
export const DynamicPerformanceMonitor = dynamic(
  () => import('@/components/performance/PerformanceMonitor'),
  {
    loading: () => null, // Silent loading for monitoring
    ssr: false
  }
)

// Bundle analyzer component (development only)
export const DynamicBundleAnalyzer = dynamic(
  () => process.env.NODE_ENV === 'development' 
    ? import('@/components/dev/BundleAnalyzer')
    : Promise.resolve(() => null),
  {
    loading: LoadingSpinner,
    ssr: false
  }
)

// Higher-order component for dynamic imports with error boundary
interface DynamicComponentOptions {
  loading?: ComponentType
  error?: ComponentType<{ error: Error; retry: () => void }>
  ssr?: boolean
}

export function createDynamicComponent<T = {}>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: DynamicComponentOptions = {}
) {
  const {
    loading = LoadingSpinner,
    error: ErrorComponent = ({ error, retry }) => (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-2">Failed to load component</p>
        <p className="text-sm text-gray-600 mb-4">{error.message}</p>
        <button 
          onClick={retry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    ),
    ssr = true
  } = options

  return dynamic(importFn, {
    loading,
    ssr
  })
}

// Preload critical components for better performance
export const preloadCriticalComponents = () => {
  if (typeof window !== 'undefined') {
    // Preload commonly used components
    import('@/components/trips/TravelRecordsTable')
    import('@/components/schengen/SchengenCalculator')
    
    // Preload on user interaction
    const preloadOnHover = (selector: string, importFn: () => Promise<any>) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        el.addEventListener('mouseenter', () => importFn(), { once: true })
      })
    }

    // Preload Gmail analyzer on hover over Gmail-related elements
    preloadOnHover('[data-component="gmail"]', () => import('@/components/gmail/GmailAnalyzer'))
    
    // Preload calendar sync on hover over calendar elements
    preloadOnHover('[data-component="calendar"]', () => import('@/components/calendar/CalendarSync'))
  }
}

// Resource hints for better performance
export const addResourceHints = () => {
  if (typeof window !== 'undefined') {
    const head = document.head

    // DNS prefetch for external resources
    const dnsPrefetch = (href: string) => {
      const link = document.createElement('link')
      link.rel = 'dns-prefetch'
      link.href = href
      head.appendChild(link)
    }

    dnsPrefetch('https://accounts.google.com')
    dnsPrefetch('https://www.googleapis.com')
    dnsPrefetch('https://fonts.googleapis.com')

    // Preconnect for critical external resources
    const preconnect = (href: string) => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = href
      link.crossOrigin = 'anonymous'
      head.appendChild(link)
    }

    preconnect('https://accounts.google.com')
    preconnect('https://www.googleapis.com')
  }
}
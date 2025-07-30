'use client'

import dynamic from 'next/dynamic'
import { ComponentType, ReactNode } from 'react'

interface LazyLoadProps {
  children?: ReactNode
}

// Loading component with skeleton
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)

export const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
)

// Lazy load heavy components
export const LazySchengenCalculator = dynamic(
  () => import('@/components/schengen/SchengenCalculator'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
)

export const LazyTravelStatsWidget = dynamic(
  () => import('@/components/dashboard/TravelStatsWidget'),
  { 
    loading: () => <LoadingSkeleton />,
    ssr: true 
  }
)

export const LazyYearView = dynamic(
  () => import('@/components/calendar/YearView').then(mod => ({ default: mod.YearView })),
  { 
    loading: () => <LoadingSpinner />,
    ssr: true 
  }
)

// Generic lazy loader for any component
export function createLazyComponent<P = {}>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: ComponentType
    ssr?: boolean
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading || (() => <LoadingSpinner />),
    ssr: options?.ssr ?? true
  })
}
'use client';

import { lazy, Suspense } from 'react';

// Lazy load the PerformanceMetricsDashboard component
const PerformanceMetricsDashboard = lazy(() => 
  import('@/components/metrics/PerformanceMetricsDashboard')
);

// Loading component
const PerformanceLoading = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="flex justify-between items-center">
      <div className="h-8 bg-gray-200 rounded w-40 animate-pulse" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
        ))}
      </div>
    </div>

    {/* Core Web Vitals skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="card-header pb-2">
            <div className="h-4 bg-gray-200 rounded w-48" />
          </div>
          <div className="p-6 pt-0">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-16" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
              <div className="h-5 w-5 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Performance charts skeleton */}
    <div className="space-y-4">
      <div className="flex space-x-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded w-20 animate-pulse" />
        ))}
      </div>
      
      <div className="card animate-pulse">
        <div className="card-header">
          <div className="h-6 bg-gray-200 rounded w-32" />
        </div>
        <div className="p-6">
          <div className="h-80 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export function LazyPerformanceMetrics() {
  return (
    <Suspense fallback={<PerformanceLoading />}>
      <PerformanceMetricsDashboard />
    </Suspense>
  );
}

export default LazyPerformanceMetrics;
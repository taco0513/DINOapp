'use client';

import { lazy, Suspense } from 'react';

// Lazy load the BusinessMetricsDashboard component
const BusinessMetricsDashboard = lazy(() => 
  import('@/components/metrics/BusinessMetricsDashboard')
);

// Loading component
const BusinessMetricsLoading = () => (
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

    {/* Key metrics cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 w-4 bg-gray-200 rounded" />
          </div>
          <div className="p-6 pt-0">
            <div className="h-8 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
        </div>
      ))}
    </div>

    {/* Charts section skeleton */}
    <div className="space-y-4">
      <div className="flex space-x-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
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

export function LazyBusinessMetrics() {
  return (
    <Suspense fallback={<BusinessMetricsLoading />}>
      <BusinessMetricsDashboard />
    </Suspense>
  );
}

export default LazyBusinessMetrics;
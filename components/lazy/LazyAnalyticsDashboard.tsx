'use client';

import { lazy, Suspense } from 'react';

// Lazy load the AdvancedAnalyticsDashboard component
const AdvancedAnalyticsDashboard = lazy(() => 
  import('@/components/analytics/AdvancedAnalyticsDashboard')
);

// Loading component
const AnalyticsLoading = () => (
  <div className="space-y-6">
    {/* Date range selector skeleton */}
    <div className="flex justify-between items-center">
      <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
        ))}
      </div>
    </div>

    {/* Metrics cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 w-4 bg-gray-200 rounded" />
          </div>
          <div className="p-6 pt-0">
            <div className="h-8 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-40" />
          </div>
        </div>
      ))}
    </div>

    {/* Tabs skeleton */}
    <div className="space-y-4">
      <div className="flex space-x-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="card-header">
              <div className="h-6 bg-gray-200 rounded w-32" />
            </div>
            <div className="p-6">
              <div className="h-80 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export function LazyAnalyticsDashboard() {
  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <AdvancedAnalyticsDashboard />
    </Suspense>
  );
}

export default LazyAnalyticsDashboard;
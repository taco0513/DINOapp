'use client';

import { lazy, Suspense } from 'react';

// Lazy load the TravelStatsWidget component
const TravelStatsWidget = lazy(() => 
  import('@/components/dashboard/TravelStatsWidget').then(module => ({
    default: module.TravelStatsWidget
  }))
);

// Loading component
const TravelStatsLoading = () => (
  <div className="card">
    <div className="card-header">
      <h3 className="card-title flex items-center gap-2">
        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
        여행 통계
      </h3>
    </div>
    <div className="p-8">
      <div className="animate-pulse space-y-6">
        {/* Key metrics skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto" />
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
            </div>
          ))}
        </div>
        
        {/* Chart skeleton */}
        <div className="h-64 bg-gray-200 rounded" />
        
        {/* Highlights skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="card bg-gray-50">
              <div className="card-header">
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
              <div className="px-4 pb-4 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

interface LazyTravelStatsWidgetProps {
  className?: string;
}

export function LazyTravelStatsWidget({ className }: LazyTravelStatsWidgetProps) {
  return (
    <Suspense fallback={<TravelStatsLoading />}>
      <TravelStatsWidget className={className} />
    </Suspense>
  );
}

export default LazyTravelStatsWidget;
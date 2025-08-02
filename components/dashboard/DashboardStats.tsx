/**
 * DINO v2.0 - Dashboard Statistics Component
 * Display user's travel statistics
 */

interface DashboardStatsProps {
  readonly stats: {
    readonly totalTrips: number;
    readonly countriesVisited: number;
    readonly daysAbroad: number;
    readonly tripsThisYear: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        여행 통계 📊
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalTrips}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            총 여행 수
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {stats.countriesVisited}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            방문 국가
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {stats.daysAbroad}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            해외 체류일
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">
            {stats.tripsThisYear}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            올해 여행
          </div>
        </div>
      </div>
    </div>
  );
}
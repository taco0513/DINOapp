# Analytics Dashboard Documentation

## Overview

The DINO Analytics Dashboard provides comprehensive visualization and insights into user travel patterns, statistics, and behavior. This feature enables users to understand their travel history through detailed charts, metrics, and trend analysis.

## System Architecture

```
Analytics Dashboard System
├── Frontend Layer
│   ├── AnalyticsPage - Main dashboard interface
│   ├── StatisticsCards - Overview metrics display
│   ├── ChartsSection - Visual data representation
│   └── TimelineView - Recent travel timeline
├── Data Processing Layer
│   ├── StatsCalculator - Travel statistics computation
│   ├── TrendAnalyzer - Pattern recognition and analysis
│   └── DataAggregator - Multi-source data consolidation
├── API Layer
│   ├── GET /api/stats - Retrieve user statistics
│   └── Analytics calculation engine
└── Database Layer
    ├── Travel records aggregation
    ├── Statistical computations
    └── Performance optimization
```

## Core Components

### AnalyticsPage Component

**Location**: `/app/analytics/page.tsx`  
**Purpose**: Main dashboard interface displaying comprehensive travel analytics

#### Features Overview

##### Real-Time Statistics Dashboard

- **Overview Cards**: Key metrics display with visual indicators
- **Country Statistics**: Most visited countries with visit frequency
- **Visa Analytics**: Distribution of visa types used
- **Travel Timeline**: Chronological view of recent trips
- **Schengen Tracking**: Dedicated 90/180-day rule monitoring

##### Interactive Data Visualization

- **Responsive Grid Layout**: Adaptive card-based design
- **Flag Integration**: Country flags for visual identification
- **Progress Indicators**: Visual representation of usage patterns
- **Mobile Optimization**: Touch-friendly interface design

#### Data Models

##### StatisticsData Interface

```typescript
interface StatisticsData {
  overview: {
    totalCountries: number; // Unique countries visited
    totalDays: number; // Cumulative travel days
    schengenDays: number; // Days spent in Schengen area
    totalVisits: number; // Total number of trips
  };
  currentYear: {
    countries: number; // Countries visited this year
    visits: number; // Trips taken this year
    days: number; // Travel days this year
  };
  recentActivity: {
    visits: number; // Recent activity count
    averageDays: number; // Average trip duration
  };
  mostVisitedCountries: Array<{
    country: string; // Country name
    visits: number; // Number of visits
    totalDays: number; // Total days spent
    isSchengen: boolean; // Schengen area flag
  }>;
  visaTypeDistribution: Array<{
    type: string; // Visa type name
    count: number; // Usage frequency
    percentage: number; // Percentage of total
  }>;
  timeline: Array<{
    country: string; // Destination country
    entryDate: string; // Entry date (ISO string)
    exitDate?: string; // Exit date (ISO string, optional)
    days?: number; // Trip duration
    visaType: string; // Visa type used
  }>;
}
```

##### Analytics Calculation Engine

```typescript
// Core statistics computation
const calculateOverviewStats = (visits: CountryVisit[]) => {
  const totalCountries = new Set(visits.map(v => v.country)).size;
  const totalDays = visits.reduce((sum, visit) => sum + (visit.days || 0), 0);
  const schengenVisits = visits.filter(
    v => getCountryByName(v.country)?.isSchengen
  );
  const schengenDays = calculateSchengenDays(schengenVisits);

  return {
    totalCountries,
    totalDays,
    schengenDays,
    totalVisits: visits.length,
  };
};

// Travel pattern analysis
const analyzeTravelPatterns = (visits: CountryVisit[]) => {
  const countryFrequency = visits.reduce(
    (acc, visit) => {
      acc[visit.country] = (acc[visit.country] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(countryFrequency)
    .map(([country, visits]) => ({ country, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);
};
```

#### UI Implementation

##### Statistics Cards Grid

```typescript
// Responsive grid layout with overview metrics
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px'
}}>
  <StatCard
    title="총 방문 국가"
    value={statsData.overview.totalCountries}
    icon="🌍"
  />
  <StatCard
    title="총 여행 일수"
    value={`${statsData.overview.totalDays}일`}
    icon="📅"
  />
  <StatCard
    title="셰겐 사용 일수"
    value={`${statsData.overview.schengenDays}/90일`}
    icon="🇪🇺"
    progress={statsData.overview.schengenDays / 90 * 100}
  />
</div>
```

##### Country Ranking Display

```typescript
// Most visited countries with flags and statistics
{statsData.mostVisitedCountries.map((item, index) => {
  const country = getCountryByName(item.country)
  return (
    <div key={index} className="country-rank-item">
      <div className="country-info">
        <span className="flag">{country?.flag || '🌍'}</span>
        <span className="name">{item.country}</span>
        {country?.isSchengen && (
          <Badge variant="schengen">셰겐</Badge>
        )}
      </div>
      <span className="visit-count">{item.visits}회</span>
    </div>
  )
})}
```

##### Visual Progress Indicators

```typescript
// Visa type distribution with progress bars
{statsData.visaTypeDistribution.map((item, index) => (
  <div key={index} className="visa-distribution-item">
    <span className="visa-type">{item.type}</span>
    <div className="progress-container">
      <div
        className="progress-bar"
        style={{
          width: `${(item.count / statsData.overview.totalVisits) * 100}%`
        }}
      />
    </div>
    <span className="count">{item.count}</span>
  </div>
))}
```

## API Integration

### GET /api/stats

**Purpose**: Retrieve comprehensive user travel statistics  
**Authentication**: Required (user session)  
**Caching**: 5-minute TTL for performance optimization

#### Request Flow

```typescript
const loadStats = async () => {
  try {
    const response = await ApiClient.getStats();
    if (response.success && response.data) {
      setStatsData(response.data);
    }
  } catch (error) {
    // Handle error appropriately
  }
};
```

#### Response Structure

```typescript
interface StatsResponse {
  success: boolean;
  data: StatisticsData;
  timestamp: string;
  cacheInfo?: {
    hit: boolean;
    ttl: number;
  };
}
```

#### Performance Optimizations

- **Database Query Optimization**: Efficient aggregation queries
- **Caching Strategy**: In-memory caching with TTL
- **Lazy Loading**: Progressive data loading for large datasets
- **Calculation Caching**: Pre-computed statistics for frequent queries

## Data Processing and Analysis

### Statistical Calculations

#### Travel Frequency Analysis

```typescript
const calculateTravelFrequency = (visits: CountryVisit[]) => {
  const monthlyStats = visits.reduce(
    (acc, visit) => {
      const month = new Date(visit.entryDate).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(monthlyStats)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
};
```

#### Schengen Compliance Tracking

```typescript
const calculateSchengenCompliance = (visits: CountryVisit[]) => {
  const schengenVisits = visits.filter(
    v => getCountryByName(v.country)?.isSchengen
  );

  const currentUsage = calculateCurrentSchengenUsage(schengenVisits);
  const projectedUsage = calculateProjectedUsage(schengenVisits);

  return {
    currentDays: currentUsage,
    remainingDays: 90 - currentUsage,
    complianceStatus: currentUsage <= 90 ? 'compliant' : 'violation',
    nextResetDate: calculateNextResetDate(schengenVisits),
  };
};
```

#### Travel Pattern Recognition

```typescript
const identifyTravelPatterns = (visits: CountryVisit[]) => {
  const patterns = {
    frequentDestinations: analyzeMostVisited(visits),
    seasonalTrends: analyzeSeasonality(visits),
    tripDurationPatterns: analyzeDurations(visits),
    visaPreferences: analyzeVisaTypes(visits),
  };

  return patterns;
};
```

### Data Aggregation Performance

#### Query Optimization

```sql
-- Optimized statistics query
SELECT
  COUNT(DISTINCT country) as totalCountries,
  SUM(CASE WHEN days IS NOT NULL THEN days ELSE 0 END) as totalDays,
  COUNT(*) as totalVisits,
  COUNT(CASE WHEN EXTRACT(YEAR FROM entryDate) = EXTRACT(YEAR FROM CURRENT_DATE) THEN 1 END) as currentYearVisits
FROM countryVisits
WHERE userId = ?
AND deletedAt IS NULL
```

#### Caching Strategy

```typescript
// Multi-level caching for analytics data
const getCachedStats = async (
  userId: string
): Promise<StatisticsData | null> => {
  // L1: Memory cache (1 minute TTL)
  const memoryCache = getFromMemoryCache(`stats:${userId}`);
  if (memoryCache) return memoryCache;

  // L2: Database cache (5 minute TTL)
  const dbCache = await getFromDatabaseCache(`stats:${userId}`);
  if (dbCache && !isCacheExpired(dbCache.timestamp, 5 * 60 * 1000)) {
    setMemoryCache(`stats:${userId}`, dbCache.data, 60 * 1000);
    return dbCache.data;
  }

  return null;
};
```

## Mobile Optimization

### Responsive Design Implementation

```typescript
// Mobile-first responsive grid
const gridStyles = {
  display: 'grid',
  gridTemplateColumns:
    window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: window.innerWidth < 768 ? '16px' : '20px',
};

// Touch-optimized interactions
const cardStyles = {
  padding: window.innerWidth < 768 ? '16px' : '20px',
  minHeight: '120px',
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out',
  ':hover': {
    transform: 'translateY(-2px)',
  },
};
```

### Performance Considerations

- **Progressive Loading**: Load overview first, then detailed charts
- **Image Optimization**: Lazy loading for country flags
- **Gesture Support**: Touch gestures for chart navigation
- **Offline Capabilities**: Cached statistics for offline viewing

## User Experience Features

### Loading States

```typescript
// Skeleton loading for better perceived performance
const StatsSkeletonLoader = () => (
  <div className="stats-skeleton">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="skeleton-card">
        <div className="skeleton-title" />
        <div className="skeleton-value" />
      </div>
    ))}
  </div>
)
```

### Error Handling

```typescript
// Graceful degradation for missing data
const renderStatCard = (title: string, value: any, fallback: string) => {
  if (value === null || value === undefined) {
    return (
      <StatCard
        title={title}
        value={fallback}
        status="unavailable"
      />
    )
  }

  return <StatCard title={title} value={value} />
}
```

### Accessibility Features

- **Screen Reader Support**: Proper ARIA labels for charts
- **Keyboard Navigation**: Tab-accessible interface
- **Color Contrast**: WCAG 2.1 AA compliant color scheme
- **Alternative Text**: Descriptive text for visual elements

## Integration with Other Systems

### Schengen Calculator Integration

```typescript
// Real-time Schengen compliance in analytics
const integrateSchengenData = (statsData: StatisticsData) => {
  const schengenCalculator = new SchengenCalculator();
  const compliance = schengenCalculator.calculateCompliance(
    statsData.timeline.filter(t => isSchengenCountry(t.country))
  );

  return {
    ...statsData,
    schengenCompliance: compliance,
  };
};
```

### Trip Management Synchronization

```typescript
// Real-time updates when trips are modified
useEffect(() => {
  const handleTripUpdate = () => {
    // Invalidate cache and reload stats
    invalidateStatsCache();
    loadStats();
  };

  window.addEventListener('tripUpdated', handleTripUpdate);
  return () => window.removeEventListener('tripUpdated', handleTripUpdate);
}, []);
```

## Future Enhancements

### Advanced Analytics Features

- **Predictive Analysis**: Future travel pattern predictions
- **Budget Tracking**: Travel expense analytics integration
- **Carbon Footprint**: Environmental impact calculations
- **Travel Recommendations**: AI-powered destination suggestions

### Visualization Improvements

- **Interactive Charts**: Drill-down capabilities for detailed analysis
- **Export Features**: PDF/PNG report generation
- **Comparison Views**: Year-over-year trend analysis
- **Custom Date Ranges**: Flexible time period selection

### Performance Optimizations

- **Real-time Updates**: WebSocket integration for live statistics
- **Background Refresh**: Automatic cache warming
- **Advanced Caching**: Redis-based distributed caching
- **Query Optimization**: Materialized views for complex aggregations

This comprehensive analytics dashboard provides users with deep insights into their travel behavior while maintaining excellent performance and user experience standards.

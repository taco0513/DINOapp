# Gmail Integration Components Documentation

## Overview

The Gmail integration consists of two main React components that provide automated travel email analysis and management capabilities in the DINO application. These components work together to search, analyze, and display travel information extracted from Gmail emails.

## Component Architecture

```
GmailIntegration (Main Container)
├── GmailAnalyzer (Analysis Engine)
├── CalendarSync (Calendar Integration)
├── TravelStats (Statistics Display)
└── TravelInsights (AI Insights)
```

## Components

### 1. GmailIntegration Component

**Location**: `/components/gmail/GmailIntegration.tsx`  
**Type**: Client Component  
**Purpose**: Main container component that orchestrates Gmail functionality

#### Features

##### Connection Management

- **Connection Status Check**: Verifies Gmail API connectivity
- **Real-time Status**: Live connection status with visual indicators
- **Error Handling**: Graceful handling of connection failures
- **Rate Limit Monitoring**: Displays rate limiting information

##### Email Analysis

- **Batch Processing**: Analyze 10, 20, or 50 emails at once
- **Progress Tracking**: Real-time analysis progress indicators
- **Results Management**: Store and filter analysis results
- **Confidence Scoring**: Display confidence levels for extracted data

##### Multi-Tab Interface

- **Analysis Tab**: Display extracted travel information
- **Calendar Tab**: Google Calendar synchronization
- **Stats Tab**: Travel statistics and patterns
- **Insights Tab**: AI-generated travel insights

#### Props Interface

```typescript
interface GmailIntegrationProps {
  onDataUpdate?: (data: any) => void; // Optional callback for parent updates
}
```

#### State Management

```typescript
const [connectionStatus, setConnectionStatus] =
  useState<GmailConnectionStatus | null>(null);
const [travelEmails, setTravelEmails] = useState<TravelEmail[]>([]);
const [travelStats, setTravelStats] = useState<TravelStats | null>(null);
const [travelInsights, setTravelInsights] = useState<TravelInsight[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string>('');
const [activeTab, setActiveTab] = useState<
  'analysis' | 'calendar' | 'stats' | 'insights'
>('analysis');
```

#### Key Functions

##### `checkConnection()`

- **Purpose**: Verify Gmail API connection status
- **API Call**: `GET /api/gmail/check`
- **Returns**: Connection status and rate limiting information
- **Error Handling**: Sets error state on failure

##### `loadSchengenStatus()`

- **Purpose**: Load initial Schengen calculation data
- **Integration**: Connects with Schengen calculator
- **Callback**: Triggers `onDataUpdate` when data changes

##### `calculateDaysOnDate(date: string)`

- **Purpose**: Calculate Schengen status for specific dates
- **Logic**: Simple rolling window calculation
- **Returns**: Used days and remaining days

##### `handleFutureTripCalculation()`

- **Purpose**: Calculate impact of planned trips
- **Validation**: Checks for required date inputs
- **Returns**: Trip analysis with violation warnings

#### User Interface Elements

##### Connection Status Display

```typescript
<div className={`p-3 rounded-lg border ${
  connectionStatus.connected
    ? 'bg-green-50 border-green-200'
    : 'bg-red-50 border-red-200'
}`}>
```

##### Analysis Controls

- **Quick Analysis**: 10 emails for rapid testing
- **Standard Analysis**: 20 emails for typical use
- **Deep Analysis**: 50 emails for comprehensive review

##### Travel Email Cards

- **Email Metadata**: Subject, sender, confidence score
- **Travel Details**: Dates, destinations, flight numbers
- **Category Badges**: Airline, hotel, travel agency classification
- **Action Buttons**: Add to travel records

---

### 2. GmailAnalyzer Component

**Location**: `/components/gmail/GmailAnalyzer.tsx`  
**Type**: Client Component  
**Purpose**: Advanced email analysis engine with UI controls

#### Features

##### Advanced Analysis Configuration

- **Email Volume Control**: 20, 50, 100, or 200 emails
- **Time Range Filters**: Week, month, quarter, year, or all time
- **Confidence Thresholds**: 30%, 50%, 60%, or 80% minimum
- **Category Filters**: All, airline, hotel, or booking platform

##### Progressive Analysis

- **Multi-step Process**: Connection → Search → Analysis
- **Real-time Progress**: Step-by-step progress tracking
- **Statistics Display**: Emails processed, travel info found
- **Performance Metrics**: Processing speed and accuracy

##### Enhanced Results Display

- **Tabbed Interface**: Results list and detailed analysis
- **Visual Indicators**: Icons for different travel categories
- **Confidence Badges**: Color-coded confidence levels
- **Quality Metrics**: Data completeness statistics

#### Props Interface

```typescript
interface GmailAnalyzerProps {
  onAnalysisComplete: (travelInfos: TravelInfo[]) => void;
  onStatsUpdate: (stats: { emailsScanned: number }) => void;
}
```

#### State Management

```typescript
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
  currentStep: '',
  progress: 0,
  totalEmails: 0,
  processedEmails: 0,
  foundTravelEmails: 0,
});
const [travelInfos, setTravelInfos] = useState<TravelInfo[]>([]);
const [filteredTravelInfos, setFilteredTravelInfos] = useState<TravelInfo[]>(
  []
);
const [filters, setFilters] = useState<FilterOptions>({
  confidence: 0.6,
  maxResults: 50,
  dateRange: 'quarter',
  category: 'all',
});
```

#### Advanced Analysis Flow

##### Step 1: Connection Verification

```typescript
const checkResponse = await fetch('/api/gmail/check');
const checkData = await checkResponse.json();

if (!checkData.connected) {
  throw new Error('Gmail 연결이 필요합니다.');
}
```

##### Step 2: Multi-Query Search

```typescript
const queries = [
  'subject:(flight OR 항공 OR airline OR boarding)',
  'subject:(hotel OR 숙박 OR booking OR reservation)',
  'subject:(travel OR 여행 OR trip OR 예약)',
  'from:(booking.com OR agoda OR hotels.com OR koreanair OR asiana)',
];
```

##### Step 3: Batch Analysis

```typescript
const analyzeResponse = await fetch('/api/gmail/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messageIds: uniqueEmails.map(e => e.id),
    extractTravelInfo: true,
  }),
});
```

#### Filtering and Categorization

##### Category Detection

```typescript
const getCategoryFromEmail = (travelInfo: TravelInfo): string => {
  const subject = travelInfo.subject.toLowerCase();
  const from = (travelInfo.from || '').toLowerCase();

  if (subject.includes('hotel') || from.includes('booking')) return 'hotel';
  if (subject.includes('flight') || from.includes('airline')) return 'airline';
  return 'booking_platform';
};
```

##### Confidence Scoring

- **High (80%+)**: Complete travel information extracted
- **Medium (60-79%)**: Most important details found
- **Low (30-59%)**: Limited but useful information
- **Filtered (<30%)**: Insufficient confidence, excluded

#### User Interface Components

##### Analysis Configuration Panel

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <select value={filters.maxResults}>
    <option value={20}>20개</option>
    <option value={50}>50개</option>
    <option value={100}>100개</option>
    <option value={200}>200개</option>
  </select>
</div>
```

##### Progress Visualization

```typescript
<Progress value={analysisProgress.progress} className="w-full" />
<div className="grid grid-cols-3 gap-4 text-sm">
  <div className="text-center">
    <div className="font-medium">{analysisProgress.totalEmails}</div>
    <div className="text-muted-foreground">총 이메일</div>
  </div>
</div>
```

##### Results Summary Cards

```typescript
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div className="bg-blue-50 p-3 rounded-lg text-center">
    <div className="text-2xl font-bold text-blue-600">{filteredTravelInfos.length}</div>
    <div className="text-sm text-blue-800">총 여행정보</div>
  </div>
</div>
```

## Integration with Other Components

### CalendarSync Integration

```typescript
<CalendarSync
  travelInfos={travelEmails.map(email => ({
    ...email,
    extractedData: email.extractedData || {
      dates: [],
      airports: [],
      flights: [],
      bookingCodes: [],
      matchedPatterns: []
    }
  }))}
  onSyncComplete={(result) => {
    // Handle sync completion
  }}
/>
```

### Analytics Integration

```typescript
if (emails.length > 0) {
  const stats = generateTravelStats(emails);
  const insights = generateTravelInsights(stats, emails);
  setTravelStats(stats);
  setTravelInsights(insights);
}
```

## Data Types and Interfaces

### TravelEmail Interface

```typescript
interface TravelEmail {
  emailId: string;
  subject: string;
  from: string;
  departureDate?: string;
  returnDate?: string;
  destination?: string;
  departure?: string;
  flightNumber?: string;
  bookingReference?: string;
  hotelName?: string;
  passengerName?: string;
  category?:
    | 'airline'
    | 'hotel'
    | 'travel_agency'
    | 'rental'
    | 'booking_platform';
  confidence: number;
  extractedData?: {
    dates: string[];
    airports: string[];
    flights: string[];
    bookingCodes: string[];
    matchedPatterns: string[];
  };
}
```

### AnalysisProgress Interface

```typescript
interface AnalysisProgress {
  currentStep: string;
  progress: number;
  totalEmails: number;
  processedEmails: number;
  foundTravelEmails: number;
}
```

### FilterOptions Interface

```typescript
interface FilterOptions {
  confidence: number;
  maxResults: number;
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'all';
  category: 'all' | 'airline' | 'hotel' | 'booking_platform';
}
```

## Error Handling

### Network Errors

```typescript
try {
  const response = await fetch('/api/gmail/analyze');
  if (!response.ok) {
    throw new Error('Analysis failed');
  }
} catch (error) {
  setError(error instanceof Error ? error.message : 'Unknown error occurred');
}
```

### User Feedback

- **Loading States**: Spinner animations and progress bars
- **Error Messages**: Clear, actionable error descriptions
- **Success Feedback**: Confirmation messages and result counts
- **Empty States**: Helpful guidance when no results found

## Performance Optimizations

### Efficient State Updates

- **Batched Updates**: Group related state changes
- **Memoization**: Prevent unnecessary re-renders
- **Debounced Filters**: Delay filter application to reduce API calls

### API Optimization

- **Request Batching**: Process multiple emails in single API call
- **Response Caching**: Cache analysis results for session
- **Progressive Loading**: Load results as they become available

## Accessibility Features

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through controls
- **Keyboard Shortcuts**: Common shortcuts for power users
- **Focus Management**: Clear focus indicators

### Screen Reader Support

- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Descriptive labels for complex UI elements
- **Status Announcements**: Screen reader notifications for state changes

### Visual Accessibility

- **Color Contrast**: WCAG-compliant color combinations
- **Font Sizes**: Readable text at all screen sizes
- **Visual Indicators**: Icons and colors with text alternatives

## Testing Strategies

### Unit Testing

- **Component Rendering**: Verify correct component rendering
- **State Management**: Test state transitions and updates
- **Event Handling**: Verify user interaction handling

### Integration Testing

- **API Communication**: Test API endpoint integration
- **Component Interaction**: Verify parent-child communication
- **Error Scenarios**: Test error handling and recovery

### E2E Testing

- **User Workflows**: Complete analysis flow testing
- **Cross-browser Testing**: Ensure compatibility across browsers
- **Performance Testing**: Verify performance under load

## Usage Examples

### Basic Implementation

```tsx
import GmailIntegration from '@/components/gmail/GmailIntegration';

function GmailPage() {
  return (
    <div className='container mx-auto p-6'>
      <GmailIntegration
        onDataUpdate={data => {
          console.log('Gmail data updated:', data);
        }}
      />
    </div>
  );
}
```

### Advanced Configuration

```tsx
import GmailAnalyzer from '@/components/gmail/GmailAnalyzer';

function AdvancedAnalysisPage() {
  const handleAnalysisComplete = travelInfos => {
    // Process analysis results
    console.log(`Found ${travelInfos.length} travel records`);
  };

  const handleStatsUpdate = stats => {
    // Update statistics display
    console.log(`Scanned ${stats.emailsScanned} emails`);
  };

  return (
    <GmailAnalyzer
      onAnalysisComplete={handleAnalysisComplete}
      onStatsUpdate={handleStatsUpdate}
    />
  );
}
```

## Security Considerations

### Data Privacy

- **Local Processing**: Email content processed locally, not stored
- **Minimal Exposure**: Only necessary data exposed to UI
- **User Consent**: Clear privacy notices and consent flows

### API Security

- **Authentication**: Session-based authentication required
- **Rate Limiting**: Prevents abuse and overuse
- **Input Validation**: All inputs validated before processing

### Error Information

- **Sanitized Errors**: Error messages don't expose sensitive data
- **Logging**: Secure logging practices for debugging
- **Monitoring**: Track usage patterns for security analysis

## Browser Compatibility

### Supported Browsers

- **Chrome**: 90+ (Recommended)
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 90+

### Feature Degradation

- **Older Browsers**: Graceful degradation for unsupported features
- **Mobile Browsers**: Optimized mobile experience
- **Accessibility**: Screen reader compatibility across browsers

# Google Calendar Integration Documentation

## Overview

The Google Calendar Integration system enables seamless synchronization of travel information extracted from Gmail into Google Calendar events. This system provides automated event creation, duplicate prevention, and comprehensive progress tracking to ensure accurate travel schedule management.

## System Architecture

```
Calendar Integration System
├── Frontend Component
│   └── CalendarSync - Main synchronization interface
├── API Endpoints
│   ├── GET /api/calendar/calendars - List user calendars
│   ├── GET /api/calendar/check - Verify calendar access
│   └── POST /api/calendar/sync - Synchronize travel events
├── Backend Services
│   ├── Calendar Service - Google Calendar API integration
│   ├── Event Manager - Event creation and duplicate detection
│   └── Progress Tracker - Real-time sync progress
└── Data Models
    ├── TravelInfo - Input travel data
    ├── CalendarEvent - Google Calendar event structure
    └── SyncResult - Synchronization outcome
```

## Component Architecture

### CalendarSync Component

**Location**: `/components/calendar/CalendarSync.tsx`  
**Purpose**: Comprehensive interface for Google Calendar synchronization with travel data

#### Features Overview

##### Multi-Tab Interface

- **Setup Tab**: Calendar selection, sync options, and travel info selection
- **Preview Tab**: Visual preview of events to be created
- **Progress Tracking**: Real-time synchronization progress with detailed steps
- **Result Display**: Comprehensive sync results with success/error reporting

##### Advanced Synchronization Options

- **Duplicate Prevention**: Intelligent detection and skipping of existing events
- **Selective Sync**: Choose specific travel information to synchronize
- **Calendar Selection**: Target specific Google Calendar for event creation
- **Progress Monitoring**: Step-by-step progress tracking with visual indicators

#### Props Interface

```typescript
interface CalendarSyncProps {
  travelInfos: TravelInfo[]; // Travel data from Gmail analysis
  onSyncComplete?: (result: SyncResult) => void; // Optional completion callback
}
```

#### State Management

```typescript
// Calendar management
const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
const [selectedCalendarId, setSelectedCalendarId] = useState<string>('');

// Travel information selection
const [selectedTravelInfos, setSelectedTravelInfos] = useState<string[]>([]);

// Synchronization options
const [preventDuplicates, setPreventDuplicates] = useState(true);
const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

// Process state
const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);
const [isSyncing, setIsSyncing] = useState(false);
const [syncProgress, setSyncProgress] = useState<SyncProgress>({
  currentStep: '',
  progress: 0,
  processedCount: 0,
  totalCount: 0,
});

// Results and errors
const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
const [error, setError] = useState<string>('');
const [activeView, setActiveView] = useState<'setup' | 'preview'>('setup');
```

#### Key Functions

##### `loadCalendars()`

**Purpose**: Retrieve user's Google Calendar list
**Features**:

- Fetches all accessible calendars from Google Calendar API
- Automatically selects primary calendar as default
- Handles authentication and permission errors
- Updates calendar dropdown options

```typescript
const loadCalendars = async () => {
  try {
    const response = await fetch('/api/calendar/calendars');
    const data = await response.json();

    if (data.success && data.calendars) {
      setCalendars(data.calendars);

      // Auto-select primary calendar
      const primaryCalendar = data.calendars.find(cal => cal.primary);
      if (primaryCalendar) {
        setSelectedCalendarId(primaryCalendar.id);
      }
    }
  } catch (err) {
    setError('Failed to load calendars');
  }
};
```

##### `syncToCalendar()`

**Purpose**: Main synchronization orchestrator
**Features**:

- Multi-step progress tracking
- Batch processing of travel information
- Error handling and recovery
- Result aggregation and reporting

**Synchronization Steps**:

1. **Validation** (10%): Verify calendar selection and travel info
2. **Duplicate Check** (30%): Check for existing events to prevent duplicates
3. **Event Creation** (70%): Create calendar events from travel information
4. **Completion** (100%): Aggregate results and notify completion

```typescript
const syncToCalendar = async () => {
  try {
    setIsSyncing(true);

    // Step 1: Duplicate check
    setSyncProgress({
      currentStep: '중복 이벤트 확인 중...',
      progress: 10,
      processedCount: 0,
      totalCount: infoToSync.length,
    });

    // Step 2: Event creation
    setSyncProgress(prev => ({
      ...prev,
      currentStep: 'Calendar 이벤트 생성 중...',
      progress: 30,
    }));

    const response = await fetch('/api/calendar/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calendarId: selectedCalendarId,
        travelInfos: infoToSync,
        preventDuplicates,
      }),
    });

    // Step 3: Process results
    const result = await response.json();
    setSyncResult(result);
  } catch (err) {
    setError('Synchronization failed');
  } finally {
    setIsSyncing(false);
  }
};
```

##### `toggleTravelInfo()` & `toggleSelectAll()`

**Purpose**: Manage travel information selection
**Features**:

- Individual item selection/deselection
- Bulk select/deselect all items
- Auto-selection of high-confidence items (≥50%)
- Visual feedback for selected items

##### `getConfidenceBadge()`

**Purpose**: Visual confidence level indicators
**Logic**:

- **High (≥80%)**: Green badge - Reliable information
- **Medium (60-79%)**: Yellow badge - Good information with minor gaps
- **Low (<60%)**: Red badge - Uncertain information requiring review

#### User Interface Components

##### Setup Tab Features

**Calendar Selection Interface**:

```typescript
<select
  value={selectedCalendarId}
  onChange={(e) => setSelectedCalendarId(e.target.value)}
>
  <option value="">캘린더를 선택해주세요</option>
  {calendars.map((calendar) => (
    <option key={calendar.id} value={calendar.id}>
      {calendar.name} {calendar.primary && '(기본)'}
    </option>
  ))}
</select>
```

**Travel Information Selection Grid**:

- Checkbox-based selection interface
- Confidence badges for each travel item
- Compact display of key travel details (dates, destinations, hotels)
- Click-to-toggle selection with visual feedback

**Synchronization Options**:

- Duplicate prevention toggle
- Advanced options expandable section
- Selection counter and bulk actions

##### Preview Tab Features

**Event Preview Cards**:

- Visual representation of calendar events to be created
- Color-coded event types (departure, return, hotel)
- Timeline view of travel itinerary
- Event details with icons and formatting

```typescript
// Event preview structure
{info.departureDate && (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
    <Plane className="h-4 w-4" />
    <span>{info.destination} 출발 - {info.departureDate}</span>
  </div>
)}
```

##### Progress Tracking Interface

**Multi-Stage Progress Bar**:

- Animated progress indicator
- Current step description
- Percentage completion
- Processed/total item counter

**Real-time Status Updates**:

- Step-by-step progress descriptions
- Visual loading indicators
- Error state handling
- Success confirmation

#### Auto-Selection Logic

The component implements intelligent auto-selection based on confidence scores:

```typescript
useEffect(() => {
  if (travelInfos.length > 0 && selectedTravelInfos.length === 0) {
    const highConfidenceInfos = travelInfos
      .filter(info => info.confidence >= 0.5) // 50% minimum threshold
      .map(info => info.emailId);
    setSelectedTravelInfos(highConfidenceInfos);
  }
}, [travelInfos]);
```

**Selection Criteria**:

- **Automatic**: Travel info with ≥50% confidence
- **Manual Override**: User can modify selection at any time
- **Visual Indication**: Selected items highlighted with blue border
- **Bulk Actions**: Select all / deselect all functionality

## API Integration

### GET /api/calendar/calendars

**Purpose**: Retrieve user's accessible Google Calendars
**Authentication**: Required (Google OAuth with calendar scope)
**Rate Limiting**: Standard API limits apply

#### Response Structure

```typescript
{
  success: boolean,
  calendars: Array<{
    id: string,              // Unique calendar identifier
    name: string,            // Display name
    description?: string,    // Optional description
    primary: boolean,        // Whether this is the user's primary calendar
    accessRole: string,      // User's access level (owner, writer, reader)
    backgroundColor?: string, // Calendar color
    foregroundColor?: string  // Text color
  }>
}
```

#### Integration Logic

```typescript
// Auto-select primary calendar on load
const primaryCalendar = data.calendars.find(cal => cal.primary);
if (primaryCalendar) {
  setSelectedCalendarId(primaryCalendar.id);
}
```

---

### POST /api/calendar/sync

**Purpose**: Synchronize travel information to Google Calendar events
**Authentication**: Required (Google OAuth with calendar write access)
**Security**: CSRF protection enabled

#### Request Body Schema

```typescript
{
  calendarId: string,           // Target calendar ID
  travelInfos: TravelInfo[],    // Array of travel information to sync
  preventDuplicates?: boolean   // Whether to check for existing events (default: true)
}
```

#### Duplicate Prevention Logic

When `preventDuplicates` is enabled, the system performs intelligent duplicate detection:

```typescript
if (preventDuplicates) {
  const duplicateChecks = await Promise.all(
    travelInfos.map(async travelInfo => {
      const existingEvents = await findExistingTravelEvents(
        accessToken,
        calendarId,
        travelInfo.emailId
      );
      return {
        travelInfo,
        hasDuplicates: existingEvents.length > 0,
      };
    })
  );

  // Filter out duplicates
  filteredTravelInfos = duplicateChecks
    .filter(check => !check.hasDuplicates)
    .map(check => check.travelInfo);
}
```

**Duplicate Detection Criteria**:

- Events with same email ID reference in description
- Events with identical titles and dates
- Events within same date range with similar content

#### Response Structure

```typescript
{
  success: boolean,         // Overall operation success
  created: number,          // Number of events successfully created
  skipped: number,          // Number of duplicates skipped
  errors: string[],         // Array of error messages
  eventIds: string[],       // IDs of created calendar events
  message: string           // Human-readable result summary
}
```

#### Error Handling

- **400 Bad Request**: Missing required fields or invalid data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient calendar permissions
- **500 Internal Server Error**: Google Calendar API errors

## Data Models

### TravelInfo Input Model

Input data structure from Gmail analysis:

```typescript
interface TravelInfo {
  emailId: string; // Unique email identifier
  subject: string; // Email subject line
  from: string; // Email sender
  departureDate?: string; // ISO date string for departure
  returnDate?: string; // ISO date string for return
  destination?: string; // Destination location
  departure?: string; // Departure location
  flightNumber?: string; // Flight number if available
  bookingReference?: string; // Booking confirmation code
  hotelName?: string; // Hotel name if available
  passengerName?: string; // Passenger name
  confidence: number; // Confidence score (0-1)
  extractedData?: {
    dates: string[];
    airports: string[];
    flights: string[];
    bookingCodes: string[];
    matchedPatterns: string[];
  };
}
```

### CalendarInfo Model

Google Calendar metadata:

```typescript
interface CalendarInfo {
  id: string; // Google Calendar ID
  name: string; // Calendar display name
  description?: string; // Calendar description
  primary: boolean; // Is user's primary calendar
  accessRole: string; // User's permission level
  backgroundColor?: string; // Calendar color theme
  foregroundColor?: string; // Text color theme
}
```

### SyncResult Model

Synchronization outcome data:

```typescript
interface SyncResult {
  success: boolean; // Overall operation success
  created: number; // Events successfully created
  skipped: number; // Events skipped (duplicates)
  errors: string[]; // Error messages
  eventIds: string[]; // Created event IDs
  message: string; // Summary message
}
```

### SyncProgress Model

Real-time progress tracking:

```typescript
interface SyncProgress {
  currentStep: string; // Current operation description
  progress: number; // Completion percentage (0-100)
  processedCount: number; // Items processed so far
  totalCount: number; // Total items to process
}
```

## Event Creation Logic

### Travel Event Types

The system creates different types of calendar events based on available travel information:

#### 1. Flight Events

```typescript
// Departure flight
{
  summary: `✈️ ${destination} 출발`,
  description: `항공편: ${flightNumber}\n예약번호: ${bookingReference}\n이메일: ${subject}`,
  start: { date: departureDate },
  end: { date: departureDate },
  location: departure
}

// Return flight
{
  summary: `🏠 ${departure} 귀국`,
  description: `항공편: ${flightNumber}\n예약번호: ${bookingReference}`,
  start: { date: returnDate },
  end: { date: returnDate },
  location: destination
}
```

#### 2. Hotel Events

```typescript
{
  summary: `🏨 ${hotelName}`,
  description: `체크인/체크아웃\n예약번호: ${bookingReference}`,
  start: { date: departureDate },
  end: { date: returnDate },
  location: destination
}
```

#### 3. Trip Duration Events

```typescript
{
  summary: `🌍 ${destination} 여행`,
  description: `여행 기간\n출발: ${departure}\n목적지: ${destination}`,
  start: { date: departureDate },
  end: { date: returnDate }
}
```

### Event Metadata

All created events include standardized metadata for tracking and duplicate prevention:

```typescript
{
  // Standard Google Calendar fields
  summary: string,
  description: string,
  start: { date: string },
  end: { date: string },
  location?: string,

  // DINO-specific metadata
  extendedProperties: {
    shared: {
      'dino-source': 'gmail-analysis',
      'dino-email-id': emailId,
      'dino-confidence': confidence.toString(),
      'dino-created-at': new Date().toISOString()
    }
  }
}
```

## Security & Privacy

### Authentication & Authorization

**Google OAuth Scopes Required**:

- `https://www.googleapis.com/auth/calendar` - Full calendar access
- `https://www.googleapis.com/auth/calendar.events` - Event management
- `https://www.googleapis.com/auth/userinfo.email` - User identification

**Security Measures**:

1. **CSRF Protection**: Double-submit tokens for sync operations
2. **Session Validation**: Valid user session required for all operations
3. **Rate Limiting**: Prevents abuse of Google Calendar API
4. **Input Sanitization**: All travel information sanitized before processing

### Data Privacy

**Privacy Protections**:

- **Local Processing**: Travel analysis performed locally
- **Minimal Data**: Only necessary information sent to Google Calendar
- **User Control**: Users select which information to synchronize
- **Transparency**: Clear indication of what data will be shared

**Data Retention**:

- **No Server Storage**: Travel information not permanently stored
- **Session-Only**: Data exists only during user session
- **User Deletion**: Users can delete calendar events at any time

## Error Handling & Recovery

### Common Error Scenarios

#### 1. Authentication Errors

```typescript
// Token expired or invalid
{
  error: 'Authentication required',
  message: 'Please sign in again to continue',
  action: 'redirect_to_login'
}
```

#### 2. Permission Errors

```typescript
// Insufficient calendar permissions
{
  error: 'Insufficient permissions',
  message: 'Calendar write access required',
  action: 'request_permissions'
}
```

#### 3. API Quota Errors

```typescript
// Google Calendar API limits exceeded
{
  error: 'Rate limit exceeded',
  message: 'Too many requests. Please try again later.',
  retryAfter: 3600
}
```

#### 4. Network Errors

```typescript
// Network connectivity issues
{
  error: 'Network error',
  message: 'Unable to connect to Google Calendar',
  action: 'retry'
}
```

### Recovery Strategies

**Automatic Recovery**:

- **Exponential Backoff**: Automatic retry with increasing delays
- **Partial Success Handling**: Process successful events, report failures
- **Session Recovery**: Automatic token refresh when possible

**User-Guided Recovery**:

- **Clear Error Messages**: Actionable error descriptions
- **Retry Options**: Manual retry buttons for transient failures
- **Alternative Actions**: Fallback options when automatic recovery fails

## Performance Optimization

### Batch Processing

**Event Creation Batching**:

```typescript
// Process events in batches to avoid rate limits
const batchSize = 10;
for (let i = 0; i < travelInfos.length; i += batchSize) {
  const batch = travelInfos.slice(i, i + batchSize);
  await processBatch(batch);

  // Update progress
  setSyncProgress(prev => ({
    ...prev,
    processedCount: Math.min(i + batchSize, travelInfos.length),
    progress: Math.round(((i + batchSize) / travelInfos.length) * 100),
  }));
}
```

### Caching Strategy

**Calendar List Caching**:

- Cache calendar list for 5 minutes
- Refresh on user request or permission changes
- Reduce API calls for repeated access

**Duplicate Detection Optimization**:

- Batch duplicate checks where possible
- Cache results during session
- Use efficient search queries

### Progress Tracking Optimization

**Real-time Updates**:

- Granular progress reporting (every 10% or significant step)
- Non-blocking UI updates
- Smooth progress bar animations

## Testing Strategy

### Unit Testing

```typescript
describe('CalendarSync Component', () => {
  it('should auto-select high confidence travel info', () => {
    const travelInfos = [
      { emailId: '1', confidence: 0.8 },
      { emailId: '2', confidence: 0.3 },
      { emailId: '3', confidence: 0.6 }
    ]

    render(<CalendarSync travelInfos={travelInfos} />)

    // Should auto-select items with confidence >= 0.5
    expect(getSelectedItems()).toEqual(['1', '3'])
  })

  it('should handle sync errors gracefully', async () => {
    mockCalendarAPI.mockRejectedValue(new Error('API Error'))

    const component = render(<CalendarSync travelInfos={mockData} />)

    await userEvent.click(component.getByText('동기화'))

    expect(component.getByText('API Error')).toBeInTheDocument()
  })
})
```

### Integration Testing

```typescript
describe('Calendar Sync API', () => {
  it('should create calendar events successfully', async () => {
    const travelData = [
      {
        emailId: 'test-123',
        departureDate: '2024-01-01',
        destination: 'Paris',
        confidence: 0.9,
      },
    ];

    const response = await request(app)
      .post('/api/calendar/sync')
      .send({
        calendarId: 'test-calendar',
        travelInfos: travelData,
        preventDuplicates: true,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.created).toBe(1);
  });
});
```

### E2E Testing

```typescript
test('Calendar sync workflow', async ({ page }) => {
  // Setup
  await page.goto('/gmail');
  await page.click('[data-testid="analyze-emails"]');
  await page.waitForText('Analysis complete');

  // Navigate to calendar sync
  await page.click('[data-testid="calendar-tab"]');

  // Select calendar
  await page.selectOption(
    '[data-testid="calendar-select"]',
    'primary-calendar'
  );

  // Select travel info
  await page.check('[data-testid="travel-info-1"]');
  await page.check('[data-testid="travel-info-2"]');

  // Start sync
  await page.click('[data-testid="sync-button"]');

  // Wait for completion
  await page.waitForText('동기화 완료!');

  // Verify results
  await expect(page.locator('[data-testid="sync-result"]')).toContainText(
    '2개의 여행 일정이 캘린더에 추가'
  );
});
```

## Best Practices

### User Experience Guidelines

1. **Progressive Disclosure**: Show basic options first, advanced options on demand
2. **Clear Feedback**: Provide immediate feedback for all user actions
3. **Error Prevention**: Validate input and provide helpful guidance
4. **Recovery Options**: Always provide ways to retry or correct errors

### Performance Guidelines

1. **Lazy Loading**: Load calendars only when needed
2. **Debounced Actions**: Prevent rapid-fire API calls
3. **Efficient Updates**: Batch state updates where possible
4. **Memory Management**: Clean up event listeners and timeouts

### Security Guidelines

1. **Input Validation**: Validate all user inputs before processing
2. **Permission Checks**: Verify calendar access before attempting operations
3. **Error Sanitization**: Don't expose sensitive information in error messages
4. **Audit Logging**: Log significant actions for security monitoring

This comprehensive calendar integration system provides seamless synchronization between Gmail-extracted travel information and Google Calendar, ensuring users maintain accurate and up-to-date travel schedules.

# Trip Management System Documentation

## Overview

The Trip Management system is the core functionality of the DINO application, providing comprehensive travel record management, Schengen compliance tracking, and visa monitoring capabilities. This system consists of React components for user interface and robust API endpoints for data management.

## System Architecture

```
Trip Management System
├── Frontend Components
│   ├── TripCard - Individual trip display
│   ├── WireframeTripForm - Trip creation/editing
│   └── TripList - Trip collection management
├── API Endpoints
│   ├── GET /api/trips - Retrieve user trips
│   ├── POST /api/trips - Create new trip
│   ├── PUT /api/trips - Update existing trip
│   └── DELETE /api/trips - Remove trip
└── Data Models
    ├── CountryVisit - Core trip entity
    ├── Country - Country metadata
    └── VisaType - Visa classification
```

## Frontend Components

### TripCard Component

**Location**: `/components/trips/TripCard.tsx`  
**Purpose**: Displays individual trip information with management controls

#### Features

##### Trip Information Display

- **Country Information**: Flag, name, and Schengen status indicator
- **Date Management**: Entry date, exit date, or "currently staying" status
- **Duration Tracking**: Visual progress bar with color-coded warnings
- **Visa Information**: Visa type and maximum stay duration
- **Notes Display**: Optional trip notes and additional information

##### Interactive Controls

- **Edit Button**: Opens trip for modification
- **Delete Button**: Two-step confirmation deletion process
- **Progress Visualization**: Real-time progress bar updates
- **Status Indicators**: Visual warnings for overstay situations

#### Props Interface

```typescript
interface TripCardProps {
  trip: CountryVisit; // Trip data object
  onEdit: (trip: CountryVisit) => void; // Edit callback
  onDelete: () => void; // Delete callback
}
```

#### State Management

```typescript
const [loading, setLoading] = useState(false);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
```

#### Key Functions

##### `calculateDays()`

- **Purpose**: Calculate total stay duration
- **Logic**: Handles both completed trips and ongoing stays
- **Returns**: Number of days stayed

```typescript
const calculateDays = () => {
  if (exitDate) {
    return Math.ceil(
      (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  } else {
    // Currently staying
    return Math.ceil(
      (new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
};
```

##### `handleDelete()`

- **Purpose**: Two-step trip deletion with confirmation
- **Security**: API call with error handling
- **UX**: Loading states and confirmation flow

##### `formatDate()`

- **Purpose**: Localized date formatting
- **Locale**: Korean locale (`ko-KR`)
- **Format**: Full date with year, month, and day

#### Visual Design Elements

##### Progress Bar Logic

```typescript
<div
  className={`h-2 rounded-full transition-all ${
    days > trip.maxDays
      ? 'bg-red-500'          // Overstay
      : days > trip.maxDays * 0.8
        ? 'bg-yellow-500'     // Warning (80%+ used)
        : 'bg-green-500'      // Safe
  }`}
  style={{ width: `${Math.min((days / trip.maxDays) * 100, 100)}%` }}
/>
```

##### Status Badges

- **Schengen Indicator**: Blue badge for Schengen countries
- **Currently Staying**: Green badge for ongoing trips
- **Overstay Warning**: Red warning text for exceeded limits

---

### WireframeTripForm Component

**Location**: `/components/WireframeTripForm.tsx`  
**Purpose**: Modal form for trip creation and editing with wireframe styling

#### Features

##### Form Fields

- **Country**: Text input for destination country
- **Entry Date**: Date picker for arrival date
- **Exit Date**: Optional date picker for departure (empty for ongoing trips)
- **Visa Type**: Dropdown with predefined visa categories
- **Purpose**: Text input for trip purpose/notes

##### Form Validation

- **Required Fields**: Country and entry date are mandatory
- **Date Validation**: Entry date must be valid, exit date must be after entry
- **Visa Types**: Predefined options to ensure consistency

#### Props Interface

```typescript
interface WireframeTripFormProps {
  trip?: CountryVisit; // Optional trip for editing
  onSuccess: () => void; // Success callback
  onCancel: () => void; // Cancel callback
}
```

#### State Management

```typescript
const [formData, setFormData] = useState({
  country: trip?.country || '',
  entryDate: trip?.entryDate || '',
  exitDate: trip?.exitDate || '',
  visaType: trip?.visaType || '',
  purpose: trip?.purpose || '',
});
```

#### Form Submission Logic

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    if (trip) {
      await ApiClient.updateTrip(trip.id!, formData);
    } else {
      await ApiClient.createTrip(formData);
    }
    onSuccess();
  } catch (error) {
    // Error handling
  }
};
```

#### Visa Type Options

- **schengen**: 셰겐 관광
- **tourist**: 관광
- **business**: 비즈니스
- **transit**: 경유
- **visa-free**: 비자면제

#### Wireframe Styling

The component uses inline styles to maintain a consistent wireframe aesthetic:

- **Modal Overlay**: Semi-transparent black background
- **Form Container**: White background with simple borders
- **Input Styling**: Minimal borders and padding
- **Button Design**: Basic black/white contrast

## API Endpoints

### GET /api/trips

**Purpose**: Retrieve all trips for authenticated user  
**Authentication**: Required (Session-based)  
**Rate Limiting**: General rate limits applied

#### Request Parameters

None (user identified through session)

#### Response Format

```typescript
{
  success: boolean,
  trips: CountryVisit[]
}
```

#### Security Features

- **Authentication Check**: Valid session required
- **Rate Limiting**: Prevents abuse
- **Optimized Queries**: Uses database query optimization
- **User Isolation**: Only returns trips for authenticated user

#### Implementation Details

```typescript
// Use optimized query with caching
const trips = await getUserTripsOptimized(user.id, {
  limit: 100, // Default 100 trips limit
  includeActive: undefined, // Include all trips
});
```

---

### POST /api/trips

**Purpose**: Create new trip record  
**Authentication**: Required  
**Security**: CSRF protection, input sanitization, rate limiting

#### Request Body Schema

```typescript
{
  country: string,          // Required, minimum 1 character
  entryDate: string,        // Required, valid date format
  exitDate?: string | null, // Optional, can be null for ongoing trips
  visaType: VisaType,       // Enum of valid visa types
  maxDays: number,          // 1-365 range
  passportCountry: PassportCountry, // Enum of passport countries
  notes?: string            // Optional notes
}
```

#### Validation Schema (Zod)

```typescript
const createTripSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  entryDate: z
    .string()
    .refine(date => !isNaN(Date.parse(date)), 'Invalid entry date'),
  exitDate: z.string().optional().nullable(),
  visaType: z.enum([
    'Tourist',
    'Business',
    'Student',
    'Working Holiday',
    'Digital Nomad',
    'Transit',
    'Work',
    'Investor',
    'Retirement',
    'Volunteer',
    'Visa Run',
    'Extension',
    'Spouse',
    'Medical',
  ]),
  maxDays: z.number().min(1).max(365),
  passportCountry: z.enum(['US', 'UK', 'EU', 'CA', 'AU', 'JP', 'OTHER']),
  notes: z.string().optional(),
});
```

#### Security Measures

1. **Rate Limiting**: Stricter limits for mutation operations
2. **CSRF Protection**: Double-submit token required
3. **Input Sanitization**: All text fields sanitized
4. **Authentication**: Valid session required
5. **Authorization**: User can only create trips for themselves

#### Response Format

```typescript
{
  success: boolean,
  trip: CountryVisit,
  message: string
}
```

---

### PUT /api/trips

**Purpose**: Update existing trip record  
**Authentication**: Required  
**Authorization**: User can only update their own trips

#### Request Body

Same schema as POST with additional `id` field for trip identification

#### Ownership Verification

```typescript
// Verify user owns the trip before updating
const existingTrip = await prisma.countryVisit.findFirst({
  where: {
    id: sanitizedBody.id,
    userId: user.id,
  },
});

if (!existingTrip) {
  return createErrorResponse(ErrorCode.NOT_FOUND, 'Trip not found');
}
```

#### Update Logic

- **Selective Updates**: Only provided fields are updated
- **Timestamp Management**: `updatedAt` automatically set
- **Data Validation**: Full validation applied to updates
- **Atomic Operations**: Database transaction ensures consistency

---

### DELETE /api/trips

**Purpose**: Remove trip record  
**Authentication**: Required  
**Authorization**: User can only delete their own trips

#### Request Parameters

- **Query Parameter**: `id` - Trip ID to delete

#### Security Features

- **Ownership Verification**: Ensures user owns the trip
- **Soft Delete**: Could be implemented for data recovery
- **Audit Trail**: Could log deletion for compliance

#### Implementation

```typescript
// Verify ownership before deletion
const existingTrip = await prisma.countryVisit.findFirst({
  where: {
    id: tripId,
    userId: user.id,
  },
});

if (!existingTrip) {
  return createErrorResponse(ErrorCode.NOT_FOUND, 'Trip not found');
}

await prisma.countryVisit.delete({
  where: { id: tripId },
});
```

## Data Models

### CountryVisit Model

The core entity representing a single trip or stay in a country.

```typescript
interface CountryVisit {
  id: string; // Unique identifier
  userId: string; // Owner user ID
  country: string; // Destination country name
  entryDate: string; // ISO date string for entry
  exitDate?: string | null; // ISO date string for exit (null if ongoing)
  visaType: VisaType; // Type of visa used
  maxDays: number; // Maximum allowed stay duration
  passportCountry: PassportCountry; // User's passport country
  notes?: string; // Optional trip notes
  createdAt: Date; // Record creation timestamp
  updatedAt: Date; // Last modification timestamp
}
```

### Country Metadata

Information about countries and their visa requirements.

```typescript
interface Country {
  name: string; // Country name
  code: string; // ISO country code
  flag: string; // Emoji flag representation
  isSchengen: boolean; // Whether country is in Schengen area
  visaRequirements: {
    // Visa requirements by passport
    [passportCountry: string]: {
      required: boolean;
      maxStayDays: number;
      visaTypes: VisaType[];
    };
  };
}
```

### Visa Types

Standardized visa classifications for consistency.

```typescript
type VisaType =
  | 'Tourist'
  | 'Business'
  | 'Student'
  | 'Working Holiday'
  | 'Digital Nomad'
  | 'Transit'
  | 'Work'
  | 'Investor'
  | 'Retirement'
  | 'Volunteer'
  | 'Visa Run'
  | 'Extension'
  | 'Spouse'
  | 'Medical';
```

## Integration with Other Systems

### Schengen Calculator Integration

Trip records are automatically analyzed for Schengen compliance:

```typescript
// Calculate Schengen usage based on trips
function calculateSchengenUsage(trips: CountryVisit[]): SchengenStatus {
  const schengenTrips = trips.filter(
    trip => getCountryByName(trip.country)?.isSchengen
  );

  // Implement 90/180 rule calculation
  return {
    usedDays: calculateUsedDays(schengenTrips),
    remainingDays: 90 - calculateUsedDays(schengenTrips),
    isCompliant: calculateUsedDays(schengenTrips) <= 90,
  };
}
```

### Gmail Integration

Trips can be automatically suggested from Gmail analysis:

```typescript
// Convert Gmail analysis to trip suggestion
function emailToTripSuggestion(travelInfo: TravelInfo): Partial<CountryVisit> {
  return {
    country: travelInfo.destination || '',
    entryDate: travelInfo.departureDate || '',
    exitDate: travelInfo.returnDate || null,
    visaType: 'Tourist', // Default, user can modify
    notes: `From email: ${travelInfo.subject}`,
  };
}
```

### Calendar Integration

Trips can be synchronized with Google Calendar:

```typescript
// Create calendar event from trip
function tripToCalendarEvent(trip: CountryVisit): CalendarEvent {
  return {
    summary: `Trip to ${trip.country}`,
    start: { date: trip.entryDate },
    end: { date: trip.exitDate || trip.entryDate },
    description: `Visa: ${trip.visaType}\nNotes: ${trip.notes || 'None'}`,
  };
}
```

## Error Handling

### API Error Responses

All endpoints use standardized error responses:

```typescript
{
  error: string,           // Error code
  message: string,         // Human-readable message
  requestId: string,       // Unique request identifier
  timestamp: string,       // ISO timestamp
  details?: any           // Additional error context
}
```

### Common Error Scenarios

1. **Validation Errors**: Invalid input data
2. **Authentication Errors**: Missing or invalid session
3. **Authorization Errors**: User doesn't own requested trip
4. **Not Found Errors**: Trip doesn't exist
5. **Rate Limit Errors**: Too many requests
6. **Database Errors**: Server-side database issues

### Frontend Error Handling

Components handle errors gracefully:

```typescript
try {
  await ApiClient.deleteTrip(trip.id);
  onDelete(); // Success callback
} catch (error) {
  setError(error.message);
  // Show user-friendly error message
}
```

## Performance Optimization

### Database Optimization

1. **Query Optimization**: Uses `getUserTripsOptimized` for efficient queries
2. **Indexing**: Database indexes on user_id and date fields
3. **Caching**: 5-minute TTL caching for trip data
4. **Pagination**: Limits results to prevent large data transfers

### Frontend Optimization

1. **Memoization**: React.memo for trip cards to prevent unnecessary re-renders
2. **Lazy Loading**: Load additional trips on demand
3. **Optimistic Updates**: Update UI immediately, rollback on error
4. **Virtual Scrolling**: For large trip lists

## Security Considerations

### Data Protection

1. **User Isolation**: Users can only access their own trips
2. **Input Sanitization**: All user inputs sanitized before storage
3. **SQL Injection Prevention**: Prisma ORM prevents SQL injection
4. **XSS Prevention**: Output encoding for user content

### Authentication & Authorization

1. **Session-Based Auth**: NextAuth.js session management
2. **CSRF Protection**: Double-submit tokens for mutations
3. **Rate Limiting**: Prevents abuse and DoS attacks
4. **Request ID Tracking**: Unique IDs for audit trails

### Privacy Compliance

1. **GDPR Compliance**: User data can be exported and deleted
2. **Data Minimization**: Only necessary data collected
3. **Audit Logging**: Track data access and modifications
4. **Encryption**: Sensitive data encrypted at rest

## Testing Strategy

### Unit Testing

```typescript
describe('TripCard', () => {
  it('should calculate days correctly for completed trip', () => {
    const trip = {
      entryDate: '2024-01-01',
      exitDate: '2024-01-10',
      // ... other fields
    }

    const component = render(<TripCard trip={trip} />)
    expect(component.getByText('9일')).toBeInTheDocument()
  })

  it('should show currently staying for ongoing trip', () => {
    const trip = {
      entryDate: '2024-01-01',
      exitDate: null,
      // ... other fields
    }

    const component = render(<TripCard trip={trip} />)
    expect(component.getByText('현재 체류 중')).toBeInTheDocument()
  })
})
```

### Integration Testing

```typescript
describe('Trip API', () => {
  it('should create trip successfully', async () => {
    const tripData = {
      country: 'Germany',
      entryDate: '2024-01-01',
      visaType: 'Tourist',
      maxDays: 90,
      passportCountry: 'US',
    };

    const response = await request(app)
      .post('/api/trips')
      .send(tripData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.trip.country).toBe('Germany');
  });
});
```

### E2E Testing

```typescript
test('Trip management workflow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.click('[data-testid="login-button"]');

  // Create trip
  await page.goto('/trips');
  await page.click('[data-testid="add-trip-button"]');
  await page.fill('[data-testid="country-input"]', 'France');
  await page.fill('[data-testid="entry-date"]', '2024-01-01');
  await page.click('[data-testid="submit-trip"]');

  // Verify trip appears
  await expect(page.locator('[data-testid="trip-card"]')).toContainText(
    'France'
  );
});
```

## Deployment Considerations

### Environment Configuration

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dino

# Authentication
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-domain.com

# Rate Limiting
RATE_LIMIT_GENERAL=60
RATE_LIMIT_MUTATION=10

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Production Optimizations

1. **Database Connection Pooling**: Optimize connection usage
2. **CDN Integration**: Cache static assets
3. **Compression**: Enable gzip compression
4. **Health Checks**: Monitor API endpoint health
5. **Error Monitoring**: Real-time error tracking

This comprehensive trip management system provides the foundation for accurate travel tracking and Schengen compliance monitoring in the DINO application.

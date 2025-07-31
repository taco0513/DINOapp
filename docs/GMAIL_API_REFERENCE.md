# Gmail API Reference

## Overview

The Gmail API integration in DINO provides automated travel email analysis and extraction capabilities. The API consists of three main endpoints that handle Gmail connection verification, email searching, and travel information extraction.

## Base URL

```
https://your-dino-app.com/api/gmail
```

## Authentication

All Gmail API endpoints require user authentication via NextAuth.js session. The user must have granted Gmail read permissions through Google OAuth.

**Required Scopes:**

- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/userinfo.email`

## Rate Limiting

- **Global Limit**: Managed by `gmail-middleware.ts`
- **User-specific Limits**: Applied per user session
- **Analysis Endpoint**: Maximum 50 emails per request
- **Search Endpoint**: Maximum 100 emails per request

## Endpoints

### 1. Check Gmail Connection

**Endpoint**: `GET /api/gmail/check`

**Description**: Verifies the Gmail connection status and returns rate limiting information.

**Authentication**: Required (Session)

**Request Parameters**: None

**Response**:

```typescript
{
  connected: boolean,
  message: string,
  rateLimitStatus: {
    userId: string,
    requestCount: number,
    windowStart: number,
    limit: number,
    remaining: number
  }
}
```

**Response Examples**:

_Success (Connected)_:

```json
{
  "connected": true,
  "message": "Gmail 연결이 정상입니다.",
  "rateLimitStatus": {
    "userId": "user123",
    "requestCount": 5,
    "windowStart": 1704067200000,
    "limit": 100,
    "remaining": 95
  }
}
```

_Error (Not Connected)_:

```json
{
  "connected": false,
  "message": "Gmail 연결에 실패했습니다.",
  "rateLimitStatus": {
    "userId": "user123",
    "requestCount": 0,
    "windowStart": 1704067200000,
    "limit": 100,
    "remaining": 100
  }
}
```

**Error Codes**:

- `401`: Unauthorized (No valid session)
- `403`: Forbidden (Rate limit exceeded)
- `500`: Internal server error

---

### 2. Search Travel Emails

**Endpoint**: `GET /api/gmail/search`

**Description**: Searches for travel-related emails in the user's Gmail account.

**Authentication**: Required (Session)

**Request Parameters**:
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `maxResults` | integer | 20 | 100 | Maximum number of emails to return |

**Request Example**:

```
GET /api/gmail/search?maxResults=50
```

**Response**:

```typescript
{
  success: boolean,
  count: number,
  emails: Array<{
    id: string,
    subject: string,
    from: string,
    date: string,
    snippet: string
  }>
}
```

**Response Example**:

```json
{
  "success": true,
  "count": 3,
  "emails": [
    {
      "id": "abc123",
      "subject": "Your flight confirmation - KE123",
      "from": "noreply@koreanair.com",
      "date": "2024-01-15T10:30:00Z",
      "snippet": "Thank you for booking with Korean Air..."
    },
    {
      "id": "def456",
      "subject": "Hotel Reservation Confirmed",
      "from": "bookings@booking.com",
      "date": "2024-01-10T14:45:00Z",
      "snippet": "Your hotel reservation has been confirmed..."
    }
  ]
}
```

**Search Criteria**:

- Subject contains: flight, airline, booking, hotel, travel, 항공, 숙박, 여행
- From domains: booking.com, agoda.com, airlines, hotels.com
- Date range: Configurable (default: last 3 months)

**Error Codes**:

- `401`: Unauthorized
- `403`: Rate limit exceeded
- `429`: Too many requests
- `500`: Gmail API error

---

### 3. Analyze Travel Emails

**Endpoint**: `GET /api/gmail/analyze`

**Description**: Analyzes emails and extracts structured travel information using AI pattern matching.

**Authentication**: Required (Session)

**Request Parameters**:
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `maxResults` | integer | 20 | 50 | Maximum number of emails to analyze |

**Request Example**:

```
GET /api/gmail/analyze?maxResults=30
```

**Response**:

```typescript
{
  success: boolean,
  count: number,
  travelInfos: Array<{
    emailId: string,
    subject: string,
    from: string,
    departureDate?: string,
    returnDate?: string,
    destination?: string,
    departure?: string,
    flightNumber?: string,
    bookingReference?: string,
    confidence: number // 0-100 percentage
  }>
}
```

**Response Example**:

```json
{
  "success": true,
  "count": 2,
  "travelInfos": [
    {
      "emailId": "abc123",
      "subject": "Your flight confirmation - KE123 Seoul to Paris",
      "from": "noreply@koreanair.com",
      "departureDate": "2024-02-15",
      "returnDate": "2024-02-28",
      "destination": "Paris, France",
      "departure": "Seoul, Korea",
      "flightNumber": "KE123",
      "bookingReference": "ABC123XYZ",
      "confidence": 92
    },
    {
      "emailId": "def456",
      "subject": "Hotel Reservation - Grand Hotel Paris",
      "from": "bookings@booking.com",
      "departureDate": "2024-02-15",
      "returnDate": "2024-02-20",
      "destination": "Paris, France",
      "bookingReference": "BK456789",
      "confidence": 78
    }
  ]
}
```

**Confidence Levels**:

- **90-100%**: High confidence - Complete information extracted
- **70-89%**: Medium confidence - Most information extracted
- **50-69%**: Low confidence - Limited information extracted
- **Below 50%**: Filtered out (not returned)

**Extracted Information Types**:

- **Flight Information**: Flight numbers, airports, dates, airlines
- **Hotel Information**: Hotel names, addresses, check-in/out dates
- **Booking References**: Confirmation codes, PNRs
- **Travel Dates**: Departure and return dates
- **Destinations**: Cities, countries, airports
- **Passenger Information**: Names (sanitized for privacy)

**Error Codes**:

- `401`: Unauthorized
- `403`: Rate limit exceeded
- `429`: Too many requests
- `500`: Analysis service error

## Privacy & Security

### Data Protection

- **Local Processing**: Email content is processed locally and not stored
- **Data Sanitization**: Personal information is sanitized before API responses
- **Read-Only Access**: Only read permissions are requested from Gmail
- **Session-Based**: All access is tied to user sessions

### Rate Limiting

- **User-based Limits**: Per-user request limits to prevent abuse
- **Time Windows**: Sliding window rate limiting
- **Graceful Degradation**: Clear error messages when limits are exceeded

### GDPR Compliance

- **Minimal Data**: Only necessary data is extracted and processed
- **User Consent**: Explicit permission required for Gmail access
- **Data Retention**: No long-term storage of email content
- **Right to Disconnect**: Users can revoke access at any time

## Error Handling

### Common Error Responses

**401 Unauthorized**:

```json
{
  "error": "Unauthorized",
  "message": "Valid session required"
}
```

**403 Rate Limited**:

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 3600
}
```

**500 Server Error**:

```json
{
  "error": "Internal server error",
  "message": "Gmail API temporarily unavailable"
}
```

### Client Error Handling

```typescript
try {
  const response = await fetch('/api/gmail/analyze?maxResults=20');
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 403) {
      // Handle rate limiting
      console.log('Rate limited, retry after:', data.retryAfter);
    } else if (response.status === 401) {
      // Handle authentication
      signIn('google');
    }
    throw new Error(data.message);
  }

  // Process successful response
  console.log('Travel infos:', data.travelInfos);
} catch (error) {
  console.error('Gmail API error:', error);
}
```

## Usage Examples

### Basic Integration Flow

```typescript
// 1. Check connection
const checkResponse = await fetch('/api/gmail/check');
const checkData = await checkResponse.json();

if (!checkData.connected) {
  // Handle connection issue
  return;
}

// 2. Search for emails
const searchResponse = await fetch('/api/gmail/search?maxResults=50');
const searchData = await searchResponse.json();

console.log(`Found ${searchData.count} emails`);

// 3. Analyze travel information
const analyzeResponse = await fetch('/api/gmail/analyze?maxResults=30');
const analyzeData = await analyzeResponse.json();

console.log(`Extracted ${analyzeData.count} travel records`);
```

### Component Integration

```tsx
import { useSession } from 'next-auth/react';

function GmailIntegration() {
  const { data: session } = useSession();
  const [travelData, setTravelData] = useState([]);

  const analyzeTravelEmails = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/gmail/analyze?maxResults=20');
      const data = await response.json();

      if (data.success) {
        setTravelData(data.travelInfos);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <div>
      <button onClick={analyzeTravelEmails}>Analyze Travel Emails</button>
      {/* Render travel data */}
    </div>
  );
}
```

## API Limitations

- **Email Volume**: Maximum 100 emails per search request
- **Analysis Volume**: Maximum 50 emails per analysis request
- **Rate Limits**: User-based rate limiting (configurable)
- **Scope**: Read-only Gmail access
- **Language**: Optimized for English and Korean emails
- **Providers**: Best performance with major travel providers

## Performance Considerations

- **Caching**: API responses are cached for 5 minutes
- **Parallel Processing**: Analysis is performed in parallel when possible
- **Timeout Handling**: 30-second timeout for Gmail API calls
- **Optimization**: Batched email processing for better performance

## Development and Testing

### Local Testing

```bash
# Set environment variables
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export NEXTAUTH_SECRET="your-secret"

# Run development server
npm run dev

# Test endpoints
curl http://localhost:3000/api/gmail/check
```

### Testing Considerations

- Use test Gmail account with travel emails
- Verify rate limiting behavior
- Test error scenarios (network issues, invalid tokens)
- Validate data sanitization
- Test with different email providers and formats

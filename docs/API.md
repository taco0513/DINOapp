# DINO v2.0 API Documentation

RESTful API endpoints for DINO v2.0 travel management platform.

## Base URL

```
Development: http://localhost:3000/api
Production: https://dino-travel.com/api
```

## Authentication

DINO uses NextAuth.js for authentication. Most endpoints require authentication via session cookies.

### Auth Endpoints

#### Sign In
```http
POST /api/auth/signin
```

#### Sign Out
```http
POST /api/auth/signout
```

#### Get Session
```http
GET /api/auth/session
```

**Response:**
```json
{
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://..."
  },
  "expires": "2025-09-01T00:00:00.000Z"
}
```

---

## Visa Services

### Check Visa Requirements

Check visa requirements between two countries.

#### GET Method
```http
GET /api/visa/check?passport={countryCode}&destination={countryCode}&purpose={purpose}
```

**Query Parameters:**
- `passport` (required): Passport country code (e.g., "KR", "US")
- `destination` (required): Destination country code
- `purpose` (optional): Travel purpose ("tourism", "business", "study", "work")

**Example:**
```http
GET /api/visa/check?passport=KR&destination=US&purpose=tourism
```

#### POST Method
```http
POST /api/visa/check
Content-Type: application/json

{
  "passportCountry": "KR",
  "destination": "US",
  "purpose": "tourism"
}
```

**Response:**
```json
{
  "visaRequired": false,
  "visaType": "VISA_WAIVER",
  "stayDuration": 90,
  "notes": "ESTA required",
  "requirements": [
    "Valid passport",
    "ESTA authorization",
    "Return ticket"
  ],
  "processingTime": "72 hours",
  "fee": {
    "amount": 21,
    "currency": "USD"
  }
}
```

---

## Schengen Calculator

### Calculate Schengen Stay

Calculate remaining days under the 90/180 rule.

```http
POST /api/schengen
Content-Type: application/json

{
  "trips": [
    {
      "country": "DE",
      "entryDate": "2025-01-01",
      "exitDate": "2025-01-10"
    },
    {
      "country": "FR",
      "entryDate": "2025-02-01",
      "exitDate": "2025-02-15"
    }
  ],
  "checkDate": "2025-08-01"
}
```

**Response:**
```json
{
  "remainingDays": 65,
  "daysUsed": 25,
  "periodStart": "2025-02-03",
  "periodEnd": "2025-08-01",
  "canEnter": true,
  "nextPossibleEntry": null,
  "violations": [],
  "trips": [
    {
      "country": "DE",
      "entryDate": "2025-01-01",
      "exitDate": "2025-01-10",
      "daysInSchengen": 10,
      "withinPeriod": true
    }
  ]
}
```

---

## Trip Management

### Get All Trips

Get all trips for the authenticated user.

```http
GET /api/trips
```

**Response:**
```json
{
  "trips": [
    {
      "id": "trip123",
      "userId": "user123",
      "country": "FR",
      "city": "Paris",
      "purpose": "tourism",
      "entryDate": "2025-07-01",
      "exitDate": "2025-07-10",
      "notes": "Summer vacation",
      "createdAt": "2025-06-01T00:00:00.000Z",
      "updatedAt": "2025-06-01T00:00:00.000Z"
    }
  ]
}
```

### Create Trip

```http
POST /api/trips
Content-Type: application/json

{
  "country": "FR",
  "city": "Paris",
  "purpose": "tourism",
  "entryDate": "2025-07-01",
  "exitDate": "2025-07-10",
  "notes": "Summer vacation"
}
```

### Update Trip

```http
PUT /api/trips/{tripId}
Content-Type: application/json

{
  "city": "Lyon",
  "notes": "Changed destination"
}
```

### Delete Trip

```http
DELETE /api/trips/{tripId}
```

---

## Visa Tracking

### Get User Visas

Get all visas for the authenticated user.

```http
GET /api/visas
```

**Response:**
```json
{
  "visas": [
    {
      "id": "visa123",
      "country": "US",
      "countryName": "United States",
      "visaType": "B1/B2",
      "issueDate": "2025-01-01",
      "expiryDate": "2035-01-01",
      "entries": "MULTIPLE",
      "maxStayDays": 180,
      "status": "ACTIVE",
      "notes": "10-year tourist visa"
    }
  ]
}
```

### Create Visa

```http
POST /api/visas
Content-Type: application/json

{
  "country": "US",
  "countryName": "United States",
  "visaType": "B1/B2",
  "issueDate": "2025-01-01",
  "expiryDate": "2035-01-01",
  "entries": "MULTIPLE",
  "maxStayDays": 180,
  "status": "ACTIVE",
  "notes": "10-year tourist visa"
}
```

---

## Notifications

### Get Notifications

```http
GET /api/notifications
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif123",
      "type": "VISA_EXPIRY",
      "title": "Visa Expiring Soon",
      "message": "Your US visa expires in 30 days",
      "relatedId": "visa123",
      "isRead": false,
      "createdAt": "2025-08-01T00:00:00.000Z"
    }
  ]
}
```

### Mark as Read

```http
PUT /api/notifications/{notificationId}/read
```

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid country code",
    "details": {
      "field": "destination",
      "value": "XX"
    }
  }
}
```

### Error Codes

- `VALIDATION_ERROR` - Invalid input parameters
- `AUTHENTICATION_REQUIRED` - User not authenticated
- `NOT_FOUND` - Resource not found
- `PERMISSION_DENIED` - User lacks permission
- `INTERNAL_ERROR` - Server error

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Anonymous users**: 10 requests per minute
- **Authenticated users**: 100 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Caching

Responses include cache headers where appropriate:

- **Visa Requirements**: Cached for 1 hour
- **Trip Data**: No cache (real-time)
- **Schengen Calculations**: No cache (real-time)

---

## Webhooks (Future)

Webhook support is planned for:
- Visa expiry notifications
- Policy change alerts
- Trip reminders

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Visa check
const response = await fetch('/api/visa/check?passport=KR&destination=US');
const data = await response.json();

// Create trip
const trip = await fetch('/api/trips', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    country: 'FR',
    city: 'Paris',
    entryDate: '2025-07-01',
    exitDate: '2025-07-10',
  }),
});
```

### cURL

```bash
# Check visa requirements
curl "https://dino-travel.com/api/visa/check?passport=KR&destination=US"

# Create trip (requires authentication)
curl -X POST https://dino-travel.com/api/trips \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"country":"FR","city":"Paris","entryDate":"2025-07-01","exitDate":"2025-07-10"}'
```

---

## Changelog

### v2.0.0 (2025-08-02)
- Initial API release
- Visa check endpoint
- Schengen calculator
- Trip management
- Notification system

---

## Support

For API support, please contact:
- Email: api@dino-travel.com
- GitHub: [github.com/dino-travel/api-issues](https://github.com/dino-travel/api-issues)
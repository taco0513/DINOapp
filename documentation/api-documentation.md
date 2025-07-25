# DiNoCal API Documentation

## Overview

This document provides comprehensive documentation for all third-party APIs used in the DiNoCal (Digital Nomad Calendar) project. DiNoCal is a smart travel management platform for digital nomads and long-term travelers.

## 🔑 Authentication & Core APIs

### 1. Google OAuth 2.0 API

**Purpose**: User authentication and authorization for Google services
**Documentation**: https://developers.google.com/identity/protocols/oauth2
**Implementation Status**: Required for Epic 1 (story_1_2)

#### Key Features:
- Secure user authentication via Google accounts
- OAuth 2.0 authorization flow
- Access token management for Google services
- Refresh token handling for long-term access

#### Required Scopes:
```javascript
const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar'
];
```

#### Implementation Notes:
- Use NextAuth.js Google provider for simplified integration
- Implement minimal privilege principle
- Store tokens securely with encryption
- Handle token refresh automatically

#### Security Considerations:
- Never expose client secrets in frontend code
- Implement PKCE (Proof Key for Code Exchange) for enhanced security
- Use HTTPS for all OAuth redirects
- Validate state parameters to prevent CSRF attacks

---

### 2. Gmail API

**Purpose**: Automatic detection and parsing of travel-related emails
**Documentation**: https://developers.google.com/gmail/api
**Implementation Status**: Required for Epic 4 (story_4_1, story_4_2)

#### Key Features:
- Read-only access to user's Gmail
- Search and filter travel-related emails
- Extract flight confirmations, hotel bookings, visa approvals
- Parse structured data from email content

#### Core Endpoints:
- `GET /gmail/v1/users/{userId}/messages` - List messages
- `GET /gmail/v1/users/{userId}/messages/{messageId}` - Get message content
- `GET /gmail/v1/users/{userId}/messages?q={query}` - Search messages

#### Email Detection Patterns:
```javascript
const travelEmailQueries = [
  'from:(booking.com OR expedia.com OR airbnb.com)',
  'subject:(flight confirmation OR hotel booking OR visa)',
  'has:attachment filename:(ticket OR boarding OR confirmation)',
  '(departure OR arrival OR check-in OR check-out)'
];
```

#### Data Extraction:
- **Flight Information**: Departure/arrival dates, airports, airlines
- **Accommodation**: Check-in/check-out dates, locations
- **Visa Documents**: Approval dates, validity periods, countries
- **Travel Bookings**: Confirmation numbers, booking dates

#### Privacy & Security:
- Process emails locally, never send content to external servers
- Request explicit user consent before accessing Gmail
- Implement data minimization - only extract necessary information
- Provide clear opt-out mechanisms

---

### 3. Google Calendar API

**Purpose**: Bidirectional synchronization of travel records with Google Calendar
**Documentation**: https://developers.google.com/calendar/api
**Implementation Status**: Required for Epic 4 (story_4_3)

#### Key Features:
- Create calendar events from travel records
- Sync travel data to user's primary calendar
- Update events when travel records change
- Import calendar events as travel records

#### Core Endpoints:
- `POST /calendar/v3/calendars/{calendarId}/events` - Create event
- `GET /calendar/v3/calendars/{calendarId}/events` - List events
- `PUT /calendar/v3/calendars/{calendarId}/events/{eventId}` - Update event
- `DELETE /calendar/v3/calendars/{calendarId}/events/{eventId}` - Delete event

#### Event Structure:
```javascript
const travelEvent = {
  summary: "Travel: [Country] - [Visa Type]",
  description: "Digital Nomad Travel Record\nEntry: [date]\nExit: [date]\nVisa: [type]\nDuration: [days]",
  start: { date: entryDate },
  end: { date: exitDate },
  colorId: "2", // Green for travel events
  extendedProperties: {
    private: {
      dinoCalId: recordId,
      visaType: visaType,
      country: countryCode
    }
  }
};
```

#### Synchronization Strategy:
- **One-way sync**: DiNoCal → Calendar (recommended for MVP)
- **Two-way sync**: Calendar ↔ DiNoCal (future enhancement)
- **Conflict resolution**: Last-modified-wins with user confirmation
- **Batch operations**: Optimize API calls with batch requests

---

## 🔧 Framework & Integration APIs

### 4. NextAuth.js

**Purpose**: Authentication framework for Next.js applications
**Documentation**: https://next-auth.js.org/
**Implementation Status**: Required for Epic 1 (story_1_2)

#### Key Features:
- Pre-built OAuth providers (Google, Facebook, GitHub, etc.)
- Session management with JWT or database sessions
- Built-in CSRF protection
- TypeScript support

#### Configuration:
```javascript
// pages/api/auth/[...nextauth].js
export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
});
```

#### Session Management:
- Use JWT for stateless sessions
- Implement token refresh logic
- Handle session expiration gracefully
- Secure session storage with httpOnly cookies

---

### 5. Next.js API Routes

**Purpose**: Backend API endpoints for the DiNoCal application
**Documentation**: https://nextjs.org/docs/api-routes/introduction
**Implementation Status**: Required throughout all epics

#### Core Endpoints Structure:
```
/api/
├── auth/
│   └── [...nextauth].js     # NextAuth.js configuration
├── travel/
│   ├── records.js           # CRUD operations for travel records
│   ├── schengen.js          # Schengen calculation endpoints
│   └── import.js            # Data import/export
├── google/
│   ├── gmail.js             # Gmail integration
│   └── calendar.js          # Calendar sync
└── notifications/
    └── alerts.js            # Notification system
```

#### API Design Patterns:
- RESTful endpoints with proper HTTP methods
- Consistent error handling and status codes
- Request validation with schema validation
- Rate limiting for external API calls
- Comprehensive logging for debugging

---

## 🌍 Country & Visa Data APIs

### 6. Country Information API (Future Enhancement)

**Purpose**: Up-to-date country and visa information
**Potential Sources**:
- **REST Countries API**: https://restcountries.com/
- **Visa API**: https://visaapi.io/
- **Embassy data**: Government embassy APIs

#### Implementation Considerations:
- Static data file for MVP (78 supported countries)
- Future integration with live APIs for real-time updates
- Caching strategy for country/visa information
- Fallback mechanisms for API downtime

---

## 📊 Implementation Roadmap

### Phase 1: Authentication Foundation
1. **NextAuth.js setup** with Google OAuth
2. **Basic session management**
3. **Protected route middleware**

### Phase 2: Core APIs Integration
1. **Gmail API integration** for email parsing
2. **Calendar API setup** for basic sync
3. **Travel records API** endpoints

### Phase 3: Advanced Features
1. **Real-time notifications**
2. **Batch operations optimization**
3. **Enhanced error handling**

### Phase 4: External Data Sources
1. **Country information APIs**
2. **Visa requirement APIs**
3. **Currency and timezone APIs**

---

## 🔒 Security Best Practices

### API Key Management:
- Store all API keys in environment variables
- Use different keys for development/production
- Implement key rotation procedures
- Never commit keys to version control

### Data Privacy:
- Implement GDPR compliance measures
- Provide data export/deletion capabilities
- Use encryption for sensitive data storage
- Minimize data collection to necessary information only

### Rate Limiting:
- Implement rate limiting for all external APIs
- Use exponential backoff for retry logic
- Cache responses when appropriate
- Monitor API usage quotas

### Error Handling:
- Implement comprehensive error logging
- Provide user-friendly error messages
- Handle API downtime gracefully
- Implement circuit breaker patterns

---

## 📈 Performance Optimization

### Caching Strategy:
- **Gmail data**: Cache parsed email data locally
- **Calendar events**: Cache with TTL for sync optimization
- **Country data**: Long-term caching for static information
- **User sessions**: Optimize session storage and retrieval

### API Call Optimization:
- **Batch operations**: Group related API calls
- **Pagination**: Implement proper pagination for large datasets
- **Compression**: Use gzip compression for large responses
- **CDN integration**: Serve static resources via CDN

### Monitoring & Analytics:
- Track API response times and error rates
- Monitor quota usage for Google APIs
- Implement performance alerts
- Use APM tools for comprehensive monitoring

---

## 🧪 Testing Strategy

### Unit Tests:
- Test API integration functions
- Mock external API responses
- Validate data transformation logic
- Test error handling scenarios

### Integration Tests:
- Test OAuth flow end-to-end
- Validate Gmail/Calendar integration
- Test data synchronization logic
- Verify security measures

### Load Testing:
- Test API rate limits
- Validate performance under load
- Test database query optimization
- Monitor memory usage patterns

---

## 📚 Additional Resources

### Official Documentation:
- [Google API Console](https://console.developers.google.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

### Development Tools:
- **Postman**: API testing and documentation
- **Google API Explorer**: Test Google APIs directly
- **OAuth 2.0 Playground**: Test OAuth flows

### Monitoring & Debugging:
- **Google Cloud Console**: Monitor API usage and quotas
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and debugging

---

*Last Updated: January 2025*
*Version: 1.0*
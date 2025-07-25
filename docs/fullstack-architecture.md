# DiNoCal Full-Stack Architecture Document

## 🏗️ System Overview

DiNoCal은 Next.js 15 기반의 풀스택 애플리케이션으로, 디지털 노마드를 위한 종합적인 비자 추적 및 여행 관리 플랫폼입니다. 모노레포 구조에서 프론트엔드와 백엔드를 통합하여 개발 효율성과 성능을 최적화합니다.

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                    │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend (React 18 + TypeScript)                   │
│  • SSR/SSG Pages    • React Components    • Client State    │
│  • Tailwind CSS     • PWA Features       • Service Worker  │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (Next.js)                      │
│  • API Routes       • Middleware         • Authentication   │
│  • Google API Proxy • Rate Limiting      • Input Validation │
├─────────────────────────────────────────────────────────────┤
│                   Business Logic Layer                      │
│  • Schengen Calculator  • Visa Rules Engine               │
│  • Email Parser         • Calendar Sync Logic             │
├─────────────────────────────────────────────────────────────┤
│                   Data Access Layer                        │
│  • SQLite (Dev)     • PostgreSQL (Prod) • Caching Layer    │
│  • Query Builders   • Migration Scripts  • Backup System   │
├─────────────────────────────────────────────────────────────┤
│                  External Services                         │
│  • Google OAuth     • Gmail API         • Calendar API     │
│  • Vercel Platform  • Edge Functions    • CDN              │
└─────────────────────────────────────────────────────────────┘
```

## 🗂️ Project Structure

```
/DiNoCal
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── callback/
│   ├── (dashboard)/              # Main application pages
│   │   ├── page.tsx              # Dashboard home
│   │   ├── visits/               # Travel records
│   │   ├── schengen/             # Schengen calculator
│   │   ├── countries/            # Country information
│   │   └── settings/             # User settings
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── visits/               # Visit CRUD operations
│   │   ├── schengen/             # Schengen calculations
│   │   ├── gmail/                # Gmail integration
│   │   ├── calendar/             # Calendar sync
│   │   └── middleware.ts         # API middleware
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── loading.tsx               # Loading components
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Calendar.tsx
│   ├── forms/                    # Form components
│   │   ├── VisitForm.tsx
│   │   └── SettingsForm.tsx
│   ├── charts/                   # Data visualization
│   │   ├── SchengenChart.tsx
│   │   └── StatsDashboard.tsx
│   └── layout/                   # Layout components
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── Footer.tsx
├── lib/                          # Core business logic
│   ├── auth/                     # Authentication logic
│   │   ├── nextauth.config.ts
│   │   └── google-oauth.ts
│   ├── database/                 # Database layer
│   │   ├── schema.ts
│   │   ├── queries.ts
│   │   └── migrations/
│   ├── schengen/                 # Schengen calculation engine
│   │   ├── calculator.ts
│   │   ├── rules.ts
│   │   └── validator.ts
│   ├── google/                   # Google services integration
│   │   ├── gmail-parser.ts
│   │   ├── calendar-sync.ts
│   │   └── oauth-manager.ts
│   ├── utils/                    # Utility functions
│   │   ├── date-helpers.ts
│   │   ├── country-data.ts
│   │   └── validation.ts
│   └── cache/                    # Caching layer
│       ├── storage.ts
│       └── strategies.ts
├── types/                        # TypeScript definitions
│   ├── database.ts               # Database types
│   ├── api.ts                    # API types
│   ├── google.ts                 # Google API types
│   └── global.ts                 # Global types
├── data/                         # Static data and configurations
│   ├── countries.json            # Country information
│   ├── visa-types.json           # Visa type definitions
│   └── schengen-countries.json   # Schengen area countries
├── public/                       # Static assets
│   ├── icons/                    # Country flags and icons
│   ├── images/                   # Application images
│   └── manifest.json             # PWA manifest
├── tests/                        # Test suites
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
├── docs/                         # Documentation
│   ├── api.md                    # API documentation
│   ├── deployment.md             # Deployment guide
│   └── development.md            # Development guide
├── .env.local                    # Environment variables
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## 🔧 Technology Stack

### Frontend Technologies
- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript 5.0+ (strict mode)
- **UI Library**: React 18 with Server Components
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **State Management**: React Context API + React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **PWA**: Next-PWA for offline capabilities

### Backend Technologies
- **Runtime**: Node.js 20+ on Vercel Edge Runtime
- **API**: Next.js API Routes with middleware chain
- **Authentication**: NextAuth.js 4.x with Google OAuth 2.0
- **Database**: SQLite (development) → PostgreSQL (production)
- **ORM**: Prisma or Drizzle for type-safe database access
- **Caching**: Redis-compatible edge caching (Vercel KV)
- **File Storage**: Vercel Blob for user uploads

### External Integrations
- **Google APIs**: OAuth 2.0, Gmail API, Calendar API
- **Deployment**: Vercel platform with Edge Functions
- **Monitoring**: Vercel Analytics + custom error tracking
- **CDN**: Vercel Edge Network for global distribution

## 🔒 Security Architecture

### Authentication & Authorization
```typescript
// Authentication Flow
Google OAuth 2.0 → NextAuth.js → JWT Tokens → Session Management

// Authorization Layers
interface SecurityMiddleware {
  // Rate limiting per user/IP
  rateLimiting: RateLimitConfig
  // Input validation with Zod schemas
  inputValidation: ZodSchema[]
  // CSRF protection with double-submit cookies
  csrfProtection: CSRFConfig
  // SQL injection prevention
  parameterizedQueries: boolean
}
```

### Data Protection
- **Encryption**: AES-256 for sensitive data at rest
- **Transport**: TLS 1.3 for all communications
- **API Security**: API key rotation and scoped permissions
- **Privacy**: GDPR-compliant data handling and user consent
- **Audit Logging**: Comprehensive security event logging

### Google API Security
```typescript
interface GoogleAPISecurityConfig {
  scopes: ['openid', 'email', 'profile', 'gmail.readonly', 'calendar']
  tokenRefresh: AutomaticTokenRefreshConfig
  rateLimit: GoogleAPIRateLimitConfig
  errorHandling: APIErrorRecoveryConfig
}
```

## 📊 Database Design

### Core Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image_url VARCHAR(500),
  google_id VARCHAR(255) UNIQUE,
  passport_country VARCHAR(5) DEFAULT 'OTHER',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Country visits table
CREATE TABLE country_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  country VARCHAR(100) NOT NULL,
  entry_date DATE NOT NULL,
  exit_date DATE,
  visa_type VARCHAR(50) NOT NULL,
  max_days INTEGER NOT NULL DEFAULT 90,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_user_dates (user_id, entry_date, exit_date),
  INDEX idx_country_visa (country, visa_type)
);

-- Notification preferences
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  visa_expiry_days INTEGER[] DEFAULT ARRAY[30, 7, 1],
  schengen_warning_days INTEGER DEFAULT 5,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cache table for performance
CREATE TABLE cache_entries (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Data Relationships
```
Users (1) ←→ (N) CountryVisits
Users (1) ←→ (1) NotificationSettings
Users (1) ←→ (N) CacheEntries (scoped by user)
```

## ⚡ Performance Architecture

### Caching Strategy
```typescript
interface CacheConfig {
  // Multi-level caching
  levels: {
    browser: ServiceWorkerCache        // 24h TTL
    edge: VercelEdgeCache             // 5min TTL
    server: RedisCache                // 1h TTL
    database: QueryResultCache       // 15min TTL
  }
  
  // Cache invalidation
  invalidation: {
    userVisits: 'immediate'           // On CRUD operations
    schengenCalc: 'immediate'         // On visit changes
    countryData: 'weekly'             // Static data updates
    userProfile: 'on-change'          // Profile updates
  }
}
```

### Performance Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with Vercel optimization
- **Font Optimization**: Self-hosted fonts with font-display: swap
- **Bundle Analysis**: Regular bundle size monitoring and optimization
- **Critical CSS**: Inline critical CSS for above-the-fold content

### Database Performance
```typescript
interface DatabaseOptimizations {
  indexes: {
    composite: ['user_id', 'entry_date', 'exit_date']
    partial: ['exit_date IS NULL']  // For current stays
    expression: ['EXTRACT(year FROM entry_date)']  // For yearly queries
  }
  
  queryOptimization: {
    schengenQueries: 'Optimized for 180-day rolling windows'
    pagination: 'Cursor-based for large datasets'
    aggregations: 'Pre-computed for dashboard stats'
  }
}
```

## 🔄 Data Flow Architecture

### User Journey Data Flow
```mermaid
graph TD
    A[User Login] --> B[Google OAuth]
    B --> C[Session Creation]
    C --> D[Dashboard Load]
    D --> E[Cached Data Check]
    E -->|Cache Hit| F[Display Data]
    E -->|Cache Miss| G[Database Query]
    G --> H[Cache Update]
    H --> F
    
    F --> I[User Action]
    I --> J[Input Validation]
    J --> K[Business Logic]
    K --> L[Database Update]
    L --> M[Cache Invalidation]
    M --> N[UI Update]
```

### Gmail Integration Flow
```mermaid
graph TD
    A[Gmail Scan Request] --> B[OAuth Token Validation]
    B --> C[Gmail API Query]
    C --> D[Email Parsing]
    D --> E[Travel Data Extraction]
    E --> F[User Confirmation]
    F --> G[Database Storage]
    G --> H[Calendar Sync]
```

## 🧮 Schengen Calculation Engine

### Algorithm Architecture
```typescript
interface SchengenCalculator {
  calculateRemainingDays(visits: CountryVisit[]): SchengenStatus {
    const rollingWindow = 180 // days
    const maxDays = 90
    
    // Calculate used days in any 180-day period
    const usedDays = this.calculateUsedDaysInPeriod(visits, rollingWindow)
    const remainingDays = maxDays - usedDays
    const nextResetDate = this.calculateNextResetDate(visits)
    
    return {
      usedDays,
      remainingDays,
      nextResetDate,
      isCompliant: remainingDays >= 0,
      violations: this.detectViolations(visits)
    }
  }
  
  validateFutureTrip(
    existingVisits: CountryVisit[],
    plannedVisit: PlannedVisit
  ): ValidationResult {
    // Simulate adding the planned visit and check compliance
    const simulatedVisits = [...existingVisits, plannedVisit]
    return this.calculateRemainingDays(simulatedVisits)
  }
}
```

### Edge Cases Handling
- **Overlapping Visits**: Detection and user notification
- **Data Gaps**: Handling incomplete entry/exit data
- **Clock Changes**: Timezone-aware date calculations
- **Passport Changes**: Multi-passport user support

## 🔌 Google Services Integration

### Gmail API Integration
```typescript
interface GmailParser {
  scanTravelEmails(): Promise<TravelEmailData[]> {
    // Search for travel-related emails
    const query = 'from:(airline.com OR booking.com OR airbnb.com) ' +
                  'subject:(booking confirmation OR e-ticket OR itinerary)'
    
    const messages = await gmail.users.messages.list({ q: query })
    
    return Promise.all(
      messages.data.messages.map(msg => this.parseEmailContent(msg))
    )
  }
  
  parseEmailContent(message: GmailMessage): TravelEmailData {
    // Extract flight dates, destinations, booking references
    const patterns = {
      flightDate: /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/g,
      destination: /to\s+([A-Z]{3})\s*[-–]\s*([^,\n]+)/gi,
      flightNumber: /[A-Z]{2}\s*\d{3,4}/g
    }
    
    return this.extractStructuredData(message.payload.body, patterns)
  }
}
```

### Calendar Sync Architecture
```typescript
interface CalendarSync {
  syncVisitToCalendar(visit: CountryVisit): Promise<CalendarEvent> {
    const event = {
      summary: `Travel: ${visit.country}`,
      description: `Visa Type: ${visit.visa_type}\nMax Days: ${visit.max_days}`,
      start: { date: visit.entry_date },
      end: { date: visit.exit_date || this.calculateEndDate(visit) },
      colorId: this.getVisaTypeColor(visit.visa_type)
    }
    
    return calendar.events.insert({ calendarId: 'primary', resource: event })
  }
  
  handleCalendarWebhook(notification: CalendarNotification): void {
    // Handle bi-directional sync when calendar events change
    this.updateVisitFromCalendarEvent(notification.resourceId)
  }
}
```

## 🚀 Deployment Architecture

### Vercel Platform Configuration
```typescript
// next.config.js
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['sqlite3']
  },
  
  images: {
    domains: ['lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif']
  },
  
  headers: async () => [{
    source: '/api/:path*',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' }
    ]
  }],
  
  rewrites: async () => [
    { source: '/health', destination: '/api/health' }
  ]
}
```

### Environment Management
```bash
# Production Environment Variables
NEXTAUTH_URL=https://dinocal.app
NEXTAUTH_SECRET=<secure-random-string>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
DATABASE_URL=postgresql://user:pass@host:5432/dinocal
REDIS_URL=redis://cache-cluster:6379
VERCEL_URL=<auto-populated>
```

## 📈 Monitoring and Analytics

### Performance Monitoring
```typescript
interface MonitoringConfig {
  vitals: {
    FCP: '<1.8s',      // First Contentful Paint
    LCP: '<2.5s',      // Largest Contentful Paint
    FID: '<100ms',     // First Input Delay
    CLS: '<0.1',       // Cumulative Layout Shift
    TTFB: '<600ms'     // Time to First Byte
  },
  
  business: {
    visitCreationTime: '<2s',
    schengenCalculationTime: '<500ms',
    gmailScanSuccess: '>95%',
    calendarSyncSuccess: '>98%'
  }
}
```

### Error Tracking
```typescript
interface ErrorTrackingConfig {
  levels: ['error', 'warn', 'info', 'debug']
  
  contexts: {
    user: 'anonymized-user-id',
    session: 'session-identifier',
    feature: 'feature-being-used',
    api: 'endpoint-called'
  }
  
  alerting: {
    errorRate: '>1% over 5 minutes',
    responseTime: '>2s average over 5 minutes',
    apiFailures: '>5 consecutive failures'
  }
}
```

## 🔄 CI/CD Pipeline

### Deployment Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration
      
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🧪 Testing Strategy

### Test Pyramid
```typescript
interface TestingStrategy {
  unit: {
    coverage: '>90%',
    focus: ['Business logic', 'Utilities', 'Components'],
    tools: ['Jest', 'React Testing Library']
  },
  
  integration: {
    coverage: '>80%',
    focus: ['API routes', 'Database operations', 'Google API integration'],
    tools: ['Jest', 'Supertest', 'Test containers']
  },
  
  e2e: {
    coverage: 'Critical user journeys',
    focus: ['Login flow', 'Visit management', 'Schengen calculator'],
    tools: ['Playwright', 'Visual regression testing']
  }
}
```

## 📚 API Documentation

### Core API Endpoints
```typescript
// Visit Management
POST   /api/visits              // Create new visit
GET    /api/visits              // List user visits (paginated)
GET    /api/visits/[id]         // Get specific visit
PUT    /api/visits/[id]         // Update visit
DELETE /api/visits/[id]         // Delete visit

// Schengen Calculator
GET    /api/schengen/calculate  // Calculate current status
POST   /api/schengen/validate   // Validate future trip

// Google Integration
POST   /api/gmail/scan          // Trigger Gmail scan
GET    /api/gmail/emails        // List parsed emails
POST   /api/calendar/sync       // Sync with Google Calendar

// User Management
GET    /api/user/profile        // Get user profile
PUT    /api/user/profile        // Update profile
GET    /api/user/settings       // Get notification settings
PUT    /api/user/settings       // Update settings

// Data Management
POST   /api/data/import         // Import travel data
GET    /api/data/export         // Export travel data
GET    /api/data/stats          // Get usage statistics

// System
GET    /api/health              // Health check
GET    /api/countries           // List supported countries
GET    /api/visa-types          // List visa types
```

## 🚀 Scalability Considerations

### Horizontal Scaling
- **Stateless Design**: No server-side sessions, JWT-based authentication
- **Database Sharding**: User-based sharding for large-scale deployment
- **CDN Distribution**: Global content distribution via Vercel Edge Network
- **Microservices Ready**: Modular architecture for future service extraction

### Performance Scaling
- **Edge Computing**: Computation moved to edge locations
- **Database Read Replicas**: Read operations distributed across replicas
- **Caching Layers**: Multi-level caching for frequently accessed data
- **Async Processing**: Non-critical operations moved to background jobs

---

*This architecture document provides a comprehensive foundation for building DiNoCal as a scalable, secure, and performant travel management platform. The modular design ensures maintainability while the chosen technologies provide a solid foundation for current needs and future growth.*
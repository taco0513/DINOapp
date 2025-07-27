# Gmail Integration Guide

## Overview

This guide provides comprehensive instructions for integrating and using the Gmail features in the DINO application. The Gmail integration automatically analyzes travel-related emails to extract trip information, helping users maintain accurate travel records for Schengen compliance.

## Table of Contents

1. [Setup and Configuration](#setup-and-configuration)
2. [User Authentication](#user-authentication)
3. [Component Integration](#component-integration)
4. [API Usage](#api-usage)
5. [Data Processing](#data-processing)
6. [Error Handling](#error-handling)
7. [Privacy and Security](#privacy-and-security)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Setup and Configuration

### Prerequisites

**Required Dependencies:**
```bash
npm install next-auth @next-auth/prisma-adapter
npm install @googleapis/gmail
npm install zod
```

**Environment Variables:**
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Database Configuration
DATABASE_URL=your_database_url
```

### Google OAuth Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Gmail API

2. **Configure OAuth Consent Screen**
   - Set application name: "DINO Travel Tracker"
   - Add authorized domains
   - Configure scopes: `gmail.readonly`, `userinfo.email`

3. **Create OAuth 2.0 Credentials**
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Download credentials and add to environment variables

### NextAuth Configuration

**File: `app/api/auth/[...nextauth]/route.ts`**
```typescript
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      return session
    }
  }
}
```

## User Authentication

### Login Flow Implementation

**Component: Login Button**
```tsx
import { useSession, signIn, signOut } from 'next-auth/react'

function LoginButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <p>Loading...</p>

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    )
  }

  return (
    <button 
      onClick={() => signIn('google')}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
      Sign in with Google
    </button>
  )
}
```

### Session Validation

**Middleware: Session Check**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function validateSession(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.accessToken) {
    throw new Error('Authentication required')
  }
  
  return session
}
```

## Component Integration

### Basic Gmail Integration

**Page Implementation:**
```tsx
import { useSession } from 'next-auth/react'
import GmailIntegration from '@/components/gmail/GmailIntegration'
import LoginButton from '@/components/auth/LoginButton'

export default function GmailPage() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gmail Travel Analysis</h1>
      
      {!session ? (
        <div className="text-center">
          <p className="mb-4">Please sign in to access Gmail integration</p>
          <LoginButton />
        </div>
      ) : (
        <GmailIntegration 
          onDataUpdate={(data) => {
            console.log('Travel data updated:', data)
            // Handle data updates (e.g., refresh other components)
          }}
        />
      )}
    </div>
  )
}
```

### Advanced Analyzer Integration

**Component with Custom Configuration:**
```tsx
import { useState } from 'react'
import GmailAnalyzer from '@/components/gmail/GmailAnalyzer'

export default function AdvancedGmailPage() {
  const [analysisResults, setAnalysisResults] = useState([])
  const [scanStats, setScanStats] = useState({ emailsScanned: 0 })

  const handleAnalysisComplete = (travelInfos) => {
    setAnalysisResults(travelInfos)
    
    // Process results for other components
    const highConfidenceResults = travelInfos.filter(
      info => info.confidence >= 0.8
    )
    
    // Update other parts of the application
    updateTravelRecords(highConfidenceResults)
  }

  const handleStatsUpdate = (stats) => {
    setScanStats(stats)
    // Update analytics dashboard
  }

  return (
    <div className="space-y-6">
      <GmailAnalyzer
        onAnalysisComplete={handleAnalysisComplete}
        onStatsUpdate={handleStatsUpdate}
      />
      
      {/* Display results summary */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-2">Analysis Summary</h3>
        <p>Emails Scanned: {scanStats.emailsScanned}</p>
        <p>Travel Records Found: {analysisResults.length}</p>
      </div>
    </div>
  )
}
```

## API Usage

### Direct API Integration

**Client-Side API Calls:**
```typescript
// Check Gmail connection
async function checkGmailConnection() {
  try {
    const response = await fetch('/api/gmail/check')
    const data = await response.json()
    
    if (data.connected) {
      console.log('Gmail connected successfully')
      return true
    } else {
      console.error('Gmail connection failed:', data.message)
      return false
    }
  } catch (error) {
    console.error('Connection check failed:', error)
    return false
  }
}

// Analyze travel emails
async function analyzeTravelEmails(maxResults = 20) {
  try {
    const response = await fetch(`/api/gmail/analyze?maxResults=${maxResults}`)
    const data = await response.json()
    
    if (data.success) {
      console.log(`Found ${data.count} travel records`)
      return data.travelInfos
    } else {
      throw new Error('Analysis failed')
    }
  } catch (error) {
    console.error('Email analysis failed:', error)
    throw error
  }
}
```

### Server-Side API Usage

**API Route Example:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth'
import { analyzeTravelEmails } from '@/lib/gmail'

export async function POST(request: NextRequest) {
  try {
    const session = await validateSession(request)
    const { maxResults = 20 } = await request.json()
    
    const travelInfos = await analyzeTravelEmails(
      session.accessToken,
      maxResults
    )
    
    return NextResponse.json({
      success: true,
      count: travelInfos.length,
      travelInfos
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

## Data Processing

### Email Analysis Pipeline

**Step 1: Email Retrieval**
```typescript
async function retrieveTravelEmails(accessToken: string, maxResults: number) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
  
  // Search queries for different types of travel emails
  const queries = [
    'subject:(flight OR airline OR boarding pass)',
    'subject:(hotel OR accommodation OR booking)',
    'from:(booking.com OR expedia OR kayak)',
    'subject:(travel OR trip OR itinerary)'
  ]
  
  const allMessages = []
  
  for (const query of queries) {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: Math.ceil(maxResults / queries.length)
    })
    
    if (response.data.messages) {
      allMessages.push(...response.data.messages)
    }
  }
  
  return allMessages
}
```

**Step 2: Content Extraction**
```typescript
async function extractEmailContent(messageId: string, accessToken: string) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
  
  const message = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full'
  })
  
  const headers = message.data.payload?.headers || []
  const subject = headers.find(h => h.name === 'Subject')?.value || ''
  const from = headers.find(h => h.name === 'From')?.value || ''
  const date = headers.find(h => h.name === 'Date')?.value || ''
  
  // Extract body content
  const body = extractBodyContent(message.data.payload)
  
  return { subject, from, date, body }
}
```

**Step 3: Travel Information Extraction**
```typescript
function extractTravelInfo(emailContent: any): TravelInfo {
  const { subject, from, body } = emailContent
  
  // Date extraction patterns
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
    /(\d{4}-\d{2}-\d{2})/g,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/gi
  ]
  
  // Flight number patterns
  const flightPatterns = [
    /([A-Z]{2}\d{3,4})/g,
    /Flight\s+([A-Z0-9]+)/gi,
    /항공편\s*([A-Z0-9]+)/gi
  ]
  
  // Airport code patterns
  const airportPatterns = [
    /\b([A-Z]{3})\b/g
  ]
  
  // Extract information using patterns
  const dates = extractDates(body, datePatterns)
  const flights = extractFlights(body, flightPatterns)
  const airports = extractAirports(body, airportPatterns)
  
  // Determine confidence score
  const confidence = calculateConfidence({
    dates: dates.length,
    flights: flights.length,
    airports: airports.length,
    from,
    subject
  })
  
  return {
    emailId: emailContent.id,
    subject,
    from,
    departureDate: dates[0],
    returnDate: dates[1],
    flightNumber: flights[0],
    destination: airports[1],
    departure: airports[0],
    confidence
  }
}
```

### Confidence Scoring Algorithm

```typescript
function calculateConfidence(extractedData: any): number {
  let score = 0
  
  // Base score from sender reputation
  if (extractedData.from.includes('booking.com')) score += 0.3
  if (extractedData.from.includes('airline')) score += 0.4
  if (extractedData.from.includes('hotel')) score += 0.3
  
  // Score from extracted data completeness
  if (extractedData.dates >= 2) score += 0.3
  if (extractedData.flights >= 1) score += 0.2
  if (extractedData.airports >= 2) score += 0.2
  
  // Subject line indicators
  if (extractedData.subject.includes('confirmation')) score += 0.1
  if (extractedData.subject.includes('booking')) score += 0.1
  if (extractedData.subject.includes('itinerary')) score += 0.15
  
  return Math.min(score, 1.0)
}
```

## Error Handling

### API Error Handling

**Client-Side Error Management:**
```typescript
async function handleGmailAPI(apiCall: () => Promise<any>) {
  try {
    return await apiCall()
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('Rate limit')) {
        throw new Error('Too many requests. Please try again later.')
      } else if (error.message.includes('Authentication')) {
        throw new Error('Please sign in again to continue.')
      } else if (error.message.includes('Permission')) {
        throw new Error('Gmail access permission required.')
      }
    }
    
    throw new Error('An unexpected error occurred.')
  }
}
```

**Component Error Boundaries:**
```tsx
import { ErrorBoundary } from 'react-error-boundary'

function GmailErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 className="text-red-800 font-semibold mb-2">Gmail Integration Error</h3>
      <p className="text-red-700 mb-4">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Try Again
      </button>
    </div>
  )
}

function GmailPageWithErrorBoundary() {
  return (
    <ErrorBoundary
      FallbackComponent={GmailErrorFallback}
      onReset={() => window.location.reload()}
    >
      <GmailIntegration />
    </ErrorBoundary>
  )
}
```

## Privacy and Security

### Data Privacy Implementation

**Data Sanitization:**
```typescript
function sanitizeEmailData(emailData: any) {
  return {
    ...emailData,
    // Remove sensitive content
    body: undefined,
    personalInfo: undefined,
    // Sanitize email addresses
    from: sanitizeEmailAddress(emailData.from),
    // Keep only necessary travel information
    subject: emailData.subject,
    dates: emailData.dates,
    destinations: emailData.destinations
  }
}

function sanitizeEmailAddress(email: string): string {
  // Keep domain for sender identification, mask user part
  const [user, domain] = email.split('@')
  if (domain && user) {
    const maskedUser = user.length > 2 
      ? `${user[0]}***${user[user.length - 1]}`
      : '***'
    return `${maskedUser}@${domain}`
  }
  return '***@unknown'
}
```

**Rate Limiting:**
```typescript
// lib/rate-limiter.ts
export class RateLimiter {
  private requests = new Map<string, number[]>()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs = 60000, maxRequests = 60) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(userId: string): boolean {
    const now = Date.now()
    const userRequests = this.requests.get(userId) || []
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      time => now - time < this.windowMs
    )
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(userId, validRequests)
    return true
  }
}
```

### Secure Token Management

```typescript
// lib/token-manager.ts
export async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    })
    
    const tokens = await response.json()
    
    if (!response.ok) {
      throw new Error('Token refresh failed')
    }
    
    return tokens.access_token
  } catch (error) {
    console.error('Token refresh error:', error)
    throw new Error('Authentication expired. Please sign in again.')
  }
}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Failures

**Problem**: "Authentication required" error
**Solutions:**
- Check if user is signed in: `useSession()` returns valid session
- Verify OAuth scopes include `gmail.readonly`
- Ensure `accessToken` is present in session
- Try signing out and back in

#### 2. Gmail API Quota Exceeded

**Problem**: "Rate limit exceeded" or quota errors
**Solutions:**
- Implement exponential backoff in API calls
- Reduce `maxResults` parameter
- Cache results to reduce API calls
- Monitor usage in Google Cloud Console

#### 3. No Emails Found

**Problem**: Analysis returns empty results
**Solutions:**
- Check search queries for user's email language
- Verify date range covers period with travel emails
- Test with known travel confirmation emails
- Adjust confidence threshold settings

#### 4. Low Confidence Scores

**Problem**: Travel emails detected but with low confidence
**Solutions:**
- Review and improve extraction patterns
- Add support for new email providers
- Fine-tune confidence scoring algorithm
- Manual verification of flagged emails

### Debug Mode Implementation

```typescript
// lib/debug-gmail.ts
export function enableGmailDebug() {
  if (process.env.NODE_ENV !== 'development') return
  
  // Log all Gmail API calls
  const originalFetch = global.fetch
  global.fetch = async (url, options) => {
    if (url.toString().includes('gmail')) {
      console.log('Gmail API Call:', url, options)
    }
    return originalFetch(url, options)
  }
}

// Debug component for development
export function GmailDebugPanel({ travelInfos }) {
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <div className="bg-gray-100 p-4 rounded mt-4">
      <h4 className="font-bold mb-2">Debug Information</h4>
      <pre className="text-xs overflow-auto">
        {JSON.stringify(travelInfos, null, 2)}
      </pre>
    </div>
  )
}
```

## Best Practices

### Performance Optimization

1. **Caching Strategy**
   ```typescript
   // Implement result caching
   const cache = new Map()
   
   async function getCachedAnalysis(cacheKey: string) {
     if (cache.has(cacheKey)) {
       return cache.get(cacheKey)
     }
     
     const result = await performAnalysis()
     cache.set(cacheKey, result)
     return result
   }
   ```

2. **Batch Processing**
   ```typescript
   // Process emails in batches to avoid timeouts
   async function batchProcessEmails(emails: any[], batchSize = 10) {
     const results = []
     
     for (let i = 0; i < emails.length; i += batchSize) {
       const batch = emails.slice(i, i + batchSize)
       const batchResults = await Promise.all(
         batch.map(email => analyzeEmail(email))
       )
       results.push(...batchResults)
     }
     
     return results
   }
   ```

3. **Progressive Loading**
   ```tsx
   function ProgressiveGmailResults({ travelInfos }) {
     const [displayCount, setDisplayCount] = useState(10)
     
     return (
       <div>
         {travelInfos.slice(0, displayCount).map(info => (
           <TravelInfoCard key={info.emailId} info={info} />
         ))}
         
         {displayCount < travelInfos.length && (
           <button onClick={() => setDisplayCount(prev => prev + 10)}>
             Load More
           </button>
         )}
       </div>
     )
   }
   ```

### User Experience Guidelines

1. **Clear Communication**
   - Always explain what the integration does
   - Show progress during analysis
   - Provide clear error messages
   - Explain privacy and security measures

2. **Graceful Degradation**
   - Handle network failures gracefully
   - Provide offline functionality where possible
   - Show meaningful empty states
   - Offer manual alternatives

3. **Responsive Design**
   - Optimize for mobile devices
   - Use appropriate touch targets
   - Ensure readability at all screen sizes
   - Test with different orientations

### Testing Recommendations

1. **Unit Testing**
   ```typescript
   // Test email parsing functions
   describe('extractTravelInfo', () => {
     it('should extract flight information correctly', () => {
       const emailContent = {
         subject: 'Your flight KE123 confirmation',
         body: 'Flight KE123 Seoul (ICN) to Paris (CDG) on 2024-02-15'
       }
       
       const result = extractTravelInfo(emailContent)
       
       expect(result.flightNumber).toBe('KE123')
       expect(result.departure).toBe('ICN')
       expect(result.destination).toBe('CDG')
     })
   })
   ```

2. **Integration Testing**
   ```typescript
   // Test API endpoints
   describe('Gmail API', () => {
     it('should return travel information', async () => {
       const response = await fetch('/api/gmail/analyze?maxResults=5')
       const data = await response.json()
       
       expect(response.ok).toBe(true)
       expect(data.success).toBe(true)
       expect(Array.isArray(data.travelInfos)).toBe(true)
     })
   })
   ```

3. **E2E Testing**
   ```typescript
   // Test complete user workflow
   test('Gmail integration workflow', async ({ page }) => {
     await page.goto('/gmail')
     await page.click('[data-testid="analyze-emails-btn"]')
     await page.waitForText('Analysis complete')
     
     const resultCount = await page.locator('[data-testid="result-count"]').textContent()
     expect(parseInt(resultCount)).toBeGreaterThan(0)
   })
   ```

## Deployment Considerations

### Environment Configuration

**Production Environment Variables:**
```env
# Production OAuth settings
GOOGLE_CLIENT_ID=prod_client_id
GOOGLE_CLIENT_SECRET=prod_client_secret
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=strong_production_secret

# Rate limiting
GMAIL_RATE_LIMIT_PER_HOUR=100
GMAIL_RATE_LIMIT_PER_DAY=1000

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

### Monitoring and Analytics

```typescript
// lib/monitoring.ts
export function trackGmailUsage(event: string, metadata: any) {
  // Analytics tracking
  analytics.track('Gmail Integration', {
    event,
    timestamp: new Date(),
    ...metadata
  })
  
  // Error monitoring
  if (event === 'error') {
    console.error('Gmail Integration Error:', metadata)
    // Send to monitoring service
  }
}
```

This integration guide provides a comprehensive foundation for implementing and using Gmail features in the DINO application. Follow the security best practices and test thoroughly before deploying to production.
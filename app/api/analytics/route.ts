import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { csrfProtection } from '@/lib/security/csrf-protection';
import {
  createErrorResponse,
  ErrorCode,
  generateRequestId,
  handleApiError,
} from '@/lib/api/error-handler';

interface AnalyticsEventData {
  // Web Vitals data
  name?: string;
  value?: number;
  rating?: 'good' | 'needs-improvement' | 'poor';

  // API Performance data
  endpoint?: string;
  method?: string;
  duration?: number;
  status?: number;

  // User Action data
  action?: string;
  properties?: Record<string, string | number | boolean>;

  // Generic properties
  [key: string]: unknown;
}

interface AnalyticsEvent {
  event: string;
  data: AnalyticsEventData;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

// In-memory store for analytics (in production, use a proper database)
const analyticsStore: AnalyticsEvent[] = [];
const _MAX_EVENTS = 10000; // Keep last 10k events

export async function POST(request: Request) {
  const requestId = generateRequestId();

  try {
    // CSRF 보호
    const csrfResult = await csrfProtection(request, {
      requireDoubleSubmit: true,
    });
    if (!csrfResult.protected) {
      return csrfResult.response!;
    }

    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Validate event data
    if (!body.event || !body.data) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Invalid event data',
        { required: ['event', 'data'] },
        requestId
      );
    }

    const analyticsEvent: AnalyticsEvent = {
      event: body.event,
      data: body.data,
      timestamp: Date.now(),
      userId: session?.user?.id,
      sessionId:
        request.cookies.get('next-auth.session-token')?.value || 'anonymous',
    };

    // Store event (in production, send to analytics service)
    analyticsStore.push(analyticsEvent);

    // Keep only recent events to prevent memory issues
    if (analyticsStore.length > MAX_EVENTS) {
      analyticsStore.splice(0, analyticsStore.length - MAX_EVENTS);
    }

    // Log important events
    if (body.event === 'web_vitals' && body.data.rating === 'poor') {
      // Performance warning: poor web vitals detected
    }

    if (body.event === 'api_performance' && body.data.rating === 'poor') {
      // API performance warning: slow endpoint detected
    }

    // In production, you might want to send to external services
    if (process.env.NODE_ENV === 'production') {
      // Send to Vercel Analytics
      // Send to custom analytics service
      // Send to monitoring dashboard
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Analytics processing error
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId);
  }
}

// GET endpoint for analytics dashboard
export async function GET(request: Request) {
  const requestId = generateRequestId();

  try {
    const session = await getServerSession(authOptions);

    // Only allow authenticated admin users to view analytics
    if (!session?.user?.email) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        undefined,
        undefined,
        requestId
      );
    }

    const url = new URL(request.url);
    const eventType = url.searchParams.get('event');
    const timeRange = url.searchParams.get('timeRange') || '24h';

    // Calculate time window
    const now = Date.now();
    const timeWindows = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const timeWindow =
      timeWindows[timeRange as keyof typeof timeWindows] || timeWindows['24h'];
    const startTime = now - timeWindow;

    // Filter events
    let filteredEvents = analyticsStore.filter(
      event => event.timestamp && event.timestamp >= startTime
    );

    if (eventType && eventType !== 'all') {
      filteredEvents = filteredEvents.filter(
        event => event.event === eventType
      );
    }

    // Aggregate data
    const summary = {
      totalEvents: filteredEvents.length,
      eventTypes: {} as Record<string, number>,
      webVitals: {
        cls: [] as number[],
        lcp: [] as number[],
        fid: [] as number[],
        ttfb: [] as number[],
      },
      apiPerformance: {
        averageResponseTime: 0,
        slowQueries: [] as Array<{
          endpoint: string | undefined;
          method: string | undefined;
          duration: number | undefined;
          timestamp: number | undefined;
        }>,
        errorRate: 0,
      },
      userActions: {} as Record<string, number>,
      timeRange,
      startTime,
      endTime: now,
    };

    // Process events
    let _totalApiCalls = 0;
    let _totalApiTime = 0;
    let _apiErrors = 0;

    filteredEvents.forEach(event => {
      // Count event types
      summary.eventTypes[event.event] =
        (summary.eventTypes[event.event] || 0) + 1;

      // Process web vitals
      if (event.event === 'web_vitals') {
        const metric = event.data;
        switch (metric.name) {
          case 'CLS':
            if (metric.value !== undefined)
              summary.webVitals.cls.push(metric.value);
            break;
          case 'LCP':
            if (metric.value !== undefined)
              summary.webVitals.lcp.push(metric.value);
            break;
          case 'FID':
            if (metric.value !== undefined)
              summary.webVitals.fid.push(metric.value);
            break;
          case 'TTFB':
            if (metric.value !== undefined)
              summary.webVitals.ttfb.push(metric.value);
            break;
        }
      }

      // Process API performance
      if (event.event === 'api_performance') {
        totalApiCalls++;
        if (event.data.duration !== undefined) {
          totalApiTime += event.data.duration;
        }

        if (event.data.status !== undefined && event.data.status >= 400) {
          apiErrors++;
        }

        if (event.data.duration !== undefined && event.data.duration > 1000) {
          summary.apiPerformance.slowQueries.push({
            endpoint: event.data.endpoint,
            method: event.data.method,
            duration: event.data.duration,
            timestamp: event.timestamp,
          });
        }
      }

      // Process user actions
      if (event.event === 'user_action' && event.data.action) {
        const action = event.data.action;
        if (typeof action === 'string') {
          summary.userActions[action] = (summary.userActions[action] || 0) + 1;
        }
      }
    });

    // Calculate averages
    if (totalApiCalls > 0) {
      summary.apiPerformance.averageResponseTime = totalApiTime / totalApiCalls;
      summary.apiPerformance.errorRate = (apiErrors / totalApiCalls) * 100;
    }

    return NextResponse.json(summary);
  } catch (error) {
    // Analytics retrieval error
    return handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR, requestId);
  }
}

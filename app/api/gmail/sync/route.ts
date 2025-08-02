/**
 * DINO v2.0 - Gmail Sync API Endpoint
 * Strict TypeScript implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { createGmailService } from '@/lib/gmail/gmail-service';
import { createFlightParser } from '@/lib/gmail/flight-parser';
import { createTravelPeriodCreator } from '@/lib/gmail/travel-period-creator';
import { createMetricsCollector } from '@/lib/gmail/parsing-metrics';
import type { GmailSyncResponse, GmailSyncRequest, EmailParseResult } from '@/types/gmail';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get access token from session
    const accessToken = (session as any).accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'Gmail access not authorized. Please re-authenticate with Gmail permissions.',
          needsReauth: true 
        },
        { status: 403 }
      );
    }

    // Parse request
    const body = await request.json() as GmailSyncRequest;
    
    console.log('📅 Received date range request:', {
      dateRange: body.dateRange,
      forceSync: body.forceSync
    });
    
    // Create Gmail service and metrics collector
    const gmailService = createGmailService(accessToken);
    const metricsCollector = createMetricsCollector();
    
    const startTime = new Date();
    const syncStatus: GmailSyncStatus = {
      isRunning: true,
      lastSync: null,
      lastError: null,
      emailsProcessed: 0,
      flightsFound: 0,
      periodsCreated: 0,
      startedAt: startTime,
      completedAt: null,
    };

    try {
      // Search for flight emails with date range
      const searchOptions = {
        maxResults: body.dateRange ? 200 : 100, // 더 긴 기간이면 더 많은 결과
        ...(body.dateRange && {
          dateAfter: new Date(body.dateRange.from),
          dateBefore: new Date(body.dateRange.to),
        }),
      };

      console.log('🔍 Gmail search options:', {
        maxResults: searchOptions.maxResults,
        dateAfter: searchOptions.dateAfter?.toLocaleDateString(),
        dateBefore: searchOptions.dateBefore?.toLocaleDateString(),
      });

      console.log('🔍 Searching for flight emails...');
      const messageIds = await gmailService.searchFlightEmails(searchOptions);
      console.log(`📧 Found ${messageIds.length} potential flight emails`);
      
      if (messageIds.length === 0) {
        console.log('⚠️ No emails found. This might indicate:');
        console.log('  - No travel emails in the specified date range');
        console.log('  - Search query might be too restrictive');
        console.log('  - Gmail API access might be limited');
      }

      syncStatus.emailsProcessed = messageIds.length;

      // Create parser instances
      const flightParser = createFlightParser();
      const periodCreator = createTravelPeriodCreator();
      
      // Process each email and extract flight data
      const parseResults: EmailParseResult[] = [];
      const allFlights = [];
      
      for (const messageId of messageIds.slice(0, 100)) { // Process up to 100 emails
        try {
          metricsCollector.recordEmail();
          
          const message = await gmailService.getMessage(messageId);
          const textContent = gmailService.extractTextContent(message);
          const isFlightEmail = gmailService.isFlightEmail(message, textContent);
          
          if (isFlightEmail) {
            metricsCollector.recordFlightEmail();
            const headers = gmailService.getHeaders(message);
            const subject = headers['subject'] || 'No subject';
            const from = headers['from'] || 'Unknown sender';
            const date = new Date(parseInt(message.internalDate));
            
            // Parse flight information from email
            const parseResult = flightParser.parseFlightEmail(
              messageId,
              subject,
              from,
              date,
              textContent
            );
            
            parseResults.push(parseResult);
            
            if (parseResult.flights.length > 0) {
              allFlights.push(...parseResult.flights);
              syncStatus.flightsFound += parseResult.flights.length;
              console.log(`✅ Email "${subject}": ${parseResult.flights.length} flights found (confidence: ${parseResult.confidence})`);
              
              // 상세 항공편 정보 로깅 및 메트릭 기록
              parseResult.flights.forEach((flight, index) => {
                console.log(`  Flight ${index + 1}: ${flight.flightNumber} (${flight.airline}) - ${flight.departureAirport.city} → ${flight.arrivalAirport.city}`);
                
                // Record metrics for each flight
                metricsCollector.recordFlight(
                  flight.confidence,
                  flight.airline,
                  flight.departureAirport.code || 'UNKNOWN',
                  flight.arrivalAirport.code || 'UNKNOWN'
                );
              });
            } else {
              console.log(`❌ Email "${subject}": No flights found (confidence: ${parseResult.confidence})`);
              
              // 디버깅 정보 추가
              if (parseResult.parseErrors.length > 0) {
                console.log(`  Parse errors:`, parseResult.parseErrors);
              }
              
              // 이메일 내용 일부 출력 (항공편 번호 찾기 위해)
              console.log(`  Content preview (first 300 chars):`, textContent.substring(0, 300));
              
              // 주요 키워드 검색
              const keywords = ['flight', 'booking', 'confirmation', 'ticket', 'airline', '항공편', '예약', '확인'];
              const foundKeywords = keywords.filter(keyword => 
                textContent.toLowerCase().includes(keyword.toLowerCase())
              );
              if (foundKeywords.length > 0) {
                console.log(`  Found keywords:`, foundKeywords);
              }
            }
          }
        } catch (error) {
          console.error(`Error processing email ${messageId}:`, error);
          metricsCollector.recordError();
          // Continue processing other emails
        }
      }
      
      // Create travel periods from extracted flights
      let travelPeriods = periodCreator.createTravelPeriods(allFlights);
      
      // Merge overlapping periods
      travelPeriods = periodCreator.mergeTravelPeriods(travelPeriods);
      
      syncStatus.periodsCreated = travelPeriods.length;
      
      console.log(`📅 Created ${travelPeriods.length} travel periods from ${allFlights.length} flights`);

      const completedAt = new Date();
      const updatedStatus: GmailSyncStatus = {
        ...syncStatus,
        isRunning: false,
        completedAt: completedAt,
        lastSync: completedAt,
      };

      // Get metrics report
      const metricsReport = metricsCollector.getReport();
      console.log(metricsReport);
      
      console.log(`✅ Gmail sync completed:`, {
        emailsProcessed: syncStatus.emailsProcessed,
        flightsFound: syncStatus.flightsFound, 
        periodsCreated: syncStatus.periodsCreated,
        travelPeriodsLength: travelPeriods.length
      });

      const response: GmailSyncResponse = {
        success: true,
        status: updatedStatus,
        periods: travelPeriods,
        errors: [],
      };

      return NextResponse.json(response);

    } catch (gmailError) {
      const errorMessage = gmailError instanceof Error ? gmailError.message : 'Gmail API error';
      console.error('Gmail sync error:', gmailError);
      
      const errorStatus: GmailSyncStatus = {
        ...syncStatus,
        isRunning: false,
        lastError: errorMessage,
        completedAt: new Date(),
      };

      const response: GmailSyncResponse = {
        success: false,
        status: errorStatus,
        periods: [],
        errors: [errorMessage],
      };

      return NextResponse.json(response, { status: 500 });
    }

  } catch (error) {
    console.error('Gmail sync API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Return sync status (placeholder for now)
    return NextResponse.json({
      hasGmailAccess: !!(session as any).accessToken,
      lastSync: null,
      isConfigured: true,
    });

  } catch (error) {
    console.error('Gmail status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
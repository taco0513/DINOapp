/**
 * DINO v2.0 - Gmail Sync Client Component
 * Strict TypeScript with Client Component pattern
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { GmailSyncResponse, GmailSyncStatus, TravelPeriod } from '@/types/gmail';
import type { CountryVisit } from '@/types/schengen';
import { createTravelImporter } from '@/lib/gmail/travel-importer';
import { useTravelData } from '@/contexts/TravelDataContext';
import { FlightCard } from '@/components/ui/FlightCard';
import { FlightRoute } from '@/components/ui/FlightRoute';
import { FlightStatus } from '@/components/ui/FlightStatus';
import { SyncProgressIndicator } from './SyncProgressIndicator';
import { FlightConfirmationDialog } from './FlightConfirmationDialog';
import { FlightEditDialog } from './FlightEditDialog';
import type { Flight } from '@/types/flight';
import type { FlightInfo } from '@/types/gmail';

// Helper function to safely format dates that might be strings or Date objects
const formatDate = (date: Date | string | null): string => {
  if (!date) return 'Unknown';
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

// Helper function to convert travel period flight data to Flight type for UI components
const convertToFlightData = (flightInfo: any, index: number): Flight => {
  const departureTime = flightInfo.date ? new Date(flightInfo.date) : new Date();
  const arrivalTime = new Date(departureTime.getTime() + (2 * 60 * 60 * 1000)); // Default 2h flight
  
  return {
    id: `flight-${index}-${Date.now()}`,
    flightNumber: flightInfo.flightNumber || 'UNKNOWN',
    airline: {
      code: flightInfo.airline || 'XX',
      name: flightInfo.airline || 'Unknown Airline',
    },
    departure: {
      airport: {
        code: flightInfo.departureAirport?.code || flightInfo.departureAirport?.city || 'UNK',
        name: flightInfo.departureAirport?.name || flightInfo.departureAirport?.city || 'Unknown Airport',
        city: flightInfo.departureAirport?.city || 'Unknown City',
        country: flightInfo.departureAirport?.country || 'Unknown Country',
        timezone: flightInfo.departureAirport?.timezone || 'UTC',
      },
      scheduledTime: departureTime,
    },
    arrival: {
      airport: {
        code: flightInfo.arrivalAirport?.code || flightInfo.arrivalAirport?.city || 'UNK',
        name: flightInfo.arrivalAirport?.name || flightInfo.arrivalAirport?.city || 'Unknown Airport',
        city: flightInfo.arrivalAirport?.city || 'Unknown City',
        country: flightInfo.arrivalAirport?.country || 'Unknown Country',
        timezone: flightInfo.arrivalAirport?.timezone || 'UTC',
      },
      scheduledTime: arrivalTime,
    },
    status: flightInfo.flightNumber && flightInfo.flightNumber !== 'UNKNOWN' ? 'departed' : 'scheduled',
  };
};

// Helper function to calculate date range
const getDateRange = (range: string): { from: Date; to: Date } => {
  const now = new Date();
  const to = new Date(); // 오늘까지
  let from = new Date();

  switch (range) {
    case '1month':
      from.setMonth(now.getMonth() - 1);
      break;
    case '3months':
      from.setMonth(now.getMonth() - 3);
      break;
    case '6months':
      from.setMonth(now.getMonth() - 6);
      break;
    case '1year':
      from.setFullYear(now.getFullYear() - 1);
      break;
    case '3years':
      from.setFullYear(now.getFullYear() - 3);
      break;
    case 'all':
      from.setFullYear(now.getFullYear() - 10); // 10년 전까지
      break;
    default:
      from.setMonth(now.getMonth() - 6); // 기본 6개월
  }

  return { from, to };
};

// 중복 항공편 제거 함수
function removeDuplicatePeriods(periods: any[]): any[] {
  const uniquePeriods: any[] = [];
  const flightMap = new Map<string, any>();
  
  // 모든 항공편을 맵에 저장 (키: 경로+날짜, 값: 최고 품질의 period)
  for (const period of periods) {
    const flight = period.flights[0];
    if (!flight) continue;
    
    // 날짜 정규화 (시간 제외)
    const departureDate = new Date(flight.date || flight.departureDate || period.entryDate);
    const dateStr = `${departureDate.getFullYear()}-${String(departureDate.getMonth() + 1).padStart(2, '0')}-${String(departureDate.getDate()).padStart(2, '0')}`;
    
    // 공항 코드 정규화
    const depCode = flight.departureAirport.code || flight.departureAirport.city || 'UNKNOWN';
    const arrCode = flight.arrivalAirport.code || flight.arrivalAirport.city || 'UNKNOWN';
    
    // 유니크 키 생성
    const flightKey = `${depCode}-${arrCode}-${dateStr}`;
    
    // 기존 항목과 비교하여 더 나은 품질의 데이터 선택
    const existing = flightMap.get(flightKey);
    if (!existing || shouldReplace(existing, period)) {
      flightMap.set(flightKey, period);
    }
  }
  
  // 맵의 값들을 배열로 변환
  uniquePeriods.push(...flightMap.values());
  
  // 날짜 순으로 정렬
  uniquePeriods.sort((a, b) => {
    const dateA = new Date(a.entryDate || a.flights[0]?.departureDate);
    const dateB = new Date(b.entryDate || b.flights[0]?.departureDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  console.log(`중복 제거: ${periods.length}개 → ${uniquePeriods.length}개`);
  
  // 디버깅을 위한 상세 로그
  if (periods.length !== uniquePeriods.length) {
    console.log('제거된 중복 항목들:');
    const removedCount = periods.length - uniquePeriods.length;
    console.log(`총 ${removedCount}개의 중복 항목 제거됨`);
  }
  
  return uniquePeriods;
}

// 기존 period를 새 period로 교체해야 하는지 판단
function shouldReplace(existing: any, newPeriod: any): boolean {
  const existingFlight = existing.flights[0];
  const newFlight = newPeriod.flights[0];
  
  // 점수 기반 비교
  const existingScore = calculateQualityScore(existing, existingFlight);
  const newScore = calculateQualityScore(newPeriod, newFlight);
  
  return newScore > existingScore;
}

// Period의 품질 점수 계산
function calculateQualityScore(period: any, flight: any): number {
  let score = 0;
  
  // 항공편 번호가 있으면 +50점
  if (flight.flightNumber && flight.flightNumber !== 'UNKNOWN') {
    score += 50;
  }
  
  // 항공사 정보가 있으면 +20점
  if (flight.airline && flight.airline !== 'Unknown Airline') {
    score += 20;
  }
  
  // 예약 번호가 있으면 +15점
  if (flight.bookingReference) {
    score += 15;
  }
  
  // 신뢰도 점수 추가 (최대 10점)
  score += (period.confidence || 0) * 10;
  
  // 승객 이름이 있으면 +5점
  if (flight.passengerName) {
    score += 5;
  }
  
  return score;
}

// Round Trip 감지 함수
function detectRoundTrips(periods: any[]): Array<{
  id: string;
  outbound: any;
  return: any;
  suggestion: string;
  merged?: any;
}> {
  const suggestions: Array<{
    id: string;
    outbound: any;
    return: any;
    suggestion: string;
    merged?: any;
  }> = [];
  
  // 이미 처리된 period ID들을 추적
  const processedPairs = new Set<string>();
  
  for (let i = 0; i < periods.length; i++) {
    for (let j = i + 1; j < periods.length; j++) {
      const period1 = periods[i];
      const period2 = periods[j];
      
      // 이미 처리된 조합인지 확인
      const pairKey = [period1.id, period2.id].sort().join('-');
      if (processedPairs.has(pairKey)) continue;
      
      // 왕복 여행 감지 조건:
      // 1. 하나는 A→B, 다른 하나는 B→A 패턴
      // 2. 시간적으로 연결됨 (7일 이내)
      
      const flight1 = period1.flights[0];
      const flight2 = period2.flights[0];
      
      if (!flight1 || !flight2) continue;
      
      // A→B와 B→A 패턴 확인
      const isRoundTrip = 
        flight1.departureAirport.countryCode === flight2.arrivalAirport.countryCode &&
        flight1.arrivalAirport.countryCode === flight2.departureAirport.countryCode;
      
      if (isRoundTrip) {
        // 시간 차이 확인 (7일 이내)
        const timeDiff = Math.abs(
          new Date(period2.entryDate).getTime() - new Date(period1.entryDate).getTime()
        );
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 30) { // 30일 이내면 왕복으로 간주
          // 시간순 정렬 (outbound가 먼저)
          const [outbound, returnFlight] = new Date(period1.entryDate) < new Date(period2.entryDate) 
            ? [period1, period2] 
            : [period2, period1];
          
          const suggestion = `${outbound.countryName} 왕복 여행으로 보입니다. 하나로 합치시겠습니까?`;
          
          // 병합된 여행 생성
          const merged = {
            id: `merged-${outbound.id}-${returnFlight.id}`,
            countryCode: outbound.countryCode,
            countryName: outbound.countryName,
            entryDate: outbound.entryDate,
            exitDate: returnFlight.entryDate, // 돌아온 날
            flights: [...outbound.flights, ...returnFlight.flights],
            purpose: outbound.purpose,
            notes: `왕복 여행: ${flight1.departureAirport.city} ⇄ ${flight1.arrivalAirport.city} | ${outbound.flights.length + returnFlight.flights.length}개 항공편`,
            confidence: Math.max(outbound.confidence, returnFlight.confidence),
            extractedAt: new Date(),
          };
          
          // 이 조합을 처리된 것으로 표시
          processedPairs.add(pairKey);
          
          suggestions.push({
            id: `suggestion-${i}-${j}`,
            outbound,
            return: returnFlight,
            suggestion,
            merged
          });
        }
      }
    }
  }
  
  return suggestions;
}

interface GmailSyncClientProps {
  readonly initialStatus?: {
    readonly hasGmailAccess: boolean;
    readonly lastSync: string | null;
    readonly isConfigured: boolean;
  };
}

export function GmailSyncClient({ initialStatus }: GmailSyncClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { setImportData, importToMultipleDestinations } = useTravelData();
  
  const [syncStatus, setSyncStatus] = useState<GmailSyncStatus | null>(null);
  const [travelPeriods, setTravelPeriods] = useState<readonly any[]>([]);
  const [convertedVisits, setConvertedVisits] = useState<readonly CountryVisit[]>([]);
  const [importResult, setImportResult] = useState<any>(null);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(['schengen']);
  const [dateRange, setDateRange] = useState<string>('6months'); // 기본 6개월
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState({
    emailsProcessed: 0,
    totalEmails: 0,
    flightsFound: 0,
    currentStep: '',
    estimatedTimeRemaining: 0,
  });
  const [roundTripSuggestions, setRoundTripSuggestions] = useState<Array<{
    id: string;
    outbound: any;
    return: any;
    suggestion: string;
    merged?: any;
  }>>([]);
  
  // Manual confirmation states
  const [pendingFlights, setPendingFlights] = useState<FlightInfo[]>([]);
  const [currentFlightIndex, setCurrentFlightIndex] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [confirmedFlights, setConfirmedFlights] = useState<FlightInfo[]>([]);
  const [rejectedFlights, setRejectedFlights] = useState<FlightInfo[]>([]);

  // Debug logging
  console.log('GmailSyncClient debug:', {
    hasSession: !!session,
    initialStatus,
    sessionEmail: session?.user?.email,
  });

  const handleSync = useCallback(async () => {
    if (!session) return;

    setIsLoading(true);
    setError(null);
    setLoadingMessage('📧 Gmail 이메일 검색 중...');

    try {
      const response = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forceSync: true,
          dateRange: getDateRange(dateRange),
        }),
      });

      setLoadingMessage('✈️ 항공편 정보 파싱 중...');
      const data = await response.json() as GmailSyncResponse;

      if (!response.ok) {
        throw new Error(data.errors?.[0] || 'Gmail sync failed');
      }

      setSyncStatus(data.status);
      
      // 중복 항공편 제거
      const uniquePeriods = removeDuplicatePeriods(data.periods || []);
      
      // Extract all flights for manual confirmation
      const allExtractedFlights: FlightInfo[] = [];
      uniquePeriods.forEach(period => {
        allExtractedFlights.push(...period.flights);
      });
      
      // Start manual confirmation process
      if (allExtractedFlights.length > 0) {
        setPendingFlights(allExtractedFlights);
        setCurrentFlightIndex(0);
        setShowConfirmDialog(true);
        setConfirmedFlights([]);
        setRejectedFlights([]);
      } else {
        // No flights found
        setTravelPeriods([]);
      }
      
      if (data.success) {
        // Show success message or redirect
        const selectedRange = getDateRange(dateRange);
        console.log('✅ Gmail sync completed successfully:', data);
        console.log(`📅 Found ${data.periods?.length || 0} travel periods`);
        console.log(`🗓️ Date range: ${selectedRange.from.toLocaleDateString()} ~ ${selectedRange.to.toLocaleDateString()}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Gmail sync error:', err);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [session, dateRange]);

  const handleImportConversion = useCallback(() => {
    if (!session?.user?.email || travelPeriods.length === 0) return;

    try {
      const importer = createTravelImporter(session.user.email);
      const result = importer.convertTravelPeriods(travelPeriods);
      
      setImportResult(result);
      setConvertedVisits(result.visits);
      
      console.log('✅ Import conversion completed:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Import conversion failed';
      setError(errorMessage);
      console.error('Import conversion error:', err);
    }
  }, [session, travelPeriods]);

  const handleMultiImport = useCallback(async (destinations: string[]) => {
    if (!session?.user?.email || convertedVisits.length === 0) return;

    setIsImporting(true);
    setError(null);

    try {
      const importData = {
        source: 'gmail' as const,
        visits: convertedVisits,
        originalPeriods: travelPeriods,
        importedAt: new Date(),
        userId: session.user.email,
      };

      const result = await importToMultipleDestinations(importData, destinations);
      
      if (result.success) {
        console.log('✅ Multi-import completed successfully:', result);
        
        // Navigate to first successful destination
        const firstSuccess = Object.entries(result.results).find(([_, success]) => success)?.[0];
        if (firstSuccess === 'schengen') {
          router.push('/schengen?imported=true');
        } else if (firstSuccess === 'trips') {
          router.push('/trips?imported=true');
        } else if (firstSuccess === 'analytics') {
          router.push('/analytics?imported=true');
        }
      } else {
        const failedDestinations = Object.entries(result.results)
          .filter(([_, success]) => !success)
          .map(([dest]) => dest);
        setError(`Import failed for: ${failedDestinations.join(', ')}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Multi-import failed';
      setError(errorMessage);
      console.error('Multi-import error:', err);
    } finally {
      setIsImporting(false);
    }
  }, [session, convertedVisits, travelPeriods, importToMultipleDestinations, router]);

  const handleReauthorize = useCallback(() => {
    // Sign out first to clear the old session, then redirect to sign in with new permissions
    window.location.href = '/api/auth/signout?callbackUrl=' + encodeURIComponent('/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href));
  }, []);

  // Flight confirmation handlers
  const handleConfirmFlight = useCallback(() => {
    const currentFlight = pendingFlights[currentFlightIndex];
    if (currentFlight) {
      setConfirmedFlights(prev => [...prev, currentFlight]);
    }
    
    // Move to next flight
    if (currentFlightIndex < pendingFlights.length - 1) {
      setCurrentFlightIndex(prev => prev + 1);
    } else {
      // All flights processed
      finishConfirmationProcess();
    }
  }, [currentFlightIndex, pendingFlights]);

  const handleRejectFlight = useCallback(() => {
    const currentFlight = pendingFlights[currentFlightIndex];
    if (currentFlight) {
      setRejectedFlights(prev => [...prev, currentFlight]);
    }
    
    // Move to next flight
    if (currentFlightIndex < pendingFlights.length - 1) {
      setCurrentFlightIndex(prev => prev + 1);
    } else {
      // All flights processed
      finishConfirmationProcess();
    }
  }, [currentFlightIndex, pendingFlights]);

  const handleEditFlight = useCallback((flight: FlightInfo) => {
    setShowConfirmDialog(false);
    setShowEditDialog(true);
  }, []);

  const handleSaveEditedFlight = useCallback((editedFlight: FlightInfo) => {
    // Update the flight in pending flights
    const updatedPendingFlights = [...pendingFlights];
    updatedPendingFlights[currentFlightIndex] = editedFlight;
    setPendingFlights(updatedPendingFlights);
    
    // Go back to confirmation dialog
    setShowEditDialog(false);
    setShowConfirmDialog(true);
  }, [currentFlightIndex, pendingFlights]);

  const finishConfirmationProcess = useCallback(() => {
    setShowConfirmDialog(false);
    
    // Create travel periods from confirmed flights only
    if (confirmedFlights.length > 0) {
      const { createTravelPeriodCreator } = require('@/lib/gmail/travel-period-creator');
      const periodCreator = createTravelPeriodCreator();
      const confirmedPeriods = periodCreator.createTravelPeriods(confirmedFlights);
      setTravelPeriods(confirmedPeriods);
      
      // Detect round trips in confirmed flights
      const suggestions = detectRoundTrips(confirmedPeriods);
      setRoundTripSuggestions(suggestions);
    } else {
      setTravelPeriods([]);
      setRoundTripSuggestions([]);
    }
    
    // Show summary
    console.log(`✅ 확인된 항공편: ${confirmedFlights.length}개`);
    console.log(`❌ 거부된 항공편: ${rejectedFlights.length}개`);
    
    // Reset states
    setPendingFlights([]);
    setCurrentFlightIndex(0);
  }, [confirmedFlights, rejectedFlights]);

  if (!session) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">Please sign in to sync your Gmail flight data.</p>
      </div>
    );
  }

  return (
    <>
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            ✈️ Gmail Flight Sync
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Automatically import flight data from your Gmail
          </p>
        </div>
        
        {initialStatus?.hasGmailAccess ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Connected
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⚠️ Authorization Needed
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
          {(error.includes('re-authenticate') || error.includes('authentication expired') || error.includes('401')) && (
            <div className="mt-2">
              <p className="text-xs text-red-600 mb-2">
                Gmail 인증이 만료되었습니다. 다시 로그인해주세요.
              </p>
              <button
                onClick={handleReauthorize}
                className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                🔑 Gmail 재인증하기
              </button>
            </div>
          )}
        </div>
      )}

      {syncStatus && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-blue-900">Sync Results</h4>
            <span className="text-xs text-blue-600">
              {syncStatus.completedAt ? 
                new Date(syncStatus.completedAt).toLocaleTimeString() : 
                'In progress...'}
            </span>
          </div>
          
          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-600">📧 Emails:</span>
              <span className="ml-1 font-medium">{syncStatus.emailsProcessed || 0}</span>
            </div>
            <div>
              <span className="text-blue-600">✈️ Flights:</span>
              <span className="ml-1 font-medium">{syncStatus.flightsFound || 0}</span>
            </div>
            <div>
              <span className="text-blue-600">📅 Periods:</span>
              <span className="ml-1 font-medium">{syncStatus.periodsCreated || 0}</span>
            </div>
          </div>
          
          {/* Date Range Info */}
          <div className="mt-2 pt-2 border-t border-blue-200">
            <div className="text-xs text-blue-600">
              🗓️ <strong>검색 기간:</strong> {(() => {
                const range = getDateRange(dateRange);
                return `${range.from.toLocaleDateString()} ~ ${range.to.toLocaleDateString()}`;
              })()}
              <span className="ml-2 px-2 py-0.5 bg-blue-100 rounded text-blue-700">
                {dateRange === '1month' ? '최근 1개월' :
                 dateRange === '3months' ? '최근 3개월' :
                 dateRange === '6months' ? '최근 6개월' :
                 dateRange === '1year' ? '최근 1년' :
                 dateRange === '3years' ? '최근 3년' :
                 dateRange === 'all' ? '전체 기간' : '사용자 정의'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Round Trip 병합 제안 */}
      {roundTripSuggestions.length > 0 && (
        <div className="mb-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">🔄 왕복 여행 병합 제안</h4>
          {roundTripSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium mb-3">
                    💡 {suggestion.suggestion}
                  </p>
                  
                  {/* Round Trip Route Display with FlightRoute Component */}
                  <div className="bg-white rounded-md p-3 mb-3 border border-blue-300">
                    <div className="text-xs font-medium text-blue-800 mb-3">🛫 왕복 경로</div>
                    <div className="space-y-2">
                      {suggestion.merged.flights.map((flight: any, index: number) => (
                        <FlightRoute
                          key={index}
                          departure={{
                            code: flight.departureAirport.code || flight.departureAirport.city || 'UNK',
                            name: flight.departureAirport.name || flight.departureAirport.city || 'Unknown',
                            city: flight.departureAirport.city || 'Unknown',
                            country: flight.departureAirport.country || 'Unknown',
                            timezone: 'UTC'
                          }}
                          arrival={{
                            code: flight.arrivalAirport.code || flight.arrivalAirport.city || 'UNK',
                            name: flight.arrivalAirport.name || flight.arrivalAirport.city || 'Unknown',
                            city: flight.arrivalAirport.city || 'Unknown',
                            country: flight.arrivalAirport.country || 'Unknown',
                            timezone: 'UTC'
                          }}
                          size="sm"
                          showCities={true}
                          className="bg-gray-50 p-2 rounded"
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>📅 출발: {formatDate(suggestion.outbound.entryDate)}</div>
                    <div>📅 복귀: {formatDate(suggestion.return.entryDate)}</div>
                    <div>⏱️ 총 여행기간: {Math.ceil((new Date(suggestion.return.entryDate).getTime() - new Date(suggestion.outbound.entryDate).getTime()) / (1000 * 60 * 60 * 24))}일</div>
                    <div>✈️ 총 항공편: {suggestion.merged.flights.length}개</div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => {
                      // 병합된 여행으로 대체
                      const updatedPeriods = travelPeriods.filter(p => 
                        p.id !== suggestion.outbound.id && p.id !== suggestion.return.id
                      );
                      updatedPeriods.push(suggestion.merged);
                      setTravelPeriods(updatedPeriods);
                      
                      // 이 제안 제거
                      setRoundTripSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    ✅ 합치기
                  </button>
                  <button
                    onClick={() => {
                      // 이 제안만 제거
                      setRoundTripSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                  >
                    ❌ 거절
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sync Progress Indicator */}
      {isLoading && syncProgress.totalEmails > 0 && (
        <div className="mb-4">
          <SyncProgressIndicator
            emailsProcessed={syncProgress.emailsProcessed}
            totalEmails={syncProgress.totalEmails}
            flightsFound={syncProgress.flightsFound}
            currentStep={syncProgress.currentStep || loadingMessage}
            estimatedTimeRemaining={syncProgress.estimatedTimeRemaining}
          />
        </div>
      )}

      {travelPeriods.length > 0 && (
        <div className="mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">✈️ 발견된 항공편</h4>
            <span className="text-sm text-gray-500">
              총 {travelPeriods.reduce((acc, period) => acc + period.flights.length, 0)}개 항공편
            </span>
          </div>
          
          {travelPeriods.map((period) => (
            <div key={period.id} className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">🌏</div>
                  <div>
                    <div className="text-sm font-medium text-blue-900">
                      {period.countryName} 여행
                    </div>
                    <div className="text-xs text-blue-700">
                      {period.flights.length === 1 ? (
                        <span>단일 항공편 - {formatDate(period.entryDate)}</span>
                      ) : (
                        <>
                          {formatDate(period.entryDate)}
                          {period.exitDate && (
                            <span> → {formatDate(period.exitDate)}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    period.confidence > 0.7 
                      ? 'bg-green-100 text-green-800' 
                      : period.confidence > 0.4
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {Math.round(period.confidence * 100)}% 신뢰도
                  </span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {period.flights.length}개 항공편
                  </span>
                </div>
              </div>
              
              {/* Individual Flight Cards */}
              <div className="space-y-2 pl-4">
                {period.flights.map((flight: any, index: number) => {
                  const flightData = convertToFlightData(flight, index);
                  return (
                    <FlightCard
                      key={`${period.id}-flight-${index}`}
                      flight={flightData}
                      variant="minimal"
                      className="shadow-sm"
                    />
                  );
                })}
              </div>
              
              {/* Additional Travel Info */}
              <div className="pl-4 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">🎯 목적:</span> {
                      period.purpose === 'TOURISM' ? '관광' :
                      period.purpose === 'BUSINESS' ? '비즈니스' :
                      period.purpose === 'EDUCATION' ? '교육' :
                      period.purpose === 'TRANSIT' ? '경유' :
                      period.purpose
                    }
                  </div>
                  <div>
                    <span className="font-medium">📊 신뢰도:</span> {Math.round(period.confidence * 100)}%
                  </div>
                </div>
                
                {period.notes && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                    <span className="font-medium">ℹ️ 참고:</span> {period.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div className="mt-6 space-y-3">
            {/* Step 1: Convert data */}
            {!importResult && (
              <button
                onClick={handleImportConversion}
                disabled={travelPeriods.length === 0}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                🔄 Prepare for Import
              </button>
            )}
            
            {/* Step 2: Select destinations */}
            {importResult && !isImporting && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    📍 Select Import Destinations:
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'schengen', label: '🇪🇺 Schengen Calculator', desc: '90/180 day tracking' },
                      { id: 'trips', label: '🗺️ Trip History', desc: 'Travel timeline and records' },
                      { id: 'analytics', label: '📊 Analytics Dashboard', desc: 'Travel patterns and insights' }
                    ].map((destination) => (
                      <label key={destination.id} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDestinations.includes(destination.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDestinations(prev => [...prev, destination.id]);
                            } else {
                              setSelectedDestinations(prev => prev.filter(d => d !== destination.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{destination.label}</div>
                          <div className="text-xs text-gray-500">{destination.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => handleMultiImport(selectedDestinations)}
                  disabled={selectedDestinations.length === 0 || isImporting}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isImporting ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Importing to {selectedDestinations.length} destination{selectedDestinations.length > 1 ? 's' : ''}...
                    </>
                  ) : (
                    `🚀 Import to ${selectedDestinations.length} destination${selectedDestinations.length > 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            )}
            
            <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-md p-2">
              💡 <strong>Smart Import:</strong> Choose multiple destinations to populate all your DINO travel tools at once
            </div>
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className="mb-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">🧮 Schengen Import Results</h4>
          
          <div className={`border rounded-md p-3 ${
            importResult.success ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {importResult.success ? '✅ Import Ready' : '⚠️ Partial Import'}
              </span>
              <span className="text-xs text-gray-600">
                {importResult.importedCount} imported, {importResult.skippedCount} skipped
              </span>
            </div>

            {importResult.importedCount > 0 && (
              <div className="space-y-2">
                {convertedVisits.map((visit, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-md p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">🇪🇺 {visit.country}</span>
                      <span className="text-gray-500">{visit.visaType}</span>
                    </div>
                    <div className="text-gray-600 mt-1">
                      {formatDate(visit.entryDate)} → {formatDate(visit.exitDate)}
                    </div>
                  </div>
                ))}
                
                <div className="mt-3 flex space-x-2">
                  <a
                    href="/schengen"
                    className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    🇪🇺 Open Schengen Calculator
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(convertedVisits, null, 2));
                      alert('Data copied to clipboard!');
                    }}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-xs hover:bg-gray-50 transition-colors"
                  >
                    📋 Copy Data
                  </button>
                </div>
              </div>
            )}

            {importResult.errors.length > 0 && (
              <div className="mt-2 text-xs">
                <div className="font-medium text-gray-700 mb-1">Issues:</div>
                <ul className="space-y-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index} className="text-gray-600">• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Date Range Selection */}
        {initialStatus?.hasGmailAccess && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              📅 검색할 기간 선택:
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              disabled={isLoading}
              className="form-select"
            >
              <option value="1month" className="text-gray-900">📆 최근 1개월</option>
              <option value="3months" className="text-gray-900">📅 최근 3개월</option>
              <option value="6months" className="text-gray-900">🗓️ 최근 6개월 (권장)</option>
              <option value="1year" className="text-gray-900">📊 최근 1년</option>
              <option value="3years" className="text-gray-900">📈 최근 3년</option>
              <option value="all" className="text-gray-900">🔍 전체 기간 (10년)</option>
            </select>
            <div className="text-xs text-gray-500 mt-1">
              💡 기간이 길수록 더 많은 여행 기록을 찾을 수 있지만, 처리 시간이 오래 걸립니다.
              <br />
              📊 현재 선택: <strong>{(() => {
                const range = getDateRange(dateRange);
                return `${range.from.toLocaleDateString()} ~ ${range.to.toLocaleDateString()}`;
              })()}</strong>
            </div>
          </div>
        )}

        <button
          onClick={handleSync}
          disabled={isLoading || !initialStatus?.hasGmailAccess}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            initialStatus?.hasGmailAccess
              ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              {loadingMessage || 'Syncing Gmail...'}
            </>
          ) : (
            '🔄 Sync Flight Data'
          )}
        </button>

        {!initialStatus?.hasGmailAccess && (
          <div className="space-y-2">
            <button
              onClick={handleReauthorize}
              className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              📧 Authorize Gmail Access
            </button>
            <div className="text-xs text-gray-500 text-center">
              You'll need to sign out and sign in again to grant Gmail permissions
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>🔒 We only read flight-related emails. Your email data stays secure.</p>
        {initialStatus?.lastSync && (
          <p className="mt-1">
            Last sync: {new Date(initialStatus.lastSync).toLocaleString()}
          </p>
        )}
      </div>
    </div>

    {/* Flight Confirmation Dialog */}
    {showConfirmDialog && pendingFlights[currentFlightIndex] && (
      <FlightConfirmationDialog
        flight={pendingFlights[currentFlightIndex]}
        confidence={pendingFlights[currentFlightIndex].confidence}
        onConfirm={handleConfirmFlight}
        onReject={handleRejectFlight}
        onEdit={handleEditFlight}
      />
    )}

    {/* Flight Edit Dialog */}
    {showEditDialog && pendingFlights[currentFlightIndex] && (
      <FlightEditDialog
        flight={pendingFlights[currentFlightIndex]}
        onSave={handleSaveEditedFlight}
        onCancel={() => {
          setShowEditDialog(false);
          setShowConfirmDialog(true);
        }}
      />
    )}
  </>
  );
}
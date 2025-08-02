/**
 * DINO v2.0 - Travel Period Creator
 * Convert flight data into travel periods for Schengen calculation
 * Strict TypeScript implementation
 */

import type { FlightInfo, TravelPeriod, TravelPurpose } from '@/types/gmail';
import { v4 as uuidv4 } from 'uuid';

interface FlightGroup {
  readonly countryCode: string;
  readonly countryName: string;
  readonly flights: readonly FlightInfo[];
  readonly entryFlight: FlightInfo;
  readonly exitFlight: FlightInfo | null;
}

export class TravelPeriodCreator {
  /**
   * Convert flights into travel periods
   */
  createTravelPeriods(flights: readonly FlightInfo[]): readonly TravelPeriod[] {
    if (flights.length === 0) {
      return [];
    }

    // Sort flights by departure date
    const sortedFlights = [...flights].sort((a, b) => 
      a.departureDate.getTime() - b.departureDate.getTime()
    );

    // Create individual flight-based periods first
    const individualPeriods = this.createIndividualFlightPeriods(sortedFlights);
    
    return individualPeriods;
  }

  /**
   * Create individual periods for each one-way flight
   */
  private createIndividualFlightPeriods(flights: readonly FlightInfo[]): readonly TravelPeriod[] {
    const periods: TravelPeriod[] = [];
    
    for (const flight of flights) {
      // Skip domestic flights
      if (flight.departureAirport.countryCode === flight.arrivalAirport.countryCode) {
        continue;
      }
      
      const period = this.createSingleFlightPeriod(flight);
      if (period) {
        periods.push(period);
      }
    }
    
    return periods;
  }

  /**
   * Create a travel period from a single flight
   */
  private createSingleFlightPeriod(flight: FlightInfo): TravelPeriod | null {
    // 단일 항공편의 경우, 출발 국가에서 출국하는 것으로 간주
    const departureCountry = flight.departureAirport.countryCode;
    const departureCountryName = flight.departureAirport.country;
    
    // 출국일은 출발일, 귀국일은 미정 (단일 항공편이므로)
    const entryDate = flight.departureDate; // 이 국가를 떠나는 날
    const exitDate = flight.departureDate; // 같은 날 출국으로 처리
    
    // 기본 여행 목적
    const purpose = this.determineTravelPurpose([flight], flight);
    
    // 단일 항공편 신뢰도
    const confidence = flight.confidence;
    
    // 항공편 정보 기반 노트
    const notes = this.generateSingleFlightNotes(flight);
    
    return {
      id: uuidv4(),
      countryCode: departureCountry,
      countryName: departureCountryName,
      entryDate,
      exitDate,
      flights: [flight],
      purpose,
      notes,
      confidence,
      extractedAt: new Date(),
    };
  }

  /**
   * Generate notes for a single flight
   */
  private generateSingleFlightNotes(flight: FlightInfo): string {
    const notes: string[] = [];
    
    // 항공편 정보
    if (flight.flightNumber) {
      notes.push(`항공편: ${flight.flightNumber}`);
    }
    
    // 경로
    notes.push(`출국: ${flight.departureAirport.city} → ${flight.arrivalAirport.city}`);
    
    // 항공사
    if (flight.airline && flight.airline !== 'Unknown Airline') {
      notes.push(`항공사: ${flight.airline}`);
    }
    
    // 예약 번호
    if (flight.bookingReference) {
      notes.push(`예약: ${flight.bookingReference}`);
    }
    
    // 단일 항공편 표시
    notes.push('단일 항공편 (출국일 미정)');
    
    return notes.join(' | ');
  }

  /**
   * Create trip-based periods by grouping consecutive travel
   */
  private createTripBasedPeriods(flights: readonly FlightInfo[]): readonly TravelPeriod[] {
    if (flights.length === 0) return [];

    const periods: TravelPeriod[] = [];
    
    // 사용자의 거주 국가 추정 (첫 번째 출발 국가로 가정)
    const homeCountry = flights[0]?.departureAirport.countryCode;
    
    let currentTrip: FlightInfo[] = [];
    let tripStarted = false;
    
    for (const flight of flights) {
      const departureCountry = flight.departureAirport.countryCode;
      const arrivalCountry = flight.arrivalAirport.countryCode;
      
      // 여행 시작 감지: 거주 국가에서 다른 국가로 출발
      if (!tripStarted && departureCountry === homeCountry && arrivalCountry !== homeCountry) {
        tripStarted = true;
        currentTrip = [flight];
      }
      // 여행 중: 이미 여행이 시작되었고 아직 집에 돌아가지 않음
      else if (tripStarted && arrivalCountry !== homeCountry) {
        currentTrip.push(flight);
      }
      // 여행 종료: 집으로 돌아가는 항공편
      else if (tripStarted && arrivalCountry === homeCountry) {
        currentTrip.push(flight);
        
        // 이 여행을 하나의 period로 생성
        const tripPeriod = this.createTripPeriod(currentTrip, homeCountry);
        if (tripPeriod) {
          periods.push(tripPeriod);
        }
        
        // 다음 여행을 위해 리셋
        tripStarted = false;
        currentTrip = [];
      }
      // 국내선 항공편은 무시
      else if (departureCountry === arrivalCountry) {
        continue;
      }
    }
    
    // 아직 끝나지 않은 여행이 있으면 추가 (아직 집에 돌아가지 않음)
    if (tripStarted && currentTrip.length > 0) {
      const tripPeriod = this.createTripPeriod(currentTrip, homeCountry);
      if (tripPeriod) {
        periods.push(tripPeriod);
      }
    }
    
    return periods;
  }

  /**
   * Create a single trip period from consecutive flights
   */
  private createTripPeriod(tripFlights: readonly FlightInfo[], homeCountry: string): TravelPeriod | null {
    if (tripFlights.length === 0) return null;
    
    // 여행의 시작과 끝
    const firstFlight = tripFlights[0];
    const lastFlight = tripFlights[tripFlights.length - 1];
    
    // 주요 목적지 결정 (가장 오래 머문 국가 또는 가장 많이 방문한 국가)
    const destinationCountry = this.determinePrimaryDestination(tripFlights, homeCountry);
    
    // 여행 기간
    const entryDate = firstFlight.departureDate; // 집에서 출발한 날
    const exitDate = lastFlight.arrivalDate.getTime() > firstFlight.departureDate.getTime() 
      ? lastFlight.arrivalDate // 집에 도착한 날 (아직 돌아가지 않았으면 마지막 도착일)
      : null;
    
    // 여행 목적 결정
    const purpose = this.determineTravelPurpose(tripFlights, firstFlight);
    
    // 신뢰도 계산
    const confidence = this.calculateTripConfidence(tripFlights);
    
    // 여행 설명 생성
    const notes = this.generateTripNotes(tripFlights, homeCountry);
    
    return {
      id: uuidv4(),
      countryCode: destinationCountry.countryCode,
      countryName: destinationCountry.countryName,
      entryDate,
      exitDate,
      flights: tripFlights,
      purpose,
      notes,
      confidence,
      extractedAt: new Date(),
    };
  }

  /**
   * Determine the primary destination of a trip
   */
  private determinePrimaryDestination(tripFlights: readonly FlightInfo[], homeCountry: string): { countryCode: string; countryName: string } {
    // 방문한 국가들과 체류 시간 계산
    const countryVisits = new Map<string, { name: string; totalTime: number; visits: number }>();
    
    for (let i = 0; i < tripFlights.length; i++) {
      const flight = tripFlights[i];
      const arrivalCountry = flight.arrivalAirport.countryCode;
      
      // 거주 국가는 제외
      if (arrivalCountry === homeCountry) continue;
      
      if (!countryVisits.has(arrivalCountry)) {
        countryVisits.set(arrivalCountry, {
          name: flight.arrivalAirport.country,
          totalTime: 0,
          visits: 0
        });
      }
      
      const countryData = countryVisits.get(arrivalCountry)!;
      countryData.visits++;
      
      // 다음 항공편이 있으면 체류 시간 계산
      if (i < tripFlights.length - 1) {
        const nextFlight = tripFlights[i + 1];
        const stayTime = nextFlight.departureDate.getTime() - flight.arrivalDate.getTime();
        countryData.totalTime += stayTime;
      }
    }
    
    // 가장 오래 머문 국가를 주요 목적지로 선택
    let primaryDestination = { countryCode: homeCountry, countryName: 'Unknown' };
    let maxScore = 0;
    
    for (const [countryCode, data] of countryVisits) {
      // 점수 = 체류시간 + 방문횟수 보너스
      const score = data.totalTime + (data.visits * 24 * 60 * 60 * 1000); // 방문마다 하루 보너스
      if (score > maxScore) {
        maxScore = score;
        primaryDestination = { countryCode, countryName: data.name };
      }
    }
    
    return primaryDestination;
  }

  /**
   * Calculate confidence for trip-based period
   */
  private calculateTripConfidence(tripFlights: readonly FlightInfo[]): number {
    let confidence = 0.7; // 여행 기반 분석은 높은 기본 신뢰도
    
    // 항공편 신뢰도 평균
    const avgFlightConfidence = tripFlights.reduce((sum, f) => sum + f.confidence, 0) / tripFlights.length;
    confidence += avgFlightConfidence * 0.2;
    
    // 완전한 왕복 여행인 경우 보너스
    const firstFlight = tripFlights[0];
    const lastFlight = tripFlights[tripFlights.length - 1];
    if (firstFlight.departureAirport.countryCode === lastFlight.arrivalAirport.countryCode) {
      confidence += 0.1;
    }
    
    return Math.min(1.0, confidence);
  }

  /**
   * Generate trip-based notes
   */
  private generateTripNotes(tripFlights: readonly FlightInfo[], homeCountry: string): string {
    const notes: string[] = [];
    
    // 여행 루트 생성
    const route: string[] = [];
    for (const flight of tripFlights) {
      if (route.length === 0) {
        route.push(flight.departureAirport.city);
      }
      route.push(flight.arrivalAirport.city);
    }
    
    notes.push(`여행 루트: ${route.join(' → ')}`);
    
    // 방문 국가 수
    const visitedCountries = new Set(
      tripFlights
        .map(f => f.arrivalAirport.countryCode)
        .filter(code => code !== homeCountry)
    );
    
    if (visitedCountries.size > 1) {
      notes.push(`${visitedCountries.size}개국 방문`);
    }
    
    // 항공편 수
    notes.push(`${tripFlights.length}개 항공편`);
    
    // 여행 기간
    const firstFlight = tripFlights[0];
    const lastFlight = tripFlights[tripFlights.length - 1];
    const durationMs = lastFlight.arrivalDate.getTime() - firstFlight.departureDate.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    notes.push(`${durationDays}일간 여행`);
    
    return notes.join(' | ');
  }

  /**
   * Group flights by destination country
   */
  private groupFlightsByCountry(flights: readonly FlightInfo[]): readonly FlightGroup[] {
    const countryGroups = new Map<string, FlightInfo[]>();
    
    // Group flights by arrival country
    for (const flight of flights) {
      const countryCode = flight.arrivalAirport.countryCode;
      if (!countryGroups.has(countryCode)) {
        countryGroups.set(countryCode, []);
      }
      countryGroups.get(countryCode)!.push(flight);
    }

    const groups: FlightGroup[] = [];
    
    for (const [countryCode, countryFlights] of countryGroups) {
      // Find entry and exit flights for each country
      const entryFlight = this.findEntryFlight(countryFlights, flights);
      const exitFlight = this.findExitFlight(countryFlights, flights);
      
      if (entryFlight) {
        groups.push({
          countryCode,
          countryName: entryFlight.arrivalAirport.country,
          flights: countryFlights,
          entryFlight,
          exitFlight,
        });
      }
    }

    return groups;
  }

  /**
   * Find the entry flight to a country
   */
  private findEntryFlight(countryFlights: readonly FlightInfo[], allFlights: readonly FlightInfo[]): FlightInfo | null {
    // Find flight arriving to this country from a different country
    for (const flight of countryFlights) {
      const departureCountry = flight.departureAirport.countryCode;
      const arrivalCountry = flight.arrivalAirport.countryCode;
      
      if (departureCountry !== arrivalCountry) {
        return flight; // This is an international arrival
      }
    }
    
    // If no international arrival found, use the earliest flight in the country
    return countryFlights.length > 0 ? countryFlights[0] : null;
  }

  /**
   * Find the exit flight from a country
   */
  private findExitFlight(countryFlights: readonly FlightInfo[], allFlights: readonly FlightInfo[]): FlightInfo | null {
    const countryCode = countryFlights[0]?.arrivalAirport.countryCode;
    if (!countryCode) return null;

    // Find flight departing from this country to a different country
    for (const flight of allFlights) {
      const departureCountry = flight.departureAirport.countryCode;
      const arrivalCountry = flight.arrivalAirport.countryCode;
      
      if (departureCountry === countryCode && arrivalCountry !== countryCode) {
        return flight; // This is an international departure
      }
    }
    
    return null; // No exit flight found (still in the country or domestic travel)
  }

  /**
   * Create a travel period from a flight group
   */
  private createTravelPeriod(group: FlightGroup): TravelPeriod | null {
    const { countryCode, countryName, flights, entryFlight, exitFlight } = group;
    
    if (!entryFlight) {
      return null;
    }

    // Determine entry and exit dates
    const entryDate = entryFlight.arrivalDate;
    const exitDate = exitFlight ? exitFlight.departureDate : null;
    
    // Determine travel purpose based on patterns
    const purpose = this.determineTravelPurpose(flights, entryFlight);
    
    // Calculate confidence based on flight data quality
    const confidence = this.calculateConfidence(flights, entryFlight, exitFlight);
    
    // Generate notes
    const notes = this.generateNotes(flights, entryFlight, exitFlight);

    return {
      id: uuidv4(),
      countryCode,
      countryName,
      entryDate,
      exitDate,
      flights,
      purpose,
      notes,
      confidence,
      extractedAt: new Date(),
    };
  }

  /**
   * Determine travel purpose from flight patterns
   */
  private determineTravelPurpose(flights: readonly FlightInfo[], entryFlight: FlightInfo): TravelPurpose {
    // Simple heuristics for now - can be enhanced with ML later
    
    // Check for business class or business-related patterns
    const hasBusinessIndicators = flights.some(flight => 
      flight.seatNumber?.includes('1') || // First class row numbers
      flight.airline.toLowerCase().includes('business') ||
      (flight.bookingReference && flight.bookingReference.length > 6) // Corporate booking patterns
    );
    
    if (hasBusinessIndicators) {
      return 'BUSINESS';
    }

    // Check for same-day return or very short stays (likely transit)
    const stayDuration = this.calculateStayDuration(flights);
    if (stayDuration !== null && stayDuration < 24) {
      return 'TRANSIT';
    }

    // Check for educational patterns (long stays, specific airports near universities)
    if (stayDuration !== null && stayDuration > 90) {
      return 'EDUCATION';
    }

    // Default to tourism for most leisure travel
    return 'TOURISM';
  }

  /**
   * Calculate stay duration in hours
   */
  private calculateStayDuration(flights: readonly FlightInfo[]): number | null {
    if (flights.length < 2) {
      return null;
    }

    const arrivalTimes = flights.map(f => f.arrivalDate.getTime());
    const departureTimes = flights.map(f => f.departureDate.getTime());
    
    const earliestArrival = Math.min(...arrivalTimes);
    const latestDeparture = Math.max(...departureTimes);
    
    return (latestDeparture - earliestArrival) / (1000 * 60 * 60); // Convert to hours
  }

  /**
   * Calculate confidence score for the travel period
   */
  private calculateConfidence(flights: readonly FlightInfo[], entryFlight: FlightInfo, exitFlight: FlightInfo | null): number {
    let confidence = 0.5; // Base confidence
    
    // Higher confidence for more complete flight data
    const avgFlightConfidence = flights.reduce((sum, f) => sum + f.confidence, 0) / flights.length;
    confidence += avgFlightConfidence * 0.3;
    
    // Higher confidence if we have clear entry/exit
    if (entryFlight && exitFlight) {
      confidence += 0.2;
    }
    
    // Higher confidence for more flights (more data points)
    if (flights.length > 1) {
      confidence += Math.min(0.2, flights.length * 0.05);
    }
    
    // Higher confidence if flights have booking references
    const hasBookingRefs = flights.some(f => f.bookingReference);
    if (hasBookingRefs) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  /**
   * Generate descriptive notes for the travel period
   */
  private generateNotes(flights: readonly FlightInfo[], entryFlight: FlightInfo, exitFlight: FlightInfo | null): string {
    const notes: string[] = [];
    
    // Entry information
    notes.push(`Entered via ${entryFlight.departureAirport.city} → ${entryFlight.arrivalAirport.city}`);
    
    // Exit information
    if (exitFlight) {
      notes.push(`Exited via ${exitFlight.departureAirport.city} → ${exitFlight.arrivalAirport.city}`);
    } else {
      notes.push('Exit date unknown (may still be in country)');
    }
    
    // Flight details
    if (flights.length > 1) {
      notes.push(`${flights.length} flights total`);
    }
    
    // Airlines used
    const uniqueAirlines = Array.from(new Set(flights.map(f => f.airline)));
    if (uniqueAirlines.length === 1) {
      notes.push(`Airline: ${uniqueAirlines[0]}`);
    } else if (uniqueAirlines.length <= 3) {
      notes.push(`Airlines: ${uniqueAirlines.join(', ')}`);
    }
    
    // Booking references
    const bookingRefs = flights
      .map(f => f.bookingReference)
      .filter(ref => ref !== null) as string[];
    
    if (bookingRefs.length > 0) {
      notes.push(`Booking refs: ${bookingRefs.slice(0, 2).join(', ')}`);
    }

    return notes.join(' | ');
  }

  /**
   * Merge overlapping or adjacent travel periods
   */
  mergeTravelPeriods(periods: readonly TravelPeriod[]): readonly TravelPeriod[] {
    if (periods.length <= 1) {
      return periods;
    }

    // Sort by entry date
    const sortedPeriods = [...periods].sort((a, b) => 
      a.entryDate.getTime() - b.entryDate.getTime()
    );

    const mergedPeriods: TravelPeriod[] = [];
    let currentPeriod = sortedPeriods[0];

    for (let i = 1; i < sortedPeriods.length; i++) {
      const nextPeriod = sortedPeriods[i];
      
      // Check if periods can be merged (same country, overlapping or adjacent dates)
      if (this.canMergePeriods(currentPeriod, nextPeriod)) {
        currentPeriod = this.mergeTwoPeriods(currentPeriod, nextPeriod);
      } else {
        mergedPeriods.push(currentPeriod);
        currentPeriod = nextPeriod;
      }
    }
    
    mergedPeriods.push(currentPeriod);
    return mergedPeriods;
  }

  /**
   * Check if two travel periods can be merged
   */
  private canMergePeriods(period1: TravelPeriod, period2: TravelPeriod): boolean {
    // Must be same country
    if (period1.countryCode !== period2.countryCode) {
      return false;
    }

    // Check for overlapping or adjacent dates
    if (!period1.exitDate || !period2.exitDate) {
      return false; // Can't merge if exit dates are unknown
    }

    const gap = period2.entryDate.getTime() - period1.exitDate.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Merge if gap is less than 1 day (could be same day transfer)
    return gap <= oneDayMs;
  }

  /**
   * Merge two travel periods
   */
  private mergeTwoPeriods(period1: TravelPeriod, period2: TravelPeriod): TravelPeriod {
    const mergedFlights = [...period1.flights, ...period2.flights];
    const earliestEntry = period1.entryDate < period2.entryDate ? period1.entryDate : period2.entryDate;
    const latestExit = this.getLatestDate(period1.exitDate, period2.exitDate);
    
    return {
      id: uuidv4(),
      countryCode: period1.countryCode,
      countryName: period1.countryName,
      entryDate: earliestEntry,
      exitDate: latestExit,
      flights: mergedFlights,
      purpose: period1.purpose, // Keep first period's purpose
      notes: `${period1.notes} | Merged with: ${period2.notes}`,
      confidence: (period1.confidence + period2.confidence) / 2,
      extractedAt: new Date(),
    };
  }

  /**
   * Get the latest of two dates (handling nulls)
   */
  private getLatestDate(date1: Date | null, date2: Date | null): Date | null {
    if (!date1) return date2;
    if (!date2) return date1;
    return date1 > date2 ? date1 : date2;
  }
}

/**
 * Create travel period creator instance
 */
export function createTravelPeriodCreator(): TravelPeriodCreator {
  return new TravelPeriodCreator();
}
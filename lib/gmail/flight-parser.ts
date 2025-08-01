import { parseISO, format, isValid } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { airportCodes, airlineCodes } from '@/data/travel-patterns';

export interface FlightDetails {
  flightNumber: string;
  airline: string;
  airlineCode: string;
  departure: {
    airport: string;
    airportCode: string;
    city?: string;
    country?: string;
    date: string;
    time?: string;
    terminal?: string;
    gate?: string;
  };
  arrival: {
    airport: string;
    airportCode: string;
    city?: string;
    country?: string;
    date: string;
    time?: string;
    terminal?: string;
    gate?: string;
  };
  duration?: string;
  bookingReference?: string;
  passengerName?: string;
  seatNumber?: string;
  ticketNumber?: string;
  confirmationNumber?: string;
  operatedBy?: string;
  status?: 'confirmed' | 'cancelled' | 'changed';
  emailId: string;
  confidence: number;
}

export interface ParsedFlightEmail {
  flights: FlightDetails[];
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  totalFlights: number;
  firstDeparture?: string;
  lastReturn?: string;
  emailId: string;
  subject: string;
  from: string;
  receivedDate: string;
  confidence: number;
}

// 항공권 관련 향상된 정규 표현식 패턴
const FLIGHT_PATTERNS = {
  // 항공편 번호 패턴 (다양한 형식 지원)
  flightNumber: [
    /(?:Flight|항공편|편명)[:\s]*([A-Z]{2,3})\s*(\d{1,4}[A-Z]?)/gi,
    /\b([A-Z]{2}|[A-Z]{3})\s*(\d{3,4}[A-Z]?)\b/g,
    /(?:Flight Number|Flight #)[:\s]*([A-Z]{2,3})\s*(\d{1,4})/gi,
  ],
  
  // 날짜 패턴 (다양한 형식)
  date: [
    /(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(\d{4})/gi,
    /(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})/g,
    /(\d{1,2})[-.\/](\d{1,2})[-.\/](\d{4})/g,
    /(\d{1,2})\s*(월|January|February|March|April|May|June|July|August|September|October|November|December)\s*(\d{1,2}).*?(\d{4})/gi,
  ],
  
  // 시간 패턴
  time: [
    /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/g,
    /(\d{2})(\d{2})\s*(?:hrs?|hours?)/gi,
  ],
  
  // 공항/도시 패턴
  route: [
    /(?:From|출발|Departure)[:\s]*([A-Z]{3})\s*(?:\(([^)]+)\))?\s*(?:To|도착|Arrival)[:\s]*([A-Z]{3})\s*(?:\(([^)]+)\))?/gi,
    /([A-Z]{3})\s*-\s*([A-Z]{3})/g,
    /(?:Departing|출발)\s*(?:from)?\s*([A-Z]{3}|\w+(?:\s+\w+)*)\s*(?:to|→|->)\s*([A-Z]{3}|\w+(?:\s+\w+)*)/gi,
  ],
  
  // 예약 번호 패턴
  booking: [
    /(?:Booking Reference|Confirmation Code|예약번호|PNR)[:\s]*([A-Z0-9]{6})/gi,
    /(?:Record Locator|Confirmation #)[:\s]*([A-Z0-9]{6})/gi,
    /(?:Reference|Ref)[:\s#]*([A-Z0-9]{6})/gi,
  ],
  
  // 승객 이름 패턴
  passenger: [
    /(?:Passenger Name|승객|Traveler)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
    /(?:Name|이름)[:\s]*([가-힣]+(?:\s*[가-힣]+)*)/gi,
    /Dear\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  ],
  
  // 좌석 번호 패턴
  seat: [
    /(?:Seat|좌석)[:\s#]*(\d{1,3}[A-Z])/gi,
    /Seat[:\s]*(\d{1,2}[A-HJ-K])/gi,
  ],
  
  // 터미널/게이트 패턴
  terminal: [
    /(?:Terminal|터미널)[:\s]*([A-Z0-9]+)/gi,
    /(?:Gate|게이트)[:\s]*([A-Z0-9]+)/gi,
  ],
  
  // 항공사별 특수 패턴
  airlineSpecific: {
    // 대한항공
    KE: {
      pattern: /대한항공|KOREAN AIR|KE\d{3,4}/gi,
      code: 'KE',
      name: 'Korean Air'
    },
    // 아시아나
    OZ: {
      pattern: /아시아나|ASIANA|OZ\d{3,4}/gi,
      code: 'OZ', 
      name: 'Asiana Airlines'
    },
    // 유나이티드
    UA: {
      pattern: /United Airlines|UNITED|UA\d{3,4}/gi,
      code: 'UA',
      name: 'United Airlines'
    },
    // 델타
    DL: {
      pattern: /Delta Air Lines|DELTA|DL\d{3,4}/gi,
      code: 'DL',
      name: 'Delta Air Lines'
    },
  }
};

/**
 * 이메일에서 항공권 정보를 추출합니다
 */
export function parseFlightEmail(
  emailId: string,
  subject: string,
  from: string,
  body: string,
  receivedDate: string
): ParsedFlightEmail | null {
  const fullText = `${subject}\n${body}`;
  const flights: FlightDetails[] = [];
  
  // 1. 항공편 번호 추출
  const flightNumbers = extractFlightNumbers(fullText);
  if (flightNumbers.length === 0) {
    return null; // 항공편 번호가 없으면 항공권 이메일이 아님
  }
  
  // 2. 각 항공편에 대한 상세 정보 추출
  for (const flightInfo of flightNumbers) {
    const flightDetails = extractFlightDetails(
      fullText,
      flightInfo,
      emailId
    );
    
    if (flightDetails) {
      flights.push(flightDetails);
    }
  }
  
  if (flights.length === 0) {
    return null;
  }
  
  // 3. 여행 타입 결정
  const tripType = determineTripType(flights);
  
  // 4. 전체 신뢰도 계산
  const overallConfidence = calculateOverallConfidence(flights, fullText);
  
  return {
    flights,
    tripType,
    totalFlights: flights.length,
    firstDeparture: flights[0]?.departure.date,
    lastReturn: flights[flights.length - 1]?.arrival.date,
    emailId,
    subject,
    from,
    receivedDate,
    confidence: overallConfidence
  };
}

/**
 * 항공편 번호 추출
 */
function extractFlightNumbers(text: string): Array<{number: string, airline: string, code: string}> {
  const flights: Array<{number: string, airline: string, code: string}> = [];
  const foundFlights = new Set<string>();
  
  // 각 패턴으로 항공편 번호 찾기
  for (const pattern of FLIGHT_PATTERNS.flightNumber) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const airlineCode = match[1].toUpperCase();
      const flightNum = match[2];
      const fullFlightNumber = `${airlineCode}${flightNum}`;
      
      // 중복 제거 및 유효성 검사
      if (!foundFlights.has(fullFlightNumber) && airlineCode in airlineCodes) {
        foundFlights.add(fullFlightNumber);
        flights.push({
          number: fullFlightNumber,
          airline: airlineCodes[airlineCode as keyof typeof airlineCodes],
          code: airlineCode
        });
      }
    }
  }
  
  return flights;
}

/**
 * 항공편 상세 정보 추출
 */
function extractFlightDetails(
  text: string,
  flightInfo: {number: string, airline: string, code: string},
  emailId: string
): FlightDetails | null {
  // 항공편 번호 주변 텍스트 추출 (전후 500자)
  const contextPattern = new RegExp(
    `[\\s\\S]{0,500}${flightInfo.number}[\\s\\S]{0,500}`,
    'gi'
  );
  const contexts = text.match(contextPattern) || [];
  
  let bestDetails: FlightDetails | null = null;
  let highestConfidence = 0;
  
  for (const context of contexts) {
    const details = extractDetailsFromContext(context, flightInfo, emailId);
    if (details && details.confidence > highestConfidence) {
      bestDetails = details;
      highestConfidence = details.confidence;
    }
  }
  
  return bestDetails;
}

/**
 * 컨텍스트에서 상세 정보 추출
 */
function extractDetailsFromContext(
  context: string,
  flightInfo: {number: string, airline: string, code: string},
  emailId: string
): FlightDetails | null {
  let confidence = 0.3; // 기본 신뢰도 (항공편 번호가 있음)
  
  // 공항 코드 추출
  const airports = extractAirports(context);
  if (airports.length < 2) {
    return null; // 출발/도착 공항이 없으면 무효
  }
  
  // 날짜 추출
  const dates = extractDates(context);
  if (dates.length === 0) {
    return null; // 날짜가 없으면 무효
  }
  
  // 시간 추출
  const times = extractTimes(context);
  
  // 예약 번호 추출
  const bookingRef = extractBookingReference(context);
  if (bookingRef) confidence += 0.1;
  
  // 승객 이름 추출
  const passengerName = extractPassengerName(context);
  if (passengerName) confidence += 0.05;
  
  // 좌석 번호 추출
  const seatNumber = extractSeatNumber(context);
  if (seatNumber) confidence += 0.05;
  
  // 터미널/게이트 정보 추출
  const terminalInfo = extractTerminalGate(context);
  
  // 공항 정보 보강
  const departureAirport = airports[0];
  const arrivalAirport = airports[1];
  
  confidence += 0.2; // 출발/도착 공항 있음
  confidence += dates.length * 0.1; // 날짜 정보
  confidence += times.length * 0.05; // 시간 정보
  
  return {
    flightNumber: flightInfo.number,
    airline: flightInfo.airline,
    airlineCode: flightInfo.code,
    departure: {
      airport: airportCodes[departureAirport as keyof typeof airportCodes] || departureAirport,
      airportCode: departureAirport,
      date: dates[0],
      time: times[0],
      terminal: terminalInfo.departureTerminal,
      gate: terminalInfo.departureGate
    },
    arrival: {
      airport: airportCodes[arrivalAirport as keyof typeof airportCodes] || arrivalAirport,
      airportCode: arrivalAirport,
      date: dates.length > 1 ? dates[1] : dates[0],
      time: times.length > 1 ? times[1] : undefined,
      terminal: terminalInfo.arrivalTerminal,
      gate: terminalInfo.arrivalGate
    },
    bookingReference: bookingRef,
    passengerName,
    seatNumber,
    status: 'confirmed',
    emailId,
    confidence: Math.min(confidence, 1.0)
  };
}

/**
 * 공항 코드 추출
 */
function extractAirports(text: string): string[] {
  const airports: string[] = [];
  const foundAirports = new Set<string>();
  
  // 경로 패턴으로 먼저 시도
  for (const pattern of FLIGHT_PATTERNS.route) {
    const match = pattern.exec(text);
    if (match) {
      const dep = match[1]?.toUpperCase();
      const arr = match[match.length - 2]?.toUpperCase() || match[2]?.toUpperCase();
      
      if (dep && dep.length === 3 && dep in airportCodes) {
        airports.push(dep);
        foundAirports.add(dep);
      }
      if (arr && arr.length === 3 && arr in airportCodes && !foundAirports.has(arr)) {
        airports.push(arr);
        foundAirports.add(arr);
      }
    }
  }
  
  // 개별 공항 코드 찾기
  if (airports.length < 2) {
    const airportPattern = /\b([A-Z]{3})\b/g;
    let match;
    while ((match = airportPattern.exec(text)) !== null) {
      const code = match[1];
      if (code in airportCodes && !foundAirports.has(code)) {
        airports.push(code);
        foundAirports.add(code);
      }
    }
  }
  
  return airports;
}

/**
 * 날짜 추출 및 파싱
 */
function extractDates(text: string): string[] {
  const dates: string[] = [];
  const parsedDates = new Set<string>();
  
  for (const pattern of FLIGHT_PATTERNS.date) {
    let match;
    pattern.lastIndex = 0; // Reset regex state
    while ((match = pattern.exec(text)) !== null) {
      let dateStr = '';
      
      // 패턴에 따라 날짜 포맷 처리
      if (match[0].includes('Jan') || match[0].includes('Feb') || match[0].includes('월')) {
        // 월 이름이 포함된 형식
        dateStr = match[0];
      } else if (match[1].length === 4) {
        // YYYY-MM-DD 형식
        dateStr = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
      } else {
        // DD-MM-YYYY 형식
        dateStr = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
      }
      
      // 날짜 유효성 검사 및 표준화
      try {
        const parsed = parseISO(dateStr);
        if (isValid(parsed)) {
          const formatted = format(parsed, 'yyyy-MM-dd');
          if (!parsedDates.has(formatted)) {
            dates.push(formatted);
            parsedDates.add(formatted);
          }
        }
      } catch {
        // 파싱 실패 시 원본 날짜 문자열 시도
        const monthMap: {[key: string]: string} = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        
        // 월 이름을 숫자로 변환 시도
        for (const [monthName, monthNum] of Object.entries(monthMap)) {
          if (dateStr.includes(monthName)) {
            const parts = dateStr.match(/(\d{1,2})\s*\w+\s*(\d{4})/);
            if (parts) {
              const formattedDate = `${parts[2]}-${monthNum}-${parts[1].padStart(2, '0')}`;
              if (!parsedDates.has(formattedDate)) {
                dates.push(formattedDate);
                parsedDates.add(formattedDate);
              }
            }
            break;
          }
        }
      }
    }
  }
  
  return dates.sort(); // 날짜 순으로 정렬
}

/**
 * 시간 추출
 */
function extractTimes(text: string): string[] {
  const times: string[] = [];
  const foundTimes = new Set<string>();
  
  for (const pattern of FLIGHT_PATTERNS.time) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const time = match[0];
      if (!foundTimes.has(time)) {
        times.push(time);
        foundTimes.add(time);
      }
    }
  }
  
  return times;
}

/**
 * 예약 번호 추출
 */
function extractBookingReference(text: string): string | undefined {
  for (const pattern of FLIGHT_PATTERNS.booking) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  }
  return undefined;
}

/**
 * 승객 이름 추출
 */
function extractPassengerName(text: string): string | undefined {
  for (const pattern of FLIGHT_PATTERNS.passenger) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

/**
 * 좌석 번호 추출
 */
function extractSeatNumber(text: string): string | undefined {
  for (const pattern of FLIGHT_PATTERNS.seat) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  }
  return undefined;
}

/**
 * 터미널/게이트 정보 추출
 */
function extractTerminalGate(text: string): {
  departureTerminal?: string;
  departureGate?: string;
  arrivalTerminal?: string;
  arrivalGate?: string;
} {
  const result: any = {};
  
  // 터미널 정보
  const terminalMatches = text.match(FLIGHT_PATTERNS.terminal[0]);
  if (terminalMatches) {
    // 첫 번째를 출발 터미널로 가정
    result.departureTerminal = terminalMatches[1];
  }
  
  // 게이트 정보
  const gateMatches = text.match(FLIGHT_PATTERNS.terminal[1]);
  if (gateMatches) {
    result.departureGate = gateMatches[1];
  }
  
  return result;
}

/**
 * 여행 타입 결정
 */
function determineTripType(flights: FlightDetails[]): 'one-way' | 'round-trip' | 'multi-city' {
  if (flights.length === 1) {
    return 'one-way';
  }
  
  if (flights.length === 2) {
    // 왕복 여행 확인 (출발지와 도착지가 반대)
    const firstFlight = flights[0];
    const secondFlight = flights[1];
    
    if (
      firstFlight.departure.airportCode === secondFlight.arrival.airportCode &&
      firstFlight.arrival.airportCode === secondFlight.departure.airportCode
    ) {
      return 'round-trip';
    }
  }
  
  return 'multi-city';
}

/**
 * 전체 신뢰도 계산
 */
function calculateOverallConfidence(flights: FlightDetails[], fullText: string): number {
  // 기본 신뢰도
  let confidence = 0.5;
  
  // 항공편 수에 따른 보정
  confidence += Math.min(flights.length * 0.1, 0.3);
  
  // 평균 개별 신뢰도
  const avgFlightConfidence = flights.reduce((sum, f) => sum + f.confidence, 0) / flights.length;
  confidence = confidence * 0.4 + avgFlightConfidence * 0.6;
  
  // 특정 키워드 존재 시 보너스
  const keywords = [
    'e-ticket', 'boarding pass', 'itinerary', 'confirmation',
    '전자항공권', '탑승권', '여정', '확인'
  ];
  
  const lowerText = fullText.toLowerCase();
  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      confidence += 0.05;
    }
  }
  
  return Math.min(confidence, 1.0);
}

/**
 * 국가 코드 매핑 (공항 코드에서 국가 추출용)
 */
export const airportToCountry: {[key: string]: {code: string, name: string}} = {
  // 한국
  'ICN': { code: 'KR', name: '대한민국' },
  'GMP': { code: 'KR', name: '대한민국' },
  'PUS': { code: 'KR', name: '대한민국' },
  'CJU': { code: 'KR', name: '대한민국' },
  
  // 미국
  'JFK': { code: 'US', name: '미국' },
  'LAX': { code: 'US', name: '미국' },
  'ORD': { code: 'US', name: '미국' },
  'SFO': { code: 'US', name: '미국' },
  'SEA': { code: 'US', name: '미국' },
  'ATL': { code: 'US', name: '미국' },
  'DFW': { code: 'US', name: '미국' },
  
  // 일본
  'NRT': { code: 'JP', name: '일본' },
  'HND': { code: 'JP', name: '일본' },
  'KIX': { code: 'JP', name: '일본' },
  'NGO': { code: 'JP', name: '일본' },
  
  // 중국
  'PEK': { code: 'CN', name: '중국' },
  'PVG': { code: 'CN', name: '중국' },
  'CAN': { code: 'CN', name: '중국' },
  'HKG': { code: 'HK', name: '홍콩' },
  
  // 유럽
  'CDG': { code: 'FR', name: '프랑스' },
  'LHR': { code: 'GB', name: '영국' },
  'FRA': { code: 'DE', name: '독일' },
  'AMS': { code: 'NL', name: '네덜란드' },
  'FCO': { code: 'IT', name: '이탈리아' },
  'MAD': { code: 'ES', name: '스페인' },
  'BCN': { code: 'ES', name: '스페인' },
  
  // 동남아시아
  'SIN': { code: 'SG', name: '싱가포르' },
  'BKK': { code: 'TH', name: '태국' },
  'KUL': { code: 'MY', name: '말레이시아' },
  'CGK': { code: 'ID', name: '인도네시아' },
  'MNL': { code: 'PH', name: '필리핀' },
  'SGN': { code: 'VN', name: '베트남' },
  
  // 오세아니아
  'SYD': { code: 'AU', name: '호주' },
  'MEL': { code: 'AU', name: '호주' },
  'AKL': { code: 'NZ', name: '뉴질랜드' },
  
  // 중동
  'DXB': { code: 'AE', name: '아랍에미리트' },
  'DOH': { code: 'QA', name: '카타르' },
  'IST': { code: 'TR', name: '터키' },
  
  // 추가 국가는 필요에 따라 확장
};
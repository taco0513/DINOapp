import { google } from 'googleapis';
import {
  allTravelPatterns,
  datePatterns,
  timePatterns,
  airportCodes,
  airlineCodes,
  TravelEmailPattern,
} from '@/data/travel-patterns';

export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  snippet: string;
}

export interface TravelInfo {
  emailId: string;
  subject: string;
  from: string;
  departureDate?: string;
  returnDate?: string;
  destination?: string;
  departure?: string;
  flightNumber?: string;
  bookingReference?: string;
  hotelName?: string;
  passengerName?: string;
  category?:
    | 'airline'
    | 'hotel'
    | 'travel_agency'
    | 'rental'
    | 'booking_platform';
  confidence: number;
  extractedData: {
    dates: string[];
    airports: string[];
    flights: string[];
    bookingCodes: string[];
    matchedPatterns: string[];
  };
}

/**
 * Gmail API 클라이언트를 생성합니다.
 * @param accessToken 사용자의 Google 액세스 토큰
 */
export function createGmailClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * 여행 관련 이메일을 검색합니다.
 * @param accessToken 사용자의 Google 액세스 토큰
 * @param maxResults 최대 결과 수 (기본값: 365)
 */
export async function searchTravelEmails(
  accessToken: string,
  maxResults: number = 365
): Promise<EmailMessage[]> {
  try {
    const gmail = createGmailClient(accessToken);

    // 1년 전 날짜 계산
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dateFilter = oneYearAgo.toISOString().split('T')[0]; // YYYY-MM-DD 형식

    // 고급 여행 관련 키워드로 검색 (한국어/영어 지원) + 1년 범위 제한
    const searchQuery =
      [
        // 항공편 관련
        'subject:(flight OR 항공편 OR 항공권 OR eticket OR "boarding pass" OR "탑승권")',
        'subject:(booking OR reservation OR confirmation OR 예약 OR 확인)',
        'subject:(itinerary OR schedule OR 일정)',

        // 호텔 관련
        'subject:(hotel OR accommodation OR 호텔 OR 숙박)',
        'subject:("check-in" OR "check-out" OR 체크인 OR 체크아웃)',

        // 주요 항공사
        'from:(koreanair.com OR flyasiana.com OR jejuair.net)',
        'from:(united.com OR delta.com OR jal.com OR ana.co.jp)',

        // 주요 예약 플랫폼
        'from:(booking.com OR expedia.com OR agoda.com OR hotels.com)',
        'from:(kayak.com OR priceline.com OR orbitz.com)',
        'from:(airbnb.com OR vrbo.com)',

        // 렌터카
        'from:(hertz.com OR avis.com OR enterprise.com OR budget.com)',

        // 여행사
        'from:(expedia.com OR travelocity.com OR orbitz.com)',

        // 일반적인 여행 관련 키워드
        'subject:(trip OR travel OR vacation OR 여행 OR 출장)',
        'subject:(departure OR arrival OR 출발 OR 도착)',
      ].join(' OR ') + ` after:${dateFilter}`;

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults,
    });

    if (!response.data.messages) {
      return [];
    }

    // 각 메시지의 상세 정보를 가져오기
    const messages: EmailMessage[] = [];

    for (const message of response.data.messages.slice(0, maxResults)) {
      try {
        const messageDetail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full',
        });

        const headers = messageDetail.data.payload?.headers || [];
        const subject =
          headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const from =
          headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
        const to =
          headers.find(h => h.name === 'To')?.value || 'Unknown Recipient';
        const date =
          headers.find(h => h.name === 'Date')?.value || 'Unknown Date';

        // 이메일 본문 추출
        let body = '';
        const payload = messageDetail.data.payload;

        if (payload?.parts) {
          // 멀티파트 메시지
          for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body += Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
          }
        } else if (payload?.body?.data) {
          // 단일 파트 메시지
          body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
        }

        messages.push({
          id: message.id!,
          subject,
          from,
          to,
          date,
          body,
          snippet: messageDetail.data.snippet || '',
        });
      } catch (error) {
        // Error fetching message
        // 개별 메시지 오류는 건너뛰고 계속 진행
      }
    }

    return messages;
  } catch (error) {
    // Error searching travel emails
    throw new Error('Gmail API 요청 중 오류가 발생했습니다.');
  }
}

/**
 * 고급 여행 정보 추출 함수
 * @param email 이메일 메시지
 */
export function extractTravelInfo(email: EmailMessage): TravelInfo | null {
  const fullText = `${email.subject} ${email.body} ${email.snippet}`;
  const normalizedText = fullText.toLowerCase();

  // 기본 여행 정보 객체
  const travelInfo: TravelInfo = {
    emailId: email.id,
    subject: email.subject,
    from: email.from,
    confidence: 0,
    extractedData: {
      dates: [],
      airports: [],
      flights: [],
      bookingCodes: [],
      matchedPatterns: [],
    },
  };

  // 패턴 매칭으로 이메일 카테고리 및 가중치 결정
  let matchedPattern: TravelEmailPattern | null = null;
  let maxWeight = 0;

  for (const pattern of allTravelPatterns) {
    let patternScore = 0;

    // 발신자 패턴 확인
    for (const senderPattern of pattern.senderPatterns) {
      if (senderPattern.test(email.from)) {
        patternScore += 0.4;
        travelInfo.extractedData.matchedPatterns.push(`sender:${pattern.name}`);
        break;
      }
    }

    // 제목 패턴 확인
    for (const subjectPattern of pattern.subjectPatterns) {
      if (subjectPattern.test(email.subject)) {
        patternScore += 0.3;
        travelInfo.extractedData.matchedPatterns.push(
          `subject:${pattern.name}`
        );
        break;
      }
    }

    // 본문 패턴 확인
    for (const bodyPattern of pattern.bodyPatterns) {
      if (bodyPattern.test(normalizedText)) {
        patternScore += 0.3;
        travelInfo.extractedData.matchedPatterns.push(`body:${pattern.name}`);
        break;
      }
    }

    const weightedScore = patternScore * pattern.weight;
    if (weightedScore > maxWeight) {
      maxWeight = weightedScore;
      matchedPattern = pattern;
      travelInfo.category = pattern.category;
    }
  }

  // 기본 신뢰도 설정
  travelInfo.confidence = maxWeight;

  // 특화된 정보 추출
  if (matchedPattern?.extractors) {
    extractSpecializedInfo(
      fullText,
      normalizedText,
      matchedPattern,
      travelInfo
    );
  }

  // 일반적인 정보 추출 (모든 이메일에 적용)
  extractGeneralTravelInfo(fullText, normalizedText, travelInfo);

  // 추출된 데이터 기반 신뢰도 조정
  adjustConfidenceBasedOnExtractedData(travelInfo);

  // 신뢰도가 너무 낮으면 null 반환
  if (travelInfo.confidence < 0.2) {
    return null;
  }

  return travelInfo;
}

/**
 * 특화된 패턴 기반 정보 추출
 */
function extractSpecializedInfo(
  fullText: string,
  normalizedText: string,
  pattern: TravelEmailPattern,
  travelInfo: TravelInfo
) {
  const extractors = pattern.extractors;

  // 항공편 번호 추출
  if (extractors.flights) {
    for (const flightPattern of extractors.flights) {
      const matches = fullText.match(flightPattern);
      if (matches) {
        travelInfo.extractedData.flights.push(
          ...matches.map(m => m.toUpperCase())
        );
        if (!travelInfo.flightNumber) {
          travelInfo.flightNumber = matches[0].toUpperCase();
        }
      }
    }
  }

  // 예약 번호 추출
  if (extractors.bookingReference) {
    for (const bookingPattern of extractors.bookingReference) {
      const matches = fullText.match(bookingPattern);
      if (matches && matches.length >= 2) {
        travelInfo.extractedData.bookingCodes.push(matches[1]);
        if (!travelInfo.bookingReference) {
          travelInfo.bookingReference = matches[1];
        }
      }
    }
  }

  // 공항 코드 추출
  if (extractors.airports) {
    for (const airportPattern of extractors.airports) {
      const matches = fullText.match(airportPattern);
      if (matches) {
        const airports = matches.filter(code => code in airportCodes);
        travelInfo.extractedData.airports.push(...airports);
        if (airports.length >= 2 && !travelInfo.departure) {
          travelInfo.departure = airports[0];
          travelInfo.destination = airports[1];
        }
      }
    }
  }

  // 날짜 추출
  if (extractors.dates) {
    for (const datePattern of extractors.dates) {
      const matches = fullText.match(datePattern);
      if (matches) {
        travelInfo.extractedData.dates.push(...matches);
      }
    }
  }
}

/**
 * 일반적인 여행 정보 추출 (모든 이메일에 적용)
 */
function extractGeneralTravelInfo(
  fullText: string,
  normalizedText: string,
  travelInfo: TravelInfo
) {
  // 날짜 패턴 검색
  for (const datePattern of datePatterns) {
    const matches = fullText.match(datePattern);
    if (matches) {
      travelInfo.extractedData.dates.push(...matches);
    }
  }

  // 항공편 번호 일반 패턴
  const generalFlightPattern = /\b([A-Z]{2,3})\s*(\d{3,4})\b/g;
  const flightMatches = fullText.match(generalFlightPattern);
  if (flightMatches) {
    const validFlights = flightMatches.filter(flight => {
      const airlineCode = flight.match(/^([A-Z]{2,3})/)?.[1];
      return airlineCode && airlineCode in airlineCodes;
    });
    travelInfo.extractedData.flights.push(
      ...validFlights.map(f => f.toUpperCase())
    );
  }

  // 공항 코드 일반 패턴
  const generalAirportPattern = /\b([A-Z]{3})\b/g;
  const airportMatches = fullText.match(generalAirportPattern);
  if (airportMatches) {
    const validAirports = airportMatches.filter(code => code in airportCodes);
    travelInfo.extractedData.airports.push(...validAirports);
  }

  // 예약 번호 일반 패턴
  const generalBookingPatterns = [
    /(confirmation|booking|reference|reservation)\s*(?:number|code|id)?[:\s]*([A-Z0-9]{6,})/gi,
    /(예약|확인)\s*(?:번호|코드)?[:\s]*([A-Z0-9]{6,})/gi,
    /PNR[:\s]*([A-Z0-9]{6,})/gi,
  ];

  for (const pattern of generalBookingPatterns) {
    const matches = fullText.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const code = match.match(/([A-Z0-9]{6,})$/)?.[1];
        if (code) {
          travelInfo.extractedData.bookingCodes.push(code);
        }
      });
    }
  }

  // 승객 이름 추출 (일반적인 패턴)
  const passengerPatterns = [
    /passenger[:\s]*([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
    /승객[:\s]*([가-힣]+\s*[가-힣]+)/gi,
    /traveler[:\s]*([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
  ];

  for (const pattern of passengerPatterns) {
    const match = fullText.match(pattern);
    if (match && match.length >= 2 && !travelInfo.passengerName) {
      travelInfo.passengerName = match[1].trim();
      break;
    }
  }

  // 호텔 이름 추출
  const hotelPatterns = [
    /hotel[:\s]*([A-Za-z\s&]+?)(?:\n|\r|,|\.)/gi,
    /(?:staying at|accommodation)[:\s]*([A-Za-z\s&]+?)(?:\n|\r|,|\.)/gi,
  ];

  for (const pattern of hotelPatterns) {
    const match = fullText.match(pattern);
    if (match && match.length >= 2 && !travelInfo.hotelName) {
      travelInfo.hotelName = match[1].trim();
      break;
    }
  }
}

/**
 * 추출된 데이터를 기반으로 신뢰도 조정
 */
function adjustConfidenceBasedOnExtractedData(travelInfo: TravelInfo) {
  const extracted = travelInfo.extractedData;

  // 추출된 데이터에 따른 보너스 점수
  if (extracted.flights.length > 0) {
    travelInfo.confidence += 0.2;
    if (!travelInfo.flightNumber && extracted.flights.length > 0) {
      travelInfo.flightNumber = extracted.flights[0];
    }
  }

  if (extracted.airports.length >= 2) {
    travelInfo.confidence += 0.15;
    if (!travelInfo.departure && !travelInfo.destination) {
      travelInfo.departure = extracted.airports[0];
      travelInfo.destination = extracted.airports[1];
    }
  }

  if (extracted.dates.length >= 1) {
    travelInfo.confidence += 0.1;
    if (!travelInfo.departureDate) {
      travelInfo.departureDate = extracted.dates[0];
    }
    if (extracted.dates.length >= 2 && !travelInfo.returnDate) {
      travelInfo.returnDate = extracted.dates[1];
    }
  }

  if (extracted.bookingCodes.length > 0) {
    travelInfo.confidence += 0.1;
    if (!travelInfo.bookingReference) {
      travelInfo.bookingReference = extracted.bookingCodes[0];
    }
  }

  // 매치된 패턴 수에 따른 보너스
  if (extracted.matchedPatterns.length > 1) {
    travelInfo.confidence += 0.05 * (extracted.matchedPatterns.length - 1);
  }

  // 최대 신뢰도 제한
  travelInfo.confidence = Math.min(travelInfo.confidence, 1.0);
}

/**
 * 고급 여행 이메일 분석 - 지능형 패턴 매칭 및 중복 제거 (1년 범위)
 * @param accessToken 사용자의 Google 액세스 토큰
 * @param maxResults 최대 검색 결과 수 (기본값: 365 - 1년치 여행 기록)
 */
export async function analyzeTravelEmails(
  accessToken: string,
  maxResults: number = 365
): Promise<TravelInfo[]> {
  try {
    const emails = await searchTravelEmails(accessToken, maxResults);
    const travelInfos: TravelInfo[] = [];

    for (const email of emails) {
      const travelInfo = extractTravelInfo(email);
      if (travelInfo) {
        // 이메일 컨텍스트 정보 추가
        const emailContext = {
          senderDomain: email.from.split('@')[1] || '',
          hasMultipleBookings:
            email.body.toLowerCase().split('booking').length > 2,
          isForwardedEmail:
            email.subject.toLowerCase().includes('fwd:') ||
            email.subject.toLowerCase().includes('fw:'),
          hasAttachments: false, // Gmail API에서 첨부파일 정보 확인 필요
        };

        // 컨텍스트 기반 신뢰도 조정 (email-intelligence 라이브러리 사용)
        // travelInfo.confidence = adjustConfidenceByContext(travelInfo, emailContext)

        travelInfos.push(travelInfo);
      }
    }

    // 지능형 중복 제거 및 병합 (향후 구현)
    // const mergedInfos = deduplicateAndMergeTravelInfo(travelInfos)

    // 우선순위 정렬 (향후 구현)
    // return prioritizeTravelInfo(mergedInfos)

    // 현재는 기본 신뢰도 순으로 정렬
    return travelInfos.sort((a, b) => b.confidence - a.confidence);
  } catch (error) {
    // Error analyzing travel emails
    throw new Error('이메일 분석 중 오류가 발생했습니다.');
  }
}

/**
 * Gmail API 연결 상태를 확인합니다.
 * @param accessToken 사용자의 Google 액세스 토큰
 */
export async function checkGmailConnection(
  accessToken: string
): Promise<boolean> {
  try {
    const gmail = createGmailClient(accessToken);

    // 단순한 프로필 요청으로 연결 테스트
    await gmail.users.getProfile({
      userId: 'me',
    });

    return true;
  } catch (error) {
    // Gmail connection failed
    return false;
  }
}

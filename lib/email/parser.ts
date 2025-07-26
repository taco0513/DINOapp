import { 
  EmailParserResult, 
  EmailParserOptions, 
  ParsedEmailData, 
  EmailProvider,
  MAJOR_AIRPORTS 
} from '@/types/email';
import { 
  EMAIL_PROVIDERS,
  COMMON_DATE_PATTERNS,
  TIME_PATTERNS,
  AIRPORT_CODE_PATTERN,
  FLIGHT_NUMBER_PATTERNS,
  CONFIRMATION_PATTERNS
} from './patterns';

export class EmailParser {
  private providers: EmailProvider[];
  private options: EmailParserOptions;

  constructor(options: EmailParserOptions = {}) {
    this.providers = EMAIL_PROVIDERS;
    this.options = {
      strictMode: false,
      includeRawData: false,
      confidenceThreshold: 0.6,
      ...options
    };
  }

  /**
   * 이메일을 파싱하여 여행 정보를 추출합니다
   */
  async parseEmail(
    subject: string,
    body: string,
    senderEmail?: string
  ): Promise<EmailParserResult> {
    try {
      // 발신자 도메인 기반으로 제공업체 식별
      const provider = this.identifyProvider(senderEmail, subject, body);
      
      if (!provider) {
        return {
          success: false,
          error: 'Unknown email provider',
          warnings: ['Could not identify email provider']
        };
      }

      // 패턴 매칭으로 데이터 추출
      const extractedData = await this.extractData(subject, body, provider);
      
      if (!extractedData) {
        return {
          success: false,
          error: 'Failed to extract travel data',
          warnings: ['No matching patterns found']
        };
      }

      // 신뢰도 계산
      const confidence = this.calculateConfidence(extractedData, subject, body);
      
      if (confidence < this.options.confidenceThreshold!) {
        return {
          success: false,
          error: `Confidence too low: ${confidence}`,
          warnings: ['Extracted data may be unreliable']
        };
      }

      const result: ParsedEmailData = {
        ...extractedData,
        type: extractedData.type || 'other',
        provider: provider.name,
        rawSubject: this.options.includeRawData ? subject : '',
        rawBody: this.options.includeRawData ? body : '',
        confidence
      };

      return {
        success: true,
        data: result
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 발신자 정보와 내용을 기반으로 이메일 제공업체 식별
   */
  private identifyProvider(
    senderEmail?: string, 
    subject?: string, 
    body?: string
  ): EmailProvider | null {
    // 도메인 기반 식별
    if (senderEmail) {
      const domain = senderEmail.split('@')[1]?.toLowerCase();
      if (domain) {
        const provider = this.providers.find(p => 
          p.domains.some(d => domain.includes(d.toLowerCase()))
        );
        if (provider) return provider;
      }
    }

    // 제목과 본문 기반 식별
    const content = `${subject} ${body}`.toLowerCase();
    
    for (const provider of this.providers) {
      for (const pattern of provider.patterns) {
        const subjectMatch = pattern.subjectPatterns.some(regex => 
          regex.test(subject || '')
        );
        if (subjectMatch) return provider;
      }
    }

    return null;
  }

  /**
   * 패턴을 사용하여 이메일에서 데이터 추출
   */
  private async extractData(
    subject: string,
    body: string,
    provider: EmailProvider
  ): Promise<Partial<ParsedEmailData> | null> {
    const content = body;
    let bestMatch: Partial<ParsedEmailData> | null = null;
    let maxMatches = 0;

    for (const pattern of provider.patterns) {
      const extracted: Partial<ParsedEmailData> = {
        type: pattern.type
      };

      let matchCount = 0;

      // 확인번호 추출
      if (pattern.bodyPatterns.confirmation) {
        const confirmation = this.extractFirstMatch(content, pattern.bodyPatterns.confirmation);
        if (confirmation) {
          extracted.confirmationNumber = confirmation;
          matchCount++;
        }
      }

      // 항공편 정보 추출
      if (pattern.type === 'flight') {
        const flightData = this.extractFlightData(content, pattern);
        if (flightData.flightNumber) {
          extracted.flightNumber = flightData.flightNumber;
          matchCount++;
        }
        if (flightData.departure) {
          extracted.departure = flightData.departure;
          matchCount++;
        }
        if (flightData.arrival) {
          extracted.arrival = flightData.arrival;
          matchCount++;
        }
      }

      // 호텔 정보 추출
      if (pattern.type === 'hotel') {
        const hotelData = this.extractHotelData(content, pattern);
        if (hotelData) {
          extracted.hotel = hotelData;
          matchCount += 2; // 호텔 정보는 가중치 부여
        }
      }

      // 가장 많은 매칭을 가진 패턴 선택
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestMatch = extracted;
      }
    }

    return maxMatches > 0 ? bestMatch : null;
  }

  /**
   * 항공편 정보 추출
   */
  private extractFlightData(content: string, pattern: any) {
    const result: any = {};

    // 항공편 번호
    if (pattern.bodyPatterns.flightNumber) {
      result.flightNumber = this.extractFirstMatch(content, pattern.bodyPatterns.flightNumber);
    }

    // 출발지 정보
    if (pattern.bodyPatterns.departure && pattern.bodyPatterns.departureDate) {
      const departureLocation = this.extractFirstMatch(content, pattern.bodyPatterns.departure);
      const departureDate = this.extractFirstMatch(content, pattern.bodyPatterns.departureDate);
      
      if (departureLocation && departureDate) {
        result.departure = {
          location: this.normalizeLocation(departureLocation),
          date: this.parseDate(departureDate),
          time: this.extractTime(content)
        };
      }
    }

    // 도착지 정보
    if (pattern.bodyPatterns.arrival && pattern.bodyPatterns.arrivalDate) {
      const arrivalLocation = this.extractFirstMatch(content, pattern.bodyPatterns.arrival);
      const arrivalDate = this.extractFirstMatch(content, pattern.bodyPatterns.arrivalDate);
      
      if (arrivalLocation && arrivalDate) {
        result.arrival = {
          location: this.normalizeLocation(arrivalLocation),
          date: this.parseDate(arrivalDate),
          time: this.extractTime(content)
        };
      }
    }

    return result;
  }

  /**
   * 호텔 정보 추출
   */
  private extractHotelData(content: string, pattern: any) {
    const checkInStr = this.extractFirstMatch(content, pattern.bodyPatterns.checkIn || []);
    const checkOutStr = this.extractFirstMatch(content, pattern.bodyPatterns.checkOut || []);
    const locationStr = this.extractFirstMatch(content, pattern.bodyPatterns.location || []);

    if (!checkInStr || !checkOutStr) return null;

    const checkIn = this.parseDate(checkInStr);
    const checkOut = this.parseDate(checkOutStr);

    if (!checkIn || !checkOut) return null;

    return {
      name: locationStr || 'Unknown Hotel',
      location: locationStr || 'Unknown Location',
      checkIn,
      checkOut
    };
  }

  /**
   * 정규식 배열에서 첫 번째 매칭 결과 추출
   */
  private extractFirstMatch(content: string, patterns: RegExp[]): string | null {
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  /**
   * 날짜 문자열을 Date 객체로 파싱
   */
  private parseDate(dateStr: string): Date | null {
    try {
      // 한국어 날짜 형식 (2024년 1월 15일)
      const koreanMatch = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
      if (koreanMatch) {
        const [, year, month, day] = koreanMatch;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }

      // ISO 형식 (2024-01-15)
      const isoMatch = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (isoMatch) {
        const [, year, month, day] = isoMatch;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }

      // 영어 형식 (January 15, 2024)
      const englishMatch = dateStr.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/);
      if (englishMatch) {
        return new Date(dateStr);
      }

      // 기본 Date 파싱 시도
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  }

  /**
   * 시간 정보 추출
   */
  private extractTime(content: string): string | undefined {
    for (const pattern of TIME_PATTERNS) {
      const match = content.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return undefined;
  }

  /**
   * 위치 정보 정규화 (공항 코드 포함)
   */
  private normalizeLocation(location: string): string {
    // 공항 코드 추출
    const airportMatch = location.match(AIRPORT_CODE_PATTERN);
    if (airportMatch && airportMatch[1]) {
      const code = airportMatch[1];
      const airportInfo = MAJOR_AIRPORTS[code];
      if (airportInfo) {
        return `${airportInfo.korean || airportInfo.city} (${code})`;
      }
    }

    return location.trim();
  }

  /**
   * 추출된 데이터의 신뢰도 계산
   */
  private calculateConfidence(
    data: Partial<ParsedEmailData>,
    subject: string,
    body: string
  ): number {
    let score = 0;
    let maxScore = 0;

    // 기본 필드 존재 여부 (각 0.2점)
    const requiredFields = ['type', 'confirmationNumber'];
    maxScore += requiredFields.length * 0.2;
    score += requiredFields.filter(field => 
      data[field as keyof ParsedEmailData]
    ).length * 0.2;

    // 항공편 특화 필드 (각 0.15점)
    if (data.type === 'flight') {
      const flightFields = ['flightNumber', 'departure', 'arrival'];
      maxScore += flightFields.length * 0.15;
      score += flightFields.filter(field => 
        data[field as keyof ParsedEmailData]
      ).length * 0.15;
    }

    // 호텔 특화 필드 (0.3점)
    if (data.type === 'hotel' && data.hotel) {
      maxScore += 0.3;
      score += 0.3;
    }

    // 날짜 유효성 (0.2점)
    maxScore += 0.2;
    if (data.departure?.date || data.arrival?.date || data.hotel?.checkIn) {
      score += 0.2;
    }

    return maxScore > 0 ? Math.min(score / maxScore, 1) : 0;
  }

  /**
   * 배치 파싱 - 여러 이메일 동시 처리
   */
  async parseEmails(emails: Array<{
    subject: string;
    body: string;
    senderEmail?: string;
  }>): Promise<EmailParserResult[]> {
    return Promise.all(
      emails.map(email => 
        this.parseEmail(email.subject, email.body, email.senderEmail)
      )
    );
  }
}

// 기본 파서 인스턴스 내보내기
export const defaultEmailParser = new EmailParser({
  strictMode: false,
  includeRawData: false,
  confidenceThreshold: 0.6
});

// 편의 함수들
export async function parseEmail(
  subject: string,
  body: string,
  senderEmail?: string
): Promise<EmailParserResult> {
  return defaultEmailParser.parseEmail(subject, body, senderEmail);
}

export async function parseEmails(emails: Array<{
  subject: string;
  body: string;
  senderEmail?: string;
}>): Promise<EmailParserResult[]> {
  return defaultEmailParser.parseEmails(emails);
}
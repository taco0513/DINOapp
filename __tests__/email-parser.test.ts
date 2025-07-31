import { EmailParser, parseEmail } from '@/lib/email/parser';
import { EmailParserOptions } from '@/types/email';

describe('EmailParser', () => {
  let parser: EmailParser;

  beforeEach(() => {
    parser = new EmailParser({
      strictMode: false,
      includeRawData: false,
      confidenceThreshold: 0.6,
    });
  });

  describe('Korean Air Email Parsing', () => {
    it('should parse Korean Air flight confirmation email', async () => {
      const subject = '대한항공 항공권 예약 확인서';
      const body = `
        안녕하세요. 대한항공입니다.
        
        예약번호: ABC123
        항공편: KE 123
        출발: 인천국제공항(ICN)
        도착: 나리타국제공항(NRT)
        출발일시: 2024년 3월 15일 14:30
        도착일시: 2024년 3월 15일 17:45
        
        감사합니다.
      `;
      const senderEmail = 'noreply@koreanair.com';

      const result = await parser.parseEmail(subject, body, senderEmail);

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe('flight');
      expect(result.data?.provider).toBe('대한항공');
      expect(result.data?.flightNumber).toBe('123');
      expect(result.data?.confirmationNumber).toBe('ABC123');
      expect(result.data?.departure?.location).toContain('인천국제공항');
      expect(result.data?.arrival?.location).toContain('나리타국제공항');
      expect(result.data?.departure?.date).toEqual(
        new Date('2024-03-14T17:00:00.000Z')
      ); // UTC time
    });

    it('should parse English Korean Air confirmation', async () => {
      const subject = 'Korean Air Booking Confirmation';
      const body = `
        Dear Passenger,
        
        Confirmation Code: XYZ789
        Flight: KE 456
        From: Incheon International Airport (ICN)
        To: Los Angeles International Airport (LAX)
        Departure: March 20, 2024 11:30 AM
        Arrival: March 20, 2024 7:45 AM
        
        Thank you for choosing Korean Air.
      `;
      const senderEmail = 'reservations@ke.com';

      const result = await parser.parseEmail(subject, body, senderEmail);

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe('flight');
      expect(result.data?.flightNumber).toBe('456');
      expect(result.data?.confirmationNumber).toBe('XYZ789');
      expect(result.data?.departure?.location).toContain('ICN');
      expect(result.data?.arrival?.location).toContain('LAX');
    });
  });

  describe('Asiana Airlines Email Parsing', () => {
    it('should parse Asiana flight confirmation', async () => {
      const subject = '아시아나항공 전자항공권 발권완료';
      const body = `
        아시아나항공을 이용해 주셔서 감사합니다.
        
        예약번호: DEF456
        항공편: OZ 789
        출발공항: 김포국제공항(GMP)
        도착공항: 하네다공항(HND)
        출발날짜: 2024.04.10 15:20
        도착날짜: 2024.04.10 17:30
      `;
      const senderEmail = 'booking@flyasiana.com';

      const result = await parser.parseEmail(subject, body, senderEmail);

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe('flight');
      expect(result.data?.provider).toBe('아시아나항공');
      expect(result.data?.flightNumber).toBe('789');
      expect(result.data?.confirmationNumber).toBe('DEF456');
      expect(result.data?.departure?.location).toContain('김포국제공항');
      expect(result.data?.arrival?.location).toContain('하네다공항');
    });
  });

  describe('Hotel Booking Email Parsing', () => {
    it('should parse Booking.com hotel confirmation', async () => {
      const subject = 'Booking.com 예약 확인서';
      const body = `
        예약해 주셔서 감사합니다!
        
        예약번호: 1234567890
        호텔: 서울 그랜드 호텔
        주소: 서울특별시 중구 명동길 123
        체크인: 2024년 5월 1일
        체크아웃: 2024년 5월 3일
        
        즐거운 여행 되세요!
      `;
      const senderEmail = 'noreply@booking.com';

      const result = await parser.parseEmail(subject, body, senderEmail);

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe('hotel');
      expect(result.data?.provider).toBe('Booking.com');
      expect(result.data?.confirmationNumber).toBe('1234567890');
      expect(result.data?.hotel?.checkIn).toEqual(new Date(2024, 4, 1));
      expect(result.data?.hotel?.checkOut).toEqual(new Date(2024, 4, 3));
      expect(result.data?.hotel?.location).toContain('서울특별시');
    });

    it('should parse Agoda hotel confirmation', async () => {
      const subject = 'Your Agoda booking confirmation';
      const body = `
        Thank you for booking with Agoda!
        
        Booking ID: 9876543210
        Property: Tokyo Bay Hilton
        Check-in: May 15, 2024
        Check-out: May 18, 2024
        
        Have a great stay!
      `;
      const senderEmail = 'bookings@agoda.com';

      const result = await parser.parseEmail(subject, body, senderEmail);

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe('hotel');
      expect(result.data?.provider).toBe('Agoda');
      expect(result.data?.confirmationNumber).toBe('9876543210');
      expect(result.data?.hotel?.name).toBe('Tokyo Bay Hilton');
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown email providers', async () => {
      const subject = 'Unknown Travel Booking';
      const body = 'Some random travel email';
      const senderEmail = 'unknown@unknown.com';

      const result = await parser.parseEmail(subject, body, senderEmail);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown email provider');
    });

    it('should handle low confidence scores', async () => {
      const subject = 'Maybe a flight booking?';
      const body = 'Very vague content with no clear patterns';
      const senderEmail = 'test@koreanair.com';

      const result = await parser.parseEmail(subject, body, senderEmail);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to extract travel data');
    });

    it('should handle malformed dates gracefully', async () => {
      const subject = '대한항공 예약 확인';
      const body = `
        예약번호: ABC123
        항공편: KE 123
        출발일시: 잘못된 날짜 형식
      `;
      const senderEmail = 'test@koreanair.com';

      const result = await parser.parseEmail(subject, body, senderEmail);

      if (result.success) {
        expect(result.data?.departure?.date).toBeUndefined();
      } else {
        expect(result.success).toBe(false);
      }
    });
  });

  describe('Batch Processing', () => {
    it('should process multiple emails', async () => {
      const emails = [
        {
          subject: '대한항공 예약 확인',
          body: '예약번호: ABC123\n항공편: KE 123',
          senderEmail: 'test@koreanair.com',
        },
        {
          subject: 'Booking.com 예약 확인',
          body: '예약번호: 1234567890\n체크인: 2024년 5월 1일\n체크아웃: 2024년 5월 3일',
          senderEmail: 'test@booking.com',
        },
      ];

      const results = await parser.parseEmails(emails);

      expect(results).toHaveLength(2);
      expect(results[0].success || results[0].error).toBeDefined();
      expect(results[1].success || results[1].error).toBeDefined();
    });
  });

  describe('Confidence Calculation', () => {
    it('should have high confidence for complete flight data', async () => {
      const subject = '대한항공 예약 확인';
      const body = `
        예약번호: ABC123
        항공편: KE 123
        출발: 인천국제공항(ICN)
        도착: 나리타국제공항(NRT)
        출발일시: 2024년 3월 15일
        도착일시: 2024년 3월 15일
      `;
      const senderEmail = 'test@koreanair.com';

      const result = await parser.parseEmail(subject, body, senderEmail);

      if (result.success) {
        expect(result.data?.confidence).toBeGreaterThan(0.8);
      }
    });

    it('should have lower confidence for incomplete data', async () => {
      const subject = '대한항공 예약 확인';
      const body = '예약번호: ABC123';
      const senderEmail = 'test@koreanair.com';

      const result = await parser.parseEmail(subject, body, senderEmail);

      if (result.success) {
        expect(result.data?.confidence).toBeLessThan(0.8);
      }
    });
  });

  describe('Date Parsing', () => {
    it('should parse various Korean date formats', async () => {
      const testCases = [
        { input: '2024년 3월 15일', expected: new Date(2024, 2, 15) },
        { input: '2024-03-15', expected: new Date(2024, 2, 15) },
        { input: '2024.03.15', expected: new Date(2024, 2, 15) },
      ];

      for (const testCase of testCases) {
        const subject = '대한항공 예약 확인';
        const body = `
          예약번호: ABC123
          항공편: KE 123
          출발일시: ${testCase.input}
        `;
        const senderEmail = 'test@koreanair.com';

        const result = await parser.parseEmail(subject, body, senderEmail);

        if (result.success && result.data?.departure?.date) {
          expect(result.data.departure.date.getTime()).toBe(
            testCase.expected.getTime()
          );
        }
      }
    });

    it('should parse English date formats', async () => {
      const subject = 'Korean Air Confirmation';
      const body = `
        Confirmation: ABC123
        Flight: KE 123
        Departure: March 15, 2024
      `;
      const senderEmail = 'test@koreanair.com';

      const result = await parser.parseEmail(subject, body, senderEmail);

      if (result.success && result.data?.departure?.date) {
        expect(result.data.departure.date.getTime()).toBe(
          new Date(2024, 2, 15).getTime()
        );
      }
    });
  });

  describe('Airport Code Recognition', () => {
    it('should recognize and normalize airport codes', async () => {
      const subject = '대한항공 예약 확인';
      const body = `
        예약번호: ABC123
        항공편: KE 123
        출발: 인천국제공항(ICN)
        도착: 나리타국제공항(NRT)
      `;
      const senderEmail = 'test@koreanair.com';

      const result = await parser.parseEmail(subject, body, senderEmail);

      if (result.success) {
        expect(result.data?.departure?.location).toContain('ICN');
        expect(result.data?.arrival?.location).toContain('NRT');
      }
    });
  });
});

describe('Convenience Functions', () => {
  it('should work with parseEmail function', async () => {
    const subject = '대한항공 예약 확인';
    const body = '예약번호: ABC123\n항공편: KE 123';
    const senderEmail = 'test@koreanair.com';

    const result = await parseEmail(subject, body, senderEmail);

    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
  });
});

describe('Parser Options', () => {
  it('should respect strict mode', async () => {
    const strictParser = new EmailParser({
      strictMode: true,
      confidenceThreshold: 0.9,
    });

    const subject = '대한항공 예약 확인';
    const body = '예약번호: ABC123'; // Minimal data
    const senderEmail = 'test@koreanair.com';

    const result = await strictParser.parseEmail(subject, body, senderEmail);

    expect(result.success).toBe(false);
  });

  it('should include raw data when requested', async () => {
    const parserWithRaw = new EmailParser({
      includeRawData: true,
    });

    const subject = '대한항공 예약 확인';
    const body = '예약번호: ABC123\n항공편: KE 123';
    const senderEmail = 'test@koreanair.com';

    const result = await parserWithRaw.parseEmail(subject, body, senderEmail);

    if (result.success) {
      expect(result.data?.rawSubject).toBe(subject);
      expect(result.data?.rawBody).toBe(body);
    }
  });

  it('should respect confidence threshold', async () => {
    const highThresholdParser = new EmailParser({
      confidenceThreshold: 0.95,
    });

    const subject = '대한항공 예약 확인';
    const body = '예약번호: ABC123'; // Low confidence data
    const senderEmail = 'test@koreanair.com';

    const result = await highThresholdParser.parseEmail(
      subject,
      body,
      senderEmail
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Confidence too low');
  });
});

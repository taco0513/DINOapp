import { parseISO, differenceInDays, isAfter, isBefore, format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { prisma } from '@/lib/prisma';
import { parseFlightEmail, airportToCountry, type FlightDetails, type ParsedFlightEmail } from './flight-parser';
import { analyzeTravelEmails } from '@/lib/gmail';

export interface AutoEntryRecord {
  visaId?: string;
  countryCode: string;
  countryName: string;
  entryDate: string;
  exitDate?: string;
  entryType: 'auto_flight' | 'auto_hotel' | 'manual';
  source: {
    type: 'gmail_flight' | 'gmail_hotel' | 'manual';
    emailId?: string;
    flightNumber?: string;
    bookingReference?: string;
  };
  confidence: number;
  status: 'pending' | 'confirmed' | 'rejected';
  notes?: string;
}

export interface EntryExitPair {
  entry: AutoEntryRecord;
  exit?: AutoEntryRecord;
  tripDuration?: number;
  visaInfo?: {
    id: string;
    visaType: string;
    maxStayDays: number | null;
    expiryDate: string;
  };
}

/**
 * Gmail에서 항공권 이메일을 분석하여 입출국 기록을 자동 생성
 */
export async function detectEntriesFromGmail(
  userId: string,
  accessToken: string,
  dateRange?: { start: Date; end: Date }
): Promise<AutoEntryRecord[]> {
  try {
    // 1. Gmail에서 여행 이메일 분석
    const travelEmails = await analyzeTravelEmails(accessToken, 200);
    const autoEntries: AutoEntryRecord[] = [];
    
    // 2. 각 이메일에서 항공권 정보 추출
    for (const email of travelEmails) {
      // 항공사 이메일인지 확인
      if (email.category !== 'airline' || email.confidence < 0.5) {
        continue;
      }
      
      // 항공권 상세 정보 파싱
      const parsedFlight = parseFlightEmail(
        email.emailId,
        email.subject,
        email.from,
        email.body,
        email.date
      );
      
      if (!parsedFlight || parsedFlight.confidence < 0.6) {
        continue;
      }
      
      // 3. 항공편 정보를 입출국 기록으로 변환
      const entries = await convertFlightsToEntries(
        parsedFlight,
        userId,
        dateRange
      );
      
      autoEntries.push(...entries);
    }
    
    // 4. 중복 제거 및 정렬
    const uniqueEntries = deduplicateEntries(autoEntries);
    
    // 5. 입출국 쌍 매칭
    const entryExitPairs = matchEntryExitPairs(uniqueEntries);
    
    // 6. 최종 검증 및 반환
    return validateAndFinalizeEntries(entryExitPairs, userId);
    
  } catch (error) {
    console.error('Error detecting entries from Gmail:', error);
    throw new Error('Gmail에서 입출국 기록을 감지하는 중 오류가 발생했습니다.');
  }
}

/**
 * 항공편 정보를 입출국 기록으로 변환
 */
async function convertFlightsToEntries(
  parsedFlight: ParsedFlightEmail,
  userId: string,
  dateRange?: { start: Date; end: Date }
): Promise<AutoEntryRecord[]> {
  const entries: AutoEntryRecord[] = [];
  
  for (let i = 0; i < parsedFlight.flights.length; i++) {
    const flight = parsedFlight.flights[i];
    
    // 날짜 범위 필터링
    if (dateRange) {
      const flightDate = parseISO(flight.departure.date);
      if (isBefore(flightDate, dateRange.start) || isAfter(flightDate, dateRange.end)) {
        continue;
      }
    }
    
    // 출발 국가와 도착 국가 확인
    const departureCountry = airportToCountry[flight.departure.airportCode];
    const arrivalCountry = airportToCountry[flight.arrival.airportCode];
    
    if (!departureCountry || !arrivalCountry) {
      continue; // 국가 정보가 없으면 스킵
    }
    
    // 국제선 여부 확인
    if (departureCountry.code === arrivalCountry.code) {
      continue; // 국내선은 스킵
    }
    
    // 사용자의 해당 국가 비자 확인
    const userVisa = await findUserVisa(userId, arrivalCountry.code, flight.arrival.date);
    
    // 입국 기록 생성 (도착 국가)
    entries.push({
      visaId: userVisa?.id,
      countryCode: arrivalCountry.code,
      countryName: arrivalCountry.name,
      entryDate: flight.arrival.date,
      entryType: 'auto_flight',
      source: {
        type: 'gmail_flight',
        emailId: parsedFlight.emailId,
        flightNumber: flight.flightNumber,
        bookingReference: flight.bookingReference
      },
      confidence: flight.confidence * 0.9, // 자동 감지는 약간 낮은 신뢰도
      status: 'pending',
      notes: `${flight.airline} ${flight.flightNumber} 편으로 ${flight.departure.airportCode}에서 도착`
    });
    
    // 왕복 항공편의 경우 출국 기록도 추가
    if (parsedFlight.tripType === 'round-trip' && i === parsedFlight.flights.length - 1) {
      // 마지막 항공편이 복귀 항공편인 경우
      const returnFlight = flight;
      const outboundFlight = parsedFlight.flights[0];
      
      // 원래 방문 국가에서 출국
      entries.push({
        countryCode: departureCountry.code,
        countryName: departureCountry.name,
        entryDate: outboundFlight.arrival.date, // 원래 도착일이 입국일
        exitDate: returnFlight.departure.date,   // 복귀 출발일이 출국일
        entryType: 'auto_flight',
        source: {
          type: 'gmail_flight',
          emailId: parsedFlight.emailId,
          flightNumber: returnFlight.flightNumber,
          bookingReference: returnFlight.bookingReference
        },
        confidence: returnFlight.confidence * 0.9,
        status: 'pending',
        notes: `${returnFlight.airline} ${returnFlight.flightNumber} 편으로 출국`
      });
    }
  }
  
  return entries;
}

/**
 * 사용자의 해당 국가 비자 찾기
 */
async function findUserVisa(
  userId: string, 
  countryCode: string, 
  entryDate: string
): Promise<{ id: string; visaType: string; maxStayDays: number | null; expiryDate: string } | null> {
  const entryDateObj = parseISO(entryDate);
  
  const visa = await prisma.userVisa.findFirst({
    where: {
      userId,
      countryCode,
      status: 'active',
      issueDate: {
        lte: entryDateObj
      },
      expiryDate: {
        gte: entryDateObj
      }
    },
    orderBy: {
      expiryDate: 'desc'
    },
    select: {
      id: true,
      visaType: true,
      maxStayDays: true,
      expiryDate: true
    }
  });
  
  return visa ? {
    id: visa.id,
    visaType: visa.visaType,
    maxStayDays: visa.maxStayDays,
    expiryDate: visa.expiryDate.toISOString()
  } : null;
}

/**
 * 중복 입출국 기록 제거
 */
function deduplicateEntries(entries: AutoEntryRecord[]): AutoEntryRecord[] {
  const uniqueMap = new Map<string, AutoEntryRecord>();
  
  for (const entry of entries) {
    // 고유 키 생성 (국가코드 + 날짜 + 항공편번호)
    const key = `${entry.countryCode}-${entry.entryDate}-${entry.source.flightNumber || 'unknown'}`;
    
    // 이미 있는 경우 더 높은 신뢰도의 것을 유지
    const existing = uniqueMap.get(key);
    if (!existing || entry.confidence > existing.confidence) {
      uniqueMap.set(key, entry);
    }
  }
  
  return Array.from(uniqueMap.values()).sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );
}

/**
 * 입출국 쌍 매칭
 */
function matchEntryExitPairs(entries: AutoEntryRecord[]): EntryExitPair[] {
  const pairs: EntryExitPair[] = [];
  const processedIndices = new Set<number>();
  
  for (let i = 0; i < entries.length; i++) {
    if (processedIndices.has(i)) continue;
    
    const entry = entries[i];
    
    // 이미 출국일이 있는 경우
    if (entry.exitDate) {
      pairs.push({
        entry,
        exit: entry,
        tripDuration: differenceInDays(
          parseISO(entry.exitDate),
          parseISO(entry.entryDate)
        ) + 1
      });
      processedIndices.add(i);
      continue;
    }
    
    // 같은 국가의 다음 출국 기록 찾기
    let exitRecord: AutoEntryRecord | undefined;
    for (let j = i + 1; j < entries.length; j++) {
      const candidate = entries[j];
      
      // 같은 국가이고 입국일이 이전 입국일 이후인 경우
      if (
        candidate.countryCode === entry.countryCode &&
        isAfter(parseISO(candidate.entryDate), parseISO(entry.entryDate))
      ) {
        // 출국 기록으로 사용
        exitRecord = {
          ...entry,
          exitDate: candidate.entryDate,
          notes: `다음 여행 시작으로 인한 자동 출국 추정`
        };
        break;
      }
    }
    
    pairs.push({
      entry,
      exit: exitRecord,
      tripDuration: exitRecord 
        ? differenceInDays(parseISO(exitRecord.exitDate!), parseISO(entry.entryDate)) + 1
        : undefined
    });
    
    processedIndices.add(i);
  }
  
  return pairs;
}

/**
 * 최종 검증 및 정리
 */
async function validateAndFinalizeEntries(
  pairs: EntryExitPair[],
  userId: string
): Promise<AutoEntryRecord[]> {
  const finalEntries: AutoEntryRecord[] = [];
  
  for (const pair of pairs) {
    // 기존 기록과 중복 확인
    const existingEntry = await prisma.visaEntry.findFirst({
      where: {
        userVisa: {
          userId,
          countryCode: pair.entry.countryCode
        },
        entryDate: {
          gte: addDays(parseISO(pair.entry.entryDate), -1),
          lte: addDays(parseISO(pair.entry.entryDate), 1)
        }
      }
    });
    
    if (existingEntry) {
      continue; // 이미 기록이 있으면 스킵
    }
    
    // 비자 정보 추가
    if (pair.entry.visaId) {
      const visa = await prisma.userVisa.findUnique({
        where: { id: pair.entry.visaId },
        select: {
          visaType: true,
          maxStayDays: true,
          expiryDate: true
        }
      });
      
      if (visa) {
        pair.visaInfo = {
          id: pair.entry.visaId,
          visaType: visa.visaType,
          maxStayDays: visa.maxStayDays,
          expiryDate: visa.expiryDate.toISOString()
        };
      }
    }
    
    // 체류 기간 검증
    if (pair.visaInfo && pair.tripDuration) {
      if (pair.visaInfo.maxStayDays && pair.tripDuration > pair.visaInfo.maxStayDays) {
        pair.entry.notes = `⚠️ 체류 기간 초과 가능성 (${pair.tripDuration}일 / 최대 ${pair.visaInfo.maxStayDays}일)`;
        pair.entry.confidence *= 0.8; // 신뢰도 하향
      }
    }
    
    finalEntries.push(pair.entry);
  }
  
  return finalEntries;
}

/**
 * 자동 감지된 입출국 기록을 데이터베이스에 저장
 */
export async function saveAutoDetectedEntries(
  userId: string,
  entries: AutoEntryRecord[],
  autoConfirm: boolean = false
): Promise<{ saved: number; skipped: number; errors: number }> {
  let saved = 0;
  let skipped = 0; 
  let errors = 0;
  
  for (const entry of entries) {
    try {
      // 신뢰도가 높고 자동 확인이 활성화된 경우
      if (entry.confidence >= 0.8 && autoConfirm) {
        entry.status = 'confirmed';
      }
      
      // 비자 ID가 없으면 스킵 (비자 없이는 입국 기록 생성 불가)
      if (!entry.visaId) {
        skipped++;
        continue;
      }
      
      // 입국 기록 생성
      await prisma.visaEntry.create({
        data: {
          userVisaId: entry.visaId,
          entryDate: parseISO(entry.entryDate),
          exitDate: entry.exitDate ? parseISO(entry.exitDate) : null,
          stayDays: entry.exitDate 
            ? differenceInDays(parseISO(entry.exitDate), parseISO(entry.entryDate)) + 1
            : null,
          purpose: 'auto_detected',
          notes: entry.notes,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      saved++;
    } catch (error) {
      console.error('Error saving auto-detected entry:', error);
      errors++;
    }
  }
  
  return { saved, skipped, errors };
}
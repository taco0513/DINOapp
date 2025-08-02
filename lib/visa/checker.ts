/**
 * DINO v2.0 - Visa Requirement Checker
 * Core logic for checking visa requirements between countries
 */

import type { 
  VisaRequirement, 
  VisaRequirementResult, 
  VisaCheckerRequest,
  VisaCheckerResponse,
  VisaApplicationInfo,
  TravelPurpose,
  EmbassyInfo 
} from '@/types/visa';
import { getCountryByCode } from '@/data/countries';

/**
 * Check visa requirement between two countries
 */
export function checkVisaRequirement(
  passportCountry: string, 
  destination: string
): VisaRequirementResult {
  const fromCountry = getCountryByCode(passportCountry);
  const toCountry = getCountryByCode(destination);
  
  if (!fromCountry || !toCountry) {
    throw new Error('Invalid country code provided');
  }
  
  // Same country
  if (passportCountry === destination) {
    return {
      fromCountry: passportCountry,
      toCountry: destination,
      requirement: 'visa_free',
      maxStayDays: 365,
      notes: '본국이므로 비자가 필요하지 않습니다.',
      lastUpdated: new Date().toISOString()
    };
  }
  
  // Check visa-free access
  if (toCountry.visaFree.includes(passportCountry)) {
    const maxStayDays = getMaxStayDays(passportCountry, destination, 'visa_free');
    return {
      fromCountry: passportCountry,
      toCountry: destination,
      requirement: 'visa_free',
      maxStayDays,
      notes: `${maxStayDays}일간 무비자 입국 가능`,
      lastUpdated: new Date().toISOString()
    };
  }
  
  // Check e-visa availability
  if (toCountry.evisaAvailable.includes(passportCountry)) {
    const maxStayDays = getMaxStayDays(passportCountry, destination, 'evisa');
    return {
      fromCountry: passportCountry,
      toCountry: destination,
      requirement: 'evisa',
      maxStayDays,
      notes: '전자비자(e-Visa) 발급 필요',
      processingTime: '3-7일',
      cost: getVisaCost(passportCountry, destination, 'evisa'),
      validityPeriod: '90일',
      lastUpdated: new Date().toISOString()
    };
  }
  
  // Check visa on arrival (common for tourism in certain countries)
  if (isVisaOnArrivalAvailable(passportCountry, destination)) {
    const maxStayDays = getMaxStayDays(passportCountry, destination, 'visa_on_arrival');
    return {
      fromCountry: passportCountry,
      toCountry: destination,
      requirement: 'visa_on_arrival',
      maxStayDays,
      notes: '도착비자 발급 가능',
      processingTime: '현장 즉시',
      cost: getVisaCost(passportCountry, destination, 'visa_on_arrival'),
      validityPeriod: '30일',
      lastUpdated: new Date().toISOString()
    };
  }
  
  // Default: visa required
  const maxStayDays = getMaxStayDays(passportCountry, destination, 'visa_required');
  return {
    fromCountry: passportCountry,
    toCountry: destination,
    requirement: 'visa_required',
    maxStayDays,
    notes: '사전 비자 발급 필수',
    processingTime: '7-21일',
    cost: getVisaCost(passportCountry, destination, 'visa_required'),
    validityPeriod: '90일',
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get maximum stay days for specific visa type
 */
function getMaxStayDays(
  passportCountry: string, 
  destination: string, 
  visaType: VisaRequirement
): number {
  const destinationCountry = getCountryByCode(destination);
  // const passportCountryData = getCountryByCode(passportCountry);
  
  // Check if destination is Schengen and passport country has visa-free access
  if (destinationCountry?.isSchengen && 
      destinationCountry.visaFree.includes(passportCountry) && 
      visaType === 'visa_free') {
    return 90; // Schengen area: 90 days in 180-day period
  }
  
  // Special cases for non-Schengen routes
  const route = `${passportCountry}-${destination}`;
  const specialRoutes: Record<string, number> = {
    // Korean passport special cases
    'KR-JP': 90,    // Korea to Japan (visa-free)
    'KR-US': 90,    // Korea to US (ESTA required)
    'KR-CA': 180,   // Korea to Canada (eTA required)
    'KR-AU': 90,    // Korea to Australia (ETA required)
    'KR-NZ': 90,    // Korea to New Zealand (NZeTA required)
    'KR-GB': 180,   // Korea to UK (ETA required from 2024)
    // US passport special cases
    'US-CA': 180,   // US to Canada (no visa required)
    'US-GB': 180,   // US to UK (ETA required from 2024)
    'US-AU': 90,    // US to Australia (ETA required)
    'US-NZ': 90,    // US to New Zealand (NZeTA required)
    // Canada passport special cases
    'CA-US': 90,    // Canada to US (ESTA required)
    'CA-GB': 180,   // Canada to UK (ETA required from 2024)
    'CA-AU': 90,    // Canada to Australia (ETA required)
    'CA-NZ': 90,    // Canada to New Zealand (NZeTA required)
  };
  
  if (specialRoutes[route]) {
    return specialRoutes[route];
  }
  
  // Default stay periods by visa type
  switch (visaType) {
    case 'visa_free':
      return 30;
    case 'visa_on_arrival':
      return 30;
    case 'evisa':
      return 30;
    case 'visa_required':
      return 90;
    default:
      return 30;
  }
}

/**
 * Get visa cost for specific route
 */
function getVisaCost(
  passportCountry: string, 
  destination: string, 
  visaType: VisaRequirement
): string {
  // Special cost cases
  const route = `${passportCountry}-${destination}`;
  
  const specialCosts: Record<string, string> = {
    'KR-US': '$21 (ESTA)',
    'KR-CA': 'CAD $7 (eTA)',
    'KR-AU': 'AUD $20 (ETA)',
    'KR-NZ': 'NZD $23 (NZeTA)',
    'KR-GB': '£10 (ETA)',
    // Other major passport routes
    'US-CA': 'CAD $7 (eTA)',
    'US-AU': 'AUD $20 (ETA)',
    'US-NZ': 'NZD $23 (NZeTA)',
    'US-GB': '£10 (ETA)',
    'CA-US': '$21 (ESTA)',
    'CA-AU': 'AUD $20 (ETA)',
    'CA-NZ': 'NZD $23 (NZeTA)',
    'CA-GB': '£10 (ETA)',
  };
  
  if (specialCosts[route]) {
    return specialCosts[route];
  }
  
  // Default costs by visa type
  switch (visaType) {
    case 'visa_on_arrival':
      return '$25-50';
    case 'evisa':
      return '$30-80';
    case 'visa_required':
      return '$50-150';
    default:
      return '무료';
  }
}

/**
 * Check if visa on arrival is available
 */
function isVisaOnArrivalAvailable(passportCountry: string, destination: string): boolean {
  // Common visa on arrival destinations for Korean passport holders
  const visaOnArrivalRoutes = [
    'KR-TH', // Thailand (but visa-free is also available)
    'KR-ID', // Indonesia
    'KR-KH', // Cambodia
    'KR-LK', // Sri Lanka
    'KR-MM', // Myanmar
    'KR-BD', // Bangladesh
    'KR-NP', // Nepal
    'KR-MV', // Maldives
    'KR-JO', // Jordan
    'KR-EG', // Egypt
  ];
  
  return visaOnArrivalRoutes.includes(`${passportCountry}-${destination}`);
}

/**
 * Get detailed visa application information
 */
export function getVisaApplicationInfo(
  passportCountry: string,
  destination: string,
  _purpose: TravelPurpose = 'tourism'
): VisaApplicationInfo | null {
  const requirement = checkVisaRequirement(passportCountry, destination);
  
  if (requirement.requirement === 'visa_free') {
    return null; // No application needed
  }
  
  const country = getCountryByCode(destination);
  if (!country) return null;
  
  const baseRequirements = [
    '유효한 여권 (6개월 이상 유효기간)',
    '비자 신청서',
    '여권 사진 (최근 6개월 이내)',
    '항공권 예약 확인서',
    '숙박 예약 확인서',
  ];
  
  const purposeRequirements: Record<TravelPurpose, string[]> = {
    tourism: ['여행 일정표', '재정 증명서'],
    business: ['사업자등록증', '초청장', '재직증명서'],
    transit: ['최종 목적지 비자 (필요시)'],
    work: ['고용 계약서', '노동 허가서', '건강검진서'],
    study: ['입학 허가서', '학비 납입 증명서', '재정 보증서'],
    family_visit: ['친족 관계 증명서', '초청장', '보증서']
  };
  
  return {
    country: destination,
    purpose: _purpose,
    requirements: [...baseRequirements, ...purposeRequirements[_purpose] || []],
    processingTime: requirement.processingTime || '7-14일',
    cost: requirement.cost || '$50-100',
    validityPeriod: requirement.validityPeriod || '90일',
    applicationUrl: getApplicationUrl(destination),
    embassy: getEmbassyInfo(passportCountry, destination)
  };
}

/**
 * Get application URL for specific country
 */
function getApplicationUrl(destination: string): string | undefined {
  const urls: Record<string, string> = {
    'US': 'https://travel.state.gov/content/travel/en/us-visas.html',
    'CA': 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html',
    'AU': 'https://immi.homeaffairs.gov.au/visas',
    'NZ': 'https://www.immigration.govt.nz/new-zealand-visas',
    'GB': 'https://www.gov.uk/apply-uk-visa',
    'IN': 'https://indianvisaonline.gov.in/evisa/',
    'CN': 'http://www.china-embassy.or.kr/kor/',
  };
  
  return urls[destination];
}

/**
 * Get embassy information (simplified for MVP)
 */
function getEmbassyInfo(passportCountry: string, destination: string) {
  // For MVP, return basic info for major embassies in Korea
  if (passportCountry === 'KR') {
    const embassies: Record<string, unknown> = {
      'US': {
        name: '주한 미국 대사관',
        address: '서울특별시 중구 세종대로 188',
        phone: '02-397-4114',
        website: 'https://kr.usembassy.gov/',
        workingHours: '월-금 08:30-17:30'
      },
      'CN': {
        name: '주한 중국 대사관',
        address: '서울특별시 중구 명동2가 27-1',
        phone: '02-738-1038',
        website: 'http://www.china-embassy.or.kr/',
        workingHours: '월-금 09:00-17:00'
      }
      // Add more embassies as needed
    };
    
    return embassies[destination] as EmbassyInfo | undefined;
  }
  
  return undefined;
}

/**
 * Comprehensive visa checker (main API function)
 */
export function checkVisaRequirements(request: VisaCheckerRequest): VisaCheckerResponse {
  try {
    const requirement = checkVisaRequirement(
      request.passportCountry,
      request.destination
    );
    
    const applicationInfo = getVisaApplicationInfo(
      request.passportCountry,
      request.destination,
      request.purpose
    );
    
    const recommendations = generateRecommendations(requirement, request);
    
    return {
      success: true,
      data: {
        requirement,
        applicationInfo: applicationInfo || undefined,
        recommendations
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate travel recommendations based on visa requirements
 */
function generateRecommendations(
  requirement: VisaRequirementResult,
  request: VisaCheckerRequest
): readonly string[] {
  const recommendations: string[] = [];
  
  switch (requirement.requirement) {
    case 'visa_free':
      recommendations.push('🎉 비자 없이 여행 가능합니다!');
      recommendations.push(`📅 최대 ${requirement.maxStayDays}일 체류 가능`);
      if (requirement.maxStayDays <= 30) {
        recommendations.push('⏰ 짧은 체류 기간이므로 일정을 미리 계획하세요');
      }
      break;
      
    case 'evisa':
      recommendations.push('💻 온라인으로 전자비자 신청 가능');
      recommendations.push('📋 미리 신청하여 승인을 받고 여행하세요');
      recommendations.push('⚡ 빠른 처리를 위해 서류를 정확히 준비하세요');
      break;
      
    case 'visa_on_arrival':
      recommendations.push('✈️ 공항에서 도착비자 발급 가능');
      recommendations.push('💵 현금을 준비하여 비자 수수료를 지불하세요');
      recommendations.push('📄 필요 서류를 미리 준비하여 대기시간을 단축하세요');
      break;
      
    case 'visa_required':
      recommendations.push('📝 사전에 비자 발급이 필수입니다');
      recommendations.push(`⏰ 처리 기간 ${requirement.processingTime}을 고려하여 미리 신청하세요`);
      recommendations.push('🏛️ 해당 국가 대사관/영사관에 문의하세요');
      break;
  }
  
  // Add general recommendations
  if (request.stayDuration && request.stayDuration > requirement.maxStayDays) {
    recommendations.push(`⚠️ 계획된 체류 기간(${request.stayDuration}일)이 허용 기간을 초과합니다`);
  }
  
  return recommendations;
}
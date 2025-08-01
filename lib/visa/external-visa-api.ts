// 외부 비자 정보 API 통합 서비스
// 실제 API 연동을 위한 서비스 레이어

export interface ExternalVisaApiResponse {
  fromCountry: string;
  toCountry: string;
  visaRequired: boolean;
  visaFreeStay?: number;
  processingTime?: string;
  cost?: string;
  requirements?: string[];
  lastUpdated: string;
  source: 'sherpa' | 'visahq' | 'iata' | 'government';
}

export interface VisaApiConfig {
  sherpa?: {
    apiKey: string;
    baseUrl: string;
  };
  visahq?: {
    apiKey: string;
    baseUrl: string;
  };
  iata?: {
    token: string;
    baseUrl: string;
  };
}

export class ExternalVisaApiService {
  private config: VisaApiConfig;
  private cache = new Map<
    string,
    { data: ExternalVisaApiResponse; expires: number }
  >();
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24시간 캐시

  constructor(config: VisaApiConfig) {
    this.config = config;
  }

  /**
   * Sherpa API 연동
   */
  async getSherpaVisaInfo(
    fromCountry: string,
    toCountry: string
  ): Promise<ExternalVisaApiResponse | null> {
    if (!this.config.sherpa) return null;

    try {
      const response = await fetch(`${this.config.sherpa.baseUrl}/v3/trips`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.sherpa.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: fromCountry,
          destinations: [toCountry],
          travelPurpose: 'TOURISM',
        }),
      });

      if (!response.ok) throw new Error(`Sherpa API error: ${response.status}`);

      const data = await response.json();
      return this.normalizeSherpaResponse(data);
    } catch (error) {
      console.error('Sherpa API 오류:', error);
      return null;
    }
  }

  /**
   * VisaHQ API 연동
   */
  async getVisaHqInfo(
    fromCountry: string,
    toCountry: string
  ): Promise<ExternalVisaApiResponse | null> {
    if (!this.config.visahq) return null;

    try {
      const fromCountrySlug = this.countryCodeToSlug(fromCountry);
      const toCountrySlug = this.countryCodeToSlug(toCountry);

      const response = await fetch(
        `${this.config.visahq.baseUrl}/visa-requirements?from_country=${fromCountrySlug}&to_country=${toCountrySlug}&api_key=${this.config.visahq.apiKey}`
      );

      if (!response.ok) throw new Error(`VisaHQ API error: ${response.status}`);

      const data = await response.json();
      return this.normalizeVisaHqResponse(data);
    } catch (error) {
      console.error('VisaHQ API 오류:', error);
      return null;
    }
  }

  /**
   * IATA API 연동
   */
  async getIataInfo(
    fromCountry: string,
    toCountry: string
  ): Promise<ExternalVisaApiResponse | null> {
    if (!this.config.iata) return null;

    try {
      const response = await fetch(
        `${this.config.iata.baseUrl}/v1/requirements?origin=${fromCountry}&destination=${toCountry}&passport=${fromCountry}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.iata.token}`,
          },
        }
      );

      if (!response.ok) throw new Error(`IATA API error: ${response.status}`);

      const data = await response.json();
      return this.normalizeIataResponse(data);
    } catch (error) {
      console.error('IATA API 오류:', error);
      return null;
    }
  }

  /**
   * 모든 API에서 정보를 가져와서 가장 신뢰할 수 있는 정보 반환
   */
  async getVisaInfoWithFallback(
    fromCountry: string,
    toCountry: string
  ): Promise<ExternalVisaApiResponse | null> {
    const cacheKey = `${fromCountry}-${toCountry}`;

    // 캐시 확인
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    // 여러 API에서 정보 수집 (병렬 처리)
    const [sherpaInfo, visaHqInfo, iataInfo] = await Promise.allSettled([
      this.getSherpaVisaInfo(fromCountry, toCountry),
      this.getVisaHqInfo(fromCountry, toCountry),
      this.getIataInfo(fromCountry, toCountry),
    ]);

    // 성공한 응답들만 추출
    const validResponses: ExternalVisaApiResponse[] = [];

    if (sherpaInfo.status === 'fulfilled' && sherpaInfo.value) {
      validResponses.push(sherpaInfo.value);
    }
    if (visaHqInfo.status === 'fulfilled' && visaHqInfo.value) {
      validResponses.push(visaHqInfo.value);
    }
    if (iataInfo.status === 'fulfilled' && iataInfo.value) {
      validResponses.push(iataInfo.value);
    }

    if (validResponses.length === 0) return null;

    // 가장 신뢰할 수 있는 정보 선택 (우선순위: 정부 > Sherpa > IATA > VisaHQ)
    const bestResponse = this.selectBestResponse(validResponses);

    // 캐시에 저장
    this.cache.set(cacheKey, {
      data: bestResponse,
      expires: Date.now() + this.cacheTimeout,
    });

    return bestResponse;
  }

  /**
   * 응답 정규화 - Sherpa
   */
  private normalizeSherpaResponse(data: any): ExternalVisaApiResponse {
    const destination = data.destinations?.[0];
    return {
      fromCountry: data.origin,
      toCountry: destination?.country,
      visaRequired: destination?.requirements?.visa?.required === true,
      visaFreeStay: destination?.requirements?.visa?.maxStay,
      processingTime: destination?.requirements?.visa?.processingTime,
      cost: destination?.requirements?.visa?.fees,
      requirements: destination?.requirements?.visa?.documents || [],
      lastUpdated: new Date().toISOString(),
      source: 'sherpa',
    };
  }

  /**
   * 응답 정규화 - VisaHQ
   */
  private normalizeVisaHqResponse(data: any): ExternalVisaApiResponse {
    return {
      fromCountry: data.from_country,
      toCountry: data.to_country,
      visaRequired: data.visa_required === true,
      visaFreeStay: data.visa_free_days,
      processingTime: data.processing_time,
      cost: data.visa_fee,
      requirements: data.required_documents || [],
      lastUpdated: new Date().toISOString(),
      source: 'visahq',
    };
  }

  /**
   * 응답 정규화 - IATA
   */
  private normalizeIataResponse(data: any): ExternalVisaApiResponse {
    const visaInfo = data.requirements?.visa;
    return {
      fromCountry: data.origin,
      toCountry: data.destination,
      visaRequired: visaInfo?.required === true,
      visaFreeStay: visaInfo?.maxStay,
      processingTime: visaInfo?.processingTime,
      cost: visaInfo?.fee,
      requirements: visaInfo?.documents || [],
      lastUpdated: new Date().toISOString(),
      source: 'iata',
    };
  }

  /**
   * 가장 신뢰할 수 있는 응답 선택
   */
  private selectBestResponse(
    responses: ExternalVisaApiResponse[]
  ): ExternalVisaApiResponse {
    // 우선순위: government > sherpa > iata > visahq
    const priority = ['government', 'sherpa', 'iata', 'visahq'];

    for (const source of priority) {
      const found = responses.find(r => r.source === source);
      if (found) return found;
    }

    // 우선순위에 없는 경우 첫 번째 응답 반환
    return responses[0];
  }

  /**
   * 국가 코드를 슬러그로 변환 (VisaHQ용)
   */
  private countryCodeToSlug(countryCode: string): string {
    const mapping: { [key: string]: string } = {
      KR: 'south-korea',
      US: 'united-states',
      JP: 'japan',
      CN: 'china',
      TH: 'thailand',
      SG: 'singapore',
      MY: 'malaysia',
      VN: 'vietnam',
      PH: 'philippines',
      ID: 'indonesia',
      FR: 'france',
      DE: 'germany',
      IT: 'italy',
      ES: 'spain',
      CA: 'canada',
      MX: 'mexico',
      IN: 'india',
      RU: 'russia',
      EG: 'egypt',
      AU: 'australia',
      NZ: 'new-zealand',
      AE: 'united-arab-emirates',
      TR: 'turkey',
      IL: 'israel',
    };

    return mapping[countryCode] || countryCode.toLowerCase();
  }

  /**
   * 캐시 클리어
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 특정 국가 쌍의 캐시 클리어
   */
  clearCacheForCountries(fromCountry: string, toCountry: string): void {
    const cacheKey = `${fromCountry}-${toCountry}`;
    this.cache.delete(cacheKey);
  }
}

// 싱글톤 인스턴스 생성
const visaApiConfig: VisaApiConfig = {
  sherpa: {
    apiKey: process.env.SHERPA_API_KEY || '',
    baseUrl: 'https://requirements-api.sherpa.com',
  },
  visahq: {
    apiKey: process.env.VISAHQ_API_KEY || '',
    baseUrl: 'https://api.visahq.com',
  },
  iata: {
    token: process.env.IATA_API_TOKEN || '',
    baseUrl: 'https://api.iatatravelcentre.com',
  },
};

export const externalVisaApiService = new ExternalVisaApiService(visaApiConfig);

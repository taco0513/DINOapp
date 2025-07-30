export interface Country {
  code: string;
  name: string;
  flag: string;
  schengen?: boolean;
  continent?: string;
  englishName?: string;
}

export const COUNTRIES: Country[] = [
  // 아시아
  {
    code: 'KR',
    name: '대한민국',
    flag: '🇰🇷',
    continent: 'Asia',
    englishName: 'South Korea',
  },
  {
    code: 'JP',
    name: '일본',
    flag: '🇯🇵',
    continent: 'Asia',
    englishName: 'Japan',
  },
  {
    code: 'CN',
    name: '중국',
    flag: '🇨🇳',
    continent: 'Asia',
    englishName: 'China',
  },
  {
    code: 'TH',
    name: '태국',
    flag: '🇹🇭',
    continent: 'Asia',
    englishName: 'Thailand',
  },
  {
    code: 'VN',
    name: '베트남',
    flag: '🇻🇳',
    continent: 'Asia',
    englishName: 'Vietnam',
  },
  {
    code: 'SG',
    name: '싱가포르',
    flag: '🇸🇬',
    continent: 'Asia',
    englishName: 'Singapore',
  },
  {
    code: 'MY',
    name: '말레이시아',
    flag: '🇲🇾',
    continent: 'Asia',
    englishName: 'Malaysia',
  },
  {
    code: 'ID',
    name: '인도네시아',
    flag: '🇮🇩',
    continent: 'Asia',
    englishName: 'Indonesia',
  },
  {
    code: 'PH',
    name: '필리핀',
    flag: '🇵🇭',
    continent: 'Asia',
    englishName: 'Philippines',
  },
  {
    code: 'IN',
    name: '인도',
    flag: '🇮🇳',
    continent: 'Asia',
    englishName: 'India',
  },
  {
    code: 'AE',
    name: '아랍에미리트',
    flag: '🇦🇪',
    continent: 'Asia',
    englishName: 'United Arab Emirates',
  },
  {
    code: 'TR',
    name: '터키',
    flag: '🇹🇷',
    continent: 'Europe',
    englishName: 'Turkey',
  },

  // 유럽 (셰겐 지역 - 26개국)
  {
    code: 'AT',
    name: '오스트리아',
    flag: '🇦🇹',
    schengen: true,
    continent: 'Europe',
    englishName: 'Austria',
  },
  {
    code: 'BE',
    name: '벨기에',
    flag: '🇧🇪',
    schengen: true,
    continent: 'Europe',
    englishName: 'Belgium',
  },
  {
    code: 'CZ',
    name: '체코',
    flag: '🇨🇿',
    schengen: true,
    continent: 'Europe',
    englishName: 'Czech Republic',
  },
  {
    code: 'DK',
    name: '덴마크',
    flag: '🇩🇰',
    schengen: true,
    continent: 'Europe',
    englishName: 'Denmark',
  },
  {
    code: 'EE',
    name: '에스토니아',
    flag: '🇪🇪',
    schengen: true,
    continent: 'Europe',
    englishName: 'Estonia',
  },
  {
    code: 'FI',
    name: '핀란드',
    flag: '🇫🇮',
    schengen: true,
    continent: 'Europe',
    englishName: 'Finland',
  },
  {
    code: 'FR',
    name: '프랑스',
    flag: '🇫🇷',
    schengen: true,
    continent: 'Europe',
    englishName: 'France',
  },
  {
    code: 'DE',
    name: '독일',
    flag: '🇩🇪',
    schengen: true,
    continent: 'Europe',
    englishName: 'Germany',
  },
  {
    code: 'GR',
    name: '그리스',
    flag: '🇬🇷',
    schengen: true,
    continent: 'Europe',
    englishName: 'Greece',
  },
  {
    code: 'HU',
    name: '헝가리',
    flag: '🇭🇺',
    schengen: true,
    continent: 'Europe',
    englishName: 'Hungary',
  },
  {
    code: 'IS',
    name: '아이슬란드',
    flag: '🇮🇸',
    schengen: true,
    continent: 'Europe',
    englishName: 'Iceland',
  },
  {
    code: 'IT',
    name: '이탈리아',
    flag: '🇮🇹',
    schengen: true,
    continent: 'Europe',
    englishName: 'Italy',
  },
  {
    code: 'LV',
    name: '라트비아',
    flag: '🇱🇻',
    schengen: true,
    continent: 'Europe',
    englishName: 'Latvia',
  },
  {
    code: 'LT',
    name: '리투아니아',
    flag: '🇱🇹',
    schengen: true,
    continent: 'Europe',
    englishName: 'Lithuania',
  },
  {
    code: 'LU',
    name: '룩셈부르크',
    flag: '🇱🇺',
    schengen: true,
    continent: 'Europe',
    englishName: 'Luxembourg',
  },
  {
    code: 'MT',
    name: '몰타',
    flag: '🇲🇹',
    schengen: true,
    continent: 'Europe',
    englishName: 'Malta',
  },
  {
    code: 'NL',
    name: '네덜란드',
    flag: '🇳🇱',
    schengen: true,
    continent: 'Europe',
    englishName: 'Netherlands',
  },
  {
    code: 'NO',
    name: '노르웨이',
    flag: '🇳🇴',
    schengen: true,
    continent: 'Europe',
    englishName: 'Norway',
  },
  {
    code: 'PL',
    name: '폴란드',
    flag: '🇵🇱',
    schengen: true,
    continent: 'Europe',
    englishName: 'Poland',
  },
  {
    code: 'PT',
    name: '포르투갈',
    flag: '🇵🇹',
    schengen: true,
    continent: 'Europe',
    englishName: 'Portugal',
  },
  {
    code: 'SK',
    name: '슬로바키아',
    flag: '🇸🇰',
    schengen: true,
    continent: 'Europe',
    englishName: 'Slovakia',
  },
  {
    code: 'SI',
    name: '슬로베니아',
    flag: '🇸🇮',
    schengen: true,
    continent: 'Europe',
    englishName: 'Slovenia',
  },
  {
    code: 'ES',
    name: '스페인',
    flag: '🇪🇸',
    schengen: true,
    continent: 'Europe',
    englishName: 'Spain',
  },
  {
    code: 'SE',
    name: '스웨덴',
    flag: '🇸🇪',
    schengen: true,
    continent: 'Europe',
    englishName: 'Sweden',
  },
  {
    code: 'CH',
    name: '스위스',
    flag: '🇨🇭',
    schengen: true,
    continent: 'Europe',
    englishName: 'Switzerland',
  },
  {
    code: 'LI',
    name: '리히텐슈타인',
    flag: '🇱🇮',
    schengen: true,
    continent: 'Europe',
    englishName: 'Liechtenstein',
  },

  // 유럽 (비셰겐)
  {
    code: 'GB',
    name: '영국',
    flag: '🇬🇧',
    continent: 'Europe',
    englishName: 'United Kingdom',
  },
  {
    code: 'IE',
    name: '아일랜드',
    flag: '🇮🇪',
    continent: 'Europe',
    englishName: 'Ireland',
  },
  {
    code: 'RU',
    name: '러시아',
    flag: '🇷🇺',
    continent: 'Europe',
    englishName: 'Russia',
  },
  {
    code: 'UA',
    name: '우크라이나',
    flag: '🇺🇦',
    continent: 'Europe',
    englishName: 'Ukraine',
  },
  {
    code: 'RS',
    name: '세르비아',
    flag: '🇷🇸',
    continent: 'Europe',
    englishName: 'Serbia',
  },
  {
    code: 'HR',
    name: '크로아티아',
    flag: '🇭🇷',
    continent: 'Europe',
    englishName: 'Croatia',
  },
  {
    code: 'BG',
    name: '불가리아',
    flag: '🇧🇬',
    continent: 'Europe',
    englishName: 'Bulgaria',
  },
  {
    code: 'RO',
    name: '루마니아',
    flag: '🇷🇴',
    continent: 'Europe',
    englishName: 'Romania',
  },

  // 아메리카
  {
    code: 'US',
    name: '미국',
    flag: '🇺🇸',
    continent: 'North America',
    englishName: 'United States',
  },
  {
    code: 'CA',
    name: '캐나다',
    flag: '🇨🇦',
    continent: 'North America',
    englishName: 'Canada',
  },
  {
    code: 'MX',
    name: '멕시코',
    flag: '🇲🇽',
    continent: 'North America',
    englishName: 'Mexico',
  },
  {
    code: 'BR',
    name: '브라질',
    flag: '🇧🇷',
    continent: 'South America',
    englishName: 'Brazil',
  },
  {
    code: 'AR',
    name: '아르헨티나',
    flag: '🇦🇷',
    continent: 'South America',
    englishName: 'Argentina',
  },
  {
    code: 'CL',
    name: '칠레',
    flag: '🇨🇱',
    continent: 'South America',
    englishName: 'Chile',
  },
  {
    code: 'PE',
    name: '페루',
    flag: '🇵🇪',
    continent: 'South America',
    englishName: 'Peru',
  },

  // 오세아니아
  {
    code: 'AU',
    name: '호주',
    flag: '🇦🇺',
    continent: 'Oceania',
    englishName: 'Australia',
  },
  {
    code: 'NZ',
    name: '뉴질랜드',
    flag: '🇳🇿',
    continent: 'Oceania',
    englishName: 'New Zealand',
  },

  // 아프리카
  {
    code: 'ZA',
    name: '남아프리카공화국',
    flag: '🇿🇦',
    continent: 'Africa',
    englishName: 'South Africa',
  },
  {
    code: 'EG',
    name: '이집트',
    flag: '🇪🇬',
    continent: 'Africa',
    englishName: 'Egypt',
  },
  {
    code: 'MA',
    name: '모로코',
    flag: '🇲🇦',
    continent: 'Africa',
    englishName: 'Morocco',
  },
];

// 셰겐 국가만 필터링한 배열
export const SCHENGEN_COUNTRIES = COUNTRIES.filter(
  country => country.schengen === true
);

// 유틸리티 함수들
export const CountryUtils = {
  // 국가 코드로 국가 찾기
  getCountryByCode: (code: string): Country | undefined => {
    return COUNTRIES.find(country => country.code === code);
  },

  // 국가명으로 국가 찾기 (한국어 또는 영어)
  getCountryByName: (name: string): Country | undefined => {
    const lowerName = name.toLowerCase();
    return COUNTRIES.find(
      country =>
        country.name.toLowerCase().includes(lowerName) ||
        (country.englishName &&
          country.englishName.toLowerCase().includes(lowerName))
    );
  },

  // 셰겐 국가 여부 확인
  isSchengenCountry: (countryCode: string): boolean => {
    const country = CountryUtils.getCountryByCode(countryCode);
    return country?.schengen === true;
  },

  // 셰겐 국가 목록 (옵션용)
  getSchengenCountryOptions: () => {
    return SCHENGEN_COUNTRIES.map(country => ({
      value: country.englishName || country.name,
      label: `${country.flag} ${country.name}`,
      code: country.code,
    }));
  },

  // 모든 국가 목록 (옵션용)
  getAllCountryOptions: () => {
    return COUNTRIES.map(country => ({
      value: country.englishName || country.name,
      label: `${country.flag} ${country.name}`,
      code: country.code,
      schengen: country.schengen,
    }));
  },

  // 대륙별 국가 분류
  getCountriesByContinent: (continent: string) => {
    return COUNTRIES.filter(country => country.continent === continent);
  },

  // 셰겐 국가 이름 문자열 (문서용)
  getSchengenCountryNames: (): string => {
    return SCHENGEN_COUNTRIES.map(country => country.name)
      .sort()
      .join(', ');
  },

  // 셰겐 국가 개수
  getSchengenCountryCount: (): number => {
    return SCHENGEN_COUNTRIES.length;
  },
};

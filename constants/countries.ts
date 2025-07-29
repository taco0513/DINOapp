export interface Country {
  code: string
  name: string
  flag: string
  schengen?: boolean
}

export const COUNTRIES: Country[] = [
  // 아시아
  { code: 'KR', name: '대한민국', flag: '🇰🇷' },
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'CN', name: '중국', flag: '🇨🇳' },
  { code: 'TH', name: '태국', flag: '🇹🇭' },
  { code: 'VN', name: '베트남', flag: '🇻🇳' },
  { code: 'SG', name: '싱가포르', flag: '🇸🇬' },
  { code: 'MY', name: '말레이시아', flag: '🇲🇾' },
  { code: 'ID', name: '인도네시아', flag: '🇮🇩' },
  { code: 'PH', name: '필리핀', flag: '🇵🇭' },
  { code: 'IN', name: '인도', flag: '🇮🇳' },
  { code: 'AE', name: '아랍에미리트', flag: '🇦🇪' },
  { code: 'TR', name: '터키', flag: '🇹🇷' },
  
  // 유럽 (셴겐)
  { code: 'FR', name: '프랑스', flag: '🇫🇷', schengen: true },
  { code: 'DE', name: '독일', flag: '🇩🇪', schengen: true },
  { code: 'IT', name: '이탈리아', flag: '🇮🇹', schengen: true },
  { code: 'ES', name: '스페인', flag: '🇪🇸', schengen: true },
  { code: 'NL', name: '네덜란드', flag: '🇳🇱', schengen: true },
  { code: 'BE', name: '벨기에', flag: '🇧🇪', schengen: true },
  { code: 'AT', name: '오스트리아', flag: '🇦🇹', schengen: true },
  { code: 'CH', name: '스위스', flag: '🇨🇭', schengen: true },
  { code: 'SE', name: '스웨덴', flag: '🇸🇪', schengen: true },
  { code: 'DK', name: '덴마크', flag: '🇩🇰', schengen: true },
  { code: 'NO', name: '노르웨이', flag: '🇳🇴', schengen: true },
  { code: 'FI', name: '핀란드', flag: '🇫🇮', schengen: true },
  { code: 'PT', name: '포르투갈', flag: '🇵🇹', schengen: true },
  { code: 'GR', name: '그리스', flag: '🇬🇷', schengen: true },
  { code: 'PL', name: '폴란드', flag: '🇵🇱', schengen: true },
  { code: 'CZ', name: '체코', flag: '🇨🇿', schengen: true },
  { code: 'HU', name: '헝가리', flag: '🇭🇺', schengen: true },
  
  // 유럽 (비셴겐)
  { code: 'GB', name: '영국', flag: '🇬🇧' },
  { code: 'IE', name: '아일랜드', flag: '🇮🇪' },
  { code: 'RU', name: '러시아', flag: '🇷🇺' },
  { code: 'UA', name: '우크라이나', flag: '🇺🇦' },
  
  // 아메리카
  { code: 'US', name: '미국', flag: '🇺🇸' },
  { code: 'CA', name: '캐나다', flag: '🇨🇦' },
  { code: 'MX', name: '멕시코', flag: '🇲🇽' },
  { code: 'BR', name: '브라질', flag: '🇧🇷' },
  { code: 'AR', name: '아르헨티나', flag: '🇦🇷' },
  { code: 'CL', name: '칠레', flag: '🇨🇱' },
  { code: 'PE', name: '페루', flag: '🇵🇪' },
  
  // 오세아니아
  { code: 'AU', name: '호주', flag: '🇦🇺' },
  { code: 'NZ', name: '뉴질랜드', flag: '🇳🇿' },
  
  // 아프리카
  { code: 'ZA', name: '남아프리카공화국', flag: '🇿🇦' },
  { code: 'EG', name: '이집트', flag: '🇪🇬' },
  { code: 'MA', name: '모로코', flag: '🇲🇦' },
]
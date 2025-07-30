export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  region: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  // Major Currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', region: 'North America' },
  { code: 'EUR', name: 'Euro', symbol: '€', region: 'Europe' },
  { code: 'GBP', name: 'British Pound', symbol: '£', region: 'Europe' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', region: 'Asia' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', region: 'Asia' },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    region: 'North America',
  },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', region: 'Australia' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', region: 'Europe' },

  // Asia Pacific
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', region: 'Asia' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', region: 'Asia' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', region: 'Asia' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', region: 'Asia' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', region: 'Asia' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', region: 'Asia' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', region: 'Asia' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', region: 'Asia' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', region: 'Asia' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', region: 'Asia' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', region: 'Pacific' },

  // Europe
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', region: 'Europe' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', region: 'Europe' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', region: 'Europe' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', region: 'Europe' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', region: 'Europe' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', region: 'Europe' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', region: 'Europe' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', region: 'Europe' },

  // Americas
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', region: 'North America' },
  {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    region: 'South America',
  },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', region: 'South America' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', region: 'South America' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', region: 'South America' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', region: 'South America' },
  {
    code: 'UYU',
    name: 'Uruguayan Peso',
    symbol: '$U',
    region: 'South America',
  },
  {
    code: 'CRC',
    name: 'Costa Rican Colón',
    symbol: '₡',
    region: 'North America',
  },

  // Middle East & Africa
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', region: 'Middle East' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', region: 'Middle East' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', region: 'Middle East' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', region: 'Africa' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', region: 'Africa' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', region: 'Africa' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', region: 'Africa' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', region: 'Africa' },
];

export const POPULAR_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CNY',
  'CAD',
  'AUD',
  'CHF',
  'KRW',
  'SGD',
];

export function getCurrenciesByRegion(region: string): CurrencyInfo[] {
  return CURRENCIES.filter(currency => currency.region === region);
}

export function findCurrency(code: string): CurrencyInfo | undefined {
  return CURRENCIES.find(currency => currency.code === code);
}

export function getPopularCurrencies(): CurrencyInfo[] {
  return CURRENCIES.filter(currency =>
    POPULAR_CURRENCIES.includes(currency.code)
  );
}

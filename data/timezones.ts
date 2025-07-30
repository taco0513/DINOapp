export interface TimezoneInfo {
  value: string;
  label: string;
  offset: string;
  region: string;
}

export const TIMEZONES: TimezoneInfo[] = [
  // Pacific
  {
    value: 'Pacific/Honolulu',
    label: 'Honolulu',
    offset: 'UTC-10',
    region: 'Pacific',
  },
  {
    value: 'America/Anchorage',
    label: 'Anchorage',
    offset: 'UTC-9',
    region: 'North America',
  },
  {
    value: 'America/Los_Angeles',
    label: 'Los Angeles',
    offset: 'UTC-8',
    region: 'North America',
  },
  {
    value: 'America/Phoenix',
    label: 'Phoenix',
    offset: 'UTC-7',
    region: 'North America',
  },
  {
    value: 'America/Denver',
    label: 'Denver',
    offset: 'UTC-7',
    region: 'North America',
  },
  {
    value: 'America/Chicago',
    label: 'Chicago',
    offset: 'UTC-6',
    region: 'North America',
  },
  {
    value: 'America/New_York',
    label: 'New York',
    offset: 'UTC-5',
    region: 'North America',
  },
  {
    value: 'America/Toronto',
    label: 'Toronto',
    offset: 'UTC-5',
    region: 'North America',
  },
  {
    value: 'America/Halifax',
    label: 'Halifax',
    offset: 'UTC-4',
    region: 'North America',
  },
  {
    value: 'America/St_Johns',
    label: 'St. Johns',
    offset: 'UTC-3:30',
    region: 'North America',
  },

  // South America
  {
    value: 'America/Sao_Paulo',
    label: 'São Paulo',
    offset: 'UTC-3',
    region: 'South America',
  },
  {
    value: 'America/Argentina/Buenos_Aires',
    label: 'Buenos Aires',
    offset: 'UTC-3',
    region: 'South America',
  },
  {
    value: 'America/Santiago',
    label: 'Santiago',
    offset: 'UTC-3',
    region: 'South America',
  },
  {
    value: 'America/Bogota',
    label: 'Bogotá',
    offset: 'UTC-5',
    region: 'South America',
  },
  {
    value: 'America/Lima',
    label: 'Lima',
    offset: 'UTC-5',
    region: 'South America',
  },
  {
    value: 'America/Mexico_City',
    label: 'Mexico City',
    offset: 'UTC-6',
    region: 'North America',
  },

  // Europe
  {
    value: 'Europe/London',
    label: 'London',
    offset: 'UTC+0',
    region: 'Europe',
  },
  {
    value: 'Europe/Dublin',
    label: 'Dublin',
    offset: 'UTC+0',
    region: 'Europe',
  },
  {
    value: 'Europe/Lisbon',
    label: 'Lisbon',
    offset: 'UTC+0',
    region: 'Europe',
  },
  { value: 'Europe/Paris', label: 'Paris', offset: 'UTC+1', region: 'Europe' },
  {
    value: 'Europe/Berlin',
    label: 'Berlin',
    offset: 'UTC+1',
    region: 'Europe',
  },
  { value: 'Europe/Rome', label: 'Rome', offset: 'UTC+1', region: 'Europe' },
  {
    value: 'Europe/Madrid',
    label: 'Madrid',
    offset: 'UTC+1',
    region: 'Europe',
  },
  {
    value: 'Europe/Amsterdam',
    label: 'Amsterdam',
    offset: 'UTC+1',
    region: 'Europe',
  },
  {
    value: 'Europe/Brussels',
    label: 'Brussels',
    offset: 'UTC+1',
    region: 'Europe',
  },
  {
    value: 'Europe/Vienna',
    label: 'Vienna',
    offset: 'UTC+1',
    region: 'Europe',
  },
  {
    value: 'Europe/Zurich',
    label: 'Zurich',
    offset: 'UTC+1',
    region: 'Europe',
  },
  {
    value: 'Europe/Prague',
    label: 'Prague',
    offset: 'UTC+1',
    region: 'Europe',
  },
  {
    value: 'Europe/Stockholm',
    label: 'Stockholm',
    offset: 'UTC+1',
    region: 'Europe',
  },
  {
    value: 'Europe/Helsinki',
    label: 'Helsinki',
    offset: 'UTC+2',
    region: 'Europe',
  },
  {
    value: 'Europe/Athens',
    label: 'Athens',
    offset: 'UTC+2',
    region: 'Europe',
  },
  {
    value: 'Europe/Istanbul',
    label: 'Istanbul',
    offset: 'UTC+3',
    region: 'Europe',
  },
  {
    value: 'Europe/Moscow',
    label: 'Moscow',
    offset: 'UTC+3',
    region: 'Europe',
  },

  // Africa & Middle East
  { value: 'Africa/Cairo', label: 'Cairo', offset: 'UTC+2', region: 'Africa' },
  {
    value: 'Africa/Johannesburg',
    label: 'Johannesburg',
    offset: 'UTC+2',
    region: 'Africa',
  },
  {
    value: 'Africa/Nairobi',
    label: 'Nairobi',
    offset: 'UTC+3',
    region: 'Africa',
  },
  { value: 'Africa/Lagos', label: 'Lagos', offset: 'UTC+1', region: 'Africa' },
  {
    value: 'Africa/Casablanca',
    label: 'Casablanca',
    offset: 'UTC+1',
    region: 'Africa',
  },
  {
    value: 'Asia/Dubai',
    label: 'Dubai',
    offset: 'UTC+4',
    region: 'Middle East',
  },
  {
    value: 'Asia/Tehran',
    label: 'Tehran',
    offset: 'UTC+3:30',
    region: 'Middle East',
  },

  // Asia
  { value: 'Asia/Karachi', label: 'Karachi', offset: 'UTC+5', region: 'Asia' },
  { value: 'Asia/Delhi', label: 'Delhi', offset: 'UTC+5:30', region: 'Asia' },
  {
    value: 'Asia/Colombo',
    label: 'Colombo',
    offset: 'UTC+5:30',
    region: 'Asia',
  },
  {
    value: 'Asia/Kathmandu',
    label: 'Kathmandu',
    offset: 'UTC+5:45',
    region: 'Asia',
  },
  { value: 'Asia/Dhaka', label: 'Dhaka', offset: 'UTC+6', region: 'Asia' },
  { value: 'Asia/Yangon', label: 'Yangon', offset: 'UTC+6:30', region: 'Asia' },
  { value: 'Asia/Bangkok', label: 'Bangkok', offset: 'UTC+7', region: 'Asia' },
  {
    value: 'Asia/Ho_Chi_Minh',
    label: 'Ho Chi Minh City',
    offset: 'UTC+7',
    region: 'Asia',
  },
  { value: 'Asia/Jakarta', label: 'Jakarta', offset: 'UTC+7', region: 'Asia' },
  {
    value: 'Asia/Singapore',
    label: 'Singapore',
    offset: 'UTC+8',
    region: 'Asia',
  },
  {
    value: 'Asia/Kuala_Lumpur',
    label: 'Kuala Lumpur',
    offset: 'UTC+8',
    region: 'Asia',
  },
  { value: 'Asia/Manila', label: 'Manila', offset: 'UTC+8', region: 'Asia' },
  {
    value: 'Asia/Hong_Kong',
    label: 'Hong Kong',
    offset: 'UTC+8',
    region: 'Asia',
  },
  { value: 'Asia/Taipei', label: 'Taipei', offset: 'UTC+8', region: 'Asia' },
  {
    value: 'Asia/Shanghai',
    label: 'Shanghai',
    offset: 'UTC+8',
    region: 'Asia',
  },
  { value: 'Asia/Seoul', label: 'Seoul', offset: 'UTC+9', region: 'Asia' },
  { value: 'Asia/Tokyo', label: 'Tokyo', offset: 'UTC+9', region: 'Asia' },

  // Australia & Pacific
  {
    value: 'Australia/Perth',
    label: 'Perth',
    offset: 'UTC+8',
    region: 'Australia',
  },
  {
    value: 'Australia/Adelaide',
    label: 'Adelaide',
    offset: 'UTC+9:30',
    region: 'Australia',
  },
  {
    value: 'Australia/Darwin',
    label: 'Darwin',
    offset: 'UTC+9:30',
    region: 'Australia',
  },
  {
    value: 'Australia/Brisbane',
    label: 'Brisbane',
    offset: 'UTC+10',
    region: 'Australia',
  },
  {
    value: 'Australia/Sydney',
    label: 'Sydney',
    offset: 'UTC+10',
    region: 'Australia',
  },
  {
    value: 'Australia/Melbourne',
    label: 'Melbourne',
    offset: 'UTC+10',
    region: 'Australia',
  },
  {
    value: 'Pacific/Auckland',
    label: 'Auckland',
    offset: 'UTC+12',
    region: 'Pacific',
  },
  { value: 'Pacific/Fiji', label: 'Fiji', offset: 'UTC+12', region: 'Pacific' },
];

export const TIMEZONE_REGIONS = [
  'North America',
  'South America',
  'Europe',
  'Africa',
  'Middle East',
  'Asia',
  'Australia',
  'Pacific',
];

export function getTimezonesByRegion(region: string): TimezoneInfo[] {
  return TIMEZONES.filter(tz => tz.region === region);
}

export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function findTimezone(value: string): TimezoneInfo | undefined {
  return TIMEZONES.find(tz => tz.value === value);
}

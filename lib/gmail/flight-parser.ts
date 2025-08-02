/**
 * DINO v2.0 - Flight Email Parser
 * Advanced parsing engine for extracting flight information from emails
 * Strict TypeScript implementation
 */

import type { FlightInfo, AirportInfo, EmailParseResult } from '@/types/gmail';

// Airport database (key airports for common routes)
const AIRPORT_DATABASE: Record<string, AirportInfo> = {
  // US Airports
  'LAX': { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States', countryCode: 'US' },
  'JFK': { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States', countryCode: 'US' },
  'SFO': { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States', countryCode: 'US' },
  'ORD': { code: 'ORD', name: 'O\'Hare International', city: 'Chicago', country: 'United States', countryCode: 'US' },
  'DFW': { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'United States', countryCode: 'US' },
  'ATL': { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'United States', countryCode: 'US' },
  'SEA': { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'United States', countryCode: 'US' },
  
  // European Airports
  'LHR': { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', countryCode: 'GB' },
  'CDG': { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', countryCode: 'FR' },
  'FRA': { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', countryCode: 'DE' },
  'AMS': { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL' },
  'FCO': { code: 'FCO', name: 'Leonardo da Vinci Airport', city: 'Rome', country: 'Italy', countryCode: 'IT' },
  'MAD': { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', countryCode: 'ES' },
  'ZUR': { code: 'ZUR', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', countryCode: 'CH' },
  'VIE': { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', countryCode: 'AT' },
  
  // Asian Airports
  'ICN': { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', countryCode: 'KR' },
  'NRT': { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
  'HND': { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
  'PVG': { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', countryCode: 'CN' },
  'HKG': { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK' },
  'SIN': { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', countryCode: 'SG' },
  'BKK': { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', countryCode: 'TH' },
  
  // Other Common Airports
  'YYZ': { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', countryCode: 'CA' },
  'SYD': { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', countryCode: 'AU' },
  'DXB': { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE' },
  
  // Additional European Airports
  'BCN': { code: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', countryCode: 'ES' },
  'MUC': { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', countryCode: 'DE' },
  'LIS': { code: 'LIS', name: 'Lisbon Airport', city: 'Lisbon', country: 'Portugal', countryCode: 'PT' },
  'CPH': { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', countryCode: 'DK' },
  'OSL': { code: 'OSL', name: 'Oslo Airport', city: 'Oslo', country: 'Norway', countryCode: 'NO' },
  'ARN': { code: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden', countryCode: 'SE' },
  'HEL': { code: 'HEL', name: 'Helsinki Airport', city: 'Helsinki', country: 'Finland', countryCode: 'FI' },
  'PRG': { code: 'PRG', name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czech Republic', countryCode: 'CZ' },
  'WAW': { code: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland', countryCode: 'PL' },
  'BUD': { code: 'BUD', name: 'Budapest Ferenc Liszt International Airport', city: 'Budapest', country: 'Hungary', countryCode: 'HU' },
  'OTP': { code: 'OTP', name: 'Henri Coandă International Airport', city: 'Bucharest', country: 'Romania', countryCode: 'RO' },
  'ATH': { code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece', countryCode: 'GR' },
  'IST': { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', countryCode: 'TR' },
  'DUB': { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', countryCode: 'IE' },
  'EDI': { code: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'United Kingdom', countryCode: 'GB' },
  'MAN': { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom', countryCode: 'GB' },
  'BRU': { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', countryCode: 'BE' },
  'GVA': { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', countryCode: 'CH' },
  'MXP': { code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', countryCode: 'IT' },
  'VCE': { code: 'VCE', name: 'Venice Marco Polo Airport', city: 'Venice', country: 'Italy', countryCode: 'IT' },
  'NCE': { code: 'NCE', name: 'Nice Côte d\'Azur Airport', city: 'Nice', country: 'France', countryCode: 'FR' },
  'LYS': { code: 'LYS', name: 'Lyon-Saint Exupéry Airport', city: 'Lyon', country: 'France', countryCode: 'FR' },
  
  // Additional US Airports
  'MIA': { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', countryCode: 'US' },
  'BOS': { code: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'United States', countryCode: 'US' },
  'IAD': { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington', country: 'United States', countryCode: 'US' },
  'DCA': { code: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington', country: 'United States', countryCode: 'US' },
  'MCO': { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'United States', countryCode: 'US' },
  'LAS': { code: 'LAS', name: 'McCarran International Airport', city: 'Las Vegas', country: 'United States', countryCode: 'US' },
  'PHX': { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'United States', countryCode: 'US' },
  'IAH': { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States', countryCode: 'US' },
  'DEN': { code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States', countryCode: 'US' },
  'DTW': { code: 'DTW', name: 'Detroit Metropolitan Wayne County Airport', city: 'Detroit', country: 'United States', countryCode: 'US' },
  'MSP': { code: 'MSP', name: 'Minneapolis–Saint Paul International Airport', city: 'Minneapolis', country: 'United States', countryCode: 'US' },
  'PHL': { code: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia', country: 'United States', countryCode: 'US' },
  'CLT': { code: 'CLT', name: 'Charlotte Douglas International Airport', city: 'Charlotte', country: 'United States', countryCode: 'US' },
  
  // Additional Asian Airports
  'TPE': { code: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan', countryCode: 'TW' },
  'KUL': { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY' },
  'MNL': { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', countryCode: 'PH' },
  'CGK': { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia', countryCode: 'ID' },
  'DEL': { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', countryCode: 'IN' },
  'BOM': { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', countryCode: 'IN' },
  'BLR': { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India', countryCode: 'IN' },
  'MAA': { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', countryCode: 'IN' },
  'CMB': { code: 'CMB', name: 'Bandaranaike International Airport', city: 'Colombo', country: 'Sri Lanka', countryCode: 'LK' },
  'DAC': { code: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', country: 'Bangladesh', countryCode: 'BD' },
  'KTM': { code: 'KTM', name: 'Tribhuvan International Airport', city: 'Kathmandu', country: 'Nepal', countryCode: 'NP' },
  'RGN': { code: 'RGN', name: 'Yangon International Airport', city: 'Yangon', country: 'Myanmar', countryCode: 'MM' },
  'SGN': { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN' },
  'HAN': { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam', countryCode: 'VN' },
  'PNH': { code: 'PNH', name: 'Phnom Penh International Airport', city: 'Phnom Penh', country: 'Cambodia', countryCode: 'KH' },
  
  // Middle East & Africa
  'AUH': { code: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE' },
  'DOH': { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', countryCode: 'QA' },
  'BAH': { code: 'BAH', name: 'Bahrain International Airport', city: 'Manama', country: 'Bahrain', countryCode: 'BH' },
  'MCT': { code: 'MCT', name: 'Muscat International Airport', city: 'Muscat', country: 'Oman', countryCode: 'OM' },
  'AMM': { code: 'AMM', name: 'Queen Alia International Airport', city: 'Amman', country: 'Jordan', countryCode: 'JO' },
  'BEY': { code: 'BEY', name: 'Beirut–Rafic Hariri International Airport', city: 'Beirut', country: 'Lebanon', countryCode: 'LB' },
  'TLV': { code: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'Israel', countryCode: 'IL' },
  'CAI': { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', countryCode: 'EG' },
  'ADD': { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia', countryCode: 'ET' },
  'NBO': { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', countryCode: 'KE' },
  'JNB': { code: 'JNB', name: 'O. R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', countryCode: 'ZA' },
  'CPT': { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', countryCode: 'ZA' },
  
  // South America
  'GRU': { code: 'GRU', name: 'São Paulo–Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', countryCode: 'BR' },
  'GIG': { code: 'GIG', name: 'Rio de Janeiro–Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR' },
  'EZE': { code: 'EZE', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina', countryCode: 'AR' },
  'SCL': { code: 'SCL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile', countryCode: 'CL' },
  'LIM': { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', countryCode: 'PE' },
  'BOG': { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', countryCode: 'CO' },
  'PTY': { code: 'PTY', name: 'Tocumen International Airport', city: 'Panama City', country: 'Panama', countryCode: 'PA' },
  'MEX': { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', countryCode: 'MX' },
  'CUN': { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico', countryCode: 'MX' },
  
  // Oceania
  'MEL': { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', countryCode: 'AU' },
  'BNE': { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', countryCode: 'AU' },
  'PER': { code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', countryCode: 'AU' },
  'AKL': { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', countryCode: 'NZ' },
  'CHC': { code: 'CHC', name: 'Christchurch Airport', city: 'Christchurch', country: 'New Zealand', countryCode: 'NZ' },
  'WLG': { code: 'WLG', name: 'Wellington Airport', city: 'Wellington', country: 'New Zealand', countryCode: 'NZ' },
  'NAN': { code: 'NAN', name: 'Nadi International Airport', city: 'Nadi', country: 'Fiji', countryCode: 'FJ' },
};

// Airlines mapping (확장된 항공사 코드)
const AIRLINE_CODES: Record<string, string> = {
  // US Airlines
  'UA': 'United Airlines',
  'DL': 'Delta Air Lines', 
  'AA': 'American Airlines',
  'SW': 'Southwest Airlines',
  'B6': 'JetBlue Airways',
  'AS': 'Alaska Airlines',
  'NK': 'Spirit Airlines',
  'F9': 'Frontier Airlines',
  
  // European Airlines
  'BA': 'British Airways',
  'LH': 'Lufthansa',
  'AF': 'Air France',
  'KL': 'KLM',
  'IB': 'Iberia',
  'AZ': 'Alitalia',
  'SK': 'SAS',
  'OS': 'Austrian Airlines',
  'LX': 'Swiss International',
  'TK': 'Turkish Airlines',
  
  // Asian Airlines
  'KE': 'Korean Air',
  'OZ': 'Asiana Airlines',
  'NH': 'ANA (All Nippon Airways)',
  'JL': 'Japan Airlines',
  'SQ': 'Singapore Airlines',
  'CX': 'Cathay Pacific',
  'TG': 'Thai Airways',
  'MH': 'Malaysia Airlines',
  'CI': 'China Airlines',
  'BR': 'EVA Air',
  'CA': 'Air China',
  'MU': 'China Eastern',
  'CZ': 'China Southern',
  
  // Middle East Airlines
  'EK': 'Emirates',
  'EY': 'Etihad Airways',
  'QR': 'Qatar Airways',
  
  // Other Major Airlines
  'AC': 'Air Canada',
  'QF': 'Qantas',
  'VA': 'Virgin Australia',
  'LA': 'LATAM Airlines',
  'AV': 'Avianca',
  
  // Low Cost Carriers
  'FR': 'Ryanair',
  'U2': 'easyJet',
  'W6': 'Wizz Air',
  'VY': 'Vueling',
  'DY': 'Norwegian Air',
  '5J': 'Cebu Pacific',
  'AK': 'AirAsia',
  'D7': 'AirAsia X',
  'TR': 'Scoot',
  'IX': 'Air India Express',
  'G9': 'Air Arabia',
  'PC': 'Pegasus Airlines',
  '6E': 'IndiGo',
  'SG': 'SpiceJet',
  'WZ': 'Wizz Air Abu Dhabi',
  'FZ': 'flydubai',
  'KC': 'Air Astana',
  
  // Additional Major Airlines
  'ET': 'Ethiopian Airlines',
  'MS': 'EgyptAir',
  'ME': 'Middle East Airlines',
  'RJ': 'Royal Jordanian',
  'SV': 'Saudia',
  'GF': 'Gulf Air',
  'WY': 'Oman Air',
  'KU': 'Kuwait Airways',
  'PK': 'Pakistan International Airlines',
  'AI': 'Air India',
  'UL': 'SriLankan Airlines',
  'BG': 'Biman Bangladesh',
  'PR': 'Philippine Airlines',
  'GA': 'Garuda Indonesia',
  'VN': 'Vietnam Airlines',
  'FJ': 'Fiji Airways',
  'NZ': 'Air New Zealand',
  'SA': 'South African Airways',
  'KQ': 'Kenya Airways',
  'CM': 'Copa Airlines',
  'AM': 'Aeromexico',
  
  // Regional Airlines
  'BE': 'Flybe',
  'VT': 'Air Tahiti',
  'TN': 'Air Tahiti Nui',
  'HA': 'Hawaiian Airlines',
  'WS': 'WestJet',
  'TS': 'Air Transat',
  'MX': 'Mexicana',
  'G3': 'Gol',
  'JJ': 'LATAM Brasil',
  'AR': 'Aerolineas Argentinas',
  '4U': 'Germanwings',
  'EW': 'Eurowings',
  'HG': 'Niki',
  'AB': 'Air Berlin',
  'LO': 'LOT Polish Airlines',
  'SN': 'Brussels Airlines',
  'TP': 'TAP Air Portugal',
  'AY': 'Finnair',
  'A3': 'Aegean Airlines',
  'RO': 'TAROM',
  'BT': 'airBaltic',
  'JP': 'Adria Airways',
  'OU': 'Croatia Airlines',
  'JU': 'Air Serbia',
  'FB': 'Bulgaria Air',
  'PS': 'Ukraine International',
  'SU': 'Aeroflot',
  'S7': 'S7 Airlines',
  'UN': 'Transaero Airlines',
  'UT': 'UTair',
  'HU': 'Hainan Airlines',
  'FM': 'Shanghai Airlines',
  'HO': 'Juneyao Airlines',
  'BK': 'Okay Airways',
  'SC': 'Shandong Airlines',
  '3U': 'Sichuan Airlines',
  'ZH': 'Shenzhen Airlines',
  'GS': 'Tianjin Airlines',
  'MF': 'Xiamen Airlines',
  '8L': 'Lucky Air',
};

export class FlightParser {
  /**
   * Parse email content to extract flight information
   */
  parseFlightEmail(emailId: string, subject: string, from: string, date: Date, textContent: string): EmailParseResult {
    const parseErrors: string[] = [];
    let flights: FlightInfo[] = [];
    let confidence = 0;

    try {
      // Clean and normalize text
      const normalizedText = this.normalizeText(textContent);
      
      // Extract flight numbers and related information
      const flightMatches = this.extractFlightNumbers(normalizedText);
      
      for (const flightMatch of flightMatches) {
        try {
          const flightInfo = this.parseFlightDetails(flightMatch, normalizedText, emailId);
          if (flightInfo) {
            flights.push(flightInfo);
            confidence = Math.max(confidence, flightInfo.confidence);
          }
        } catch (error) {
          parseErrors.push(`Failed to parse flight ${flightMatch.flightNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // If no flights found through structured parsing, try broader patterns
      if (flights.length === 0) {
        const broadFlights = this.extractBroadFlightPatterns(normalizedText, emailId);
        flights = broadFlights;
        confidence = Math.max(0.3, ...broadFlights.map(f => f.confidence));
      }

      return {
        emailId,
        subject,
        from,
        date,
        flights,
        isFlightEmail: flights.length > 0,
        confidence,
        rawText: textContent.substring(0, 1000), // Store first 1KB for debugging
        parseErrors,
      };

    } catch (error) {
      parseErrors.push(`General parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        emailId,
        subject,
        from,
        date,
        flights: [],
        isFlightEmail: false,
        confidence: 0,
        rawText: textContent.substring(0, 1000),
        parseErrors,
      };
    }
  }

  /**
   * Normalize text for consistent parsing
   */
  private normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract flight numbers from text
   */
  private extractFlightNumbers(text: string): Array<{ flightNumber: string; airline: string; context: string }> {
    const matches: Array<{ flightNumber: string; airline: string; context: string }> = [];
    
    // Multiple patterns to catch different flight number formats
    const patterns = [
      // Standard format: UA123, KE456
      /\b([A-Z]{2})\s*(\d{3,4})\b/g,
      // With flight label: Flight UA123, Flight KE456
      /\bflight\s+([A-Z]{2})\s*(\d{3,4})\b/gi,
      // With "No." format: Flight No. UA123
      /\bflight\s+no\.?\s+([A-Z]{2})\s*(\d{3,4})\b/gi,
      // Number first: UA 123, KE 456
      /\b([A-Z]{2})\s+(\d{3,4})\b/g,
      // Korean Air specific: 대한항공 KE123
      /(?:대한항공|korean\s*air).*?([A-Z]{2})\s*(\d{3,4})/gi,
      // United specific: United UA123
      /(?:united|united\s*airlines).*?([A-Z]{2})\s*(\d{3,4})/gi,
      // Delta specific: Delta DL123
      /(?:delta|delta\s*air\s*lines).*?([A-Z]{2})\s*(\d{3,4})/gi,
      // General airline pattern: [Airline] XX123
      /(?:airlines?|airways?).*?([A-Z]{2})\s*(\d{3,4})/gi,
      // Flight number with dash: KE-001, DL-245
      /\b([A-Z]{2})-(\d{3,4})\b/g,
      // Three letter airline code: AAL123, UAL456
      /\b([A-Z]{3})(\d{3,4})\b/g,
      // Carrier code: carrier: KE / flight: 123
      /carrier[:\s]+([A-Z]{2}).*?flight[:\s]+(\d{3,4})/gi,
      // 항공편명: KE123
      /항공편명[:\s]*([A-Z]{2})\s*(\d{3,4})/g,
      // 편명: KE123
      /편명[:\s]*([A-Z]{2})\s*(\d{3,4})/g,
      // IATA format in booking confirmations
      /\b([A-Z]{2})\s*(\d{3,4})[A-Z]\b/g,
      // Asian airlines specific patterns
      /(?:아시아나|asiana).*?([A-Z]{2})\s*(\d{3,4})/gi,
      /(?:진에어|jin\s*air).*?([A-Z]{2})\s*(\d{3,4})/gi,
      /(?:티웨이|t'way).*?([A-Z]{2})\s*(\d{3,4})/gi,
      /(?:에어부산|air\s*busan).*?([A-Z]{2})\s*(\d{3,4})/gi,
      /(?:제주항공|jeju\s*air).*?([A-Z]{2})\s*(\d{3,4})/gi,
      // European airlines patterns
      /(?:루프트한자|lufthansa).*?([A-Z]{2})\s*(\d{3,4})/gi,
      /(?:에어프랑스|air\s*france).*?([A-Z]{2})\s*(\d{3,4})/gi,
      // Booking.com style: "Your flight KE 123"
      /your\s+flight\s+([A-Z]{2})\s*(\d{3,4})/gi,
      // Expedia style: "Flight: KE123"
      /flight[:\s]+([A-Z]{2})\s*(\d{3,4})/gi,
    ];

    for (const pattern of patterns) {
      pattern.lastIndex = 0; // Reset regex lastIndex
      let match;
      
      while ((match = pattern.exec(text)) !== null) {
        const airlineCode = match[1];
        const flightNum = match[2];
        const flightNumber = `${airlineCode}${flightNum}`;
        
        // Check if this flight number is already found
        const isDuplicate = matches.some(m => m.flightNumber === flightNumber);
        if (isDuplicate) continue;
        
        // Get context around the flight number (150 chars before and after)
        const start = Math.max(0, match.index - 150);
        const end = Math.min(text.length, match.index + match[0].length + 150);
        const context = text.substring(start, end);
        
        matches.push({
          flightNumber,
          airline: AIRLINE_CODES[airlineCode] || airlineCode,
          context,
        });
      }
    }
    
    // If no flight numbers found, try to extract from common email patterns
    if (matches.length === 0) {
      const fallbackPatterns = [
        // Confirmation number patterns that might contain flight info
        /confirmation.*?([A-Z]{2}\d{3,4})/gi,
        // Booking reference patterns
        /booking.*?([A-Z]{2}\d{3,4})/gi,
        // Reference number patterns
        /reference.*?([A-Z]{2}\d{3,4})/gi,
        // Ticket number patterns
        /ticket.*?([A-Z]{2}\d{3,4})/gi,
      ];
      
      for (const pattern of fallbackPatterns) {
        pattern.lastIndex = 0;
        let match;
        
        while ((match = pattern.exec(text)) !== null) {
          const possibleFlight = match[1];
          const airlineCode = possibleFlight.substring(0, 2);
          const flightNum = possibleFlight.substring(2);
          
          // Only consider if airline code exists in our database
          if (AIRLINE_CODES[airlineCode]) {
            const start = Math.max(0, match.index - 150);
            const end = Math.min(text.length, match.index + match[0].length + 150);
            const context = text.substring(start, end);
            
            matches.push({
              flightNumber: possibleFlight,
              airline: AIRLINE_CODES[airlineCode],
              context,
            });
          }
        }
      }
    }
    
    return matches;
  }

  /**
   * Parse detailed flight information from context
   */
  private parseFlightDetails(flightMatch: { flightNumber: string; airline: string; context: string }, fullText: string, emailId: string): FlightInfo | null {
    const { flightNumber, airline, context } = flightMatch;
    
    // Extract airports
    const airports = this.extractAirports(context, fullText);
    if (airports.length < 2) {
      return null; // Need at least departure and arrival
    }

    // Extract dates and times
    const dateTime = this.extractDateTime(context, fullText);
    if (!dateTime.departureDate) {
      return null; // Need at least departure date
    }

    // Extract additional information
    const bookingRef = this.extractBookingReference(fullText);
    const passengerName = this.extractPassengerName(fullText);
    const seatNumber = this.extractSeatNumber(context);

    // Calculate confidence based on extracted information
    let confidence = 0.5; // Base confidence for having flight number
    if (airports.length >= 2) confidence += 0.2;
    if (dateTime.departureDate) confidence += 0.2;
    if (dateTime.departureTime) confidence += 0.1;
    if (bookingRef) confidence += 0.1;

    return {
      flightNumber,
      airline,
      departureAirport: airports[0],
      arrivalAirport: airports[1],
      departureDate: dateTime.departureDate,
      arrivalDate: dateTime.arrivalDate || dateTime.departureDate,
      departureTime: dateTime.departureTime || 'Unknown',
      arrivalTime: dateTime.arrivalTime || 'Unknown',
      bookingReference: bookingRef,
      passengerName,
      seatNumber,
      emailId,
      confidence: Math.min(1.0, confidence),
    };
  }

  /**
   * Extract airport codes from text
   */
  private extractAirports(context: string, fullText: string): AirportInfo[] {
    const airportPattern = /\b([A-Z]{3})\b/g;
    const foundAirports: AirportInfo[] = [];
    const seenCodes = new Set<string>();
    
    // Check context first, then full text
    const textsToCheck = [context, fullText];
    
    for (const text of textsToCheck) {
      let match;
      const regex = new RegExp(airportPattern);
      while ((match = regex.exec(text)) !== null && foundAirports.length < 4) {
        const code = match[1];
        if (!seenCodes.has(code) && AIRPORT_DATABASE[code]) {
          foundAirports.push(AIRPORT_DATABASE[code]);
          seenCodes.add(code);
        }
      }
    }
    
    return foundAirports;
  }

  /**
   * Extract date and time information
   */
  private extractDateTime(context: string, fullText: string): {
    departureDate: Date | null;
    arrivalDate: Date | null;
    departureTime: string | null;
    arrivalTime: string | null;
  } {
    // Common date patterns
    const datePatterns = [
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/gi,
      /(\d{4})-(\d{2})-(\d{2})/g,
      /(\d{2})\/(\d{2})\/(\d{4})/g,
      /(\d{2})\.(\d{2})\.(\d{4})/g,
      // Additional date patterns
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/gi,
      /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/gi,
      // Korean date format: 2025년 5월 22일
      /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/g,
      // Short year format: 22 May 25
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{2})/gi,
      // Day of week included: Thu, 22 May 2025
      /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[,\s]+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/gi,
      // ISO format with time: 2025-05-22T10:30:00
      /(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}/g,
    ];

    // Time patterns
    const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)?/gi;

    let departureDate: Date | null = null;
    let arrivalDate: Date | null = null;
    let departureTime: string | null = null;
    let arrivalTime: string | null = null;

    // Extract dates
    for (const pattern of datePatterns) {
      const matches = Array.from(context.matchAll(pattern));
      if (matches.length > 0) {
        try {
          const firstMatch = matches[0];
          if (pattern.source.includes('Jan|Feb')) {
            // Month name format
            const day = parseInt(firstMatch[1]);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = monthNames.indexOf(firstMatch[2]);
            const year = parseInt(firstMatch[3]);
            departureDate = new Date(year, month, day);
          } else if (pattern.source.includes('(\\d{4})-(\\d{2})-(\\d{2})')) {
            // ISO format
            departureDate = new Date(firstMatch[0]);
          } else {
            // Other formats - assume MM/DD/YYYY or DD.MM.YYYY
            const part1 = parseInt(firstMatch[1]);
            const part2 = parseInt(firstMatch[2]);
            const year = parseInt(firstMatch[3]);
            departureDate = new Date(year, part2 - 1, part1); // Assume DD/MM format
          }
          
          // If we found multiple dates, second might be arrival
          if (matches.length > 1) {
            const secondMatch = matches[1];
            // Similar parsing for arrival date
            if (pattern.source.includes('Jan|Feb')) {
              const day = parseInt(secondMatch[1]);
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const month = monthNames.indexOf(secondMatch[2]);
              const year = parseInt(secondMatch[3]);
              arrivalDate = new Date(year, month, day);
            }
          }
          break;
        } catch (error) {
          // Continue to next pattern
        }
      }
    }

    // Extract times
    const timeMatches = Array.from(context.matchAll(timePattern));
    if (timeMatches.length > 0) {
      departureTime = timeMatches[0][0];
      if (timeMatches.length > 1) {
        arrivalTime = timeMatches[1][0];
      }
    }

    return {
      departureDate,
      arrivalDate,
      departureTime,
      arrivalTime,
    };
  }

  /**
   * Extract booking reference
   */
  private extractBookingReference(text: string): string | null {
    const patterns = [
      /(?:booking|confirmation|reference|code|pnr)[\s:]+([A-Z0-9]{6,8})/gi,
      /\b([A-Z]{2}[A-Z0-9]{4,6})\b/g, // Common booking ref pattern
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Extract passenger name
   */
  private extractPassengerName(text: string): string | null {
    const patterns = [
      /passenger[\s:]+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
      /name[\s:]+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Extract seat number
   */
  private extractSeatNumber(text: string): string | null {
    const seatPattern = /seat[\s:]+(\d{1,2}[A-F])/gi;
    const match = seatPattern.exec(text);
    return match ? match[1] : null;
  }

  /**
   * Broader pattern matching for cases where structured parsing fails
   */
  private extractBroadFlightPatterns(text: string, emailId: string): FlightInfo[] {
    const flights: FlightInfo[] = [];
    
    // Look for any three-letter airport codes
    const airportCodes = Array.from(new Set(
      Array.from(text.matchAll(/\b([A-Z]{3})\b/g))
        .map(match => match[1])
        .filter(code => AIRPORT_DATABASE[code])
    ));

    // If we have at least 2 airports, try to create a basic flight
    if (airportCodes.length >= 2) {
      // Try to find any date
      const dateMatch = text.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i);
      let flightDate = new Date();
      
      if (dateMatch) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames.findIndex(m => m.toLowerCase() === dateMatch[2].toLowerCase());
        if (month !== -1) {
          flightDate = new Date(parseInt(dateMatch[3]), month, parseInt(dateMatch[1]));
        }
      }

      flights.push({
        flightNumber: 'UNKNOWN',
        airline: 'Unknown Airline',
        departureAirport: AIRPORT_DATABASE[airportCodes[0]],
        arrivalAirport: AIRPORT_DATABASE[airportCodes[1]],
        departureDate: flightDate,
        arrivalDate: flightDate,
        departureTime: 'Unknown',
        arrivalTime: 'Unknown',
        bookingReference: null,
        passengerName: null,
        seatNumber: null,
        emailId,
        confidence: 0.3, // Low confidence for broad patterns
      });
    }

    return flights;
  }
}

/**
 * Create flight parser instance
 */
export function createFlightParser(): FlightParser {
  return new FlightParser();
}
export interface GmailMessage {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  historyId: string
  internalDate: string
  payload: GmailPayload
  sizeEstimate: number
}

export interface GmailPayload {
  partId?: string
  mimeType: string
  filename?: string
  headers: GmailHeader[]
  body: GmailBody
  parts?: GmailPayload[]
}

export interface GmailHeader {
  name: string
  value: string
}

export interface GmailBody {
  attachmentId?: string
  size: number
  data?: string
}

export interface ParsedEmail {
  id: string
  subject: string
  from: string
  to: string
  date: string
  body: string
  snippet: string
}

export interface ExtractedTravelInfo {
  emailId: string
  subject: string
  from: string
  departureDate?: string
  returnDate?: string
  destination?: string
  departure?: string
  flightNumber?: string
  bookingReference?: string
  hotelName?: string
  passengerName?: string
  confidence: number
  extractedData: {
    dates: string[]
    airports: string[]
    flights: string[]
    bookingCodes: string[]
  }
}

export interface GmailSearchOptions {
  query: string
  maxResults?: number
  pageToken?: string
  includeSpamTrash?: boolean
}

export interface GmailConnectionStatus {
  connected: boolean
  hasPermission: boolean
  email?: string
  lastChecked: string
}

export interface TravelEmailPattern {
  name: string
  senderPatterns: RegExp[]
  subjectPatterns: RegExp[]
  bodyPatterns: RegExp[]
  weight: number
}

// Gmail API 에러 타입
export interface GmailError {
  code: number
  message: string
  status: string
}

// 여행 정보 매칭을 위한 설정
export interface EmailParsingConfig {
  dateFormats: string[]
  airportCodePattern: RegExp
  flightNumberPattern: RegExp
  bookingReferencePattern: RegExp
  confidenceThreshold: number
  trustedSenders: string[]
}